"use client";

import { useEffect, useState } from "react";

interface Props {
  loaded: boolean;
  onDone: () => void;
}

export default function Preloader3D({ loaded, onDone }: Props) {
  const [dots, setDots] = useState(".");
  const [timer, setTimer] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
      setTimer((t) => t + 1);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (loaded) {
      setFading(true);
      const t = setTimeout(onDone, 800);
      return () => clearTimeout(t);
    }
  }, [loaded, onDone]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black font-mono"
      style={{
        transition: "opacity 0.8s ease",
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? "none" : "all",
      }}
    >
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
          animation: "scanlines 0.2s linear infinite",
        }}
      />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Glitch title */}
        <div className="relative">
          <h1
            className="text-4xl md:text-6xl font-bold text-white tracking-widest uppercase"
            style={{ fontFamily: "monospace" }}
          >
            PORTFOLIO
          </h1>
          <h1
            className="absolute inset-0 text-4xl md:text-6xl font-bold tracking-widest uppercase"
            style={{
              fontFamily: "monospace",
              color: "transparent",
              WebkitTextStroke: "1px rgba(139,92,246,0.8)",
              animation: "glitch 2s infinite",
              transform: "translateX(2px)",
            }}
          >
            PORTFOLIO
          </h1>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-purple-400 text-sm tracking-widest uppercase">
            Loading 3D Scene{dots}
          </p>
          <p className="text-neutral-600 text-xs">[{timer.toString().padStart(3, "0")}]</p>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-0.5 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full"
            style={{
              width: loaded ? "100%" : `${Math.min(timer * 8, 85)}%`,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes scanlines {
          0% { background-position: 0 0; }
          100% { background-position: 0 6px; }
        }
        @keyframes glitch {
          0%, 90%, 100% { opacity: 0; transform: translateX(2px); }
          92% { opacity: 1; transform: translateX(-2px); color: rgba(239,68,68,0.7); }
          94% { opacity: 0; }
          96% { opacity: 1; transform: translateX(2px); color: rgba(6,182,212,0.7); }
          98% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
