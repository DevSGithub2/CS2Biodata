const STEAM_KEY = process.env.STEAM_API_KEY || "";

export async function resolveToSteamId64(query: string): Promise<string> {
  let clean = decodeURIComponent(query).trim();

  // 1. Extract SteamID64 or vanity name from full URLs
  if (clean.includes("steamcommunity.com")) {
    const profilesMatch = clean.match(/\/profiles\/(\d{17})/);
    if (profilesMatch) return profilesMatch[1];

    const idMatch = clean.match(/\/id\/([^/?#]+)/);
    if (idMatch) clean = idMatch[1];
  }

  // 2. Direct 17-digit SteamID64
  const digitsOnlyMatch = clean.match(/\b(7656119\d{10})\b/);
  if (digitsOnlyMatch) {
    return digitsOnlyMatch[1];
  }

  // 3. Resolve Vanity Custom URL through Steam API
  try {
    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_KEY}&vanityurl=${encodeURIComponent(clean)}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    if (data.response?.success === 1 && data.response.steamid) {
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
      console.warn(`[Steam Summary Warning] No player found for steamId: ${steamId64}`);
    }

    const numVacBans = bans?.NumberOfVACBans || 0;
    const numGameBans = bans?.NumberOfGameBans || 0;
    const isVacBanned = Boolean(bans?.VACBanned) || numVacBans > 0;
    const isGameBanned = numGameBans > 0;

    return {
      steamId64,
      personaName: player?.personaname || "Unknown Player",
      profileUrl: player?.profileurl || `https://steamcommunity.com/profiles/${steamId64}`,
      avatar: player?.avatarfull || player?.avatar || "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
      country: player?.loccountrycode || "GLOBAL",
      timeCreated: player?.timecreated || null,
      isPublic: player ? player.communityvisibilitystate === 3 : false,
      bans: {
        vacBanned: isVacBanned,
        numberOfVacBans: numVacBans,
        numberOfGameBans: numGameBans,
        gameBanned: isGameBanned,
        hasBan: isVacBanned || isGameBanned,
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
      bans: {
        vacBanned: false,
        numberOfVacBans: 0,
        numberOfGameBans: 0,
        gameBanned: false,
        hasBan: false,
        daysSinceLastBan: 0,
        communityBanned: false,
        economyBan: "none"
      }
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
      banMap.set(b.SteamId, Boolean(b.VACBanned || b.NumberOfVACBans > 0 || b.NumberOfGameBans > 0));
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


export async function getPlayerExtraSteamTelemetry(steamId64: string, apiKey: string) {
  try {
    const [gamesRes, friendsRes] = await Promise.all([
      fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId64}&include_played_free_games=1&format=json`,
        { next: { revalidate: 1800 } }
      ).catch(() => null),
      fetch(
        `https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=${apiKey}&steamid=${steamId64}&relationship=friend`,
        { next: { revalidate: 1800 } }
      ).catch(() => null)
    ]);

    let playtimeHours = null;
    let friendsCount = null;

    if (gamesRes && gamesRes.ok) {
      const gData = await gamesRes.json();
      const cs2 = (gData.response?.games || []).find((g: any) => g.appid === 730);
      if (cs2 && typeof cs2.playtime_forever === "number" && cs2.playtime_forever > 0) {
        playtimeHours = Math.round(cs2.playtime_forever / 60);
      }
    }

    // Community XML fallback if API playtime was marked private
    if (!playtimeHours) {
      try {
        const xmlRes = await fetch(`https://steamcommunity.com/profiles/${steamId64}/games?xml=1`, {
          headers: { "User-Agent": "Mozilla/5.0" },
          next: { revalidate: 3600 }
        });
        if (xmlRes.ok) {
          const xmlText = await xmlRes.text();
          const match = xmlText.match(/<appID>730<\/appID>[\s\S]*?<hoursOnRecord>([0-9.,]+)<\/hoursOnRecord>/);
          if (match && match[1]) {
            playtimeHours = Math.round(parseFloat(match[1].replace(/,/g, "")));
          }
        }
      } catch (e) {}
    }

    if (friendsRes && friendsRes.ok) {
      const fData = await friendsRes.json();
      if (Array.isArray(fData.friendslist?.friends)) {
        friendsCount = fData.friendslist.friends.length;
      }
    }

    return { playtimeHours, friendsCount };
  } catch (err) {
    console.error("[Steam Telemetry Fetch Error]:", err);
    return { playtimeHours: null, friendsCount: null };
  }
}
