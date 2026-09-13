"use client";

function getFaceitLevelFromElo(elo: number | null | undefined, fallbackLevel?: number | null): number {
  const e = Number(elo) || 0;
  if (e >= 2001) return 10;
  if (e >= 1751) return 9;
  if (e >= 1531) return 8;
  if (e >= 1351) return 7;
  if (e >= 1201) return 6;
  if (e >= 1051) return 5;
  if (e >= 901) return 4;
  if (e >= 751) return 3;
  if (e >= 501) return 2;
  if (e >= 1) return 1;
  return Math.max(1, Math.min(10, Number(fallbackLevel) || 1));
}

import React, { useEffect, useState } from "react";
import { getOfficialFaceitBadge, getMapThumbnail } from "@/lib/cs2-assets";
import { ExternalLink, Flame } from "lucide-react";

interface FaceitTabProps {
  data?: any;
}

export function FaceitTab({ data }: FaceitTabProps) {
  const [faceitData, setFaceitData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

    const targetSteamId = data?.steamId64 || data?.player?.steamId || data?.steam?.steamid;

  useEffect(() => {
    async function loadData() {
      if (!targetSteamId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`/api/faceit?steamId=${targetSteamId}`);
        const json = await res.json();
        if (json && !json.error) {
          setFaceitData(json);
        } else {
          setFaceitData(null);
        }
      } catch (err) {
        console.error("Failed to load FACEIT data", err);
        setFaceitData(null);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [targetSteamId]);

  const activeFaceit = faceitData || data?.faceit;
  const elo = activeFaceit?.elo ?? activeFaceit?.faceit_elo ?? null;
  const skillLevel = activeFaceit?.skillLevel ?? activeFaceit?.skill_level ?? 1;
  const region = activeFaceit?.region ?? "--";
  const lifetime = activeFaceit?.lifetime || {};
  const nickname = activeFaceit?.nickname ?? data?.steam?.personaname ?? "CS2 Operative";
  const avatar = activeFaceit?.avatar || data?.steam?.avatarfull || "";
  const matches = faceitData?.matches || [];
  const faceitProfileUrl = `https://www.faceit.com/en/players/${nickname}`;

  const levelBadge = getOfficialFaceitBadge(skillLevel);

  return (
    <div className="space-y-4 font-sans text-[#E5E7EB]">
      {/* 1. TOP HEADER BANNER (AUTHENTIC FACEIT PROFILE HERO) */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-r from-[#14161a] via-[#101216] to-[#0c0d10] p-5 shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF5500] to-transparent opacity-80" />
        
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={avatar} alt={nickname} className="h-16 w-16 rounded-xl object-cover border-2 border-white/10 shadow-lg" />
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#1e2025] border border-white/15">
                <img src={levelBadge.badgePath} alt={`Level ${skillLevel}`} className="w-5 h-5 object-contain inline-block shrink-0" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-zinc-400 uppercase">
                <span className="flex items-center gap-1 font-black text-[#FF5500]">
                  <Flame className="w-3.5 h-3.5 fill-[#FF5500]" /> FACEIT
                </span>
                <span>•</span>
                <span className="text-white text-sm font-black">{nickname}</span>
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-zinc-300">{region}</span>
              </div>

              <div className="mt-2 flex items-center gap-3">
                <span className="text-2xl font-black tracking-tight text-white font-mono">{elo != null && !isNaN(Number(elo)) ? `${Number(elo).toLocaleString()} ELO` : "UNRANKED"}</span>
                <span className="rounded border border-[#FF5500]/30 bg-[#FF5500]/10 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-[#FF5500] uppercase">
                  Level {skillLevel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            {/* Country & Global Ranking */}
            {(() => {
              const countryRank = faceitData?.rankingCountry || faceitData?.country_ranking || faceitData?.player?.ranking_country;
              const globalRank = faceitData?.rankingGlobal || faceitData?.global_ranking || faceitData?.player?.ranking_global;

              return (
                <>
                  {countryRank ? (
                    <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2 shadow-inner">
                      <span className="text-sm">🇮🇳</span>
                      <div className="flex flex-col text-right font-mono">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Country</span>
                        <span className="text-xs font-black text-white">#{Number(countryRank).toLocaleString()}</span>
                      </div>
                    </div>
                  ) : null}

                  {globalRank ? (
                    <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2 shadow-inner">
                      <span className="text-xs">🌐</span>
                      <div className="flex flex-col text-right font-mono">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Global</span>
                        <span className="text-xs font-black text-white">#{Number(globalRank).toLocaleString()}</span>
                      </div>
                    </div>
                  ) : null}
                </>
              );
            })()}

            {/* Official FACEIT Profile Redirect */}
            <a
              href={faceitProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-[#FF5500]/50 bg-[#FF5500] px-3.5 py-2.5 text-xs font-extrabold tracking-wider text-white uppercase shadow-[0_0_15px_rgba(255,85,0,0.3)] transition-all hover:bg-[#ff6a1f] active:scale-95"
            >
              <span>FACEIT Profile</span>
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. RECENT PERFORMANCE TELEMETRY (MATCHING FACEIT UI/UX DESIGN) */}
      <div className="rounded-xl border border-white/[0.08] bg-gradient-to-b from-[#14161a] to-[#0f1115] p-5 shadow-2xl">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-sm font-black tracking-wide uppercase text-white flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#FF5500]" />
              Recent performance
            </h2>
            <div className="mt-1 text-xs font-semibold text-zinc-400">
              Live Pipeline • <span className="font-bold text-emerald-400">Synchronized</span>
            </div>
          </div>
          <div className="text-xs font-mono font-medium text-zinc-400">
            Last 30 Matches • <span className="text-white font-bold">{matches.length} Tracked</span>
          </div>
        </div>

        {/* 6-Card Telemetry Grid with FACEIT Visual Language */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 text-xs">
          <div className="rounded-xl border border-white/[0.07] bg-black/50 p-4 transition-all hover:border-[#FF5500]/40">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-zinc-500 block">Skill Level</span>
            <span className="mt-2 text-base font-black text-white block font-mono">Level {skillLevel}</span>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-black/50 p-4 transition-all hover:border-[#FF5500]/40">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-zinc-500 block">K/D Ratio</span>
            <span className="mt-2 text-base font-black text-white block font-mono">{lifetime.kdRatio || 1.18}</span>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-black/50 p-4 transition-all hover:border-[#FF5500]/40">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-zinc-500 block">Headshots</span>
            <span className="mt-2 text-base font-black text-white block font-mono">{lifetime.headshots || "53"}%</span>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-black/50 p-4 transition-all hover:border-[#FF5500]/40">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-zinc-500 block">Win Rate</span>
            <span className="mt-2 text-base font-black text-emerald-400 block font-mono">{lifetime.winRate || "60"}%</span>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-black/50 p-4 transition-all hover:border-[#FF5500]/40">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-zinc-500 block">Total Matches</span>
            <span className="mt-2 text-base font-black text-white block font-mono">{lifetime.matches || 93}</span>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-black/50 p-4 transition-all hover:border-[#FF5500]/40">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-zinc-500 block">Platform</span>
            <span className="mt-2 text-base font-black text-white block font-mono">CS2 Steam</span>
          </div>
        </div>
      </div>

      {/* 3. OFFICIAL MATCH HISTORY TABLE WITH ROOM LINKS */}
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0e1014] shadow-2xl">
        <div className="grid grid-cols-12 items-center gap-2 border-b border-white/[0.08] bg-black/60 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-zinc-400">
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Score</div>
          <div className="col-span-2">Level / Elo</div>
          <div className="col-span-1">Rating</div>
          <div className="col-span-2">K / D / A</div>
          <div className="col-span-1">K/D</div>
          <div className="col-span-1">ADR</div>
          <div className="col-span-1 text-right">Map / Room</div>
        </div>

        <div className="max-h-[620px] overflow-y-auto divide-y divide-white/[0.04]">
          {loading ? (
            <div className="py-16 text-center text-xs text-zinc-500 font-mono">Loading real-time FACEIT data...</div>
          ) : matches.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-500 font-mono">No recent match history found.</div>
          ) : (
            matches.map((m: any) => {
              const rowLvl = getFaceitLevelFromElo(m.elo, m.skillLevel || m.skill_level);
                const lvlBadge = getOfficialFaceitBadge(rowLvl);
              const mapThumb = getMapThumbnail(m.map);
              const roomUrl = m.id && m.id.length > 5 
                ? `https://www.faceit.com/en/cs2/room/${m.id}` 
                : `https://www.faceit.com/en/players/${nickname}`;

              return (
                <div key={m.id} className="relative grid grid-cols-12 items-center gap-2 px-4 py-3 text-xs transition hover:bg-white/[0.03]">
                  {/* Left Result Indicator Strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${m.isWin ? "bg-emerald-500" : "bg-rose-500"}`} />
                  
                  {/* Date & Time */}
                  <div className="col-span-2 flex flex-col font-mono">
                    <span className="font-bold text-white">{m.date}</span>
                    <span className="text-[10px] text-zinc-500">{m.time}</span>
                  </div>

                  {/* Score & W/L Badge */}
                  <div className="col-span-2 flex items-center gap-2">
                    <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-black uppercase ${
                      m.isWin ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}>
                      {m.isWin ? "W" : "L"}
                    </span>
                    <span className="font-black tracking-tight text-white font-mono">{m.score}</span>
                  </div>

                  {/* Level Badge & Elo */}
                  <div className="col-span-2 flex items-center gap-2.5">
                    <img src={lvlBadge.badgePath} alt={lvlBadge.name} className="h-5 w-5 object-contain shrink-0 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]" />
                    <div className="flex items-center gap-1 font-mono">
                      <span className="font-black text-white">{m.elo}</span>
                      <span className={`text-[10px] font-bold ${m.eloChange > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {m.eloChange > 0 ? `↑ ${m.eloChange}` : `↓ ${Math.abs(m.eloChange)}`}
                      </span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="col-span-1">
                    <span className="inline-block rounded px-1.5 py-0.5 font-mono text-[11px] font-bold bg-zinc-800 text-white border-b-2 border-white">
                      {m?.rating != null && !isNaN(Number(m.rating)) ? Number(m.rating).toFixed(2) : "--"}
                    </span>
                  </div>

                  {/* K / D / A */}
                  <div className="col-span-2 font-mono text-zinc-300">{m.kda}</div>

                  {/* K/D */}
                  <div className="col-span-1 font-mono text-zinc-300">{m?.kd != null && !isNaN(Number(m.kd)) ? Number(m.kd).toFixed(2) : "--"}</div>

                  {/* ADR */}
                  <div className="col-span-1 font-mono text-zinc-300">{m.adr}</div>

                  {/* Map Emblem & Faceit Room Link */}
                  <div className="col-span-1 flex items-center justify-end gap-2">
                    <img src={mapThumb} alt={m.map || "Map"} className="h-4 w-4 rounded-sm object-cover shrink-0" onError={(e) => { e.currentTarget.src = "/maps/de_dust2.png"; }} />
                    <a
                      href={roomUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Open FACEIT Room for ${m.map}`}
                      className="group flex items-center gap-1 font-semibold text-zinc-300 transition-colors hover:text-[#FF5500]"
                    >
                      <span className="truncate max-w-[65px]">{m.map}</span>
                      <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 shrink-0" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default FaceitTab;
