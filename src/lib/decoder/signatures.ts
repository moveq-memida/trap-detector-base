import { parseAbi } from 'viem';

// ERC-20 function signatures
export const APPROVE_SELECTOR = '0x095ea7b3' as const;
export const TRANSFER_SELECTOR = '0xa9059cbb' as const;
export const TRANSFER_FROM_SELECTOR = '0x23b872dd' as const;
export const INCREASE_ALLOWANCE_SELECTOR = '0x39509351' as const;
export const DECREASE_ALLOWANCE_SELECTOR = '0xa457c2d7' as const;

// ERC-721/1155 function signatures
export const SET_APPROVAL_FOR_ALL_SELECTOR = '0xa22cb465' as const;
export const SAFE_TRANSFER_FROM_721_SELECTOR = '0x42842e0e' as const;
export const SAFE_TRANSFER_FROM_1155_SELECTOR = '0xf242432a' as const;

// ERC-20 ABI fragments
export const ERC20_ABI = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function increaseAllowance(address spender, uint256 addedValue) returns (bool)',
  'function decreaseAllowance(address spender, uint256 subtractedValue) returns (bool)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
]);

// ERC-721/1155 ABI fragments
export const ERC721_ABI = parseAbi([
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
]);

// Combined ABI for decoding
export const APPROVAL_FUNCTIONS_ABI = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function setApprovalForAll(address operator, bool approved)',
  'function increaseAllowance(address spender, uint256 addedValue) returns (bool)',
  'function decreaseAllowance(address spender, uint256 subtractedValue) returns (bool)',
]);

// EIP-2612 Permit type hash
export const PERMIT_TYPEHASH = 'Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)';

// Function selector to name mapping
export const SELECTOR_TO_NAME: Record<string, string> = {
  [APPROVE_SELECTOR]: 'approve',
  [SET_APPROVAL_FOR_ALL_SELECTOR]: 'setApprovalForAll',
  [TRANSFER_SELECTOR]: 'transfer',
  [TRANSFER_FROM_SELECTOR]: 'transferFrom',
  [INCREASE_ALLOWANCE_SELECTOR]: 'increaseAllowance',
  [DECREASE_ALLOWANCE_SELECTOR]: 'decreaseAllowance',
};

// Max uint256 value (used for unlimited approvals)
export const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
export const MAX_UINT256_STRING = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

// Common threshold for "high value" approval warning (in token decimals)
export const HIGH_VALUE_THRESHOLD = BigInt(10) ** BigInt(24); // 1 million tokens with 18 decimals
