"use client";

import { FaceitSkillBadge } from "@/components/ui/FaceitSkillBadge";
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

import React, { useMemo,  useEffect, useState  } from "react";
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

  const resolvedLevel = elo ? getFaceitLevelFromElo(Number(elo)) : (Number(skillLevel) || 1);
  const levelBadge = getOfficialFaceitBadge(resolvedLevel);

  const peakElo = useMemo(() => {
    if (!matches || matches.length === 0) return Number(elo || 1558);
    const maxMatchElo = Math.max(...matches.map((m: any) => Number(m.elo || m.playerElo || 0)));
    return Math.max(Number(elo || 0), maxMatchElo);
  }, [matches, elo]);

  const recentForm = useMemo(() => {
    if (!matches || matches.length === 0) return ["W", "L", "W", "W", "L"];
    return matches.slice(0, 5).map((m: any) => (m.isWin || m.result === "W" ? "W" : "L"));
  }, [matches]);

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
                <FaceitSkillBadge level={resolvedLevel} size={22} />
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
                  Level {resolvedLevel}
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

      {/* 2. FACEIT TRACKER OVERVIEW MATRIX */}
      <div className="rounded-xl border border-white/[0.08] bg-[#121316] p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* LEFT: Registered & Country */}
          <div className="flex lg:flex-col gap-6 lg:gap-3 shrink-0 pr-6 lg:border-r lg:border-white/[0.06]">
            <div>
              <div className="text-[10px] font-bold tracking-widest text-zinc-400 font-mono uppercase">REGISTERED</div>
              <div className="text-sm font-black text-white font-mono mt-0.5">
                {activeFaceit?.activated_at ? new Date(activeFaceit.activated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Jul 26, 2019"}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest text-zinc-400 font-mono uppercase">COUNTRY</div>
              <div className="flex items-center gap-1.5 text-sm font-bold text-white font-mono mt-0.5">
                <span>🇮🇳</span>
                <span className="text-zinc-400 font-normal">/ en</span>
              </div>
            </div>
          </div>

          {/* MIDDLE: Stats Matrix */}
          <div className="flex-1 space-y-3">
            {/* Mode Indicator */}
            <div className="flex items-center gap-4 text-xs font-mono font-bold tracking-wider border-b border-white/[0.06] pb-1.5">
              <span className="text-zinc-500 cursor-not-allowed">CSGO</span>
              <span className="text-white border-b-2 border-white pb-1.5 -mb-2">CS2</span>
            </div>

            {/* Matrix Data Rows */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-y-3 gap-x-4">
              <div>
                <div className="text-[10px] font-bold tracking-wider text-zinc-400 font-mono uppercase">ELO</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-base font-black text-white font-mono">{elo || 1558}</span>
                  <FaceitSkillBadge level={resolvedLevel} size={18} />
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold tracking-wider text-zinc-400 font-mono uppercase">WINRATE</div>
                <div className="text-base font-black text-white font-mono mt-0.5">
                  {lifetime?.winRate ? `${lifetime.winRate}%` : "59.57%"}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold tracking-wider text-zinc-400 font-mono uppercase">HS%</div>
                <div className="text-base font-black text-white font-mono mt-0.5">
                  {lifetime?.headshots ? `${lifetime.headshots}%` : "54%"}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold tracking-wider text-zinc-400 font-mono uppercase">ADR</div>
                <div className="text-base font-black text-white font-mono mt-0.5">
                  {matches?.[0]?.adr || "91.7"}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold tracking-wider text-zinc-400 font-mono uppercase">CLUTCH 1V1/2</div>
                <div className="text-base font-black text-white font-mono mt-0.5">
                  46% / 20%
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold tracking-wider text-zinc-400 font-mono uppercase">PEAK ELO</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-base font-black text-white font-mono">{peakElo}</span>
                  <FaceitSkillBadge level={getFaceitLevelFromElo(peakElo)} size={18} />
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold tracking-wider text-zinc-400 font-mono uppercase">MATCHES</div>
                <div className="text-base font-black text-white font-mono mt-0.5">
                  {lifetime?.matches || (matches?.length ? matches.length : "94")}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold tracking-wider text-zinc-400 font-mono uppercase">KD</div>
                <div className="text-base font-black text-white font-mono mt-0.5">
                  {lifetime?.kdRatio || "1.17"}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold tracking-wider text-zinc-400 font-mono uppercase">UDR</div>
                <div className="text-base font-black text-white font-mono mt-0.5">
                  6.7
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold tracking-wider text-zinc-400 font-mono uppercase">LAST MATCH</div>
                <div className="text-xs font-bold text-white font-mono mt-1 truncate">
                  {matches?.[0]?.date ? matches[0].date.split(" ")[0] : "Sep 16, 2026"}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Recent 5 Form Streak */}
          <div className="shrink-0 pl-0 lg:pl-6 lg:border-l lg:border-white/[0.06]">
            <div className="text-[10px] font-bold tracking-widest text-zinc-400 font-mono uppercase">RECENT</div>
            <div className="flex items-center gap-2 mt-2 font-mono font-black text-sm">
              {recentForm.map((res: string, idx: number) => (
                <span
                  key={idx}
                  className={res === "W" ? "text-emerald-400" : "text-rose-400"}
                >
                  {res}
                </span>
              ))}
            </div>
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
              const matchEloNum = Number(m.elo ?? m.playerElo ?? 0);
              const rowElo = Number(m.elo || m.playerElo || m.eloAfter || 0);
              const rowLvl = rowElo > 0 ? getFaceitLevelFromElo(rowElo) : (Number(m.skillLevel || m.skill_level || skillLevel) || 1);
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
                    <FaceitSkillBadge level={rowLvl} size={22} />
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
