import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import * as Sentry from "@sentry/nextjs";
import { parseAndConvertSteamID } from "@/lib/steamid";
import { gcBot } from "@/lib/gc-bot";
import {
  SteamBans,
  WeaponTelemetry,
  MapRecord,
  SteamDossier,
  FaceitDossier,
  FaceitMapSegment,
} from "@/types/dossier";

export const dynamic = "force-dynamic";

const STEAM_API_KEY = process.env.STEAM_API_KEY;
const FACEIT_API_KEY = process.env.FACEIT_API_KEY;

async function resolveSteamId(rawQuery: string): Promise<{ steamId: string | null; customUrl: string | null }> {
  const clean = rawQuery.trim().replace(/^https?:\/\/(www\.)?steamcommunity\.com\/(id|profiles)\//, "").replace(/\/$/, "");

  if (/^7656119[0-9]{10}$/.test(clean)) {
    return { steamId: clean, customUrl: null };
  }

  try {
    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_API_KEY}&vanityurl=${encodeURIComponent(clean)}`
    );
    const data = await res.json();
    if (data.response?.success === 1) {
      return { steamId: data.response.steamid, customUrl: clean };
    }
  } catch {
    return { steamId: null, customUrl: null };
  }
  return { steamId: null, customUrl: null };
}

// Helper: Query GC Profile with 2.5s fallback so it never blocks the request if the bot is busy
async function queryGCProfile(steamId64: string): Promise<any | null> {
  if (!gcBot.isReady) return null;
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(null), 2500);
    try {
      gcBot.csgo.requestPlayersProfile(steamId64, (profile: any) => {
        clearTimeout(timeout);
        resolve(profile);
      });
    } catch {
      clearTimeout(timeout);
      resolve(null);
    }
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  try {
    const { steamId, customUrl } = await resolveSteamId(query);
    if (!steamId) {
      return NextResponse.json({ error: "Unable to resolve target Steam identifier." }, { status: 404 });
    }

    const converted = parseAndConvertSteamID(steamId);

    // 1. Parallel Ingestion: Web API, Bans, Stats, FACEIT, and Game Coordinator
    const [summaryRes, bansRes, statsRes, faceitRes, gcProfile] = await Promise.all([
      fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`),
      fetch(`https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${STEAM_API_KEY}&steamids=${steamId}`),
      fetch(`https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=${STEAM_API_KEY}&steamid=${steamId}`).catch(() => null),
      fetch(`https://open.faceit.com/data/v4/players?game=cs2&game_player_id=${steamId}`, {
        headers: { Authorization: `Bearer ${FACEIT_API_KEY}` },
      }).catch(() => null),
      queryGCProfile(steamId),
    ]);

    const summaryData = await summaryRes.json();
    const bansData = await bansRes.json();
    const statsData = statsRes && statsRes.ok ? await statsRes.json() : null;

    const profileRaw = summaryData?.response?.players?.[0];
    if (!profileRaw) {
      return NextResponse.json({ error: "Steam profile not accessible or does not exist." }, { status: 404 });
    }

    const identifiers = {
      steamID: converted.steamID,
      steamID3: converted.steamID3,
      steamID64: converted.steamID64,
      accountId: converted.accountID.toString(),
      customUrl: customUrl || profileRaw.profileurl.split("/id/")[1]?.replace("/", "") || "None",
      profileUrl: profileRaw.profileurl,
    };

    // 2. Parse Steam Bans
    const rawBans = bansData?.players?.[0];
    const bans: SteamBans = {
      vacBanned: rawBans?.VACBanned ?? false,
      communityBanned: rawBans?.CommunityBanned ?? false,
      numberOfVACBans: rawBans?.NumberOfVACBans ?? 0,
      daysSinceLastBan: rawBans?.DaysSinceLastBan ?? 0,
      economyBan: rawBans?.EconomyBan ?? "none",
    };

    // 3. Parse Steam Stats Map
    const statArr: { name: string; value: number }[] = statsData?.playerstats?.stats || [];
    const statMap = new Map<string, number>();
    statArr.forEach((s) => statMap.set(s.name, s.value));

    const getVal = (k: string) => statMap.get(k) || 0;

    const kills = getVal("total_kills");
    const deaths = getVal("total_deaths");
    const shotsFired = getVal("total_shots_fired");
    const shotsHit = getVal("total_shots_hit");
    const headshots = getVal("total_kills_headshot");

    const buildWeapon = (key: string, name: string): WeaponTelemetry => {
      const wKills = getVal(`total_kills_${key}`);
      const wShots = getVal(`total_shots_${key}`);
      const wHits = getVal(`total_hits_${key}`);
      return {
        name,
        kills: wKills,
        shots: wShots,
        hits: wHits,
        accuracy: wShots > 0 ? `${Math.round((wHits / wShots) * 100)}%` : "0%",
      };
    };

    const weapons: Record<string, WeaponTelemetry> = {
      ak47: buildWeapon("ak47", "AK-47"),
      m4a1: buildWeapon("m4a1", "M4A1 / M4A4"),
      awp: buildWeapon("awp", "AWP"),
      deagle: buildWeapon("deagle", "Desert Eagle"),
      glock: buildWeapon("glock", "Glock-18"),
      hkp2000: buildWeapon("hkp2000", "USP-S / P2000"),
      p250: buildWeapon("p250", "P250"),
      ssg08: buildWeapon("ssg08", "SSG 08"),
      mac10: buildWeapon("mac10", "MAC-10"),
      mp9: buildWeapon("mp9", "MP9"),
    };

    const mapCodes = [
      { key: "de_dust2", name: "Dust II" },
      { key: "de_inferno", name: "Inferno" },
      { key: "de_nuke", name: "Nuke" },
      { key: "de_train", name: "Train" },
      { key: "de_vertigo", name: "Vertigo" },
      { key: "cs_office", name: "Office" },
    ];

    const maps: MapRecord[] = mapCodes.map((m) => ({
      mapName: m.name,
      wins: getVal(`total_wins_map_${m.key}`),
      rounds: getVal(`total_rounds_map_${m.key}`),
    })).filter((m) => m.rounds > 0 || m.wins > 0);

    const steamDossier: SteamDossier = {
      identifiers,
      profile: {
        personaName: profileRaw.personaname,
        profileUrl: profileRaw.profileurl,
        avatar: profileRaw.avatarfull,
        visibility: profileRaw.communityvisibilitystate,
      },
      bans,
      combat: {
        kills,
        deaths,
        kdRatio: deaths > 0 ? (kills / deaths).toFixed(2) : kills.toString(),
        damageDone: getVal("total_damage_done"),
        moneyEarned: getVal("total_money_earned"),
        wins: getVal("total_wins"),
        roundsPlayed: getVal("total_rounds_played"),
        mvps: getVal("total_mvps"),
        timePlayedHours: Math.round(getVal("total_time_played") / 3600),
        headshots,
        headshotPercentage: kills > 0 ? `${Math.round((headshots / kills) * 100)}%` : "0%",
        shotsFired,
        shotsHit,
        overallAccuracy: shotsFired > 0 ? `${Math.round((shotsHit / shotsFired) * 100)}%` : "0%",
        bombsPlanted: getVal("total_planted_bombs"),
        bombsDefused: getVal("total_defused_bombs"),
        hostagesRescued: getVal("total_rescued_hostages"),
        pistolRoundWins: getVal("total_wins_pistolround"),
      },
      weapons,
      maps,
    };

    // 4. Parse FACEIT Track
    let faceitDossier: FaceitDossier = { registered: false };

    if (faceitRes && faceitRes.ok) {
      const fData = await faceitRes.json();
      const faceitId = fData.player_id;

      const [fStatsRes, fHistRes] = await Promise.all([
        fetch(`https://open.faceit.com/data/v4/players/${faceitId}/stats/cs2`, {
          headers: { Authorization: `Bearer ${FACEIT_API_KEY}` },
        }).catch(() => null),
        fetch(`https://open.faceit.com/data/v4/players/${faceitId}/history?game=cs2&limit=20`, {
          headers: { Authorization: `Bearer ${FACEIT_API_KEY}` },
        }).catch(() => null),
      ]);

      const fStatsData = fStatsRes && fStatsRes.ok ? await fStatsRes.json() : null;
      const fHistData = fHistRes && fHistRes.ok ? await fHistRes.json() : null;
      const life = fStatsData?.lifetime || {};

      const rawSegments = fStatsData?.segments || [];
      const segments: FaceitMapSegment[] = rawSegments
        .filter((s: any) => s._id?.gameMode === "5v5" && s.type === "duplicated_rounds")
        .map((s: any) => ({
          mapName: s.label || s._id?.segmentId || "Unknown",
          matches: Number(s.stats?.Matches || 0),
          wins: Number(s.stats?.Wins || 0),
          winRate: `${s.stats?.["Win Rate %"] || 0}%`,
          kdRatio: s.stats?.["Average K/D Ratio"] || "0",
          headshotPct: `${s.stats?.["Average Headshots %"] || 0}%`,
          kills: Number(s.stats?.Kills || 0),
          mvps: Number(s.stats?.MVPs || 0),
        }));

      faceitDossier = {
        registered: true,
        identity: {
          playerId: faceitId,
          nickname: fData.nickname,
          avatar: fData.avatar,
          country: fData.country,
          skillLevel: fData.games?.cs2?.skill_level || 1,
          elo: fData.games?.cs2?.faceit_elo || 1000,
          region: fData.games?.cs2?.region || "SEA",
        },
        overview: {
          matches: Number(life["Matches"] || life["Total Matches"] || 0),
          wins: Number(life["Wins"] || 0),
          winRatePct: `${life["Win Rate %"] || 0}%`,
          kdRatio: life["Average K/D Ratio"] || "0",
          adr: life["ADR"] || "0",
          headshotPct: `${life["Average Headshots %"] || 0}%`,
          totalDamage: Number(life["Total Damage"] || 0),
          currentWinStreak: Number(life["Current Win Streak"] || 0),
          longestWinStreak: Number(life["Longest Win Streak"] || 0),
          recentResults: life["Recent Results"] || [],
        },
        entry: {
          entryRate: `${Math.round(Number(life["Entry Rate"] || 0) * 100)}%`,
          totalEntryCount: Number(life["Total Entry Count"] || 0),
          entrySuccessRate: `${Math.round(Number(life["Entry Success Rate"] || 0) * 100)}%`,
          totalEntryWins: Number(life["Total Entry Wins"] || 0),
          sniperKillRate: `${(Number(life["Sniper Kill Rate"] || 0) * 100).toFixed(1)}%`,
          totalSniperKills: Number(life["Total Sniper Kills"] || 0),
          sniperKillRatePerRound: life["Sniper Kill Rate per Round"] || "0",
        },
        clutch: {
          clutch1v1: {
            winRate: `${Math.round(Number(life["1v1 Win Rate"] || 0) * 100)}%`,
            wins: Number(life["Total 1v1 Wins"] || 0),
            count: Number(life["Total 1v1 Count"] || 0),
          },
          clutch1v2: {
            winRate: `${Math.round(Number(life["1v2 Win Rate"] || 0) * 100)}%`,
            wins: Number(life["Total 1v2 Wins"] || 0),
            count: Number(life["Total 1v2 Count"] || 0),
          },
          totalKillsExtended: Number(life["Total Kills with extended stats"] || 0),
          totalRoundsExtended: Number(life["Total Rounds with extended stats"] || 0),
        },
        utility: {
          utilitySuccessRate: `${Math.round(Number(life["Utility Success Rate"] || 0) * 100)}%`,
          totalUtilitySuccesses: Number(life["Total Utility Successes"] || 0),
          totalUtilityCount: Number(life["Total Utility Count"] || 0),
          utilityUsagePerRound: life["Utility Usage per Round"] || "0",
          utilityDamageTotal: Number(life["Total Utility Damage"] || 0),
          utilityDamagePerRound: life["Utility Damage per Round"] || "0",
          flashSuccessRate: `${Math.round(Number(life["Flash Success Rate"] || 0) * 100)}%`,
          totalFlashSuccesses: Number(life["Total Flash Successes"] || 0),
          totalFlashCount: Number(life["Total Flash Count"] || 0),
          enemiesFlashedTotal: Number(life["Total Enemies Flashed"] || 0),
          enemiesFlashedPerRound: life["Enemies Flashed per Round"] || "0",
        },
        maps: segments,
        recentMatches: (fHistData?.items || []).map((m: any) => ({
          matchId: m.match_id,
          competitionName: m.competition_name,
          region: m.region,
          startedAt: m.started_at,
          finishedAt: m.finished_at,
          teams: m.teams,
          results: m.results,
          faceitUrl: m.faceit_url ? m.faceit_url.replace("{lang}", "en") : "#",
        })),
      };
    }

    // 5. Index & Persist to Atlas
    const client = await clientPromise;
    const db = client.db("cs2biodata");

    const valveMatches = await db
      .collection("valve_matches")
      .find({ steamId })
      .sort({ syncedAt: -1 })
      .limit(20)
      .toArray();

    const masterPayload = {
      steamId,
      steam: steamDossier,
      faceit: faceitDossier,
      gameCoordinator: gcProfile || null,
      valveHistory: valveMatches,
      updatedAt: new Date().toISOString(),
    };

    await db.collection("dossiers").updateOne(
      { steamId },
      { $set: masterPayload },
      { upsert: true }
    );

    return NextResponse.json({ success: true, data: masterPayload });
  } catch (err: any) {
    Sentry.captureException(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
