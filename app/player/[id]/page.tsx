"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function PlayerDossierPage() {
  const params = useParams();
  const query = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trackMode, setTrackMode] = useState<'faceit' | 'valve'>('faceit');

  useEffect(() => {
    if (!query) return;
    fetch(`/api/player/aggregate?query=${query}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-white flex items-center justify-center font-mono text-sm tracking-widest">
        LOADING SUB-TICK TELEMETRY...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-white selection:bg-cyan-500 selection:text-black font-sans pb-16">
      
      {/* Top Nav matching Homepage Theme */}
      <header className="border-b border-zinc-800/80 bg-[#0b0c14]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-emerald-400 font-black tracking-wider text-sm bg-emerald-950/40 border border-emerald-800/60 px-3.5 py-1.5 rounded-lg shadow-inner">
            CS2 BIODATA
          </Link>
          <nav className="hidden md:flex gap-5 text-xs font-semibold text-zinc-400">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/leaderboards" className="hover:text-white transition">Leaderboards</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-zinc-300 font-mono">
            ID: {query}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8 space-y-6">

        {/* Top Header Card */}
        <div className="bg-[#0f111a] border border-zinc-800/80 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-5 z-10">
            <div className="relative">
              <img 
                src={data?.avatar || "https://avatars.steamstatic.com/f0748a138e1fdc9b05f07646dd42aee91b49ae9e_full.jpg"} 
                alt="Avatar" 
                className="w-20 h-20 rounded-2xl border-2 border-cyan-500/40 object-cover shadow-lg shadow-cyan-950" 
              />
              <span className="absolute -bottom-2 -right-2 bg-cyan-500 text-black text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                Lv.7
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight">{data?.personaName || "DevvvS"}</h1>
                <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  ATLAS SYNCED
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-1">STEAMID64: {data?.steamId64 || "76561198877011661"}</p>
            </div>
          </div>

          {/* Center Toggle Control */}
          <div className="bg-[#0b0c14] border border-zinc-800 p-1.5 rounded-2xl flex items-center gap-2 shadow-inner z-10">
            <button
              onClick={() => setTrackMode('faceit')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                trackMode === 'faceit'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-transparent text-zinc-400 hover:text-white'
              }`}
            >
              FACEIT TRACK (20 MATCHES)
            </button>
            <button
              onClick={() => setTrackMode('valve')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                trackMode === 'valve'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-transparent text-zinc-400 hover:text-white'
              }`}
            >
              STEAM & VALVE TRACK (0 SYNCED)
            </button>
            <div className="bg-[#121420] border border-zinc-800 px-4 py-2 rounded-xl text-xs font-black text-zinc-300 ml-1">
              ELO <span className="text-amber-400 ml-1">1507</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: "WIN RATE", val: "60%", sub: "29W / 19L", col: "text-emerald-400" },
            { label: "MATCHES", val: "92", sub: "Lifetime 5v5", col: "text-white" },
            { label: "K/D RATIO", val: "1.18", sub: "Sub-Tick Avg", col: "text-cyan-400" },
            { label: "ADR", val: "92.01", sub: "Damage / Round", col: "text-white" },
            { label: "HEADSHOT %", val: "53%", sub: "Precision Index", col: "text-indigo-400" },
            { label: "SNIPER RATE", val: "5.0%", sub: "AWP / Scout Kills", col: "text-amber-400" },
          ].map((s, idx) => (
            <div key={idx} className="bg-[#0f111a] border border-zinc-800/80 rounded-2xl p-4 text-center flex flex-col justify-between shadow-xl">
              <span className="text-[10px] font-bold text-zinc-500 tracking-wider block">{s.label}</span>
              <span className={`text-2xl font-black my-2 ${s.col}`}>{s.val}</span>
              <span className="text-[10px] text-zinc-400">{s.sub}</span>
            </div>
          ))}
        </div>

        {/* Analytics Breakdown Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Recent Form */}
          <div className="bg-[#0f111a] border border-zinc-800/80 rounded-2xl p-5 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Recent Form - Last 20</span>
              <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded font-mono">60% W</span>
            </div>
            <div className="grid grid-cols-10 gap-1.5 mb-6">
              {['W','W','L','L','W','W','W','L','W','W','L','W','W','W','L','W','W','L','W','W'].map((res, i) => (
                <div 
                  key={i} 
                  className={`h-8 rounded flex items-center justify-center text-[10px] font-black ${
                    res === 'W' ? 'bg-emerald-600/90 text-white' : 'bg-rose-600/90 text-white'
                  }`}
                >
                  {res}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-800/60 font-mono">
              <span>CURRENT STREAK: <strong className="text-emerald-400">2W</strong></span>
              <span>HIGHEST STREAK: <strong className="text-cyan-400">14W</strong></span>
            </div>
          </div>

          {/* Clutch & Entry Telemetry */}
          <div className="bg-[#0f111a] border border-zinc-800/80 rounded-2xl p-5 shadow-xl">
            <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase block mb-4">Clutch & Entry Telemetry</span>
            <div className="grid grid-cols-2 gap-4 text-center my-2">
              <div className="bg-[#0b0c14] border border-zinc-800 p-3 rounded-xl">
                <span className="text-xl font-black text-cyan-400">47%</span>
                <span className="text-[10px] text-zinc-400 block mt-1 uppercase font-semibold">1V1 Win Rate</span>
              </div>
              <div className="bg-[#0b0c14] border border-zinc-800 p-3 rounded-xl">
                <span className="text-xl font-black text-indigo-400">28%</span>
                <span className="text-[10px] text-zinc-400 block mt-1 uppercase font-semibold">1V2 Win Rate</span>
              </div>
            </div>
            <div className="space-y-2 mt-4 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Entry Attempt Rate</span>
                <span className="text-zinc-200 font-mono font-bold">25%</span>
              </div>
              <div className="flex justify-between">
                <span>Entry Success Rate</span>
                <span className="text-emerald-400 font-mono font-bold">54%</span>
              </div>
            </div>
          </div>

          {/* Utility Mastery */}
          <div className="bg-[#0f111a] border border-zinc-800/80 rounded-2xl p-5 shadow-xl">
            <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase block mb-4">Utility Mastery</span>
            <div className="grid grid-cols-2 gap-4 text-center my-2">
              <div className="bg-[#0b0c14] border border-zinc-800 p-3 rounded-xl">
                <span className="text-xl font-black text-amber-400">36%</span>
                <span className="text-[10px] text-zinc-400 block mt-1 uppercase font-semibold">Utility Success</span>
              </div>
              <div className="bg-[#0b0c14] border border-zinc-800 p-3 rounded-xl">
                <span className="text-xl font-black text-emerald-400">50%</span>
                <span className="text-[10px] text-zinc-400 block mt-1 uppercase font-semibold">Flash Success</span>
              </div>
            </div>
            <div className="space-y-2 mt-4 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Enemies Flashed / Round</span>
                <span className="text-zinc-200 font-mono font-bold">2.43 / rd</span>
              </div>
              <div className="flex justify-between">
                <span>Utility Dmg / Round</span>
                <span className="text-amber-400 font-mono font-bold">6.78</span>
              </div>
            </div>
          </div>

        </div>

        {/* Match History Table */}
        <div className="bg-[#0f111a] border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
              {trackMode === 'faceit' ? 'FACEIT Match History (20 Matches)' : 'Official Valve Game Coordinator Matches'}
            </h3>
            <span className="text-xs text-zinc-500 font-mono">Official FACEIT 5v5 Queue Feed</span>
          </div>

          <div className="space-y-3">
            {[
              { map: "Mirage", result: "WIN", score: "13 : 11", time: "Sep 6, 11:57 PM", team1: "team_SanliZ", team2: "team_gLaddeee", kd: "+6" },
              { map: "Inferno", result: "WIN", score: "13 : 7", time: "Sep 6, 11:16 PM", team1: "team_Premier_GOD", team2: "team_hayato", kd: "+8" },
              { map: "Nuke", result: "WIN", score: "13 : 10", time: "Sep 5, 09:50 PM", team1: "team_WinterSSS", team2: "team_Pi_2", kd: "+4" },
              { map: "Anubis", result: "LOSS", score: "6 : 13", time: "Sep 5, 08:35 PM", team1: "team_zRonnie", team2: "team_gLaddeee", kd: "-3" },
              { map: "Ancient", result: "WIN", score: "13 : 7", time: "Sep 3, 08:21 PM", team1: "team_gLaddeee", team2: "team_Lizer_J", kd: "+7" },
              { map: "Dust II", result: "WIN", score: "13 : 11", time: "Sep 2, 11:59 PM", team1: "team_gLaddeee", team2: "team_Paris-", kd: "+5" },
            ].map((m, idx) => (
              <div key={idx} className="bg-[#0b0c14] border border-zinc-800/80 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-zinc-700 transition">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wider ${
                    m.result === 'WIN' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {m.result}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{m.map}</span>
                      <span className="text-xs text-zinc-500">• {m.time}</span>
                    </div>
                    <span className="text-xs text-zinc-400 block mt-0.5">{m.team1} vs {m.team2}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <span className="text-base font-black text-white font-mono">{m.score}</span>
                    <span className="text-[10px] text-zinc-500 block">K/D Diff: {m.kd}</span>
                  </div>
                  <span className="text-xs bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-zinc-300 font-semibold">
                    Room ID
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
