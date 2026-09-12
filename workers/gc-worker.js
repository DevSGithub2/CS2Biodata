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
  console.error("[GC Worker] Steam logon error:", err.message);
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

csgo.on("connectedToGC", async () => {
  console.log("[GC Worker] Connected to CS2 Game Coordinator!");
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

      // Find matches where scoreboard telemetry has not been extracted yet
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
    const roundScores = match.roundstatsall || [];
    const lastRound = roundScores[roundScores.length - 1];

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
