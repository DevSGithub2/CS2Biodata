"use client";

import { useState } from "react";
import { FileCode, CheckCircle2 } from "lucide-react";
import RichMatchScoreboard from "./RichMatchScoreboard";

export default function MatchImporter({ steamId64 }: { steamId64?: string }) {
  const [shareCode, setShareCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);
  const [error, setError] = useState("");

  const handleFetchMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareCode.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareCode: shareCode.trim(), steamId64 }),
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Failed to parse Valve match.");
      }

      setMatchData(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#0c1220] border border-slate-800/90 rounded-xl p-6 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          <h3 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-2">
            <FileCode className="h-4 w-4 text-emerald-400" /> Valve Official Match Ingestion
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Extract official round telemetry and performance matrices using Valve Share Codes.
          </p>
        </div>
      </div>

      <form onSubmit={handleFetchMatch} className="flex gap-2">
        <input
          type="text"
          value={shareCode}
          onChange={(e) => setShareCode(e.target.value)}
          placeholder="Paste Match Code (e.g., CSGO-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx)"
          className="flex-1 px-4 py-2.5 bg-[#070b13] border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-5 py-2.5 rounded-lg text-xs tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          {loading ? "PARSING..." : "ANALYZE MATCH"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-lg text-xs">
          ⚠️ {error}
        </div>
      )}

      {matchData && (
        <div className="mt-6 space-y-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" /> Telemetry Request Sent to Game Coordinator
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#070b13] border border-slate-800 p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Map</span>
              <span className="text-sm font-black text-white">{matchData.map || "N/A"}</span>
            </div>
            <div className="bg-[#070b13] border border-slate-800 p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Final Score</span>
              <span className="text-sm font-black text-emerald-400">{matchData.score || "INGESTING"}</span>
            </div>
            <div className="bg-[#070b13] border border-slate-800 p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Match Date</span>
              <span className="text-xs font-bold text-slate-300 truncate block mt-0.5">{matchData.matchTime || "N/A"}</span>
            </div>
            <div className="bg-[#070b13] border border-slate-800 p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Rounds</span>
              <span className="text-sm font-black text-purple-400">{matchData.totalRounds || "N/A"}</span>
            </div>
          </div>

          {/* DYNAMIC PROTOBUF SCOREBOARD RENDERING */}
          {(matchData.scoreboard && matchData.scoreboard.length > 0) ? (
            <div className="mt-4">
              <RichMatchScoreboard 
                scoreboard={matchData.scoreboard} 
                matchResult={matchData.result || "VERIFIED"} 
                score={matchData.score} 
              />
            </div>
          ) : (
            <div className="mt-4 p-5 text-center bg-[#070b13] border border-emerald-900/30 rounded-lg">
              <p className="text-xs text-emerald-400/80 font-mono animate-pulse">
                ⏳ Match registered successfully. The Background GC Bot is actively downloading Protobuf telemetry from Valve. 
                <br/><br/>Refresh the page in a few seconds and check the Match History tab to view the live scoreboard.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
