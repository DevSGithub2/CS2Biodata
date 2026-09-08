import { NextResponse } from "next/server";

const STEAM_API_KEY = "242B8BD87C9C03CC0DC885D34003605D";
const FACEIT_API_KEY = "2b0d2e13-4ed0-43f3-9e1a-0b7a6736ca92";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "76561198877011661";

  try {
    // 1. Fetch Steam Player Summaries
    const steamRes = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${query}`,
      { cache: "no-store" }
    );
    const steamData = await steamRes.json();
    const player = steamData?.response?.players?.[0] || {};

    // 2. Fetch Faceit Profile using SteamID64 mapping
    const faceitRes = await fetch(
      `https://open.faceit.com/data/v4/players?game=cs2&game_player_id=${player.steamid || query}`,
      {
        headers: { Authorization: `Bearer ${FACEIT_API_KEY}`, Accept: "application/json" },
        cache: "no-store",
      }
    );
    const faceitData = faceitRes.ok ? await faceitRes.json() : null;

    // 3. Extract comprehensive payload mapping for maximum UI display
    const aggregatedPayload = {
      steamId64: player.steamid || query,
      personaName: player.personaname || faceitData?.nickname || "Unknown",
      realName: player.realname || "N/A",
      avatar: player.avatarfull || faceitData?.avatar || "",
      profileUrl: player.profileurl || "",
      country: player.loccountrycode || faceitData?.country || "IN",
      timeCreated: player.timecreated || 0,
      lastLogoff: player.lastlogoff || 0,
      faceit: {
        playerId: faceitData?.player_id || null,
        nickname: faceitData?.nickname || null,
        faceitElo: faceitData?.games?.cs2?.faceit_elo || 1507,
        skillLevel: faceitData?.games?.cs2?.skill_level || 7,
        region: faceitData?.games?.cs2?.region || "SEA",
        membershipType: faceitData?.membership_type || "Standard",
        friendsCount: faceitData?.friends_ids?.length || 0,
      },
    };

    return NextResponse.json(aggregatedPayload);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
