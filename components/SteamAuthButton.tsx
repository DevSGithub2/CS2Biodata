"use client";

import React, { useState } from "react";
import { signIn, signUp, signOut, useSession } from "@/lib/auth-client";

export interface SteamAuthButtonProps {
  onSelectUser?: (steamId: string) => void;
}

export default function SteamAuthButton({ onSelectUser }: SteamAuthButtonProps) {
  const { data: session, isPending } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSteamLogin = () => {
    window.location.href = "/api/auth/steam/login";
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
        });
        if (res.error) {
          setError(res.error.message || "Failed to create account");
        } else {
          setIsOpen(false);
        }
      } else {
        const res = await signIn.email({
          email,
          password,
        });
        if (res.error) {
          setError(res.error.message || "Invalid email or password");
        } else {
          setIsOpen(false);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (isPending) {
    return (
      <div className="h-9 w-32 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
    );
  }

  // Logged In State -> Profile chip with Avatar & Green Tick
  if (session?.user) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800 shadow-sm">
        <div 
          onClick={() => {
            if (onSelectUser && session.user.id) {
              onSelectUser(session.user.id);
            }
          }}
          className="cursor-pointer flex items-center gap-2.5"
        >
          <div className="relative w-6 h-6 rounded-full overflow-hidden border border-emerald-500/40 bg-zinc-800 flex items-center justify-center text-[11px] font-bold text-emerald-400">
            {session.user.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              (session.user.name || session.user.email || "U").charAt(0).toUpperCase()
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-zinc-200">
              {session.user.name || session.user.email?.split("@")[0]}
            </span>
            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black border border-emerald-500/30">
              ✓
            </span>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          title="Sign Out"
          className="ml-1 text-zinc-500 hover:text-rose-400 text-xs transition"
        >
          ✕
        </button>
      </div>
    );
  }

  // Logged Out State -> Multi-Auth Trigger
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-black text-xs tracking-wider uppercase transition shadow-lg shadow-emerald-500/10 active:scale-95"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0a12 12 0 0 0-12 12c0 5.6 3.8 10.3 9 11.6l1.3-4.7a4.2 4.2 0 0 1-1.3-.9l-2.4 1a9.2 9.2 0 0 1-1.6-4.6l3.5-1.4a4.1 4.1 0 0 1 2.3 1.1l3.3-1.4A4.3 4.3 0 1 1 18.7 8a4.3 4.3 0 0 1-3.6 4.2l-3.3 1.4a4.2 4.2 0 0 1-3.3-1.1L5 13.9A9.3 9.3 0 0 1 4.8 12c0-4 3.2-7.2 7.2-7.2 4 0 7.2 3.2 7.2 7.2 0 1.2-.3 2.3-.8 3.3l1.8 1.8A11.9 11.9 0 0 0 24 12C24 5.4 18.6 0 12 0z"/>
        </svg>
        Sign In
      </button>

      {/* Multi-Sign-In Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#0b101b] border border-zinc-800 p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 text-xs px-2 py-1"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center">
                {error}
              </div>
            )}

            {/* Steam 1-Click Button */}
            <button
              onClick={handleSteamLogin}
              type="button"
              className="w-full py-2.5 px-4 bg-[#171a21] hover:bg-[#2a475e] text-zinc-100 font-bold text-xs rounded-xl border border-zinc-700/60 flex items-center justify-center gap-2.5 transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0a12 12 0 0 0-12 12c0 5.6 3.8 10.3 9 11.6l1.3-4.7a4.2 4.2 0 0 1-1.3-.9l-2.4 1a9.2 9.2 0 0 1-1.6-4.6l3.5-1.4a4.1 4.1 0 0 1 2.3 1.1l3.3-1.4A4.3 4.3 0 1 1 18.7 8a4.3 4.3 0 0 1-3.6 4.2l-3.3 1.4a4.2 4.2 0 0 1-3.3-1.1L5 13.9A9.3 9.3 0 0 1 4.8 12c0-4 3.2-7.2 7.2-7.2 4 0 7.2 3.2 7.2 7.2 0 1.2-.3 2.3-.8 3.3l1.8 1.8A11.9 11.9 0 0 0 24 12C24 5.4 18.6 0 12 0z"/>
              </svg>
              Continue with Steam
            </button>

            <div className="flex items-center gap-3 my-3">
              <div className="h-px flex-1 bg-zinc-800" />
              <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">or email</span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {isSignUp && (
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="s1mple"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="pro@cs2pulse.gg"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition disabled:opacity-50"
              >
                {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-zinc-800/60">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-[11px] text-zinc-400 hover:text-emerald-400 transition"
              >
                {isSignUp ? "Already registered? Sign in" : "Need an account? Sign up with email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
