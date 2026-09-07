import { NextRequest } from 'next/server';
import { AuthSyncSchema } from '@/lib/schemas';
import { successResponse, errorResponse, handleApiError } from '@/lib/apiResponse';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { steamId, authCode, knownCode } = AuthSyncSchema.parse(body);

    const client = await clientPromise;
    const db = client.db('cs2pulse');
    const usersCollection = db.collection('users');

    await usersCollection.updateOne(
      { steamId },
      {
        $set: {
          steamId,
          authCode,
          knownCode: knownCode || null,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return successResponse({ message: 'Authentication code synced successfully', steamId });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
