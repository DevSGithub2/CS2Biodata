import SteamID from "steamid";

export interface ResolvedSteamIdentity {
  isValid: boolean;
  steamID: string;      // STEAM_0:1:458372988
  steamID3: string;     // [U:1:916745983]
  steamID64: string;    // 76561198877011661
  accountID: number;    // 916745983
  profileUrl: string;
}

export function parseAndConvertSteamID(input: string): ResolvedSteamIdentity {
  try {
    const clean = input.trim().replace(/^https?:\/\/(www\.)?steamcommunity\.com\/(id|profiles)\//, "").replace(/\/$/, "");
    const sid = new SteamID(clean);

    if (!sid.isValid()) {
      return {
        isValid: false,
        steamID: "N/A",
        steamID3: "N/A",
        steamID64: clean,
        accountID: 0,
        profileUrl: `https://steamcommunity.com/profiles/${clean}`,
      };
    }

    return {
      isValid: true,
      steamID: sid.getSteam2RenderedID(),
      steamID3: sid.getSteam3RenderedID(),
      steamID64: sid.getSteamID64(),
      accountID: sid.accountid,
      profileUrl: `https://steamcommunity.com/profiles/${sid.getSteamID64()}`,
    };
  } catch {
    return {
      isValid: false,
      steamID: "N/A",
      steamID3: "N/A",
      steamID64: input,
      accountID: 0,
      profileUrl: `https://steamcommunity.com/profiles/${input}`,
    };
  }
}
