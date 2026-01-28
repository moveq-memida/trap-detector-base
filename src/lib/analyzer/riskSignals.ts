import type { Address } from 'viem';
import type { RiskSignal, RiskSignalId, Language, DecodedCalldata, DecodedTypedData } from '@/types';
import { isUnlimitedAmount } from '../decoder/calldata';
import type { PermitDetails } from '../decoder/typedData';
import { isContract } from '../rpc/base';
import { MAX_UINT256_STRING, HIGH_VALUE_THRESHOLD } from '../decoder/signatures';

// Risk signal definitions with translations
const RISK_DEFINITIONS: Record<RiskSignalId, {
  severity: RiskSignal['severity'];
  title: { ja: string; en: string };
  description: { ja: string; en: string };
}> = {
  UNLIMITED_APPROVAL: {
    severity: 'critical',
    title: {
      ja: 'Unlimited Approval',
      en: 'Unlimited Approval',
    },
    description: {
      ja: 'Unlimited token access requested. Bad actor could drain your entire wallet.',
      en: 'Unlimited token access requested. Bad actor could drain your entire wallet.',
    },
  },
  APPROVAL_FOR_ALL_TRUE: {
    severity: 'critical',
    title: {
      ja: 'Approval for All NFTs',
      en: 'Approval for All NFTs',
    },
    description: {
      ja: 'Grants access to EVERY NFT in this collection. They can yeet all of them.',
      en: 'Grants access to EVERY NFT in this collection. They can yeet all of them.',
    },
  },
  UNKNOWN_SPENDER_CONTRACT: {
    severity: 'high',
    title: {
      ja: 'Unknown Contract',
      en: 'Unknown Contract',
    },
    description: {
      ja: 'Spender is an unverified contract. Could be a honeypot or drainer.',
      en: 'Spender is an unverified contract. Could be a honeypot or drainer.',
    },
  },
  TYPEDDATA_DOMAIN_MISMATCH: {
    severity: 'high',
    title: {
      ja: 'Domain Mismatch',
      en: 'Domain Mismatch',
    },
    description: {
      ja: 'Signature domain looks sus. Classic phishing red flag.',
      en: 'Signature domain looks sus. Classic phishing red flag.',
    },
  },
  UNCLEAR_INTENT: {
    severity: 'medium',
    title: {
      ja: 'Unclear Intent',
      en: 'Unclear Intent',
    },
    description: {
      ja: 'Transaction purpose is murky. Get clarity before you sign.',
      en: 'Transaction purpose is murky. Get clarity before you sign.',
    },
  },
  PERMIT_TO_UNKNOWN: {
    severity: 'high',
    title: {
      ja: 'Permit to Unknown',
      en: 'Permit to Unknown',
    },
    description: {
      ja: 'Permit going to unknown address. Smells like a phishing attempt.',
      en: 'Permit going to unknown address. Smells like a phishing attempt.',
    },
  },
  HIGH_VALUE_APPROVAL: {
    severity: 'medium',
    title: {
      ja: 'High Value Approval',
      en: 'High Value Approval',
    },
    description: {
      ja: 'Big bag approval. Make sure this amount is actually needed.',
      en: 'Big bag approval. Make sure this amount is actually needed.',
    },
  },
  EOA_SPENDER: {
    severity: 'medium',
    title: {
      ja: 'Approval to EOA',
      en: 'Approval to EOA',
    },
    description: {
      ja: 'Spender is a wallet, not a contract. Legit dApps use contracts.',
      en: 'Spender is a wallet, not a contract. Legit dApps use contracts.',
    },
  },
};

// Analyze decoded calldata for risks
export async function analyzeCalldataRisks(
  decoded: DecodedCalldata,
  lang: Language = 'en'
): Promise<RiskSignal[]> {
  const risks: RiskSignal[] = [];

  const { functionName, args } = decoded;

  if (functionName === 'approve') {
    const amount = args.amount as string;
    const spender = args.spender as Address;

    // Check for unlimited approval
    if (isUnlimitedAmount(amount) || amount === MAX_UINT256_STRING) {
      risks.push(createRiskSignal('UNLIMITED_APPROVAL', lang));
    } else if (BigInt(amount) > HIGH_VALUE_THRESHOLD) {
      // Check for high value approval
      risks.push(createRiskSignal('HIGH_VALUE_APPROVAL', lang));
    }

    // Check if spender is a contract
    const spenderIsContract = await isContract(spender);
    if (!spenderIsContract) {
      risks.push(createRiskSignal('EOA_SPENDER', lang));
    }
  }

  if (functionName === 'setApprovalForAll') {
    const approved = args.approved as boolean;
    const operator = args.operator as Address;

    if (approved) {
      risks.push(createRiskSignal('APPROVAL_FOR_ALL_TRUE', lang));
    }

    // Check if operator is a contract
    const operatorIsContract = await isContract(operator);
    if (!operatorIsContract) {
      risks.push(createRiskSignal('EOA_SPENDER', lang));
    }
  }

  if (functionName === 'increaseAllowance') {
    const addedValue = args.addedValue as string;
    if (isUnlimitedAmount(addedValue)) {
      risks.push(createRiskSignal('UNLIMITED_APPROVAL', lang));
    }
  }

  return risks;
}

// Analyze permit for risks
export async function analyzePermitRisks(
  permitDetails: PermitDetails,
  lang: Language = 'en'
): Promise<RiskSignal[]> {
  const risks: RiskSignal[] = [];

  // Check for unlimited permit
  if (permitDetails.isUnlimited) {
    risks.push(createRiskSignal('UNLIMITED_APPROVAL', lang));
  } else if (BigInt(permitDetails.value) > HIGH_VALUE_THRESHOLD) {
    risks.push(createRiskSignal('HIGH_VALUE_APPROVAL', lang));
  }

  // Check if spender is a contract
  const spenderIsContract = await isContract(permitDetails.spender);
  if (!spenderIsContract) {
    risks.push(createRiskSignal('PERMIT_TO_UNKNOWN', lang));
  }

  return risks;
}

// Analyze typed data for risks (non-permit)
export async function analyzeTypedDataRisks(
  decoded: DecodedTypedData,
  lang: Language = 'en'
): Promise<RiskSignal[]> {
  const risks: RiskSignal[] = [];

  // Check for missing or suspicious domain
  if (!decoded.domain.verifyingContract) {
    risks.push(createRiskSignal('TYPEDDATA_DOMAIN_MISMATCH', lang));
  }

  if (!decoded.domain.chainId) {
    risks.push(createRiskSignal('UNCLEAR_INTENT', lang));
  }

  return risks;
}

// Analyze approval input for risks
export async function analyzeApprovalRisks(
  token: Address,
  spender: Address,
  amount: string,
  lang: Language = 'en'
): Promise<RiskSignal[]> {
  const risks: RiskSignal[] = [];

  // Check for unlimited approval
  if (amount === 'unlimited' || isUnlimitedAmount(amount)) {
    risks.push(createRiskSignal('UNLIMITED_APPROVAL', lang));
  } else {
    try {
      if (BigInt(amount) > HIGH_VALUE_THRESHOLD) {
        risks.push(createRiskSignal('HIGH_VALUE_APPROVAL', lang));
      }
    } catch {
      // Invalid amount format
    }
  }

  // Check if spender is a contract
  const spenderIsContract = await isContract(spender);
  if (!spenderIsContract) {
    risks.push(createRiskSignal('EOA_SPENDER', lang));
  }

  return risks;
}

// Helper to create risk signal with translations
function createRiskSignal(id: RiskSignalId, lang: Language): RiskSignal {
  const def = RISK_DEFINITIONS[id];
  return {
    id,
    severity: def.severity,
    title: def.title[lang],
    description: def.description[lang],
  };
}

// Get all risk definitions (for documentation)
export function getAllRiskDefinitions(): typeof RISK_DEFINITIONS {
  return RISK_DEFINITIONS;
}
