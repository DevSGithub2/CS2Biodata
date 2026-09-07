import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const STEAM_API_KEY = process.env.STEAM_API_KEY || "242B8BD87C9C03CC0DC885D34003605D";
const FACEIT_API_KEY = process.env.FACEIT_API_KEY || "2b0d2e13-4ed0-43f3-9e1a-0b7a6736ca92";
const FACEIT_API_URL = "https://open.faceit.com/data/v4";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://22bcs50145_db_user:Cs2PulsePass2026@cluster0.sphkwzw.mongodb.net/cs2pulse?retryWrites=true&w=majority&appName=Cluster0";

let client: MongoClient | null = null;
async function getDb() {
  if (!MONGODB_URI) return null;
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client.db("cs2pulse");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let query = (
      searchParams.get("query") ||
      searchParams.get("q") ||
      searchParams.get("steamId64") ||
      searchParams.get("steamId") ||
      ""
    ).trim();

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Search query is required" },
        { status: 400 }
      );
    }

    if (query.includes("steamcommunity.com")) {
      const match = query.match(/steamcommunity\.com\/(?:id|profiles)\/([^\s/?#]+)/);
      if (match) query = match[1];
    }

    let steamId64 = query;

    // Resolve custom URL / vanity name to steamID64
    if (!/^\d{17}$/.test(query)) {
      const resolveUrl = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_API_KEY}&vanityurl=${encodeURIComponent(query)}`;
      const resolveRes = await fetch(resolveUrl, { cache: "no-store" });
      const resolveData = await resolveRes.json().catch(() => null);

      if (resolveData?.response?.success === 1 && resolveData.response.steamid) {
        steamId64 = resolveData.response.steamid;
      } else {
        return NextResponse.json(
          { success: false, error: "Player profile not found on Steam" },
          { status: 404 }
        );
      }
    }

    const db = await getDb().catch(() => null);

    // Concurrent Steam API calls
    const [summaryRes, bansRes, statsRes, gamesRes] = await Promise.all([
      fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId64}`,
        { next: { revalidate: 60 } }
      ),
      fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${STEAM_API_KEY}&steamids=${steamId64}`,
        { next: { revalidate: 60 } }
      ),
      fetch(
        `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=${STEAM_API_KEY}&steamid=${steamId64}`,
        { next: { revalidate: 60 } }
      ),
      fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId64}&include_played_free_games=1&format=json`,
        { next: { revalidate: 60 } }
      ),
    ]);

    const summaryData = summaryRes.ok ? await summaryRes.json() : null;
    const bansData = bansRes.ok ? await bansRes.json() : null;
    const userStatsData = statsRes.ok ? await statsRes.json() : null;
    const gamesData = gamesRes.ok ? await gamesRes.json() : null;

    const steamPlayer = summaryData?.response?.players?.[0];
    if (!steamPlayer) {
      return NextResponse.json(
        { success: false, error: "Steam profile not found or private" },
        { status: 404 }
      );
    }

    const playerBans = bansData?.players?.[0];

    const cs2Game = gamesData?.response?.games?.find((g: any) => g.appid === 730);
    const totalPlaytimeHours = cs2Game?.playtime_forever
      ? Math.round(cs2Game.playtime_forever / 60)
      : 0;
    const recentPlaytimeHours = cs2Game?.playtime_2weeks
      ? (cs2Game.playtime_2weeks / 60).toFixed(1)
      : "0.0";

    let isPrivate = true;
    let lifetime = null;
    let weapons: any[] = [];

    if (userStatsData?.playerstats?.stats) {
      isPrivate = false;
      const statsMap: Record<string, number> = {};
      userStatsData.playerstats.stats.forEach((s: any) => {
        statsMap[s.name] = s.value;
      });

      const totalKills = statsMap["total_kills"] || 0;
      const totalDeaths = statsMap["total_deaths"] || 1;
      const totalHeadshots = statsMap["total_kills_headshot"] || 0;
      const totalMvps = statsMap["total_mvps"] || 0;
      const totalWins = statsMap["total_wins"] || statsMap["total_rounds_won"] || 0;

      const kd = (totalKills / Math.max(1, totalDeaths)).toFixed(2);
      const hsPercentage = `${Math.round((totalHeadshots / Math.max(1, totalKills)) * 100)}%`;

      lifetime = {
        kd,
        kills: totalKills.toLocaleString(),
        headshots: totalHeadshots.toLocaleString(),
        hsPercentage,
        mvps: totalMvps.toLocaleString(),
        roundsWon: totalWins.toLocaleString(),
      };

      const weaponDefs = [
        { key: "ak47", name: "AK-47" },
        { key: "m4a1", name: "M4A4 / M4A1-S" },
        { key: "awp", name: "AWP" },
        { key: "deagle", name: "Desert Eagle" },
        { key: "usp_silencer", name: "USP-S" },
        { key: "glock", name: "Glock-18" },
        { key: "mp9", name: "MP9" },
        { key: "galilar", name: "Galil AR" },
        { key: "famas", name: "FAMAS" },
        { key: "ssg08", name: "SSG 08" },
        { key: "p250", name: "P250" },
      ];

      weapons = weaponDefs
        .map((w) => ({
          name: w.name,
          kills: statsMap[`total_kills_${w.key}`] || 0,
          hits: statsMap[`total_hits_${w.key}`] || 0,
        }))
        .filter((w) => w.kills > 0)
        .sort((a, b) => b.kills - a.kills);
    }

    // FACEIT API lookup
    let faceitData: any = { found: false, level: 0, elo: 0, kd: "1.00", headshotPercentage: 50 };

    if (FACEIT_API_KEY) {
      try {
        const faceitPlayerRes = await fetch(
          `${FACEIT_API_URL}/players?game=cs2&game_player_id=${steamId64}`,
          {
            headers: { Authorization: `Bearer ${FACEIT_API_KEY}` },
            next: { revalidate: 60 },
          }
        );

        if (faceitPlayerRes.ok) {
          const faceitPlayer = await faceitPlayerRes.json();
          const faceitLevel =
            faceitPlayer.games?.cs2?.skill_level ||
            faceitPlayer.games?.csgo?.skill_level ||
            1;
          const faceitElo =
            faceitPlayer.games?.cs2?.faceit_elo ||
            faceitPlayer.games?.csgo?.faceit_elo ||
            1000;

          let faceitKd = "1.00";
          let faceitHs = 50;

          try {
            const fStatsRes = await fetch(
              `${FACEIT_API_URL}/players/${faceitPlayer.player_id}/stats/cs2`,
              {
                headers: { Authorization: `Bearer ${FACEIT_API_KEY}` },
                next: { revalidate: 60 },
              }
            );
            if (fStatsRes.ok) {
              const fStats = await fStatsRes.json();
              faceitKd =
                fStats.lifetime?.["Average K/D Ratio"] ||
                fStats.lifetime?.["K/D Ratio"] ||
                "1.00";
              faceitHs = Number(fStats.lifetime?.["Average Headshots %"] || 50);
            }
          } catch (fErr) {
            console.error("FACEIT stats error:", fErr);
          }

          faceitData = {
            found: true,
            level: faceitLevel,
            elo: faceitElo,
            kd: faceitKd,
            headshotPercentage: faceitHs,
            nickname: faceitPlayer.nickname,
            avatar: faceitPlayer.avatar,
          };
        }
      } catch (fErr) {
        console.error("FACEIT player lookup error:", fErr);
      }
    }

    let premierRating = 0;
    let premierWins = 0;
    let matchCount = 0;

    if (db) {
      try {
        const [playerDoc, gcDoc, totalMatches] = await Promise.all([
          db.collection("players").findOne({ steamId64 }),
          db.collection("gc_profiles").findOne({ steamId64 }),
          db.collection("matches").countDocuments({
            $or: [
              { players: steamId64 },
              { steamId64 },
              { discoveredFromSteamId: steamId64 },
            ],
          }),
        ]);

        premierRating = playerDoc?.premierRating || gcDoc?.premierRating || 0;
        premierWins = playerDoc?.premierWins || gcDoc?.wins || 0;
        matchCount = totalMatches;
      } catch (dbErr) {
        console.error("MongoDB hydration error:", dbErr);
      }
    }

    const payload = {
      success: true,
      isPrivate,
      playtime: {
        totalHours: totalPlaytimeHours,
        recentHours: recentPlaytimeHours,
      },
      lifetime: lifetime || {
        kd: "—",
        kills: "—",
        headshots: "—",
        hsPercentage: "—",
        mvps: "—",
        roundsWon: "—",
      },
      weapons,
      data: {
        _id: steamId64,
        identifiers: {
          steamID64: steamId64,
          profileUrl: steamPlayer.profileurl,
        },
        bio: {
          name: steamPlayer.personaname,
          avatar:
            steamPlayer.avatarfull ||
            steamPlayer.avatarmedium ||
            steamPlayer.avatar,
          location: steamPlayer.loccountrycode || "GLOBAL",
        },
        bans: {
          vacBanned: Boolean(playerBans?.VACBanned),
          isBanned: Boolean(playerBans?.VACBanned || playerBans?.CommunityBanned),
          numberOfGameBans: playerBans?.NumberOfGameBans || 0,
          communityBanned: Boolean(playerBans?.CommunityBanned),
        },
        premier: {
          rating: premierRating,
        },
        premierRating,
        premierWins,
        faceit: faceitData,
        syncedMatchesCount: matchCount,
        timeCreated: steamPlayer.timecreated,
      },
    };

    return NextResponse.json(payload);
  } catch (err: any) {
    console.error("Player stats API exception:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
