"use client";

import { Skill } from "@/types/portfolio";

interface Props {
  skills: Skill[];
}

export default function SkillsPanel({ skills }: Props) {
  // Group skills by category
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  const categoryColors: Record<string, string> = {
    Programming: "purple",
    Frontend: "cyan",
    Backend: "green",
    Database: "yellow",
    DevOps: "orange",
    Tools: "blue",
    Other: "neutral",
  };

  const getColor = (cat: string) => categoryColors[cat] || "purple";

  return (
    <div className="h-full w-full relative bg-neutral-900 select-none overflow-hidden">
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute inset-0 p-4 flex flex-col font-mono text-neutral-100 gap-3">
        <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 flex-shrink-0">Skills</h1>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {Object.entries(grouped).map(([category, catSkills]) => {
            const color = getColor(category);
            return (
              <div key={category}>
                <p
                  className={`text-xs font-bold uppercase tracking-wider mb-1.5 text-${color}-400`}
                >
                  {category}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {catSkills.map((skill, i) => (
                    <div key={skill.id || i} className="group relative">
                      <span
                        className={`px-2 py-0.5 rounded text-xs bg-${color}-500/10 border border-${color}-500/30 text-${color}-300 hover:bg-${color}-500/20 transition-colors cursor-default`}
                      >
                        {skill.name}
                      </span>
                      {/* Proficiency tooltip */}
                      {skill.proficiency > 0 && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-xs text-neutral-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {skill.proficiency}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {skills.length === 0 && (
            <p className="text-neutral-500 text-sm text-center mt-8">No skills data</p>
          )}
        </div>
      </div>
    </div>
  );
}
