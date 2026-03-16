import { NextRequest, NextResponse } from "next/server";
import { generateDocx, generatePdf } from "@/lib/ats/document-generator";
import type { OptimizedResume } from "@/lib/ats/types";

export async function POST(request: NextRequest) {
  try {
    const { resume, format } = await request.json() as {
      resume: OptimizedResume;
      format: "docx" | "pdf";
    };

    if (!resume) {
      return NextResponse.json({ error: "Resume data required" }, { status: 400 });
    }

    const candidateName = (resume.contact?.name ?? "resume")
      .toLowerCase()
      .replace(/\s+/g, "_");

    if (format === "pdf") {
      const buffer = await generatePdf(resume);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${candidateName}_ats_resume.pdf"`,
        },
      });
    }

    // Default: DOCX
    const buffer = await generateDocx(resume);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${candidateName}_ats_resume.docx"`,
      },
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
