"use client";

import React from "react";

export function TacticalLogo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_8px_rgba(0,255,204,0.6)]"
      >
        {/* Outer Angular Targeting Brackets */}
        <path
          d="M6 14V6H14M26 6H34V14M34 26V34H26M14 34H6V26"
          stroke="#00ffcc"
          strokeWidth="2.2"
          strokeLinecap="square"
        />
        {/* Secondary Inner Reticle Ring */}
        <circle
          cx="20"
          cy="20"
          r="10"
          stroke="#00ffcc"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          className="opacity-70"
        />
        {/* Cardinal Crosshair Prongs */}
        <line x1="20" y1="4" x2="20" y2="10" stroke="#00ffcc" strokeWidth="2" />
        <line x1="20" y1="30" x2="20" y2="36" stroke="#00ffcc" strokeWidth="2" />
        <line x1="4" y1="20" x2="10" y2="20" stroke="#00ffcc" strokeWidth="2" />
        <line x1="30" y1="20" x2="36" y2="20" stroke="#00ffcc" strokeWidth="2" />
        {/* Core Focal Point */}
        <circle cx="20" cy="20" r="2.5" fill="#00ffcc" />
      </svg>
    </div>
  );
}
