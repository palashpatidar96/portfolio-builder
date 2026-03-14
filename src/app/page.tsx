"use client";
import { Upload, ArrowRight, Bot, Globe, Github, Code2, Sparkles, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function HomePage() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        navRef.current.style.background = window.scrollY > 40
          ? "rgba(10,10,10,0.97)"
          : "rgba(10,10,10,0.72)";
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        /* Fonts */
        .font-serif { font-family: 'Playfair Display', var(--font-heading), Georgia, serif; }
        .font-sans  { font-family: 'DM Sans', var(--font-body), system-ui, sans-serif; }
        .font-mono  { font-family: 'JetBrains Mono', var(--font-mono), monospace; }

        /* Animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes floatBadge1 {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50%       { transform: translateY(-8px) rotate(0deg); }
        }
        @keyframes floatBadge2 {
          0%, 100% { transform: translateY(0) rotate(2deg); }
          50%       { transform: translateY(-6px) rotate(-1deg); }
        }
        @keyframes floatBadge3 {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50%       { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes blinkDot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        @keyframes bounceDown {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(6px); }
        }
        @keyframes shimmerBar {
          0%   { transform: translateX(-100%); opacity: 0.7; }
          50%  { transform: translateX(0%);    opacity: 1; }
          100% { transform: translateX(100%);  opacity: 0.7; }
        }

        /* Reveal */
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }

        /* Hero animate-in */
        .hero-animate { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.35s; }
        .delay-4 { animation-delay: 0.5s; }
        .delay-5 { animation-delay: 0.65s; }

        /* Nav */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          background: rgba(10,10,10,0.72);
          border-bottom: 1px solid rgba(232,197,71,0.08);
          transition: background 0.3s;
        }
        .nav-inner {
          display: flex; align-items: center; justify-content: space-between;
          height: 64px; max-width: 1200px; margin: 0 auto; padding: 0 32px;
        }
        .nav-logo {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.25rem; font-weight: 700; color: #f0ece2;
          text-decoration: none; letter-spacing: -0.02em;
        }
        .nav-links { display: flex; align-items: center; gap: 36px; list-style: none; }
        .nav-links a {
          color: #8a8580; text-decoration: none;
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem; font-weight: 500;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: #f0ece2; }
        .btn-ghost {
          background: none; border: none; color: #8a8580;
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem; font-weight: 500;
          cursor: pointer; padding: 8px 4px; transition: color 0.2s; text-decoration: none;
        }
        .btn-ghost:hover { color: #f0ece2; }
        .btn-gold {
          display: inline-flex; align-items: center; gap: 6px;
          background: #e8c547; color: #0a0a0a; border: none; border-radius: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem; font-weight: 700;
          padding: 10px 20px; cursor: pointer; transition: all 0.3s; text-decoration: none;
          white-space: nowrap;
        }
        .btn-gold:hover { background: #f0d060; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(232,197,71,0.25); }

        /* Hero */
        .hero {
          min-height: 100vh; display: flex; align-items: center;
          padding: 100px 32px 64px; position: relative; overflow: hidden;
        }
        .hero::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(232,197,71,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,197,71,0.03) 1px, transparent 1px);
          background-size: 80px 80px;
        }
        .hero-glow {
          position: absolute; top: 20%; left: 50%; transform: translateX(-50%);
          width: 800px; height: 400px; pointer-events: none;
          background: radial-gradient(ellipse, rgba(232,197,71,0.06) 0%, transparent 70%);
        }
        .hero-inner {
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px;
          align-items: center; max-width: 1200px; margin: 0 auto; width: 100%;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid rgba(232,197,71,0.35); border-radius: 100px;
          padding: 6px 16px; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;
          color: #e8c547; margin-bottom: 28px; background: rgba(232,197,71,0.05);
        }
        .hero-badge-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #e8c547;
          animation: pulseDot 2s ease-in-out infinite;
        }
        .hero-h1 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(3rem, 5.5vw, 4.5rem); font-weight: 700;
          line-height: 1.05; letter-spacing: -0.03em; margin-bottom: 24px; color: #f0ece2;
        }
        .hero-h1 .italic-gold { font-style: italic; color: #e8c547; }
        .hero-sub {
          font-family: 'DM Sans', sans-serif; font-size: 1.0625rem;
          color: #a09a94; line-height: 1.7; max-width: 440px; margin-bottom: 36px;
        }
        .hero-ctas { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; flex-wrap: wrap; }
        .btn-gold-lg {
          display: inline-flex; align-items: center; gap: 8px;
          background: #e8c547; color: #0a0a0a; border: none; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 700;
          padding: 14px 28px; cursor: pointer; transition: all 0.3s; text-decoration: none;
        }
        .btn-gold-lg:hover { background: #f0d060; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(232,197,71,0.3); }
        .btn-outline-lg {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: #f0ece2;
          border: 1px solid rgba(240,236,226,0.18); border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 500;
          padding: 14px 28px; cursor: pointer; transition: all 0.3s; text-decoration: none;
        }
        .btn-outline-lg:hover { border-color: rgba(232,197,71,0.4); color: #e8c547; background: rgba(232,197,71,0.05); }
        .trust-chips { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .trust-chip { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #a09a94; }
        .trust-chip .check { color: #47c8b0; margin-right: 4px; }

        /* Mockup */
        .mockup-wrapper {
          position: relative;
          animation: floatCard 5s ease-in-out infinite;
        }
        .mockup-card {
          background: #111111; border: 1px solid rgba(232,197,71,0.25); border-radius: 20px;
          width: 360px; overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,197,71,0.08), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .mockup-topbar {
          background: #0d0d0d; border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 10px 14px; display: flex; align-items: center; gap: 6px;
        }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .mockup-url {
          margin-left: 10px; flex: 1; background: rgba(255,255,255,0.04);
          border-radius: 5px; padding: 4px 10px;
          font-family: 'JetBrains Mono', monospace; font-size: 0.625rem; color: #8a8580;
        }
        .mockup-body { padding: 20px; }
        .mockup-profile {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 16px; padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .mockup-avatar {
          width: 44px; height: 44px; border-radius: 10px;
          background: linear-gradient(135deg, #e8c547 0%, #e85d4a 100%);
          flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: #0a0a0a;
        }
        .mockup-name { font-family: 'Playfair Display', serif; font-size: 0.875rem; font-weight: 600; color: #f0ece2; }
        .mockup-role { font-family: 'JetBrains Mono', monospace; font-size: 0.625rem; color: #e8c547; margin-top: 2px; }
        .tl-label {
          font-family: 'JetBrains Mono', monospace; font-size: 0.5625rem;
          color: #8a8580; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;
        }
        .tl-item { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
        .tl-dot { width: 6px; height: 6px; border-radius: 50%; background: #e8c547; margin-top: 4px; flex-shrink: 0; }
        .tl-text { font-family: 'DM Sans', sans-serif; font-size: 0.6875rem; color: #8a8580; line-height: 1.4; }
        .tl-text strong { color: #f0ece2; font-weight: 500; }
        .skill-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 14px; }
        .skill-chip {
          background: rgba(255,255,255,0.06); border-radius: 4px;
          padding: 3px 8px; font-family: 'JetBrains Mono', monospace; font-size: 0.5625rem; color: #8a8580;
        }
        .mockup-footer {
          background: rgba(232,197,71,0.05); border-top: 1px solid rgba(232,197,71,0.12);
          padding: 10px 20px; font-family: 'JetBrains Mono', monospace; font-size: 0.625rem; color: #e8c547;
          display: flex; align-items: center; justify-content: space-between;
        }
        .status-dot { width: 5px; height: 5px; border-radius: 50%; background: #47c8b0; animation: blinkDot 2.4s ease-in-out infinite; }

        /* Floating badges */
        .float-badge {
          position: absolute; border-radius: 10px; padding: 8px 13px;
          font-family: 'JetBrains Mono', monospace; font-size: 0.6875rem; font-weight: 500;
          white-space: nowrap; box-shadow: 0 8px 24px rgba(0,0,0,0.4); backdrop-filter: blur(10px);
        }
        .badge-teal {
          background: rgba(71,200,176,0.12); border: 1px solid rgba(71,200,176,0.3); color: #47c8b0;
          top: -18px; right: -20px; animation: floatBadge1 4s ease-in-out infinite;
        }
        .badge-gold {
          background: rgba(232,197,71,0.1); border: 1px solid rgba(232,197,71,0.3); color: #e8c547;
          bottom: 60px; left: -28px; animation: floatBadge2 5s ease-in-out infinite;
        }
        .badge-coral {
          background: rgba(232,93,74,0.12); border: 1px solid rgba(232,93,74,0.3); color: #e85d4a;
          bottom: -16px; right: -10px; animation: floatBadge3 4.5s ease-in-out infinite;
        }

        /* Scroll indicator */
        .scroll-indicator {
          position: absolute; bottom: 32px; left: 50%;
          animation: bounceDown 2s ease-in-out infinite;
          display: flex; flex-direction: column; align-items: center; gap: 6px; color: #8a8580;
        }
        .scroll-label { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; }
        .scroll-line { width: 1px; height: 32px; background: linear-gradient(to bottom, #8a8580, transparent); }

        /* Sections */
        .section { padding: 96px 32px; position: relative; }
        .section-inner { max-width: 1200px; margin: 0 auto; }
        .section-divider { border-top: 1px solid rgba(240,236,226,0.05); }
        .section-tag {
          font-family: 'JetBrains Mono', monospace; font-size: 0.7rem;
          color: #e8c547; letter-spacing: 0.15em; text-transform: uppercase;
          margin-bottom: 16px; display: block;
        }
        .section-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2rem, 4vw, 3.25rem); font-weight: 700;
          letter-spacing: -0.02em; line-height: 1.1; color: #f0ece2; margin-bottom: 56px;
        }
        .section-heading em { font-style: italic; color: #e8c547; }

        /* How It Works */
        .hiw-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .hiw-card {
          background: #111111; border: 1px solid rgba(240,236,226,0.06); border-radius: 16px;
          padding: 32px; position: relative; overflow: hidden;
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
        }
        .hiw-card:hover { border-color: rgba(232,197,71,0.2); transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
        .hiw-num {
          position: absolute; right: 16px; top: 12px;
          font-family: 'Playfair Display', serif; font-size: 6rem; font-weight: 700;
          color: #e8c547; opacity: 0.05; line-height: 1; pointer-events: none; user-select: none;
        }
        .hiw-icon {
          width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
          background: rgba(232,197,71,0.1); margin-bottom: 20px;
        }
        .hiw-title {
          font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 700;
          color: #f0ece2; margin-bottom: 10px;
        }
        .hiw-desc {
          font-family: 'DM Sans', sans-serif; font-size: 0.9375rem;
          color: #a09a94; line-height: 1.7;
        }

        /* Features */
        .feat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; max-width: 860px; }
        .feat-card {
          background: #111111; border: 1px solid rgba(240,236,226,0.06); border-radius: 16px;
          padding: 32px; position: relative; overflow: hidden;
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
        }
        .feat-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(232,197,71,0.4), transparent);
          transform: scaleX(0); transition: transform 0.4s ease;
        }
        .feat-card:hover::before { transform: scaleX(1); }
        .feat-card:hover { border-color: rgba(232,197,71,0.2); transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
        .feat-num { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: #e8c547; opacity: 0.6; margin-bottom: 16px; display: block; }
        .feat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .feat-title { font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 700; color: #f0ece2; margin-bottom: 10px; }
        .feat-desc { font-family: 'DM Sans', sans-serif; font-size: 0.9375rem; color: #a09a94; line-height: 1.7; }

        /* Examples */
        .ex-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .ex-card {
          background: #111111; border: 1px solid rgba(240,236,226,0.06); border-radius: 14px;
          overflow: hidden; cursor: pointer; transition: transform 0.25s, box-shadow 0.25s;
        }
        .ex-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.5); }
        .ex-thumb { position: relative; height: 180px; }
        .ex-overlay {
          position: absolute; inset: 0; background: rgba(10,10,10,0.7);
          display: flex; align-items: center; justify-content: center;
          border-radius: 0; opacity: 0; transition: opacity 0.25s;
        }
        .ex-card:hover .ex-overlay { opacity: 1; }
        .ex-label { font-family: 'JetBrains Mono', monospace; color: #e8c547; font-size: 0.75rem; letter-spacing: 0.08em; }
        .ex-info { padding: 14px 16px; }
        .ex-name { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; font-weight: 600; color: #f0ece2; margin-bottom: 3px; }
        .ex-role { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #a09a94; }

        /* CTA */
        .cta-box {
          max-width: 680px; margin: 0 auto; position: relative;
          background: #111111; border: 1px solid rgba(232,197,71,0.3); border-radius: 20px;
          padding: 64px 48px; text-align: center;
        }
        .cta-top-line { position: absolute; top: 0; left: 40px; right: 40px; height: 2px; background: #e8c547; border-radius: 1px; }
        .cta-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 3.5vw, 2.75rem); font-weight: 700; letter-spacing: -0.02em;
          color: #f0ece2; margin-bottom: 16px; line-height: 1.1;
        }
        .cta-sub {
          font-family: 'DM Sans', sans-serif; font-size: 1rem; color: #a09a94;
          line-height: 1.65; max-width: 480px; margin: 0 auto 32px;
        }
        .stat-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 32px; }
        .stat-chip {
          font-family: 'JetBrains Mono', monospace; color: #e8c547;
          border: 1px solid rgba(232,197,71,0.25); background: rgba(232,197,71,0.05);
          border-radius: 6px; padding: 6px 14px; font-size: 0.7rem;
        }
        .cta-btns { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }

        /* Tech strip */
        .tech-strip { padding: 48px 32px; border-top: 1px solid rgba(240,236,226,0.05); }
        .tech-inner { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .tech-label { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: #a09a94; letter-spacing: 0.2em; text-transform: uppercase; }
        .tech-pills { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
        .tech-pill {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: #a09a94;
          border: 1px solid rgba(240,236,226,0.07); border-radius: 6px;
          padding: 8px 16px; transition: color 0.2s, border-color 0.2s; cursor: default;
        }
        .tech-pill:hover { color: #f0ece2; border-color: rgba(240,236,226,0.15); }

        /* Footer */
        footer { padding: 32px; border-top: 1px solid rgba(240,236,226,0.05); }
        .footer-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr auto 1fr; gap: 24px; align-items: center; }
        .footer-logo { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: #f0ece2; }
        .footer-links { display: flex; gap: 24px; }
        .footer-links a { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #a09a94; text-decoration: none; transition: color 0.2s; }
        .footer-links a:hover { color: #f0ece2; }
        .footer-copy { font-family: 'DM Sans', sans-serif; font-size: 0.8125rem; color: #a09a94; text-align: right; }

        /* Noise */
        .page-root::after {
          content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9999; opacity: 0.028;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        @media (max-width: 900px) {
          .hero-inner { grid-template-columns: 1fr; gap: 48px; }
          .hero-right { display: none; }
          .hiw-grid { grid-template-columns: 1fr; }
          .feat-grid { grid-template-columns: 1fr; }
          .ex-grid { grid-template-columns: repeat(2, 1fr); }
          .footer-inner { grid-template-columns: 1fr; text-align: center; }
          .footer-links { justify-content: center; }
          .footer-copy { text-align: center; }
          .nav-links { display: none; }
        }
      `}</style>

      <div className="page-root" style={{ background: "#0a0a0a", color: "#f0ece2", minHeight: "100vh" }}>

        {/* ─── NAVBAR ─── */}
        <nav ref={navRef}>
          <div className="nav-inner">
            <Link href="/" className="nav-logo">
              <span style={{ color: "#e8c547" }}>port.</span>folio
            </Link>
            <ul className="nav-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><Link href="/portfolio/demo" style={{ color: "#8a8580", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500, transition: "color 0.2s" }}>Demo</Link></li>
            </ul>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Link href="/portfolio/demo" className="btn-ghost">View Demo</Link>
              <Link href="/onboarding" className="btn-gold">
                Get Started Free <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </nav>

        {/* ─── HERO ─── */}
        <section className="hero">
          <div className="hero-glow" />
          <div className="hero-inner">
            {/* Left */}
            <div className="hero-left">
              <div className="hero-badge hero-animate delay-1">
                <span className="hero-badge-dot" />
                Free &amp; Open Source
              </div>

              <h1 className="hero-h1 hero-animate delay-2">
                Your Resume,<br />
                <span className="italic-gold">Your Portfolio,</span><br />
                Perfected.
              </h1>

              <p className="hero-sub hero-animate delay-3">
                Upload your PDF. Get a stunning editorial portfolio with an intelligent AI chatbot — instantly, free forever.
              </p>

              <div className="hero-ctas hero-animate delay-4">
                <Link href="/onboarding" className="btn-gold-lg">
                  <Upload size={17} /> Upload Resume →
                </Link>
                <Link href="/portfolio/demo" className="btn-outline-lg">
                  <Globe size={17} /> See Live Demo
                </Link>
              </div>

              <div className="trust-chips hero-animate delay-5">
                <span className="trust-chip"><span className="check">✓</span> No signup</span>
                <span style={{ color: "rgba(138,133,128,0.4)" }}>·</span>
                <span className="trust-chip"><span className="check">✓</span> 30 seconds</span>
                <span style={{ color: "rgba(138,133,128,0.4)" }}>·</span>
                <span className="trust-chip"><span className="check">✓</span> Always free</span>
              </div>
            </div>

            {/* Right — Mockup */}
            <div className="hero-right" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div className="mockup-wrapper">
                <div className="mockup-card">
                  {/* Browser bar */}
                  <div className="mockup-topbar">
                    <span className="dot" style={{ background: "#e85d4a" }} />
                    <span className="dot" style={{ background: "#e8c547" }} />
                    <span className="dot" style={{ background: "#47c8b0" }} />
                    <span className="mockup-url">portfolioai.app/alex-chen</span>
                  </div>
                  {/* Body */}
                  <div className="mockup-body">
                    <div className="mockup-profile">
                      <div className="mockup-avatar">AC</div>
                      <div>
                        <div className="mockup-name">Alex Chen</div>
                        <div className="mockup-role">// Senior Engineer</div>
                      </div>
                    </div>
                    <div className="tl-label">Experience</div>
                    <div className="tl-item">
                      <span className="tl-dot" />
                      <span className="tl-text"><strong>Staff Engineer</strong> · Stripe</span>
                    </div>
                    <div className="tl-item">
                      <span className="tl-dot" />
                      <span className="tl-text"><strong>Senior Engineer</strong> · Vercel</span>
                    </div>
                    <div className="skill-chips">
                      {["TypeScript", "React", "Go", "AWS"].map((s) => (
                        <span key={s} className="skill-chip">{s}</span>
                      ))}
                    </div>
                  </div>
                  {/* Footer */}
                  <div className="mockup-footer">
                    <span>AI Chatbot Active</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span className="status-dot" /> Online
                    </span>
                  </div>
                </div>

                {/* Floating badges */}
                <span className="float-badge badge-teal">✓ AI Extracted</span>
                <span className="float-badge badge-gold">⟐ 3D View</span>
                <span className="float-badge badge-coral">★ Shareable</span>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="scroll-indicator">
            <span className="scroll-label">scroll</span>
            <span className="scroll-line" />
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section id="how-it-works" className="section section-divider">
          <div className="section-inner">
            <span className="section-tag reveal">// How It Works</span>
            <h2 className="section-heading reveal">
              From résumé to portfolio<br /><em>in 30 seconds</em>
            </h2>
            <div className="hiw-grid">
              {/* Card 1: Upload */}
              <div className="hiw-card reveal" style={{ transitionDelay: "0s" }}>
                <span className="hiw-num">01</span>
                <div className="hiw-icon"><Upload size={20} color="#e8c547" /></div>
                <div className="hiw-title">Drop Your File</div>
                <div className="hiw-desc">PDF, Word, or plain text. Our parser reads work history, skills, education, and projects automatically.</div>
                <div style={{ marginTop: "20px", background: "#0a0a0a", borderRadius: "10px", padding: "12px", border: "1px solid rgba(232,197,71,0.12)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <div style={{ width: 28, height: 28, background: "rgba(232,197,71,0.12)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Upload size={13} color="#e8c547" />
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", color: "#8a8580" }}>resume.pdf</span>
                    <span style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", color: "#47c8b0" }}>✓ ready</span>
                  </div>
                  <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "100%", background: "linear-gradient(90deg, #e8c547, #47c8b0)", borderRadius: 2, animation: "shimmerBar 2s ease-in-out infinite" }} />
                  </div>
                </div>
              </div>

              {/* Card 2: AI Parse */}
              <div className="hiw-card reveal" style={{ transitionDelay: "0.12s" }}>
                <span className="hiw-num">02</span>
                <div className="hiw-icon"><Bot size={20} color="#47c8b0" /></div>
                <div className="hiw-title">AI Reads Everything</div>
                <div className="hiw-desc">Our AI extracts your experience timeline, infers missing projects, ranks your skills, and writes your bio.</div>
                <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {[
                    { label: "Extracting experience…", done: true, color: "#47c8b0" },
                    { label: "Ranking skills…", done: true, color: "#e8c547" },
                    { label: "Generating projects…", done: true, color: "#9b8ec4" },
                    { label: "Building portfolio…", done: false, color: "#e85d4a" },
                  ].map((step) => (
                    <div key={step.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: step.done ? step.color : "#8a8580", opacity: step.done ? 1 : 0.4 }}>
                        {step.done ? "✓" : "○"}
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: step.done ? "#f0ece2" : "#8a8580", opacity: step.done ? 1 : 0.4 }}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Portfolio Live */}
              <div className="hiw-card reveal" style={{ transitionDelay: "0.24s" }}>
                <span className="hiw-num">03</span>
                <div className="hiw-icon"><Globe size={20} color="#9b8ec4" /></div>
                <div className="hiw-title">Your Portfolio is Live</div>
                <div className="hiw-desc">Instant URL, AI chatbot answering questions for you 24/7, and a design that makes recruiters bookmark it.</div>
                <div style={{ marginTop: "20px", background: "#0a0a0a", borderRadius: "10px", padding: "12px", border: "1px solid rgba(155,142,196,0.2)" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "#8a8580", marginBottom: "8px" }}>portfolioai.app/</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 700, color: "#f0ece2", marginBottom: "4px" }}>your-name</div>
                  <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                    {["Share", "Copy Link", "Chat AI"].map((btn, i) => (
                      <span key={btn} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", padding: "3px 8px", borderRadius: "4px", background: i === 0 ? "rgba(155,142,196,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${i === 0 ? "rgba(155,142,196,0.4)" : "rgba(255,255,255,0.08)"}`, color: i === 0 ? "#9b8ec4" : "#8a8580" }}>
                        {btn}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section id="features" className="section section-divider">
          <div className="section-inner">
            <span className="section-tag reveal">// Features</span>
            <h2 className="section-heading reveal">Everything you need</h2>
            <div className="feat-grid">
              {[
                { num: "01", icon: <Code2 size={18} color="#e85d4a" />, iconBg: "rgba(232,93,74,0.1)", title: "Editorial Template", desc: "Magazine-quality typography. Playfair Display headings, warm cream palette, crafted to impress." },
                { num: "02", icon: <Bot size={18} color="#47c8b0" />, iconBg: "rgba(71,200,176,0.1)", title: "AI Chatbot", desc: "Visitors chat with an AI version of you. Answers questions about your experience 24/7." },
                { num: "03", icon: <Sparkles size={18} color="#9b8ec4" />, iconBg: "rgba(155,142,196,0.1)", title: "3D Immersive View", desc: "Toggle to a cyberpunk 3D scene — same portfolio, different dimension. Optional." },
                { num: "04", icon: <Globe size={18} color="#e8c547" />, iconBg: "rgba(232,197,71,0.1)", title: "Shareable URL", desc: "Get portfolioai.app/your-name. Copy, share, done. Always live, always free." },
              ].map((f, i) => (
                <div key={f.num} className="feat-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                  <span className="feat-num">{f.num}</span>
                  <div className="feat-icon" style={{ background: f.iconBg }}>{f.icon}</div>
                  <div className="feat-title">{f.title}</div>
                  <div className="feat-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── EXAMPLES ─── */}
        <section className="section">
          <div className="section-inner">
            <span className="section-tag reveal">// Made with PortfolioAI</span>
            <h2 className="section-heading reveal">See what others built</h2>
            <div className="ex-grid">
              {[
                { gradient: "linear-gradient(135deg, #e85d4a 0%, #e8c547 100%)", name: "Sarah Kim", role: "Product Designer" },
                { gradient: "linear-gradient(135deg, #47c8b0 0%, #9b8ec4 100%)", name: "Marcus Lee", role: "Backend Engineer" },
                { gradient: "linear-gradient(135deg, #9b8ec4 0%, #e85d4a 100%)", name: "Priya Patel", role: "ML Researcher" },
                { gradient: "linear-gradient(135deg, #e8c547 0%, #47c8b0 100%)", name: "Tom Briggs", role: "Frontend Dev" },
              ].map((ex, i) => (
                <div key={ex.name} className="ex-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                  <div className="ex-thumb" style={{ background: ex.gradient }}>
                    <div className="ex-overlay">
                      <span className="ex-label">View Portfolio →</span>
                    </div>
                  </div>
                  <div className="ex-info">
                    <div className="ex-name">{ex.name}</div>
                    <div className="ex-role">{ex.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="section">
          <div className="section-inner">
            <div className="cta-box reveal">
              <div className="cta-top-line" />
              <h2 className="cta-title">Your portfolio,<em style={{ fontStyle: "italic", color: "#e8c547" }}> live in 30 seconds</em></h2>
              <p className="cta-sub">
                Upload your resume and walk away with a portfolio that makes hiring managers stop scrolling. No design skills needed.
              </p>
              <div className="stat-chips">
                {["2,400+ Portfolios Created", "Zero Paywalls", "Free Forever"].map((s) => (
                  <span key={s} className="stat-chip">{s}</span>
                ))}
              </div>
              <div className="cta-btns">
                <Link href="/portfolio/demo" className="btn-outline-lg">
                  See Live Demo →
                </Link>
                <Link href="/onboarding" className="btn-gold-lg">
                  <Upload size={16} /> Build My Portfolio →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── TECH STRIP ─── */}
        <div className="tech-strip">
          <div className="tech-inner">
            <span className="tech-label">Powered by</span>
            <div className="tech-pills">
              {[
                { label: "Next.js 15", icon: <Code2 size={13} /> },
                { label: "Three.js", icon: <Sparkles size={13} /> },
                { label: "HuggingFace AI", icon: <Bot size={13} /> },
                { label: "Supabase", icon: <Globe size={13} /> },
                { label: "TypeScript", icon: <Code2 size={13} /> },
              ].map((tech) => (
                <span key={tech.label} className="tech-pill">
                  {tech.icon} {tech.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ─── FOOTER ─── */}
        <footer>
          <div className="footer-inner">
            <div>
              <div className="footer-logo"><span style={{ color: "#e8c547" }}>port.</span>folio</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "#8a8580", marginTop: "4px" }}>The free AI portfolio builder.</div>
            </div>
            <div className="footer-links">
              {[{ label: "Home", href: "/" }, { label: "Features", href: "#features" }, { label: "Demo", href: "/portfolio/demo" }, { label: "GitHub", href: "https://github.com" }].map((l) => (
                <Link key={l.label} href={l.href}>{l.label}</Link>
              ))}
            </div>
            <div className="footer-copy">© 2026 PortfolioAI · Free forever</div>
          </div>
        </footer>
      </div>
    </>
  );
}
