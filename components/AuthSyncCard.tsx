"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";

export interface AuthSyncCardProps {
  steamId64?: string;
  steamId?: string;
}

export function AuthSyncCard({ steamId64: propSteamId64, steamId: propSteamId }: AuthSyncCardProps) {
  const searchParams = useSearchParams();
  const urlSteamId = searchParams.get("q") || searchParams.get("steamId") || searchParams.get("steamId64") || "";
  const effectiveSteamId = propSteamId64 || propSteamId || urlSteamId || "76561198877011661";

  const [authCode, setAuthCode] = useState("");
  const [knownCode, setKnownCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const cleanAuth = authCode.trim().toUpperCase();
    const cleanKnown = knownCode.trim();

    if (!cleanAuth || !cleanKnown) {
      setStatusMessage({
        type: "error",
        text: "Please provide both your Game Authentication Code and a recent Match Share Code.",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          steamId64: effectiveSteamId,
          steamId: effectiveSteamId,
          authCode: cleanAuth,
          knownCode: cleanKnown,
          shareCode: cleanKnown,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to authenticate match tracking.",
        });
      } else {
        setStatusMessage({
          type: "success",
          text: "CS2 Match History Synced & Authenticated Successfully! Refreshing match data...",
        });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Network error while connecting to sync service.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0b101b]/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="text-amber-400 text-lg">🔑</span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Automated Match Tracking
          </h3>
        </div>
        <a
          href="https://help.steampowered.com/en/wizard/HelpWithGameIssue/?appid=730&issueid=128"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors underline flex items-center gap-1"
        >
          Get Steam Auth Code ↗
        </a>
      </div>

      <p className="text-xs text-slate-400 mb-5 leading-relaxed">
        Link your Valve Game Authentication Code once to allow CS2 BioData to continuously fetch your official matchmaking history automatically.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Game Authentication Code (STEAMIDKEY)
          </label>
          <input
            type="text"
            placeholder="AAAA-AAAA-AAAA"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            className="w-full bg-[#060a12] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            One Recent Match Share Code (KNOWNCODE)
          </label>
          <input
            type="text"
            placeholder="CSGO-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx"
            value={knownCode}
            onChange={(e) => setKnownCode(e.target.value)}
            className="w-full bg-[#060a12] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono transition-all"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span>Authenticating with Valve...</span>
          ) : (
            <>
              <span>🔗</span> Link & Sync Matches
            </>
          )}
        </button>
      </form>

      {statusMessage && (
        <div
          className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-950/40 border-emerald-800/80 text-emerald-400"
              : "bg-red-950/40 border-red-800/80 text-red-400"
          }`}
        >
          <span>{statusMessage.type === "success" ? "✓" : "⚠️"}</span>
          <span>{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
}

export default AuthSyncCard;
