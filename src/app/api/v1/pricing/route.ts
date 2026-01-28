import { NextResponse } from 'next/server';
import type { PricingResponse } from '@/types';
import { X402_CONFIG, PAYMENT_DESCRIPTION } from '@/lib/x402/config';

export async function GET(): Promise<NextResponse<PricingResponse>> {
  return NextResponse.json({
    price: X402_CONFIG.price,
    currency: 'USD',
    network: X402_CONFIG.network,
    description: PAYMENT_DESCRIPTION,
  });
}
