import type { AnalyzeMetrics, AnalyzeMode, Language, RiskSignalId } from '@/types';

// In-memory metrics store
// Note: This will reset on server restart. For production, use a persistent store.
const metrics: AnalyzeMetrics = {
  totalRequests: 0,
  requestsByMode: {
    calldata: 0,
    typedData: 0,
    approval: 0,
  },
  requestsByLang: {
    ja: 0,
    en: 0,
  },
  riskSignalCounts: {
    UNLIMITED_APPROVAL: 0,
    APPROVAL_FOR_ALL_TRUE: 0,
    UNKNOWN_SPENDER_CONTRACT: 0,
    TYPEDDATA_DOMAIN_MISMATCH: 0,
    UNCLEAR_INTENT: 0,
    PERMIT_TO_UNKNOWN: 0,
    HIGH_VALUE_APPROVAL: 0,
    EOA_SPENDER: 0,
  },
  recentRequests: [],
};

const MAX_RECENT_REQUESTS = 100;

// Record a new request
export function recordRequest(
  mode: AnalyzeMode,
  lang: Language,
  riskCount: number,
  riskIds?: RiskSignalId[]
): void {
  metrics.totalRequests++;
  metrics.requestsByMode[mode]++;
  metrics.requestsByLang[lang]++;

  // Record risk signals
  if (riskIds) {
    for (const id of riskIds) {
      if (id in metrics.riskSignalCounts) {
        metrics.riskSignalCounts[id]++;
      }
    }
  }

  // Add to recent requests
  metrics.recentRequests.unshift({
    timestamp: Date.now(),
    mode,
    riskCount,
  });

  // Keep only recent requests
  if (metrics.recentRequests.length > MAX_RECENT_REQUESTS) {
    metrics.recentRequests = metrics.recentRequests.slice(0, MAX_RECENT_REQUESTS);
  }
}

// Get current metrics
export function getMetrics(): AnalyzeMetrics {
  return { ...metrics };
}

// Get requests in last N minutes
export function getRecentRequestCount(minutes: number = 60): number {
  const cutoff = Date.now() - minutes * 60 * 1000;
  return metrics.recentRequests.filter((r) => r.timestamp > cutoff).length;
}

// Get average risk count per request
export function getAverageRiskCount(): number {
  if (metrics.totalRequests === 0) return 0;
  const totalRisks = metrics.recentRequests.reduce((sum, r) => sum + r.riskCount, 0);
  return totalRisks / metrics.recentRequests.length;
}

// Reset metrics (for testing)
export function resetMetrics(): void {
  metrics.totalRequests = 0;
  metrics.requestsByMode = { calldata: 0, typedData: 0, approval: 0 };
  metrics.requestsByLang = { ja: 0, en: 0 };
  metrics.riskSignalCounts = {
    UNLIMITED_APPROVAL: 0,
    APPROVAL_FOR_ALL_TRUE: 0,
    UNKNOWN_SPENDER_CONTRACT: 0,
    TYPEDDATA_DOMAIN_MISMATCH: 0,
    UNCLEAR_INTENT: 0,
    PERMIT_TO_UNKNOWN: 0,
    HIGH_VALUE_APPROVAL: 0,
    EOA_SPENDER: 0,
  };
  metrics.recentRequests = [];
}
