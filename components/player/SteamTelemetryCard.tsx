"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface SteamTelemetryCardProps {
  steamId64?: string;
  friendCode?: string;
  vanityUrl?: string;
  steamLevel?: number | null;
  xpLevel?: number | string | null;
  timeCreated?: number | null;
  friendsCount?: number | null;
  playtimeTotalHours?: number | null;
  playtimeRecentHours?: number | null;
  commendations?: {
    friendly?: number;
    leader?: number;
    teacher?: number;
  } | null;
  country?: string | null;
}

export function SteamTelemetryCard({
  steamId64,
  friendCode = "—",
  vanityUrl,
  steamLevel,
  xpLevel,
  timeCreated,
  friendsCount,
  playtimeTotalHours,
  playtimeRecentHours,
  commendations,
  country,
}: SteamTelemetryCardProps) {
  const [copied, setCopied] = useState(false);

  const registeredDate = timeCreated
    ? new Date(timeCreated * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const handleCopy = () => {
    if (friendCode && friendCode !== "—") {
      navigator.clipboard.writeText(friendCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasCommendations =
    commendations &&
    (Number(commendations.friendly) > 0 ||
      Number(commendations.leader) > 0 ||
      Number(commendations.teacher) > 0);

  return (
    <div className="w-full max-w-[370px] rounded-xl bg-[#080d17]/90 border border-white/[0.08] p-3.5 font-mono shadow-xl backdrop-blur-md">
      {/* Header: Steam Logo & Level Circle */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-white/80 fill-current" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-9.9-8.6l4.6-1.9a3.5 3.5 0 0 0 3.3 2.3 3.5 3.5 0 0 0 3.5-3.5 3.5 3.5 0 0 0-3.5-3.5c-.7 0-1.3.2-1.8.6L6 5.8A10 10 0 0 1 12 2zm-3.8 11.5a2.1 2.1 0 1 1-2.1-2.1c.3 0 .6.1.9.2l1.6-2.3a3.5 3.5 0 0 0-.4-.1 3.5 3.5 0 0 0-3.5 3.5 3.5 3.5 0 0 0 3.5 3.5c.6 0 1.2-.2 1.7-.5l-.8-2.2h-.9z" />
          </svg>
          <span className="text-[11px] font-black tracking-widest text-white uppercase">STEAM®</span>
        </div>

        {steamLevel !== null && steamLevel !== undefined && (
          <div className="flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full border border-cyan-400/80 bg-cyan-500/10 text-cyan-300 text-[11px] font-black shadow-[0_0_8px_rgba(6,182,212,0.25)]">
            {steamLevel}
          </div>
        )}
      </div>

      {/* 3-Column Metrics Grid */}
      <div className="grid grid-cols-3 gap-x-3 gap-y-2.5 text-left">
        <div>
          <span className="text-[8.5px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">CS FRIENDCODE</span>
          <button
            onClick={handleCopy}
            disabled={friendCode === "—"}
            className="flex items-center gap-1 text-[11px] font-bold text-zinc-200 hover:text-cyan-400 transition-colors cursor-pointer group"
          >
            <span>{friendCode}</span>
            {friendCode !== "—" && (
              copied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-zinc-600 group-hover:text-cyan-400" />
            )}
          </button>
        </div>

        <div>
          <span className="text-[8.5px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">VANITY</span>
          <span className="text-[11px] font-bold text-zinc-200 truncate block">
            {vanityUrl || "—"}
          </span>
        </div>

        <div>
          <span className="text-[8.5px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">XP LEVEL</span>
          <span className="text-[11px] font-bold text-cyan-400">
            {xpLevel ?? "—"}
          </span>
        </div>

        <div>
          <span className="text-[8.5px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">REGISTERED</span>
          <span className="text-[11px] font-bold text-zinc-200 block truncate">
            {registeredDate}
          </span>
        </div>

        <div>
          <span className="text-[8.5px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">FRIENDS</span>
          <span className="text-[11px] font-bold text-zinc-200">
            {friendsCount !== null && friendsCount !== undefined ? Number(friendsCount).toLocaleString() : "—"}
          </span>
        </div>

        <div>
          <span className="text-[8.5px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">CS2 PLAYTIME</span>
          <span className="text-[11px] font-bold text-zinc-200 truncate block">
            {playtimeTotalHours ? `${Number(playtimeTotalHours).toLocaleString()}h` : "—"}
            {playtimeRecentHours ? (
              <span className="text-zinc-500 font-normal"> / {playtimeRecentHours}h</span>
            ) : null}
          </span>
        </div>

        {/* Footer: Commendations & Country */}
        <div className="col-span-2 pt-1.5 border-t border-white/[0.04]">
          <span className="text-[8.5px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">COMMENDATIONS</span>
          {hasCommendations ? (
            <div className="flex items-center gap-2 text-[11px] text-zinc-300 font-bold">
              <span className="flex items-center gap-0.5">{commendations?.friendly ?? 0} <span className="text-[10px]">😊</span></span>
              <span className="flex items-center gap-0.5">{commendations?.leader ?? 0} <span className="text-[10px]">👑</span></span>
              <span className="flex items-center gap-0.5">{commendations?.teacher ?? 0} <span className="text-[10px]">🎓</span></span>
            </div>
          ) : (
            <span className="text-[10px] text-zinc-500">Sync GC Bot</span>
          )}
        </div>

        <div className="pt-1.5 border-t border-white/[0.04]">
          <span className="text-[8.5px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">COUNTRY</span>
          {country ? (
            <div className="flex items-center gap-1">
              <img
                src={`https://flagcdn.com/20x15/${country.toLowerCase()}.png`}
                alt={country.toUpperCase()}
                className="w-3.5 h-2.5 object-cover rounded-[1px]"
              />
              <span className="text-[10px] font-bold text-zinc-300 uppercase">{country}</span>
            </div>
          ) : (
            <span className="text-[10px] text-zinc-500">—</span>
          )}
        </div>
      </div>
    </div>
  );
}
