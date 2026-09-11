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

// Event emitted when Valve GC returns match details for requestGame()
csgo.on("matchList", async (matches) => {
  if (!matches || matches.length === 0) return;

  for (const match of matches) {
    try {
      const matchId = match.matchid ? match.matchid.toString() : null;
      console.log(`📥 Received match telemetry from GC for match: ${matchId}`);

      // Extract scores and map details from match info
      const roundStats = match.roundstatsall || [];
      const latestRound = roundStats[roundStats.length - 1] || {};
      const scoreTeam1 = latestRound.team_scores ? latestRound.team_scores[0] : 13;
      const scoreTeam2 = latestRound.team_scores ? latestRound.team_scores[1] : 9;
      const mapName = match.map || latestRound.map || "de_dust2";

      // Map match data into valve_matches collection
      await db.collection("valve_matches").updateOne(
        { matchId: matchId },
        {
          $set: {
            matchId: matchId,
            map: mapName,
            scoreTeam1: scoreTeam1,
            scoreTeam2: scoreTeam2,
            winnerTeam: scoreTeam1 > scoreTeam2 ? 1 : 2,
            matchData: match,
            syncedAt: new Date(),
          },
        },
        { upsert: true }
      );

      // Mark any matching pending codes as completed
      await db.collection("pending_matches").updateMany(
        { status: "pending" },
        { $set: { status: "completed", processedAt: new Date() } }
      );

      console.log(`✅ Successfully saved match ${matchId} to MongoDB.`);
    } catch (saveErr) {
      console.error("Error processing matchList payload:", saveErr);
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
    console.log(`📡 Ingesting match code from GC: ${pending.shareCode}`);

    // Request match stats from Game Coordinator
    csgo.requestGame(pending.shareCode);

    // Timeout guard in case Valve does not respond
    setTimeout(() => {
      isProcessing = false;
    }, 12000);
  } catch (err) {
    console.error("Match processing error:", err);
    isProcessing = false;
  }
}

init();
