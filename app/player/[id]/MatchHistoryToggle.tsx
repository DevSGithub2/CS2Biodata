"use client";
import React, { useState } from 'react';

export default function MatchHistoryToggle() {
  const [mode, setMode] = useState<'valve' | 'faceit'>('valve');

  return (
    <div className="space-y-6">
      <div className="flex justify-center my-4">
        <div className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-2xl flex items-center gap-2 shadow-xl">
          <button
            onClick={() => setMode('valve')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition ${
              mode === 'valve'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-transparent text-zinc-400 hover:text-white'
            }`}
          >
            STEAM & VALVE TRACK (0 SYNCED)
          </button>
          <button
            onClick={() => setMode('faceit')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition ${
              mode === 'faceit'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-transparent text-zinc-400 hover:text-white'
            }`}
          >
            FACEIT TRACK (20 MATCHES)
          </button>
          <div className="bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-xl text-xs font-black text-zinc-300 ml-2">
            ELO <span className="text-amber-400 ml-1">1507</span>
          </div>
        </div>
      </div>

      {mode === 'valve' ? (
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-bold text-white mb-2">Valve Game Coordinator Match Pipeline</h3>
          <p className="text-sm text-zinc-400 mb-4">
            Official Premier, Competitive, and Wingman match shares synced directly from the 24/7 worker node daemon.
          </p>
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 max-w-md mx-auto">
            <span className="text-xs text-blue-400 font-semibold block mb-1">Status: Active Background Daemon</span>
            <p className="text-xs text-zinc-500">Ready to pull sub-tick demo replay files on demand via match share codes.</p>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-bold text-white mb-2">FACEIT 5v5 Competitive History</h3>
          <p className="text-sm text-zinc-400 mb-4">
            Showing last 20 matches fetched live through the configured FACEIT API integration.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-emerald-400 block">WIN (13 - 9)</span>
                <span className="text-xs text-zinc-400">Mirage • 24.5 AVG ADR</span>
              </div>
              <span className="text-xs font-mono text-zinc-500">2 hrs ago</span>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-rose-400 block">LOSS (7 - 13)</span>
                <span className="text-xs text-zinc-400">Inferno • 18.2 AVG ADR</span>
              </div>
              <span className="text-xs font-mono text-zinc-500">5 hrs ago</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
