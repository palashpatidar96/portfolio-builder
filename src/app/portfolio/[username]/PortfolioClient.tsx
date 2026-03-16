"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import ChatBot from "@/components/chatbot/ChatBot";
import type {
  UserProfile,
  Experience,
  Education,
  Project,
  Skill,
} from "@/types/portfolio";

const PortfolioFlat = dynamic(
  () => import("./components/PortfolioFlat"),
  { ssr: false }
);

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
  const { profile } = data;
  const [hydrated, setHydrated] = useState(false);
  const handleOpenChat = useCallback(() => {}, []);

  useEffect(() => { setHydrated(true); }, []);

  if (!hydrated) {
    return <div style={{ position: "fixed", inset: 0, background: "#000" }} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <PortfolioFlat data={data} onOpenChat={handleOpenChat} />
      <ChatBot username={profile.username} personName={profile.full_name} />
    </div>
  );
}
