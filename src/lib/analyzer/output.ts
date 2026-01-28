import type {
  AnalyzeResponse,
  DecodedCalldata,
  DecodedTypedData,
  RiskSignal,
  Language,
} from '@/types';
import type { PermitDetails } from '../decoder/typedData';
import { formatAmount, isUnlimitedAmount } from '../decoder/calldata';
import { formatDeadline } from '../decoder/typedData';

// Recommended checks based on risk signals
const RECOMMENDED_CHECKS: Record<Language, Record<string, string>> = {
  ja: {
    UNLIMITED_APPROVAL: 'Set approval to only what you need. Unlimited = unlimited risk.',
    APPROVAL_FOR_ALL_TRUE: 'Do you really need to approve the entire collection?',
    UNKNOWN_SPENDER_CONTRACT: 'Verify this contract on Basescan before you approve.',
    TYPEDDATA_DOMAIN_MISMATCH: 'Double-check the URL. Phishers love lookalike domains.',
    UNCLEAR_INTENT: 'Ask the sender what this tx is actually for.',
    PERMIT_TO_UNKNOWN: 'Verify where this permit is going.',
    HIGH_VALUE_APPROVAL: 'Confirm this amount is actually necessary.',
    EOA_SPENDER: 'Why is this going to a wallet instead of a contract?',
    DEFAULT: 'Read the fine print. Every tx deserves a second look.',
  },
  en: {
    UNLIMITED_APPROVAL: 'Set approval to only what you need. Unlimited = unlimited risk.',
    APPROVAL_FOR_ALL_TRUE: 'Do you really need to approve the entire collection?',
    UNKNOWN_SPENDER_CONTRACT: 'Verify this contract on Basescan before you approve.',
    TYPEDDATA_DOMAIN_MISMATCH: 'Double-check the URL. Phishers love lookalike domains.',
    UNCLEAR_INTENT: 'Ask the sender what this tx is actually for.',
    PERMIT_TO_UNKNOWN: 'Verify where this permit is going.',
    HIGH_VALUE_APPROVAL: 'Confirm this amount is actually necessary.',
    EOA_SPENDER: 'Why is this going to a wallet instead of a contract?',
    DEFAULT: 'Read the fine print. Every tx deserves a second look.',
  },
};

// Safe alternatives based on risk signals
const SAFE_ALTERNATIVES: Record<Language, Record<string, string>> = {
  ja: {
    UNLIMITED_APPROVAL: 'Approve only what you need. 1.1x the swap amount is plenty.',
    APPROVAL_FOR_ALL_TRUE: 'Approve individual NFTs instead of the whole collection.',
    UNKNOWN_SPENDER_CONTRACT: 'Go to the official site and connect from there.',
    TYPEDDATA_DOMAIN_MISMATCH: 'Type the URL manually. Bookmark the real ones.',
    PERMIT_TO_UNKNOWN: 'Use the dApp directly instead of signing random permits.',
    DEFAULT: 'Use revoke.cash to clean up old approvals regularly.',
  },
  en: {
    UNLIMITED_APPROVAL: 'Approve only what you need. 1.1x the swap amount is plenty.',
    APPROVAL_FOR_ALL_TRUE: 'Approve individual NFTs instead of the whole collection.',
    UNKNOWN_SPENDER_CONTRACT: 'Go to the official site and connect from there.',
    TYPEDDATA_DOMAIN_MISMATCH: 'Type the URL manually. Bookmark the real ones.',
    PERMIT_TO_UNKNOWN: 'Use the dApp directly instead of signing random permits.',
    DEFAULT: 'Use revoke.cash to clean up old approvals regularly.',
  },
};

// Generate summary based on decoded data and risks
function generateSummary(
  decoded: DecodedCalldata | DecodedTypedData | null,
  risks: RiskSignal[],
  permitDetails: PermitDetails | undefined,
  lang: Language
): string {
  const highRisks = risks.filter((r) => r.severity === 'critical' || r.severity === 'high');

  if (highRisks.length > 0) {
    return `🚨 ${highRisks.length} critical risk${highRisks.length > 1 ? 's' : ''} found. Do not sign without reviewing.`;
  }
  if (risks.length > 0) {
    return `⚠️ ${risks.length} flag${risks.length > 1 ? 's' : ''} detected. Check the details before signing.`;
  }
  return '✅ Looks clean, but always verify before you sign.';
}

// Generate recommended checks based on risks
function generateRecommendedChecks(
  risks: RiskSignal[],
  lang: Language
): string[] {
  const checks = new Set<string>();

  for (const risk of risks) {
    const check = RECOMMENDED_CHECKS[lang][risk.id];
    if (check) {
      checks.add(check);
    }
  }

  // Always add default check
  checks.add(RECOMMENDED_CHECKS[lang].DEFAULT);

  return Array.from(checks);
}

// Generate safe alternatives based on risks
function generateSafeAlternatives(
  risks: RiskSignal[],
  lang: Language
): string[] {
  const alternatives = new Set<string>();

  for (const risk of risks) {
    const alt = SAFE_ALTERNATIVES[lang][risk.id];
    if (alt) {
      alternatives.add(alt);
    }
  }

  // Always add default alternative
  alternatives.add(SAFE_ALTERNATIVES[lang].DEFAULT);

  return Array.from(alternatives);
}

// Generate Twitter share draft
function generateTwitterDraft(
  decoded: DecodedCalldata | DecodedTypedData | null,
  risks: RiskSignal[],
  lang: Language
): string {
  const highRisks = risks.filter((r) => r.severity === 'critical' || r.severity === 'high');

  if (highRisks.length > 0) {
    return `🚨 Trap Detector just saved my wallet

Found ${highRisks.length} critical risk${highRisks.length > 1 ? 's' : ''}:
${highRisks.map((r) => `• ${r.title}`).join('\n')}

Check your txs before you wreck your txs
#TrapDetector #Base`;
  }
  return `✅ Clean tx verified by Trap Detector

Not today, scammers
#TrapDetector #Base`;
}

// Build full analysis response
export function buildAnalyzeResponse(
  decoded: DecodedCalldata | DecodedTypedData | null,
  risks: RiskSignal[],
  lang: Language,
  permitDetails?: PermitDetails
): AnalyzeResponse {
  return {
    summary: generateSummary(decoded, risks, permitDetails, lang),
    decodedDetails: decoded,
    riskSignals: risks,
    recommendedChecks: generateRecommendedChecks(risks, lang),
    safeAlternatives: generateSafeAlternatives(risks, lang),
    shareDrafts: {
      twitter: generateTwitterDraft(decoded, risks, lang),
    },
  };
}

// Format decoded calldata for display
export function formatDecodedCalldata(
  decoded: DecodedCalldata,
  lang: Language
): string {
  const { functionName, args } = decoded;

  switch (functionName) {
    case 'approve':
      const amount = args.amount as string;
      const amountDisplay = isUnlimitedAmount(amount) ? 'UNLIMITED ⚠️' : formatAmount(amount);
      return `Function: approve\nSpender: ${args.spender}\nAmount: ${amountDisplay}`;
    case 'setApprovalForAll':
      return `Function: setApprovalForAll\nOperator: ${args.operator}\nApproved: ${args.approved ? 'YES' : 'NO'}`;
    default:
      return `Function: ${functionName}\nArgs: ${JSON.stringify(args, null, 2)}`;
  }
}

// Format permit details for display
export function formatPermitDetails(
  details: PermitDetails,
  lang: Language
): string {
  const valueDisplay = details.isUnlimited ? 'UNLIMITED ⚠️' : formatAmount(details.value);
  const deadlineDisplay = formatDeadline(details.deadline);

  return `Type: EIP-2612 Permit
Token: ${details.tokenName || 'Unknown'}
Owner: ${details.owner}
Spender: ${details.spender}
Value: ${valueDisplay}
Deadline: ${deadlineDisplay}`;
}
