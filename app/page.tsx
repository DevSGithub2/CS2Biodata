"use client";

import React from "react";
import { Navbar } from "@/components/home/Navbar";
import { TacticalGrid } from "@/components/ui/TacticalGrid";
import { SearchBar } from "@/components/home/SearchBar";
import { CTWidget, TWidget } from "@/components/home/TelemetryWidgets";
import { Footer } from "@/components/home/Footer";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#04070a] text-gray-200 overflow-hidden font-mono flex flex-col justify-between select-none">
      <TacticalGrid />
      <Navbar />

      {/* Hero Section Container */}
      <div className="relative z-10 max-w-[1700px] w-full mx-auto px-6 sm:px-12 py-8 lg:py-16 flex-1 flex flex-col items-center justify-center">
        
        {/* CRT Telemetry Tag */}
        <div className="mb-8 inline-flex items-center gap-2.5 px-4 py-1.5 bg-cyan-950/40 border border-cyan-500/50 rounded-full text-xs text-cyan-300 tracking-wider shadow-[0_0_15px_rgba(0,255,204,0.15)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold uppercase tracking-widest text-[11px]">CS2 Bio Data &amp; GC Telemetry</span>
        </div>

        {/* Dynamic Telemetry Layout */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-12 xl:gap-20 my-auto">
          
          {/* Left Flank: CT Force HUD */}
          <div className="hidden xl:flex shrink-0 justify-start">
            <CTWidget />
          </div>

          {/* Center Main Stage */}
          <div className="flex-1 max-w-3xl flex flex-col items-center text-center px-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-[1.05]">
              Unmask Every Player
              <span className="block my-2 text-3xl sm:text-4xl text-gray-400 font-light tracking-normal lowercase">
                in
              </span>
              <span className="block text-cyan-400 drop-shadow-[0_0_35px_rgba(0,255,204,0.5)]">
                Counter-Strike 2
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm sm:text-base text-gray-400 font-sans leading-relaxed">
              Real-time competitive combat intelligence across Valve &amp; third-party matchmaking.
            </p>

            {/* Tactical Badges */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 text-xs">
              <span className="px-3 py-1 bg-[#09111b] border border-cyan-700/50 text-cyan-300 font-semibold">
                Sub-Tick Telemetry
              </span>
              <span className="px-3 py-1 bg-[#09111b] border border-rose-800/50 text-rose-300 font-semibold">
                Premier Rating
              </span>
              <span className="px-3 py-1 bg-[#09111b] border border-amber-700/50 text-amber-300 font-semibold">
                FACEIT ELO
              </span>
              <span className="px-3 py-1 bg-[#09111b] border border-emerald-800/50 text-emerald-300 font-semibold">
                VAC Trust Engine
              </span>
            </div>

            {/* Search Input Console */}
            <SearchBar />
          </div>

          {/* Right Flank: T Force HUD */}
          <div className="hidden xl:flex shrink-0 justify-end">
            <TWidget />
          </div>

        </div>
      </div>

      {/* Military HUD Operational Status Bar */}
      <Footer />
    </main>
  );
}
