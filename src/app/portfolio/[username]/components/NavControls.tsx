"use client";

interface Props {
  onReset: () => void;
  name: string;
}

const sections = [
  { label: "About", hint: "Phone" },
  { label: "Experience", hint: "Jackbox" },
  { label: "Skills", hint: "Arcade" },
  { label: "Projects", hint: "Vending Machine" },
  { label: "Contact", hint: "Phone" },
];

export default function NavControls({ onReset, name }: Props) {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 font-mono">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-3 flex items-start justify-between pointer-events-auto">
        {/* Home reset button */}
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-2 bg-neutral-900/70 backdrop-blur-sm border border-purple-500/40 rounded-xl text-purple-300 hover:bg-neutral-900/90 hover:border-purple-400/60 transition-all text-sm"
          title="Reset camera (Esc)"
        >
          <span>🏠</span>
          <span className="hidden md:inline">Home</span>
        </button>

        {/* Portfolio owner name */}
        <div className="px-4 py-2 bg-neutral-900/70 backdrop-blur-sm border border-neutral-700/50 rounded-xl">
          <p className="text-xs text-neutral-500 text-center">Portfolio</p>
          <p className="text-sm text-white font-bold">{name}</p>
        </div>

        {/* Hint */}
        <div className="px-3 py-2 bg-neutral-900/70 backdrop-blur-sm border border-neutral-700/40 rounded-xl text-xs text-neutral-500 hidden md:block">
          <p>Click objects to explore</p>
          <p>ESC to reset view</p>
        </div>
      </div>

      {/* Bottom section labels */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 flex-wrap justify-center pointer-events-auto px-4">
        {sections.map(({ label, hint }) => (
          <div
            key={label}
            className="group relative px-3 py-1.5 bg-neutral-900/70 backdrop-blur-sm border border-neutral-700/40 rounded-lg text-xs text-neutral-400 hover:border-purple-500/50 hover:text-purple-300 transition-all cursor-default"
          >
            {label}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-xs text-neutral-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              → {hint}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
