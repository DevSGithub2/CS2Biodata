export interface SteamIdentifiers {
  steamID: string;
  steamID3: string;
  steamID64: string;
  accountId: string;
  customUrl: string;
  profileUrl: string;
}

export interface SteamBans {
  vacBanned: boolean;
  communityBanned: boolean;
  numberOfVACBans: number;
  daysSinceLastBan: number;
  economyBan: string;
}

export interface WeaponTelemetry {
  name: string;
  kills: number;
  shots: number;
  hits: number;
  accuracy: string;
}

export interface MapRecord {
  mapName: string;
  wins: number;
  rounds: number;
}

export interface SteamDossier {
  identifiers: SteamIdentifiers;
  profile: {
    personaName: string;
    profileUrl: string;
    avatar: string;
    visibility: number;
  };
  bans: SteamBans;
  combat: {
    kills: number;
    deaths: number;
    kdRatio: string;
    damageDone: number;
    moneyEarned: number;
    wins: number;
    roundsPlayed: number;
    mvps: number;
    timePlayedHours: number;
    headshots: number;
    headshotPercentage: string;
    shotsFired: number;
    shotsHit: number;
    overallAccuracy: string;
    bombsPlanted: number;
    bombsDefused: number;
    hostagesRescued: number;
    pistolRoundWins: number;
  };
  weapons: Record<string, WeaponTelemetry>;
  maps: MapRecord[];
}

export interface FaceitMatchItem {
  matchId: string;
  competitionName: string;
  region: string;
  startedAt: number;
  finishedAt: number;
  teams: {
    faction1: { nickname: string; players: any[] };
    faction2: { nickname: string; players: any[] };
  };
  results: {
    winner: string;
    score: { faction1: number; faction2: number };
  };
  faceitUrl: string;
}

export interface FaceitMapSegment {
  mapName: string;
  matches: number;
  wins: number;
  winRate: string;
  kdRatio: string;
  headshotPct: string;
  kills: number;
  mvps: number;
}

export interface FaceitDossier {
  registered: boolean;
  identity?: {
    playerId: string;
    nickname: string;
    avatar: string;
    country: string;
    skillLevel: number;
    elo: number;
    region: string;
  };
  overview?: {
    matches: number;
    wins: number;
    winRatePct: string;
    kdRatio: string;
    adr: string;
    headshotPct: string;
    totalDamage: number;
    currentWinStreak: number;
    longestWinStreak: number;
    recentResults: string[];
  };
  entry?: {
    entryRate: string;
    totalEntryCount: number;
    entrySuccessRate: string;
    totalEntryWins: number;
    sniperKillRate: string;
    totalSniperKills: number;
    sniperKillRatePerRound: string;
  };
  clutch?: {
    clutch1v1: { winRate: string; wins: number; count: number };
    clutch1v2: { winRate: string; wins: number; count: number };
    totalKillsExtended: number;
    totalRoundsExtended: number;
  };
  utility?: {
    utilitySuccessRate: string;
    totalUtilitySuccesses: number;
    totalUtilityCount: number;
    utilityUsagePerRound: string;
    utilityDamageTotal: number;
    utilityDamagePerRound: string;
    flashSuccessRate: string;
    totalFlashSuccesses: number;
    totalFlashCount: number;
    enemiesFlashedTotal: number;
    enemiesFlashedPerRound: string;
  };
  maps?: FaceitMapSegment[];
  recentMatches?: FaceitMatchItem[];
}

export interface MasterDossierResponse {
  success: boolean;
  data: {
    steamId: string;
    steam: SteamDossier;
    faceit: FaceitDossier;
    valveHistory: any[];
    updatedAt: string;
  };
}
