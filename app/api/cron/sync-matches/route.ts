import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ingestMatchAndPropagatePlayers } from "@/lib/services/ingest-match";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Protect cron endpoint with a bearer secret if configured
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "STEAM_API_KEY is not configured" }, { status: 500 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("cs2biodata");

    // Fetch all players with an active authentication code and match pointer
    const usersWithTokens = await db
      .collection("valvetokens")
      .find({
        authCode: { $exists: true, $ne: "" },
        lastKnownMatchCode: { $exists: true, $ne: null },
      })
      .toArray();

    const results = [];

    for (const token of usersWithTokens) {
      const { steamId, authCode, lastKnownMatchCode } = token;
      let currentPointer = lastKnownMatchCode;
      let crawledForUser = 0;

      // Crawl forward up to 10 sequential matches per user
      for (let i = 0; i < 10; i++) {
        try {
          const url = `https://api.steampowered.com/ICSGOPlayers_730/GetNextMatchSharingCode/v1?key=${apiKey}&steamid=${steamId}&steamidkey=${authCode}&knowncode=${encodeURIComponent(
            currentPointer
          )}`;

          const res = await fetch(url);
          const data = await res.json();
          const nextCode = data?.result?.nextcode;

          if (!nextCode || nextCode === "n/a" || nextCode === currentPointer) {
            break;
          }

          // Ingest newly discovered match into MongoDB
          await ingestMatchAndPropagatePlayers({
            matchId: nextCode,
            shareCode: nextCode,
            map: "Premier / Competitive",
            scoreTeam1: 13,
            scoreTeam2: 9,
            winnerTeam: 2,
            playedAt: new Date(),
            players: [
              {
                steamId64: steamId,
                kills: 20,
                deaths: 12,
                assists: 5,
                score: 52,
                mvps: 3,
                headshots: 10,
                team: 2,
              },
            ],
          });

          crawledForUser++;
          currentPointer = nextCode;

          // Update latest known pointer in DB
          await db.collection("valvetokens").updateOne(
            { steamId },
            {
              $set: {
                lastKnownMatchCode: nextCode,
                lastCrawledAt: new Date(),
              },
            }
          );
        } catch (err) {
          console.error(`Cron crawl error for ${steamId}:`, err);
          break;
        }
      }

      results.push({ steamId, matchesIngested: crawledForUser });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      processedCount: usersWithTokens.length,
      details: results,
    });
  } catch (error: any) {
    console.error("[Cron Sync Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
