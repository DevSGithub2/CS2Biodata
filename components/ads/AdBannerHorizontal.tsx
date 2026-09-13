"use client";

import React, { useEffect } from "react";

interface AdBannerHorizontalProps {
  slotId?: string;
  className?: string;
}

export function AdBannerHorizontal({
  slotId = "728x90-leaderboard",
  className = "",
}: AdBannerHorizontalProps) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch {}
  }, []);

  return (
    <div className={`w-full max-w-4xl mx-auto px-4 my-8 ${className}`}>
      <div className="relative w-full rounded-xl border border-cyan-500/20 bg-[#070a12]/90 backdrop-blur-md p-3 shadow-[0_0_25px_rgba(0,0,0,0.6)]">
        {/* Cyber corner accents */}
        <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute -top-[1px] -right-[1px] w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute -bottom-[1px] -left-[1px] w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

        {/* Banner header metadata */}
        <div className="flex items-center justify-between px-2 pb-2 text-[10px] font-mono tracking-widest text-zinc-500 uppercase border-b border-white/[0.04]">
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            SPONSORED PARTNER TELEMETRY
          </span>
          <span className="text-zinc-600">728 × 90 LEADERBOARD</span>
        </div>

        {/* 728x90 Container */}
        <div className="relative w-full min-h-[90px] mt-2 flex items-center justify-center overflow-hidden rounded bg-black/40 border border-white/[0.04]">
          {/* AdSense ins tag */}
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "728px", height: "90px" }}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-placeholder"}
            data-ad-slot={slotId}
            data-ad-format="horizontal"
            data-full-width-responsive="false"
          />

          {/* Tactical Fallback / Placeholder */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-zinc-400">
              <span className="text-cyan-400">CS2BIODATA</span>
              <span>//</span>
              <span>PARTNER NETWORK</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-600 mt-1 uppercase tracking-widest">
              ADVERTISEMENT RESERVATION SLOT • 728×90 LEADERBOARD
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
