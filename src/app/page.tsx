"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function HomePage() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        navRef.current.style.background =
          window.scrollY > 40 ? "rgba(10,10,10,0.97)" : "rgba(10,10,10,0.72)";
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.1 }
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
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0a0a0a; --bg-card: #111111; --bg-card-hover: #1a1a1a;
          --text: #f0ece2; --text-muted: #8a8580; --accent: #e8c547;
          --coral: #e85d4a; --teal: #47c8b0; --lavender: #9b8ec4;
          --serif: 'Playfair Display', Georgia, serif;
          --sans: 'DM Sans', system-ui, sans-serif;
          --mono: 'JetBrains Mono', monospace;
          --radius: 12px; --radius-lg: 20px;
          --transition: 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        ::selection { background: var(--accent); color: #0a0a0a; }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--text); font-family: var(--sans); font-size: 16px; line-height: 1.6; overflow-x: hidden; }
        body::after { content: ''; position: fixed; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); opacity: 0.03; pointer-events: none; z-index: 9999; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }

        /* NAV */
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; backdrop-filter: blur(20px) saturate(1.4); -webkit-backdrop-filter: blur(20px) saturate(1.4); background: rgba(10,10,10,0.72); border-bottom: 1px solid rgba(232,197,71,0.08); transition: background 0.3s; }
        .nav-inner { display: flex; align-items: center; justify-content: space-between; height: 64px; max-width: 1200px; margin: 0 auto; padding: 0 32px; }
        .nav-logo { font-family: var(--serif); font-size: 1.25rem; font-weight: 700; color: var(--text); text-decoration: none; letter-spacing: -0.02em; }
        .nav-logo span { color: var(--accent); }
        .nav-links { display: flex; align-items: center; gap: 36px; list-style: none; }
        .nav-links a { color: var(--text-muted); text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: color var(--transition); }
        .nav-links a:hover { color: var(--text); }
        .nav-actions { display: flex; align-items: center; gap: 16px; }
        .btn-ghost { background: none; border: none; color: var(--text-muted); font-family: var(--sans); font-size: 0.875rem; font-weight: 500; cursor: pointer; padding: 8px 4px; transition: color var(--transition); text-decoration: none; }
        .btn-ghost:hover { color: var(--text); }

        /* HERO */
        .hero { min-height: 100vh; display: flex; align-items: center; padding: 100px 32px 64px; position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(232,197,71,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(232,197,71,0.03) 1px, transparent 1px); background-size: 80px 80px; }
        .hero-glow { position: absolute; top: 20%; left: 50%; transform: translateX(-50%); width: 800px; height: 400px; background: radial-gradient(ellipse, rgba(232,197,71,0.06) 0%, transparent 70%); pointer-events: none; }
        .hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; max-width: 1200px; margin: 0 auto; width: 100%; }
        .hero-left { max-width: 580px; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(232,197,71,0.35); border-radius: 100px; padding: 6px 16px; font-family: var(--mono); font-size: 0.75rem; color: var(--accent); margin-bottom: 28px; background: rgba(232,197,71,0.05); letter-spacing: 0.02em; }
        .hero-badge::before { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: pulse-dot 2s ease-in-out infinite; }
        @keyframes pulse-dot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.8); } }
        .hero-h1 { font-family: var(--serif); font-size: clamp(3rem, 5.5vw, 4.5rem); font-weight: 700; line-height: 1.05; letter-spacing: -0.03em; margin-bottom: 24px; }
        .hero-h1 .line-italic { font-style: italic; color: var(--accent); }
        .hero-sub { font-size: 1.0625rem; color: var(--text-muted); line-height: 1.65; max-width: 440px; margin-bottom: 36px; }
        .hero-ctas { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; flex-wrap: wrap; }
        .btn-gold-lg { display: inline-flex; align-items: center; gap: 8px; background: var(--accent); color: #0a0a0a; border: none; border-radius: 10px; font-family: var(--sans); font-size: 1rem; font-weight: 700; padding: 14px 28px; cursor: pointer; transition: all var(--transition); text-decoration: none; }
        .btn-gold-lg:hover { background: #f0d060; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(232,197,71,0.3); }
        .btn-outline-lg { display: inline-flex; align-items: center; gap: 8px; background: transparent; color: var(--text); border: 1px solid rgba(240,236,226,0.18); border-radius: 10px; font-family: var(--sans); font-size: 1rem; font-weight: 500; padding: 14px 28px; cursor: pointer; transition: all var(--transition); text-decoration: none; }
        .btn-outline-lg:hover { border-color: rgba(232,197,71,0.4); color: var(--accent); background: rgba(232,197,71,0.05); }
        .trust-chips { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .trust-chip { font-size: 0.8125rem; color: var(--text-muted); font-weight: 500; }
        .trust-chip .check { color: var(--teal); margin-right: 4px; }

        /* MOCKUP */
        .hero-right { position: relative; display: flex; justify-content: center; align-items: center; }
        .mockup-wrapper { position: relative; animation: float 5s ease-in-out infinite; }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-14px); } }
        .mockup-card { background: var(--bg-card); border: 1px solid rgba(232,197,71,0.25); border-radius: var(--radius-lg); width: 360px; overflow: hidden; box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,197,71,0.08), inset 0 1px 0 rgba(255,255,255,0.04); }
        .mockup-topbar { background: #0d0d0d; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 10px 14px; display: flex; align-items: center; gap: 6px; }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .mockup-url { margin-left: 10px; flex: 1; background: rgba(255,255,255,0.04); border-radius: 5px; padding: 4px 10px; font-family: var(--mono); font-size: 0.625rem; color: var(--text-muted); }
        .mockup-body { padding: 20px; }
        .mockup-profile { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .mockup-avatar { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, var(--accent) 0%, var(--coral) 100%); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-family: var(--serif); font-size: 1.1rem; font-weight: 700; color: #0a0a0a; }
        .mockup-name { font-family: var(--serif); font-size: 0.875rem; font-weight: 600; color: var(--text); }
        .mockup-role { font-family: var(--mono); font-size: 0.625rem; color: var(--accent); margin-top: 2px; }
        .mockup-tl-label { font-family: var(--mono); font-size: 0.5625rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
        .mockup-tl-item { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
        .tl-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-top: 4px; flex-shrink: 0; }
        .tl-text { font-size: 0.6875rem; color: var(--text-muted); line-height: 1.4; }
        .tl-text strong { color: var(--text); font-weight: 500; }
        .mockup-skills { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 14px; }
        .skill-chip { background: rgba(255,255,255,0.06); border-radius: 4px; padding: 3px 8px; font-family: var(--mono); font-size: 0.5625rem; color: var(--text-muted); }
        .mockup-footer { background: rgba(232,197,71,0.05); border-top: 1px solid rgba(232,197,71,0.12); padding: 10px 20px; font-family: var(--mono); font-size: 0.625rem; color: var(--accent); display: flex; align-items: center; justify-content: space-between; }
        .mockup-status { display: flex; align-items: center; gap: 5px; }
        .status-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--teal); animation: blink 2.4s ease-in-out infinite; }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        .float-badge { position: absolute; border-radius: 10px; padding: 8px 13px; font-family: var(--mono); font-size: 0.6875rem; font-weight: 500; white-space: nowrap; box-shadow: 0 8px 24px rgba(0,0,0,0.4); backdrop-filter: blur(10px); }
        .float-badge-teal { background: rgba(71,200,176,0.12); border: 1px solid rgba(71,200,176,0.3); color: var(--teal); top: -18px; right: -20px; animation: fb1 4s ease-in-out infinite; }
        .float-badge-gold { background: rgba(232,197,71,0.1); border: 1px solid rgba(232,197,71,0.3); color: var(--accent); bottom: 60px; left: -28px; animation: fb2 5s ease-in-out infinite; }
        .float-badge-coral { background: rgba(232,93,74,0.12); border: 1px solid rgba(232,93,74,0.3); color: var(--coral); bottom: -16px; right: -10px; animation: fb3 4.5s ease-in-out infinite; }
        @keyframes fb1 { 0%,100%{transform:translateY(0) rotate(-2deg);} 50%{transform:translateY(-8px) rotate(0deg);} }
        @keyframes fb2 { 0%,100%{transform:translateY(0) rotate(2deg);} 50%{transform:translateY(-6px) rotate(-1deg);} }
        @keyframes fb3 { 0%,100%{transform:translateY(0) rotate(-1deg);} 50%{transform:translateY(-10px) rotate(1deg);} }
        .scroll-indicator { position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 6px; color: var(--text-muted); font-family: var(--mono); font-size: 0.625rem; letter-spacing: 0.1em; }
        .scroll-arrow { animation: bounce 2s ease-in-out infinite; font-size: 1rem; color: var(--accent); }
        @keyframes bounce { 0%,100%{transform:translateY(0);opacity:1;} 50%{transform:translateY(8px);opacity:0.5;} }

        /* SECTIONS */
        .section { padding: 96px 32px; border-top: 1px solid rgba(255,255,255,0.05); }
        .section-inner { max-width: 1200px; margin: 0 auto; }
        .section-label { font-family: var(--mono); font-size: 0.75rem; color: var(--accent); letter-spacing: 0.08em; margin-bottom: 16px; display: block; }
        .section-h2 { font-family: var(--serif); font-size: clamp(2rem, 3.5vw, 2.875rem); font-weight: 700; line-height: 1.12; letter-spacing: -0.025em; margin-bottom: 56px; }
        .section-h2 em { font-style: italic; color: var(--accent); }
        .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.65s cubic-bezier(0.4,0,0.2,1), transform 0.65s cubic-bezier(0.4,0,0.2,1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-d1 { transition-delay: 0.1s; }
        .reveal-d2 { transition-delay: 0.2s; }
        .reveal-d3 { transition-delay: 0.3s; }

        /* HOW IT WORKS */
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .step-card { background: var(--bg-card); border: 1px solid rgba(255,255,255,0.06); border-radius: var(--radius-lg); padding: 36px 32px; position: relative; overflow: hidden; transition: all var(--transition); cursor: default; }
        .step-card:hover { border-color: rgba(232,197,71,0.3); background: var(--bg-card-hover); transform: translateY(-6px); box-shadow: 0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(232,197,71,0.1); }
        .step-number-bg { position: absolute; top: -10px; right: 20px; font-family: var(--mono); font-size: 6rem; font-weight: 600; color: rgba(232,197,71,0.06); line-height: 1; pointer-events: none; letter-spacing: -0.04em; transition: color var(--transition); }
        .step-card:hover .step-number-bg { color: rgba(232,197,71,0.1); }
        .step-icon { width: 44px; height: 44px; background: rgba(232,197,71,0.1); border: 1px solid rgba(232,197,71,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 1.125rem; color: var(--accent); }
        .step-num-label { font-family: var(--mono); font-size: 0.6875rem; color: var(--accent); letter-spacing: 0.1em; margin-bottom: 10px; }
        .step-title { font-family: var(--serif); font-size: 1.25rem; font-weight: 600; color: var(--text); margin-bottom: 12px; letter-spacing: -0.01em; }
        .step-desc { font-size: 0.9375rem; color: var(--text-muted); line-height: 1.65; }

        /* FEATURES */
        .features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .feature-card { background: var(--bg-card); border: 1px solid rgba(255,255,255,0.06); border-radius: var(--radius-lg); padding: 36px; position: relative; overflow: hidden; transition: all var(--transition); cursor: default; }
        .feature-card:hover { background: var(--bg-card-hover); border-color: rgba(232,197,71,0.2); transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.35); }
        .feature-num { font-family: var(--mono); font-size: 0.6875rem; color: var(--accent); letter-spacing: 0.1em; margin-bottom: 14px; }
        .feature-title { font-family: var(--serif); font-size: 1.375rem; font-weight: 600; color: var(--text); margin-bottom: 10px; letter-spacing: -0.015em; }
        .feature-desc { font-size: 0.9375rem; color: var(--text-muted); line-height: 1.65; margin-bottom: 28px; }
        .feat-visual { border-radius: 10px; overflow: hidden; }
        .palette-swatches { display: flex; height: 44px; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
        .swatch { flex: 1; height: 100%; }
        .font-preview { margin-top: 12px; font-family: var(--serif); font-size: 1.5rem; font-weight: 400; color: var(--text-muted); letter-spacing: 0.04em; }
        .chat-mockup { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 9px; }
        .chat-bubble { max-width: 80%; padding: 8px 13px; border-radius: 10px; font-size: 0.75rem; line-height: 1.45; }
        .chat-bubble.them { background: rgba(255,255,255,0.07); color: var(--text-muted); border-radius: 10px 10px 10px 3px; align-self: flex-start; }
        .chat-bubble.me { background: rgba(232,197,71,0.12); color: var(--accent); border-radius: 10px 10px 3px 10px; align-self: flex-end; }
        .three-d-visual { display: flex; align-items: center; gap: 12px; }
        .three-d-badge { background: linear-gradient(135deg, rgba(155,142,196,0.2), rgba(71,200,176,0.2)); border: 1px solid rgba(155,142,196,0.3); border-radius: 10px; padding: 14px 18px; font-family: var(--mono); font-size: 1.75rem; font-weight: 600; color: var(--lavender); letter-spacing: -0.04em; }
        .three-d-label { font-family: var(--mono); font-size: 0.75rem; color: var(--text-muted); }
        .three-d-btn { margin-top: 4px; display: inline-flex; align-items: center; gap: 6px; font-family: var(--mono); font-size: 0.6875rem; color: var(--accent); background: rgba(232,197,71,0.08); border: 1px solid rgba(232,197,71,0.2); border-radius: 6px; padding: 5px 10px; }
        .url-mock { display: flex; align-items: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px 14px; gap: 10px; }
        .url-text { flex: 1; font-family: var(--mono); font-size: 0.75rem; color: var(--text-muted); }
        .url-text span { color: var(--accent); }
        .url-copy-btn { background: rgba(232,197,71,0.1); border: 1px solid rgba(232,197,71,0.2); border-radius: 5px; padding: 4px 10px; font-family: var(--mono); font-size: 0.625rem; color: var(--accent); cursor: pointer; }

        /* PROOF */
        .proof-card { background: var(--bg-card); border: 1px solid rgba(232,197,71,0.2); border-radius: var(--radius-lg); padding: 56px 48px; text-align: center; max-width: 800px; margin: 0 auto; position: relative; overflow: hidden; }
        .proof-card::before { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 300px; height: 1px; background: linear-gradient(90deg, transparent, var(--accent), transparent); }
        .proof-h2 { font-family: var(--serif); font-size: clamp(1.75rem, 3vw, 2.5rem); font-weight: 700; color: var(--text); margin-bottom: 14px; letter-spacing: -0.025em; }
        .proof-desc { font-size: 0.9375rem; color: var(--text-muted); max-width: 480px; margin: 0 auto 32px; line-height: 1.65; }
        .proof-stats { display: flex; justify-content: center; gap: 20px; margin-bottom: 36px; flex-wrap: wrap; }
        .stat-chip { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 100px; padding: 8px 18px; font-family: var(--mono); font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; }
        .stat-chip strong { color: var(--text); }
        .proof-actions { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; }
        .btn-outline { display: inline-flex; align-items: center; gap: 6px; background: transparent; color: var(--text); border: 1px solid rgba(240,236,226,0.2); border-radius: 8px; font-family: var(--sans); font-size: 0.875rem; font-weight: 500; padding: 10px 20px; cursor: pointer; transition: all var(--transition); text-decoration: none; }
        .btn-outline:hover { border-color: var(--accent); color: var(--accent); background: rgba(232,197,71,0.06); }
        .btn-gold { display: inline-flex; align-items: center; gap: 6px; background: var(--accent); color: #0a0a0a; border: none; border-radius: 8px; font-family: var(--sans); font-size: 0.875rem; font-weight: 600; padding: 10px 20px; cursor: pointer; transition: all var(--transition); text-decoration: none; white-space: nowrap; }
        .btn-gold:hover { background: #f0d060; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(232,197,71,0.25); }

        /* TECH + FOOTER */
        .tech-strip { border-top: 1px solid rgba(255,255,255,0.05); padding: 48px 32px; }
        .tech-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: center; gap: 32px; flex-wrap: wrap; }
        .tech-label { font-family: var(--mono); font-size: 0.6875rem; color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }
        .tech-divider { width: 1px; height: 20px; background: rgba(255,255,255,0.1); }
        .tech-pills { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: center; }
        .tech-pill { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 100px; padding: 6px 16px; font-family: var(--mono); font-size: 0.75rem; color: var(--text-muted); transition: all var(--transition); }
        .tech-pill:hover { border-color: rgba(232,197,71,0.25); color: var(--text); }
        footer { border-top: 1px solid rgba(255,255,255,0.07); padding: 48px 32px; }
        .footer-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 48px; align-items: start; }
        .footer-logo { font-family: var(--serif); font-size: 1.125rem; font-weight: 700; color: var(--text); margin-bottom: 10px; }
        .footer-logo span { color: var(--accent); }
        .footer-tagline { font-size: 0.8125rem; color: var(--text-muted); line-height: 1.6; }
        .footer-col-title { font-family: var(--mono); font-size: 0.6875rem; color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; }
        .footer-links { display: flex; flex-direction: column; gap: 10px; list-style: none; }
        .footer-links a { font-size: 0.875rem; color: var(--text-muted); text-decoration: none; transition: color var(--transition); }
        .footer-links a:hover { color: var(--text); }
        .footer-right-text { font-size: 0.8125rem; color: var(--text-muted); line-height: 1.8; }

        /* MOBILE */
        @media (max-width: 900px) {
          .nav-links { display: none; }
          .hero { padding: 90px 20px 48px; }
          .hero-inner { grid-template-columns: 1fr; gap: 48px; }
          .hero-left { max-width: 100%; }
          .hero-right { order: -1; }
          .mockup-card { width: 100%; max-width: 360px; }
          .steps-grid { grid-template-columns: 1fr; }
          .features-grid { grid-template-columns: 1fr; }
          .footer-inner { grid-template-columns: 1fr; gap: 32px; }
          .proof-card { padding: 36px 24px; }
          .section { padding: 64px 20px; }
        }
        @media (max-width: 540px) {
          .hero-ctas { flex-direction: column; align-items: flex-start; }
          .nav-inner { padding: 0 20px; }
        }
      `}</style>

      <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>

        {/* NAVBAR */}
        <nav ref={navRef}>
          <div className="nav-inner">
            <Link href="/" className="nav-logo">Portfolio<span>AI</span></Link>
            <ul className="nav-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><Link href="/portfolio/demo" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>Examples</Link></li>
            </ul>
            <div className="nav-actions">
              <Link href="/portfolio/demo" className="btn-ghost">View Demo</Link>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero" id="home">
          <div className="hero-glow" />
          <div className="hero-inner">
            <div className="hero-left">
              <div className="hero-badge">✓ Free &amp; Open Source</div>
              <h1 className="hero-h1">
                Your Resume,<br />
                <span className="line-italic">Your Portfolio</span><br />
                In Seconds.
              </h1>
              <p className="hero-sub">
                Upload your PDF resume. Get a stunning editorial portfolio with an AI chatbot — instantly, for free.
              </p>
              <div className="hero-ctas">
                <Link href="/onboarding" className="btn-gold-lg">Upload Resume →</Link>
                <Link href="/portfolio/demo" className="btn-outline-lg">See Live Demo</Link>
              </div>
              <div className="trust-chips">
                <span className="trust-chip"><span className="check">✓</span> No signup required</span>
                <span className="trust-chip"><span className="check">✓</span> Takes 30 seconds</span>
                <span className="trust-chip"><span className="check">✓</span> Always free</span>
              </div>
            </div>

            <div className="hero-right">
              <div className="mockup-wrapper">
                <div className="float-badge float-badge-teal">✓ AI Extracted</div>
                <div className="float-badge float-badge-gold">⊙ 3D View Ready</div>
                <div className="float-badge float-badge-coral">★ Shareable Link</div>
                <div className="mockup-card">
                  <div className="mockup-topbar">
                    <span className="dot" style={{ background: "#e85d4a" }} />
                    <span className="dot" style={{ background: "#e8c547" }} />
                    <span className="dot" style={{ background: "#47c8b0" }} />
                    <span className="mockup-url">portfolioai.app/alex-chen</span>
                  </div>
                  <div className="mockup-body">
                    <div className="mockup-profile">
                      <div className="mockup-avatar">AC</div>
                      <div>
                        <div className="mockup-name">Alex Chen</div>
                        <div className="mockup-role">Senior Engineer</div>
                      </div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <div className="mockup-tl-label">Experience</div>
                      {[
                        { color: "var(--accent)", name: "Google — Staff Engineer", dates: "2022 – Present" },
                        { color: "var(--teal)", name: "Stripe — Senior SWE", dates: "2019 – 2022" },
                        { color: "var(--lavender)", name: "Airbnb — Engineer", dates: "2017 – 2019" },
                      ].map((item) => (
                        <div key={item.name} className="mockup-tl-item">
                          <div className="tl-dot" style={{ background: item.color }} />
                          <div className="tl-text"><strong>{item.name}</strong><br />{item.dates}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mockup-skills">
                      {["TypeScript", "Go", "Rust", "K8s", "React"].map((s) => (
                        <span key={s} className="skill-chip">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="mockup-footer">
                    <span>Your portfolio, live</span>
                    <div className="mockup-status">
                      <div className="status-dot" />
                      <span>Live</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="scroll-indicator">
            <span>scroll</span>
            <div className="scroll-arrow">↓</div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section" id="how-it-works">
          <div className="section-inner">
            <span className="section-label reveal">// How It Works</span>
            <h2 className="section-h2 reveal reveal-d1">From resume to portfolio<br />in <em>30 seconds</em></h2>
            <div className="steps-grid">
              {[
                { num: "01", icon: "⇧", title: "Drop Your Resume", desc: "Upload PDF, Word, or text. Our AI reads everything — work history, skills, projects, education." },
                { num: "02", icon: "⬥", title: "AI Extracts Everything", desc: "Claude AI structures your resume data: experience timeline, skill levels, project highlights, contact info." },
                { num: "03", icon: "⬛", title: "Get Your Portfolio", desc: "Instantly get a beautiful editorial portfolio page at your own URL. Share with one click." },
              ].map((s, i) => (
                <div key={s.num} className={`step-card reveal reveal-d${i + 1}`}>
                  <div className="step-number-bg">{s.num}</div>
                  <div className="step-icon">{s.icon}</div>
                  <div className="step-num-label">STEP {s.num}</div>
                  <div className="step-title">{s.title}</div>
                  <p className="step-desc">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="section" id="features">
          <div className="section-inner">
            <span className="section-label reveal">// Features</span>
            <h2 className="section-h2 reveal reveal-d1">Everything you need</h2>
            <div className="features-grid">
              <div className="feature-card reveal reveal-d1">
                <div className="feature-num">01</div>
                <div className="feature-title">Editorial Design Template</div>
                <p className="feature-desc">Playfair Display typography, warm cream palette, magazine-quality layout. Looks hand-crafted by a designer.</p>
                <div className="feat-visual">
                  <div className="palette-swatches">
                    {["#0a0a0a","#111111","#f0ece2","#e8c547","#e85d4a","#47c8b0","#9b8ec4"].map((c) => (
                      <div key={c} className="swatch" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="font-preview">Aa Bb Cc</div>
                </div>
              </div>
              <div className="feature-card reveal reveal-d2">
                <div className="feature-num">02</div>
                <div className="feature-title">AI Chatbot Included</div>
                <p className="feature-desc">Visitors can chat with an AI trained on your resume. Answers questions about your experience, projects, and skills.</p>
                <div className="chat-mockup feat-visual">
                  <div className="chat-bubble them">What stack did you use at Stripe?</div>
                  <div className="chat-bubble me">Go microservices, Postgres, React — and lots of Kafka for streaming.</div>
                  <div className="chat-bubble them">Any open source contributions?</div>
                </div>
              </div>
              <div className="feature-card reveal reveal-d1">
                <div className="feature-num">03</div>
                <div className="feature-title">3D Immersive View</div>
                <p className="feature-desc">Optional cyberpunk 3D scene — the same portfolio, a different dimension entirely. Toggle with one click.</p>
                <div className="three-d-visual feat-visual">
                  <div className="three-d-badge">3D</div>
                  <div>
                    <div className="three-d-label">Powered by Three.js</div>
                    <div className="three-d-btn">Switch to 3D ⊙</div>
                  </div>
                </div>
              </div>
              <div className="feature-card reveal reveal-d2">
                <div className="feature-num">04</div>
                <div className="feature-title">Shareable URL</div>
                <p className="feature-desc">Get portfolioai.app/your-name — share with recruiters, copy to clipboard, always live and up-to-date.</p>
                <div className="feat-visual">
                  <div className="url-mock">
                    <div className="url-text">portfolioai.app/<span>alex-chen</span></div>
                    <div className="url-copy-btn">copy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROOF */}
        <section className="section">
          <div className="section-inner">
            <div className="proof-card reveal">
              <h2 className="proof-h2">100% Free &amp; Open Source</h2>
              <p className="proof-desc">No paywalls, no hidden fees. PortfolioAI is open source — fork it, contribute, or just use it to build your portfolio.</p>
              <div className="proof-stats">
                <div className="stat-chip"><strong>2,400+</strong> Portfolios Created</div>
                <div className="stat-chip">GitHub Stars <strong>★ 840</strong></div>
                <div className="stat-chip">MIT License</div>
              </div>
              <div className="proof-actions">
                <a href="https://github.com/palashpatidar96/portfolio-builder" target="_blank" rel="noopener noreferrer" className="btn-outline">View on GitHub</a>
                <Link href="/onboarding" className="btn-gold">Build My Portfolio →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* TECH STRIP */}
        <div className="tech-strip">
          <div className="tech-inner">
            <span className="tech-label">Powered by</span>
            <div className="tech-divider" />
            <div className="tech-pills">
              {["Next.js", "Three.js", "HuggingFace AI", "Supabase", "TypeScript"].map((t) => (
                <div key={t} className="tech-pill">{t}</div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer>
          <div className="footer-inner">
            <div>
              <div className="footer-logo">Portfolio<span>AI</span></div>
              <p className="footer-tagline">The free, open-source AI portfolio builder. Upload your resume, get a portfolio in seconds.</p>
            </div>
            <div>
              <div className="footer-col-title">Links</div>
              <ul className="footer-links">
                <li><Link href="/">Home</Link></li>
                <li><a href="#features">Features</a></li>
                <li><Link href="/portfolio/demo">Demo</Link></li>
                <li><a href="https://github.com/palashpatidar96/portfolio-builder" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Legal</div>
              <div className="footer-right-text">
                Built with PortfolioAI<br />
                MIT License<br />
                © 2026 PortfolioAI
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
