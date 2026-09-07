"use client";

import { useState } from "react";
import { Search, ShieldAlert, Crosshair, Package, Activity, Terminal } from "lucide-react";

export default function Home() {
  const [steamInput, setSteamInput] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "matches" | "inventory" | "weapons">("overview");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!steamInput.trim()) return;
    console.log("Searching player:", steamInput.trim());
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-neutral-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Bar */}
      <header className="border-b border-neutral-800/80 bg-[#0e0e11]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black text-black text-sm tracking-wider shadow-lg shadow-amber-500/20">
              CS2
            </div>
            <div>
              <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                BIODATA
              </span>
              <span className="ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                v2.0 Clean
              </span>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-lg relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by SteamID64, Vanity URL, or Profile Link..."
              value={steamInput}
              onChange={(e) => setSteamInput(e.target.value)}
              className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
            />
          </form>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs tracking-wide transition shadow-lg shadow-amber-500/10">
              CONNECT STEAM
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-3">
          {[
            { id: "overview", label: "Overview", icon: Activity },
            { id: "matches", label: "Match Intel", icon: Terminal },
            { id: "inventory", label: "Inventory", icon: Package },
            { id: "weapons", label: "Weapons Telemetry", icon: Crosshair },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                  isActive
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Panel */}
        <section className="rounded-2xl border border-neutral-800/80 bg-[#0e0e11]/40 p-8 min-h-[450px] flex flex-col justify-center items-center text-center">
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 mb-4 text-amber-400">
            <Activity className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-neutral-200">CS2 Biodata Ready</h2>
          <p className="text-neutral-500 text-sm max-w-md mt-2">
            Fresh baseline initialized with zero legacy dependencies. Search for a player profile or plug in new module designs.
          </p>
        </section>
      </div>
    </main>
  );
}
