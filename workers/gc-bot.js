require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");
const SteamUser = require("steam-user");
const GlobalOffensive = require("globaloffensive");

const client = new SteamUser();
const csgo = new GlobalOffensive(client);

const mongoUri = process.env.MONGODB_URI;
const mongoClient = new MongoClient(mongoUri);

let db;
let isProcessing = false;

const MAP_NAMES = {
  1: "de_dust2",
  2: "de_train",
  3: "de_ancient",
  4: "de_inferno",
  5: "de_nuke",
  6: "de_vertigo",
  7: "de_mirage",
  8: "de_anubis",
  9: "de_overpass",
  10: "cs_office",
  11: "cs_italy",
  12: "de_cache",
};

async function init() {
  try {
    await mongoClient.connect();
    db = mongoClient.db("cs2biodata");
    console.log("✅ GC Bot connected to MongoDB Atlas.");

    client.logOn({
      accountName: process.env.STEAM_BOT_USERNAME,
      password: process.env.STEAM_BOT_PASSWORD,
    });
  } catch (err) {
    console.error("Worker initialization error:", err);
  }
}

client.on("loggedOn", () => {
  console.log("✅ Steam Bot logged in. Launching CS2 AppID 730...");
  client.setPersona(SteamUser.EPersonaState.Online);
  client.gamesPlayed([730]);
});

csgo.on("connectedToGC", () => {
  console.log("🎯 Connected to CS2 Game Coordinator!");
  setInterval(processPendingMatches, 15000);
  processPendingMatches();
});

client.on("friendRelationship", async (steamID, relationship) => {
  const sid64 = steamID.getSteamID64();

  if (relationship === SteamUser.EFriendRelationship.RequestRecipient) {
    console.log(`🤝 Friend invite received from ${sid64}. Accepting...`);
    client.addFriend(steamID);
  }

  if (relationship === SteamUser.EFriendRelationship.Friend) {
    console.log(`✅ Friend connection active for ${sid64}. Fetching skill groups...`);
    fetchAndStorePlayerProfile(steamID);
  }
});

async function fetchAndStorePlayerProfile(steamID) {
  const steamId64 = steamID.getSteamID64();
  const accountId = steamID.accountid;

  if (!csgo.haveGCSession) {
    console.warn("⚠️ No active GC session. Cannot request profile.");
    setTimeout(() => client.removeFriend(steamID), 2000);
    return;
  }

  try {
    // Send raw GC Protobuf message with request_level: 32 for full per-map telemetry
    const payload = {
      account_id: accountId,
      request_level: 32
    };

    // k_EMsgGCCStrike15_v2_ClientRequestPlayersProfile = 9127
    if (csgo._send) {
      csgo._send(9127, payload);
    } else {
      csgo.requestPlayersProfile(steamID);
    }

    const onProfileResponse = async (profile) => {
      if (!profile || profile.account_id !== accountId) return;
      csgo.removeListener("playersProfile", onProfileResponse);

      console.log(`📊 Successfully decoded full GC Profile telemetry for ${steamId64}`);

      let activePremier = {
        name: "Premier Season",
        rating: 0,
        wins: 0,
        bestRating: 0,
        lastUpdated: "Just now",
      };

      const mapRanks = [];
      let wingman = { wins: 0, rankId: 0, bestRankId: 0 };

      const rankings = Array.isArray(profile.rankings) ? profile.rankings : [];

      for (const r of rankings) {
        const typeId = r.rank_type_id || r.ranking_type_id;

        // CS2 Premier Mode (type 11 or 10)
        if (typeId === 11 || typeId === 10) {
          activePremier = {
            name: "Premier Season",
            rating: r.rank_id || 0,
            wins: r.wins || r.wins_count || 0,
            bestRating: r.rank_id || 0,
            lastUpdated: "Just now",
          };
        }

        // Wingman Mode (type 7)
        if (typeId === 7) {
          wingman = {
            wins: r.wins || r.wins_count || 0,
            rankId: r.rank_id || 0,
            bestRankId: r.rank_id || 0,
          };
        }

        // Per-map competitive skill groups
        if (Array.isArray(r.per_map_rank) && r.per_map_rank.length > 0) {
          for (const m of r.per_map_rank) {
            const mapCode = MAP_NAMES[m.map_id] || `map_${m.map_id}`;
            mapRanks.push({
              mapId: mapCode,
              wins: m.wins_count || m.wins || 0,
              rankId: m.rank_id || 0,
              bestRankId: m.rank_id || 0,
            });
          }
        } else if (typeId === 6) {
          const mapCode = MAP_NAMES[r.map_id] || `map_${r.map_id}`;
          mapRanks.push({
            mapId: mapCode,
            wins: r.wins_count || r.wins || 0,
            rankId: r.rank_id || 0,
            bestRankId: r.rank_id || 0,
          });
        }
      }

      // Fallback ranking property check
      if (activePremier.rating === 0 && profile.ranking) {
        activePremier.rating = profile.ranking.rank_id || 0;
        activePremier.wins = profile.ranking.wins || 0;
        activePremier.bestRating = profile.ranking.rank_id || 0;
      }

      await db.collection("player_ranks").updateOne(
        { steamId64 },
        {
          $set: {
            steamId64,
            premier: {
              activeSeason: activePremier,
              seasons: [],
            },
            mapRanks,
            wingman,
            commendations: profile.commendation || {},
            medals: profile.medals || {},
            playerLevel: profile.player_level || 1,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );

      console.log(`💾 Saved complete skill groups to MongoDB for ${steamId64}`);

      setTimeout(() => {
        console.log(`👋 Auto-unfriending ${steamId64}`);
        client.removeFriend(steamID);
      }, 2000);
    };

    csgo.on("playersProfile", onProfileResponse);

    // Timeout safety fallback
    setTimeout(() => {
      csgo.removeListener("playersProfile", onProfileResponse);
      client.removeFriend(steamID);
    }, 8000);

  } catch (ex) {
    console.error(`Exception during profile fetch for ${steamId64}:`, ex);
    setTimeout(() => client.removeFriend(steamID), 2000);
  }
}

// Keep standard match ingestion worker running
csgo.on("matchList", async (matches) => {
  if (!matches || matches.length === 0) return;
  for (const match of matches) {
    try {
      const matchId = match.matchid ? match.matchid.toString() : "unknown";
      const roundStats = match.roundstatsall || [];
      const latestRound = roundStats[roundStats.length - 1] || {};
      const scoreTeam1 = latestRound.team_scores ? latestRound.team_scores[0] : 13;
      const scoreTeam2 = latestRound.team_scores ? latestRound.team_scores[1] : 9;
      const mapName = match.map || latestRound.map || "de_dust2";

      const rawPlayers = latestRound.reservation?.account_ids || [];
      const players = rawPlayers.map((accId, idx) => {
        const steamId64 = (BigInt(accId) + BigInt("76561197960265728")).toString();
        return {
          steamId64,
          kills: latestRound.kills ? latestRound.kills[idx] : 0,
          deaths: latestRound.deaths ? latestRound.deaths[idx] : 0,
          assists: latestRound.assists ? latestRound.assists[idx] : 0,
          score: latestRound.scores ? latestRound.scores[idx] : 0,
          mvps: latestRound.mvps ? latestRound.mvps[idx] : 0,
          team: idx < 5 ? 2 : 3,
        };
      });

      await db.collection("valve_matches").updateOne(
        { matchId },
        {
          $set: {
            matchId,
            map: mapName,
            scoreTeam1,
            scoreTeam2,
            winnerTeam: scoreTeam1 > scoreTeam2 ? 2 : 3,
            players,
            matchData: match,
            syncedAt: new Date(),
          },
        },
        { upsert: true }
      );

      await db.collection("pending_matches").updateMany(
        { status: "pending" },
        { $set: { status: "completed", processedAt: new Date() } }
      );
    } catch (saveErr) {
      console.error("Error saving match:", saveErr);
    }
  }
  isProcessing = false;
});

async function processPendingMatches() {
  if (isProcessing || !csgo.haveGCSession) return;
  try {
    const pending = await db
      .collection("pending_matches")
      .findOne({ status: "pending" });
    if (!pending) return;
    isProcessing = true;
    csgo.requestGame(pending.shareCode);
    setTimeout(() => { isProcessing = false; }, 12000);
  } catch (err) {
    isProcessing = false;
  }
}

init();
