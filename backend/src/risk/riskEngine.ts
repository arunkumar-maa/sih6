import { differenceInDays, parseISO } from 'date-fns';
import type { EnrichedProject, RiskFactor, RiskLevel, RiskResult } from '../types/index.js';
import type { DuplicateMatch } from '../anomaly/duplicateDetection.js';
import { formatCrore } from '../utils/formatters.js';

const STALE_SANCTION_DAYS = 365;
const HIGH_AMOUNT_MULTIPLIER = 2.5;
const LONG_PENDING_REC_DAYS = 180;
const VENDOR_CONCENTRATION_COUNT = 5;

function parseDate(dateStr: string | null): Date | null {
  if (!dateStr || dateStr === 'NA' || dateStr === 'N/A') return null;
  try {
    if (dateStr.includes('T') || dateStr.includes('-') && dateStr.length === 10 && dateStr[4] === '-') {
      return parseISO(dateStr);
    }
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const months: Record<string, number> = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
      };
      const day = parseInt(parts[0], 10);
      const month = months[parts[1]];
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && month !== undefined && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    return new Date(dateStr);
  } catch {
    return null;
  }
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 61) return 'HIGH';
  if (score >= 31) return 'MEDIUM';
  return 'LOW';
}

export function calcPendingRecommendationRisk(project: EnrichedProject): RiskFactor {
  const factor: RiskFactor = {
    id: 'pending_recommendation',
    label: 'Long-Pending Recommendation',
    description: '',
    severity: 'LOW',
    score: 0,
    available: project.isRecommendedOnly,
    value: project.daysSinceRecommendation ?? undefined,
  };

  if (!project.isRecommendedOnly) {
    factor.available = false;
    factor.description = 'Project has been sanctioned (not applicable).';
    return factor;
  }

  const days = project.daysSinceRecommendation;
  if (days === null) {
    factor.available = false;
    factor.description = 'Recommendation date not available.';
    return factor;
  }

  factor.available = true;
  if (days > 365) {
    factor.score = 70;
    factor.severity = 'HIGH';
    factor.description = `Recommended ${days} days ago but never sanctioned (>1 year pending).`;
  } else if (days > LONG_PENDING_REC_DAYS) {
    factor.score = 45;
    factor.severity = 'MEDIUM';
    factor.description = `Recommended ${days} days ago but still awaiting sanction.`;
  } else {
    factor.score = 10;
    factor.severity = 'LOW';
    factor.description = `Recommended recently (${days} days ago), sanction pending.`;
  }
  return factor;
}

export function calcStaleStatusRisk(project: EnrichedProject): RiskFactor {
  const factor: RiskFactor = {
    id: 'stale_status',
    label: 'Stale Status',
    description: '',
    severity: 'LOW',
    score: 0,
    available: false,
    value: project.workStatus,
  };

  if (project.isRecommendedOnly) {
    factor.description = 'Not applicable (not yet sanctioned).';
    return factor;
  }

  const earlyStatuses = ['Sanction', 'Vendor Identification'];
  if (!earlyStatuses.includes(project.workStatus)) {
    factor.available = true;
    factor.description = `Work status is "${project.workStatus}" — actively progressing.`;
    return factor;
  }

  const days = project.daysSinceSanction;
  if (days === null) {
    factor.description = 'Sanction date not available to assess timeline.';
    return factor;
  }

  factor.available = true;
  factor.value = `${days} days since sanction`;

  if (days > STALE_SANCTION_DAYS) {
    factor.score = 65;
    factor.severity = 'HIGH';
    factor.description = `Status still "${project.workStatus}" after ${days} days since sanction (>1 year). Work may be stalled.`;
  } else if (days > 180) {
    factor.score = 40;
    factor.severity = 'MEDIUM';
    factor.description = `Status still "${project.workStatus}" after ${days} days since sanction (>6 months).`;
  } else if (days > 90) {
    factor.score = 20;
    factor.severity = 'LOW';
    factor.description = `Status "${project.workStatus}" — ${days} days since sanction.`;
  } else {
    factor.score = 5;
    factor.severity = 'LOW';
    factor.description = `Recently sanctioned (${days} days), status "${project.workStatus}" is expected.`;
  }
  return factor;
}

export function calcHighAmountAnomaly(
  project: EnrichedProject,
  categoryMedians: Map<string, number>
): RiskFactor {
  const factor: RiskFactor = {
    id: 'high_amount_anomaly',
    label: 'Cost Anomaly',
    description: '',
    severity: 'LOW',
    score: 0,
    available: false,
    value: project.sanctionAmount ?? undefined,
  };

  const amount = project.sanctionAmount;
  if (amount === null) {
    factor.description = 'Sanction amount not available.';
    return factor;
  }

  const median = categoryMedians.get(project.workCategory);
  if (!median) {
    factor.description = 'Insufficient data to compare within category.';
    return factor;
  }

  factor.available = true;
  const ratio = amount / median;
  factor.value = `${ratio.toFixed(1)}x category median (${formatCrore(median)})`;

  if (ratio > HIGH_AMOUNT_MULTIPLIER * 2) {
    factor.score = 70;
    factor.severity = 'HIGH';
    factor.description = `Sanction amount (${formatCrore(amount)}) is ${ratio.toFixed(1)}x the median for this category. Significant cost anomaly.`;
  } else if (ratio > HIGH_AMOUNT_MULTIPLIER) {
    factor.score = 45;
    factor.severity = 'MEDIUM';
    factor.description = `Sanction amount (${formatCrore(amount)}) is ${ratio.toFixed(1)}x the category median. Above typical range.`;
  } else {
    factor.score = 5;
    factor.severity = 'LOW';
    factor.description = `Sanction amount (${formatCrore(amount)}) is within typical range for this category.`;
  }
  return factor;
}

export function calcDisbursementAnomaly(project: EnrichedProject): RiskFactor {
  const factor: RiskFactor = {
    id: 'disbursement_anomaly',
    label: 'Disbursement vs Sanction Mismatch',
    description: '',
    severity: 'LOW',
    score: 0,
    available: false,
    value: undefined,
  };

  const disbursed = project.totalPaid;
  const sanctioned = project.sanctionAmount;

  if (disbursed === null || sanctioned === null || sanctioned === 0) {
    factor.description = 'Insufficient financial data to assess disbursement.';
    return factor;
  }

  factor.available = true;
  const ratio = (disbursed / sanctioned) * 100;
  factor.value = `${ratio.toFixed(1)}% disbursed`;

  if (ratio > 110) {
    factor.score = 75;
    factor.severity = 'HIGH';
    factor.description = `Amount disbursed (${formatCrore(disbursed)}) exceeds sanction amount by ${(ratio - 100).toFixed(1)}%. Requires verification.`;
  } else if (ratio > 95 && project.workStatus !== 'Work Completed') {
    factor.score = 40;
    factor.severity = 'MEDIUM';
    factor.description = `Near-complete disbursement (${ratio.toFixed(1)}%) but work status is still "${project.workStatus}".`;
  } else {
    factor.score = 5;
    factor.severity = 'LOW';
    factor.description = `Disbursement of ${ratio.toFixed(1)}% appears consistent with project status.`;
  }
  return factor;
}

export function calcVendorConcentration(
  project: EnrichedProject,
  vendorCounts: Map<string, number>
): RiskFactor {
  const factor: RiskFactor = {
    id: 'vendor_concentration',
    label: 'Vendor Concentration',
    description: '',
    severity: 'LOW',
    score: 0,
    available: false,
    value: project.vendorName ?? undefined,
  };

  if (!project.vendorName) {
    factor.description = 'Vendor information not available.';
    return factor;
  }

  const count = vendorCounts.get(project.vendorName.toUpperCase()) ?? 1;
  factor.available = true;
  factor.value = `${project.vendorName} (${count} works)`;

  if (count >= VENDOR_CONCENTRATION_COUNT * 2) {
    factor.score = 50;
    factor.severity = 'HIGH';
    factor.description = `Vendor "${project.vendorName}" is executing ${count} works — high concentration. Warrants review.`;
  } else if (count >= VENDOR_CONCENTRATION_COUNT) {
    factor.score = 30;
    factor.severity = 'MEDIUM';
    factor.description = `Vendor "${project.vendorName}" appears on ${count} projects in the dataset.`;
  } else {
    factor.score = 0;
    factor.severity = 'LOW';
    factor.description = `Vendor appears on ${count} project(s) — normal.`;
  }
  return factor;
}

export function calcDuplicateRisk(
  project: EnrichedProject,
  duplicates?: Map<string, DuplicateMatch>
): RiskFactor {
  const factor: RiskFactor = {
    id: 'duplicate_project',
    label: 'Duplicate/Similar Project',
    description: 'No similar project detected.',
    severity: 'LOW',
    score: 0,
    available: true,
    value: undefined,
  };

  const match = duplicates?.get(project.workId);
  if (match && match.similarity >= 0.6) {
    const pct = Math.round(match.similarity * 100);
    factor.value = `${pct}% similarity (Work #${match.workId})`;
    if (match.similarity >= 0.85) {
      factor.score = 60;
      factor.severity = 'HIGH';
      factor.description = `High similarity (${pct}%) with another project (${match.workId}) in the same constituency and category. Potential duplicate work.`;
    } else {
      factor.score = 30;
      factor.severity = 'MEDIUM';
      factor.description = `Moderate similarity (${pct}%) with another project (${match.workId}) in the same constituency and category.`;
    }
  } else {
    factor.score = 0;
    factor.severity = 'LOW';
    factor.description = 'No similar project detected.';
    factor.value = 'Unique';
  }

  return factor;
}

export function buildCategoryMedians(projects: EnrichedProject[]): Map<string, number> {
  const byCategory = new Map<string, number[]>();
  for (const p of projects) {
    if (p.sanctionAmount !== null && p.workCategory) {
      const arr = byCategory.get(p.workCategory) ?? [];
      arr.push(p.sanctionAmount);
      byCategory.set(p.workCategory, arr);
    }
  }
  const medians = new Map<string, number>();
  byCategory.forEach((amounts, cat) => {
    const sorted = [...amounts].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    medians.set(cat, sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]);
  });
  return medians;
}

export function buildVendorCounts(projects: EnrichedProject[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const p of projects) {
    if (p.vendorName) {
      const key = p.vendorName.toUpperCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return counts;
}

export function calculateRiskScore(
  project: EnrichedProject,
  categoryMedians: Map<string, number>,
  vendorCounts: Map<string, number>,
  duplicates?: Map<string, DuplicateMatch>
): RiskResult {
  const factors: RiskFactor[] = [
    calcPendingRecommendationRisk(project),
    calcStaleStatusRisk(project),
    calcHighAmountAnomaly(project, categoryMedians),
    calcDisbursementAnomaly(project),
    calcVendorConcentration(project, vendorCounts),
    calcDuplicateRisk(project, duplicates),
  ];

  const available = factors.filter(f => f.available);

  let score = 0;
  if (available.length > 0) {
    const maxPossible = available.length * 100;
    const achieved = available.reduce((sum, f) => sum + f.score, 0);
    score = Math.round((achieved / maxPossible) * 100);
  }

  const level = getRiskLevel(score);

  const highFactors = available.filter(f => f.severity === 'HIGH');
  const medFactors = available.filter(f => f.severity === 'MEDIUM');

  let explanation = '';
  if (highFactors.length > 0) {
    explanation = `High-priority indicators detected: ${highFactors.map(f => f.label).join(', ')}.`;
  } else if (medFactors.length > 0) {
    explanation = `Moderate indicators: ${medFactors.map(f => f.label).join(', ')}.`;
  } else if (available.length === 0) {
    explanation = 'Insufficient data to generate risk assessment.';
  } else {
    explanation = 'No significant risk indicators detected in available data.';
  }

  return {
    score,
    level,
    factors,
    explanation,
    factorsAvailable: available.length,
    factorsTotal: factors.length,
  };
}
