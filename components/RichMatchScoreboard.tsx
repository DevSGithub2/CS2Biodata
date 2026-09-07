import React from "react";

export interface ScoreboardPlayer {
  steamId64: string;
  name?: string;
  avatar?: string;
  kills: number;
  deaths: number;
  assists: number;
  headshots?: number;
  hsPercent?: number;
  adr?: number;
  mvps?: number;
  score?: number;
  isUser?: boolean;
}

export interface RichMatchScoreboardProps {
  scoreboard?: ScoreboardPlayer[];
  players?: ScoreboardPlayer[];
  activeSteamId?: string;
  steamId64?: string;
  totalRounds?: number;
  matchResult?: any;
  score?: any;
  map?: string;
}

export default function RichMatchScoreboard({
  scoreboard,
  players,
  activeSteamId,
  steamId64,
  matchResult,
  score,
  totalRounds = 24,
}: RichMatchScoreboardProps) {
  const currentSteamId = activeSteamId || steamId64;
  const playerList = (scoreboard && scoreboard.length > 0 ? scoreboard : players) || [];

  if (playerList.length === 0) {
    return (
      <div className="p-4 bg-zinc-950/70 rounded-lg border border-zinc-800 text-center text-xs text-zinc-500">
        Replay telemetry indexing in progress. Full 10-player stats will populate shortly.
      </div>
    );
  }

  const team1 = playerList.slice(0, Math.ceil(playerList.length / 2));
  const team2 = playerList.slice(Math.ceil(playerList.length / 2));

  const renderTeamTable = (team: ScoreboardPlayer[], teamName: string, accentColor: string) => (
    <div className="flex-1 min-w-[300px]">
      <div className="flex items-center justify-between pb-1 mb-2 border-b border-zinc-800">
        <span className={`text-xs font-bold uppercase tracking-wider ${accentColor}`}>
          {teamName}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-zinc-500 border-b border-zinc-800/60 pb-1">
              <th className="py-1 font-medium">Player</th>
              <th className="py-1 text-center font-medium">K</th>
              <th className="py-1 text-center font-medium">A</th>
              <th className="py-1 text-center font-medium">D</th>
              <th className="py-1 text-center font-medium">ADR</th>
              <th className="py-1 text-center font-medium">HS%</th>
              <th className="py-1 text-center font-medium">★</th>
              <th className="py-1 text-right font-medium">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/60">
            {team.map((p, idx) => {
              const isCurrent = (p.steamId64 && p.steamId64 === currentSteamId) || p.isUser;
              const hsRate = p.hsPercent ?? (p.kills > 0 ? Math.round(((p.headshots || 0) / p.kills) * 100) : 0);

              return (
                <tr
                  key={p.steamId64 || idx}
                  className={`transition-colors ${
                    isCurrent
                      ? "bg-orange-500/10 text-orange-300 font-semibold border-l-2 border-orange-500"
                      : "text-zinc-300 hover:bg-zinc-800/30"
                  }`}
                >
                  <td className="py-1.5 px-1 truncate max-w-[120px]">
                    {p.name || `Player_${p.steamId64?.slice(-4) || idx + 1}`}
                  </td>
                  <td className="py-1.5 text-center font-bold text-zinc-200">{p.kills}</td>
                  <td className="py-1.5 text-center text-zinc-400">{p.assists}</td>
                  <td className="py-1.5 text-center text-zinc-400">{p.deaths}</td>
                  <td className="py-1.5 text-center text-zinc-300">{p.adr ?? "-"}</td>
                  <td className="py-1.5 text-center text-zinc-400">{hsRate}%</td>
                  <td className="py-1.5 text-center text-amber-400">{p.mvps || 0}</td>
                  <td className="py-1.5 text-right font-mono text-zinc-300">{p.score || p.kills * 2 + p.assists}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="mt-3 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/80 space-y-4 shadow-inner">
      {score && (
        <div className="flex items-center justify-between px-1 pb-2 border-b border-zinc-800/60">
          <span className="text-xs font-mono font-bold text-zinc-300">Final Score: {score}</span>
          {matchResult && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
              {matchResult}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-6">
        {renderTeamTable(team1, "Team 1", "text-sky-400")}
        {renderTeamTable(team2, "Team 2", "text-amber-500")}
      </div>
    </div>
  );
}
