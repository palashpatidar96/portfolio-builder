"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-grid flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-8xl font-bold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Portfolio Not Found</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md">
          This portfolio doesn&apos;t exist yet. Want to create your own?
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link
            href="/onboarding"
            className="px-6 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] font-medium hover:bg-[var(--bg-hover)] transition-colors flex items-center gap-2"
          >
            Create Portfolio
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
