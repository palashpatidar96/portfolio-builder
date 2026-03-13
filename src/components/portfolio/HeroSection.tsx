"use client";

import { motion } from "framer-motion";
import { MapPin, Mail, Linkedin, Github, Globe, Download } from "lucide-react";
import type { UserProfile } from "@/types/portfolio";

export default function HeroSection({ profile }: { profile: UserProfile }) {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Avatar */}
          <div className="w-28 h-28 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 p-[3px] mx-auto mb-6">
            <div className="w-full h-full rounded-full bg-[var(--bg-primary)] flex items-center justify-center text-4xl font-bold gradient-text">
              {profile.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-3">
            {profile.full_name}
          </h1>
          <p className="text-xl md:text-2xl gradient-text font-semibold mb-4">
            {profile.title}
          </p>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto mb-8 text-lg leading-relaxed">
            {profile.summary}
          </p>

          {/* Info badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {profile.location && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-sm text-[var(--text-secondary)]">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                {profile.location}
              </span>
            )}
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:border-purple-500/50 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                {profile.email}
              </a>
            )}
          </div>

          {/* Social links */}
          <div className="flex justify-center gap-3">
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-purple-400 hover:border-purple-500/50 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-purple-400 hover:border-purple-500/50 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            )}
            {profile.website_url && (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-purple-400 hover:border-purple-500/50 transition-colors"
              >
                <Globe className="w-5 h-5" />
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
