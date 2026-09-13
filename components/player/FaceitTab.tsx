"use client";

import React, { useState, useEffect } from "react";
import { Flame, ExternalLink, ShieldAlert, Target, Trophy, Swords } from "lucide-react";
import { getOfficialFaceitBadge } from "@/lib/cs2-assets";

interface FaceitTabProps {
  data?: any;
}

export function FaceitTab({ data }: FaceitTabProps) {
  const [faceitData, setFaceitData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const targetSteamId = data?.steamId64 || data?.player?.steamId || data?.steam?.steamId64 || data?.steam?.steamid;

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
        if (json && !json.error && (json.nickname || json.player_id)) {
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

  const activeFaceit = faceitData || (data?.faceit?.nickname ? data.faceit : null);
  const isLinked = Boolean(activeFaceit && (activeFaceit.nickname || activeFaceit.player_id));

  // --- UNLINKED / NOT FOUND STATE ---
  if (!loading && !isLinked) {
    const steamName = data?.steam?.personaName || data?.player?.personaName || "This operative";
    return (
      <div className="rounded-xl border border-white/[0.08] bg-[#070b12]/90 backdrop-blur-md p-10 font-mono text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF5500]/50 to-transparent" />
        
        <div className="max-w-md mx-auto flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500] shadow-[0_0_20px_rgba(255,85,0,0.15)]">
            <Flame className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-black uppercase tracking-wider text-white">
              No FACEIT Telemetry Found
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              <span className="text-zinc-200 font-bold">{steamName}</span> has no registered CS2 FACEIT profile or has not connected their Steam ID (<span className="text-cyan-400">{targetSteamId}</span>) to the FACEIT competitive network.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <a
              href={`https://www.faceit.com/en/search/players/${encodeURIComponent(steamName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF5500]/15 hover:bg-[#FF5500]/25 border border-[#FF5500]/40 text-[#FF5500] hover:text-white text-xs font-bold uppercase tracking-wider transition-all"
            >
              <span>Search FACEIT by Alias</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // --- VERIFIED / LINKED FACEIT PROFILE ---
  const elo = activeFaceit?.elo ?? activeFaceit?.faceit_elo ?? null;
  const skillLevel = activeFaceit?.skillLevel ?? activeFaceit?.skill_level ?? 1;
  const region = activeFaceit?.region ?? "--";
  const lifetime = activeFaceit?.lifetime || {};
  const nickname = activeFaceit?.nickname ?? "FACEIT Operative";
  const avatar = activeFaceit?.avatar || data?.steam?.avatar || "";
  const faceitProfileUrl = `https://www.faceit.com/en/players/${nickname}`;
  const levelBadge = getOfficialFaceitBadge(skillLevel);

  return (
    <div className="space-y-4 font-mono text-[#E5E7EB]">
      {/* Authentic Header Banner */}
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
                <span className="text-2xl font-black tracking-tight text-white font-mono">
                  {elo != null && !isNaN(Number(elo)) ? `${Number(elo).toLocaleString()} ELO` : "CALIBRATING"}
                </span>
                <span className="rounded border border-[#FF5500]/30 bg-[#FF5500]/10 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-[#FF5500] uppercase">
                  Level {skillLevel}
                </span>
              </div>
            </div>
          </div>

          <div>
            <a
              href={faceitProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#FF5500] px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#ff681a] shadow-[0_0_15px_rgba(255,85,0,0.3)]"
            >
              <span>FACEIT PROFILE</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06]">
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">K/D RATIO</span>
          <div className="text-lg font-black text-white mt-1">{lifetime["Average K/D Ratio"] || "--"}</div>
        </div>
        <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06]">
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">WIN RATE</span>
          <div className="text-lg font-black text-emerald-400 mt-1">{lifetime["Win Rate %"] ? `${lifetime["Win Rate %"]}%` : "--"}</div>
        </div>
        <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06]">
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">MATCHES</span>
          <div className="text-lg font-black text-white mt-1">{lifetime["Matches"] || "--"}</div>
        </div>
        <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06]">
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">HEADSHOT %</span>
          <div className="text-lg font-black text-amber-300 mt-1">{lifetime["Average Headshots %"] ? `${lifetime["Average Headshots %"]}%` : "--"}</div>
        </div>
      </div>
    </div>
  );
}
