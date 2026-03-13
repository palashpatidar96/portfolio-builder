"use client";

import { motion } from "framer-motion";
import { GraduationCap, Calendar } from "lucide-react";
import type { Education } from "@/types/portfolio";

export default function EducationSection({
  education,
}: {
  education: Education[];
}) {
  if (!education.length) return null;

  return (
    <section className="py-16 px-6 bg-[var(--bg-secondary)]/50">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold mb-10 flex items-center gap-3"
        >
          <GraduationCap className="w-7 h-7 text-cyan-400" />
          Education
        </motion.h2>

        <div className="grid gap-6">
          {education.map((edu, i) => (
            <motion.div
              key={edu.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] card-hover"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{edu.degree}</h3>
                  <p className="text-cyan-400 font-medium">
                    {edu.institution}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                  <Calendar className="w-3.5 h-3.5" />
                  {edu.start_date} - {edu.end_date || "Present"}
                </span>
              </div>
              <p className="text-[var(--text-secondary)] text-sm">
                {edu.field_of_study}
              </p>
              {edu.description && (
                <p className="text-[var(--text-muted)] text-sm mt-2">
                  {edu.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
