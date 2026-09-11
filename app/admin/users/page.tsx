import React from "react";
import clientPromise from "@/lib/mongodb";
import { Users, CheckCircle2, XCircle, ExternalLink } from "lucide-react";

export const revalidate = 0;

export default async function AdminUsersPage() {
  let users: any[] = [];
  try {
    const client = await clientPromise;
    const db = client.db("cs2biodata");
    users = await db.collection("users").find({}).sort({ lastLogin: -1 }).toArray();
  } catch (e) {
    console.error("Failed to load users for admin:", e);
  }

  return (
    <div className="min-h-screen bg-[#04070a] p-8 text-white font-mono">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between border-b border-cyan-900/40 pb-5">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-cyan-400" />
            <div>
              <h1 className="text-xl font-black uppercase tracking-wider text-cyan-300">
                CS2 Biodata Admin
              </h1>
              <p className="text-xs text-gray-400">Authenticated Players & Token Database</p>
            </div>
          </div>
          <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-3 py-1.5 text-xs font-bold text-cyan-300">
            Total Users: {users.length}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-cyan-900/40 bg-[#080d14]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-cyan-900/40 bg-cyan-950/20 font-bold uppercase tracking-wider text-gray-400">
              <tr>
                <th className="p-4">Player</th>
                <th className="p-4">SteamID64</th>
                <th className="p-4">Game Auth Code</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium text-gray-300">
              {users.map((u: any) => (
                <tr key={u.steamId} className="hover:bg-white/[0.02] transition">
                  <td className="p-4 flex items-center gap-3">
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt=""
                        className="h-8 w-8 rounded-full border border-cyan-500/40"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-cyan-950 flex items-center justify-center">
                        ?
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-white">{u.personaName}</div>
                      <a
                        href={u.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-gray-500 hover:text-cyan-400"
                      >
                        Steam Profile ↗
                      </a>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-cyan-400">{u.steamId}</td>
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
                  <td className="p-4 text-gray-400">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "Never"}
                  </td>
                  <td className="p-4 text-right">
                    <a
                      href={`/player/${u.steamId}`}
                      className="inline-flex items-center gap-1 rounded border border-cyan-500/30 px-2.5 py-1 text-[11px] font-bold text-cyan-400 hover:bg-cyan-500/10"
                    >
                      View Stats <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No authenticated users registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
