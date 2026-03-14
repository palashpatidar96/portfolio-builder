"use client";

import { UserProfile } from "@/types/portfolio";

interface Props {
  profile: UserProfile;
  onShowContact: () => void;
}

export default function AboutPanel({ profile, onShowContact }: Props) {
  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="h-full w-full relative bg-neutral-900 select-none overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute inset-0 p-4 flex flex-col items-center justify-between font-mono text-neutral-100 gap-3">
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-purple-400">About Me</h1>
          <button
            onClick={onShowContact}
            className="text-xs md:text-sm px-3 py-1 rounded-lg bg-purple-600/30 border border-purple-500/50 text-purple-300 hover:bg-purple-600/50 transition-colors"
          >
            Contact →
          </button>
        </div>

        {/* Avatar */}
        <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-2xl md:text-4xl font-bold text-white shadow-lg shadow-purple-500/30 flex-shrink-0">
          {initials}
        </div>

        {/* Name + title */}
        <div className="text-center">
          <p className="text-xl md:text-2xl font-bold text-white">{profile.full_name}</p>
          <p className="text-sm md:text-base text-cyan-400 mt-1">{profile.title}</p>
        </div>

        {/* Summary */}
        <p className="text-xs md:text-sm text-neutral-300 text-center leading-relaxed overflow-y-auto max-h-24 px-2">
          {profile.summary}
        </p>

        {/* Location + email */}
        <div className="w-full space-y-1.5">
          {profile.location && (
            <div className="flex items-center gap-2 text-xs md:text-sm text-neutral-400">
              <span className="text-purple-400">📍</span>
              <span>{profile.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs md:text-sm text-neutral-400">
            <span className="text-cyan-400">✉️</span>
            <a href={`mailto:${profile.email}`} className="hover:text-cyan-300 transition-colors truncate">
              {profile.email}
            </a>
          </div>
        </div>

        {/* Social links */}
        <div className="flex gap-3 flex-wrap justify-center">
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs hover:bg-blue-600/40 transition-colors"
            >
              LinkedIn
            </a>
          )}
          {profile.github_url && (
            <a
              href={profile.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-neutral-700/40 border border-neutral-500/40 text-neutral-300 text-xs hover:bg-neutral-700/60 transition-colors"
            >
              GitHub
            </a>
          )}
          {profile.website_url && (
            <a
              href={profile.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 text-xs hover:bg-cyan-600/40 transition-colors"
            >
              Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
