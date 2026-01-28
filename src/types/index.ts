// Input types
export type AnalyzeMode = 'calldata' | 'typedData' | 'approval';
export type Language = 'ja' | 'en';

export interface CalldataInput {
  to: `0x${string}`;
  calldata: `0x${string}`;
}

export interface TypedDataInput {
  typedData: EIP712TypedData;
}

export interface ApprovalInput {
  token: `0x${string}`;
  spender: `0x${string}`;
  amount: string | 'unlimited';
}

export interface AnalyzeRequest {
  mode: AnalyzeMode;
  data: CalldataInput | TypedDataInput | ApprovalInput;
  lang?: Language;
}

// EIP-712 types
export interface EIP712TypedData {
  types: {
    EIP712Domain: Array<{ name: string; type: string }>;
    [key: string]: Array<{ name: string; type: string }>;
  };
  primaryType: string;
  domain: EIP712Domain;
  message: Record<string, unknown>;
}

export interface EIP712Domain {
  name?: string;
  version?: string;
  chainId?: number;
  verifyingContract?: `0x${string}`;
  salt?: `0x${string}`;
}

// Decoded result types
export interface DecodedCalldata {
  functionName: string;
  functionSelector: `0x${string}`;
  args: Record<string, unknown>;
}

export interface DecodedTypedData {
  primaryType: string;
  domain: EIP712Domain;
  message: Record<string, unknown>;
}

// Risk signal types
export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type RiskSignalId =
  | 'UNLIMITED_APPROVAL'
  | 'APPROVAL_FOR_ALL_TRUE'
  | 'UNKNOWN_SPENDER_CONTRACT'
  | 'TYPEDDATA_DOMAIN_MISMATCH'
  | 'UNCLEAR_INTENT'
  | 'PERMIT_TO_UNKNOWN'
  | 'HIGH_VALUE_APPROVAL'
  | 'EOA_SPENDER';

export interface RiskSignal {
  id: RiskSignalId;
  severity: RiskSeverity;
  title: string;
  description: string;
}

// Output types
export interface AnalyzeResponse {
  summary: string;
  decodedDetails: DecodedCalldata | DecodedTypedData | null;
  riskSignals: RiskSignal[];
  recommendedChecks: string[];
  safeAlternatives: string[];
  shareDrafts: {
    twitter: string;
  };
}

// Contract info
export interface ContractInfo {
  address: `0x${string}`;
  isContract: boolean;
  name?: string;
  symbol?: string;
  verified?: boolean;
}

// Metrics types
export interface AnalyzeMetrics {
  totalRequests: number;
  requestsByMode: Record<AnalyzeMode, number>;
  requestsByLang: Record<Language, number>;
  riskSignalCounts: Record<RiskSignalId, number>;
  recentRequests: Array<{
    timestamp: number;
    mode: AnalyzeMode;
    riskCount: number;
  }>;
}

// API response wrappers
export interface ApiError {
  error: string;
  code: string;
  details?: string;
}

export interface PricingResponse {
  price: string;
  currency: string;
  network: string;
  description: string;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
}

export interface StatusResponse {
  status: 'operational' | 'degraded' | 'down';
  rpcConnected: boolean;
  lastCheck: string;
}
