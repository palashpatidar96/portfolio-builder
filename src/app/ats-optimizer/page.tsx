"use client";
import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import type {
  ATSPlatform,
  MatchReport,
  OptimizedResume,
  ParsedResume,
  JDKeywords,
  PlatformScore,
} from "@/lib/ats/types";

type Screen = "input" | "analyzing" | "dashboard" | "keywords" | "optimized" | "download";

interface PipelineResult {
  parsedResume: ParsedResume;
  jdKeywords: JDKeywords;
  matchReport: MatchReport;
  optimizedResume: OptimizedResume;
  optimizedReport: MatchReport;
}

const ATS_PLATFORM_COLORS: Record<ATSPlatform, string> = {
  workday: "#4f86f7",
  taleo: "#f7984f",
  icims: "#4fc98e",
  greenhouse: "#2eb88a",
  lever: "#a78bfa",
  successfactors: "#f472b6",
};

const ATS_PLATFORM_ICONS: Record<ATSPlatform, string> = {
  workday: "⬡",
  taleo: "◈",
  icims: "⬢",
  greenhouse: "✦",
  lever: "◆",
  successfactors: "⬟",
};

export default function ATSOptimizerPage() {
  const [screen, setScreen] = useState<Screen>("input");
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [targetPlatform, setTargetPlatform] = useState<ATSPlatform>("workday");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<"dashboard" | "keywords" | "optimized" | "download">("dashboard");
  const [analysisStep, setAnalysisStep] = useState(0);
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const analysisSteps = [
    "Parsing resume with LlamaParse…",
    "Structuring resume data with AI…",
    "Extracting JD keywords…",
    "Scoring against 6 ATS platforms…",
    "Optimizing resume for maximum score…",
    "Generating final report…",
  ];

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.name.endsWith(".pdf") || dropped.name.endsWith(".docx") || dropped.name.endsWith(".txt"))) {
      setFile(dropped);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!file && !jdText.trim()) {
      setError("Please upload a resume and paste a job description.");
      return;
    }
    if (!file) {
      setError("Please upload your resume (PDF, DOCX, or TXT).");
      return;
    }
    if (!jdText.trim()) {
      setError("Please paste the job description.");
      return;
    }

    setError("");
    setScreen("analyzing");
    setAnalysisStep(0);

    // Animate through steps
    const stepTimer = setInterval(() => {
      setAnalysisStep((s) => Math.min(s + 1, analysisSteps.length - 1));
    }, 8000);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jdText);
      formData.append("targetPlatform", targetPlatform);

      const res = await fetch("/api/ats/full-pipeline", {
        method: "POST",
        body: formData,
      });

      clearInterval(stepTimer);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Analysis failed");
      }

      const data = await res.json() as PipelineResult & { success: boolean };
      setResult(data);
      setScreen("dashboard");
      setActiveResultTab("dashboard");
    } catch (e) {
      clearInterval(stepTimer);
      setError((e as Error).message);
      setScreen("input");
    }
  };

  const downloadFile = async (format: "docx" | "pdf") => {
    if (!result?.optimizedResume) return;
    const setter = format === "docx" ? setDownloadingDocx : setDownloadingPdf;
    setter(true);
    try {
      const res = await fetch("/api/ats/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: result.optimizedResume, format }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume_ats_optimized.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setter(false);
    }
  };

  const scoreColor = (score: number) =>
    score >= 75 ? "#4fc98e" : score >= 50 ? "#e8c547" : "#e85d4a";

  const scoreLabel = (score: number) =>
    score >= 75 ? "Strong" : score >= 50 ? "Fair" : "Weak";

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0a0a0a; --bg-card: #111111; --bg-card-hover: #161616;
          --text: #f0ece2; --text-muted: #8a8580; --accent: #e8c547;
          --coral: #e85d4a; --teal: #47c8b0; --lavender: #9b8ec4; --green: #4fc98e;
          --serif: 'Playfair Display', Georgia, serif;
          --sans: 'DM Sans', system-ui, sans-serif;
          --mono: 'JetBrains Mono', monospace;
          --radius: 12px; --radius-lg: 20px;
          --tr: 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--text); font-family: var(--sans); font-size: 16px; line-height: 1.6; overflow-x: hidden; }
        body::after { content:''; position:fixed; inset:0; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); opacity:0.03; pointer-events:none; z-index:9999; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:var(--bg); }
        ::-webkit-scrollbar-thumb { background:#333; border-radius:3px; }
        ::selection { background:var(--accent); color:#0a0a0a; }

        /* NAV */
        nav { position:fixed; top:0; left:0; right:0; z-index:1000; backdrop-filter:blur(20px) saturate(1.4); background:rgba(10,10,10,0.85); border-bottom:1px solid rgba(232,197,71,0.08); }
        .nav-inner { display:flex; align-items:center; justify-content:space-between; height:64px; max-width:1200px; margin:0 auto; padding:0 32px; }
        .nav-logo { font-family:var(--serif); font-size:1.125rem; font-weight:700; color:var(--text); text-decoration:none; }
        .nav-logo span { color:var(--accent); }
        .nav-badge { background:rgba(232,197,71,0.1); border:1px solid rgba(232,197,71,0.25); border-radius:100px; padding:4px 12px; font-family:var(--mono); font-size:0.6875rem; color:var(--accent); margin-left:12px; }
        .nav-right { display:flex; align-items:center; gap:16px; }
        .btn-ghost { background:none; border:none; color:var(--text-muted); font-family:var(--sans); font-size:0.875rem; font-weight:500; cursor:pointer; padding:8px 4px; transition:color var(--tr); text-decoration:none; }
        .btn-ghost:hover { color:var(--text); }

        /* PAGE */
        .page { min-height:100vh; padding:80px 32px 64px; }
        .page-inner { max-width:900px; margin:0 auto; }
        .page-hero { text-align:center; padding:64px 0 48px; }
        .page-badge { display:inline-flex; align-items:center; gap:8px; border:1px solid rgba(232,197,71,0.35); border-radius:100px; padding:6px 16px; font-family:var(--mono); font-size:0.75rem; color:var(--accent); margin-bottom:24px; background:rgba(232,197,71,0.05); }
        .page-badge::before { content:''; display:inline-block; width:6px; height:6px; border-radius:50%; background:var(--accent); animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.5;transform:scale(0.8);} }
        .page-h1 { font-family:var(--serif); font-size:clamp(2.5rem,5vw,3.75rem); font-weight:700; line-height:1.08; letter-spacing:-0.03em; margin-bottom:16px; }
        .page-h1 em { font-style:italic; color:var(--accent); }
        .page-sub { font-size:1.0625rem; color:var(--text-muted); line-height:1.65; max-width:560px; margin:0 auto; }

        /* GRID BG */
        .grid-bg { position:fixed; inset:0; pointer-events:none; background-image:linear-gradient(rgba(232,197,71,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(232,197,71,0.025) 1px,transparent 1px); background-size:80px 80px; z-index:0; }
        .glow { position:fixed; top:15%; left:50%; transform:translateX(-50%); width:700px; height:350px; background:radial-gradient(ellipse,rgba(232,197,71,0.05) 0%,transparent 70%); pointer-events:none; z-index:0; }
        .content { position:relative; z-index:1; }

        /* CARD */
        .card { background:var(--bg-card); border:1px solid rgba(255,255,255,0.07); border-radius:var(--radius-lg); padding:40px; transition:border-color var(--tr); }
        .card-label { font-family:var(--mono); font-size:0.6875rem; color:var(--accent); letter-spacing:0.1em; margin-bottom:10px; }
        .card-title { font-family:var(--serif); font-size:1.375rem; font-weight:600; color:var(--text); margin-bottom:20px; letter-spacing:-0.015em; }

        /* FORM */
        .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
        .form-group { display:flex; flex-direction:column; gap:8px; }
        .form-group.span2 { grid-column:span 2; }
        label { font-size:0.8125rem; font-weight:600; color:var(--text-muted); letter-spacing:0.01em; }
        label span { color:var(--accent); margin-left:4px; font-size:0.6875rem; }
        input[type=text], input[type=password], select, textarea {
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px;
          color:var(--text); font-family:var(--sans); font-size:0.9375rem; padding:12px 16px;
          transition:border-color var(--tr); outline:none; width:100%;
        }
        input[type=text]:focus, input[type=password]:focus, select:focus, textarea:focus {
          border-color:rgba(232,197,71,0.4); box-shadow:0 0 0 3px rgba(232,197,71,0.06);
        }
        select { cursor:pointer; }
        textarea { resize:vertical; min-height:160px; line-height:1.55; }

        /* DROP ZONE */
        .drop-zone { border:2px dashed rgba(232,197,71,0.25); border-radius:var(--radius-lg); padding:36px 24px; text-align:center; cursor:pointer; transition:all var(--tr); background:rgba(232,197,71,0.02); }
        .drop-zone:hover, .drop-zone.active { border-color:rgba(232,197,71,0.5); background:rgba(232,197,71,0.05); }
        .drop-zone.has-file { border-color:rgba(71,200,176,0.4); background:rgba(71,200,176,0.04); }
        .drop-icon { font-size:2rem; margin-bottom:12px; opacity:0.6; }
        .drop-title { font-family:var(--serif); font-size:1.125rem; font-weight:600; color:var(--text); margin-bottom:6px; }
        .drop-sub { font-size:0.8125rem; color:var(--text-muted); }
        .drop-file-name { font-family:var(--mono); font-size:0.8125rem; color:var(--teal); margin-top:8px; }

        /* BUTTONS */
        .btn-gold { display:inline-flex; align-items:center; justify-content:center; gap:8px; background:var(--accent); color:#0a0a0a; border:none; border-radius:10px; font-family:var(--sans); font-size:1rem; font-weight:700; padding:14px 28px; cursor:pointer; transition:all var(--tr); text-decoration:none; white-space:nowrap; }
        .btn-gold:hover { background:#f0d060; transform:translateY(-2px); box-shadow:0 12px 32px rgba(232,197,71,0.3); }
        .btn-gold:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
        .btn-outline { display:inline-flex; align-items:center; gap:8px; background:transparent; color:var(--text); border:1px solid rgba(240,236,226,0.15); border-radius:10px; font-family:var(--sans); font-size:0.9375rem; font-weight:500; padding:12px 22px; cursor:pointer; transition:all var(--tr); text-decoration:none; }
        .btn-outline:hover { border-color:rgba(232,197,71,0.3); color:var(--accent); background:rgba(232,197,71,0.04); }
        .btn-teal { display:inline-flex; align-items:center; gap:8px; background:rgba(71,200,176,0.12); color:var(--teal); border:1px solid rgba(71,200,176,0.3); border-radius:10px; font-family:var(--sans); font-size:0.9375rem; font-weight:600; padding:12px 22px; cursor:pointer; transition:all var(--tr); }
        .btn-teal:hover { background:rgba(71,200,176,0.2); transform:translateY(-1px); }
        .btn-teal:disabled { opacity:0.5; cursor:not-allowed; transform:none; }

        /* ERROR */
        .error-box { background:rgba(232,93,74,0.08); border:1px solid rgba(232,93,74,0.25); border-radius:10px; padding:14px 18px; color:var(--coral); font-size:0.875rem; margin-bottom:20px; }

        /* ANALYZING */
        .analyzing-wrap { text-align:center; padding:80px 0; }
        .spinner { width:56px; height:56px; border:3px solid rgba(232,197,71,0.15); border-top-color:var(--accent); border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 28px; }
        @keyframes spin { to{ transform:rotate(360deg);} }
        .analyzing-title { font-family:var(--serif); font-size:2rem; font-weight:700; margin-bottom:12px; }
        .analyzing-step { font-family:var(--mono); font-size:0.875rem; color:var(--accent); margin-bottom:36px; min-height:24px; }
        .progress-bar-wrap { background:rgba(255,255,255,0.06); border-radius:100px; height:4px; max-width:360px; margin:0 auto 12px; overflow:hidden; }
        .progress-bar { background:linear-gradient(90deg,var(--accent),var(--teal)); border-radius:100px; height:100%; transition:width 8s ease; }
        .step-list { display:flex; flex-direction:column; gap:10px; max-width:400px; margin:32px auto 0; text-align:left; }
        .step-item { display:flex; align-items:center; gap:10px; font-size:0.875rem; color:var(--text-muted); }
        .step-item.done { color:var(--green); }
        .step-item.active { color:var(--text); }
        .step-dot { width:8px; height:8px; border-radius:50%; background:currentColor; flex-shrink:0; }

        /* RESULT NAV */
        .result-tabs { display:flex; gap:0; margin-bottom:32px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:12px; padding:4px; }
        .tab-btn { flex:1; background:none; border:none; color:var(--text-muted); font-family:var(--sans); font-size:0.8125rem; font-weight:500; padding:10px 16px; cursor:pointer; border-radius:8px; transition:all var(--tr); white-space:nowrap; }
        .tab-btn.active { background:var(--bg-card); color:var(--text); box-shadow:0 2px 8px rgba(0,0,0,0.3); }
        .tab-btn:hover:not(.active) { color:var(--text); }

        /* DASHBOARD */
        .platforms-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:32px; }
        .platform-card { background:var(--bg-card); border:1px solid rgba(255,255,255,0.07); border-radius:var(--radius-lg); padding:28px 20px; text-align:center; transition:all var(--tr); cursor:default; position:relative; overflow:hidden; }
        .platform-card:hover { border-color:rgba(255,255,255,0.14); transform:translateY(-4px); box-shadow:0 16px 40px rgba(0,0,0,0.35); }
        .platform-icon { font-size:1.5rem; margin-bottom:8px; opacity:0.7; }
        .platform-name { font-family:var(--mono); font-size:0.6875rem; color:var(--text-muted); letter-spacing:0.1em; text-transform:uppercase; margin-bottom:12px; }
        .score-ring { position:relative; width:80px; height:80px; margin:0 auto 12px; }
        .score-ring svg { transform:rotate(-90deg); }
        .score-num { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-family:var(--mono); font-size:1.125rem; font-weight:700; }
        .score-label { font-family:var(--mono); font-size:0.6875rem; padding:3px 10px; border-radius:100px; margin:0 auto; display:inline-block; }
        .score-label.strong { background:rgba(79,201,142,0.15); color:#4fc98e; }
        .score-label.fair { background:rgba(232,197,71,0.15); color:var(--accent); }
        .score-label.weak { background:rgba(232,93,74,0.12); color:var(--coral); }
        .platform-pref { font-size:0.6875rem; color:var(--text-muted); margin-top:8px; }

        /* OVERALL SCORE */
        .overall-card { background:linear-gradient(135deg,rgba(232,197,71,0.06) 0%,rgba(71,200,176,0.04) 100%); border:1px solid rgba(232,197,71,0.2); border-radius:var(--radius-lg); padding:36px; margin-bottom:24px; display:flex; align-items:center; gap:40px; }
        .overall-score-num { font-family:var(--mono); font-size:4rem; font-weight:700; line-height:1; color:var(--accent); flex-shrink:0; }
        .overall-label { font-size:0.8125rem; color:var(--text-muted); margin-bottom:4px; font-family:var(--mono); }
        .overall-desc { font-family:var(--serif); font-size:1.25rem; font-weight:600; color:var(--text); margin-bottom:8px; }
        .missing-pills { display:flex; flex-wrap:wrap; gap:6px; margin-top:12px; }
        .pill-red { background:rgba(232,93,74,0.1); border:1px solid rgba(232,93,74,0.25); border-radius:100px; padding:3px 10px; font-family:var(--mono); font-size:0.6875rem; color:var(--coral); }

        /* DIMENSIONS */
        .dim-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .dim-row { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:14px 16px; }
        .dim-label { font-size:0.8125rem; color:var(--text-muted); margin-bottom:8px; }
        .dim-bar-wrap { background:rgba(255,255,255,0.06); border-radius:100px; height:5px; overflow:hidden; }
        .dim-bar { border-radius:100px; height:100%; }
        .dim-num { font-family:var(--mono); font-size:0.75rem; color:var(--text); margin-top:4px; }

        /* KEYWORDS */
        .kw-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:24px; }
        .kw-section { background:var(--bg-card); border:1px solid rgba(255,255,255,0.07); border-radius:var(--radius-lg); padding:24px; }
        .kw-section-title { font-family:var(--mono); font-size:0.6875rem; color:var(--accent); letter-spacing:0.1em; margin-bottom:14px; text-transform:uppercase; }
        .kw-pills { display:flex; flex-wrap:wrap; gap:7px; }
        .kw-pill { border-radius:100px; padding:4px 12px; font-family:var(--mono); font-size:0.6875rem; border:1px solid; }
        .kw-exact { background:rgba(79,201,142,0.1); border-color:rgba(79,201,142,0.3); color:#4fc98e; }
        .kw-fuzzy { background:rgba(71,200,176,0.1); border-color:rgba(71,200,176,0.3); color:var(--teal); }
        .kw-semantic { background:rgba(155,142,196,0.1); border-color:rgba(155,142,196,0.3); color:var(--lavender); }
        .kw-missing { background:rgba(232,93,74,0.08); border-color:rgba(232,93,74,0.2); color:var(--coral); }
        .kw-density { background:var(--bg-card); border:1px solid rgba(255,255,255,0.07); border-radius:var(--radius-lg); padding:24px; margin-bottom:24px; }
        .density-bar-wrap { background:rgba(255,255,255,0.06); border-radius:100px; height:8px; overflow:hidden; margin-top:10px; }
        .density-bar { background:linear-gradient(90deg,var(--accent),var(--teal)); border-radius:100px; height:100%; }

        /* OPTIMIZED */
        .opt-notes { background:rgba(232,197,71,0.05); border:1px solid rgba(232,197,71,0.15); border-radius:var(--radius-lg); padding:24px; margin-bottom:24px; }
        .opt-notes-title { font-family:var(--mono); font-size:0.6875rem; color:var(--accent); letter-spacing:0.1em; margin-bottom:14px; }
        .opt-note-item { display:flex; align-items:flex-start; gap:8px; font-size:0.875rem; color:var(--text-muted); margin-bottom:8px; }
        .opt-note-item::before { content:'→'; color:var(--accent); flex-shrink:0; margin-top:1px; }
        .resume-preview { background:var(--bg-card); border:1px solid rgba(255,255,255,0.07); border-radius:var(--radius-lg); padding:32px; font-family:var(--sans); }
        .resume-name { font-family:var(--serif); font-size:1.5rem; font-weight:700; color:var(--text); margin-bottom:4px; }
        .resume-contact { font-size:0.8125rem; color:var(--text-muted); margin-bottom:24px; }
        .resume-section { margin-bottom:24px; }
        .resume-section-head { font-family:var(--mono); font-size:0.6875rem; color:var(--accent); letter-spacing:0.1em; text-transform:uppercase; border-bottom:1px solid rgba(255,255,255,0.07); padding-bottom:6px; margin-bottom:12px; }
        .resume-summary { font-size:0.9375rem; color:var(--text-muted); line-height:1.65; }
        .resume-skills-list { display:flex; flex-wrap:wrap; gap:6px; }
        .skill-tag { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:6px; padding:3px 10px; font-family:var(--mono); font-size:0.6875rem; color:var(--text-muted); }
        .skill-tag.priority { border-color:rgba(232,197,71,0.3); color:var(--accent); background:rgba(232,197,71,0.07); }
        .exp-entry { margin-bottom:16px; }
        .exp-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px; }
        .exp-title { font-weight:600; color:var(--text); font-size:0.9375rem; }
        .exp-company { color:var(--text-muted); font-size:0.875rem; }
        .exp-dates { font-family:var(--mono); font-size:0.75rem; color:var(--text-muted); }
        .exp-bullets { margin-top:6px; }
        .exp-bullet { font-size:0.875rem; color:var(--text-muted); line-height:1.5; padding-left:14px; position:relative; margin-bottom:3px; }
        .exp-bullet::before { content:'•'; position:absolute; left:0; color:var(--accent); }

        /* DOWNLOAD */
        .download-checklist { background:var(--bg-card); border:1px solid rgba(255,255,255,0.07); border-radius:var(--radius-lg); padding:28px; margin-bottom:24px; }
        .check-item { display:flex; align-items:center; gap:12px; font-size:0.9375rem; color:var(--text-muted); padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.04); }
        .check-item:last-child { border-bottom:none; }
        .check-icon { width:22px; height:22px; border-radius:50%; background:rgba(79,201,142,0.15); color:#4fc98e; display:flex; align-items:center; justify-content:center; font-size:0.75rem; flex-shrink:0; }
        .download-btns { display:flex; gap:16px; flex-wrap:wrap; }

        /* SUGGESTIONS */
        .suggestions-list { margin-top:12px; }
        .suggestion-item { display:flex; align-items:flex-start; gap:8px; font-size:0.8125rem; color:var(--text-muted); padding:7px 0; border-bottom:1px solid rgba(255,255,255,0.04); }
        .suggestion-item:last-child { border-bottom:none; }
        .suggestion-item::before { content:'💡'; font-size:0.75rem; flex-shrink:0; margin-top:1px; }

        /* MOBILE */
        @media(max-width:768px) {
          .page { padding:80px 16px 48px; }
          .form-grid, .kw-grid, .platforms-grid, .dim-grid { grid-template-columns:1fr; }
          .form-group.span2 { grid-column:span 1; }
          .overall-card { flex-direction:column; gap:20px; text-align:center; }
          .result-tabs { overflow-x:auto; }
          .nav-inner { padding:0 16px; }
        }
      `}</style>

      <div className="grid-bg" />
      <div className="glow" />

      {/* NAV */}
      <nav>
        <div className="nav-inner">
          <div style={{ display: "flex", alignItems: "center" }}>
            <Link href="/" className="nav-logo">Portfolio<span>AI</span></Link>
            <span className="nav-badge">ATS Optimizer</span>
          </div>
          <div className="nav-right">
            <Link href="/" className="btn-ghost">← Home</Link>
            <Link href="/onboarding" className="btn-ghost">Build Portfolio</Link>
          </div>
        </div>
      </nav>

      <div className="page content">
        <div className="page-inner">

          {/* ── HERO ── */}
          {screen === "input" && (
            <div className="page-hero">
              <div className="page-badge">✦ Free ATS Resume Analyzer</div>
              <h1 className="page-h1">Beat Every ATS.<br /><em>Get the Interview.</em></h1>
              <p className="page-sub">Score your resume against Workday, Taleo, iCIMS, Greenhouse, Lever &amp; SuccessFactors — then optimize it with AI.</p>
            </div>
          )}

          {/* ── SCREEN 1: INPUT ── */}
          {screen === "input" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {error && <div className="error-box">⚠ {error}</div>}

              {/* Resume Upload */}
              <div className="card">
                <div className="card-label">STEP 01</div>
                <div className="card-title">Upload Your Resume</div>
                <div
                  ref={dropRef}
                  className={`drop-zone ${file ? "has-file" : ""}`}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    style={{ display: "none" }}
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  <div className="drop-icon">{file ? "✓" : "⇧"}</div>
                  <div className="drop-title">
                    {file ? "Resume Uploaded" : "Drag & Drop or Click to Upload"}
                  </div>
                  <div className="drop-sub">Supports PDF, DOCX, TXT</div>
                  {file && <div className="drop-file-name">{file.name}</div>}
                </div>
              </div>

              {/* Job Description */}
              <div className="card">
                <div className="card-label">STEP 02</div>
                <div className="card-title">Paste Job Description</div>
                <div className="form-grid">
                  <div className="form-group span2">
                    <label>Job Description <span>Required</span></label>
                    <textarea
                      placeholder="Paste the full job description here — include requirements, responsibilities, and preferred qualifications…"
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                      style={{ minHeight: "200px" }}
                    />
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="card">
                <div className="card-label">STEP 03</div>
                <div className="card-title">Preferences</div>
                <div className="form-group">
                  <label>Target ATS Platform</label>
                  <select
                    value={targetPlatform}
                    onChange={(e) => setTargetPlatform(e.target.value as ATSPlatform)}
                  >
                    <option value="workday">Workday</option>
                    <option value="taleo">Taleo (Oracle)</option>
                    <option value="icims">iCIMS</option>
                    <option value="greenhouse">Greenhouse</option>
                    <option value="lever">Lever</option>
                    <option value="successfactors">SuccessFactors (SAP)</option>
                  </select>
                </div>
              </div>

              {/* CTA */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: "8px" }}>
                <button className="btn-gold" onClick={handleAnalyze} style={{ minWidth: "240px", fontSize: "1.0625rem" }}>
                  Analyze &amp; Optimize →
                </button>
              </div>

              {/* Trust strip */}
              <div style={{ display: "flex", justifyContent: "center", gap: "28px", flexWrap: "wrap", paddingTop: "8px" }}>
                {["✓ Free to use", "✓ Your data never stored", "✓ 6 ATS platforms scored"].map((t) => (
                  <span key={t} style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* ── SCREEN 2: ANALYZING ── */}
          {screen === "analyzing" && (
            <div className="analyzing-wrap">
              <div className="spinner" />
              <div className="analyzing-title">Analyzing Your Resume</div>
              <div className="analyzing-step">{analysisSteps[analysisStep]}</div>
              <div className="progress-bar-wrap">
                <div
                  className="progress-bar"
                  style={{ width: `${((analysisStep + 1) / analysisSteps.length) * 100}%` }}
                />
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                This takes 30–90 seconds depending on resume length
              </p>
              <div className="step-list">
                {analysisSteps.map((step, i) => (
                  <div
                    key={step}
                    className={`step-item ${i < analysisStep ? "done" : i === analysisStep ? "active" : ""}`}
                  >
                    <div className="step-dot" />
                    <span>{i < analysisStep ? "✓ " : ""}{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SCREENS 3-6: RESULTS ── */}
          {["dashboard", "keywords", "optimized", "download"].includes(screen) && result && (
            <div>
              {/* Back + title */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "0.6875rem", color: "var(--accent)", marginBottom: "6px" }}>// Analysis Complete</div>
                  <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.75rem", fontWeight: 700, color: "var(--text)" }}>
                    Resume Optimization Report
                  </h2>
                </div>
                <button className="btn-ghost" onClick={() => { setScreen("input"); setResult(null); }}>
                  ← New Analysis
                </button>
              </div>

              {/* Tabs */}
              <div className="result-tabs">
                {(["dashboard", "keywords", "optimized", "download"] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`tab-btn ${activeResultTab === tab ? "active" : ""}`}
                    onClick={() => { setActiveResultTab(tab); setScreen(tab); }}
                  >
                    {tab === "dashboard" && "📊 ATS Scores"}
                    {tab === "keywords" && "🔍 Keywords"}
                    {tab === "optimized" && "✨ Optimized"}
                    {tab === "download" && "⬇ Download"}
                  </button>
                ))}
              </div>

              {/* ── TAB: DASHBOARD ── */}
              {activeResultTab === "dashboard" && (
                <div>
                  {/* Overall score */}
                  <div className="overall-card">
                    <div>
                      <div className="overall-label">OVERALL MATCH RATE</div>
                      <div className="overall-score-num">{result.matchReport.overall_match_rate}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="overall-desc">
                        {result.matchReport.overall_match_rate >= 75
                          ? "Strong match — you're in a great position!"
                          : result.matchReport.overall_match_rate >= 50
                          ? "Fair match — optimization can significantly improve your chances."
                          : "Weak match — important keywords are missing from your resume."}
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "8px" }}>
                        Top missing keywords:
                      </div>
                      <div className="missing-pills">
                        {result.matchReport.top_missing_keywords.slice(0, 8).map((kw) => (
                          <span key={kw} className="pill-red">{kw}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Platform cards */}
                  <div className="platforms-grid">
                    {result.matchReport.platform_scores.map((ps: PlatformScore) => {
                      const color = scoreColor(ps.overall_score);
                      const label = scoreLabel(ps.overall_score);
                      const r = 32;
                      const circ = 2 * Math.PI * r;
                      const offset = circ - (ps.overall_score / 100) * circ;
                      return (
                        <div key={ps.platform} className="platform-card">
                          <div className="platform-icon" style={{ color: ATS_PLATFORM_COLORS[ps.platform] }}>
                            {ATS_PLATFORM_ICONS[ps.platform]}
                          </div>
                          <div className="platform-name">{ps.platform_name}</div>
                          <div className="score-ring">
                            <svg width="80" height="80" viewBox="0 0 80 80">
                              <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
                              <circle
                                cx="40" cy="40" r={r} fill="none"
                                stroke={color} strokeWidth="6"
                                strokeDasharray={circ}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="score-num" style={{ color }}>{ps.overall_score}</div>
                          </div>
                          <span className={`score-label ${label.toLowerCase()}`}>{label}</span>
                          <div className="platform-pref" style={{ color: ATS_PLATFORM_COLORS[ps.platform], opacity: 0.8, marginTop: "6px" }}>
                            Preferred: {ATS_PROFILES_CLIENT[ps.platform]?.preferred_format ?? "Any"}
                          </div>

                          {/* Dimension mini-bars */}
                          <div style={{ marginTop: "16px", textAlign: "left" }}>
                            {(Object.entries(ps.dimensions) as [string, number][]).map(([dim, val]) => (
                              <div key={dim} style={{ marginBottom: "6px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "var(--text-muted)", marginBottom: "3px" }}>
                                  <span>{dim.replace(/_/g, " ")}</span>
                                  <span style={{ color: scoreColor(val) }}>{Math.round(val)}</span>
                                </div>
                                <div className="dim-bar-wrap">
                                  <div className="dim-bar" style={{ width: `${val}%`, background: scoreColor(val) }} />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Suggestions */}
                          {ps.suggestions.length > 0 && (
                            <div className="suggestions-list">
                              {ps.suggestions.slice(0, 3).map((s, i) => (
                                <div key={i} className="suggestion-item">{s}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Optimized scores comparison */}
                  <div className="card" style={{ marginTop: "24px" }}>
                    <div className="card-label">AFTER OPTIMIZATION</div>
                    <div className="card-title" style={{ marginBottom: "16px" }}>Score Improvement</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
                      {result.optimizedReport.platform_scores.map((ps) => {
                        const original = result.matchReport.platform_scores.find(
                          (p) => p.platform === ps.platform
                        );
                        const diff = ps.overall_score - (original?.overall_score ?? 0);
                        return (
                          <div key={ps.platform} style={{ textAlign: "center", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <div style={{ fontFamily: "var(--mono)", fontSize: "0.6875rem", color: "var(--text-muted)", marginBottom: "6px" }}>{ps.platform_name}</div>
                            <div style={{ fontFamily: "var(--mono)", fontSize: "1.25rem", fontWeight: 700, color: scoreColor(ps.overall_score) }}>{ps.overall_score}</div>
                            {diff !== 0 && (
                              <div style={{ fontFamily: "var(--mono)", fontSize: "0.75rem", color: diff > 0 ? "var(--green)" : "var(--coral)", marginTop: "2px" }}>
                                {diff > 0 ? "+" : ""}{diff}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB: KEYWORDS ── */}
              {activeResultTab === "keywords" && (
                <div>
                  {/* Density meter */}
                  <div className="kw-density">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: "0.6875rem", color: "var(--accent)", marginBottom: "4px", letterSpacing: "0.08em" }}>KEYWORD DENSITY</div>
                        <div style={{ fontFamily: "var(--serif)", fontSize: "1.125rem", fontWeight: 600 }}>
                          {Math.round(result.matchReport.keyword_density * 100)}% of JD keywords present
                        </div>
                      </div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: "2rem", fontWeight: 700, color: scoreColor(result.matchReport.keyword_density * 100) }}>
                        {Math.round(result.matchReport.keyword_density * 100)}%
                      </div>
                    </div>
                    <div className="density-bar-wrap">
                      <div className="density-bar" style={{ width: `${result.matchReport.keyword_density * 100}%` }} />
                    </div>
                  </div>

                  {/* Legend */}
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "20px" }}>
                    {[
                      { cls: "kw-exact", label: "Exact Match" },
                      { cls: "kw-fuzzy", label: "Fuzzy Match" },
                      { cls: "kw-semantic", label: "Semantic Match" },
                      { cls: "kw-missing", label: "Missing" },
                    ].map((l) => (
                      <span key={l.cls} className={`kw-pill ${l.cls}`}>{l.label}</span>
                    ))}
                  </div>

                  {/* Best platform matches */}
                  {result.matchReport.platform_scores.map((ps) => {
                    const exactMatches = ps.matched_keywords.filter((m) => m.match_type === "exact");
                    const fuzzyMatches = ps.matched_keywords.filter((m) => m.match_type === "fuzzy");
                    const semanticMatches = ps.matched_keywords.filter((m) => m.match_type === "semantic");
                    return (
                      <div key={ps.platform} style={{ marginBottom: "24px" }}>
                        <div style={{ fontFamily: "var(--mono)", fontSize: "0.75rem", color: ATS_PLATFORM_COLORS[ps.platform], marginBottom: "12px", letterSpacing: "0.08em" }}>
                          {ATS_PLATFORM_ICONS[ps.platform]} {ps.platform_name.toUpperCase()}
                        </div>
                        <div className="kw-grid">
                          <div className="kw-section">
                            <div className="kw-section-title">Matched ({exactMatches.length + fuzzyMatches.length + semanticMatches.length})</div>
                            <div className="kw-pills">
                              {exactMatches.map((m) => <span key={m.keyword} className="kw-pill kw-exact" title="Exact match">{m.keyword}</span>)}
                              {fuzzyMatches.map((m) => <span key={m.keyword} className="kw-pill kw-fuzzy" title={`Fuzzy → ${m.matched_to}`}>{m.keyword}</span>)}
                              {semanticMatches.map((m) => <span key={m.keyword} className="kw-pill kw-semantic" title={`Semantic (${Math.round(m.confidence * 100)}%)`}>{m.keyword}</span>)}
                              {exactMatches.length + fuzzyMatches.length + semanticMatches.length === 0 && (
                                <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>None matched</span>
                              )}
                            </div>
                          </div>
                          <div className="kw-section">
                            <div className="kw-section-title" style={{ color: "var(--coral)" }}>Missing ({ps.missing_keywords.length})</div>
                            <div className="kw-pills">
                              {ps.missing_keywords.map((kw) => <span key={kw} className="kw-pill kw-missing">{kw}</span>)}
                              {ps.missing_keywords.length === 0 && (
                                <span style={{ fontSize: "0.8125rem", color: "var(--green)" }}>✓ All keywords matched!</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* JD Priority keywords */}
                  <div className="kw-section" style={{ marginTop: "8px" }}>
                    <div className="kw-section-title">JD Priority Keywords (Top 10)</div>
                    <div className="kw-pills">
                      {result.jdKeywords.priority_keywords.map((kw, i) => (
                        <span key={kw} className="kw-pill" style={{ background: "rgba(232,197,71,0.08)", borderColor: "rgba(232,197,71,0.25)", color: "var(--accent)", fontSize: "0.6875rem" }}>
                          <span style={{ opacity: 0.6 }}>{i + 1}. </span>{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB: OPTIMIZED ── */}
              {activeResultTab === "optimized" && result.optimizedResume && (
                <div>
                  {/* Optimization notes */}
                  {result.optimizedResume.optimization_notes?.length > 0 && (
                    <div className="opt-notes">
                      <div className="opt-notes-title">OPTIMIZATION CHANGES</div>
                      {result.optimizedResume.optimization_notes.map((note, i) => (
                        <div key={i} className="opt-note-item">{note}</div>
                      ))}
                    </div>
                  )}

                  {/* Resume preview */}
                  <div className="resume-preview">
                    <div className="resume-name">{result.optimizedResume.contact?.name ?? "—"}</div>
                    <div className="resume-contact">
                      {[
                        result.optimizedResume.contact?.email,
                        result.optimizedResume.contact?.phone,
                        result.optimizedResume.contact?.location,
                        result.optimizedResume.contact?.linkedin,
                      ].filter(Boolean).join("  •  ")}
                    </div>

                    {result.optimizedResume.summary && (
                      <div className="resume-section">
                        <div className="resume-section-head">Professional Summary</div>
                        <div className="resume-summary">{result.optimizedResume.summary}</div>
                      </div>
                    )}

                    {result.optimizedResume.skills?.length > 0 && (
                      <div className="resume-section">
                        <div className="resume-section-head">Skills</div>
                        <div className="resume-skills-list">
                          {result.optimizedResume.skills.map((s, i) => (
                            <span key={s} className={`skill-tag ${i < 8 ? "priority" : ""}`}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.optimizedResume.experience?.length > 0 && (
                      <div className="resume-section">
                        <div className="resume-section-head">Experience</div>
                        {result.optimizedResume.experience.map((exp, i) => (
                          <div key={i} className="exp-entry">
                            <div className="exp-header">
                              <div>
                                <div className="exp-title">{exp.job_title}</div>
                                <div className="exp-company">{exp.company}{exp.location ? ` • ${exp.location}` : ""}</div>
                              </div>
                              <div className="exp-dates">{exp.start_date} – {exp.end_date ?? "Present"}</div>
                            </div>
                            <div className="exp-bullets">
                              {exp.bullets.slice(0, 4).map((b, j) => (
                                <div key={j} className="exp-bullet">{b}</div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {result.optimizedResume.education?.length > 0 && (
                      <div className="resume-section">
                        <div className="resume-section-head">Education</div>
                        {result.optimizedResume.education.map((edu, i) => (
                          <div key={i} style={{ marginBottom: "8px" }}>
                            <div className="exp-title">{edu.degree}</div>
                            <div className="exp-company">{edu.institution}{edu.year ? ` • ${edu.year}` : ""}{edu.gpa ? ` • GPA: ${edu.gpa}` : ""}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {result.optimizedResume.certifications?.length > 0 && (
                      <div className="resume-section">
                        <div className="resume-section-head">Certifications</div>
                        {result.optimizedResume.certifications.map((cert, i) => (
                          <div key={i} style={{ marginBottom: "6px", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                            <strong style={{ color: "var(--text)" }}>{cert.name}</strong> — {cert.issuer}
                            {cert.date ? ` (${cert.date})` : ""}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── TAB: DOWNLOAD ── */}
              {activeResultTab === "download" && (
                <div>
                  {/* ATS checklist */}
                  <div className="download-checklist">
                    <div style={{ fontFamily: "var(--mono)", fontSize: "0.6875rem", color: "var(--accent)", letterSpacing: "0.1em", marginBottom: "16px" }}>ATS VALIDATION CHECKLIST</div>
                    {[
                      "Single-column layout — ATS-safe formatting",
                      "Contact information in document body (not header)",
                      "Standard section headings (Experience, Education, Skills)",
                      "Skills ordered by JD keyword priority",
                      "Bullet points start with action verbs",
                      "Keywords incorporated naturally throughout",
                      "No tables, text boxes, or graphics",
                      "Available in both DOCX (primary) and PDF (secondary)",
                    ].map((item) => (
                      <div key={item} className="check-item">
                        <div className="check-icon">✓</div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Score summary */}
                  <div className="card" style={{ marginBottom: "24px" }}>
                    <div className="card-label">OPTIMIZED SCORES</div>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      {result.optimizedReport.platform_scores.map((ps) => (
                        <div key={ps.platform} style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "8px 14px", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <span style={{ color: ATS_PLATFORM_COLORS[ps.platform], fontSize: "0.875rem" }}>{ATS_PLATFORM_ICONS[ps.platform]}</span>
                          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{ps.platform_name}</span>
                          <span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: scoreColor(ps.overall_score) }}>{ps.overall_score}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Download buttons */}
                  {error && <div className="error-box" style={{ marginBottom: "16px" }}>⚠ {error}</div>}
                  <div className="download-btns">
                    <button className="btn-gold" style={{ minWidth: "200px" }} onClick={() => downloadFile("docx")} disabled={downloadingDocx}>
                      {downloadingDocx ? "Generating…" : "⬇ Download DOCX"}
                    </button>
                    <button className="btn-teal" style={{ minWidth: "200px" }} onClick={() => downloadFile("pdf")} disabled={downloadingPdf}>
                      {downloadingPdf ? "Generating…" : "⬇ Download PDF"}
                    </button>
                  </div>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "16px" }}>
                    <strong style={{ color: "var(--text)" }}>DOCX recommended</strong> for Workday, Taleo, and SuccessFactors. PDF is preferred for Greenhouse.
                  </p>

                  {/* Start over */}
                  <div style={{ marginTop: "40px", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <button className="btn-outline" onClick={() => { setScreen("input"); setResult(null); setFile(null); setJdText(""); setError(""); }}>
                      ← Analyze a Different Resume
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

// Client-side platform profile reference (preferred_format only)
const ATS_PROFILES_CLIENT: Record<ATSPlatform, { preferred_format: string }> = {
  workday: { preferred_format: "DOCX" },
  taleo: { preferred_format: "DOCX" },
  icims: { preferred_format: "PDF / DOCX" },
  greenhouse: { preferred_format: "PDF" },
  lever: { preferred_format: "PDF / DOCX" },
  successfactors: { preferred_format: "DOCX" },
};
