import { NextRequest, NextResponse } from "next/server";
import { parseResumeLocally } from "@/lib/resume-parser";
import { saveProfile } from "@/lib/local-store";
import type { ResumeData } from "@/types/portfolio";

function generateUsername(fullName: string): string {
  return (
    fullName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 30) +
    "-" +
    Math.random().toString(36).slice(2, 6)
  );
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File | null;
    const manualData = formData.get("data") as string | null;

    let resumeData: ResumeData;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      let text: string;

      if (file.name.endsWith(".pdf")) {
        try {
          // pdf-parse v1 — externalized via next.config serverExternalPackages
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const pdfParse = require("pdf-parse");
          const result = await pdfParse(buffer);
          text = result.text;
        } catch (e) {
          console.error("PDF parse error:", e);
          return NextResponse.json(
            { error: "Could not parse PDF. Please try uploading a .txt file instead." },
            { status: 400 }
          );
        }
      } else {
        text = buffer.toString("utf-8");
      }

      if (!text || text.trim().length < 20) {
        return NextResponse.json(
          { error: "Could not extract text from the file. Please try a different format." },
          { status: 400 }
        );
      }

      // Always run local parser as baseline
      const localData = parseResumeLocally(text);

      // Try HuggingFace AI parsing, then merge with local results
      const hfKey = process.env.HUGGINGFACE_API_KEY || "";
      if (hfKey && !hfKey.includes("your_")) {
        try {
          const { parseResumeWithAI } = await import("@/lib/huggingface");
          const parsedJson = await parseResumeWithAI(text);

          let jsonStr = parsedJson;
          const jsonMatch = parsedJson.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (jsonMatch) jsonStr = jsonMatch[1].trim();

          let aiData: ResumeData;
          try {
            aiData = JSON.parse(jsonStr);
          } catch {
            const objectMatch = parsedJson.match(/\{[\s\S]*\}/);
            if (objectMatch) {
              aiData = JSON.parse(objectMatch[0]);
            } else {
              throw new Error("AI parse failed");
            }
          }

          // Merge: use AI for structured fields, but fall back to local parser
          // for fields the AI returned poorly (e.g. skills as categories)
          resumeData = {
            full_name: aiData.full_name || localData.full_name,
            email: aiData.email || localData.email,
            phone: aiData.phone || localData.phone,
            location: aiData.location || localData.location,
            title: aiData.title || localData.title,
            summary: aiData.summary || localData.summary,
            linkedin_url: aiData.linkedin_url || localData.linkedin_url,
            github_url: aiData.github_url || localData.github_url,
            website_url: aiData.website_url || localData.website_url,
            experiences: (aiData.experiences?.length || 0) > 0 ? aiData.experiences : localData.experiences,
            education: (aiData.education?.length || 0) > 0 ? aiData.education : localData.education,
            projects: (aiData.projects?.length || 0) > 0 ? aiData.projects : localData.projects,
            // Use local parser skills if AI returned too few (likely categories not items)
            skills: (aiData.skills?.length || 0) >= 8 ? aiData.skills : localData.skills,
          };
        } catch (e) {
          console.log("HuggingFace unavailable, using local parser:", e);
          resumeData = localData;
        }
      } else {
        resumeData = localData;
      }
    } else if (manualData) {
      resumeData = JSON.parse(manualData);
    } else {
      return NextResponse.json(
        { error: "No resume file or data provided" },
        { status: 400 }
      );
    }

    const username = generateUsername(resumeData.full_name || "user");
    const profile = await saveProfile(username, resumeData);

    return NextResponse.json({
      success: true,
      username: profile.username,
      profileUrl: `/portfolio/${profile.username}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
