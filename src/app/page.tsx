"use client";

import { motion } from "framer-motion";
import {
  Upload,
  Bot,
  Sparkles,
  Globe,
  ArrowRight,
  Github,
  Zap,
  Shield,
  Code2,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Upload,
    title: "Upload Resume",
    description:
      "Drop your PDF resume and our AI extracts all your details automatically.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: Bot,
    title: "AI Chatbot",
    description:
      "Visitors can ask questions about your experience via an intelligent chatbot.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Sparkles,
    title: "Auto-Generated",
    description:
      "Beautiful dark-themed portfolio generated instantly from your resume data.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Globe,
    title: "Shareable Link",
    description:
      "Get a unique portfolio URL to share with recruiters and colleagues.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
];

const techStack = [
  { name: "Next.js", icon: Code2 },
  { name: "Hugging Face", icon: Zap },
  { name: "Supabase", icon: Shield },
  { name: "Open Source", icon: Github },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-grid">
      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-purple-500/20 animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">
              PortfolioAI
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/onboarding"
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm mb-8">
              <Zap className="w-4 h-4" />
              100% Free & Open Source
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Your Portfolio,{" "}
              <span className="gradient-text">AI-Powered</span>
            </h1>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
              Upload your resume, get a stunning portfolio with an intelligent
              chatbot that lets recruiters ask about your experience in
              real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/onboarding"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload Resume
              </Link>
              <Link
                href="/portfolio/demo"
                className="px-8 py-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] font-semibold text-lg hover:bg-[var(--bg-hover)] transition-all flex items-center justify-center gap-2"
              >
                <Globe className="w-5 h-5" />
                View Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-3xl font-bold text-center mb-12"
          >
            How It <span className="gradient-text">Works</span>
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] card-hover"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-16 px-6 border-t border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[var(--text-muted)] text-sm mb-6 uppercase tracking-wider">
            Powered By
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="flex items-center gap-2 text-[var(--text-secondary)]"
              >
                <tech.icon className="w-5 h-5" />
                <span className="font-medium">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto text-center text-[var(--text-muted)] text-sm">
          PortfolioAI — Free, Open Source, AI-Powered Portfolios
        </div>
      </footer>
    </div>
  );
}
