"use client";

import { motion } from "framer-motion";
import { Briefcase, Calendar } from "lucide-react";
import type { Experience } from "@/types/portfolio";

export default function ExperienceSection({
  experiences,
}: {
  experiences: Experience[];
}) {
  if (!experiences.length) return null;

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold mb-10 flex items-center gap-3"
        >
          <Briefcase className="w-7 h-7 text-purple-400" />
          Experience
        </motion.h2>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/50 via-cyan-500/30 to-transparent" />

          <div className="space-y-8">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-12"
              >
                {/* Timeline dot */}
                <div className="absolute left-[12px] top-2 w-[15px] h-[15px] rounded-full bg-[var(--bg-primary)] border-2 border-purple-500 z-10" />

                <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] card-hover">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{exp.role}</h3>
                      <p className="text-purple-400 font-medium">
                        {exp.company}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                      <Calendar className="w-3.5 h-3.5" />
                      {exp.start_date} - {exp.is_current ? "Present" : exp.end_date}
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
