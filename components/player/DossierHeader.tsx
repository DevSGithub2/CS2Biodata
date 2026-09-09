"use client";

import React from "react";
import { ShieldAlert, ShieldCheck, ExternalLink, Calendar, Globe } from "lucide-react";

export function DossierHeader({ data }: { data: any }) {
  const steam = data?.steam || {};
  const bans = steam.bans || {};

  const name = steam.personaName || "Unknown Operative";
  const steamId = steam.steamId64 || data?.steamId64 || "N/A";
  const avatar = steam.avatar || "";
  const country = steam.country && steam.country !== "GLOBAL" ? steam.country : null;
  const profileUrl = steam.profileUrl || `https://steamcommunity.com/profiles/${steamId}`;

  const createdDate = steam.timeCreated
    ? new Date(steam.timeCreated * 1000).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Classified";

  const isVacBanned = bans.vacBanned ?? false;
  const numVacBans = bans.numberOfVacBans ?? 0;
  const isCommunityBanned = bans.communityBanned ?? false;

  return (
    <div className="relative p-6 bg-[#080d14]/90 border border-cyan-800/40 shadow-[0_0_20px_rgba(0,255,204,0.08)] font-mono">
      <span className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
      <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        {/* Left: Avatar & Identity Details */}
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative w-24 h-24 rounded border-2 border-cyan-500/60 overflow-hidden bg-[#0a121d] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,204,0.2)]">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-cyan-500/40 font-bold text-2xl">?</div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 justify-center sm:justify-start">
              <h1 className="text-2xl font-black text-white tracking-wide">{name}</h1>
              {country && (
                <span className="px-2 py-0.5 bg-cyan-950/60 border border-cyan-800/60 text-[10px] text-cyan-300 font-bold uppercase rounded">
                  {country}
                </span>
              )}
            </div>

            <p className="text-xs text-gray-400 select-all">
              STEAMID64: <span className="text-cyan-300 font-semibold">{steamId}</span>
            </p>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500 pt-1 justify-center sm:justify-start">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400/70" />
                Service Since: {createdDate}
              </span>
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-400 hover:text-cyan-300 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Steam Profile
              </a>
            </div>
          </div>
        </div>

        {/* Right: Security Ban Telemetry */}
        <div className="flex flex-col items-center md:items-end gap-2">
          <div className="text-[10px] uppercase text-gray-500 tracking-wider">
            VALVE INTEGRITY MATRIX
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 border text-xs font-bold ${
                !isVacBanned
                  ? "bg-emerald-950/40 border-emerald-600/50 text-emerald-400"
                  : "bg-rose-950/40 border-rose-600/50 text-rose-400"
              }`}
            >
              {!isVacBanned ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>VAC: IN GOOD STANDING</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>VAC: {numVacBans} BAN(S) RECORDED</span>
                </>
              )}
            </div>

            <div className="px-2.5 py-1 bg-[#09111b] border border-cyan-800/40 text-[11px] text-gray-300 font-semibold">
              COMMUNITY: {isCommunityBanned ? "RESTRICTED" : "CLEAN"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
