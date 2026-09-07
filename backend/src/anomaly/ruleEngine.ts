import type { EnrichedProject, RiskLevel } from '../types/index.js';
import { getRiskLevel } from '../risk/riskEngine.js';

export interface AnomalyEvaluation {
  isAnomaly: boolean;
  type: 'unsanctioned' | 'stale_status' | 'cost_anomaly' | 'disbursement_anomaly' | 'vendor_concentration';
  severity: RiskLevel;
  score: number;
  reason: string;
}

export function evaluateStaleStatus(daysSinceSanction: number | null, workStatus: string | null): AnomalyEvaluation {
  const earlyStatuses = ['Sanction', 'Vendor Identification', 'Physical Inspection'];
  if (!workStatus || !earlyStatuses.includes(workStatus)) {
    return { isAnomaly: false, type: 'stale_status', severity: 'LOW', score: 0, reason: 'Status is actively progressing or completed' };
  }

  const days = daysSinceSanction ?? 0;
  if (days > 365) {
    const score = 65;
    return {
      isAnomaly: true,
      type: 'stale_status',
      severity: getRiskLevel(score),
      score,
      reason: `Status still "${workStatus}" after ${days} days since sanction (>1 year). Potential stall.`,
    };
  } else if (days > 180) {
    const score = 40;
    return {
      isAnomaly: true,
      type: 'stale_status',
      severity: getRiskLevel(score),
      score,
      reason: `Status still "${workStatus}" after ${days} days since sanction (>6 months).`,
    };
  }

  return { isAnomaly: false, type: 'stale_status', severity: 'LOW', score: 10, reason: 'Within normal execution timeline' };
}

export function evaluateCostAnomaly(sanctionAmount: number | null, categoryMedian: number): AnomalyEvaluation {
  if (!sanctionAmount || !categoryMedian || categoryMedian <= 0) {
    return { isAnomaly: false, type: 'cost_anomaly', severity: 'LOW', score: 0, reason: 'Insufficient cost data' };
  }

  const ratio = sanctionAmount / categoryMedian;
  if (ratio >= 5.0) {
    const score = 75;
    return {
      isAnomaly: true,
      type: 'cost_anomaly',
      severity: getRiskLevel(score),
      score,
      reason: `Sanction amount is ${ratio.toFixed(1)}x category median. Major cost outlier.`,
    };
  } else if (ratio >= 2.5) {
    const score = 45;
    return {
      isAnomaly: true,
      type: 'cost_anomaly',
      severity: getRiskLevel(score),
      score,
      reason: `Sanction amount is ${ratio.toFixed(1)}x category median. Elevated cost.`,
    };
  }

  return { isAnomaly: false, type: 'cost_anomaly', severity: 'LOW', score: 5, reason: 'Cost within expected range' };
}

export function evaluateDisbursementAnomaly(
  sanctionAmount: number | null,
  totalPaid: number | null,
  workStatus: string | null
): AnomalyEvaluation {
  if (!sanctionAmount || sanctionAmount <= 0 || totalPaid === null) {
    return { isAnomaly: false, type: 'disbursement_anomaly', severity: 'LOW', score: 0, reason: 'Insufficient financial records' };
  }

  const ratio = (totalPaid / sanctionAmount) * 100;
  if (ratio > 110) {
    const score = 80;
    return {
      isAnomaly: true,
      type: 'disbursement_anomaly',
      severity: getRiskLevel(score),
      score,
      reason: `Disbursed funds (${ratio.toFixed(1)}%) exceed sanctioned budget. Potential overpayment.`,
    };
  } else if (ratio > 95 && workStatus !== 'Work Completed') {
    const score = 45;
    return {
      isAnomaly: true,
      type: 'disbursement_anomaly',
      severity: getRiskLevel(score),
      score,
      reason: `Near-complete disbursement (${ratio.toFixed(1)}%) while status is "${workStatus}".`,
    };
  }

  return { isAnomaly: false, type: 'disbursement_anomaly', severity: 'LOW', score: 5, reason: 'Disbursement aligned with project status' };
}
