import type { EnrichedProject, RiskLevel } from '../types/index.js';

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
    return {
      isAnomaly: true,
      type: 'stale_status',
      severity: 'HIGH',
      score: 65,
      reason: `Status still "${workStatus}" after ${days} days since sanction (>1 year). Potential stall.`,
    };
  } else if (days > 180) {
    return {
      isAnomaly: true,
      type: 'stale_status',
      severity: 'MEDIUM',
      score: 40,
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
    return {
      isAnomaly: true,
      type: 'cost_anomaly',
      severity: 'HIGH',
      score: 75,
      reason: `Sanction amount is ${ratio.toFixed(1)}x category median. Major cost outlier.`,
    };
  } else if (ratio >= 2.5) {
    return {
      isAnomaly: true,
      type: 'cost_anomaly',
      severity: 'MEDIUM',
      score: 45,
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
    return {
      isAnomaly: true,
      type: 'disbursement_anomaly',
      severity: 'HIGH',
      score: 80,
      reason: `Disbursed funds (${ratio.toFixed(1)}%) exceed sanctioned budget. Potential overpayment.`,
    };
  } else if (ratio > 95 && workStatus !== 'Work Completed') {
    return {
      isAnomaly: true,
      type: 'disbursement_anomaly',
      severity: 'MEDIUM',
      score: 45,
      reason: `Near-complete disbursement (${ratio.toFixed(1)}%) while status is "${workStatus}".`,
    };
  }

  return { isAnomaly: false, type: 'disbursement_anomaly', severity: 'LOW', score: 5, reason: 'Disbursement aligned with project status' };
}
