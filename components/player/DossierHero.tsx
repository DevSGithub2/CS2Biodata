"use client";

import React, { useState } from "react";
import { getOfficialFaceitBadge, getPremierTier } from "@/lib/cs2-assets";
import { ExternalLink, Calendar, Database, X, Copy, Check, ShieldCheck, ShieldAlert, Award } from "lucide-react";

// Official CS2 Premier Medal Icon
function CS2PremierIcon({ className = "w-4 h-4", color = "#ffdb38" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={color}
        fillOpacity="0.25"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="3" stroke={color} strokeWidth="1.5" />
      <path d="M12 8V14M9 11H15" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// Official FACEIT Chevron
function FaceitLogoIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#FF5500" className={className}>
      <path d="M23.999 2.001c-.027-.378-.291-.7-.674-.823-.384-.123-.807-.024-1.091.254L.373 22.31c-.347.34-.407.876-.145 1.282.261.406.748.591 1.22.463L23.473 18.1c.334-.092.585-.357.653-.695.068-.337-.048-.686-.303-.912l-8.629-7.657L23.8 2.593c.139-.164.208-.378.199-.592z" />
    </svg>
  );
}

function getSteamLevelTier(lvl: number) {
  if (lvl >= 100) return { border: "border-purple-500", text: "text-purple-300", bg: "bg-purple-950/50", glow: "shadow-[0_0_12px_rgba(168,85,247,0.35)]" };
  if (lvl >= 50) return { border: "border-yellow-500", text: "text-yellow-300", bg: "bg-yellow-950/50", glow: "shadow-[0_0_12px_rgba(234,179,8,0.35)]" };
  if (lvl >= 40) return { border: "border-blue-500", text: "text-blue-300", bg: "bg-blue-950/50", glow: "shadow-[0_0_12px_rgba(59,130,246,0.35)]" };
  if (lvl >= 30) return { border: "border-emerald-500", text: "text-emerald-300", bg: "bg-emerald-950/50", glow: "shadow-[0_0_12px_rgba(16,185,129,0.35)]" };
  if (lvl >= 20) return { border: "border-orange-500", text: "text-orange-300", bg: "bg-orange-950/50", glow: "shadow-[0_0_12px_rgba(249,115,22,0.35)]" };
  if (lvl >= 10) return { border: "border-rose-500", text: "text-rose-300", bg: "bg-rose-950/50", glow: "shadow-[0_0_12px_rgba(244,63,94,0.35)]" };
  return { border: "border-zinc-500", text: "text-zinc-300", bg: "bg-zinc-800/50", glow: "shadow-[0_0_12px_rgba(113,113,122,0.2)]" };
}

export function DossierHero({ data }: { data: any }) {
  const [showDrawer, setShowDrawer] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const steam = data?.steam || data?.player || {};
  const bans = steam?.bans || data?.bans || {};
  const faceit = data?.faceit || steam?.faceit;
  const premier = data?.premier || steam?.premier;

  const personaName = steam?.personaName || steam?.personaname || "Unknown Operative";
  const steamId64 = steam?.steamId64 || steam?.steamid || data?.steamId64 || "";
  const avatar = steam?.avatar || steam?.avatarfull || "";
  const country = steam?.country || steam?.loccountrycode;
  const profileUrl = steam?.profileUrl || steam?.profileurl || (steamId64 ? `https://steamcommunity.com/profiles/${steamId64}` : "#");

  // Robust Level Parsing
  const rawLvl = data?.steamLevel ?? steam?.steamLevel ?? steam?.level ?? data?.level;
  const steamLevel = rawLvl !== undefined && rawLvl !== null ? Number(rawLvl) : null;
  const levelStyle = getSteamLevelTier(steamLevel || 0);

  // Robust Time Parsing
  const rawTime = steam?.timeCreated ?? steam?.timecreated ?? data?.timeCreated;
  const timeCreated = rawTime ? Number(rawTime) : null;
  const yearsOld = data?.yearsOld ?? (timeCreated ? Math.floor((Date.now() - (timeCreated * 1000)) / (365.25 * 24 * 3600 * 1000)) : null);
  const createdDate = timeCreated
    ? new Date(timeCreated * 1000).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  const personaState = steam?.personaState ?? steam?.personastate ?? 0;
  const isOnline = personaState > 0;

  // Premier State
  const premierRating = Number(premier?.activeSeason?.rating || premier?.rating || data?.premierRating || 0);
  const isPremierRanked = premierRating > 0;
  const premierTier = getPremierTier(premierRating);

  // FACEIT State
  const hasFaceit = Boolean(faceit && (faceit.skillLevel || faceit.elo || faceit.nickname));
  const faceitBadge = hasFaceit ? getOfficialFaceitBadge(faceit?.skillLevel || faceit?.elo || 1) : null;

  // SteamID Calculations
  let steamID = "N/A";
  let steamID3 = "N/A";
  let steamID3NoBrackets = "N/A";
  try {
    if (steamId64 && /^\d+$/.test(steamId64)) {
      const bId = BigInt(steamId64);
      const vBase = 76561197960265728n;
      if (bId > vBase) {
        const idNum = bId - vBase;
        const y = idNum % 2n;
        const z = idNum / 2n;
        steamID = `STEAM_0:${y}:${z}`;
        steamID3 = `[U:1:${idNum}]`;
        steamID3NoBrackets = `U:1:${idNum}`;
      }
    }
  } catch {}

  const rows = [
    { key: "steamID", label: "steamID", value: steamID },
    { key: "steamID3", label: "steamID3", value: steamID3 },
    { key: "steamID3NoBrackets", label: "steamID3 (no brackets)", value: steamID3NoBrackets },
    { key: "steamID64", label: "steamID64", value: steamId64 || "N/A" },
    { key: "profileUrl", label: "Profile Link", value: profileUrl, isLink: true },
  ];

  const handleCopy = (key: string, value: string) => {
    if (!value || value === "N/A") return;
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const numVacBans = bans?.NumberOfVACBans ?? bans?.numberOfVacBans ?? 0;
  const numGameBans = bans?.NumberOfGameBans ?? bans?.numberOfGameBans ?? 0;
  const isClean = numVacBans === 0 && numGameBans === 0;

  return (
    <>
      <div className="relative rounded-lg bg-[#070b12]/95 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md p-5 sm:p-6 font-mono">
        {/* Tactical HUD Corner Reticles */}
        <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400/60 rounded-tl" />
        <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400/60 rounded-tr" />
        <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400/60 rounded-bl" />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400/60 rounded-br" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Avatar + Identity Section */}
          <div className="flex items-center gap-5 text-left w-full lg:w-auto">
            <div className="relative shrink-0 group">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-white/[0.16] overflow-hidden bg-black/60 shadow-[0_4px_24px_rgba(0,0,0,0.6)] ring-1 ring-cyan-500/20">
                {avatar ? (
                  <img src={avatar} alt={personaName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <span className="text-gray-500 font-bold text-2xl flex items-center justify-center h-full">?</span>
                )}

                {/* Status Dot */}
                <div className="absolute bottom-1 right-1 flex items-center justify-center">
                  {isOnline ? (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#070b12]"></span>
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full h-3 w-3 bg-zinc-600 border-2 border-[#070b12]"></span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate max-w-[280px] leading-none">
                  {personaName}
                </h1>

                {/* Always Show Level If Available or Greater Than 0 */}
                {steamLevel !== null && steamLevel !== undefined && (
                  <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${levelStyle.border} ${levelStyle.bg} ${levelStyle.glow} transition-all`}>
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">LVL</span>
                    <span className={`text-xs font-black ${levelStyle.text}`}>{steamLevel}</span>
                  </div>
                )}

                {/* Dynamic Years Badge */}
                {yearsOld !== null && yearsOld >= 0 && (
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    <span className="text-[10px] font-bold">★ {yearsOld} YRS</span>
                  </div>
                )}

                {country && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/[0.04] border border-white/[0.08] rounded-full shrink-0">
                    <img
                      src={`https://flagcdn.com/20x15/${country.toLowerCase()}.png`}
                      alt={country.toUpperCase()}
                      className="w-3.5 h-2.5 object-cover rounded-[1px]"
                    />
                    <span className="text-[10px] text-gray-300 font-bold uppercase leading-none">
                      {country.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDrawer(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/[0.08] hover:bg-cyan-500/[0.16] border border-cyan-500/40 hover:border-cyan-400 text-[11px] text-cyan-300 hover:text-white font-semibold transition-all active:scale-95 leading-none"
                >
                  <Database className="w-3 h-3 text-cyan-400" />
                  <span>Steam.io Data</span>
                </button>

                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.1] hover:border-white/20 text-[11px] text-gray-300 hover:text-white font-medium transition-all active:scale-95 leading-none"
                >
                  <span>Steam Profile</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </div>

              {createdDate && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 leading-none pl-0.5">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  <span>Member since {createdDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Telemetry Badges (Premier + FACEIT + VAC Shield) */}
          <div className="flex flex-wrap items-center justify-start lg:justify-end gap-3 w-full lg:w-auto">
            {/* 1. CS2 Premier Medal Card */}
            <div
              className="flex items-center gap-3 px-3.5 py-2 rounded-lg border transition-all min-w-[150px]"
              style={{
                borderColor: isPremierRanked ? (premierTier.colorHex || premierTier.hex) : "rgba(255,255,255,0.08)",
                backgroundColor: isPremierRanked ? premierTier.bg : "rgba(255,255,255,0.02)",
                boxShadow: isPremierRanked ? `0 0 16px ${premierTier.colorHex || premierTier.hex}33` : "none",
              }}
            >
              <div
                className="w-8 h-8 rounded flex items-center justify-center shrink-0 border"
                style={{
                  backgroundColor: isPremierRanked ? premierTier.bg : "rgba(255,255,255,0.04)",
                  borderColor: isPremierRanked ? (premierTier.colorHex || premierTier.hex) : "rgba(255,255,255,0.1)",
                }}
              >
                <CS2PremierIcon
                  className="w-4 h-4"
                  color={isPremierRanked ? (premierTier.colorHex || premierTier.hex) : "#6B7280"}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">CS2 PREMIER</span>
                <span
                  className="text-xs font-black tracking-tight"
                  style={{ color: isPremierRanked ? (premierTier.colorHex || premierTier.hex) : "#9CA3AF" }}
                >
                  {isPremierRanked ? `${premierRating.toLocaleString()} CS` : "CALIBRATING"}
                </span>
              </div>
            </div>

            {/* 2. FACEIT Elo Card */}
            <div className="flex items-center gap-3 px-3.5 py-2 rounded-lg border border-white/[0.08] bg-white/[0.02] min-w-[150px]">
              <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 border border-orange-500/20 bg-orange-950/20">
                <FaceitLogoIcon className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">FACEIT ELO</span>
                <span className="text-xs font-black text-orange-400">
                  {hasFaceit ? `${faceit?.elo || 1000} ELO` : "NOT LINKED"}
                </span>
              </div>
            </div>

            {/* 3. Valve Security Card */}
            <div className="flex items-center gap-3 px-3.5 py-2 rounded-lg border border-white/[0.08] bg-black/40 min-w-[150px]">
              {isClean ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
              )}
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">VALVE SECURITY</span>
                <span className={`text-xs font-black ${isClean ? "text-emerald-400" : "text-rose-400"}`}>
                  {isClean ? "CLEAN STANDING" : `${numVacBans + numGameBans} BANS`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steam Identification Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-mono">
          <div className="w-full max-w-lg bg-[#070b12] border border-white/[0.12] rounded-xl shadow-[0_16px_60px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Steam Identifiers &amp; Routing</h3>
              </div>
              <button onClick={() => setShowDrawer(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {rows.map((r) => (
                <div key={r.key} className="flex items-center justify-between p-2.5 rounded bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex flex-col min-w-0 pr-3">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">{r.label}</span>
                    <span className="text-xs text-cyan-300 font-mono truncate">{r.value}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(r.key, r.value)}
                    className="p-1.5 rounded bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white transition-all shrink-0"
                  >
                    {copiedKey === r.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
