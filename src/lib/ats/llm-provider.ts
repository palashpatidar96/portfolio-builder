/**
 * LLM Provider abstraction — supports Groq (primary) and Gemini (fallback)
 * Both use OpenAI-compatible chat completions API
 */

import type { ParsedResume, JDKeywords } from "./types";

const PROVIDERS = {
  groq: {
    base_url: "https://api.groq.com/openai/v1/chat/completions",
    default_model: "llama-3.3-70b-versatile",
  },
  gemini: {
    base_url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    default_model: "gemini-2.0-flash",
  },
};

async function llmChat(
  baseUrl: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  jsonMode = true,
  maxTokens = 4096
): Promise<string> {
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.1,
    max_tokens: maxTokens,
  };
  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90_000),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`LLM API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

function parseJsonSafe<T>(raw: string): T | null {
  try {
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = fenceMatch ? fenceMatch[1].trim() : raw;
    try {
      return JSON.parse(jsonStr) as T;
    } catch {
      const objMatch = raw.match(/\{[\s\S]*\}/);
      if (objMatch) return JSON.parse(objMatch[0]) as T;
      return null;
    }
  } catch {
    return null;
  }
}

/**
 * Call an LLM with automatic Groq → Gemini fallback.
 * userApiKey: optional key provided by the end-user via UI (preferred).
 * Falls back to server env vars.
 */
export async function callLLM<T>(
  systemPrompt: string,
  userPrompt: string,
  userApiKey?: string,
  maxTokens = 4096
): Promise<T> {
  const groqKey = userApiKey || process.env.GROQ_API_KEY || "";
  const geminiKey = process.env.GEMINI_API_KEY || "";

  // Try Groq first
  if (groqKey) {
    try {
      const raw = await llmChat(
        PROVIDERS.groq.base_url,
        groqKey,
        PROVIDERS.groq.default_model,
        systemPrompt,
        userPrompt,
        true,
        maxTokens
      );
      const parsed = parseJsonSafe<T>(raw);
      if (parsed) return parsed;
      throw new Error("Groq returned unparseable JSON");
    } catch (e) {
      console.warn("Groq failed, trying Gemini:", (e as Error).message);
    }
  }

  // Fallback: Gemini
  if (geminiKey) {
    try {
      const raw = await llmChat(
        PROVIDERS.gemini.base_url,
        geminiKey,
        PROVIDERS.gemini.default_model,
        systemPrompt,
        userPrompt,
        true,
        maxTokens
      );
      const parsed = parseJsonSafe<T>(raw);
      if (parsed) return parsed;
      throw new Error("Gemini returned unparseable JSON");
    } catch (e) {
      throw new Error(`All LLM providers failed. Last error: ${(e as Error).message}`);
    }
  }

  throw new Error("No LLM API key available. Set GROQ_API_KEY or provide one via the UI.");
}

/** Parse a resume markdown into a structured ParsedResume object */
export async function parseResumeWithLLM(
  resumeMarkdown: string,
  userApiKey?: string
) {
  const systemPrompt = `You are an expert resume parser. Extract ALL information from the resume into JSON.
Return ONLY valid JSON with this schema (no markdown, no explanation):
{
  "contact": {"name":"","email":"","phone":"","linkedin":"","github":"","portfolio":"","location":""},
  "summary": "",
  "experience": [{"job_title":"","company":"","start_date":"","end_date":"","location":"","bullets":[],"technologies":[],"is_current":false}],
  "projects": [{"title":"","description":"","tech_stack":[],"highlights":[],"url":"","date":""}],
  "education": [{"degree":"","institution":"","year":"","gpa":"","relevant_coursework":[],"honors":[]}],
  "skills": [],
  "certifications": [{"name":"","issuer":"","date":"","credential_id":""}],
  "languages": [],
  "achievements": []
}
Rules:
- Extract EVERY bullet point verbatim into bullets[]
- Extract technologies from bullets into technologies[]
- skills[] = flat string array of ALL skills found anywhere in the resume
- Mark is_current=true if end_date is null/absent/present
- Return ONLY the JSON object`;

  return callLLM<Record<string, unknown>>(
    systemPrompt,
    `Parse this resume:\n\n${resumeMarkdown}`,
    userApiKey,
    6000
  );
}

/** Extract ATS keywords from a job description */
export async function extractKeywordsWithLLM(
  jobDescription: string,
  userApiKey?: string
) {
  const systemPrompt = `You are an expert ATS keyword analyst. Extract all keywords from the job description.
Return ONLY valid JSON with this schema:
{
  "job_title": "",
  "experience_level": "entry|mid|senior|lead|executive",
  "hard_skills": [{"keyword":"","category":"hard_skill","priority":"must_have|nice_to_have","frequency":1}],
  "soft_skills": [{"keyword":"","category":"soft_skill","priority":"must_have|nice_to_have","frequency":1}],
  "tools": [{"keyword":"","category":"tool","priority":"must_have|nice_to_have","frequency":1}],
  "certifications": [{"keyword":"","category":"certification","priority":"must_have|nice_to_have","frequency":1}],
  "action_verbs": [],
  "education_requirement": "",
  "years_experience": "",
  "industry_terms": [],
  "priority_keywords": []
}
Rules:
- must_have = mentioned in Requirements/Required sections
- nice_to_have = mentioned in Preferred/Nice-to-have sections
- frequency = count of occurrences in JD
- priority_keywords = top 10 most critical keywords ranked
- Extract implicit requirements too (e.g. "build scalable microservices" → microservices, Docker, Kubernetes)
- Return ONLY the JSON object`;

  return callLLM<Record<string, unknown>>(
    systemPrompt,
    `Extract ATS keywords:\n\n${jobDescription}`,
    userApiKey,
    4000
  );
}

// ─── Acronym expansion map for skills injection ──────────────────────────────
const ACRONYM_PAIRS: Record<string, string> = {
  "kubernetes": "Kubernetes (K8s)",
  "k8s": "Kubernetes (K8s)",
  "ci/cd": "CI/CD",
  "cicd": "CI/CD",
  "aws": "AWS",
  "gcp": "GCP",
  "ml": "Machine Learning (ML)",
  "ai": "AI",
  "graphql": "GraphQL",
  "postgresql": "PostgreSQL",
  "mongodb": "MongoDB",
  "elasticsearch": "Elasticsearch",
  "typescript": "TypeScript",
  "javascript": "JavaScript",
};

/**
 * Step A (no LLM): Inject ALL missing keywords directly into skills[].
 * Uses exact JD phrasing. Deduplicates against existing skills.
 * Also adds relevant keywords to project tech_stacks.
 * Projects' description and highlights are NEVER touched here.
 */
export function injectKeywordsIntoResume(
  resume: ParsedResume,
  allMissingKeywords: string[],
  jdKeywords: JDKeywords
): { resume: ParsedResume; injectedSkills: string[] } {
  const existingLower = new Set(resume.skills.map((s) => s.toLowerCase().trim()));
  const toAdd: string[] = [];

  // 1. Add all missing keywords from match report
  for (const kw of allMissingKeywords) {
    const normalized = ACRONYM_PAIRS[kw.toLowerCase()] ?? kw;
    if (!existingLower.has(kw.toLowerCase()) && !existingLower.has(normalized.toLowerCase())) {
      toAdd.push(normalized);
      existingLower.add(normalized.toLowerCase());
    }
  }

  // 2. Also sweep ALL hard_skills + tools from the JD — inject any that aren't present
  const allJDTerms = [
    ...jdKeywords.hard_skills,
    ...jdKeywords.tools,
    ...(jdKeywords.certifications ?? []),
  ].map((k) => k.keyword);

  for (const kw of allJDTerms) {
    const normalized = ACRONYM_PAIRS[kw.toLowerCase()] ?? kw;
    if (!existingLower.has(kw.toLowerCase()) && !existingLower.has(normalized.toLowerCase())) {
      toAdd.push(normalized);
      existingLower.add(normalized.toLowerCase());
    }
  }

  // 3. Add industry_terms that are missing
  for (const term of jdKeywords.industry_terms ?? []) {
    if (!existingLower.has(term.toLowerCase())) {
      toAdd.push(term);
      existingLower.add(term.toLowerCase());
    }
  }

  // 4. Update project tech_stacks with relevant JD keywords (description/highlights LOCKED)
  const updatedProjects = resume.projects.map((proj) => {
    const projTechLower = new Set(proj.tech_stack.map((t) => t.toLowerCase()));
    const projDescLower = (proj.description + " " + proj.highlights.join(" ")).toLowerCase();
    const techToAdd: string[] = [];
    for (const kw of allJDTerms) {
      const normalized = ACRONYM_PAIRS[kw.toLowerCase()] ?? kw;
      // Only add if the tech appears referenced anywhere in the project text
      if (!projTechLower.has(kw.toLowerCase()) && projDescLower.includes(kw.toLowerCase().split(" ")[0])) {
        techToAdd.push(normalized);
        projTechLower.add(kw.toLowerCase());
      }
    }
    return techToAdd.length > 0
      ? { ...proj, tech_stack: [...proj.tech_stack, ...techToAdd] }
      : proj;
  });

  return {
    resume: {
      ...resume,
      skills: [...resume.skills, ...toAdd],
      projects: updatedProjects,
    },
    injectedSkills: toAdd,
  };
}

/**
 * Step B (LLM call 1): Rewrite ONLY the summary.
 * Weaves in ALL priority_keywords naturally. Short, focused call.
 */
export async function rewriteSummaryWithLLM(
  originalSummary: string,
  priorityKeywords: string[],
  allMissingKeywords: string[],
  jdTitle: string,
  userApiKey?: string
): Promise<string> {
  // All priority keywords first, then any remaining missing ones not already in priority list
  // NO hardcoded limits — every keyword from the JD gets considered
  const prioritySet = new Set(priorityKeywords.map((k) => k.toLowerCase()));
  const remainingMissing = allMissingKeywords.filter((k) => !prioritySet.has(k.toLowerCase()));
  const allKeywordsToWeave = [...priorityKeywords, ...remainingMissing];

  const systemPrompt = `You are a professional resume writer. Rewrite the summary section ONLY.
STRICT RULES:
1. Keep the same professional voice and first-person perspective
2. Maximum 4-5 sentences (expand slightly if needed to cover all keywords naturally)
3. Naturally weave in as many of these keywords as possible without forcing: ${allKeywordsToWeave.join(", ")}
4. Priority order: cover the first keywords in the list before the later ones
5. DO NOT fabricate new companies, roles, or years of experience
6. Return ONLY valid JSON: { "summary": "..." }`;

  const userPrompt = `Job title being applied to: ${jdTitle}

Original summary:
${originalSummary}

ALL keywords to incorporate (in priority order): ${allKeywordsToWeave.join(", ")}`;

  const result = await callLLM<{ summary: string }>(
    systemPrompt,
    userPrompt,
    userApiKey,
    1200
  );
  return typeof result === "object" && result.summary ? result.summary : originalSummary;
}

/**
 * Step C (LLM call per experience entry): Minimal bullet edits.
 * Change budget: max 1 phrase per bullet. ALL metrics and scope locked.
 * Projects are NEVER passed here — only ExperienceEntry bullets.
 */
export async function rewriteExperienceBulletsWithLLM(
  jobTitle: string,
  company: string,
  originalBullets: string[],
  mustHaveKeywords: string[],
  voiceExamples: string[],
  userApiKey?: string
): Promise<{ bullets: string[]; notes: string[] }> {
  if (originalBullets.length === 0 || mustHaveKeywords.length === 0) {
    return { bullets: originalBullets, notes: [] };
  }

  const systemPrompt = `You are a surgical resume editor. Your job is to make the MINIMUM possible edits to bullets to include missing keywords.
STRICT CHANGE BUDGET:
- Return bullets in the EXACT SAME ORDER as given — bullet 1 stays bullet 1, bullet 2 stays bullet 2, etc. NEVER reorder
- You may change at most ONE short phrase per bullet (e.g. replace a generic noun with a specific tech term)
- You MUST preserve: every numeric metric, every % figure, every dollar amount, every company name, scope of work
- You MUST NOT: invent new responsibilities, add new tools not implied by context, change what the person did
- You MUST NOT touch bullets where the keyword cannot be added naturally — leave them 100% unchanged
- Start every bullet with a strong action verb (same or stronger than original)
- Return ONLY valid JSON: { "bullets": [...], "notes": ["what changed and why", ...] }

Voice calibration examples (match this person's writing style exactly):
${voiceExamples.map((b, i) => `${i + 1}. ${b}`).join("\n")}`;

  const userPrompt = `Role: ${jobTitle} at ${company}
Missing keywords to incorporate where natural: ${mustHaveKeywords.join(", ")}

Original bullets (edit minimally, return ALL bullets including unchanged ones):
${originalBullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}

Return JSON: { "bullets": ["bullet1", "bullet2", ...], "notes": ["change1", ...] }`;

  const result = await callLLM<{ bullets: string[]; notes: string[] }>(
    systemPrompt,
    userPrompt,
    userApiKey,
    1500
  );

  // Safety: wrong count → fall back to originals entirely
  if (!result?.bullets || result.bullets.length !== originalBullets.length) {
    return { bullets: originalBullets, notes: ["LLM returned mismatched bullet count — originals preserved"] };
  }

  // Safety: reject any bullet that is shorter than 40% of the original (likely hallucination/truncation)
  // and reject any bullet that doesn't share at least one significant word with the original
  const safeBullets = result.bullets.map((newB, i) => {
    const orig = originalBullets[i];
    const origWords = new Set(orig.toLowerCase().split(/\s+/).filter(w => w.length > 4));
    const newWords = newB.toLowerCase().split(/\s+/);
    const overlap = newWords.filter(w => origWords.has(w)).length;
    const tooShort = newB.length < orig.length * 0.4;
    const noOverlap = origWords.size > 0 && overlap === 0;
    if (tooShort || noOverlap) return orig; // revert to original if suspicious
    return newB;
  });

  return { bullets: safeBullets, notes: result.notes ?? [] };
}

/**
 * Master orchestrator — replaces the old single-shot optimizeResumeWithLLM.
 * Step A: Inject all missing keywords into skills (no LLM)
 * Step B: Rewrite summary with all priority + missing keywords
 * Step C: Per-experience-entry minimal bullet edit (must_have only)
 * Projects: 100% locked — description and highlights never touched
 */
export async function buildOptimizedResume(
  parsedResume: ParsedResume,
  jdKeywords: JDKeywords,
  allMissingKeywords: string[],
  targetPlatform: string,
  platformQuirks: string[],
  userApiKey?: string
): Promise<{ resume: ParsedResume; optimization_notes: string[] }> {
  const notes: string[] = [];

  // ── Step A: Skills + project tech_stack injection (no LLM) ─────────────────
  const { resume: resumeWithKeywords, injectedSkills } = injectKeywordsIntoResume(
    parsedResume,
    allMissingKeywords,
    jdKeywords
  );
  if (injectedSkills.length > 0) {
    notes.push(`Added ${injectedSkills.length} missing keywords to Skills section: ${injectedSkills.slice(0, 8).join(", ")}${injectedSkills.length > 8 ? ` +${injectedSkills.length - 8} more` : ""}`);
  }
  notes.push(`Target platform: ${targetPlatform} — ${platformQuirks[0] ?? ""}`);

  // ── Step B: Summary rewrite ─────────────────────────────────────────────────
  let newSummary = resumeWithKeywords.summary ?? "";
  if (newSummary) {
    try {
      newSummary = await rewriteSummaryWithLLM(
        newSummary,
        jdKeywords.priority_keywords ?? [],
        allMissingKeywords,
        jdKeywords.job_title,
        userApiKey
      );
      notes.push("Summary rewritten to include all priority keywords naturally");
    } catch {
      notes.push("Summary rewrite skipped (LLM error) — original preserved");
    }
  }

  // ── Step C: Per-experience-entry minimal bullet edit ────────────────────────
  // Pass ALL keywords — must_have first (higher priority), then nice_to_have
  // NO hardcoded limits — the LLM change budget constraint handles overreach
  const allBulletKeywords = [
    ...jdKeywords.hard_skills.filter((k) => k.priority === "must_have").map((k) => k.keyword),
    ...jdKeywords.tools.filter((k) => k.priority === "must_have").map((k) => k.keyword),
    ...jdKeywords.hard_skills.filter((k) => k.priority === "nice_to_have").map((k) => k.keyword),
    ...jdKeywords.tools.filter((k) => k.priority === "nice_to_have").map((k) => k.keyword),
    ...(jdKeywords.industry_terms ?? []),
  ];

  // Collect voice examples from all bullets for style calibration — no arbitrary limit
  const voiceExamples = resumeWithKeywords.experience
    .flatMap((e) => e.bullets)
    .filter((b) => b.length > 40);

  const updatedExperience = [...resumeWithKeywords.experience];
  for (let i = 0; i < updatedExperience.length; i++) {
    const entry = updatedExperience[i];
    if (!entry.bullets?.length || !allBulletKeywords.length) continue;
    try {
      const { bullets, notes: bulletNotes } = await rewriteExperienceBulletsWithLLM(
        entry.job_title,
        entry.company,
        entry.bullets,
        allBulletKeywords,
        voiceExamples,
        userApiKey
      );
      updatedExperience[i] = { ...entry, bullets };
      if (bulletNotes.length > 0) notes.push(...bulletNotes.slice(0, 2));
    } catch {
      notes.push(`Bullet rewrite for "${entry.job_title}" skipped — originals preserved`);
    }
  }

  return {
    resume: {
      ...resumeWithKeywords,
      summary: newSummary,
      experience: updatedExperience,
      // projects: untouched — never passed to LLM
    },
    optimization_notes: notes,
  };
}
