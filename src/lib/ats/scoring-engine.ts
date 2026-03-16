/**
 * ATS Scoring Engine — v2
 * Fixed: experience scoring, calibrated weights, keyword-density floor
 */

import type {
  ATSPlatform,
  ATSProfile,
  ContactInfo,
  DimensionScore,
  JDKeywords,
  KeywordMatch,
  MatchReport,
  ParsedResume,
  PlatformScore,
} from "./types";
import { matchKeyword } from "./keyword-matcher";

// ─── Platform Profiles ─────────────────────────────────────────────────────

export const ATS_PROFILES: Record<ATSPlatform, ATSProfile> = {
  workday: {
    name: "Workday",
    weights: { formatting: 0.22, keyword_match: 0.30, section_completeness: 0.18, experience_quality: 0.20, education_alignment: 0.10 },
    keyword_strategy: "exact_plus_ai",
    format_strictness: "strict",
    quirks: [
      "Skips headers/footers entirely",
      "Strict date format: MM/YYYY preferred",
      "Penalizes creative/multi-column formats",
      "Non-standard headings cause misclassification",
    ],
    preferred_format: "docx",
  },
  taleo: {
    name: "Taleo (Oracle)",
    // Reduced keyword_match weight (0.40→0.32) — compensated by formatting & experience
    weights: { formatting: 0.22, keyword_match: 0.32, section_completeness: 0.18, experience_quality: 0.18, education_alignment: 0.10 },
    keyword_strategy: "exact_only",
    format_strictness: "strict",
    quirks: [
      "Token-level exact keyword matching — mirror JD wording precisely",
      "Auto-rejects via Req Rank scoring",
      "Oldest system — prefers maximum simplicity",
      "Prefers .docx; multi-column layouts break parsing",
    ],
    preferred_format: "docx",
  },
  icims: {
    name: "iCIMS",
    weights: { formatting: 0.15, keyword_match: 0.25, section_completeness: 0.18, experience_quality: 0.28, education_alignment: 0.14 },
    keyword_strategy: "semantic_ml",
    format_strictness: "medium",
    quirks: [
      "ML-based semantic matching — most forgiving on synonyms",
      "Role Fit AI scores contextually",
      "Grammar-based NLP parser",
      "Understands related skills automatically",
    ],
    preferred_format: "pdf_or_docx",
  },
  greenhouse: {
    name: "Greenhouse",
    weights: { formatting: 0.10, keyword_match: 0.25, section_completeness: 0.25, experience_quality: 0.25, education_alignment: 0.15 },
    keyword_strategy: "semantic_llm",
    format_strictness: "lenient",
    quirks: [
      "No auto-scoring — human review with scorecards",
      "Parses text linearly — avoid text boxes",
      "Heavy weight on Skills section matching",
      "PDF is generally safe",
    ],
    preferred_format: "pdf",
  },
  lever: {
    name: "Lever",
    // Reduced keyword_match (0.30→0.27) — compensated by experience
    weights: { formatting: 0.15, keyword_match: 0.27, section_completeness: 0.20, experience_quality: 0.28, education_alignment: 0.10 },
    keyword_strategy: "stemming",
    format_strictness: "medium",
    quirks: [
      "No ranking system — search-dependent",
      "Stemming-based matching (manage = management)",
      "Blind to abbreviations — spell out all acronyms",
      "Good with action-verb-heavy bullets",
    ],
    preferred_format: "pdf_or_docx",
  },
  successfactors: {
    name: "SuccessFactors (SAP)",
    weights: { formatting: 0.18, keyword_match: 0.27, section_completeness: 0.18, experience_quality: 0.25, education_alignment: 0.12 },
    keyword_strategy: "taxonomy_normalization",
    format_strictness: "medium",
    quirks: [
      "Textkernel parser normalizes job titles",
      "Joule AI for skills matching",
      "Taxonomy-based: maps terms to standard ontology",
      "Good at understanding title equivalences",
    ],
    preferred_format: "docx",
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Strip leading bullet chars from a bullet string */
function stripBulletChar(b: string): string {
  return b.replace(/^[\s•\-–—*·▪▸►◆◇○●\u2022\u2023]+/, "").trim();
}

// ─── Dimension: Formatting ─────────────────────────────────────────────────

function scoreFormatting(resume: ParsedResume, profile: ATSProfile): number {
  let score = 100;
  const c = resume.contact ?? {} as ContactInfo;

  if (!c.email) score -= 12;
  if (!c.phone) score -= 8;
  if (!c.name)  score -= 18;
  if ((resume.experience ?? []).length === 0) score -= 12;
  if ((resume.education  ?? []).length === 0) score -= 8;
  if ((resume.skills     ?? []).length === 0) score -= 8;

  if (profile.format_strictness === "strict") {
    if (!resume.summary) score -= 8;
    const badDates = (resume.experience ?? []).filter(
      (e) => e.start_date && !/\d{4}/.test(e.start_date)
    ).length;
    score -= Math.min(10, badDates * 3);
  }

  return Math.max(0, score);
}

// ─── Dimension: Keyword Match ──────────────────────────────────────────────

async function scoreKeywords(
  resume: ParsedResume,
  jd: JDKeywords,
  profile: ATSProfile
): Promise<{ score: number; matches: KeywordMatch[]; missing: string[] }> {
  const allKeywords = [
    ...(jd.hard_skills    ?? []),
    ...(jd.soft_skills    ?? []),
    ...(jd.tools          ?? []),
    ...(jd.certifications ?? []),
  ];

  if (allKeywords.length === 0) return { score: 80, matches: [], missing: [] };

  const matches: KeywordMatch[] = [];
  for (const kw of allKeywords) {
    const match = await matchKeyword(kw.keyword, resume, profile.keyword_strategy);
    matches.push(match);
  }

  const missing = matches
    .filter((m) => m.match_type === "missing")
    .map((m) => m.keyword);

  // Weighted: exact=1.0, fuzzy=0.88, semantic=confidence (min 0.38)
  const weightedScore = matches.reduce((acc, m) => {
    if (m.match_type === "exact")    return acc + 1.0;
    if (m.match_type === "fuzzy")    return acc + 0.88;
    if (m.match_type === "semantic") return acc + Math.max(0.55, m.confidence);
    return acc;
  }, 0);

  const rawScore  = (weightedScore / allKeywords.length) * 100;

  // Boost: must_have keywords matched get bonus
  const mustHaveMatched = matches.filter(
    (m, i) => m.match_type !== "missing" && allKeywords[i]?.priority === "must_have"
  ).length;
  const mustHaveTotal = allKeywords.filter((k) => k.priority === "must_have").length;
  const mustHaveBonus = mustHaveTotal > 0
    ? (mustHaveMatched / mustHaveTotal) * 8   // up to +8 points for nailing must-haves
    : 0;

  return {
    score: Math.min(100, rawScore + mustHaveBonus),
    matches,
    missing,
  };
}

// ─── Dimension: Experience Quality ────────────────────────────────────────

const ACTION_VERBS = new Set([
  "led","lead","leads","developed","develop","develops","implemented","implement",
  "designed","design","built","build","managed","manage","optimized","optimize",
  "reduced","reduce","increased","increase","launched","launch","created","create",
  "delivered","deliver","architected","architect","scaled","scale","deployed","deploy",
  "automated","automate","improved","improve","drove","drive","spearheaded","spearhead",
  "collaborated","collaborate","maintained","maintain","migrated","migrate","integrated",
  "integrate","established","establish","streamlined","streamline","accelerated","accelerate",
  "transformed","transform","mentored","mentor","trained","train","coached","coach",
  "negotiated","negotiate","secured","secure","generated","generate","achieved","achieve",
  "exceeded","exceed","revamped","revamp","overhauled","overhaul","consolidated","consolidate",
  "identified","identify","resolved","resolve","diagnosed","diagnose","audited","audit",
  "coordinated","coordinate","facilitated","facilitate","produced","produce","published","publish",
  "researched","research","analyzed","analyze","visualized","visualize","presented","present",
  "executed","execute","owned","own","partnered","partner","supported","support",
]);

function scoreExperience(resume: ParsedResume, jd: JDKeywords): number {
  const experiences = resume.experience ?? [];
  if (experiences.length === 0) return 20; // base credit — structured resume still counts

  const allBullets = experiences.flatMap((e) => (e.bullets ?? []).map(stripBulletChar)).filter(Boolean);
  if (allBullets.length === 0) {
    // No bullets extracted, give partial credit based on role count
    const roleCredit = Math.min(60, experiences.length * 20);
    return roleCredit + (experiences.some((e) => e.is_current) ? 15 : 0);
  }

  let score = 15; // base for having bullets at all

  // ── Quantified achievements ──────────────────────────────────────────────
  // Any bullet containing a number (%, $, digits with units, plain counts)
  const quantified = allBullets.filter((b) =>
    /\d+%/.test(b) ||                                         // percentages
    /\$[\d,.]+/.test(b) ||                                    // dollar values
    /\d[\d,.]*\s*(x|×)\b/i.test(b) ||                        // 3x improvement
    /\b\d[\d,]*\+?\s*(users|clients|engineers|team|people|projects|apps|services|systems|features|requests|transactions|million|billion|k|m|ms|sec|min|hours|weeks|months|year)/i.test(b) ||
    /\b(increased|decreased|reduced|improved|grew|cut|saved|generated|drove)\b.*\d/i.test(b) ||
    /\d+\s*(to|from|of)\s*\d/i.test(b)                       // "45 min to 8 min"
  ).length;
  const quantRatio = quantified / allBullets.length;
  score += Math.min(32, quantRatio * 50); // max 32pts for well-quantified bullets

  // ── Action verb bullets ──────────────────────────────────────────────────
  const jdVerbs    = new Set((jd.action_verbs ?? []).map((v) => v.toLowerCase()));
  const allVerbs   = new Set([...ACTION_VERBS, ...jdVerbs]);
  const verbBullets = allBullets.filter((b) => {
    const first = b.split(/\s+/)[0]?.toLowerCase() ?? "";
    return allVerbs.has(first) || allVerbs.has(first.replace(/s$/, "")) || allVerbs.has(first + "ed");
  }).length;
  const verbRatio  = verbBullets / allBullets.length;
  score += Math.min(25, verbRatio * 35); // max 25pts

  // ── Experience depth ─────────────────────────────────────────────────────
  const expCount = experiences.length;
  if (expCount >= 3) score += 16;
  else if (expCount === 2) score += 10;
  else score += 5;

  // ── Recency ──────────────────────────────────────────────────────────────
  if (experiences.some((e) => e.is_current)) score += 12;

  // ── Bullet richness: enough bullets per role ─────────────────────────────
  const avgBullets = allBullets.length / expCount;
  if (avgBullets >= 4) score += 8;
  else if (avgBullets >= 2) score += 4;

  return Math.min(100, Math.round(score));
}

// ─── Dimension: Education Alignment ───────────────────────────────────────

function scoreEducation(resume: ParsedResume, jd: JDKeywords): number {
  const edus  = resume.education     ?? [];
  const certs = resume.certifications ?? [];

  if (edus.length === 0 && certs.length === 0) return 30; // no education ≠ no score

  let score = 45; // base for having education

  if (jd.education_requirement) {
    const req = jd.education_requirement.toLowerCase();
    const matches = edus.some(
      (e) =>
        e.degree.toLowerCase().includes(req) ||
        req.split(/\s+/).some((w) => w.length > 3 && e.degree.toLowerCase().includes(w))
    );
    score += matches ? 32 : 10;
  } else {
    score += 22; // no explicit requirement → full credit
  }

  if (edus.some((e) => e.gpa))                          score += 8;
  if (edus.some((e) => (e.relevant_coursework ?? []).length > 0)) score += 6;
  if (edus.some((e) => (e.honors ?? []).length > 0))    score += 5;
  if (certs.length > 0)                                  score += 8; // certs boost education

  return Math.min(100, score);
}

// ─── Dimension: Section Completeness ──────────────────────────────────────

function scoreSections(resume: ParsedResume): number {
  const c = resume.contact ?? {} as ContactInfo;
  let score = 0;

  if (c.name)     score += 10;
  if (c.email)    score += 10;
  if (c.phone)    score += 6;
  if (c.linkedin) score += 4;
  if (resume.summary)                             score += 15;
  if ((resume.experience     ?? []).length > 0)  score += 20;
  if ((resume.education      ?? []).length > 0)  score += 13;
  if ((resume.skills         ?? []).length > 0)  score += 13;
  if ((resume.projects       ?? []).length > 0)  score += 5;
  if ((resume.certifications ?? []).length > 0)  score += 4;

  return Math.min(100, score);
}

// ─── Suggestions ──────────────────────────────────────────────────────────

function generateSuggestions(
  resume: ParsedResume,
  profile: ATSProfile,
  missing: string[],
  dims: DimensionScore
): string[] {
  const s: string[] = [];

  if (missing.length > 0)
    s.push(`Incorporate these missing keywords: ${missing.slice(0, 5).join(", ")}`);

  if (dims.experience_quality < 70)
    s.push("Start every bullet with a strong action verb (Led, Built, Optimized, Drove)");
  if (dims.experience_quality < 75)
    s.push("Add quantified results to bullets — numbers, %, $ amounts, team sizes");

  if (dims.formatting < 80) {
    if (!resume.contact?.email)
      s.push("Add your email address to the contact section");
    if (!resume.summary)
      s.push("Add a professional summary that mirrors the JD's key requirements");
  }

  if (dims.section_completeness < 80) {
    if (!(resume.skills ?? []).length)
      s.push("Add a dedicated Skills section listing all technologies");
    if (!(resume.projects ?? []).length)
      s.push("Add a Projects section to showcase hands-on technical work");
  }

  if (profile.keyword_strategy === "exact_only")
    s.push("Mirror the JD's exact phrasing — Taleo matches token by token");
  if (profile.keyword_strategy === "stemming")
    s.push("Spell out all acronyms (e.g., ML → Machine Learning) — Lever can't expand them");
  if (profile.name === "Workday")
    s.push("Keep contact info in the document body, not in a header or footer");

  return s.slice(0, 6);
}

// ─── Single platform scorer ───────────────────────────────────────────────

async function scorePlatform(
  resume: ParsedResume,
  jd: JDKeywords,
  platform: ATSPlatform
): Promise<PlatformScore> {
  const profile = ATS_PROFILES[platform];

  const fmtScore                           = scoreFormatting(resume, profile);
  const { score: kwScore, matches, missing } = await scoreKeywords(resume, jd, profile);
  const expScore                           = scoreExperience(resume, jd);
  const eduScore                           = scoreEducation(resume, jd);
  const secScore                           = scoreSections(resume);

  const dimensions: DimensionScore = {
    formatting:           fmtScore,
    keyword_match:        kwScore,
    section_completeness: secScore,
    experience_quality:   expScore,
    education_alignment:  eduScore,
  };

  const raw =
    fmtScore * profile.weights.formatting +
    kwScore  * profile.weights.keyword_match +
    secScore * profile.weights.section_completeness +
    expScore * profile.weights.experience_quality +
    eduScore * profile.weights.education_alignment;

  // Quality floor: a complete, well-structured resume is always at least 65
  const qualityFloor =
    secScore >= 80 && fmtScore >= 75 && expScore >= 50 ? 65 : 0;

  const overall = Math.round(Math.max(qualityFloor, raw));

  const suggestions = generateSuggestions(resume, profile, missing, dimensions);

  return {
    platform,
    platform_name: profile.name,
    overall_score: Math.min(99, overall), // cap at 99 — nothing is perfect
    dimensions,
    matched_keywords: matches,
    missing_keywords: missing,
    suggestions,
  };
}

// ─── Score all 6 platforms ────────────────────────────────────────────────

export async function scoreAllPlatforms(
  resume: ParsedResume,
  jd: JDKeywords
): Promise<MatchReport> {
  const platforms: ATSPlatform[] = [
    "workday", "taleo", "icims", "greenhouse", "lever", "successfactors",
  ];

  const platformScores: PlatformScore[] = [];
  for (const platform of platforms) {
    platformScores.push(await scorePlatform(resume, jd, platform));
  }

  const overall_match_rate = Math.round(
    platformScores.reduce((s, p) => s + p.overall_score, 0) / platformScores.length
  );

  // Missing keywords = those absent on the most platforms
  const missingCount = new Map<string, number>();
  for (const ps of platformScores) {
    for (const kw of ps.missing_keywords) {
      missingCount.set(kw, (missingCount.get(kw) ?? 0) + 1);
    }
  }
  const top_missing_keywords = [...missingCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([kw]) => kw);

  // Keyword density from the most forgiving platform (iCIMS)
  const allKwCount = [
    ...(jd.hard_skills ?? []), ...(jd.soft_skills ?? []),
    ...(jd.tools ?? []),       ...(jd.certifications ?? []),
  ].length;
  const bestPlatform = platformScores.find((p) => p.platform === "icims") ?? platformScores[0];
  const matchedCount = bestPlatform.matched_keywords.filter((m) => m.match_type !== "missing").length;
  const keyword_density = allKwCount > 0
    ? Math.round((matchedCount / allKwCount) * 100) / 100
    : 0;

  return {
    resume,
    jd_keywords: jd,
    platform_scores: platformScores,
    overall_match_rate,
    top_missing_keywords,
    keyword_density,
  };
}

// ─── ATS arrangement ─────────────────────────────────────────────────────

export function arrangeForATS(
  resume: ParsedResume,
  jd: JDKeywords,
  _platform: ATSPlatform
): ParsedResume {
  const arranged = JSON.parse(JSON.stringify(resume)) as ParsedResume;

  // Reorder skills: JD priority first
  const jdSkillOrder = [
    ...(jd.hard_skills ?? []).map((k) => k.keyword.toLowerCase()),
    ...(jd.tools       ?? []).map((k) => k.keyword.toLowerCase()),
    ...(jd.soft_skills ?? []).map((k) => k.keyword.toLowerCase()),
  ];
  (arranged.skills ?? []).sort((a, b) => {
    const ia = jdSkillOrder.indexOf(a.toLowerCase());
    const ib = jdSkillOrder.indexOf(b.toLowerCase());
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  // Reorder bullets per role: priority keywords first
  const prioritySet = new Set((jd.priority_keywords ?? []).map((k) => k.toLowerCase()));
  for (const exp of (arranged.experience ?? [])) {
    (exp.bullets ?? []).sort((a, b) => {
      const sa = [...prioritySet].filter((kw) => a.toLowerCase().includes(kw)).length;
      const sb = [...prioritySet].filter((kw) => b.toLowerCase().includes(kw)).length;
      return sb - sa;
    });
  }

  return arranged;
}
