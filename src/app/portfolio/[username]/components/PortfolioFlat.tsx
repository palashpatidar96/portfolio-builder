"use client";

import { useEffect, useState } from "react";
import {
  Github,
  Linkedin,
  Globe,
  Mail,
  MapPin,
  ExternalLink,
  ArrowUpRight,
  Phone,
} from "lucide-react";
import type {
  UserProfile,
  Experience,
  Education,
  Project,
  Skill,
} from "@/types/portfolio";


/* ─── helpers ─────────────────────────────────────────── */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const gradients = [
  "linear-gradient(135deg, #e85d4a 0%, #e8c547 100%)",
  "linear-gradient(135deg, #47c8b0 0%, #9b8ec4 100%)",
  "linear-gradient(135deg, #9b8ec4 0%, #e85d4a 100%)",
  "linear-gradient(135deg, #e8c547 0%, #47c8b0 100%)",
];

function groupSkills(skills: Skill[]): Record<string, Skill[]> {
  return skills.reduce(
    (acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    },
    {} as Record<string, Skill[]>
  );
}

function proficiencyToDots(p: number): number {
  return Math.round((p / 100) * 5);
}

/** Extract a 4-digit year from any date string format */
function extractYear(dateStr: string | undefined | null): number {
  if (!dateStr) return NaN;
  const m = dateStr.match(/\b(19|20)\d{2}\b/);
  return m ? parseInt(m[0]) : NaN;
}


/* ─── types ───────────────────────────────────────────── */
interface PortfolioFlatProps {
  data: {
    profile: UserProfile;
    experiences: Experience[];
    education: Education[];
    projects: Project[];
    skills: Skill[];
  };
  onOpenChat?: () => void;
}

/* ═══════════════════════════════════════════════════════ */
export default function PortfolioFlat({ data, onOpenChat }: PortfolioFlatProps) {
  const { profile, experiences, education, skills } = data;
  const [expandedExp, setExpandedExp] = useState<Set<string>>(new Set());
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  function toggleFlip(id: string) {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // If no projects parsed, derive from top experiences
  const projects: Project[] =
    data.projects.length > 0
      ? data.projects
      : experiences.slice(0, 3).map((exp, i) => ({
          id: `derived-${i}`,
          user_id: exp.user_id,
          name: `${exp.role} @ ${exp.company}`,
          description: exp.description,
          tech_stack: skills
            .slice(i * 3, i * 3 + 4)
            .map((s) => s.name),
          url: "",
          github_url: "",
        }));

  function toggleExp(id: string) {
    setExpandedExp((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /* scroll-reveal observer */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const grouped = groupSkills(skills);
  const skillCats = Object.entries(grouped).slice(0, 3);

  /* ── page wrapper ─────────────────────────────────── */
  return (
    <div
      style={{
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "var(--sans)",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .portfolio-nav-links { display: none !important; }
          .portfolio-hero-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .portfolio-hero-right { display: none !important; }
          .portfolio-about-grid { grid-template-columns: 1fr !important; }
          .portfolio-exp-grid { grid-template-columns: 1fr !important; }
          .portfolio-projects-grid { grid-template-columns: 1fr !important; }
          .portfolio-skills-grid { grid-template-columns: 1fr !important; }
          .portfolio-contact-grid { grid-template-columns: 1fr !important; }
          .portfolio-edu-grid { grid-template-columns: 1fr !important; }
          .portfolio-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
      {/* ════════════ NAVBAR ════════════ */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 2rem",
          height: "64px",
          background: "rgba(10,10,10,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(240,236,226,0.05)",
        }}
      >
        {/* logo */}
        <a
          href="/"
          style={{
            fontFamily: "'Playfair Display', var(--serif), serif",
            fontSize: "1.2rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            textDecoration: "none",
          }}
        >
          <span style={{ color: "var(--accent)" }}>port.</span><span style={{ color: "var(--text)" }}>folio</span>
        </a>

        {/* nav links — hidden on mobile */}
        <div style={{ display: "flex", gap: "2rem" }} className="portfolio-nav-links">
          {(["About", "Projects", "Skills", "Contact"] as const).map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onOpenChat}
          style={{
            background: "var(--accent)",
            color: "var(--bg)",
            border: "none",
            padding: "0.45rem 1rem",
            fontFamily: "var(--sans)",
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Chat with AI
        </button>
      </nav>

      {/* ════════════ HERO ════════════ */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          paddingTop: "6rem",
          paddingBottom: "4rem",
          paddingLeft: "2rem",
          paddingRight: "2rem",
        }}
      >
        <div
          className="portfolio-hero-grid"
          style={{
            maxWidth: "72rem",
            margin: "0 auto",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "4rem",
            alignItems: "center",
          }}
        >
          {/* left: text */}
          <div>
            {/* mono label */}
            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: "1.25rem",
              }}
            >
              {`// ${profile.title}`}
            </p>

            {/* name */}
            <h1
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(3rem,7vw,5.5rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                fontWeight: 700,
                marginBottom: "0.75rem",
                color: "var(--text)",
              }}
            >
              {profile.full_name}
            </h1>

            {/* italic title */}
            <p
              style={{
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                color: "var(--accent)",
                fontSize: "clamp(1.2rem,3vw,2rem)",
                marginBottom: "1.75rem",
                letterSpacing: "-0.01em",
              }}
            >
              {profile.title}
            </p>

            {/* summary */}
            <p
              style={{
                color: "var(--text-muted)",
                maxWidth: "32rem",
                lineHeight: 1.75,
                fontSize: "0.95rem",
                marginBottom: "2.5rem",
              }}
            >
              {profile.summary.length > 180
                ? `${profile.summary.slice(0, 180)}...`
                : profile.summary}
            </p>

            {/* tagline */}
            {profile.tagline && (
              <div
                style={{
                  borderLeft: "2px solid var(--accent)",
                  paddingLeft: "1rem",
                  marginBottom: "2rem",
                  opacity: 0.85,
                }}
              >
                <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "0.95rem", color: "var(--text)", lineHeight: 1.6 }}>
                  &ldquo;{profile.tagline}&rdquo;
                </p>
              </div>
            )}

            {/* CTAs */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
              <a
                href="#projects"
                className="btn-primary"
                style={{ textDecoration: "none" }}
              >
                View Projects →
              </a>
              <a
                href="#contact"
                className="btn-outline"
                style={{ textDecoration: "none" }}
              >
                Contact Me
              </a>
            </div>

            {/* contact strip */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              {profile.location && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    color: "var(--text-muted)",
                    fontSize: "0.85rem",
                  }}
                >
                  <MapPin size={14} />
                  {profile.location}
                </span>
              )}
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    color: "var(--text-muted)",
                    fontSize: "0.85rem",
                    textDecoration: "none",
                  }}
                >
                  <Mail size={14} />
                  {profile.email}
                </a>
              )}
            </div>

            {/* social links */}
            <div style={{ display: "flex", gap: "0.6rem" }}>
              {profile.github_url && (
                <SocialBox href={profile.github_url} label="GH" />
              )}
              {profile.linkedin_url && (
                <SocialBox href={profile.linkedin_url} label="LI" />
              )}
              {profile.website_url && (
                <SocialBox href={profile.website_url} label="Web" />
              )}
            </div>
          </div>

          {/* right: stats & skills card */}
          <div className="portfolio-hero-right" style={{ flexShrink: 0, width: 340 }}>
            {/* initials + availability */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "16px",
                  background: "var(--accent)",
                  color: "#0a0a0a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Playfair Display', var(--serif), serif",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  flexShrink: 0,
                }}
              >
                {getInitials(profile.full_name)}
              </div>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "0.62rem", color: "var(--text-muted)", letterSpacing: "0.12em", marginBottom: "0.3rem" }}>
                  {profile.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--mono)", fontSize: "0.62rem", color: "#47c8b0" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#47c8b0", display: "inline-block" }} />
                  Available for opportunities
                </div>
              </div>
            </div>

            {/* stat boxes 2×2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
              {[
                { num: `${experiences.length}+`, label: "Companies", color: "var(--accent)" },
                { num: `${projects.length}+`, label: "Projects", color: "var(--teal)" },
                { num: `${skills.length}+`, label: "Skills", color: "var(--lavender)" },
                {
                  num: (() => {
                    if (experiences.length === 0) return "—";
                    const years = experiences
                      .map((e) => extractYear(e.start_date))
                      .filter((y) => !isNaN(y));
                    if (years.length === 0) return "—";
                    const diff = new Date().getFullYear() - Math.min(...years);
                    return diff > 0 ? `${diff}+` : "—";
                  })(),
                  label: "Yrs Exp",
                  color: "var(--coral)",
                },
              ].map(({ num, label, color }) => (
                <div
                  key={label}
                  style={{
                    background: "#111",
                    border: "1px solid rgba(240,236,226,0.06)",
                    borderRadius: "12px",
                    padding: "1rem",
                  }}
                >
                  <div style={{ fontFamily: "'Playfair Display', var(--serif), serif", fontSize: "1.75rem", fontWeight: 700, color, lineHeight: 1 }}>
                    {num}
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", color: "var(--text-muted)", letterSpacing: "0.1em", marginTop: "0.35rem", textTransform: "uppercase" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* top skills */}
            <div
              style={{
                background: "#111",
                border: "1px solid rgba(240,236,226,0.06)",
                borderRadius: "12px",
                padding: "1rem",
                marginBottom: "0.75rem",
              }}
            >
              <div style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                // Top Skills
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {skills.slice(0, 10).map((s, i) => {
                  const chipColors = ["var(--accent)", "var(--teal)", "var(--lavender)", "var(--coral)"];
                  const c = chipColors[i % 4];
                  return (
                    <span
                      key={s.name}
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.62rem",
                        padding: "0.25rem 0.65rem",
                        border: `1px solid ${c}40`,
                        color: c,
                        borderRadius: "20px",
                        background: `${c}10`,
                      }}
                    >
                      {s.name}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* location + contact row */}
            {(profile.location || profile.email) && (
              <div
                style={{
                  background: "#111",
                  border: "1px solid rgba(240,236,226,0.06)",
                  borderRadius: "12px",
                  padding: "0.85rem 1rem",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                {profile.location && (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "var(--mono)", fontSize: "0.65rem", color: "var(--text-muted)" }}>
                    <MapPin size={12} /> {profile.location}
                  </span>
                )}
                {profile.email && (
                  <a href={`mailto:${profile.email}`} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "var(--mono)", fontSize: "0.65rem", color: "var(--text-muted)", textDecoration: "none" }}>
                    <Mail size={12} /> {profile.email}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════ ABOUT + EXPERIENCE ════════════ */}
      <section
        id="about"
        style={{
          paddingTop: "6rem",
          paddingBottom: "6rem",
          paddingLeft: "2rem",
          paddingRight: "2rem",
          borderTop: "1px solid rgba(240,236,226,0.05)",
        }}
      >
        <div
          className="portfolio-about-grid"
          style={{
            maxWidth: "72rem",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
          }}
        >
          {/* left: about */}
          <div>
            <p className="section-label">// About</p>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(1.8rem,4vw,2.8rem)",
                lineHeight: 1.1,
                marginBottom: "1.5rem",
                color: "var(--text)",
              }}
            >
              Turning ideas into real products
            </h2>

            {/* bio paragraphs */}
            {profile.summary.length > 240 ? (
              <>
                <p
                  style={{
                    color: "var(--text-muted)",
                    lineHeight: 1.75,
                    marginBottom: "1rem",
                    fontSize: "0.95rem",
                  }}
                >
                  {profile.summary.slice(0, Math.floor(profile.summary.length / 2))}
                </p>
                <p
                  style={{
                    color: "var(--text-muted)",
                    lineHeight: 1.75,
                    marginBottom: "2rem",
                    fontSize: "0.95rem",
                  }}
                >
                  {profile.summary.slice(Math.floor(profile.summary.length / 2))}
                </p>
              </>
            ) : (
              <p
                style={{
                  color: "var(--text-muted)",
                  lineHeight: 1.75,
                  marginBottom: "2rem",
                  fontSize: "0.95rem",
                }}
              >
                {profile.summary}
              </p>
            )}

            {/* 2x2 stat grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
              }}
            >
              {[
                { num: `${experiences.length}+`, label: "Roles" },
                { num: `${projects.length}+`, label: "Projects" },
                { num: `${skills.length}+`, label: "Skills" },
                {
                  num: education.length > 0 ? education[0].degree.split(" ")[0] : "Self",
                  label: education.length > 0 ? education[0].degree : "Self-taught",
                },
              ].map(({ num, label }) => (
                <div
                  key={label}
                  className="card-hover reveal"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid rgba(240,236,226,0.06)",
                    padding: "1.25rem",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "var(--accent)",
                      lineHeight: 1,
                      marginBottom: "0.35rem",
                    }}
                  >
                    {num}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.65rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* right: experience timeline */}
          <div>
            <p className="section-label">// Experience</p>

            {experiences.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                No experience entries yet.
              </p>
            ) : (
              <div
                style={{
                  borderLeft: "1px solid",
                  borderImage: "linear-gradient(to bottom, var(--accent), transparent) 1",
                  paddingLeft: "0.1px",
                }}
              >
                {experiences.map((exp, i) => (
                  <div
                    key={exp.id}
                    className="reveal"
                    style={{
                      paddingLeft: "2.5rem",
                      position: "relative",
                      paddingBottom: i < experiences.length - 1 ? "2.5rem" : 0,
                    }}
                  >
                    {/* diamond marker */}
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "0.35rem",
                        width: 10,
                        height: 10,
                        background: "var(--accent)",
                        transform: "translateX(-5px) rotate(45deg)",
                        flexShrink: 0,
                      }}
                    />

                    {/* year range */}
                    <p
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.12em",
                        color: "var(--accent)",
                        marginBottom: "0.35rem",
                      }}
                    >
                      {exp.start_date} — {exp.end_date ?? "Present"}
                    </p>

                    {/* role */}
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: "1rem",
                        marginBottom: "0.15rem",
                        color: "var(--text)",
                      }}
                    >
                      {exp.role}
                    </p>

                    {/* company */}
                    <p
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.9375rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {exp.company}
                    </p>

                    {/* description — expandable */}
                    <div>
                      <p
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.9375rem",
                          lineHeight: 1.75,
                          marginBottom: exp.description.length > 150 ? "0.4rem" : 0,
                        }}
                      >
                        {expandedExp.has(exp.id)
                          ? exp.description
                          : exp.description.length > 150
                            ? `${exp.description.slice(0, 150)}...`
                            : exp.description}
                      </p>
                      {exp.description.length > 150 && (
                        <button
                          onClick={() => toggleExp(exp.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            fontFamily: "var(--mono)",
                            fontSize: "0.65rem",
                            letterSpacing: "0.08em",
                            color: "var(--accent)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                          }}
                        >
                          {expandedExp.has(exp.id) ? "▲ show less" : "▼ read more"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════ PROJECTS ════════════ */}
      <section
        id="projects"
        style={{
          paddingTop: "6rem",
          paddingBottom: "6rem",
          paddingLeft: "2rem",
          paddingRight: "2rem",
          borderTop: "1px solid rgba(240,236,226,0.05)",
        }}
      >
        <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
          <p className="section-label">// Selected Work</p>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(1.8rem,4vw,2.8rem)",
              lineHeight: 1.1,
              marginBottom: "0.75rem",
              color: "var(--text)",
            }}
          >
            Featured Projects
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              maxWidth: "28rem",
              lineHeight: 1.7,
              marginBottom: "3rem",
              fontSize: "0.95rem",
            }}
          >
            A selection of work spanning products, tools, and experiments.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {projects.slice(0, 4).map((proj, i) => {
              const isFlipped = flippedCards.has(proj.id);
              const accentColor = ["var(--accent)", "var(--teal)", "var(--lavender)", "var(--coral)"][i % 4];
              return (
                <div
                  key={proj.id}
                  className="reveal"
                  style={{ perspective: "1200px", height: 360 }}
                  onClick={() => toggleFlip(proj.id)}
                >
                  {/* inner flip container */}
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      transformStyle: "preserve-3d",
                      transition: "transform 0.55s cubic-bezier(0.4,0.2,0.2,1)",
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                      cursor: "pointer",
                      borderRadius: "14px",
                    }}
                  >
                    {/* ── FRONT ── */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        background: "var(--bg-card)",
                        border: `1px solid rgba(240,236,226,0.07)`,
                        borderRadius: "14px",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {/* gradient header */}
                      <div
                        style={{
                          height: 180,
                          background: gradients[i % 4],
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage:
                              "repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(0,0,0,0.05) 40px,rgba(0,0,0,0.05) 41px)",
                          }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            bottom: "0.85rem",
                            left: "1rem",
                            fontFamily: "var(--mono)",
                            fontSize: "0.62rem",
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            padding: "0.3rem 0.7rem",
                            background: "rgba(10,10,10,0.72)",
                            backdropFilter: "blur(8px)",
                            color: "var(--text)",
                            borderRadius: "6px",
                          }}
                        >
                          {proj.tech_stack?.[0] ?? "Project"}
                        </span>
                        <span
                          style={{
                            position: "absolute",
                            top: "0.85rem",
                            right: "0.85rem",
                            fontFamily: "var(--mono)",
                            fontSize: "0.58rem",
                            color: "rgba(255,255,255,0.55)",
                            background: "rgba(10,10,10,0.55)",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "20px",
                            backdropFilter: "blur(6px)",
                          }}
                        >
                          click to flip
                        </span>
                      </div>

                      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
                        <h3
                          style={{
                            fontFamily: "'Playfair Display', var(--serif), serif",
                            fontSize: "1.15rem",
                            marginBottom: "0.4rem",
                            color: "var(--text)",
                            lineHeight: 1.3,
                          }}
                        >
                          {proj.name}
                        </h3>
                        <p
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "0.9rem",
                            lineHeight: 1.65,
                            marginBottom: "0.9rem",
                            flex: 1,
                          }}
                        >
                          {(proj.description ?? "").slice(0, 100)}
                          {(proj.description?.length ?? 0) > 100 ? "…" : ""}
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "auto" }}>
                          {proj.tech_stack?.slice(0, 4).map((t) => (
                            <span
                              key={t}
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: "0.6rem",
                                padding: "0.2rem 0.55rem",
                                border: "1px solid rgba(240,236,226,0.1)",
                                color: "var(--text-muted)",
                                borderRadius: "4px",
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ── BACK ── */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        background: "#0d0d0d",
                        border: `1px solid ${accentColor}30`,
                        borderTop: `3px solid ${accentColor}`,
                        borderRadius: "14px",
                        padding: "1.5rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.6rem",
                            color: accentColor,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {`0${i + 1} / Project`}
                        </p>
                        <h3
                          style={{
                            fontFamily: "'Playfair Display', var(--serif), serif",
                            fontSize: "1.2rem",
                            color: "var(--text)",
                            lineHeight: 1.3,
                            marginBottom: "0.75rem",
                          }}
                        >
                          {proj.name}
                        </h3>
                        <p
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "0.9375rem",
                            lineHeight: 1.75,
                          }}
                        >
                          {proj.description ?? ""}
                        </p>
                      </div>

                      <div>
                        <p
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.58rem",
                            color: "var(--text-muted)",
                            letterSpacing: "0.1em",
                            marginBottom: "0.5rem",
                          }}
                        >
                          TECH STACK
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                          {proj.tech_stack?.map((t) => (
                            <span
                              key={t}
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: "0.62rem",
                                padding: "0.25rem 0.65rem",
                                border: `1px solid ${accentColor}40`,
                                color: accentColor,
                                borderRadius: "20px",
                                background: `${accentColor}10`,
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginTop: "auto", display: "flex", gap: "0.75rem" }}>
                        {proj.url && (
                          <a
                            href={proj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              fontFamily: "var(--mono)",
                              fontSize: "0.65rem",
                              color: accentColor,
                              textDecoration: "none",
                              border: `1px solid ${accentColor}40`,
                              padding: "0.4rem 0.8rem",
                              borderRadius: "8px",
                            }}
                          >
                            <ExternalLink size={12} /> Live
                          </a>
                        )}
                        {proj.github_url && (
                          <a
                            href={proj.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              fontFamily: "var(--mono)",
                              fontSize: "0.65rem",
                              color: "var(--text-muted)",
                              textDecoration: "none",
                              border: "1px solid rgba(240,236,226,0.1)",
                              padding: "0.4rem 0.8rem",
                              borderRadius: "8px",
                            }}
                          >
                            <Github size={12} /> GitHub
                          </a>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFlip(proj.id); }}
                          style={{
                            marginLeft: "auto",
                            background: "transparent",
                            border: "none",
                            fontFamily: "var(--mono)",
                            fontSize: "0.6rem",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            letterSpacing: "0.08em",
                          }}
                        >
                          ↩ flip back
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════ SKILLS ════════════ */}
      <section
        id="skills"
        style={{
          paddingTop: "6rem",
          paddingBottom: "6rem",
          paddingLeft: "2rem",
          paddingRight: "2rem",
          borderTop: "1px solid rgba(240,236,226,0.05)",
        }}
      >
        <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
          <p className="section-label">// Expertise</p>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(1.8rem,4vw,2.8rem)",
              lineHeight: 1.1,
              marginBottom: "3rem",
              color: "var(--text)",
            }}
          >
            Skills &amp; Tools
          </h2>

          {skillCats.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              No skills listed yet.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {skillCats.map(([category, catSkills]) => (
                <div
                  key={category}
                  className="card-hover reveal"
                  style={{
                    background: "#111111",
                    border: "1px solid rgba(240,236,226,0.05)",
                    padding: "2rem",
                    borderRadius: "12px",
                  }}
                >
                  {/* category icon — first letter */}
                  <div
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "var(--accent)",
                      lineHeight: 1,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {category.slice(0, 1).toUpperCase()}
                  </div>

                  {/* category name */}
                  <h3
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "1.15rem",
                      marginBottom: "1.25rem",
                      color: "var(--text)",
                    }}
                  >
                    {category}
                  </h3>

                  {/* skill list */}
                  {catSkills.slice(0, 6).map((skill) => (
                    <div
                      key={skill.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingBlock: "0.5rem",
                        borderBottom: "1px solid rgba(240,236,226,0.04)",
                      }}
                    >
                      <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                        {skill.name}
                      </span>
                      <div style={{ display: "flex", gap: 3 }}>
                        {Array.from({ length: 5 }).map((_, di) => (
                          <span
                            key={di}
                            style={{
                              width: 8,
                              height: 8,
                              display: "inline-block",
                              background:
                                di < proficiencyToDots(skill.proficiency)
                                  ? "var(--accent)"
                                  : "rgba(240,236,226,0.08)",
                              transition: "background 0.3s",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════ EDUCATION ════════════ */}
      {education.length > 0 && (
        <section
          style={{
            paddingTop: "4rem",
            paddingBottom: "4rem",
            paddingLeft: "2rem",
            paddingRight: "2rem",
            borderTop: "1px solid rgba(240,236,226,0.05)",
          }}
        >
          <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
            <p className="section-label">// Education</p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", marginTop: "1.5rem" }}>
              {education.map((edu) => (
                <div
                  key={edu.id}
                  className="card-hover reveal"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid rgba(240,236,226,0.06)",
                    padding: "1.5rem",
                    minWidth: 260,
                    flex: "1 1 260px",
                    maxWidth: 420,
                    borderRadius: "12px",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.65rem",
                      letterSpacing: "0.12em",
                      color: "var(--accent)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {edu.start_date} — {edu.end_date ?? "Present"}
                  </p>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: "1rem",
                      marginBottom: "0.2rem",
                      color: "var(--text)",
                    }}
                  >
                    {edu.degree}
                  </p>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.9375rem",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {edu.institution}
                  </p>
                  {edu.field_of_study && (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                      {edu.field_of_study}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════ CONTACT ════════════ */}
      <section
        id="contact"
        style={{
          paddingTop: "6rem",
          paddingBottom: "6rem",
          paddingLeft: "2rem",
          paddingRight: "2rem",
          borderTop: "1px solid rgba(240,236,226,0.05)",
        }}
      >
        <div
          className="portfolio-contact-grid"
          style={{
            maxWidth: "72rem",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "start",
          }}
        >
          {/* left: contact info */}
          <div>
            <p className="section-label">// Contact</p>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(1.8rem,4vw,2.8rem)",
                lineHeight: 1.1,
                marginBottom: "1rem",
                color: "var(--text)",
              }}
            >
              Let&apos;s Work Together
            </h2>
            <p
              style={{
                color: "var(--text-muted)",
                lineHeight: 1.75,
                marginBottom: "2rem",
                fontSize: "0.95rem",
                maxWidth: "28rem",
              }}
            >
              Open to new opportunities, collaborations, and interesting projects.
              Reach out and let&apos;s build something great.
            </p>

            {/* contact details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", marginBottom: "2rem" }}>
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    color: "var(--text-muted)",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  <Mail size={16} />
                  {profile.email}
                </a>
              )}
              {profile.location && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    color: "var(--text-muted)",
                    fontSize: "0.9rem",
                  }}
                >
                  <MapPin size={16} />
                  {profile.location}
                </span>
              )}
              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    color: "var(--text-muted)",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  <Phone size={16} />
                  {profile.phone}
                </a>
              )}
            </div>

            {/* social links */}
            <div style={{ display: "flex", gap: "0.6rem" }}>
              {profile.github_url && (
                <SocialBox href={profile.github_url} label="GH" />
              )}
              {profile.linkedin_url && (
                <SocialBox href={profile.linkedin_url} label="LI" />
              )}
              {profile.website_url && (
                <SocialBox href={profile.website_url} label="Web" />
              )}
            </div>
          </div>

          {/* right: quote card */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid rgba(232,197,71,0.2)",
              borderTop: "2px solid var(--accent)",
              padding: "2rem",
              borderRadius: "14px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: "1.15rem",
                lineHeight: 1.6,
                color: "var(--text)",
                marginBottom: "2rem",
              }}
            >
              &ldquo;{profile.tagline || "The best portfolios are built at the intersection of passion and execution."}&rdquo;
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  background:
                    "linear-gradient(135deg, var(--accent), var(--coral))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--serif)",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "var(--bg)",
                  flexShrink: 0,
                  borderRadius: "8px",
                }}
              >
                {getInitials(profile.full_name)}
              </div>
              <div>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "var(--text)",
                    marginBottom: "0.1rem",
                  }}
                >
                  {profile.full_name}
                </p>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.875rem",
                    fontFamily: "var(--mono)",
                  }}
                >
                  {profile.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer
        style={{
          paddingTop: "2rem",
          paddingBottom: "2rem",
          paddingLeft: "2rem",
          paddingRight: "2rem",
          borderTop: "1px solid rgba(240,236,226,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.8rem",
            fontFamily: "var(--mono)",
          }}
        >
          &copy; 2026 {profile.full_name} &mdash; Built with PortfolioAI
        </p>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.8rem",
            fontFamily: "var(--mono)",
          }}
        >
          Built with PortfolioAI
        </p>
      </footer>
    </div>
  );
}

/* ─── sub-component: social link box ─────────────────── */
function SocialBox({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        width: 40,
        height: 40,
        border: "1px solid rgba(240,236,226,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-muted)",
        textDecoration: "none",
        fontFamily: "var(--mono)",
        fontSize: "0.65rem",
        letterSpacing: "0.05em",
        transition: "all 0.2s",
        flexShrink: 0,
        borderRadius: "8px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--accent)";
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.color = "var(--bg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = "rgba(240,236,226,0.1)";
        e.currentTarget.style.color = "var(--text-muted)";
      }}
    >
      {label}
    </a>
  );
}
