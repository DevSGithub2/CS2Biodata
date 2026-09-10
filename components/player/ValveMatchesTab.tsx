"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Crosshair, Trophy } from "lucide-react";

interface ValveMatchRecord {
  matchId: string;
  shareCode: string;
  map: string;
  mode: string;
  matchTime: string;
  scoreCT: number;
  scoreT: number;
  winnerTeam: "CT" | "TERRORIST" | "TIE";
  players: any[];
}

export function ValveMatchesTab({ steamId }: { steamId: string }) {
  const [matches, setMatches] = useState<ValveMatchRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch(`/api/valve/sync?steamId=${steamId}`);
        const data = await res.json();
        if (data.matches) setMatches(data.matches);
      } catch (err) {
        console.error("Failed to load matches:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, [steamId]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-zinc-500">Loading Valve match history...</div>;
  }

  if (matches.length === 0) {
    return (
      <div className="rounded-xl border border-white/5 bg-[#12141a] p-8 text-center">
        <Crosshair className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
        <p className="text-sm font-semibold text-zinc-400">No official Valve matches synced yet.</p>
        <p className="text-xs text-zinc-600 mt-1">Use "Sync Valve History" to import your match telemetry.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((m) => {
        const dateStr = new Date(m.matchTime).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        return (
          <div
            key={m.matchId}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-[#12141a] p-4 transition hover:border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="font-bold text-sm text-white capitalize">{m.map.replace("de_", "")}</span>
                <span className="text-[11px] text-zinc-500 uppercase">{m.mode}</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="font-mono text-sm font-bold text-white">
                  <span className="text-sky-400">{m.scoreCT}</span> : <span className="text-amber-500">{m.scoreT}</span>
                </div>
                <div className="flex items-center justify-end gap-1 text-[10px] text-zinc-500">
                  <Calendar className="h-3 w-3" />
                  {dateStr}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
