import { NextRequest, NextResponse } from "next/server";

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const steamId64 = searchParams.get("steamId64")?.trim();
  const steamApiKey = process.env.STEAM_API_KEY;

  if (!steamId64) {
    return NextResponse.json({ success: false, error: "steamId64 is required." }, { status: 400 });
  }

  if (!steamApiKey) {
    return NextResponse.json({ success: false, error: "STEAM_API_KEY is not configured." }, { status: 500 });
  }

  try {
    // 1. Fetch 100% of friends with no truncation
    const friendsRes = await fetch(
      `https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=${steamApiKey}&steamid=${steamId64}&relationship=friend`,
      { next: { revalidate: 60 } }
    );

    if (!friendsRes.ok) {
      if (friendsRes.status === 401 || friendsRes.status === 500) {
        return NextResponse.json({
          success: false,
          error: "This Steam profile's friends list is private or unavailable.",
          isPrivate: true,
        });
      }
      throw new Error(`Failed to fetch friends (Status: ${friendsRes.status})`);
    }

    const friendsJson = await friendsRes.json();
    const friendList: any[] = friendsJson?.friendslist?.friends || [];

    if (friendList.length === 0) {
      return NextResponse.json({
        success: true,
        data: { total: 0, bannedCount: 0, friends: [] },
      });
    }

    // 2. Process all friends concurrently in chunks of 100 to satisfy Valve's API protocol
    const batches = chunkArray(friendList, 100);
    const playersMap = new Map();
    const bansMap = new Map();

    await Promise.all(
      batches.map(async (batch) => {
        const ids = batch.map((f: any) => f.steamid).join(",");

        const [summariesRes, bansRes] = await Promise.all([
          fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${steamApiKey}&steamids=${ids}`),
          fetch(`https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${steamApiKey}&steamids=${ids}`),
        ]);

        if (summariesRes.ok) {
          const summariesJson = await summariesRes.json();
          (summariesJson?.response?.players || []).forEach((p: any) => {
            playersMap.set(p.steamid, p);
          });
        }

        if (bansRes.ok) {
          const bansJson = await bansRes.json();
          (bansJson?.players || []).forEach((b: any) => {
            bansMap.set(b.SteamId, b);
          });
        }
      })
    );

    // 3. Assemble and calculate ban telemetry across all friends
    let bannedCount = 0;
    const enrichedFriends = friendList.map((f: any) => {
      const summary = playersMap.get(f.steamid) || {};
      const banInfo = bansMap.get(f.steamid) || {};

      const isVacBanned = Boolean(banInfo.VACBanned);
      const gameBans = banInfo.NumberOfGameBans || 0;
      const isCommunityBanned = Boolean(banInfo.CommunityBanned);
      const isBanned = isVacBanned || gameBans > 0 || isCommunityBanned;

      if (isBanned) bannedCount++;

      return {
        steamId64: f.steamid,
        personaName: summary.personaname || `User (${f.steamid.slice(-4)})`,
        avatar: summary.avatarfull || summary.avatar || "https://api.dicebear.com/7.x/identicon/svg?seed=" + f.steamid,
        profileUrl: summary.profileurl || `https://steamcommunity.com/profiles/${f.steamid}`,
        relationshipSince: f.friend_since ? f.friend_since * 1000 : null,
        isBanned,
        vacBanned: isVacBanned,
        vacBanCount: banInfo.NumberOfVACBans || 0,
        gameBanCount: gameBans,
        communityBanned: isCommunityBanned,
        daysSinceLastBan: banInfo.DaysSinceLastBan || 0,
        economyBan: banInfo.EconomyBan || "none",
      };
    });

    // 4. Sort banned friends first, followed alphabetically
    enrichedFriends.sort((a: any, b: any) => {
      if (a.isBanned === b.isBanned) {
        return a.personaName.localeCompare(b.personaName);
      }
      return a.isBanned ? -1 : 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        total: enrichedFriends.length,
        bannedCount,
        friends: enrichedFriends,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
