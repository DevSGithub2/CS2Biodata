"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Shield,
  Zap,
  Activity,
  Trophy,
  Flame,
  Crosshair,
  Lock,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [navSearch, setNavSearch] = useState("");

  const proProfiles = [
    { name: "ZywOo", id: "76561198058200870" },
    { name: "m0NESY", id: "76561198810168734" },
    { name: "donk", id: "76561198413948549" },
    { name: "s1mple", id: "76561198034202275" },
    { name: "ropz", id: "76561198121220465" },
    { name: "b1t", id: "76561198328770499" },
  ];

  const handleAnalyze = (queryTarget: string) => {
    if (!queryTarget.trim()) return;
    // In production, navigate to your dossier route or pass query
    router.push(`/player/${encodeURIComponent(queryTarget.trim())}`);
  };

  return (
    <div className="relative min-h-screen bg-[#05070a] text-[#d6e0ea] font-sans antialiased overflow-x-hidden selection:bg-emerald-400 selection:text-black">
      {/* Background Radial Neon Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-cyan-500/5 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-10 w-[300px] h-[300px] bg-blue-600/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-amber-600/5 blur-[120px] pointer-events-none rounded-full" />

      {/* ------------------------------------------------------------- */}
      {/* TOP NAVBAR                                                    */}
      {/* ------------------------------------------------------------- */}
      <header className="h-16 border-b border-[#141b24]/80 bg-[#070b10]/90 backdrop-blur-xl px-6 sm:px-10 flex items-center justify-between sticky top-0 z-50">
        {/* Brand Logo & Links */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/20 shadow-lg shadow-emerald-500/10">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-black text-sm text-emerald-400 tracking-wider">CS2 BIODATA</span>
          </div>

          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-neutral-400 font-mono">
            <span className="text-white hover:text-emerald-400 cursor-pointer transition">Home</span>
            <span className="hover:text-emerald-400 cursor-pointer transition flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> Leaderboards
            </span>
          </nav>
        </div>

        {/* Right Action: Sign In & Quick Nav Search */}
        <div className="flex items-center gap-4">
          <button className="px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-xs uppercase tracking-wider transition shadow-md shadow-emerald-500/20">
            SIGN IN
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAnalyze(navSearch);
            }}
            className="hidden lg:flex items-center relative"
          >
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search SteamID64, Custom URL, or Persona..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="bg-[#0e131b] border border-[#1a2330] rounded-lg pl-8 pr-20 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/80 font-mono w-72 transition"
            />
            <button
              type="submit"
              className="absolute right-1 px-2.5 py-0.5 rounded bg-[#161f2c] hover:bg-emerald-500 hover:text-black text-neutral-300 font-mono text-[10px] font-bold tracking-wider transition"
            >
              Search
            </button>
          </form>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* MAIN HERO STAGE                                               */}
      {/* ------------------------------------------------------------- */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-24 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        {/* Floating CT Tactical HUD Card (Left) */}
        <div className="hidden xl:flex flex-col gap-2.5 absolute left-6 top-1/2 -translate-y-1/2 w-64 bg-[#090d14]/80 border border-blue-900/40 rounded-2xl p-4 backdrop-blur-md shadow-2xl shadow-blue-950/20 pointer-events-none">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-blue-400 font-bold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> COUNTER-TERRORIST
            </span>
            <Shield className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="border-t border-[#162132] pt-2 space-y-1 font-mono text-[10px]">
            <div className="flex justify-between text-neutral-400">
              <span>Server Sync:</span>
              <span className="text-white font-bold">128 Tick Sub-Tick</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Anti-Cheat Protocol:</span>
              <span className="text-emerald-400 font-bold">VAC Live Active</span>
            </div>
          </div>
          <div className="bg-[#0e1522] rounded-lg p-2 border border-blue-900/30 text-[10px] font-mono text-blue-300/80 flex items-center justify-between">
            <span>// CS:GO LEGACY ARCHIVE SYNC</span>
            <span className="text-emerald-400">ONLINE</span>
          </div>
        </div>

        {/* Floating T Tactical HUD Card (Right) */}
        <div className="hidden xl:flex flex-col gap-2.5 absolute right-6 top-1/2 -translate-y-1/2 w-64 bg-[#090d14]/80 border border-amber-900/40 rounded-2xl p-4 backdrop-blur-md shadow-2xl shadow-amber-950/20 pointer-events-none">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> TERRORIST FORCE
            </span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="border-t border-[#2d1e13] pt-2 space-y-1 font-mono text-[10px]">
            <div className="flex justify-between text-neutral-400">
              <span>Active WAP Model:</span>
              <span className="text-white font-bold">Premier Calibrated</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>FACEIT Elo Sync:</span>
              <span className="text-orange-400 font-bold">Level 1–10</span>
            </div>
          </div>
          <div className="bg-[#1b140e] rounded-lg p-2 border border-amber-900/30 text-[10px] font-mono text-amber-300/80 flex items-center justify-between">
            <span>// UTILITY IMPACT TELEMETRY</span>
            <span className="text-emerald-400">VERIFIED</span>
          </div>
        </div>

        {/* Central Stage Header */}
        <div className="text-center space-y-5 max-w-3xl">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 font-mono text-[11px] uppercase tracking-wider shadow-inner shadow-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            CS2 Bio Data & GC Telemetry
          </div>

          {/* Main Hero Typography */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase leading-[1.05]">
              Unmask Every Player
            </h1>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase leading-[1.05]">
              in
            </h2>
            <h3 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent uppercase leading-[1.05]">
              Counter-Strike 2
            </h3>
          </div>

          <p className="text-xs sm:text-sm font-mono text-neutral-400 max-w-xl mx-auto pt-2">
            • Real-time competitive combat intelligence across Valve & third-party matchmaking.
          </p>

          {/* Telemetry Feature Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-mono">
            <span className="px-3 py-1 rounded-lg border border-[#192230] bg-[#0c1118] text-neutral-300">
              Sub-Tick Telemetry
            </span>
            <span className="px-3 py-1 rounded-lg border border-purple-900/40 bg-purple-950/20 text-purple-300">
              Premier Rating
            </span>
            <span className="px-3 py-1 rounded-lg border border-orange-900/40 bg-orange-950/20 text-orange-300">
              FACEIT ELO
            </span>
            <span className="px-3 py-1 rounded-lg border border-emerald-900/40 bg-emerald-950/20 text-emerald-300">
              VAC Trust Engine
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* MAIN SEARCH BAR CONSOLE                                       */}
        {/* ------------------------------------------------------------- */}
        <div className="w-full max-w-2xl mt-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAnalyze(searchInput);
            }}
            className="relative flex items-center bg-[#090e15] border border-[#1a2536] hover:border-emerald-500/50 rounded-2xl p-2 transition shadow-2xl shadow-emerald-950/10 focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500/40"
          >
            <input
              type="text"
              placeholder="Paste Steam profile URL, Vanity ID, or SteamID64..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-transparent pl-4 pr-32 py-3 text-sm font-mono text-white placeholder-neutral-500 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-2.5 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-xs tracking-wider uppercase transition shadow-lg shadow-emerald-500/30 flex items-center gap-1.5"
            >
              ANALYZE
            </button>
          </form>

          {/* Quick Pro Profiles Selectors */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-xs font-mono">
            <span className="text-neutral-500 text-[11px]">Try Pro Profiles:</span>
            {proProfiles.map((pro) => (
              <button
                key={pro.name}
                onClick={() => {
                  setSearchInput(pro.id);
                  handleAnalyze(pro.id);
                }}
                className="px-3 py-1 rounded-lg border border-[#161f2d] bg-[#0c121a] text-neutral-300 hover:text-emerald-400 hover:border-emerald-500/40 transition text-[11px]"
              >
                {pro.name}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
