"use client";

import React, { useState } from "react";
import { Terminal, Send, CheckCircle2, AlertCircle } from "lucide-react";

export function MatchParserInput() {
  const [shareCode, setShareCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareCode.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/matches/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareCode: shareCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to decode match share-code.");
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Network sync error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl p-4 bg-[#080d14] border border-cyan-900/50 rounded font-mono text-xs">
      <div className="flex items-center gap-2 mb-3 text-cyan-400 font-bold uppercase tracking-wider">
        <Terminal className="w-4 h-4" />
        <span>Match Ingestion Decoder</span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={shareCode}
          onChange={(e) => setShareCode(e.target.value)}
          placeholder="CSGO-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx"
          className="flex-1 bg-[#05080c] border border-cyan-950 px-3 py-2 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded flex items-center gap-1.5 transition-colors"
        >
          {loading ? "PARSING..." : <><Send className="w-3.5 h-3.5" /> DECODE</>}
        </button>
      </form>

      {error && (
        <div className="mt-3 p-2 bg-rose-950/40 border border-rose-800 text-rose-300 flex items-center gap-2 rounded">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="mt-3 p-2 bg-emerald-950/40 border border-emerald-800 text-emerald-300 flex items-center gap-2 rounded">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Match Queued. Match ID: {result.matchId || result.id || "OK"}</span>
        </div>
      )}
    </div>
  );
}
