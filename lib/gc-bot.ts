import SteamUser from "steam-user";
import GlobalOffensive from "globaloffensive";

declare global {
  var _gcBotInstance: {
    user: SteamUser;
    csgo: GlobalOffensive;
    isReady: boolean;
  } | undefined;
}

export function getGCBot() {
  if (global._gcBotInstance) {
    return global._gcBotInstance;
  }

  const user = new SteamUser();
  const csgo = new GlobalOffensive(user);

  const username = process.env.STEAM_BOT_USERNAME;
  const password = process.env.STEAM_BOT_PASSWORD;

  const botInstance = {
    user,
    csgo,
    isReady: false,
  };

  if (username && password) {
    user.logOn({
      accountName: username,
      password: password,
    });

    user.on("loggedOn", () => {
      console.log("[GC BOT] Logged into Steam. Launching CS2 (App 730)...");
      user.setPersona(SteamUser.EPersonaState.Online);
      user.gamesPlayed([730]);
    });

    csgo.on("connectedToGC", () => {
      console.log("[GC BOT] Successfully established connection with Valve CS2 Game Coordinator!");
      botInstance.isReady = true;
    });

    csgo.on("disconnectedFromGC", (reason) => {
      console.warn("[GC BOT] Disconnected from GC:", reason);
      botInstance.isReady = false;
    });

    user.on("error", (err) => {
      console.error("[GC BOT] Steam login error:", err.message);
    });
  } else {
    console.warn("[GC BOT] STEAM_BOT_USERNAME or STEAM_BOT_PASSWORD missing from environment.");
  }

  global._gcBotInstance = botInstance;
  return botInstance;
}
