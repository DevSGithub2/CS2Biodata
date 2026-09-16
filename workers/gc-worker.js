require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const { MongoClient } = require("mongodb");
const SteamUser = require("steam-user");
const GlobalOffensive = require("globaloffensive");
const { decodeMatchShareCode } = require("csgo-sharecode");

const uri = process.env.MONGODB_URI;
const accountName = process.env.STEAM_BOT_USERNAME;
const password = process.env.STEAM_BOT_PASSWORD;

if (!uri || !accountName || !password) {
  console.log("[GC Worker] Bot credentials or MONGODB_URI missing. Worker idling in polling mode.");
  setInterval(() => {}, 1000 * 60);
  return;
}

const client = new SteamUser();
const csgo = new GlobalOffensive(client);
let mongoClient;
let db;

client.on("error", (err) => {
  console.error("[GC Worker] Steam error:", err.message);
});

client.on("steamGuard", (domain, callback) => {
  console.log("[GC Worker] Steam Guard code required for domain:", domain);
});

client.logOn({ accountName, password });

client.on("loggedOn", () => {
  console.log("[GC Worker] Steam Bot logged on successfully");
  client.setPersona(SteamUser.EPersonaState.Online);
  client.gamesPlayed([730]);
});

function sweepPendingInvites() {
  if (!client.myFriends) return;
  console.log("[GC Worker] Scanning friends cache for pending invites...");
  for (const [sid, relationship] of Object.entries(client.myFriends)) {
    if (relationship === SteamUser.EFriendRelationship.RequestRecipient || relationship === 2) {
      console.log(`🤝 [GC Worker] Auto-accepting backlogged invite from: ${sid}`);
      client.addFriend(sid, (err) => {
        if (err) console.error(`[GC Worker] Failed to accept ${sid}:`, err.message);
      });
    }
  }
}

client.on("friendsList", () => {
  console.log("[GC Worker] Friends list cached.");
  sweepPendingInvites();
});

async function handleProfileData(steamId64, profile) {
  if (!profile) return;
  try {
    const rankings = profile.rankings || [];
    const premierEntry = rankings.find((r) => r.rank_type_id === 6 || r.rank_type_id === 2 || r.score > 0) || profile.ranking;
    const score = Number(premierEntry?.score ?? premierEntry?.rank_id ?? 0);

    console.log(`[GC Worker] Extracted Premier Score: ${score} for ${steamId64}`);

    if (db && score > 0) {
      await db.collection("dossiers").updateMany(
        {
          $or: [
            { steamId64 },
            { steamId: steamId64 },
            { "identifiers.steamID64": steamId64 },
            { "steam.identifiers.steamID64": steamId64 }
          ]
        },
        {
          $set: {
            premierRating: score,
            premier_rank: score,
            "premier.rating": score,
            "premier.score": score,
            "premier.activeSeason.rating": score,
            rankings: rankings,
            updatedAt: new Date()
          }
        }
      );

      await db.collection("player_ranks").updateOne(
        { $or: [{ steamId64 }, { steamId: steamId64 }] },
        {
          $set: {
            steamId: steamId64,
            steamId64,
            premierRating: score,
            score: score,
            rankings: rankings,
            premier: {
              activeSeason: { rating: score, wins: premierEntry?.wins || 0 },
              seasons: []
            },
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );

      console.log(`💾 [GC Worker] Successfully saved Premier rating (${score}) to dossiers & player_ranks for ${steamId64}`);
    }
  } catch (err) {
    console.error(`[GC Worker] Failed saving profile data for ${steamId64}:`, err.message);
  }
}

// Event-based profile telemetry listener
csgo.on("playersProfile", (profile) => {
  if (!profile || !profile.account_id) return;
  const steamId64 = (BigInt(profile.account_id) + 76561197960265728n).toString();
  console.log(`[GC Worker] Event playersProfile received for ${steamId64}`);
  handleProfileData(steamId64, profile);
});

// Real-time friend relationship handler
client.on("friendRelationship", async (steamID, relationship) => {
  const sid64 = typeof steamID.getSteamID64 === "function" ? steamID.getSteamID64() : steamID.toString();

  if (relationship === SteamUser.EFriendRelationship.RequestRecipient || relationship === 2) {
    console.log(`🤝 [GC Worker] Incoming friend invite detected from: ${sid64}. Accepting...`);
    client.addFriend(steamID, (err) => {
      if (err) console.error(`[GC Worker] Add friend error for ${sid64}:`, err.message);
    });
  }

  if (relationship === SteamUser.EFriendRelationship.Friend || relationship === 3) {
    console.log(`✅ [GC Worker] Friendship active with ${sid64}. Requesting CS2 profile...`);

    if (csgo.haveGCSession) {
      try {
        csgo.requestPlayersProfile(sid64, (profile) => {
          console.log(`[GC Worker] Callback playersProfile received for ${sid64}`);
          handleProfileData(sid64, profile);
        });
      } catch (err) {
        console.error(`[GC Worker] Failed to dispatch GC profile request for ${sid64}:`, err.message);
      }
    }

    setTimeout(() => {
      client.removeFriend(steamID);
      console.log(`🧹 [GC Worker] Auto-unfriended ${sid64} after profile telemetry sync.`);
    }, 8000);
  }
});

csgo.on("connectedToGC", async () => {
  console.log("[GC Worker] Connected to CS2 Game Coordinator!");
  sweepPendingInvites();
  try {
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    db = mongoClient.db("cs2biodata");
    pollUnprocessedMatches();
  } catch (err) {
    console.error("[GC Worker] DB Connection error:", err.message);
  }
});

async function pollUnprocessedMatches() {
  setInterval(async () => {
    try {
      if (!db || !csgo.haveGCSession) return;

      const matchToInspect = await db.collection("valvematches").findOne({
        demoUrl: { $exists: false }
      });

      if (!matchToInspect) return;

      console.log(`[GC Worker] Inspecting share code: ${matchToInspect.shareCode}`);
      const decoded = decodeMatchShareCode(matchToInspect.shareCode);
      csgo.requestGame(decoded.matchId, decoded.outcomeId || decoded.reservationId, decoded.tvPort || decoded.token);
    } catch (err) {
      console.error("[GC Worker] Error in match queue polling:", err.message);
    }
  }, 15000);
}

csgo.on("matchList", async (matches) => {
  if (!matches || matches.length === 0) return;
  const match = matches[0];
  console.log(`[GC Worker] Match telemetry received for Match ID: ${match.matchid}`);

  try {
    await db.collection("valvematches").updateOne(
      { matchId: { $regex: match.matchid.toString() } },
      {
        $set: {
          demoUrl: match.roundstats_legacy?.map || `valve_demo_${match.matchid}`,
          updatedAt: new Date()
        }
      }
    );
  } catch (err) {
    console.error("[GC Worker] Error saving GC match details:", err.message);
  }
});
