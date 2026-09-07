export interface PlayerSummary {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate?: number;
  communityvisibilitystate?: number;
  profilestate?: number;
  lastlogoff?: number;
  commentpermission?: number;
  realname?: string;
  primaryclanid?: string;
  timecreated?: number;
  gameid?: string;
  gameserverip?: string;
  gameextrainfo?: string;
  loccountrycode?: string;
  locstatecode?: string;
  loccityid?: number;
}

export interface ScoreboardPlayer {
  steamId: string;
  name: string;
  kills: number;
  assists: number;
  deaths: number;
  mvps: number;
  score: number;
  hsRate?: number;
  adr?: number;
}

export interface ValveMatch {
  matchId: string;
  map: string;
  mode: string;
  duration: number;
  timestamp: number;
  scoreTeamA: number;
  scoreTeamB: number;
  winnerTeam: 'A' | 'B' | 'TIE';
  players: ScoreboardPlayer[];
}

export interface PlayerStats {
  steamId: string;
  totalPlaytimeHours: number;
  kdRatio: number;
  totalKills: number;
  headshotPercentage: number;
  totalMvps: number;
}
