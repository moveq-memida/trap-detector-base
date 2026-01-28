// x402 Payment Configuration

export const X402_CONFIG = {
  // Default values (can be overridden by environment variables)
  price: process.env.X402_PRICE || '$0.05',
  network: (process.env.X402_NETWORK || 'eip155:8453') as `${string}:${string}`, // Base Mainnet
  payTo: (process.env.X402_PAYTO || '') as `0x${string}`,
  facilitatorUrl: process.env.X402_FACILITATOR_URL || 'https://api.cdp.coinbase.com/platform/v2/x402',
};

export const PAYMENT_DESCRIPTION = 'Analyze transaction signature for security risks';
export const PAYMENT_MIME_TYPE = 'application/json';

// Protected routes that require payment
export const PROTECTED_ROUTES = ['/api/v1/analyze'];

// Check if x402 is properly configured
export function isX402Configured(): boolean {
  return Boolean(
    process.env.X402_PAYTO &&
    process.env.X402_NETWORK &&
    process.env.X402_FACILITATOR_URL
  );
}
