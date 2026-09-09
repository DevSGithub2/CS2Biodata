import { NextRequest, NextResponse } from "next/server";

const STEAM_API_KEY = process.env.STEAM_API_KEY || "";

function chunkArray<T>(arr: T[], size = 100): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const steamId64 = searchParams.get("steamId64");

  if (!steamId64) {
    return NextResponse.json({ friends: [], error: "Missing steamId64" }, { status: 400 });
  }

  if (!STEAM_API_KEY) {
    return NextResponse.json({ friends: [], error: "Steam API key not configured" }, { status: 500 });
  }

  try {
    const friendListRes = await fetch(
      `https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${STEAM_API_KEY}&steamid=${steamId64}&relationship=friend`,
      { next: { revalidate: 300 } }
    );

    if (!friendListRes.ok) {
      return NextResponse.json({ friends: [], error: "Friends list is private or unavailable." });
    }

    const friendListData = await friendListRes.json();
    const friendsRaw: any[] = friendListData?.friendslist?.friends || [];

    if (friendsRaw.length === 0) {
      return NextResponse.json({ friends: [] });
    }

    const boundedFriends = friendsRaw.slice(0, 5000);
    const friendSinceMap = new Map<string, number>();
    boundedFriends.forEach((f) => {
      friendSinceMap.set(f.steamid, f.friend_since);
    });

    const allIds = boundedFriends.map((f) => f.steamid);
    const idBatches = chunkArray(allIds, 100);

    const [summariesResults, bansResults] = await Promise.all([
      Promise.all(
        idBatches.map(async (batch) => {
          const idsCsv = batch.join(",");
          const res = await fetch(
            `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${idsCsv}`
          );
          if (!res.ok) return [];
          const data = await res.json();
          return data?.response?.players || [];
        })
      ),
      Promise.all(
        idBatches.map(async (batch) => {
          const idsCsv = batch.join(",");
          const res = await fetch(
            `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${STEAM_API_KEY}&steamids=${idsCsv}`
          );
          if (!res.ok) return [];
          const data = await res.json();
          return data?.players || [];
        })
      ),
    ]);

    const allPlayers = summariesResults.flat();
    const allBans = bansResults.flat();

    const bansMap = new Map<string, any>();
    allBans.forEach((b) => {
      bansMap.set(b.SteamId, b);
    });

    const enrichedFriends = allPlayers.map((p: any) => {
      const banInfo = bansMap.get(p.steamid);
      const isVacBanned = Boolean(banInfo?.VACBanned || (banInfo?.NumberOfVACBans || 0) > 0);
      const isCommunityBanned = Boolean(banInfo?.CommunityBanned);
      const isGameBanned = (banInfo?.NumberOfGameBans || 0) > 0;
      const isBanned = isVacBanned || isCommunityBanned || isGameBanned;

      let banType = "CLEAN";
      if (isVacBanned) banType = `VAC BAN (${banInfo.DaysSinceLastBan}d ago)`;
      else if (isGameBanned) banType = `GAME BAN (${banInfo.DaysSinceLastBan}d ago)`;
      else if (isCommunityBanned) banType = "COMMUNITY BAN";

      const friendSince = friendSinceMap.get(p.steamid);
      const relationship = friendSince
        ? `Friends since ${new Date(friendSince * 1000).getFullYear()}`
        : "Friend";

      return {
        steamid: p.steamid,
        personaname: p.personaname || "Unknown Operative",
        avatar: p.avatarfull || p.avatarmedium || p.avatar || "",
        profileurl: p.profileurl || `https://steamcommunity.com/profiles/${p.steamid}`,
        isBanned,
        banType,
        vacBanned: isVacBanned,
        communityBanned: isCommunityBanned,
        relationship,
      };
    });

    enrichedFriends.sort((a, b) => (b.isBanned ? 1 : 0) - (a.isBanned ? 1 : 0));

    return NextResponse.json({ friends: enrichedFriends });
  } catch (err: any) {
    return NextResponse.json({ friends: [], error: err.message }, { status: 500 });
  }
}
