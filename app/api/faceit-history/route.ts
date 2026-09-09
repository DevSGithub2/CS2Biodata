import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get("playerId");

  if (!playerId) {
    return NextResponse.json({ error: "Missing playerId" }, { status: 400 });
  }

  const apiKey = process.env.FACEIT_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FACEIT_API_KEY is not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://open.faceit.com/data/v4/players/${playerId}/history?game=cs2&offset=0&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `FACEIT API responded with status ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch FACEIT history" }, { status: 500 });
  }
}
