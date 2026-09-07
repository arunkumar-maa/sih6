import type { RiskLevel } from '../types';

export const RISK_THRESHOLDS = {
  HIGH: 55,
  MEDIUM: 25,
} as const;

/**
 * Authoritative canonical risk level function for the entire application.
 * Converts numeric risk score (0-100) to RiskLevel.
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= RISK_THRESHOLDS.HIGH) return 'HIGH';
  if (score >= RISK_THRESHOLDS.MEDIUM) return 'MEDIUM';
  return 'LOW';
}
