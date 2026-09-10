"use client";

import React, { useState } from "react";
import { RefreshCw, Key, Hash, ShieldCheck, CheckCircle2 } from "lucide-react";

interface ValveSyncModalProps {
  steamId: string;
  onSyncComplete?: () => void;
}

export function ValveSyncModal({ steamId, onSyncComplete }: ValveSyncModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [shareCode, setShareCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResultMsg(null);

    try {
      const res = await fetch("/api/valve/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          steamId,
          authCode: authCode.trim(),
          shareCode: shareCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");

      setResultMsg(`Successfully imported ${data.totalSynced} matches into MongoDB!`);
      if (onSyncComplete) onSyncComplete();
      setTimeout(() => {
        setIsOpen(false);
        setResultMsg(null);
      }, 2500);
    } catch (err: any) {
      setResultMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-[#0070f3]/40 bg-[#0070f3]/20 px-3 py-2 text-xs font-bold text-[#60a5fa] transition-all hover:bg-[#0070f3]/30 active:scale-95"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        <span>Sync Valve History</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#12141a] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
                <ShieldCheck className="h-4 w-4 text-sky-400" />
                Sync Official CS2 Matches
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-zinc-400">
              Enter your CS2 <strong>Match Authentication Code</strong> and one <strong>Match Share Code</strong> to pull your official Valve match records permanently into the database.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  <Key className="h-3 w-3 text-sky-400" />
                  Game Authentication Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="AAAA-AAAAA-AAAA"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-white placeholder-zinc-600 focus:border-sky-500 focus:outline-none"
                />
                <a
                  href="https://help.steampowered.com/en/wizard/HelpWithGameIssue/?appid=730&issueid=128"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-[10px] text-sky-400 hover:underline"
                >
                  Get your Authentication Code on Steam →
                </a>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  <Hash className="h-3 w-3 text-emerald-400" />
                  Recent Match Share Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="CSGO-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx"
                  value={shareCode}
                  onChange={(e) => setShareCode(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
                />
                <span className="mt-1 block text-[10px] text-zinc-500">
                  In CS2: Watch Matches → Your Matches → Copy Share Code.
                </span>
              </div>

              {resultMsg && (
                <div className={`flex items-center gap-2 rounded-lg p-3 text-xs font-semibold ${
                  resultMsg.startsWith("Error") ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}>
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{resultMsg}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-sky-600 disabled:opacity-50"
                >
                  {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{loading ? "Traversing Matches..." : "Start Import"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
