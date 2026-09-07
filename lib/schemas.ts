import { z } from 'zod';

export const SteamIdSchema = z.string().trim().regex(/^\d{17}$/, 'Must be a valid 17-digit SteamID64');

export const PlayerQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query cannot be empty'),
});

export const AuthSyncSchema = z.object({
  steamId: SteamIdSchema,
  authCode: z.string().trim().min(4, 'Authentication code required'),
  knownCode: z.string().trim().optional(),
});
