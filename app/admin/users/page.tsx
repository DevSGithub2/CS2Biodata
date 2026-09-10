import React from "react";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models/user";
import { Users, Shield, CheckCircle2, XCircle, ExternalLink } from "lucide-react";

export const revalidate = 0; // Fresh load on every request

export default async function AdminUsersPage() {
  await dbConnect();
  const users = await User.find({}).sort({ lastLogin: -1 }).lean();

  return (
    <div className="min-h-screen bg-[#0d0e12] p-8 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-sky-400" />
            <div>
              <h1 className="text-xl font-black uppercase tracking-wider">CS2 Biodata Admin</h1>
              <p className="text-xs text-zinc-400">Authenticated Players & Token Overview</p>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono font-bold text-zinc-300">
            Total Users: {users.length}
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#12141a]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/5 font-bold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="p-4">Player</th>
                <th className="p-4">SteamID64</th>
                <th className="p-4">Game Auth Code</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium text-zinc-300">
              {users.map((u: any) => (
                <tr key={u.steamId} className="hover:bg-white/[0.02] transition">
                  <td className="p-4 flex items-center gap-3">
                    {u.avatar ? (
                      <img src={u.avatar} alt="" className="h-8 w-8 rounded-full border border-white/10" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">?</div>
                    )}
                    <div>
                      <div className="font-bold text-white">{u.personaName}</div>
                      <a
                        href={u.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-zinc-500 hover:text-sky-400"
                      >
                        Steam Profile ↗
                      </a>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-zinc-400">{u.steamId}</td>
                  <td className="p-4">
                    {u.hasAuthCode ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-zinc-500/10 px-2 py-0.5 text-[11px] font-bold text-zinc-400">
                        <XCircle className="h-3 w-3" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-zinc-400">
                    {new Date(u.lastLogin).toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <a
                      href={`/player/${u.steamId}`}
                      className="inline-flex items-center gap-1 rounded border border-white/10 px-2.5 py-1 text-[11px] font-bold text-sky-400 hover:bg-sky-500/10"
                    >
                      View Stats <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
