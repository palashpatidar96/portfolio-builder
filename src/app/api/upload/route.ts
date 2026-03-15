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

function parseJsonSafe(raw: string): ResumeData | null {
  try {
    // Strip markdown fences if present
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = fenceMatch ? fenceMatch[1].trim() : raw;
    try {
      return JSON.parse(jsonStr);
    } catch {
      const objectMatch = raw.match(/\{[\s\S]*\}/);
      if (!objectMatch) return null;
      return JSON.parse(objectMatch[0]);
    }
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File | null;
    const manualData = formData.get("data") as string | null;

    let resumeData: ResumeData = {} as ResumeData;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      let text = "";

      if (file.name.endsWith(".pdf")) {
        // Step 1: LlamaParse (best PDF extraction)
        const llamaKey = process.env.LLAMAPARSE_API_KEY || "";
        if (llamaKey) {
          try {
            const { extractTextWithLlamaParse } = await import("@/lib/llamaparse");
            text = await extractTextWithLlamaParse(buffer, file.name);
            console.log("LlamaParse OK, chars:", text.length);
          } catch (e) {
            console.warn("LlamaParse failed:", e);
            text = "";
          }
        }

        // Step 1b: pdf-parse fallback
        if (!text) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pdfParse = require("pdf-parse");
            const result = await pdfParse(buffer);
            text = result.text;
          } catch (e) {
            console.error("pdf-parse failed:", e);
            return NextResponse.json(
              { error: "Could not parse PDF. Please try uploading a .txt file instead." },
              { status: 400 }
            );
          }
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

      // Step 2: AI structured parsing — Groq → HuggingFace → local regex
      const groqKey = process.env.GROQ_API_KEY || "";
      const hfKey = process.env.HUGGINGFACE_API_KEY || "";
      let aiParsed = false;

      // Primary: Groq (llama-3.3-70b, 128k context)
      if (groqKey) {
        try {
          const { parseResumeWithGroq } = await import("@/lib/groq");
          const raw = await parseResumeWithGroq(text);
          const aiData = parseJsonSafe(raw);
          if (aiData && (aiData.full_name || aiData.email || aiData.experiences?.length)) {
            resumeData = {
              full_name: aiData.full_name || "Unknown",
              email: aiData.email || "",
              phone: aiData.phone,
              location: aiData.location,
              title: aiData.title || "",
              summary: aiData.summary || "",
              linkedin_url: aiData.linkedin_url,
              github_url: aiData.github_url,
              website_url: aiData.website_url,
              experiences: Array.isArray(aiData.experiences) ? aiData.experiences : [],
              education: Array.isArray(aiData.education) ? aiData.education : [],
              projects: Array.isArray(aiData.projects) ? aiData.projects : [],
              skills: Array.isArray(aiData.skills) ? aiData.skills : [],
            };
            aiParsed = true;
            console.log(`Groq parsed: ${resumeData.experiences.length} exp, ${resumeData.skills.length} skills, ${resumeData.projects.length} projects`);
          }
        } catch (e) {
          console.warn("Groq failed, trying HuggingFace:", e);
        }
      }

      // Fallback: HuggingFace (llama-3.1-8b)
      if (!aiParsed && hfKey && !hfKey.includes("your_")) {
        try {
          const { parseResumeWithAI } = await import("@/lib/huggingface");
          const raw = await parseResumeWithAI(text);
          const aiData = parseJsonSafe(raw);
          if (aiData && (aiData.full_name || aiData.email || aiData.experiences?.length)) {
            resumeData = {
              full_name: aiData.full_name || "Unknown",
              email: aiData.email || "",
              phone: aiData.phone,
              location: aiData.location,
              title: aiData.title || "",
              summary: aiData.summary || "",
              linkedin_url: aiData.linkedin_url,
              github_url: aiData.github_url,
              website_url: aiData.website_url,
              experiences: Array.isArray(aiData.experiences) ? aiData.experiences : [],
              education: Array.isArray(aiData.education) ? aiData.education : [],
              projects: Array.isArray(aiData.projects) ? aiData.projects : [],
              skills: Array.isArray(aiData.skills) ? aiData.skills : [],
            };
            aiParsed = true;
            console.log(`HuggingFace parsed: ${resumeData.experiences.length} exp, ${resumeData.skills.length} skills`);
          }
        } catch (e) {
          console.warn("HuggingFace failed:", e);
        }
      }

      // Last resort: local regex parser
      if (!aiParsed) {
        console.log("Using local regex parser as last resort");
        resumeData = parseResumeLocally(text);
      }

    } else if (manualData) {
      resumeData = JSON.parse(manualData);
    } else {
      return NextResponse.json(
        { error: "No resume file or data provided" },
        { status: 400 }
      );
    }

    // Step 3: Project generation if AI didn't extract any
    if (!resumeData.projects?.length && resumeData.experiences?.length) {
      const groqKey = process.env.GROQ_API_KEY || "";
      const hfKey = process.env.HUGGINGFACE_API_KEY || "";

      try {
        let raw = "";
        if (groqKey) {
          const { generateProjectsWithGroq } = await import("@/lib/groq");
          raw = await generateProjectsWithGroq(
            resumeData.experiences,
            resumeData.skills ?? [],
            resumeData.title || "professional"
          );
        } else if (hfKey && !hfKey.includes("your_")) {
          const { generateChatResponse } = await import("@/lib/huggingface");
          const expSummary = resumeData.experiences
            .map((e) => `• ${e.role} at ${e.company}: ${e.description}`)
            .join("\n");
          const skillNames = (resumeData.skills ?? []).map((s) => s.name).join(", ");
          raw = await generateChatResponse(
            "You are a professional portfolio writer. Output only valid JSON.",
            `Extract 3 portfolio highlights for a "${resumeData.title || "professional"}":\n${expSummary}\nSkills: ${skillNames}\nReturn ONLY: [{"name":"","description":"","tech_stack":[],"url":"","github_url":""}]`,
            ""
          );
        }

        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const inferred = JSON.parse(jsonMatch[0]);
          if (Array.isArray(inferred) && inferred.length > 0) {
            resumeData.projects = inferred.map((p, idx) => ({
              id: `inferred-${idx}`,
              user_id: "",
              name: p.name ?? "Untitled Project",
              description: p.description ?? "",
              tech_stack: Array.isArray(p.tech_stack) ? p.tech_stack : [],
              url: "",
              github_url: "",
            }));
          }
        }
      } catch (e) {
        console.log("Project generation skipped:", e);
      }

      // Rule-based last resort
      if (!resumeData.projects?.length) {
        resumeData.projects = resumeData.experiences.slice(0, 3).map((exp, idx) => ({
          id: `derived-${idx}`,
          user_id: "",
          name: `${exp.role} @ ${exp.company}`,
          description: exp.description,
          tech_stack: (resumeData.skills ?? []).slice(idx * 3, idx * 3 + 4).map((s) => s.name),
          url: "",
          github_url: "",
        }));
      }
    }

    // Step 4: Generate personalized tagline
    if (process.env.GROQ_API_KEY && !resumeData.tagline) {
      try {
        const { generateTaglineWithGroq } = await import("@/lib/groq");
        const topSkills = (resumeData.skills ?? []).slice(0, 6).map((s) => s.name);
        const topCompanies = (resumeData.experiences ?? []).slice(0, 3).map((e) => e.company);
        resumeData.tagline = await generateTaglineWithGroq(
          resumeData.full_name,
          resumeData.title,
          resumeData.summary,
          topSkills,
          topCompanies
        );
        console.log("Generated tagline:", resumeData.tagline);
      } catch (e) {
        console.warn("Tagline generation skipped:", e);
      }
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
