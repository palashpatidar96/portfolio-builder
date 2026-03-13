"use client";

import HeroSection from "@/components/portfolio/HeroSection";
import ExperienceSection from "@/components/portfolio/ExperienceSection";
import EducationSection from "@/components/portfolio/EducationSection";
import ProjectsSection from "@/components/portfolio/ProjectsSection";
import SkillsSection from "@/components/portfolio/SkillsSection";
import ChatBot from "@/components/chatbot/ChatBot";
import type {
  UserProfile,
  Experience,
  Education,
  Project,
  Skill,
} from "@/types/portfolio";
import { Sparkles } from "lucide-react";
import Link from "next/link";

interface PortfolioClientProps {
  data: {
    profile: UserProfile;
    experiences: Experience[];
    education: Education[];
    projects: Project[];
    skills: Skill[];
  };
}

export default function PortfolioClient({ data }: PortfolioClientProps) {
  const { profile, experiences, education, projects, skills } = data;

  return (
    <div className="min-h-screen bg-grid">
      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-purple-500/20 animate-float"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 4) * 20}%`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-40 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">
              PortfolioAI
            </span>
          </Link>
          <span className="text-sm text-[var(--text-muted)]">
            {profile.full_name}&apos;s Portfolio
          </span>
        </div>
      </nav>

      <main className="pt-14">
        <HeroSection profile={profile} />
        <ExperienceSection experiences={experiences} />
        <SkillsSection skills={skills} />
        <ProjectsSection projects={projects} />
        <EducationSection education={education} />
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[var(--border-color)] text-center">
        <p className="text-[var(--text-muted)] text-sm">
          Built with{" "}
          <Link href="/" className="gradient-text hover:underline">
            PortfolioAI
          </Link>{" "}
          — Free & Open Source
        </p>
      </footer>

      {/* Chatbot */}
      <ChatBot username={profile.username} personName={profile.full_name} />
    </div>
  );
}
