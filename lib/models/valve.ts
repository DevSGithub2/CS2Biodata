import mongoose, { Schema, Document, Model } from "mongoose";

export interface IValveToken extends Document {
  steamId: string;
  authCode: string;
  knownCode: string;
  lastSyncedAt: Date;
}

const ValveTokenSchema = new Schema<IValveToken>({
  steamId: { type: String, required: true, unique: true },
  authCode: { type: String, required: true },
  knownCode: { type: String, required: true },
  lastSyncedAt: { type: Date, default: Date.now },
});

export interface IValvePlayerMatchStat {
  steamId: string;
  nickname?: string;
  avatar?: string;
  team: "CT" | "TERRORIST";
  kills: number;
  deaths: number;
  assists: number;
  mvps: number;
  score: number;
  adr?: number;
  hsp?: number;
  rank?: number;
  premierRating?: number;
}

export interface IValveMatch extends Document {
  matchId: string;
  shareCode: string;
  map: string;
  mode: "premier" | "competitive" | "wingman";
  matchTime: Date;
  scoreCT: number;
  scoreT: number;
  winnerTeam: "CT" | "TERRORIST" | "TIE";
  players: IValvePlayerMatchStat[];
  playerSteamIds: string[];
  demoUrl?: string;
  createdAt: Date;
}

const ValveMatchSchema = new Schema<IValveMatch>({
  matchId: { type: String, required: true, unique: true },
  shareCode: { type: String, required: true, unique: true },
  map: { type: String, required: true },
  mode: { type: String, default: "premier" },
  matchTime: { type: Date, default: Date.now },
  scoreCT: { type: Number, default: 0 },
  scoreT: { type: Number, default: 0 },
  winnerTeam: { type: String, default: "TIE" },
  players: { type: [Object], default: [] },
  playerSteamIds: { type: [String], index: true },
  demoUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const ValveToken: Model<IValveToken> =
  (mongoose.models.ValveToken as Model<IValveToken>) ||
  mongoose.model<IValveToken>("ValveToken", ValveTokenSchema);

export const ValveMatch: Model<IValveMatch> =
  (mongoose.models.ValveMatch as Model<IValveMatch>) ||
  mongoose.model<IValveMatch>("ValveMatch", ValveMatchSchema);
