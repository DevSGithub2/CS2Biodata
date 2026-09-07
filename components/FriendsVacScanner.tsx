"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, ShieldCheck, ExternalLink, Loader2, Users, AlertTriangle, Filter } from "lucide-react";

interface FriendsVacScannerProps {
  steamId64: string;
}

export function FriendsVacScanner({ steamId64 }: FriendsVacScannerProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "banned" | "clean">("all");

  useEffect(() => {
    async function loadFriends() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/friends?steamId64=${encodeURIComponent(steamId64)}`);
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error || "Failed to fetch friend ban records.");
        }
        setData(json.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (steamId64) {
      loadFriends();
    }
  }, [steamId64]);

  if (loading) {
    return (
      <div className="bg-[#0b101d] border border-slate-800/80 rounded-2xl p-12 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-7 w-7 text-emerald-400 animate-spin" />
        <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">
          Scanning Friends List for VAC & Game Bans...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0b101d] border border-slate-800/80 rounded-2xl p-8 text-center space-y-2">
        <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto" />
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Friends List Inaccessible</h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
      </div>
    );
  }

  const friends = data?.friends || [];
  const filteredFriends = friends.filter((f: any) => {
    if (filter === "banned") return f.isBanned;
    if (filter === "clean") return !f.isBanned;
    return true;
  });

  const bannedCount = data?.bannedCount || 0;
  const totalCount = data?.total || 0;
  const cleanCount = totalCount - bannedCount;

  return (
    <div className="space-y-4">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#0b101d] border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Scanned Friends</span>
            <span className="text-2xl font-black text-white font-mono">{totalCount}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800 text-slate-300">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-[#0b101d] border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Clean Records</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{cleanCount}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-[#0b101d] border border-rose-900/40 rounded-xl p-4 flex items-center justify-between bg-gradient-to-r from-rose-950/20 to-transparent">
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider">Banned Friends</span>
            <span className="text-2xl font-black text-rose-400 font-mono">{bannedCount}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0b101d] border border-slate-800/80 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Filter className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-bold uppercase tracking-wider text-[11px]">Filter List:</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              filter === "all" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter("banned")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              filter === "banned"
                ? "bg-rose-500/20 border border-rose-500/40 text-rose-300"
                : "text-slate-400 hover:text-rose-300"
            }`}
          >
            Banned Only ({bannedCount})
          </button>
          <button
            onClick={() => setFilter("clean")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              filter === "clean"
                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                : "text-slate-400 hover:text-emerald-300"
            }`}
          >
            Clean ({cleanCount})
          </button>
        </div>
      </div>

      {/* Friends Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredFriends.map((f: any) => (
          <div
            key={f.steamId64}
            className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
              f.isBanned
                ? "bg-rose-950/20 border-rose-900/60 hover:border-rose-700"
                : "bg-[#0b101d] border-slate-800/80 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={f.avatar}
                alt={f.personaName}
                className={`w-11 h-11 rounded-lg object-cover flex-shrink-0 border ${
                  f.isBanned ? "border-rose-500/60" : "border-slate-700"
                }`}
              />
              <div className="min-w-0">
                <a
                  href={`/?q=${f.steamId64}`}
                  className="font-bold text-xs text-white hover:text-emerald-400 truncate block transition-colors"
                >
                  {f.personaName}
                </a>
                <span className="text-[10px] font-mono text-slate-500 block truncate">
                  {f.steamId64}
                </span>
                {f.isBanned ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-[9px] uppercase">
                      {f.vacBanned ? `VAC (${f.vacBanCount})` : `Game Ban (${f.gameBanCount})`}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {f.daysSinceLastBan}d ago
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                    In Good Standing
                  </span>
                )}
              </div>
            </div>

            <a
              href={f.profileUrl}
              target="_blank"
              rel="noreferrer"
              title="Open Steam Profile"
              className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors flex-shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FriendsVacScanner;
