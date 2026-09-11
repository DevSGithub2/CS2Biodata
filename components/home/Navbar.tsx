"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Trophy, Search, CheckCircle2 } from "lucide-react";
import { TacticalLogo } from "@/components/ui/TacticalLogo";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/player/${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="relative z-50 w-full border-b border-cyan-900/40 bg-[#04070a]/90 backdrop-blur-xl">
      <div className="max-w-[1700px] mx-auto px-6 sm:px-12 h-20 flex items-center justify-between gap-6 font-mono">
        {/* Brand Group */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="p-1.5 bg-cyan-950/40 border border-cyan-500/50 rounded transition-all duration-300 group-hover:border-cyan-400 group-hover:shadow-[0_0_16px_rgba(0,255,204,0.4)]">
              <TacticalLogo className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-widest text-white group-hover:text-cyan-300 transition-colors">
                  CS2<span className="text-cyan-400">BIODATA</span>
                </span>
                <span className="px-1.5 py-0.2 text-[9px] bg-cyan-950/80 text-cyan-300 border border-cyan-600/40 rounded tracking-tighter">
                  v2.4
                </span>
              </div>
              <span className="text-[9px] tracking-wider text-gray-500 uppercase">
                Combat Telemetry System
              </span>
            </div>
          </Link>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/"
              className={`relative px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
                pathname === "/"
                  ? "text-cyan-300 bg-cyan-950/30 border-b-2 border-cyan-400 shadow-[inset_0_-8px_12px_-8px_rgba(0,255,204,0.3)]"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]"
              }`}
            >
              Home
            </Link>
            <Link
              href="/leaderboards"
              className={`relative px-4 py-2 text-xs font-semibold tracking-wider uppercase flex items-center gap-2 transition-all duration-200 ${
                pathname === "/leaderboards"
                  ? "text-cyan-300 bg-cyan-950/30 border-b-2 border-cyan-400 shadow-[inset_0_-8px_12px_-8px_rgba(0,255,204,0.3)]"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]"
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Leaderboards</span>
            </Link>
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative hidden lg:flex items-center">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search SteamID64, URL, Persona..."
                className="w-72 bg-[#080d14] border border-cyan-950 text-gray-200 text-xs pl-9 pr-4 py-2 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono placeholder:text-gray-600"
              />
            </div>
          </form>

          {/* Dynamic Steam Sign In / User Profile */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/player/${user.steamId}`}
                className="flex items-center gap-2.5 rounded-lg border border-cyan-500/30 bg-[#080d14] px-3 py-1.5 transition hover:border-cyan-400 hover:bg-cyan-950/30"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.personaName}
                    className="h-6 w-6 rounded-full border border-cyan-500/50 object-cover"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-cyan-900/50 text-[10px] flex items-center justify-center font-bold">
                    {user.personaName?.charAt(0) || "U"}
                  </div>
                )}
                <span className="text-xs font-bold text-white max-w-[100px] truncate">
                  {user.personaName}
                </span>
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
              </Link>
              <form action="/api/auth/signout" method="POST" className="inline m-0 p-0">
                <button
                  type="submit"
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-950/60 border border-red-800/80 text-red-300 hover:bg-red-900 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <a
              href="/api/auth/steam/login"
              className="flex items-center gap-2 rounded-lg bg-[#1a243d] border border-sky-500/30 px-3.5 py-1.5 text-xs font-bold text-sky-400 hover:bg-sky-500/20 hover:border-sky-400 transition cursor-pointer"
            >
              <span className="tracking-widest">SIGN IN</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
