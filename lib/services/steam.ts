const STEAM_KEY = process.env.STEAM_API_KEY || "";

export async function resolveToSteamId64(query: string): Promise<string> {
  const clean = query.trim();
  if (!isNaN(Number(clean)) && clean.length === 17) {
    return clean;
  }
  try {
    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_KEY}&vanityurl=${encodeURIComponent(clean)}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    if (data.response?.success === 1) {
      return data.response.steamid;
    }
  } catch (err) {
    console.error("[Steam Resolve Error]", err);
  }
  return clean;
}

export async function fetchSteamProfileAndBans(steamId64: string) {
  try {
    const summaryUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_KEY}&steamids=${steamId64}`;
    const bansUrl = `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${STEAM_KEY}&steamids=${steamId64}`;

    const [sumRes, banRes] = await Promise.all([
      fetch(summaryUrl, { cache: "no-store" }),
      fetch(bansUrl, { cache: "no-store" })
    ]);

    const sumJson = await sumRes.json().catch(() => ({}));
    const banJson = await banRes.json().catch(() => ({}));

    const player = sumJson?.response?.players?.[0] || null;
    const bans = banJson?.players?.[0] || null;

    if (!player) {
      console.warn(`[Steam Summary Warning] No player found for steamId: ${steamId64}. Raw response:`, sumJson);
    }

    return {
      steamId64,
      personaName: player?.personaname || "Unknown Player",
      profileUrl: player?.profileurl || `https://steamcommunity.com/profiles/${steamId64}`,
      avatar: player?.avatarfull || player?.avatar || "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
      country: player?.loccountrycode || "GLOBAL",
      timeCreated: player?.timecreated || null,
      isPublic: player ? player.communityvisibilitystate === 3 : false,
      bans: {
        vacBanned: Boolean(bans?.VACBanned),
        numberOfVacBans: bans?.NumberOfVACBans || 0,
        daysSinceLastBan: bans?.DaysSinceLastBan || 0,
        communityBanned: Boolean(bans?.CommunityBanned),
        economyBan: bans?.EconomyBan || "none"
      }
    };
  } catch (err) {
    console.error("[Steam Fetch Error]", err);
    return {
      steamId64,
      personaName: "CS2 Operative",
      profileUrl: `https://steamcommunity.com/profiles/${steamId64}`,
      avatar: "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
      country: "GLOBAL",
      timeCreated: null,
      isPublic: false,
      bans: { vacBanned: false, numberOfVacBans: 0, daysSinceLastBan: 0, communityBanned: false, economyBan: "none" }
    };
  }
}

export async function fetchFriendNetworkAudit(steamId64: string) {
  try {
    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${STEAM_KEY}&steamid=${steamId64}&relationship=friend`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return { totalFriends: 0, bannedFriendsCount: 0, friends: [], privateNetwork: true };
    }
    const json = await res.json();
    const rawFriends = json.friendslist?.friends || [];
    if (!rawFriends.length) {
      return { totalFriends: 0, bannedFriendsCount: 0, friends: [], privateNetwork: false };
    }

    const sampledIds = rawFriends.slice(0, 100).map((f: any) => f.steamid).join(",");

    const [fSumRes, fBanRes] = await Promise.all([
      fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_KEY}&steamids=${sampledIds}`, { cache: "no-store" }),
      fetch(`https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${STEAM_KEY}&steamids=${sampledIds}`, { cache: "no-store" })
    ]);

    const fSum = await fSumRes.json().catch(() => ({}));
    const fBan = await fBanRes.json().catch(() => ({}));

    const banMap = new Map();
    (fBan.players || []).forEach((b: any) => {
      banMap.set(b.SteamId, Boolean(b.VACBanned || b.NumberOfVACBans > 0));
    });

    let bannedCount = 0;
    const friends = (fSum?.response?.players || []).map((p: any) => {
      const isBanned = banMap.get(p.steamid) || false;
      if (isBanned) bannedCount++;
      return {
        steamid: p.steamid,
        personaname: p.personaname,
        avatar: p.avatar,
        vacBanned: isBanned
      };
    });

    return {
      totalFriends: rawFriends.length,
      bannedFriendsCount: bannedCount,
      friends,
      privateNetwork: false
    };
  } catch {
    return { totalFriends: 0, bannedFriendsCount: 0, friends: [], privateNetwork: true };
  }
}
