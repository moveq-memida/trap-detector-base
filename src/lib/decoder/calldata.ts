import { decodeFunctionData, type Address, type Hex } from 'viem';
import type { DecodedCalldata } from '@/types';
import {
  APPROVAL_FUNCTIONS_ABI,
  APPROVE_SELECTOR,
  SET_APPROVAL_FOR_ALL_SELECTOR,
  INCREASE_ALLOWANCE_SELECTOR,
  DECREASE_ALLOWANCE_SELECTOR,
  SELECTOR_TO_NAME,
} from './signatures';

export interface DecodeCalldataResult {
  success: boolean;
  decoded?: DecodedCalldata;
  error?: string;
}

// Decode calldata for approval-related functions
export function decodeCalldata(
  calldata: Hex,
  to?: Address
): DecodeCalldataResult {
  if (!calldata || calldata.length < 10) {
    return {
      success: false,
      error: 'Invalid calldata: too short',
    };
  }

  const selector = calldata.slice(0, 10).toLowerCase() as Hex;

  // Check if it's a known approval function
  const functionName = SELECTOR_TO_NAME[selector];
  if (!functionName) {
    return {
      success: false,
      error: `Unknown function selector: ${selector}`,
    };
  }

  try {
    const { functionName: decodedName, args } = decodeFunctionData({
      abi: APPROVAL_FUNCTIONS_ABI,
      data: calldata,
    });

    const decoded = buildDecodedCalldata(decodedName, args, selector, to);
    return {
      success: true,
      decoded,
    };
  } catch (e) {
    return {
      success: false,
      error: `Failed to decode calldata: ${e instanceof Error ? e.message : 'Unknown error'}`,
    };
  }
}

function buildDecodedCalldata(
  functionName: string,
  args: readonly unknown[],
  selector: Hex,
  to?: Address
): DecodedCalldata {
  switch (selector) {
    case APPROVE_SELECTOR:
      return {
        functionName: 'approve',
        functionSelector: selector,
        args: {
          spender: args[0] as Address,
          amount: (args[1] as bigint).toString(),
          tokenContract: to,
        },
      };

    case SET_APPROVAL_FOR_ALL_SELECTOR:
      return {
        functionName: 'setApprovalForAll',
        functionSelector: selector,
        args: {
          operator: args[0] as Address,
          approved: args[1] as boolean,
          nftContract: to,
        },
      };

    case INCREASE_ALLOWANCE_SELECTOR:
      return {
        functionName: 'increaseAllowance',
        functionSelector: selector,
        args: {
          spender: args[0] as Address,
          addedValue: (args[1] as bigint).toString(),
          tokenContract: to,
        },
      };

    case DECREASE_ALLOWANCE_SELECTOR:
      return {
        functionName: 'decreaseAllowance',
        functionSelector: selector,
        args: {
          spender: args[0] as Address,
          subtractedValue: (args[1] as bigint).toString(),
          tokenContract: to,
        },
      };

    default:
      return {
        functionName,
        functionSelector: selector,
        args: Object.fromEntries(args.map((arg, i) => [`arg${i}`, String(arg)])),
      };
  }
}

// Helper to check if amount is unlimited (max uint256)
export function isUnlimitedAmount(amount: string | bigint): boolean {
  const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount;
  const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
  return amountBigInt === maxUint256;
}

// Helper to format amount for display
export function formatAmount(amount: string | bigint, decimals: number = 18): string {
  const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount;

  if (isUnlimitedAmount(amountBigInt)) {
    return 'UNLIMITED';
  }

  const divisor = BigInt(10) ** BigInt(decimals);
  const wholePart = amountBigInt / divisor;
  const fractionalPart = amountBigInt % divisor;

  if (fractionalPart === BigInt(0)) {
    return wholePart.toString();
  }

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');

  return `${wholePart}.${trimmedFractional}`;
}
