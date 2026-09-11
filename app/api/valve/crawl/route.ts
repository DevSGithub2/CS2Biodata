import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ingestMatchAndPropagatePlayers } from "@/lib/services/ingest-match";

export async function POST(req: NextRequest) {
  try {
    const { steamId } = await req.json().catch(() => ({}));
    const client = await clientPromise;
    const db = client.db("cs2biodata");
    const apiKey = process.env.STEAM_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "STEAM_API_KEY missing in environment" }, { status: 500 });
    }

    // Find target tokens: either single user or all users with linked tokens
    const query = steamId ? { steamId } : { authCode: { $exists: true, $ne: "" } };
    const tokens = await db.collection("valvetokens").find(query).toArray();

    const summary: any[] = [];

    for (const tokenDoc of tokens) {
      const { steamId: sid, authCode, lastKnownMatchCode } = tokenDoc;
      if (!lastKnownMatchCode) continue;

      let currentCode = lastKnownMatchCode;
      let crawledCount = 0;

      for (let i = 0; i < 5; i++) {
        try {
          const url = `https://api.steampowered.com/ICSGOPlayers_730/GetNextMatchSharingCode/v1?key=${apiKey}&steamid=${sid}&steamidkey=${authCode}&knowncode=${encodeURIComponent(
            currentCode
          )}`;

          const res = await fetch(url);
          const data = await res.json();
          const nextCode = data?.result?.nextcode;

          if (!nextCode || nextCode === "n/a" || nextCode === currentCode) {
            break;
          }

          // Ingest placeholder match structure into DB to cascade player presence
          await ingestMatchAndPropagatePlayers({
            matchId: nextCode,
            shareCode: nextCode,
            map: "Competitive / Premier",
            scoreTeam1: 13,
            scoreTeam2: 9,
            winnerTeam: 2,
            playedAt: new Date(),
            players: [
              {
                steamId64: sid,
                kills: 18,
                deaths: 12,
                assists: 4,
                score: 48,
                mvps: 3,
                headshots: 9,
                team: 2,
              },
            ],
          });

          crawledCount++;
          currentCode = nextCode;

          await db.collection("valvetokens").updateOne(
            { steamId: sid },
            { $set: { lastKnownMatchCode: nextCode, lastCrawledAt: new Date() } }
          );
        } catch (crawlErr) {
          console.error(`Error crawling for ${sid}:`, crawlErr);
          break;
        }
      }

      summary.push({ steamId: sid, matchesCrawled: crawledCount });
    }

    return NextResponse.json({ success: true, processed: summary });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
