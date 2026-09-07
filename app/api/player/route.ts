import { NextRequest } from 'next/server';
import { PlayerQuerySchema } from '@/lib/schemas';
import { successResponse, errorResponse, handleApiError } from '@/lib/apiResponse';
import { PlayerSummary } from '@/types/cs2';

export const dynamic = 'force-dynamic';

async function resolveToSteamId64(rawQuery: string, apiKey: string): Promise<string | null> {
  const clean = rawQuery.trim().replace(/\/+$/, '');

  // 1. Direct 17-digit SteamID64
  if (/^\d{17}$/.test(clean)) {
    return clean;
  }

  // 2. Profile URL Regex Extraction
  const idMatch = clean.match(/\/id\/([^/]+)/);
  const profilesMatch = clean.match(/\/profiles\/(\d{17})/);

  if (profilesMatch) return profilesMatch[1];

  const vanityName = idMatch ? idMatch[1] : clean;

  // 3. Resolve Custom Vanity URL using Valve API
  try {
    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${apiKey}&vanityurl=${encodeURIComponent(vanityName)}`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const json = await res.json();
      if (json.response?.success === 1 && json.response?.steamid) {
        return json.response.steamid;
      }
    }
  } catch (err) {
    console.error('Failed to resolve vanity URL:', err);
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQuery = searchParams.get('q') || searchParams.get('steamId') || searchParams.get('id');

    const { q } = PlayerQuerySchema.parse({ q: rawQuery || '' });
    const apiKey = process.env.STEAM_API_KEY;

    if (!apiKey) {
      return errorResponse('STEAM_API_KEY is not configured on the server', 500, 'CONFIG_ERROR');
    }

    const steamId = await resolveToSteamId64(q, apiKey);
    if (!steamId) {
      return errorResponse(`Could not find a Steam profile matching "${q}"`, 404, 'PLAYER_NOT_FOUND');
    }

    const profileRes = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`,
      { next: { revalidate: 120 } }
    );

    if (!profileRes.ok) {
      return errorResponse('Failed to fetch player summary from Valve API', profileRes.status, 'VALVE_API_ERROR');
    }

    const data = await profileRes.json();
    const player: PlayerSummary | undefined = data.response?.players?.[0];

    if (!player) {
      return errorResponse('Player not found on Steam', 404, 'PLAYER_NOT_FOUND');
    }

    return successResponse(player);
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
