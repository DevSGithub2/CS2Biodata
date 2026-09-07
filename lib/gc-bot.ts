import SteamUser from "steam-user";
import GlobalOffensive from "globaloffensive";

declare global {
  var __gc_bot: {
    client: SteamUser;
    csgo: GlobalOffensive;
    isReady: boolean;
  } | undefined;
}

const BOT_USERNAME = process.env.STEAM_BOT_USERNAME;
const BOT_PASSWORD = process.env.STEAM_BOT_PASSWORD;

function initializeGCBot() {
  if (global.__gc_bot) {
    return global.__gc_bot;
  }

  const client = new SteamUser();
  const csgo = new GlobalOffensive(client);

  const state = {
    client,
    csgo,
    isReady: false,
  };

  if (BOT_USERNAME && BOT_PASSWORD) {
    client.logOn({
      accountName: BOT_USERNAME,
      password: BOT_PASSWORD,
    });

    client.on("loggedOn", () => {
      console.log("[Valve GC Bot] Logged into Steam network. Booting CS2 appid 730...");
      client.gamesPlayed([730]);
    });

    csgo.on("connectedToGC", () => {
      console.log("[Valve GC Bot] Connected to CS2 Game Coordinator successfully.");
      state.isReady = true;
    });

    csgo.on("disconnectedFromGC", (reason) => {
      console.warn("[Valve GC Bot] Disconnected from GC:", reason);
      state.isReady = false;
    });

    client.on("error", (err) => {
      console.error("[Valve GC Bot] Steam client connection error:", err.message);
    });
  }

  global.__gc_bot = state;
  return state;
}

export const gcBot = initializeGCBot();
