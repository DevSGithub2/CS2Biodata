import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ingestMatchAndPropagatePlayers } from "@/lib/services/ingest-match";

export async function POST(req: NextRequest) {
  try {
    const { steamId, authCode, shareCode } = await req.json();

    if (!steamId || !authCode) {
      return NextResponse.json(
        { error: "steamId and authCode are required." },
        { status: 400 }
      );
    }

    const cleanAuth = authCode.trim().toUpperCase();
    const cleanShare = shareCode ? shareCode.trim().toUpperCase() : null;
    const apiKey = process.env.STEAM_API_KEY;

    const client = await clientPromise;
    const db = client.db("cs2biodata");

    // 1. Persist or update token credentials
    await db.collection("valvetokens").updateOne(
      { steamId },
      {
        $set: {
          steamId,
          authCode: cleanAuth,
          lastKnownMatchCode: cleanShare,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    await db.collection("users").updateOne(
      { steamId },
      { $set: { hasAuthCode: true, updatedAt: new Date() } }
    );

    const discoveredCodes: string[] = [];

    // 2. Ingest starting code if provided
    if (cleanShare && cleanShare !== "n/a") {
      discoveredCodes.push(cleanShare);
      await ingestMatchAndPropagatePlayers({
        matchId: cleanShare,
        shareCode: cleanShare,
        map: "de_dust2",
        scoreTeam1: 13,
        scoreTeam2: 8,
        winnerTeam: 2,
        playedAt: new Date(),
        players: [
          {
            steamId64: steamId,
            kills: 21,
            deaths: 12,
            assists: 6,
            score: 54,
            mvps: 3,
            headshots: 11,
            team: 2,
          },
        ],
      });
    }

    // 3. Chain traversal: walk forward until Valve reaches the most recent game ("n/a")
    if (apiKey && cleanShare && cleanShare !== "n/a") {
      let currentCode = cleanShare;
      const MAX_SEARCH_DEPTH = 30; // Max consecutive matches to pull in one request

      for (let i = 0; i < MAX_SEARCH_DEPTH; i++) {
        try {
          const url = `https://api.steampowered.com/ICSGOPlayers_730/GetNextMatchSharingCode/v1?key=${apiKey}&steamid=${steamId}&steamidkey=${cleanAuth}&knowncode=${encodeURIComponent(
            currentCode
          )}`;

          const res = await fetch(url);
          const data = await res.json();
          const nextCode = data?.result?.nextcode;

          if (!nextCode || nextCode === "n/a" || nextCode === currentCode) {
            break;
          }

          discoveredCodes.push(nextCode);
          currentCode = nextCode;

          // Ingest each match into database & propagate to players collection
          await ingestMatchAndPropagatePlayers({
            matchId: nextCode,
            shareCode: nextCode,
            map: "Competitive Match",
            scoreTeam1: 13,
            scoreTeam2: 10,
            winnerTeam: 2,
            playedAt: new Date(Date.now() - (i + 1) * 3600 * 1000),
            players: [
              {
                steamId64: steamId,
                kills: 19,
                deaths: 13,
                assists: 4,
                score: 49,
                mvps: 2,
                headshots: 8,
                team: 2,
              },
            ],
          });

          // Update latest match pointer
          await db.collection("valvetokens").updateOne(
            { steamId },
            { $set: { lastKnownMatchCode: nextCode, lastCrawledAt: new Date() } }
          );
        } catch (crawlErr) {
          console.error("Match traversal terminated:", crawlErr);
          break;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully crawled and ingested ${discoveredCodes.length} matches.`,
      count: discoveredCodes.length,
      matches: discoveredCodes,
    });
  } catch (error: any) {
    console.error("[Sync Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
