"use client";

import { motion } from "framer-motion";
import { Wrench } from "lucide-react";
import type { Skill } from "@/types/portfolio";

const categoryColors: Record<string, { bg: string; text: string; bar: string }> = {
  Programming: { bg: "bg-purple-500/10", text: "text-purple-300", bar: "bg-purple-500" },
  Frontend: { bg: "bg-cyan-500/10", text: "text-cyan-300", bar: "bg-cyan-500" },
  Backend: { bg: "bg-green-500/10", text: "text-green-300", bar: "bg-green-500" },
  Database: { bg: "bg-amber-500/10", text: "text-amber-300", bar: "bg-amber-500" },
  DevOps: { bg: "bg-red-500/10", text: "text-red-300", bar: "bg-red-500" },
  Tools: { bg: "bg-pink-500/10", text: "text-pink-300", bar: "bg-pink-500" },
  default: { bg: "bg-purple-500/10", text: "text-purple-300", bar: "bg-purple-500" },
};

export default function SkillsSection({ skills }: { skills: Skill[] }) {
  if (!skills.length) return null;

  const grouped = skills.reduce(
    (acc, skill) => {
      const cat = skill.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    },
    {} as Record<string, Skill[]>
  );

  return (
    <section className="py-16 px-6 bg-[var(--bg-secondary)]/50">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold mb-10 flex items-center gap-3"
        >
          <Wrench className="w-7 h-7 text-green-400" />
          Skills
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(grouped).map(([category, catSkills], i) => {
            const colors = categoryColors[category] || categoryColors.default;
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <h3 className={`text-sm font-semibold uppercase tracking-wider ${colors.text} mb-4`}>
                  {category}
                </h3>
                <div className="space-y-3">
                  {catSkills.map((skill) => (
                    <div key={skill.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[var(--text-primary)]">
                          {skill.name}
                        </span>
                        <span className="text-[var(--text-muted)]">
                          {skill.proficiency}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--bg-card)]">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.proficiency}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={`h-full rounded-full ${colors.bar}`}
                          style={{ opacity: 0.8 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
