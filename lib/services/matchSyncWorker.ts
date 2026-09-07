import { processDemo } from "./demoProcessor";
import clientPromise from "@/lib/mongodb";
import { decryptAuthCode } from "@/lib/crypto";
import { decodeMatchShareCode } from "./matchCodeDecoder";

const STEAM_API_KEY = process.env.STEAM_API_KEY || "242B8BD87C9C03CC0DC885D34003605D";

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { cache: "no-store" });
    // Retry only on 500 Internal Server Error or 504 Gateway Timeout
    if (res.status === 500 || res.status === 504) {
      await new Promise(r => setTimeout(r, 2000 * (i + 1))); 
      continue;
    }
    return res;
  }
  throw new Error("Max retries reached for Valve API");
}

export async function syncUserMatches(steamId64: string) {
  const client = await clientPromise;
  const db = client.db("cs2pulse");

  const cred = await db.collection("auth_credentials").findOne({ steamId64 });
  if (!cred || !cred.encryptedAuthCode || cred.syncStatus === "revoked") {
    return { success: false, error: "No valid credentials found" };
  }

  const authCode = decryptAuthCode(cred.encryptedAuthCode, cred.iv, cred.authTag);
  let currentCode = cred.lastKnownMatchCode;
  let matchesCrawled = 0;
  const discoveredMatches: string[] = [];
  const bulkOps: any[] = [];

  while (currentCode && currentCode !== "n/a" && matchesCrawled < 50) {
    const url = `https://api.steampowered.com/ICSGOPlayers_730/GetNextMatchSharingCode/v1?key=${STEAM_API_KEY}&steamid=${steamId64}&steamidkey=${encodeURIComponent(authCode)}&knowncode=${encodeURIComponent(currentCode)}`;

    try {
      const res = await fetchWithRetry(url);
      
      if (res.status === 412 || res.status === 403) {
        await db.collection("auth_credentials").updateOne(
          { steamId64 },
          { $set: { syncStatus: "revoked", updatedAt: new Date() } }
        );
        break; 
      }

      if (!res.ok) break;

      const data = await res.json();
      const nextCode = data.result?.nextcode;

      if (!nextCode || nextCode === "n/a" || nextCode === currentCode) {
        break; 
      }

      discoveredMatches.push(nextCode);
      const decoded = decodeMatchShareCode(nextCode);

      bulkOps.push({
        updateOne: {
          filter: { shareCode: nextCode },
          update: {
            $setOnInsert: {
              shareCode: nextCode,
              matchId: decoded?.matchId || null,
              outcomeId: decoded?.outcomeId || null,
              status: "pending_download",
              discoveredFromSteamId: steamId64,
              createdAt: new Date(),
            },
          },
          upsert: true,
        },
      });

      currentCode = nextCode;
      matchesCrawled++;
      
      // Valve API rate limiting buffer
      await new Promise(r => setTimeout(r, 500)); 
    } catch (err) {
      console.error("Crawler exception:", err);
      break;
    }
  }

  if (bulkOps.length > 0) {
    await db.collection("matches").bulkWrite(bulkOps, { ordered: false });
  }

  await db.collection("auth_credentials").updateOne(
    { steamId64 },
    {
      $set: {
        lastKnownMatchCode: currentCode,
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      },
      $inc: { totalMatchesIndexed: matchesCrawled },
    }
  );

  return { success: true, matchesCrawled, discoveredMatches };
}
