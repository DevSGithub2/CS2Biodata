require("dotenv").config({ path: ".env.local" });
const SteamUser = require("steam-user");
const GlobalOffensive = require("globaloffensive");
const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI;
const STEAM_BOT_ACCOUNT = process.env.STEAM_BOT_USERNAME;
const STEAM_BOT_PASSWORD = process.env.STEAM_BOT_PASSWORD;

if (!STEAM_BOT_ACCOUNT || !STEAM_BOT_PASSWORD) {
  console.log("ℹ️  GC Bot credentials missing in .env.local (STEAM_BOT_USERNAME, STEAM_BOT_PASSWORD).");
  console.log("   Add a dedicated Steam account to run live GC protobuf queries.");
}

const client = new SteamUser();
const csgo = new GlobalOffensive(client);
let mongoClient;
let db;

async function init() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is required.");
    return;
  }
  mongoClient = new MongoClient(MONGODB_URI);
  await mongoClient.connect();
  db = mongoClient.db("cs2biodata");
  console.log("✅ GC Bot connected to MongoDB Atlas.");

  if (STEAM_BOT_ACCOUNT && STEAM_BOT_PASSWORD) {
    client.logOn({
      accountName: STEAM_BOT_ACCOUNT,
      password: STEAM_BOT_PASSWORD,
    });
  }
}

client.on("loggedOn", () => {
  console.log("✅ Steam Bot logged in. Launching CS2 AppID 730...");
  client.setPersona(SteamUser.EPersonaState.Online);
  client.gamesPlayed([730]);
});

csgo.on("connectedToGC", () => {
  console.log("🎯 Connected to CS2 Game Coordinator!");
  processPendingMatches();
  setInterval(processPendingMatches, 15000); // Check for new queued codes every 15s
});

async function processPendingMatches() {
  if (!db) return;

  const pending = await db
    .collection("pending_matches")
    .find({ status: "queued" })
    .limit(5)
    .toArray();

  for (const item of pending) {
    try {
      console.log(`📡 Ingesting match code from GC: ${item.shareCode}`);

      // Request match info from GC
      csgo.requestMatchDetails(item.shareCode, async (err, match) => {
        if (err || !match) {
          console.warn(`Failed to retrieve details for ${item.shareCode}:`, err?.message);
          await db.collection("pending_matches").updateOne(
            { _id: item._id },
            { $set: { status: "failed", error: err?.message, attemptedAt: new Date() } }
          );
          return;
        }

        // Save parsed match payload into MongoDB `valve_matches`
        await db.collection("valve_matches").updateOne(
          { matchId: match.matchid ? match.matchid.toString() : item.shareCode },
          {
            $set: {
              steamId: item.steamId,
              shareCode: item.shareCode,
              matchDetails: match,
              roundStats: match.roundstatsall,
              syncedAt: new Date(),
            },
          },
          { upsert: true }
        );

        // Mark pending item as processed
        await db.collection("pending_matches").updateOne(
          { _id: item._id },
          { $set: { status: "completed", processedAt: new Date() } }
        );

        console.log(`✅ Stored full GC telemetry for match: ${item.shareCode}`);
      });
    } catch (e) {
      console.error("Match processing error:", e);
    }
  }
}

init();
