"use client";

import { useState } from "react";
import { Project } from "@/types/portfolio";

interface Props {
  projects: Project[];
}

export default function ProjectsPanel({ projects }: Props) {
  const [selected, setSelected] = useState<Project | null>(null);

  if (selected) {
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
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setSelected(null)}
              className="text-xs px-3 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <h2 className="text-lg md:text-xl font-bold text-purple-400 truncate">{selected.name}</h2>
          </div>

          <p className="text-sm text-neutral-300 leading-relaxed overflow-y-auto">
            {selected.description}
          </p>

          {/* Tech stack */}
          <div className="flex-shrink-0">
            <p className="text-xs text-neutral-500 mb-2 uppercase tracking-wider">Tech Stack</p>
            <div className="flex flex-wrap gap-1.5">
              {selected.tech_stack.map((tech, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-xs bg-purple-500/10 border border-purple-500/30 text-purple-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-3 flex-shrink-0">
            {selected.github_url && (
              <a
                href={selected.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm text-neutral-300 hover:border-neutral-500 hover:text-white transition-all"
              >
                GitHub →
              </a>
            )}
            {selected.url && (
              <a
                href={selected.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-cyan-600/20 border border-cyan-500/40 text-sm text-cyan-300 hover:bg-cyan-600/30 transition-all"
              >
                Live Demo →
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl md:text-3xl font-bold text-purple-400 flex-shrink-0">Projects</h1>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {projects.length === 0 ? (
            <p className="text-neutral-500 text-sm text-center mt-8">No projects data</p>
          ) : (
            projects.map((project, i) => (
              <button
                key={project.id || i}
                onClick={() => setSelected(project)}
                className="w-full text-left p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-purple-500/50 hover:bg-neutral-800 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    {project.name}
                  </p>
                  <span className="text-neutral-600 group-hover:text-purple-400 text-xs flex-shrink-0">→</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.tech_stack.slice(0, 3).map((tech, j) => (
                    <span
                      key={j}
                      className="px-1.5 py-0.5 rounded text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.tech_stack.length > 3 && (
                    <span className="px-1.5 py-0.5 rounded text-xs text-neutral-500">
                      +{project.tech_stack.length - 3}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
