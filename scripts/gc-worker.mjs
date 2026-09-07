import SteamUser from "steam-user";
import GlobalOffensive from "globaloffensive";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
const username = process.env.STEAM_BOT_USERNAME;
const password = process.env.STEAM_BOT_PASSWORD;

if (!uri) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db("cs2biodata");
console.log("[GC DAEMON] Connected to MongoDB Atlas.");

if (!username || !password) {
  console.log("[GC DAEMON] No STEAM_BOT credentials provided. Daemon standing by.");
} else {
  const user = new SteamUser();
  const csgo = new GlobalOffensive(user);

  user.logOn({ accountName: username, password });

  user.on("loggedOn", () => {
    console.log("[GC DAEMON] Logged into Steam. Launching CS2 (App 730)...");
    user.setPersona(SteamUser.EPersonaState.Online);
    user.gamesPlayed([730]);
  });

  csgo.on("connectedToGC", () => {
    console.log("[GC DAEMON] Connected to Valve CS2 Game Coordinator!");
  });

  user.on("error", (err) => {
    console.error("[GC DAEMON] Steam Error:", err.message);
  });
}
