import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';
import { ZodError } from 'zod';

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, data },
    { status }
  );
}

export function errorResponse(message: string, status = 400, code = 'BAD_REQUEST', details?: unknown) {
  return NextResponse.json<ApiResponse<never>>(
    {
      success: false,
      error: { message, code, details },
    },
    { status }
  );
}

export function handleApiError(err: unknown) {
  console.error('[API Error]:', err);

  if (err instanceof ZodError) {
    return errorResponse('Validation Error', 422, 'VALIDATION_ERROR', err.issues);
  }

  if (err instanceof Error) {
    return errorResponse(err.message, 500, 'INTERNAL_SERVER_ERROR');
  }

  return errorResponse('An unexpected error occurred', 500, 'INTERNAL_SERVER_ERROR');
}
