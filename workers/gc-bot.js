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

// Auto-accept incoming friend requests
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

  if (!csgo.haveGCSession) {
    console.warn("⚠️ No active GC session. Cannot request profile.");
    setTimeout(() => client.removeFriend(steamID), 2000);
    return;
  }

  try {
    csgo.requestPlayersProfile(steamID, async (err, profile) => {
      if (err) {
        console.error(`❌ GC Profile fetch error for ${steamId64}:`, err);
        setTimeout(() => client.removeFriend(steamID), 2000);
        return;
      }

      console.log(`📊 Ingested telemetry for ${steamId64}`);

      const ranking = profile.ranking || {};
      const activePremier = {
        name: "Premier Active",
        rating: ranking.rank_id || 0,
        wins: ranking.wins || 0,
        bestRating: ranking.rank_id || 0,
        lastUpdated: "Live",
      };

      const mapRanks = [];
      let wingman = { wins: 0, rankId: 0, bestRankId: 0 };

      const rankings = profile.rankings || [];
      for (const r of rankings) {
        if (r.ranking_type_id === 6) {
          const mapCode = MAP_NAMES[r.map_id] || `map_${r.map_id}`;
          mapRanks.push({
            mapId: mapCode,
            wins: r.wins_count || 0,
            rankId: r.rank_id || 0,
            bestRankId: r.rank_id || 0,
          });
        }
        if (r.ranking_type_id === 7) {
          wingman = {
            wins: r.wins_count || 0,
            rankId: r.rank_id || 0,
            bestRankId: r.rank_id || 0,
          };
        }
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
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );

      console.log(`💾 Saved skill groups to MongoDB for ${steamId64}`);

      // Auto-unfriend after 2 seconds to release friend slot
      setTimeout(() => {
        console.log(`👋 Auto-unfriending ${steamId64}`);
        client.removeFriend(steamID);
      }, 2000);
    });
  } catch (ex) {
    console.error(`Exception during profile fetch for ${steamId64}:`, ex);
    setTimeout(() => client.removeFriend(steamID), 2000);
  }
}

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

    setTimeout(() => {
      isProcessing = false;
    }, 12000);
  } catch (err) {
    console.error("Pending match error:", err);
    isProcessing = false;
  }
}

init();
