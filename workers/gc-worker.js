const SteamUser = require("steam-user");
const GlobalOffensive = require("globaloffensive");

const client = new SteamUser();
const csgo = new GlobalOffensive(client);

const BOT_USERNAME = process.env.STEAM_BOT_USERNAME;
const BOT_PASSWORD = process.env.STEAM_BOT_PASSWORD;

if (!BOT_USERNAME || !BOT_PASSWORD) {
  console.error("[Worker] Missing Steam bot credentials in environment variables.");
  process.exit(1);
}

console.log("[Worker] Launching standalone Steam GC Bot daemon...");
client.logOn({
  accountName: BOT_USERNAME,
  password: BOT_PASSWORD,
});

client.on("loggedOn", () => {
  console.log("[Worker] Logged into Steam network. Requesting CS2 App 730...");
  client.gamesPlayed([730]);
});

csgo.on("connectedToGC", () => {
  console.log("[Worker] SUCCESS: Connected to CS2 Game Coordinator 24/7.");
});

csgo.on("disconnectedFromGC", (reason) => {
  console.warn("[Worker] Disconnected from GC:", reason);
});

client.on("error", (err) => {
  console.error("[Worker] Steam error:", err.message);
});
