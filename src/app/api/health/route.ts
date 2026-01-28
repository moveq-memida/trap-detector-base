import { NextResponse } from 'next/server';
import type { HealthResponse } from '@/types';

const VERSION = '1.0.0';

export async function GET(): Promise<NextResponse<HealthResponse>> {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: VERSION,
  });
}
