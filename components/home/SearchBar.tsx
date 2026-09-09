"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight } from "lucide-react";

// Verified Pro SteamID64 Registry
const PRO_PLAYERS = [
  { name: "ZywOo", steamId: "76561198058595732" },
  { name: "m0NESY", steamId: "76561198305713431" },
  { name: "donk", steamId: "76561198322699920" },
  { name: "s1mple", steamId: "76561198034202275" },
  { name: "ropz", steamId: "76561198121220486" },
  { name: "b1t", steamId: "76561198341448494" },
];

export function SearchBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSubmitting(true);
    router.push(`/player/${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleQuickLoad = (steamId: string) => {
    setIsSubmitting(true);
    router.push(`/player/${steamId}`);
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center mt-8">
      {/* Precision Search Console */}
      <form onSubmit={handleAudit} className="w-full">
        <div className="relative group flex items-stretch bg-[#05080c] border-2 border-cyan-500/60 shadow-[0_0_25px_rgba(0,255,204,0.18)] focus-within:border-cyan-400 focus-within:shadow-[0_0_35px_rgba(0,255,204,0.35)] transition-all">
          <div className="pl-4 flex items-center justify-center text-cyan-400">
            <Search className="w-4 h-4 opacity-70 group-focus-within:opacity-100 transition-opacity" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Paste Steam profile URL, Vanity ID, or SteamID64..."
            className="flex-1 min-w-0 bg-transparent px-4 py-4 text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none font-mono"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="relative shrink-0 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 text-black font-black text-xs sm:text-sm px-8 py-4 tracking-widest uppercase transition-all duration-150 active:scale-95 flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,204,0.4)]"
          >
            <span>{isSubmitting ? "SYNCING..." : "ANALYZE"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Pro Profiles Quick-Select */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400">
        <span className="uppercase text-gray-500 font-bold tracking-wider text-[11px] mr-1">
          OPERATIVE PROFILES:
        </span>
        {PRO_PLAYERS.map((pro) => (
          <button
            key={pro.name}
            type="button"
            onClick={() => handleQuickLoad(pro.steamId)}
            className="px-2.5 py-1 bg-[#070d14] border border-cyan-950 hover:border-cyan-500/60 text-gray-300 hover:text-cyan-300 transition-all duration-150 rounded text-[11px] font-mono hover:shadow-[0_0_10px_rgba(0,255,204,0.15)]"
          >
            {pro.name}
          </button>
        ))}
      </div>
    </div>
  );
}
