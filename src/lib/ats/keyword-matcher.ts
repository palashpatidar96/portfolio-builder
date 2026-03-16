/**
 * Three-layer keyword matching engine — v2
 * Layer 1: Smart exact match  (normalised + token-level for multi-word keywords)
 * Layer 2: Fuzzy match        (edit-distance + Porter stemming + acronym expansion)
 * Layer 3: Semantic match     (HuggingFace embeddings + cosine similarity)
 */

import type { KeywordMatch, ParsedResume } from "./types";

// ─── Stop words (excluded from token matching) ───────────────────────────────

const STOP_WORDS = new Set([
  "and","or","the","a","an","in","of","for","to","with","on","at","by","as",
  "is","are","was","were","be","been","being","have","has","had","do","does",
  "did","will","would","could","should","may","might","shall","can","need",
  "into","from","that","this","these","those","it","its","use","using",
  "strong","good","excellent","solid","proven","ability","skills","skill",
  "tools","tool","knowledge","experience","understanding","familiarity",
  "proficiency","proficient","familiar","deep","hands","on",
]);

// Common ATS keyword synonyms / normalisation map
const SYNONYMS: Record<string, string[]> = {
  "javascript":    ["js", "javascript"],
  "typescript":    ["ts", "typescript"],
  "kubernetes":    ["k8s", "kubernetes"],
  "postgresql":    ["postgres", "postgresql", "psql"],
  "mongodb":       ["mongo", "mongodb"],
  "elasticsearch": ["elastic", "elasticsearch"],
  "ci/cd":         ["cicd", "ci/cd", "ci cd", "continuous integration", "continuous deployment", "continuous delivery"],
  "aws":           ["amazon web services", "aws"],
  "gcp":           ["google cloud", "gcp", "google cloud platform"],
  "azure":         ["microsoft azure", "azure"],
  "ml":            ["machine learning", "ml"],
  "ai":            ["artificial intelligence", "ai"],
  "api":           ["api", "apis", "rest api", "rest apis", "restful"],
  "rest":          ["rest", "restful", "rest api"],
  "graphql":       ["graphql", "graph ql"],
  "node":          ["node.js", "nodejs", "node js", "node"],
  "react":         ["react.js", "reactjs", "react js", "react"],
  "next":          ["next.js", "nextjs", "next"],
  "docker":        ["docker", "containerization", "containers", "container"],
  "agile":         ["agile", "scrum", "agile/scrum", "agile scrum"],
  "scrum":         ["scrum", "agile", "agile/scrum"],
};

// ─── Text normalisation ───────────────────────────────────────────────────────

/** Converts text to a flat, punctuation-free lowercase string */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[./\\()\[\]{}|:;,!?'"]/g, " ")   // remove punctuation → spaces
    .replace(/-/g, " ")                           // hyphens → spaces
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract significant tokens (drop short words + stop words) */
function significantTokens(text: string): string[] {
  return normalizeText(text)
    .split(" ")
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

// ─── Simple Porter-like stemmer ──────────────────────────────────────────────

function stem(word: string): string {
  word = word.toLowerCase();
  const rules: [RegExp, string][] = [
    [/ational$/, "ate"],
    [/tional$/, "tion"],
    [/enci$/, "ence"],
    [/anci$/, "ance"],
    [/izer$/, "ize"],
    [/ising$/, "ise"],
    [/izing$/, "ize"],
    [/isation$/, "ise"],
    [/ization$/, "ize"],
    [/ing$/, ""],
    [/tion$/, "te"],
    [/sion$/, "se"],
    [/ment$/, ""],
    [/ness$/, ""],
    [/ity$/, ""],
    [/ies$/, "y"],
    [/eed$/, "ee"],
    [/ed$/, ""],
    [/ers?$/, ""],
    [/ly$/, ""],
    [/al$/, ""],
    [/s$/, ""],
  ];
  for (const [pattern, replacement] of rules) {
    if (word.length > 5 && pattern.test(word)) {
      return word.replace(pattern, replacement);
    }
  }
  return word;
}

// ─── Edit distance ratio (0–1) ────────────────────────────────────────────────

function similarityRatio(a: string, b: string): number {
  const la = a.length, lb = b.length;
  if (la === 0 && lb === 0) return 1;
  if (la === 0 || lb === 0) return 0;
  const dp = Array.from({ length: la + 1 }, (_, i) =>
    Array.from({ length: lb + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return 1 - dp[la][lb] / Math.max(la, lb);
}

// ─── Layer 1: Smart exact match ───────────────────────────────────────────────

export function exactMatch(keyword: string, resumeText: string): boolean {
  const kw   = keyword.toLowerCase();
  const text = resumeText.toLowerCase();
  const normKw   = normalizeText(kw);
  const normText = normalizeText(text);

  // 1a. Direct substring (original text)
  if (text.includes(kw)) return true;

  // 1b. Normalised substring ("Node.js" → "node js" found in text)
  if (normText.includes(normKw)) return true;

  // 1c. Synonym check — look up canonical form
  for (const [, variants] of Object.entries(SYNONYMS)) {
    if (variants.includes(normKw) || variants.includes(kw)) {
      if (variants.some((v) => text.includes(v) || normText.includes(normalizeText(v)))) {
        return true;
      }
    }
  }

  // 1d. Multi-word keyword: split on " and ", " or ", "/" and check each part
  const compound = kw.split(/\s+(?:and|or)\s+|\//).map((p) => p.trim()).filter(Boolean);
  if (compound.length > 1) {
    if (compound.some((p) => text.includes(p) || normText.includes(normalizeText(p)))) {
      return true;
    }
  }

  // 1e. Multi-word: ALL significant tokens present independently
  const tokens = significantTokens(keyword);
  if (tokens.length >= 2) {
    // Require ≥70% of tokens to be present (handles "CI/CD pipelines" → "ci" "cd" "pipelines")
    const presentCount = tokens.filter(
      (t) => normText.includes(t) || text.includes(t)
    ).length;
    if (presentCount / tokens.length >= 0.7) return true;
  }

  return false;
}

// ─── Token-level match (used for exact_only as a tier-1.5) ───────────────────

/**
 * For Taleo exact_only: real Taleo matches per-token, not full-phrase.
 * Returns true when the primary / most distinctive token of the keyword
 * is found in the resume.
 */
function primaryTokenMatch(keyword: string, resumeText: string): { found: boolean; token: string } {
  const normText = normalizeText(resumeText);
  const tokens = significantTokens(keyword);

  if (tokens.length === 0) return { found: false, token: "" };

  // Sort tokens by length descending (longer = more specific)
  const sorted = [...tokens].sort((a, b) => b.length - a.length);

  for (const token of sorted) {
    if (normText.includes(token)) return { found: true, token };
    // Also try stem
    const s = stem(token);
    if (s.length > 3 && normText.includes(s)) return { found: true, token };
  }
  return { found: false, token: "" };
}

// ─── Layer 2: Fuzzy + stemming ───────────────────────────────────────────────

export function fuzzyMatch(
  keyword: string,
  resumeText: string,
  threshold = 0.75
): { found: boolean; matchedTo: string } {
  const normText  = normalizeText(resumeText);
  const kwNorm    = normalizeText(keyword);
  const kwStem    = stem(kwNorm.replace(/\s+/g, ""));

  // 2a. Normalised exact (e.g. "Typescript" → found in normalised text)
  if (normText.includes(kwNorm)) return { found: true, matchedTo: keyword };

  // 2b. Multi-word: all significant tokens (stemmed) present
  const kwTokens = significantTokens(keyword);
  if (kwTokens.length >= 2) {
    const allStemmed = kwTokens.every(
      (t) => normText.includes(t) || normText.includes(stem(t))
    );
    if (allStemmed) return { found: true, matchedTo: keyword };

    // 2c. Majority of tokens match (lenient for compound phrases)
    const matchedCount = kwTokens.filter(
      (t) => normText.includes(t) || normText.includes(stem(t))
    ).length;
    if (matchedCount / kwTokens.length >= 0.6) {
      return { found: true, matchedTo: kwTokens.filter((t) => normText.includes(t))[0] };
    }
  }

  // 2d. Stemmed single-word match
  const words = normText.split(" ").filter(Boolean);
  for (const word of words) {
    if (stem(word) === kwStem && kwStem.length > 3) {
      return { found: true, matchedTo: word };
    }
  }

  // 2e. Edit-distance ratio on individual words
  let bestRatio = 0;
  let bestWord  = "";
  for (const word of words) {
    const r = similarityRatio(kwNorm, word);
    if (r > bestRatio) { bestRatio = r; bestWord = word; }
  }
  if (bestRatio >= threshold) return { found: true, matchedTo: bestWord };

  return { found: false, matchedTo: "" };
}

// ─── Layer 3: Semantic via HuggingFace embeddings ────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return normA === 0 || normB === 0 ? 0 : dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const hfKey = process.env.HUGGINGFACE_API_KEY || "";
  if (!hfKey) return [];
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${hfKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: texts, options: { wait_for_model: true } }),
        signal: AbortSignal.timeout(20_000),
      }
    );
    if (!response.ok) return [];
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      if (typeof data[0][0] === "number") return data as number[][];
      if (Array.isArray(data[0]) && Array.isArray(data[0][0]))
        return data.map((d: number[][]) => d[0]);
    }
    return [];
  } catch { return []; }
}

export async function semanticMatch(
  keyword: string,
  bullets: string[],
  threshold = 0.38
): Promise<{ found: boolean; matchedTo: string; confidence: number }> {
  if (bullets.length === 0) return { found: false, matchedTo: "", confidence: 0 };
  const texts      = [keyword, ...bullets];
  const embeddings = await getEmbeddings(texts);
  if (embeddings.length < 2) return { found: false, matchedTo: "", confidence: 0 };
  const kwEmb = embeddings[0];
  let bestScore = 0, bestBullet = "";
  for (let i = 1; i < embeddings.length; i++) {
    const score = cosineSimilarity(kwEmb, embeddings[i]);
    if (score > bestScore) { bestScore = score; bestBullet = bullets[i - 1]; }
  }
  return { found: bestScore >= threshold, matchedTo: bestBullet, confidence: bestScore };
}

// ─── Resume text utilities ────────────────────────────────────────────────────

export function flattenResumeText(resume: ParsedResume): string {
  const parts: string[] = [];
  if (resume.summary) parts.push(resume.summary);
  parts.push(...(resume.skills ?? []));
  for (const exp of (resume.experience ?? [])) {
    parts.push(exp.job_title, exp.company);
    parts.push(...(exp.bullets ?? []));
    parts.push(...(exp.technologies ?? []));
  }
  for (const proj of (resume.projects ?? [])) {
    parts.push(proj.title, proj.description);
    parts.push(...(proj.tech_stack ?? []));
    parts.push(...(proj.highlights ?? []));
  }
  for (const edu of (resume.education ?? [])) {
    parts.push(edu.degree, edu.institution);
    parts.push(...(edu.relevant_coursework ?? []));
  }
  for (const cert of (resume.certifications ?? [])) parts.push(cert.name, cert.issuer);
  parts.push(...(resume.achievements ?? []));
  return parts.join(" ");
}

export function getAllBullets(resume: ParsedResume): string[] {
  const bullets: string[] = [];
  for (const exp of (resume.experience ?? [])) bullets.push(...(exp.bullets ?? []));
  for (const proj of (resume.projects ?? [])) bullets.push(proj.description, ...(proj.highlights ?? []));
  if (resume.summary) bullets.push(resume.summary);
  // Also include skills as short strings (useful for semantic matching)
  bullets.push(...(resume.skills ?? []).slice(0, 20));
  return bullets.filter(Boolean);
}

// ─── Main keyword matching ────────────────────────────────────────────────────

export async function matchKeyword(
  keyword: string,
  resume: ParsedResume,
  strategy:
    | "exact_only"
    | "exact_plus_ai"
    | "semantic_ml"
    | "semantic_llm"
    | "stemming"
    | "taxonomy_normalization"
): Promise<KeywordMatch> {
  const resumeText = flattenResumeText(resume);

  // ── Layer 1: Smart exact (all strategies) ─────────────────────────────────
  if (exactMatch(keyword, resumeText)) {
    return { keyword, match_type: "exact", confidence: 1.0, matched_to: keyword };
  }

  // ── Layer 1.5: Primary-token match for exact_only (Taleo) ─────────────────
  // Real Taleo matches per individual keyword token, not full phrases.
  if (strategy === "exact_only") {
    const { found, token } = primaryTokenMatch(keyword, resumeText);
    if (found) {
      return { keyword, match_type: "fuzzy", confidence: 0.88, matched_to: token };
    }
    // Synonym check for exact_only
    const normKw = normalizeText(keyword);
    for (const [canonical, variants] of Object.entries(SYNONYMS)) {
      if (variants.includes(normKw) || variants.includes(keyword.toLowerCase())) {
        const resumeNorm = normalizeText(resumeText);
        if (variants.some((v) => resumeNorm.includes(v) || resumeNorm.includes(canonical))) {
          return { keyword, match_type: "fuzzy", confidence: 0.82, matched_to: canonical };
        }
      }
    }
    return { keyword, match_type: "missing", confidence: 0.0 };
  }

  // ── Layer 2: Fuzzy + stemming (all other strategies) ──────────────────────
  const { found: fuzzyFound, matchedTo } = fuzzyMatch(keyword, resumeText);
  if (fuzzyFound) {
    return { keyword, match_type: "fuzzy", confidence: 0.8, matched_to: matchedTo };
  }

  // ── Layer 3: Semantic (AI-enabled strategies only) ─────────────────────────
  if (
    strategy === "semantic_ml" ||
    strategy === "semantic_llm" ||
    strategy === "taxonomy_normalization" ||
    strategy === "exact_plus_ai"
  ) {
    const bullets = getAllBullets(resume);
    const { found, matchedTo: semMatched, confidence } = await semanticMatch(keyword, bullets);
    if (found) {
      return { keyword, match_type: "semantic", confidence, matched_to: semMatched };
    }
  }

  return { keyword, match_type: "missing", confidence: 0.0 };
}
