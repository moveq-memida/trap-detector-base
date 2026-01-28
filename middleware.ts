import { paymentProxy } from '@x402/next';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { x402ResourceServer, HTTPFacilitatorClient } from '@x402/core/server';
import { isX402Configured, X402_CONFIG, PAYMENT_DESCRIPTION, PAYMENT_MIME_TYPE } from '@/lib/x402/config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Only apply paywall if x402 is configured
function createMiddleware() {
  if (!isX402Configured()) {
    // Return pass-through middleware when not configured
    return (request: NextRequest) => {
      // Add header to indicate x402 is not configured
      const response = NextResponse.next();
      response.headers.set('X-X402-Status', 'not-configured');
      return response;
    };
  }

  const facilitatorClient = new HTTPFacilitatorClient({
    url: X402_CONFIG.facilitatorUrl,
  });

  const server = new x402ResourceServer(facilitatorClient).register(
    X402_CONFIG.network,
    new ExactEvmScheme()
  );

  return paymentProxy(
    {
      '/api/v1/analyze': {
        accepts: [
          {
            scheme: 'exact',
            price: X402_CONFIG.price,
            network: X402_CONFIG.network,
            payTo: X402_CONFIG.payTo,
          },
        ],
        description: PAYMENT_DESCRIPTION,
        mimeType: PAYMENT_MIME_TYPE,
      },
    },
    server
  );
}

export const middleware = createMiddleware();

export const config = {
  matcher: ['/api/v1/analyze'],
};
