"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";
import Link from "next/link";

type Step = "upload" | "processing" | "success" | "error";

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("upload");
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith(".txt")) {
      setError("Please upload a PDF or text file.");
      setStep("error");
      return;
    }

    setFileName(file.name);
    setStep("processing");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setProfileUrl(data.profileUrl);
        setStep("success");
      } else {
        setError(data.error || "Upload failed. Please try again.");
        setStep("error");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
      setStep("error");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="min-h-screen bg-grid flex items-center justify-center px-6">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">
              PortfolioAI
            </span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create Your Portfolio</h1>
          <p className="text-[var(--text-secondary)]">
            Upload your resume and we&apos;ll build your portfolio in seconds
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Upload Step */}
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div
                className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer ${
                  dragActive
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-[var(--border-color)] bg-[var(--bg-card)] hover:border-purple-500/50 hover:bg-[var(--bg-hover)]"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleInputChange}
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-purple-400" />
                </div>

                <h3 className="text-lg font-semibold mb-2">
                  Drop your resume here
                </h3>
                <p className="text-[var(--text-secondary)] text-sm mb-4">
                  or click to browse files
                </p>
                <p className="text-[var(--text-muted)] text-xs">
                  Supports PDF, TXT, DOC, DOCX
                </p>
              </div>

              {/* Demo link */}
              <div className="mt-6 text-center">
                <p className="text-[var(--text-muted)] text-sm mb-3">
                  Want to see how it looks first?
                </p>
                <Link
                  href="/portfolio/demo"
                  className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
                >
                  View Demo Portfolio <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Processing Step */}
          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-12 text-center"
            >
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Building your portfolio...
              </h3>
              <p className="text-[var(--text-secondary)] text-sm mb-4">
                AI is analyzing{" "}
                <span className="text-purple-400">{fileName}</span>
              </p>
              <div className="space-y-2 text-left max-w-xs mx-auto">
                {[
                  "Extracting resume data...",
                  "Parsing experience & skills...",
                  "Generating portfolio...",
                ].map((text, i) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 1.5 }}
                    className="flex items-center gap-2 text-sm text-[var(--text-muted)]"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    {text}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Success Step */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-2xl border border-green-500/30 bg-[var(--bg-card)] p-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Portfolio Created!
              </h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6">
                Your portfolio is ready to share with the world
              </p>

              <div className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] mb-6">
                <code className="text-sm text-purple-400">
                  {typeof window !== "undefined"
                    ? window.location.origin
                    : ""}
                  {profileUrl}
                </code>
              </div>

              <div className="flex gap-3 justify-center">
                <Link
                  href={profileUrl}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  View Portfolio <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}${profileUrl}`
                    );
                  }}
                  className="px-6 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] font-medium hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Copy Link
                </button>
              </div>
            </motion.div>
          )}

          {/* Error Step */}
          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-2xl border border-red-500/30 bg-[var(--bg-card)] p-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Something went wrong
              </h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6">
                {error}
              </p>
              <button
                onClick={() => {
                  setStep("upload");
                  setError("");
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
