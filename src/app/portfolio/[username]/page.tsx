import { getFullProfile } from "@/lib/database";
import { getLocalProfile } from "@/lib/local-store";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PortfolioClient from "./PortfolioClient";

// Demo data for when no Supabase is configured
const DEMO_DATA = {
  profile: {
    id: "demo",
    username: "demo",
    full_name: "Alex Johnson",
    email: "alex@example.com",
    phone: "+1 234 567 8900",
    location: "San Francisco, CA",
    title: "Full Stack Developer & AI Enthusiast",
    summary:
      "Passionate software engineer with 5+ years of experience building scalable web applications. Specializing in React, Node.js, and machine learning. Love creating tools that make developers more productive.",
    linkedin_url: "https://linkedin.com/in/alexjohnson",
    github_url: "https://github.com/alexjohnson",
    website_url: "https://alexjohnson.dev",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  experiences: [
    {
      id: "1",
      user_id: "demo",
      company: "TechCorp",
      role: "Senior Full Stack Developer",
      start_date: "2022-01",
      end_date: "",
      description:
        "Leading a team of 5 engineers building a SaaS platform. Architected microservices infrastructure handling 10M+ requests/day. Implemented CI/CD pipelines reducing deployment time by 70%.",
      is_current: true,
    },
    {
      id: "2",
      user_id: "demo",
      company: "StartupAI",
      role: "Full Stack Developer",
      start_date: "2020-03",
      end_date: "2022-01",
      description:
        "Built real-time collaboration features using WebSockets. Developed ML-powered recommendation engine increasing user engagement by 40%. Migrated legacy codebase to TypeScript.",
      is_current: false,
    },
    {
      id: "3",
      user_id: "demo",
      company: "WebAgency",
      role: "Frontend Developer",
      start_date: "2018-06",
      end_date: "2020-03",
      description:
        "Developed responsive web applications for 20+ clients. Built reusable component library used across all company projects. Optimized Core Web Vitals scores by 50%.",
      is_current: false,
    },
  ],
  education: [
    {
      id: "1",
      user_id: "demo",
      institution: "Stanford University",
      degree: "Master of Science",
      field_of_study: "Computer Science - AI/ML",
      start_date: "2016",
      end_date: "2018",
      description: "Focus on Natural Language Processing and Deep Learning",
    },
    {
      id: "2",
      user_id: "demo",
      institution: "UC Berkeley",
      degree: "Bachelor of Science",
      field_of_study: "Computer Science",
      start_date: "2012",
      end_date: "2016",
      description: "Graduated with Honors, Dean's List",
    },
  ],
  projects: [
    {
      id: "1",
      user_id: "demo",
      name: "AI Code Review Bot",
      description:
        "Open-source GitHub bot that uses LLMs to automatically review pull requests, suggest improvements, and catch potential bugs before they reach production.",
      tech_stack: ["Python", "OpenAI", "GitHub API", "FastAPI", "Docker"],
      url: "https://ai-reviewer.dev",
      github_url: "https://github.com/alexjohnson/ai-reviewer",
    },
    {
      id: "2",
      user_id: "demo",
      name: "Real-time Collaboration SDK",
      description:
        "A lightweight SDK for adding real-time collaboration features to any web app. Supports text, drawing, and cursor presence with conflict-free resolution.",
      tech_stack: ["TypeScript", "WebSocket", "CRDT", "React", "Redis"],
      url: "",
      github_url: "https://github.com/alexjohnson/collab-sdk",
    },
    {
      id: "3",
      user_id: "demo",
      name: "DevMetrics Dashboard",
      description:
        "Analytics dashboard for development teams. Tracks deployment frequency, lead time, MTTR, and change failure rate with beautiful visualizations.",
      tech_stack: ["Next.js", "D3.js", "PostgreSQL", "GraphQL"],
      url: "https://devmetrics.io",
      github_url: "",
    },
    {
      id: "4",
      user_id: "demo",
      name: "Neural Style Transfer App",
      description:
        "Mobile app that applies artistic styles to photos using neural networks. Processes images on-device for privacy with Core ML optimization.",
      tech_stack: ["Swift", "Core ML", "PyTorch", "TensorFlow Lite"],
      url: "",
      github_url: "https://github.com/alexjohnson/style-transfer",
    },
  ],
  skills: [
    { id: "1", user_id: "demo", name: "TypeScript", category: "Programming", proficiency: 95 },
    { id: "2", user_id: "demo", name: "Python", category: "Programming", proficiency: 90 },
    { id: "3", user_id: "demo", name: "Go", category: "Programming", proficiency: 75 },
    { id: "4", user_id: "demo", name: "React", category: "Frontend", proficiency: 95 },
    { id: "5", user_id: "demo", name: "Next.js", category: "Frontend", proficiency: 90 },
    { id: "6", user_id: "demo", name: "Tailwind CSS", category: "Frontend", proficiency: 90 },
    { id: "7", user_id: "demo", name: "Node.js", category: "Backend", proficiency: 90 },
    { id: "8", user_id: "demo", name: "FastAPI", category: "Backend", proficiency: 80 },
    { id: "9", user_id: "demo", name: "PostgreSQL", category: "Database", proficiency: 85 },
    { id: "10", user_id: "demo", name: "Redis", category: "Database", proficiency: 80 },
    { id: "11", user_id: "demo", name: "Docker", category: "DevOps", proficiency: 85 },
    { id: "12", user_id: "demo", name: "AWS", category: "DevOps", proficiency: 80 },
    { id: "13", user_id: "demo", name: "Kubernetes", category: "DevOps", proficiency: 70 },
    { id: "14", user_id: "demo", name: "Git", category: "Tools", proficiency: 95 },
  ],
};

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function PortfolioPage({ params }: PageProps) {
  const { username } = await params;

  // Use demo data for the "demo" user, otherwise fetch from DB
  let data;
  if (username === "demo") {
    data = DEMO_DATA;
  } else {
    // Try local store first (in-memory from uploads), then Supabase
    data = getLocalProfile(username);
    if (!data) {
      try {
        data = await getFullProfile(username);
      } catch {
        data = null;
      }
    }
  }

  if (!data) {
    notFound();
  }

  return (
    <Suspense fallback={<div style={{ position: "fixed", inset: 0, background: "#0a0a0a" }} />}>
      <PortfolioClient data={data} />
    </Suspense>
  );
}
