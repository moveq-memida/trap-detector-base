import { NextResponse } from 'next/server';
import type { StatusResponse } from '@/types';
import { checkRpcHealth } from '@/lib/rpc/base';

export async function GET(): Promise<NextResponse<StatusResponse>> {
  const rpcConnected = await checkRpcHealth();

  return NextResponse.json({
    status: rpcConnected ? 'operational' : 'degraded',
    rpcConnected,
    lastCheck: new Date().toISOString(),
  });
}
