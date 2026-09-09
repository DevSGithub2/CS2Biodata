import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set in .env.local");
  process.exit(1);
}

async function init() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("cs2biodata");
    console.log("Connected to MongoDB Atlas cs2biodata cluster.");

    // 1. Players collection
    await db.collection("players").createIndex({ steamId64: 1 }, { unique: true });
    await db.collection("players").createIndex({ updatedAt: 1 });
    console.log("✓ Indexed 'players' collection");

    // 2. Inventory Cache collection (with 2-hour TTL cache index)
    await db.collection("inventory_cache").createIndex({ steamId64: 1 }, { unique: true });
    await db.collection("inventory_cache").createIndex({ cachedAt: 1 }, { expireAfterSeconds: 7200 });
    console.log("✓ Indexed 'inventory_cache' collection (2h TTL)");

    // 3. Matches collection (share codes and GC tokens)
    await db.collection("matches").createIndex({ matchId: 1 }, { unique: true });
    await db.collection("matches").createIndex({ shareCode: 1 }, { sparse: true });
    await db.collection("matches").createIndex({ "players.steamId64": 1 });
    console.log("✓ Indexed 'matches' collection");

    // 4. Match Telemetry (Round ADR, KAST, parsed demo data)
    await db.collection("match_telemetry").createIndex({ matchId: 1, steamId64: 1 }, { unique: true });
    console.log("✓ Indexed 'match_telemetry' collection");

    // 5. Global Leaderboards
    await db.collection("leaderboards").createIndex({ season: 1, region: 1, rank: 1 });
    console.log("✓ Indexed 'leaderboards' collection");

    console.log("\nDatabase schema & indexes successfully deployed to Atlas.");
  } catch (err) {
    console.error("Database Init Failed:", err);
  } finally {
    await client.close();
  }
}

init();
