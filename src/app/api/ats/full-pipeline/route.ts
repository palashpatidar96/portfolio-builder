import { NextRequest, NextResponse } from "next/server";
import { parseResumeWithLLM, extractKeywordsWithLLM, buildOptimizedResume } from "@/lib/ats/llm-provider";
import { scoreAllPlatforms, arrangeForATS, ATS_PROFILES } from "@/lib/ats/scoring-engine";
import { extractTextWithLlamaParse } from "@/lib/llamaparse";
import type { ATSPlatform, ParsedResume, JDKeywords, OptimizedResume } from "@/lib/ats/types";

export const maxDuration = 300; // 5 minutes for full pipeline

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File | null;
    const jobDescription = formData.get("jobDescription") as string | null;
    const apiKey = (formData.get("apiKey") as string | null) ?? undefined;
    const targetPlatform = (formData.get("targetPlatform") as ATSPlatform | null) ?? "workday";

    if (!jobDescription?.trim()) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }

    // ── Step 1: Parse resume to text ──────────────────────────────────────────
    let resumeText = "";

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());

      // Try LlamaParse first (best quality)
      if (process.env.LLAMAPARSE_API_KEY) {
        try {
          resumeText = await extractTextWithLlamaParse(buffer, file.name);
        } catch (e) {
          console.warn("LlamaParse failed, falling back:", (e as Error).message);
        }
      }

      // Fallback: pdf-parse
      if (!resumeText && file.name.endsWith(".pdf")) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const pdfParse = require("pdf-parse");
          const result = await pdfParse(buffer);
          resumeText = result.text;
        } catch (e) {
          console.error("pdf-parse failed:", e);
        }
      }

      // DOCX/TXT fallback
      if (!resumeText) {
        resumeText = buffer.toString("utf-8");
      }
    } else {
      // Accept raw resume text directly
      resumeText = (formData.get("resumeText") as string | null) ?? "";
    }

    if (!resumeText.trim()) {
      return NextResponse.json({ error: "Could not extract text from resume" }, { status: 400 });
    }

    // ── Step 2: Structure resume via LLM ─────────────────────────────────────
    const rawResume = await parseResumeWithLLM(resumeText, apiKey);
    const parsedResume = rawResume as unknown as ParsedResume;

    // ── Step 3: Extract JD keywords via LLM ──────────────────────────────────
    const rawKeywords = await extractKeywordsWithLLM(jobDescription, apiKey);
    const jdKeywords = rawKeywords as unknown as JDKeywords;

    // ── Step 4: Score against 6 ATS platforms ────────────────────────────────
    const matchReport = await scoreAllPlatforms(parsedResume, jdKeywords);

    // ── Step 5: Optimize resume (3-layer strategy) ────────────────────────────
    // Collect ALL unique missing keywords across every platform — not just top 10
    const allMissingKeywords = Array.from(new Set(
      matchReport.platform_scores.flatMap((ps) => ps.missing_keywords)
    ));

    const platformProfile = ATS_PROFILES[targetPlatform];
    const { resume: optimizedBase, optimization_notes } = await buildOptimizedResume(
      parsedResume,
      jdKeywords,
      allMissingKeywords,
      targetPlatform,
      platformProfile.quirks,
      apiKey
    );

    const optimizedResume: OptimizedResume = {
      ...optimizedBase,
      optimization_notes,
      target_platform: targetPlatform,
    };

    // ── Step 6: Arrange for target ATS ───────────────────────────────────────
    const arrangedResume = arrangeForATS(optimizedResume, jdKeywords, targetPlatform);
    const finalResume: OptimizedResume = {
      ...arrangedResume,
      optimization_notes: optimizedResume.optimization_notes,
      target_platform: targetPlatform,
    };

    // ── Step 7: Re-score optimized resume ────────────────────────────────────
    const optimizedReport = await scoreAllPlatforms(finalResume, jdKeywords);

    return NextResponse.json({
      success: true,
      parsedResume,
      jdKeywords,
      matchReport,
      optimizedResume: finalResume,
      optimizedReport,
    });
  } catch (error) {
    console.error("ATS pipeline error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Pipeline failed" },
      { status: 500 }
    );
  }
}
