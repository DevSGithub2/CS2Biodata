import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#03060a]/90 backdrop-blur-md py-6 px-6 font-mono text-xs text-gray-500 relative z-20">
      <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-300 tracking-wider">CS2BIODATA</span>
          <span>•</span>
          <span>AUTONOMOUS VALVE CS2 TELEMETRY</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/about" className="hover:text-cyan-400 transition-colors uppercase">
            About
          </Link>
          <Link href="/privacy" className="hover:text-cyan-400 transition-colors uppercase">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-cyan-400 transition-colors uppercase">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
