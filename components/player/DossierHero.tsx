"use client";

import React, { useState } from "react";
import { getOfficialFaceitBadge, getFaceitLevelFromElo, getPremierTier } from "@/lib/cs2-assets";
import { FaceitSkillBadge } from "@/components/ui/FaceitSkillBadge";
import { getSteamLevelStyle } from "@/lib/utils/steamLevel";
import { ExternalLink, Calendar, Database, X, Copy, Check, ShieldCheck, ShieldAlert, Award } from "lucide-react";
import { SteamTelemetryCard } from "@/components/player/SteamTelemetryCard";
import { steamIdToCsFriendCode } from "@/lib/steamFriendCode";

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
  const tier = Math.floor((Math.max(0, lvl) % 100) / 10);
  const styles: Record<number, { border: string; text: string; bg: string; glow: string }> = {
    0: { border: "border-zinc-400/70", text: "text-zinc-300", bg: "bg-zinc-800/40", glow: "shadow-[0_0_10px_rgba(155,155,155,0.3)]" },
    1: { border: "border-red-500/80", text: "text-red-400", bg: "bg-red-950/40", glow: "shadow-[0_0_10px_rgba(192,41,66,0.35)]" },
    2: { border: "border-orange-500/80", text: "text-orange-400", bg: "bg-orange-950/40", glow: "shadow-[0_0_10px_rgba(217,91,38,0.35)]" },
    3: { border: "border-yellow-500/80", text: "text-yellow-400", bg: "bg-yellow-950/40", glow: "shadow-[0_0_10px_rgba(228,175,18,0.35)]" },
    4: { border: "border-emerald-500/80", text: "text-emerald-400", bg: "bg-emerald-950/40", glow: "shadow-[0_0_10px_rgba(67,130,68,0.35)]" },
    5: { border: "border-sky-500/80", text: "text-sky-400", bg: "bg-sky-950/40", glow: "shadow-[0_0_10px_rgba(58,128,232,0.4)]" },
    6: { border: "border-purple-500/80", text: "text-purple-400", bg: "bg-purple-950/40", glow: "shadow-[0_0_10px_rgba(138,67,182,0.4)]" },
    7: { border: "border-pink-500/80", text: "text-pink-400", bg: "bg-pink-950/40", glow: "shadow-[0_0_10px_rgba(216,70,180,0.4)]" },
    8: { border: "border-rose-700/80", text: "text-rose-400", bg: "bg-rose-950/40", glow: "shadow-[0_0_10px_rgba(112,39,55,0.4)]" },
    9: { border: "border-amber-700/80", text: "text-amber-500", bg: "bg-amber-950/40", glow: "shadow-[0_0_10px_rgba(139,94,52,0.35)]" },
  };
  return styles[tier] || styles[0];
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

  // Level & Age Parsing
  const rawLvl = data?.steamLevel ?? steam?.steamLevel ?? steam?.level ?? data?.level;
  const steamLevel = rawLvl !== undefined && rawLvl !== null ? Number(rawLvl) : null;
  const levelStyle = getSteamLevelTier(steamLevel || 0);

  const rawTime = steam?.timeCreated ?? steam?.timecreated ?? data?.timeCreated;
  const timeCreated = rawTime ? Number(rawTime) : null;
  const yearsOld = data?.yearsOld ?? (timeCreated ? Math.floor((Date.now() - (timeCreated * 1000)) / (365.25 * 24 * 3600 * 1000)) : null);
  const createdDate = timeCreated
    ? new Date(timeCreated * 1000).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  const personaState = steam?.personaState ?? steam?.personastate ?? 0;
  const isOnline = personaState > 0;

  // Premier State
  const premierRating = Number(
    premier?.activeSeason?.rating ??
    premier?.rating ??
    premier?.score ??
    data?.premierRating ??
    data?.premier_rank ??
    data?.player?.premier_rank ??
    (Array.isArray(data?.rankings) ? data.rankings.find(r => r.rank_type_id === 6 || r.rank_type_id === 2)?.score : 0) ??
    0
  );
  
  // Resolved Telemetry metrics
  const calculatedFriendsCount = (() => {
    if (typeof steam?.friendsCount === "number" && steam.friendsCount >= 0) return steam.friendsCount;
    if (typeof data?.friendsCount === "number" && data.friendsCount >= 0) return data.friendsCount;
    if (Array.isArray(data?.friends)) return data.friends.length;
    if (Array.isArray(steam?.friends)) return steam.friends.length;
    return null;
  })();

  const calculatedPlaytime = (() => {
    const pt = steam?.playtimeTotalHours ?? data?.playtimeTotalHours ?? data?.stats?.playtime ?? steam?.cs2Playtime;
    if (pt) {
      return typeof pt === "number" ? `${Math.round(pt)} hrs` : (pt.includes("hrs") ? pt : `${pt} hrs`);
    }
    return null;
  })();

  const premierWins = Number(premier?.activeSeason?.wins ?? premier?.wins ?? 0);
  const isPremierRanked = premierRating > 0;

  const rawCommends = data?.commendations || steam?.commendations || data?.gc?.commendations || {};
  const normalizedCommendations = {
    friendly: rawCommends.friendly ?? rawCommends.cmd_friendly ?? 0,
    leader: rawCommends.leader ?? rawCommends.cmd_leader ?? 0,
    teacher: rawCommends.teacher ?? rawCommends.cmd_teaching ?? 0,
  };
  const resolvedXpLevel = data?.playerLevel ?? data?.xpLevel ?? steam?.playerLevel ?? steam?.xpLevel ?? data?.cs2ProfileRank ?? null;

  const premierTier = getPremierTier(premierRating);

  // FACEIT State
  const faceitElo = Number(faceit?.elo || data?.faceitElo || 0);
  const faceitBadge = getOfficialFaceitBadge(faceitElo);

  // Security / VAC State
  const isVacBanned = bans?.vacBanned || bans?.vac_banned || bans?.numberOfVACBans > 0;
  const isCommunityBanned = bans?.communityBanned || bans?.community_banned;
  const isGameBanned = bans?.numberOfGameBans > 0;
  const isCleanStanding = !isVacBanned && !isCommunityBanned && !isGameBanned;

  
  const rawFaceitElo = Number(data?.faceit?.elo ?? data?.player?.faceit?.elo ?? 0);
  const rawFaceitLevel = data?.faceit?.skill_level ?? data?.faceit?.level ?? data?.player?.faceit?.skill_level ?? data?.player?.faceit?.level;
  const resolvedFaceitLevel = rawFaceitElo > 0 ? getFaceitLevelFromElo(rawFaceitElo) : (rawFaceitLevel ? Number(rawFaceitLevel) : null);
const faceitBadgeObj = resolvedFaceitLevel ? getOfficialFaceitBadge(resolvedFaceitLevel) : null;



  const steamLevelTier = getSteamLevelStyle(Number(steamLevel || 0));
  const accountAgeYears = timeCreated
    ? Math.max(0, Math.floor((Date.now() - Number(timeCreated) * 1000) / (1000 * 60 * 60 * 24 * 365.25)))
    : null;


  return (
    <>
      <div className="relative rounded-2xl bg-[#040810]/95 border border-white/[0.08] p-4 sm:p-6 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-cyan-500/[0.04] blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-6 w-full">
        {/* Left Cluster: Player Avatar & Identity + Profile Info Card */}
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 w-full xl:w-auto">
          {/* Section 1: Left - Player Avatar & Personal Metadata */}
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar with Status Indicator */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/[0.12] bg-[#0c1322] shadow-lg">
                  {avatar ? (
                    <img src={avatar} alt={personaName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono font-bold text-gray-500">CS2</div>
                  )}
                </div>
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#040810] ${
                    isOnline ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-zinc-600"
                  }`}
                  title={isOnline ? "Online" : "Offline"}
                />
              </div>

              {/* Tactical Save Settings / Cloud Backup Button */}
              <a
                href="https://indiepaste.online"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-2 py-1 rounded bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-[10px] font-mono tracking-wider transition-all duration-200 shadow-[0_0_10px_rgba(6,182,212,0.15)] group"
                title="Save settings & configs to IndiePaste"
              >
                <svg
                  className="w-3 h-3 text-cyan-400 group-hover:rotate-12 transition-transform duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span className="font-semibold uppercase tracking-wider">SAVE SETTINGS</span>
              </a>
            </div>

            {/* Persona, Badges & Actions */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                  {personaName}
                </h1>
                <span
                  style={{
                    borderColor: steamLevelTier.border?.replace("border-", "") || undefined,
                    color: steamLevelTier.text?.replace("text-", "") || undefined,
                    boxShadow: steamLevelTier.glow,
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-mono font-bold bg-[#070b10] ${steamLevelTier.border} ${steamLevelTier.text}`}
                >
                  <span className="text-[9px] font-black opacity-60 uppercase">LVL</span>
                  {steamLevel ?? 0}
                </span>

                {accountAgeYears !== null && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-mono font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    <span className="text-amber-400">★</span> {accountAgeYears} YRS
                  </span>
                )}
              </div>

              {/* Original Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDrawer(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Steam.io Data</span>
                </button>

                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white text-xs font-mono font-semibold transition-all"
                >
                  <span>Steam Profile</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>

              {/* Member since Badge */}
              {createdDate && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.12] text-xs font-mono text-zinc-200 shadow-sm w-fit">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Member since <strong className="font-bold text-white tracking-wide">{createdDate}</strong></span>
                </div>
              )}
            </div>
          </div>

          

          

          {/* Section 2: Middle - Dynamic Steam Telemetry Grid Template */}
          <div className="shrink-0 w-full xl:w-auto">
            <SteamTelemetryCard
              steamId64={steamId64}
              friendCode={steamIdToCsFriendCode(steamId64)}
              vanityUrl={steam?.vanity || steam?.customURL || (profileUrl && profileUrl.includes("/id/") ? profileUrl.split("/id/")[1]?.replace(/\//g, "") : steam?.personaname)}
              steamLevel={steamLevel}
              xpLevel={resolvedXpLevel}
              timeCreated={timeCreated}
              friendsCount={
    data?.friendsCount ??
    data?.player?.friendsCount ??
    data?.steam?.friendsCount ??
    steam?.friendsCount ??
    (Array.isArray(data?.friends) ? data.friends.length : null)
  }
              playtimeTotalHours={
    data?.playtimeTotalHours ??
    data?.player?.playtimeTotalHours ??
    data?.steam?.playtimeTotalHours ??
    steam?.playtimeTotalHours ??
    data?.playtimeHours ??
    data?.player?.playtimeHours ??
    (data?.stats?.playtime ? Math.round(Number(data.stats.playtime)) : null)
  }
              playtimeRecentHours={data?.cs2RecentHours || steam?.cs2RecentHours}
              commendations={normalizedCommendations}
              country={country || steam?.loccountrycode || data?.loccountrycode}
            />
          </div>
          </div>

          {/* Section 3: Right - Competitive Ranks & Security Standing */}
          <div className="flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto xl:ml-auto shrink-0">
            {/* Premier Rating Badge */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] min-w-[140px]">
              <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <CS2PremierIcon className="w-5 h-5" color={(premierTier.hex || premierTier.colorHex)} />
              </div>
              <div className="flex flex-col font-mono">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">CS2 PREMIER</span>
                <span className="text-sm font-black" style={{ color: isPremierRanked ? (premierTier.hex || premierTier.colorHex) : "#9ca3af" }}>
                  {isPremierRanked ? premierRating.toLocaleString() : (premierRating > 0 ? "CALIBRATING" : "UNRANKED")}
                </span>
              </div>
            </div>

            {/* FACEIT Elo Badge */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] min-w-[140px]">
              <div className="p-1 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center min-w-[36px] min-h-[36px]">
                {resolvedFaceitLevel ? (
                  <img
                    src={`/faceit/faceit${resolvedFaceitLevel}.svg`}
                    alt={`FACEIT Level ${resolvedFaceitLevel}`}
                    className="w-7 h-7 object-contain drop-shadow-[0_0_10px_rgba(255,100,0,0.4)]"
                  />
                ) : (
                  <FaceitLogoIcon className="w-5 h-5" />
                )}
              </div>
              <div className="flex flex-col font-mono">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">FACEIT ELO</span>
                <span className="text-sm font-black text-orange-400">
                  {faceitElo > 0 ? `${faceitElo} ELO` : "UNRANKED"}
                </span>
              </div>
            </div>

            {/* Valve Security Standing */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] min-w-[140px]">
              <div className={`p-2 rounded-lg ${isCleanStanding ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-rose-500/10 border border-rose-500/20"}`}>
                {isCleanStanding ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                )}
              </div>
              <div className="flex flex-col font-mono">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">VALVE SECURITY</span>
                <span className={`text-xs font-black tracking-wider ${isCleanStanding ? "text-emerald-400" : "text-rose-400"}`}>
                  {isCleanStanding ? "CLEAN STANDING" : "RESTRICTED"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steam Raw Payload Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl h-full bg-[#070b14] border-l border-white/[0.1] p-6 flex flex-col shadow-2xl">
            <div className="flex items-center justify-start gap-8 lg:gap-10 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-sm">
                <Database className="w-4 h-4" />
                <span>RAW VALVE TELEMETRY PAYLOAD</span>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1 rounded-lg hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto my-4 p-4 rounded-xl bg-black/50 border border-white/[0.06] font-mono text-xs text-gray-300">
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                setCopiedKey("drawer");
                setTimeout(() => setCopiedKey(null), 2000);
              }}
              className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedKey === "drawer" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === "drawer" ? "Copied Payload!" : "Copy JSON Payload"}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
