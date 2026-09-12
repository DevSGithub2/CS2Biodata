const https = require("https");
const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
const steamKey = process.env.STEAM_API_KEY;
const POLL_INTERVAL_MS = 60 * 1000; // Poll once every 60 seconds

async function pollOnce() {
  if (!uri || !steamKey) {
    console.error("[Poller] MONGODB_URI or STEAM_API_KEY missing.");
    return;
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("cs2biodata");

    // Fetch all active tokens
    const tokens = await db.collection("valvetokens").find({
      authCode: { $exists: true, $ne: "" },
      lastKnownMatchCode: { $exists: true, $ne: "" }
    }).toArray();

    for (const tokenDoc of tokens) {
      const steamId = tokenDoc.steamId;
      let currentCode = tokenDoc.lastKnownMatchCode;
      let matchesFound = 0;

      while (true) {
        const url = `https://api.steampowered.com/ICSGOPlayers_730/GetNextMatchSharingCode/v1?key=${steamKey}&steamidkey=${tokenDoc.authCode}&steamid=${steamId}&knowncode=${encodeURIComponent(currentCode)}`;

        const resData = await new Promise((resolve) => {
          https.get(url, (res) => {
            let d = "";
            res.on("data", c => d += c);
            res.on("end", () => resolve({ status: res.statusCode, body: d }));
          }).on("error", () => resolve({ status: 500 }));
        });

        if (resData.status === 200) {
          try {
            const json = JSON.parse(resData.body);
            const nextCode = json.result?.nextcode;
            if (nextCode && nextCode !== "n/a") {
              console.log(`[Poller] New match detected for ${steamId}: ${nextCode}`);

              await db.collection("valve_matches").updateOne(
                { matchId: nextCode },
                {
                  $setOnInsert: {
                    matchId: nextCode,
                    shareCode: nextCode,
                    steamId,
                    steamId64: steamId,
                    status: "queued",
                    createdAt: new Date()
                  }
                },
                { upsert: true }
              );

              currentCode = nextCode;
              matchesFound++;
              continue;
            }
          } catch (e) {}
        }
        break;
      }

      if (matchesFound > 0) {
        await db.collection("valvetokens").updateOne(
          { steamId },
          { $set: { lastKnownMatchCode: currentCode, updatedAt: new Date() } }
        );
        console.log(`[Poller] Updated ${steamId} checkpoint to ${currentCode}`);
      }
    }
  } catch (err) {
    console.error("[Poller] Cycle error:", err.message);
  } finally {
    await client.close();
  }
}

async function start() {
  console.log("[Poller] Starting autonomous Valve match poller daemon (60s loop)...");
  while (true) {
    await pollOnce();
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }
}

start();
