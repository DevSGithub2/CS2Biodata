import { decodeShareCode } from "@/lib/sharecode";
import clientPromise from "@/lib/mongodb";

export async function processMatchSync(shareCode: string) {
  const decoded: any = decodeShareCode(shareCode);
  if (!decoded) {
    throw new Error("Invalid match share code format.");
  }

  const client = await clientPromise;
  const db = client.db("cs2biodata");

  const matchDocument = {
    shareCode,
    matchId: decoded.matchId?.toString() || null,
    reservationId: decoded.reservationId?.toString() || null,
    tvPort: decoded.tvPort || null,
    status: "queued",
    createdAt: new Date(),
  };

  await db.collection("matches").updateOne(
    { shareCode },
    { $set: matchDocument },
    { upsert: true }
  );

  return matchDocument;
}
