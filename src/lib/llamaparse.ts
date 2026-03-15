/**
 * LlamaParse — AI-powered PDF text extraction
 * Free tier: 1,000 pages/day, no credit card required
 * Sign up at: https://cloud.llamaindex.ai
 *
 * Flow:
 * 1. Upload PDF → get job ID
 * 2. Poll job status until complete
 * 3. Fetch markdown result (clean, structured text)
 */

const BASE_URL = "https://api.cloud.llamaindex.ai/api/v1/parsing";

export async function extractTextWithLlamaParse(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const apiKey = process.env.LLAMAPARSE_API_KEY;
  if (!apiKey) throw new Error("LLAMAPARSE_API_KEY not set");

  // Step 1: Upload the file
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(buffer)], { type: "application/pdf" });
  formData.append("file", blob, fileName);
  formData.append("language", "en");
  formData.append("parsing_instruction",
    "This is a professional resume/CV. Extract all content accurately including: " +
    "name, contact info, work experience (company, role, dates, responsibilities), " +
    "education, skills, projects, certifications. Preserve section headings and bullet points."
  );

  const uploadRes = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`LlamaParse upload failed (${uploadRes.status}): ${err}`);
  }

  const { id: jobId } = await uploadRes.json() as { id: string };

  // Step 2: Poll for completion (max 30s)
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const statusRes = await fetch(`${BASE_URL}/job/${jobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!statusRes.ok) continue;

    const { status } = await statusRes.json() as { status: string };

    if (status === "SUCCESS") {
      // Step 3: Fetch markdown result
      const resultRes = await fetch(`${BASE_URL}/job/${jobId}/result/markdown`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!resultRes.ok) throw new Error("Failed to fetch LlamaParse result");

      const { markdown } = await resultRes.json() as { markdown: string };
      return markdown;
    }

    if (status === "ERROR" || status === "CANCELLED") {
      throw new Error(`LlamaParse job failed with status: ${status}`);
    }
    // else still PENDING — keep polling
  }

  throw new Error("LlamaParse timed out after 30 seconds");
}
