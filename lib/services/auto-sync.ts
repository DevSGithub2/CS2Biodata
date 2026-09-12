import clientPromise from "@/lib/mongodb";

export async function triggerPassiveSync(steamId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("cs2biodata");

    const tokenDoc = await db.collection("valvetokens").findOne({ steamId });
    if (!tokenDoc || !tokenDoc.authCode || !tokenDoc.lastKnownMatchCode) return;

    // Throttle checks to once every 10 minutes per player
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (tokenDoc.lastCheckedAt && new Date(tokenDoc.lastCheckedAt) > tenMinutesAgo) {
      return;
    }

    await db.collection("valvetokens").updateOne(
      { steamId },
      { $set: { lastCheckedAt: new Date() } }
    );

    // Invoke crawler endpoint asynchronously without awaiting
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    fetch(`${baseUrl}/api/valve/crawl?steamId=${steamId}`, { method: "POST" }).catch(() => {});
  } catch (err) {
    console.error("[AutoSync] Passive trigger error:", err);
  }
}
