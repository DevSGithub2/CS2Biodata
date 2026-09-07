"use client";

import React, { useEffect, useState } from "react";
import { Crosshair, Clock, ShieldAlert, Target, Award, Zap } from "lucide-react";

interface Props {
  steamId64: string;
}

export default function WeaponStatsViewer({ steamId64 }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const res = await fetch(`/api/player-stats?steamId64=${steamId64}`);
        const json = await res.json();
        if (json.success) setData(json);
      } catch (err) {
        console.error("Failed to load weapon stats:", err);
      } finally {
        setLoading(false);
      }
    }
    if (steamId64) loadStats();
  }, [steamId64]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#0c101c]/80 border border-slate-800 rounded-2xl gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 text-sm font-medium">Extracting lifetime weapon mastery and playtime data...</span>
      </div>
    );
  }

  if (data?.isPrivate || !data?.lifetime) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#0c101c]/80 border border-slate-800 rounded-2xl text-center">
        <ShieldAlert className="w-8 h-8 text-amber-500/80 mb-2" />
        <h4 className="text-slate-200 font-bold text-sm">Steam Game Stats are Private</h4>
        <p className="text-slate-500 text-xs mt-1 max-w-sm">
          Lifetime kill distribution and exact hours require the player's Steam "Game details" privacy to be public.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Playtime & Lifetime Combat Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0c1220]/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold uppercase mb-1">
            <Clock className="w-4 h-4" /> Total Playtime
          </div>
          <div className="text-xl font-black text-white">{data.playtime.totalHours ? `${data.playtime.totalHours.toLocaleString()} hrs` : "—"}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{data.playtime.recentHours} hrs past 2 weeks</div>
        </div>

        <div className="bg-[#0c1220]/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase mb-1">
            <Crosshair className="w-4 h-4" /> Lifetime K/D
          </div>
          <div className="text-xl font-black text-white">{data.lifetime.kd}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{data.lifetime.kills} Total Kills</div>
        </div>

        <div className="bg-[#0c1220]/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold uppercase mb-1">
            <Target className="w-4 h-4" /> Headshot Rate
          </div>
          <div className="text-xl font-black text-white">{data.lifetime.hsPercentage}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{data.lifetime.headshots} Headshots</div>
        </div>

        <div className="bg-[#0c1220]/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase mb-1">
            <Award className="w-4 h-4" /> Total MVPs
          </div>
          <div className="text-xl font-black text-white">{data.lifetime.mvps}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{data.lifetime.roundsWon} Rounds Won</div>
        </div>
      </div>

      {/* Weapon Arsenal Breakdown */}
      <div className="bg-[#0c1220]/90 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-pink-400" />
            <h3 className="text-white font-bold text-sm uppercase tracking-wide">Weapon Mastery & Kill Distribution</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Ranked by Lifetime Frags</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.weapons.map((w: any) => {
            const rawKills = Number(String(data.lifetime.kills).replace(/,/g, "")) || 1;
            const killShare = ((w.kills / rawKills) * 100).toFixed(1);

            return (
              <div key={w.name} className="bg-[#080d18] border border-slate-800/80 p-3.5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-sm">{w.name}</span>
                    <span className="text-xs font-mono text-pink-400 font-bold">{w.kills.toLocaleString()} kills</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-2">
                    <div className="bg-pink-500 h-full rounded-full" style={{ width: `${Math.min(100, Number(killShare) * 2.5)}%` }} />
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/60 font-mono">
                  <span>Arsenal Share: {killShare}%</span>
                  <span>Shots Hit: {w.hits.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
