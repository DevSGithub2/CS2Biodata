import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const steamId64 = searchParams.get("steamId64");

  if (!steamId64) {
    return NextResponse.json({ matches: [] });
  }

  try {
    const client = await clientPromise;
    const db = client.db("cs2biodata");

    const [parsedMatches, pendingMatches, tokenRecord] = await Promise.all([
      db.collection("valve_matches").find({ steamId: steamId64 }).sort({ syncedAt: -1 }).toArray(),
      db.collection("pending_matches").find({ steamId: steamId64 }).sort({ queuedAt: -1 }).toArray(),
      db.collection("valvetokens").findOne({ steamId: steamId64 })
    ]);

    const formattedMatches: any[] = [];

    parsedMatches.forEach((m: any) => {
      formattedMatches.push({
        id: m.matchId || m.shareCode,
        shareCode: m.shareCode,
        map: m.matchDetails?.map || "de_dust2",
        score: `${m.matchDetails?.team1_score ?? 13} - ${m.matchDetails?.team2_score ?? 11}`,
        result: m.matchDetails?.team1_score > m.matchDetails?.team2_score ? "VICTORY" : "DEFEAT",
        date: m.syncedAt ? new Date(m.syncedAt).toLocaleDateString() : "Recent",
      });
    });

    pendingMatches.forEach((p: any) => {
      formattedMatches.push({
        id: p.shareCode,
        shareCode: p.shareCode,
        map: "Valve Match Server",
        score: "Code Queued",
        result: p.status === "completed" ? "VICTORY" : "SYNCING",
        date: p.queuedAt ? new Date(p.queuedAt).toLocaleDateString() : "Just now",
      });
    });

    if (formattedMatches.length === 0 && tokenRecord?.lastKnownMatchCode) {
      formattedMatches.push({
        id: tokenRecord.lastKnownMatchCode,
        shareCode: tokenRecord.lastKnownMatchCode,
        map: "Valve Match Server",
        score: "Code Linked",
        result: "SYNCING",
        date: tokenRecord.updatedAt ? new Date(tokenRecord.updatedAt).toLocaleDateString() : "Just now",
      });
    }

    return NextResponse.json({
      success: true,
      matches: formattedMatches,
    });
  } catch (err: any) {
    console.error("[valve-history Error]", err);
    return NextResponse.json({ matches: [], error: err.message });
  }
}
