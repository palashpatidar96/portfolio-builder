// ─── Contact & Resume Models ───────────────────────────────────────────────

export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  location?: string;
}

export interface ExperienceEntry {
  job_title: string;
  company: string;
  start_date: string;
  end_date?: string;
  location?: string;
  bullets: string[];
  technologies: string[];
  is_current: boolean;
}

export interface ProjectEntry {
  title: string;
  description: string;
  tech_stack: string[];
  highlights: string[];
  url?: string;
  date?: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year?: string;
  gpa?: string;
  relevant_coursework: string[];
  honors: string[];
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  date?: string;
  credential_id?: string;
}

export interface ParsedResume {
  contact: ContactInfo;
  summary?: string;
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  education: EducationEntry[];
  skills: string[];
  certifications: CertificationEntry[];
  languages: string[];
  achievements: string[];
}

// ─── Job Description Models ─────────────────────────────────────────────────

export type KeywordPriority = "must_have" | "nice_to_have";

export interface KeywordEntry {
  keyword: string;
  category: "hard_skill" | "soft_skill" | "tool" | "certification" | "action_verb";
  priority: KeywordPriority;
  frequency: number;
}

export interface JDKeywords {
  job_title: string;
  experience_level: "entry" | "mid" | "senior" | "lead" | "executive";
  hard_skills: KeywordEntry[];
  soft_skills: KeywordEntry[];
  tools: KeywordEntry[];
  certifications: KeywordEntry[];
  action_verbs: string[];
  education_requirement?: string;
  years_experience?: string;
  industry_terms: string[];
  priority_keywords: string[];
}

// ─── Match Report Models ────────────────────────────────────────────────────

export type MatchType = "exact" | "fuzzy" | "semantic" | "missing";

export interface KeywordMatch {
  keyword: string;
  match_type: MatchType;
  matched_to?: string;
  confidence: number;
  location?: string;
}

export type ATSPlatform =
  | "workday"
  | "taleo"
  | "icims"
  | "greenhouse"
  | "lever"
  | "successfactors";

export interface DimensionScore {
  formatting: number;
  keyword_match: number;
  section_completeness: number;
  experience_quality: number;
  education_alignment: number;
}

export interface PlatformScore {
  platform: ATSPlatform;
  platform_name: string;
  overall_score: number;
  dimensions: DimensionScore;
  matched_keywords: KeywordMatch[];
  missing_keywords: string[];
  suggestions: string[];
}

export interface MatchReport {
  resume: ParsedResume;
  jd_keywords: JDKeywords;
  platform_scores: PlatformScore[];
  overall_match_rate: number;
  top_missing_keywords: string[];
  keyword_density: number;
}

// ─── Optimized Resume ───────────────────────────────────────────────────────

export interface OptimizedResume extends ParsedResume {
  optimization_notes: string[];
  target_platform?: ATSPlatform;
}

// ─── ATS Platform Profiles ──────────────────────────────────────────────────

export type KeywordStrategy =
  | "exact_only"
  | "exact_plus_ai"
  | "semantic_ml"
  | "semantic_llm"
  | "stemming"
  | "taxonomy_normalization";

export type FormatStrictness = "strict" | "medium" | "lenient";

export interface ATSProfile {
  name: string;
  weights: {
    formatting: number;
    keyword_match: number;
    section_completeness: number;
    experience_quality: number;
    education_alignment: number;
  };
  keyword_strategy: KeywordStrategy;
  format_strictness: FormatStrictness;
  quirks: string[];
  preferred_format: string;
}

// ─── Pipeline I/O ───────────────────────────────────────────────────────────

export interface PipelineRequest {
  resumeText: string;
  jobDescription: string;
  apiKey?: string;
  targetPlatform?: ATSPlatform;
}

export interface PipelineResult {
  parsedResume: ParsedResume;
  jdKeywords: JDKeywords;
  matchReport: MatchReport;
  optimizedResume: OptimizedResume;
}
