"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Check, Copy, ArrowRight, FileText, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";

type Step = "upload" | "processing" | "success" | "error";

const PROCESSING_STEPS = [
  "Extracting text from resume...",
  "Parsing work experience...",
  "Identifying skills...",
  "Analyzing projects...",
  "Building your 3D portfolio...",
];

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [processingStep, setProcessingStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);

  const acceptedTypes = [".pdf", ".txt", ".doc", ".docx"];

  const isValidFile = (f: File) => {
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    return acceptedTypes.includes(ext);
  };

  const handleFile = useCallback((f: File) => {
    if (!isValidFile(f)) {
      setErrorMsg("Please upload a PDF, TXT, DOC, or DOCX file.");
      return;
    }
    setFile(f);
    setErrorMsg("");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
    const y = -((e.clientX - rect.left) / rect.width - 0.5) * 10;
    setTilt({ x, y });
  };

  const handleCardMouseLeave = () => setTilt({ x: 0, y: 0 });

  const handleUpload = async () => {
    if (!file) return;
    setStep("processing");
    setProcessingStep(0);

    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => {
        if (prev >= PROCESSING_STEPS.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 900);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();

      clearInterval(stepInterval);
      setProcessingStep(PROCESSING_STEPS.length);

      await new Promise((r) => setTimeout(r, 400));

      if (json.success && json.profileUrl) {
        setPortfolioUrl(json.profileUrl);
        setStep("success");
      } else {
        setErrorMsg(json.error || "Something went wrong.");
        setStep("error");
      }
    } catch {
      clearInterval(stepInterval);
      setErrorMsg("Network error. Please try again.");
      setStep("error");
    }
  };

  const copyUrl = () => {
    const full = `${window.location.origin}${portfolioUrl}`;
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stepIndex = { upload: 0, processing: 1, success: 2, error: 0 }[step];

  return (
    <div
      style={{
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "var(--sans)",
        minHeight: "100vh",
      }}
      className="bg-grid"
    >
      <style>{`
        @keyframes cardFlip {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(232, 197, 71, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(232, 197, 71, 0); }
          100% { box-shadow: 0 0 0 0 rgba(232, 197, 71, 0); }
        }
      `}</style>

      {/* Navbar */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(240,236,226,0.05)",
          background: "rgba(10,10,10,0.8)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 1.5rem",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--text)",
              textDecoration: "none",
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "var(--accent, #e8c547)" }}>port.</span>folio
          </Link>
          <Link
            href="/portfolio/demo"
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              textDecoration: "none",
              letterSpacing: "0.02em",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            Already have a portfolio? Sign In
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main
        style={{
          maxWidth: 512,
          margin: "0 auto",
          padding: "8rem 1.5rem 6rem",
        }}
      >
        {/* Page header */}
        <motion.div
          style={{ textAlign: "center", marginBottom: "2.5rem" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="section-label"
            style={{ justifyContent: "center", marginBottom: "1rem" }}
          >
            Upload Your Resume
          </div>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--text)",
              marginBottom: "0.75rem",
            }}
          >
            Build Your{" "}
            <em
              style={{
                color: "var(--accent)",
                fontStyle: "italic",
              }}
            >
              Portfolio
            </em>
          </h1>
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.95rem",
              color: "var(--text-muted)",
              lineHeight: 1.6,
            }}
          >
            Upload your resume and get a stunning editorial portfolio in seconds.
          </p>
        </motion.div>

        {/* Step Progress Indicator */}
        <motion.div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            marginBottom: "2.5rem",
            gap: 0,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {["Upload", "Processing", "Ready!"].map((label, i) => {
            const isActive = i === stepIndex;
            const isDone = i < stepIndex;

            return (
              <div key={label} style={{ display: "flex", alignItems: "flex-start" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--mono)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      transition: "all 0.3s ease",
                      borderRadius: "50%",
                      background: isDone
                        ? "var(--accent)"
                        : isActive
                        ? "transparent"
                        : "var(--bg-card)",
                      border: isDone
                        ? "2px solid var(--accent)"
                        : isActive
                        ? "2px solid var(--accent)"
                        : "2px solid rgba(240,236,226,0.12)",
                      color: isDone
                        ? "var(--bg)"
                        : isActive
                        ? "var(--accent)"
                        : "var(--text-muted)",
                    }}
                  >
                    {isDone ? <Check size={14} /> : i + 1}
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.65rem",
                      color: isDone
                        ? "var(--accent)"
                        : isActive
                        ? "var(--accent)"
                        : "var(--text-muted)",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    style={{
                      width: 56,
                      height: 1,
                      marginTop: 15,
                      background: isDone
                        ? "var(--accent)"
                        : "rgba(240,236,226,0.1)",
                      transition: "background 0.5s ease",
                    }}
                  />
                )}
              </div>
            );
          })}
        </motion.div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {/* STEP 1: Upload */}
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{
                transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: "transform 0.15s ease-out",
              }}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid rgba(240,236,226,0.08)",
                  padding: "2rem",
                  borderRadius: "16px",
                }}
              >
                {/* Drop zone */}
                <div
                  style={{
                    border: `2px dashed ${
                      dragging
                        ? "var(--accent)"
                        : file
                        ? "var(--teal)"
                        : "rgba(240,236,226,0.15)"
                    }`,
                    background: dragging
                      ? "rgba(232,197,71,0.04)"
                      : file
                      ? "rgba(71,200,176,0.04)"
                      : "transparent",
                    padding: "2.5rem 1.5rem",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    borderRadius: "12px",
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    style={{ display: "none" }}
                    onChange={(e) =>
                      e.target.files?.[0] && handleFile(e.target.files[0])
                    }
                  />

                  {file ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.6rem",
                      }}
                    >
                      <FileText
                        size={40}
                        style={{ color: "var(--teal)" }}
                      />
                      <p
                        style={{
                          fontFamily: "var(--sans)",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          color: "var(--teal)",
                        }}
                      >
                        {file.name}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {(file.size / 1024).toFixed(0)} KB &middot; Click to change
                      </p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <Upload
                        size={48}
                        style={{ color: "var(--accent)" }}
                        strokeWidth={1.5}
                      />
                      <h3
                        style={{
                          fontFamily: "var(--serif)",
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          color: "var(--text)",
                          margin: 0,
                        }}
                      >
                        {dragging ? "Drop it here!" : "Drop your resume here"}
                      </h3>
                      <p
                        style={{
                          fontFamily: "var(--sans)",
                          fontSize: "0.875rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        or{" "}
                        <span
                          style={{
                            color: "var(--accent)",
                            textDecoration: "underline",
                            cursor: "pointer",
                          }}
                        >
                          browse files
                        </span>
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.65rem",
                          color: "var(--text-muted)",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }}
                      >
                        PDF &middot; DOC &middot; DOCX &middot; TXT &middot; Max 5MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Feature chips */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    justifyContent: "center",
                    marginTop: "1.25rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  {["⚡ AI-Powered", "✦ Editorial Template", "⟐ 3D View Option"].map(
                    (chip) => (
                      <span
                        key={chip}
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.65rem",
                          color: "var(--accent)",
                          border: "1px solid rgba(232,197,71,0.3)",
                          borderRadius: "20px",
                          padding: "0.25rem 0.6rem",
                          background: "rgba(232,197,71,0.04)",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {chip}
                      </span>
                    )
                  )}
                </div>

                {/* Error message */}
                {errorMsg && (
                  <p
                    style={{
                      fontFamily: "var(--sans)",
                      fontSize: "0.8rem",
                      color: "var(--coral)",
                      textAlign: "center",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {errorMsg}
                  </p>
                )}

                {/* CTA Button */}
                <button
                  onClick={handleUpload}
                  disabled={!file}
                  style={{
                    width: "100%",
                    padding: "0.9rem 1.5rem",
                    background: file ? "var(--accent)" : "rgba(240,236,226,0.06)",
                    color: file ? "var(--bg)" : "var(--text-muted)",
                    fontFamily: "var(--sans)",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    border: "none",
                    cursor: file ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "all 0.2s ease",
                    borderRadius: "10px",
                  }}
                  onMouseEnter={(e) => {
                    if (file) {
                      e.currentTarget.style.opacity = "0.88";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 24px rgba(232,197,71,0.2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Generate My Portfolio
                  <ArrowRight size={15} />
                </button>

                {/* Demo link */}
                <p
                  style={{
                    textAlign: "center",
                    marginTop: "1rem",
                    fontFamily: "var(--sans)",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <Link
                    href="/portfolio/demo"
                    style={{
                      color: "var(--text-muted)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--accent)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--text-muted)")
                    }
                  >
                    View demo &rarr;
                  </Link>
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Processing */}
          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
            >
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid rgba(240,236,226,0.08)",
                  padding: "2.5rem 2rem",
                  textAlign: "center",
                }}
              >
                {/* CSS 3D card flip */}
                <div
                  style={{
                    width: 80,
                    height: 112,
                    perspective: 600,
                    margin: "0 auto 2rem",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      transformStyle: "preserve-3d",
                      animation: "cardFlip 3s linear infinite",
                    }}
                  >
                    {/* Front */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        background:
                          "linear-gradient(135deg, var(--accent), var(--teal))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--serif)",
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "var(--bg)",
                      }}
                    >
                      AC
                    </div>
                    {/* Back */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        background: "var(--bg-card)",
                        border: "1px solid rgba(240,236,226,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--mono)",
                        fontSize: "0.6rem",
                        color: "var(--accent)",
                      }}
                    >
                      portfolio
                    </div>
                  </div>
                </div>

                <h2
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Crafting your portfolio...
                </h2>
                <p
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    marginBottom: "2rem",
                  }}
                >
                  This usually takes 10&ndash;20 seconds
                </p>

                {/* Checklist */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    textAlign: "left",
                    marginBottom: "1.75rem",
                  }}
                >
                  {PROCESSING_STEPS.map((s, i) => {
                    const isDone = i < processingStep;
                    const isCurrent = i === processingStep;
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: isDone
                              ? "var(--accent)"
                              : isCurrent
                              ? "transparent"
                              : "rgba(240,236,226,0.06)",
                            border: isDone
                              ? "none"
                              : isCurrent
                              ? "2px solid var(--accent)"
                              : "2px solid rgba(240,236,226,0.12)",
                            borderRadius: "50%",
                            animation: isCurrent
                              ? "pulseRing 1.5s ease-out infinite"
                              : "none",
                            transition: "all 0.3s ease",
                          }}
                        >
                          {isDone ? (
                            <Check
                              size={10}
                              style={{ color: "var(--bg)", strokeWidth: 3 }}
                            />
                          ) : isCurrent ? (
                            <Loader2
                              size={10}
                              style={{
                                color: "var(--accent)",
                                animation: "spin 1s linear infinite",
                              }}
                            />
                          ) : null}
                        </div>
                        <span
                          style={{
                            fontFamily: "var(--sans)",
                            fontSize: "0.85rem",
                            color: isDone
                              ? "var(--accent)"
                              : isCurrent
                              ? "var(--text)"
                              : "var(--text-muted)",
                            transition: "color 0.3s ease",
                          }}
                        >
                          {s}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    width: "100%",
                    height: 2,
                    background: "rgba(240,236,226,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      background: "var(--accent)",
                      width: `${(processingStep / PROCESSING_STEPS.length) * 100}%`,
                      boxShadow: "0 0 8px rgba(232,197,71,0.5)",
                      transition: "width 0.7s ease",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Success */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
            >
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid rgba(232,197,71,0.18)",
                  padding: "2.5rem 2rem",
                  textAlign: "center",
                }}
              >
                {/* Checkmark circle */}
                <motion.div
                  style={{
                    width: 64,
                    height: 64,
                    background: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.5rem",
                  }}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, type: "spring", bounce: 0.55 }}
                >
                  <Check
                    size={28}
                    style={{ color: "var(--bg)", strokeWidth: 2.5 }}
                  />
                </motion.div>

                <h2
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.7rem",
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Your Portfolio is Live!
                </h2>
                <p
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: "0.875rem",
                    color: "var(--text-muted)",
                    marginBottom: "1.75rem",
                    lineHeight: 1.6,
                  }}
                >
                  Share this link with recruiters and colleagues.
                </p>

                {/* URL card */}
                <div
                  style={{
                    background: "#111",
                    border: "1px solid var(--accent)",
                    padding: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.75rem",
                      color: "var(--accent)",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      textAlign: "left",
                    }}
                  >
                    {typeof window !== "undefined"
                      ? `${window.location.origin}${portfolioUrl}`
                      : portfolioUrl}
                  </p>
                  <button
                    onClick={copyUrl}
                    style={{
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.4rem 0.8rem",
                      background: "transparent",
                      border: `1px solid ${copied ? "var(--teal)" : "rgba(232,197,71,0.4)"}`,
                      color: copied ? "var(--teal)" : "var(--accent)",
                      fontFamily: "var(--mono)",
                      fontSize: "0.7rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      borderRadius: 2,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {copied ? (
                      <>
                        <Check size={12} />
                        Copied ✓
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                {/* CTA buttons */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  <a
                    href={portfolioUrl}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      padding: "0.9rem 1.5rem",
                      background: "var(--accent)",
                      color: "var(--bg)",
                      fontFamily: "var(--sans)",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.88";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 24px rgba(232,197,71,0.22)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    View Your Portfolio
                    <ArrowRight size={15} />
                  </a>
                  <a
                    href={`${portfolioUrl}?view=3d`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      padding: "0.9rem 1.5rem",
                      background: "transparent",
                      border: "1px solid rgba(240,236,226,0.15)",
                      color: "var(--text)",
                      fontFamily: "var(--sans)",
                      fontWeight: 500,
                      fontSize: "0.8rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent)";
                      e.currentTarget.style.color = "var(--accent)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(240,236,226,0.15)";
                      e.currentTarget.style.color = "var(--text)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <ExternalLink size={14} />
                    ⟐ Switch to 3D View
                  </a>
                </div>

                {/* Upload another */}
                <button
                  onClick={() => {
                    setStep("upload");
                    setFile(null);
                    setPortfolioUrl("");
                    setCopied(false);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontFamily: "var(--sans)",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--accent)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--text-muted)")
                  }
                >
                  Upload another resume
                </button>
              </div>
            </motion.div>
          )}

          {/* Error state */}
          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid rgba(232,93,74,0.3)",
                  padding: "2.5rem 2rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    background: "rgba(232,93,74,0.1)",
                    border: "1px solid rgba(232,93,74,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.25rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "1.25rem",
                      color: "var(--coral)",
                    }}
                  >
                    ✕
                  </span>
                </div>

                <h2
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Something went wrong
                </h2>
                <p
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: "0.875rem",
                    color: "var(--text-muted)",
                    marginBottom: "1.75rem",
                    lineHeight: 1.6,
                  }}
                >
                  {errorMsg}
                </p>

                <button
                  onClick={() => {
                    setStep("upload");
                    setFile(null);
                  }}
                  style={{
                    padding: "0.85rem 2rem",
                    background: "var(--accent)",
                    color: "var(--bg)",
                    fontFamily: "var(--sans)",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.88";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
