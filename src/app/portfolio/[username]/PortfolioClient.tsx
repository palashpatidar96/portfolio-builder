"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import ChatBot from "@/components/chatbot/ChatBot";
import type {
  UserProfile,
  Experience,
  Education,
  Project,
  Skill,
} from "@/types/portfolio";

/* ─── dynamic imports ─────────────────────────────────── */
const Portfolio3DCanvas = dynamic(
  () => import("./components/Portfolio3DCanvas"),
  {
    ssr: false,
    loading: () => (
      <div style={{ position: "fixed", inset: 0, background: "#000" }} />
    ),
  }
);

const PortfolioFlat = dynamic(
  () => import("./components/PortfolioFlat"),
  { ssr: false }
);

/* ─── types ───────────────────────────────────────────── */
interface PortfolioClientProps {
  data: {
    profile: UserProfile;
    experiences: Experience[];
    education: Education[];
    projects: Project[];
    skills: Skill[];
  };
}

/* ═══════════════════════════════════════════════════════ */
export default function PortfolioClient({ data }: PortfolioClientProps) {
  const { profile, experiences, projects, skills, education } = data;
  const searchParams = useSearchParams();

  const [view, setView] = useState<"flat" | "3d">("flat");
  const [isMobile, setIsMobile] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setIsMobile(window.innerWidth < 640);

    // honour ?view=3d query param
    if (searchParams.get("view") === "3d") setView("3d");

    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [searchParams]);

  // ChatBot manages its own open state; this is a no-op trigger exposed to children
  const handleOpenChat = useCallback(() => {}, []);

  /* ── loading splash ─────────────────────────────────── */
  if (!hydrated) {
    return <div style={{ position: "fixed", inset: 0, background: "#000" }} />;
  }

  /* ── 3D view (desktop only) ─────────────────────────── */
  if (view === "3d" && !isMobile) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#000" }}>
        {/* back to flat button */}
        <button
          onClick={() => setView("flat")}
          style={{
            position: "fixed",
            top: "1.5rem",
            left: "1.5rem",
            zIndex: 100,
            background: "rgba(10,10,10,0.8)",
            border: "1px solid rgba(232,197,71,0.3)",
            color: "#e8c547",
            padding: "0.5rem 1rem",
            fontFamily: "var(--mono)",
            fontSize: "0.75rem",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            letterSpacing: "0.1em",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(232,197,71,0.1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(10,10,10,0.8)")
          }
        >
          ← Flat View
        </button>

        <Portfolio3DCanvas
          profile={profile}
          experiences={experiences}
          projects={projects}
          skills={skills}
          education={education}
          onOpenChat={handleOpenChat}
        />

        <ChatBot username={profile.username} personName={profile.full_name} />
      </div>
    );
  }

  /* ── flat view (default + mobile fallback) ──────────── */
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <PortfolioFlat data={data} onOpenChat={handleOpenChat} />

      {/* floating 3D toggle — desktop only */}
      {!isMobile && (
        <button
          onClick={() => setView("3d")}
          style={{
            position: "fixed",
            bottom: "6rem",
            right: "1.5rem",
            zIndex: 50,
            background: "rgba(10,10,10,0.9)",
            border: "1px solid rgba(232,197,71,0.4)",
            color: "#e8c547",
            padding: "0.6rem 1.2rem",
            fontFamily: "var(--mono)",
            fontSize: "0.7rem",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            letterSpacing: "0.1em",
            transition: "all 0.3s",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(232,197,71,0.1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(10,10,10,0.9)")
          }
        >
          ⟐ 3D View
        </button>
      )}

      <ChatBot username={profile.username} personName={profile.full_name} />
    </div>
  );
}
