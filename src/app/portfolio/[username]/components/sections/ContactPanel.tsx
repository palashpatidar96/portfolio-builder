"use client";

import { UserProfile } from "@/types/portfolio";

interface Props {
  profile: UserProfile;
  onShowAbout: () => void;
  onOpenChat: () => void;
}

export default function ContactPanel({ profile, onShowAbout, onOpenChat }: Props) {
  return (
    <div className="h-full w-full relative bg-neutral-900 select-none overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute inset-0 p-4 flex flex-col items-center justify-between font-mono text-neutral-100 gap-4">
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <button
            onClick={onShowAbout}
            className="text-xs md:text-sm px-3 py-1 rounded-lg bg-purple-600/30 border border-purple-500/50 text-purple-300 hover:bg-purple-600/50 transition-colors"
          >
            ← About
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-cyan-400">Contact</h1>
        </div>

        {/* Glow avatar placeholder */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/30">
          📡
        </div>

        <p className="text-sm md:text-base text-neutral-300 text-center">
          Let&apos;s connect! I&apos;m open to opportunities.
        </p>

        {/* Contact links */}
        <div className="w-full space-y-3">
          <a
            href={`mailto:${profile.email}`}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50 hover:border-cyan-500/60 hover:bg-neutral-800 transition-all group"
          >
            <span className="text-lg">✉️</span>
            <div>
              <p className="text-xs text-neutral-500 group-hover:text-neutral-400">Email</p>
              <p className="text-sm text-cyan-300 truncate">{profile.email}</p>
            </div>
          </a>

          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50 hover:border-blue-500/60 hover:bg-neutral-800 transition-all group"
            >
              <span className="text-lg">💼</span>
              <div>
                <p className="text-xs text-neutral-500 group-hover:text-neutral-400">LinkedIn</p>
                <p className="text-sm text-blue-300">View Profile</p>
              </div>
            </a>
          )}

          {profile.github_url && (
            <a
              href={profile.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50 hover:border-neutral-500/60 hover:bg-neutral-800 transition-all group"
            >
              <span className="text-lg">🐙</span>
              <div>
                <p className="text-xs text-neutral-500 group-hover:text-neutral-400">GitHub</p>
                <p className="text-sm text-neutral-300">View Projects</p>
              </div>
            </a>
          )}
        </div>

        {/* AI chat CTA */}
        <button
          onClick={onOpenChat}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20"
        >
          🤖 Chat with AI about me
        </button>
      </div>
    </div>
  );
}
