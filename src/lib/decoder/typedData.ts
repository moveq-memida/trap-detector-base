import type { Address } from 'viem';
import type { EIP712TypedData, DecodedTypedData, EIP712Domain } from '@/types';

export interface DecodeTypedDataResult {
  success: boolean;
  decoded?: DecodedTypedData;
  error?: string;
  isPermit?: boolean;
  permitDetails?: PermitDetails;
}

export interface PermitDetails {
  owner: Address;
  spender: Address;
  value: string;
  nonce: string;
  deadline: string;
  tokenName?: string;
  tokenAddress?: Address;
  isUnlimited: boolean;
}

// Standard EIP-2612 Permit type structure
const PERMIT_TYPE_FIELDS = ['owner', 'spender', 'value', 'nonce', 'deadline'];

// Decode EIP-712 typed data
export function decodeTypedData(
  typedData: EIP712TypedData
): DecodeTypedDataResult {
  try {
    // Validate basic structure
    if (!typedData.types || !typedData.primaryType || !typedData.domain || !typedData.message) {
      return {
        success: false,
        error: 'Invalid typed data structure: missing required fields',
      };
    }

    const decoded: DecodedTypedData = {
      primaryType: typedData.primaryType,
      domain: typedData.domain,
      message: typedData.message,
    };

    // Check if this is a Permit signature
    const isPermit = checkIsPermit(typedData);

    if (isPermit) {
      const permitDetails = extractPermitDetails(typedData);
      return {
        success: true,
        decoded,
        isPermit: true,
        permitDetails,
      };
    }

    return {
      success: true,
      decoded,
      isPermit: false,
    };
  } catch (e) {
    return {
      success: false,
      error: `Failed to decode typed data: ${e instanceof Error ? e.message : 'Unknown error'}`,
    };
  }
}

// Check if typed data is an EIP-2612 Permit
function checkIsPermit(typedData: EIP712TypedData): boolean {
  // Check primary type
  if (typedData.primaryType !== 'Permit') {
    return false;
  }

  // Check if Permit type exists
  const permitType = typedData.types['Permit'];
  if (!permitType) {
    return false;
  }

  // Check if all required fields exist
  const fieldNames = permitType.map((f) => f.name);
  return PERMIT_TYPE_FIELDS.every((field) => fieldNames.includes(field));
}

// Extract Permit details from typed data
function extractPermitDetails(typedData: EIP712TypedData): PermitDetails {
  const message = typedData.message;
  const domain = typedData.domain;

  const value = String(message.value);
  const maxUint256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
  const isUnlimited = value === maxUint256 || BigInt(value) === BigInt(maxUint256);

  return {
    owner: message.owner as Address,
    spender: message.spender as Address,
    value,
    nonce: String(message.nonce),
    deadline: String(message.deadline),
    tokenName: domain.name,
    tokenAddress: domain.verifyingContract,
    isUnlimited,
  };
}

// Validate EIP-712 domain
export function validateDomain(domain: EIP712Domain): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (!domain.name) {
    warnings.push('Domain name is missing');
  }

  if (!domain.verifyingContract) {
    warnings.push('Verifying contract address is missing');
  }

  if (domain.chainId === undefined) {
    warnings.push('Chain ID is missing - signature may be replayable on other chains');
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

// Check if deadline is expired or about to expire
export function checkDeadline(deadline: string | number): {
  expired: boolean;
  expiresIn?: number; // seconds
  warning?: string;
} {
  const deadlineNum = typeof deadline === 'string' ? parseInt(deadline, 10) : deadline;
  const now = Math.floor(Date.now() / 1000);

  if (deadlineNum < now) {
    return {
      expired: true,
      warning: 'Permit deadline has already expired',
    };
  }

  const expiresIn = deadlineNum - now;

  // Warn if expires in less than 1 hour
  if (expiresIn < 3600) {
    return {
      expired: false,
      expiresIn,
      warning: `Permit expires in ${Math.floor(expiresIn / 60)} minutes`,
    };
  }

  // Warn if deadline is very far in the future (potential permanent permit)
  const oneYear = 365 * 24 * 60 * 60;
  if (expiresIn > oneYear) {
    return {
      expired: false,
      expiresIn,
      warning: 'Permit has a very long deadline (>1 year)',
    };
  }

  return {
    expired: false,
    expiresIn,
  };
}

// Format deadline for display
export function formatDeadline(deadline: string | number): string {
  const deadlineNum = typeof deadline === 'string' ? parseInt(deadline, 10) : deadline;

  // Check for max uint256 or very large values (essentially "never expires")
  const maxUint256 = BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935');
  if (BigInt(deadlineNum) >= maxUint256 / BigInt(2)) {
    return 'Never (infinite deadline)';
  }

  const date = new Date(deadlineNum * 1000);
  return date.toLocaleString();
}
