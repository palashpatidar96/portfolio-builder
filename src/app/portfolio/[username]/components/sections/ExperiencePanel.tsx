"use client";

import { Experience } from "@/types/portfolio";

interface Props {
  experiences: Experience[];
}

export default function ExperiencePanel({ experiences }: Props) {
  return (
    <div className="h-full w-full relative bg-neutral-900 select-none overflow-hidden">
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,92,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute inset-0 p-4 flex flex-col font-mono text-neutral-100 gap-3">
        <h1 className="text-2xl md:text-3xl font-bold text-purple-400 flex-shrink-0">Experience</h1>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
          {experiences.length === 0 ? (
            <p className="text-neutral-500 text-sm text-center mt-8">No experience data</p>
          ) : (
            experiences.map((exp, i) => (
              <div
                key={exp.id || i}
                className="relative pl-4 border-l-2 border-purple-500/40 hover:border-purple-400/70 transition-colors"
              >
                <div className="absolute -left-1.5 top-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-400/50" />
                <div className="mb-0.5">
                  <span className="text-sm md:text-base font-bold text-white">{exp.role}</span>
                  <span className="text-xs md:text-sm text-cyan-400 ml-2">@ {exp.company}</span>
                </div>
                <p className="text-xs text-neutral-500 mb-1">
                  {exp.start_date} — {exp.is_current ? "Present" : exp.end_date || ""}
                </p>
                <p className="text-xs md:text-sm text-neutral-300 leading-relaxed line-clamp-3">
                  {exp.description}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
