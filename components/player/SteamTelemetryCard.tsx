"use client";

import React, { useState, useMemo } from "react";
import { Check, Copy, Globe } from "lucide-react";
import { getSteamLevelStyle } from "@/lib/utils/steamLevel";

interface SteamTelemetryCardProps {
  steamId64?: string;
  friendCode?: string;
  vanityUrl?: string;
  steamLevel?: number | null;
  xpLevel?: number | string | null;
  timeCreated?: number | string | null;
  friendsCount?: number | null;
  playtimeTotalHours?: number | null;
  playtimeRecentHours?: number | null;
  commendations?: {
    friendly: number;
    leader: number;
    teacher: number;
  };
  country?: string | null;
}

export function SteamTelemetryCard({
  friendCode = "—",
  vanityUrl,
  steamLevel,
  xpLevel,
  timeCreated,
  friendsCount,
  playtimeTotalHours,
  commendations = { friendly: 0, leader: 0, teacher: 0 },
  country,
}: SteamTelemetryCardProps) {
  const [copied, setCopied] = useState(false);

  const tier = getSteamLevelStyle(Number(steamLevel || 0));

  const handleCopyFriendCode = () => {
    if (!friendCode || friendCode === "—") return;
    navigator.clipboard.writeText(friendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedCreated = useMemo(() => {
    if (!timeCreated) return "—";
    const date = new Date(Number(timeCreated) * 1000);
    return isNaN(date.getTime())
      ? "—"
      : date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  }, [timeCreated]);

  const isGlobalOrEmpty = (code?: string | null) => {
    if (!code) return true;
    const clean = code.trim().toUpperCase();
    return clean === "" || clean === "GLOBAL" || clean === "NULL" || clean === "UNKNOWN";
  };

  return (
    <div className="relative bg-[#070b10]/90 border border-white/[0.08] hover:border-cyan-500/30 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all w-full max-w-[390px]">
      {/* Header: Title + Tier Level Pill */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.524-4.524 4.524h-.105l-4.076 2.911c0 .052.005.105.005.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.155-3.331-2.69L.648 14.88C1.942 20.088 6.643 24 12.219 24c6.627 0 12-5.373 12-12S18.605 0 11.979 0zm-3.613 16.368l-1.956-.808a2.53 2.53 0 0 0 2.278 1.43 2.52 2.52 0 0 0 2.52-2.52c0-.39-.092-.76-.25-1.092l-2.592 1.99zM16.038 5.676a3.238 3.238 0 1 0 0 6.476 3.238 3.238 0 0 0 0-6.476zm0 1.29a1.948 1.948 0 1 1 0 3.896 1.948 1.948 0 0 1 0-3.896z" />
          </svg>
          <span className="text-[10px] font-black tracking-[0.2em] text-cyan-400 uppercase font-mono">
            PROFILE INFO
          </span>
        </div>

        <span
          style={{
            borderColor: tier.border?.replace("border-", "") || undefined,
            color: tier.text?.replace("text-", "") || undefined,
            boxShadow: tier.glow,
          }}
          className={`flex items-center justify-center w-7 h-7 rounded-full border text-xs font-mono font-bold bg-[#070b10] ${tier.border} ${tier.text}`}
        >
          {steamLevel ?? 0}
        </span>
      </div>

      {/* Symmetrical 3-Column Metrics Grid */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-3.5 pt-3">
        {/* Row 1 */}
        <div className="flex flex-col min-w-0">
          <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-mono font-semibold truncate">
            CS FRIENDCODE
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-xs font-bold text-white font-mono tracking-tight truncate">
              {friendCode}
            </span>
            {friendCode && friendCode !== "—" && (
              <button
                type="button"
                onClick={handleCopyFriendCode}
                className="text-zinc-400 hover:text-cyan-300 transition-colors shrink-0"
                title="Copy Friend Code"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-mono font-semibold truncate">
            VANITY
          </span>
          <span className="text-xs font-bold text-white font-mono tracking-tight truncate mt-0.5" title={vanityUrl || "—"}>
            {vanityUrl || "—"}
          </span>
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-mono font-semibold truncate">
            XP LEVEL
          </span>
          <span className="text-xs font-bold text-cyan-400 font-mono tracking-tight mt-0.5">
            {xpLevel ?? "—"}
          </span>
        </div>

        {/* Row 2 */}
        <div className="flex flex-col min-w-0">
          <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-mono font-semibold truncate">
            REGISTERED
          </span>
          <span className="text-xs font-bold text-white font-mono tracking-tight truncate mt-0.5">
            {formattedCreated}
          </span>
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-mono font-semibold truncate">
            FRIENDS
          </span>
          <span className="text-xs font-bold text-white font-mono tracking-tight mt-0.5">
            {friendsCount !== null && friendsCount !== undefined ? friendsCount.toLocaleString() : "—"}
          </span>
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-mono font-semibold truncate">
            CS2 PLAYTIME
          </span>
          <span className="text-xs font-bold text-white font-mono tracking-tight mt-0.5">
            {playtimeTotalHours ? `${playtimeTotalHours.toLocaleString()}h` : "—"}
          </span>
        </div>

        {/* Row 3 */}
        <div className="flex flex-col col-span-2 min-w-0">
          <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-mono font-semibold truncate">
            COMMENDATIONS
          </span>
          <div className="flex items-center gap-2 mt-0.5 text-xs font-bold font-mono text-zinc-200">
            <span>{commendations.friendly} 😊</span>
            <span>{commendations.leader} 👑</span>
            <span>{commendations.teacher} 🎓</span>
          </div>
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-mono font-semibold truncate">
            COUNTRY
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isGlobalOrEmpty(country) ? (
              <>
                <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-xs font-bold text-white font-mono">GLOBAL</span>
              </>
            ) : (
              <>
                <img
                  src={`https://flagcdn.com/20x15/${country!.toLowerCase()}.png`}
                  alt={country!}
                  className="w-4 h-3 rounded-[2px] object-cover shrink-0"
                />
                <span className="text-xs font-bold text-white font-mono uppercase">{country}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
