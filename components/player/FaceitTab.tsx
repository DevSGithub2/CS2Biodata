"use client";

import React, { useEffect, useState } from "react";
import { getOfficialFaceitBadge, getMapThumbnail } from "@/lib/cs2-assets";

interface FaceitTabProps {
  data?: any;
}

export function FaceitTab({ data }: FaceitTabProps) {
  const [faceitData, setFaceitData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/faceit?steamId=76561198877011661");
        const json = await res.json();
        if (json && !json.error) {
          setFaceitData(json);
        }
      } catch (err) {
        console.error("Failed to load FACEIT data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const elo = faceitData?.elo ?? 1535;
  const skillLevel = faceitData?.skillLevel ?? 8;
  const region = faceitData?.region ?? "SEA";
  const lifetime = faceitData?.lifetime || {};
  const nickname = faceitData?.nickname ?? "DevS";
  const avatar = faceitData?.avatar ?? "https://distribution.faceit-cdn.net/images/ab32cd0d-abf9-4b76-a1f9-bd5ca5171a4e.jpg";
  const matches = faceitData?.matches || [];

  const levelBadge = getOfficialFaceitBadge(skillLevel);

  return (
    <div className="space-y-4 font-sans text-[#E5E7EB]">
      {/* 1. TOP HEADER BANNER */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0f1115] p-5 shadow-xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <img src={avatar} alt={nickname} className="h-14 w-14 rounded-xl object-cover border border-white/10" />
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <span className="text-[#FF5500] font-bold">FACEIT</span>
                <span>•</span>
                <span>{nickname}</span>
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white uppercase">{region}</span>
              </div>

              <div className="mt-2 flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0">
                  <img src={levelBadge.badgePath} alt={`Level ${skillLevel}`} className="h-full w-full object-contain" />
                </div>
                <span className="text-2xl font-black tracking-tight text-white">{elo.toLocaleString()} ELO</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-2 rounded-lg bg-black/40 px-3 py-1.5 border border-white/[0.08]">
                <span className="text-sm">🇮🇳</span>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500">Country Rank</span>
                  <span className="font-black text-white">#672</span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-black/40 px-3 py-1.5 border border-white/[0.08]">
                <span className="text-xs">🌐</span>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500">Global Rank</span>
                  <span className="font-black text-white">#14,070</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECENT PERFORMANCE TELEMETRY */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0f1115] p-5 shadow-xl">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-sm font-bold tracking-wide text-white">Recent performance</h2>
            <div className="mt-0.5 text-xs font-semibold text-zinc-400">
              Live API Sync Active • <span className="font-bold text-emerald-400">Connected</span>
            </div>
          </div>
          <div className="text-xs font-medium text-zinc-400">
            Last 30 Matches • <span className="text-white font-bold">{matches.length} Fetched</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 text-xs">
          <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Skill Level</span>
            <span className="mt-2 text-base font-black text-white block">Level {skillLevel}</span>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">K/D Ratio</span>
            <span className="mt-2 text-base font-black text-white block font-mono">{lifetime.kdRatio || 1.18}</span>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Headshots</span>
            <span className="mt-2 text-base font-black text-white block font-mono">{lifetime.headshots || "53%"}</span>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Win Rate</span>
            <span className="mt-2 text-base font-black text-emerald-400 block font-mono">{lifetime.winRate || "60"}%</span>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Total Matches</span>
            <span className="mt-2 text-base font-black text-white block font-mono">{lifetime.matches || 93}</span>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Platform</span>
            <span className="mt-2 text-base font-black text-white block">CS2 Steam</span>
          </div>
        </div>
      </div>

      {/* 3. REAL API MATCH HISTORY TABLE WITH LARGER MAP SVGs */}
      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0f1115] shadow-xl">
        <div className="grid grid-cols-12 items-center gap-2 border-b border-white/[0.06] bg-black/40 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Score</div>
          <div className="col-span-2">Level / Elo</div>
          <div className="col-span-1">Rating</div>
          <div className="col-span-2">K / D / A</div>
          <div className="col-span-1">K/D</div>
          <div className="col-span-1">ADR</div>
          <div className="col-span-1 text-right">Map</div>
        </div>

        <div className="max-h-[580px] overflow-y-auto divide-y divide-white/[0.04]">
          {loading ? (
            <div className="py-12 text-center text-xs text-zinc-500">Connecting to FACEIT Live API...</div>
          ) : matches.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">No recent match history found from API.</div>
          ) : (
            matches.map((m: any) => {
              const lvlBadge = getOfficialFaceitBadge(m.elo);
              const mapThumb = getMapThumbnail(m.map);

              return (
                <div key={m.id} className="relative grid grid-cols-12 items-center gap-2 px-4 py-3 text-xs transition hover:bg-white/[0.02]">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${m.isWin ? "bg-emerald-500" : "bg-rose-500"}`} />
                  <div className="col-span-2 flex flex-col">
                    <span className="font-bold text-white">{m.date}</span>
                    <span className="text-[10px] text-zinc-500">{m.time}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-black uppercase ${m.isWin ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"}`}>
                      {m.isWin ? "W" : "L"}
                    </span>
                    <span className="font-black tracking-tight text-white">{m.score}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2.5">
                    <img src={lvlBadge.badgePath} alt={`Level ${lvlBadge.label}`} className="h-6 w-6 object-contain" />
                    <div className="flex items-center gap-1 font-mono">
                      <span className="font-black text-white">{m.elo}</span>
                      <span className={`text-[10px] font-bold ${m.eloChange > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {m.eloChange > 0 ? `↑ ${m.eloChange}` : `↓ ${Math.abs(m.eloChange)}`}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <span className="inline-block rounded px-1.5 py-0.5 font-mono text-[11px] font-bold bg-zinc-800 text-white border-b-2 border-white">
                      {m.rating.toFixed(2)}
                    </span>
                  </div>
                  <div className="col-span-2 font-mono text-zinc-300">{m.kda}</div>
                  <div className="col-span-1 font-mono text-zinc-300">{m.kd.toFixed(2)}</div>
                  <div className="col-span-1 font-mono text-zinc-300">{m.adr}</div>
                  <div className="col-span-1 flex items-center justify-end gap-2">
                    <img src={mapThumb} alt={m.map} className="h-7 w-7 rounded-full object-cover border border-white/[0.15] shadow-sm" />
                    <span className="font-semibold text-zinc-300">{m.map}</span>
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
