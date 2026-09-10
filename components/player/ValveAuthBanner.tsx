"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Check, ArrowRight, ShieldAlert } from "lucide-react";

export function ValveAuthBanner({ currentProfileSteamId }: { currentProfileSteamId: string }) {
  const [session, setSession] = useState<{ authenticated: boolean; user?: any } | null>(null);
  const [authCode, setAuthCode] = useState("");
  const [shareCode, setShareCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [promptSteamLogin, setPromptSteamLogin] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => setSession(data))
      .catch(() => setSession({ authenticated: false }));
  }, []);

  async function handleLinkCode(e: React.FormEvent) {
    e.preventDefault();
    if (!authCode) return;

    if (!session?.authenticated) {
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authCode, shareCode }),
      });
      setPromptSteamLogin(true);
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/valve/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          steamId: session.user?.steamId || currentProfileSteamId,
          authCode,
          shareCode: shareCode || "n/a",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to link code");

      setStatusMsg("Code linked! Matches will archive automatically.");
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-r from-sky-950/40 via-[#12141a] to-zinc-950 p-6 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-400">
            <Sparkles className="h-3 w-3" /> Automatic Valve Match Synchronization
          </div>
          <h3 className="text-lg font-black tracking-wide text-white">
            Link Official CS2 Match Telemetry
          </h3>
          <p className="text-xs leading-relaxed text-zinc-400">
            Paste your <strong>Game Authentication Code</strong> below. Matches will be stored permanently in MongoDB.
            <a
              href="https://help.steampowered.com/en/wizard/HelpWithGameIssue/?appid=730&issueid=128"
              target="_blank"
              rel="noreferrer"
              className="ml-1 text-sky-400 underline hover:text-sky-300"
            >
              Get code here →
            </a>
          </p>
        </div>

        <div className="w-full lg:max-w-md">
          {promptSteamLogin ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
              <ShieldAlert className="mx-auto h-6 w-6 text-amber-400 mb-2" />
              <p className="text-xs font-bold text-white mb-3">
                Sign in with Steam to link this Game Auth Code to your profile
              </p>
              <a
                href="/api/auth/steam/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg transition hover:bg-sky-600"
              >
                Sign in via Steam to Complete <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : (
            <form onSubmit={handleLinkCode} className="space-y-2.5">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Game Auth Code (e.g. AAAA-AAAAA-AAAA)"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 font-mono text-xs text-white placeholder-zinc-500 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Recent Match Share Code (Optional)"
                  value={shareCode}
                  onChange={(e) => setShareCode(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 font-mono text-xs text-white placeholder-zinc-500 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {statusMsg && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <Check className="h-3.5 w-3.5" /> {statusMsg}
                  </span>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-auto rounded-lg bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-sky-600 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Linking..." : "Save & Sync Matches"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
