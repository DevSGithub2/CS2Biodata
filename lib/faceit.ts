export async function getFaceitPlayerStats(nickname: string) {
  const apiKey = process.env.FACEIT_API_KEY || "2b0d2e13-4ed0-43f3-9e1a-0b7a6736ca92";
  const res = await fetch(`https://open.faceit.com/data/v4/players?nickname=${nickname}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Faceit API error: ${res.statusText}`);
  }

  const data = await res.json();
  return {
    playerId: data.player_id,
    nickname: data.nickname,
    avatar: data.avatar,
    country: data.country,
    cs2Elo: data.games?.cs2?.faceit_elo || 0,
    cs2SkillLevel: data.games?.cs2?.skill_level || 0,
    steamId64: data.steam_id_64,
  };
}
