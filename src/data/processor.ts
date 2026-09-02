// Data processor — joins all 6 MPLADS datasets into enriched project records

import { differenceInDays } from 'date-fns';
import type {
  RawSanctionedWork,
  RawRecommendedWork,
  RawCompletedWork,
  RawExpenditure,
  RawAllocatedLimit,
  EnrichedProject,
  WorkStatus,
  PaymentStatus,
} from './types';
import { extractDistrict } from './districtCoordinates';
import { buildCategoryMedians, buildVendorCounts, calculateRiskScore } from './riskEngine';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === 'NA' || dateStr === 'N/A' || dateStr.trim() === '') return null;
  const parts = dateStr.trim().split('-');
  if (parts.length === 3) {
    const months: Record<string, number> = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };
    const day = parseInt(parts[0]);
    const month = months[parts[1]];
    const year = parseInt(parts[2]);
    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  return null;
}

function extractFinancialYear(workId: string): string {
  const match = workId.match(/(\d{4}-\d{4})/);
  return match ? match[1] : 'Unknown';
}

function extractCleanWorkId(workId: string): string {
  if (!workId) return '';
  // "WS/MP394/2025-2026/136038-Category..." → "WS/MP394/2025-2026/136038"
  const match = workId.match(/^((?:WS|NA)\/[^/]+\/\d{4}-\d{4}\/\d+)/);
  if (match) return match[1];
  const dashIdx = workId.indexOf('-');
  if (dashIdx > 10) return workId.slice(0, dashIdx);
  return workId;
}

function extractWorkCategory(workId: string, rawCategory: string): string {
  if (rawCategory && rawCategory !== 'Normal/Others') return rawCategory;
  const dashIdx = workId.indexOf('-');
  if (dashIdx !== -1 && dashIdx < workId.length - 1) {
    return workId.slice(dashIdx + 1).trim();
  }
  return rawCategory || 'Unknown';
}

function normalizeWorkStatus(status: string): WorkStatus {
  const s = status.toLowerCase();
  if (s.includes('completed')) return 'Work Completed';
  if (s.includes('in progress') || s.includes('inprogress')) return 'Work In Progress';
  if (s.includes('physical')) return 'Physical Inspection';
  if (s.includes('vendor')) return 'Vendor Identification';
  if (s.includes('sanction')) return 'Sanction';
  return 'Unknown';
}

function normalizePaymentStatus(status: string): PaymentStatus {
  const s = status.toLowerCase();
  if (s.includes('completed')) return 'Payment Completed';
  if (s.includes('progress')) return 'Payment In-Progress';
  return 'Unknown';
}

function daysSince(d: Date | null): number | null {
  if (!d) return null;
  return differenceInDays(new Date(), d);
}

// ─── Main Processor ──────────────────────────────────────────────────────────

export interface ProcessedDataset {
  projects: EnrichedProject[];
  totalSanctionedWorks: number;
  totalRecommendedWorks: number;
  totalCompletedWorks: number;
  totalExpenditureRecords: number;
}

export function processDatasets(
  sanctioned: RawSanctionedWork[],
  recommended: RawRecommendedWork[],
  completed: RawCompletedWork[],
  expenditure: RawExpenditure[],
  allocated: RawAllocatedLimit[]
): ProcessedDataset {

  // Build lookup maps
  const completedByWorkId = new Map<string, RawCompletedWork>();
  for (const c of completed) {
    const id = extractCleanWorkId(c.workId);
    if (id) completedByWorkId.set(id, c);
  }

  const expenditureByWorkId = new Map<string, RawExpenditure>();
  for (const e of expenditure) {
    const id = e.workId.trim();
    if (id) expenditureByWorkId.set(id, e);
  }

  const allocatedByMP = new Map<string, number | null>();
  for (const a of allocated) {
    const key = a.mp.trim().toUpperCase();
    allocatedByMP.set(key, a.allocatedAmount);
  }

  const projects: EnrichedProject[] = [];

  // Process sanctioned works (primary source)
  for (const s of sanctioned) {
    const cleanId = extractCleanWorkId(s.workId);
    if (!cleanId) continue;

    const compEntry = completedByWorkId.get(cleanId);
    const expEntry = expenditureByWorkId.get(cleanId);

    const sanctionDate = parseDate(s.sanctionDate);
    const recDate = parseDate(s.recommendedDate);
    const completionDate = compEntry ? parseDate(compEntry.completionDate) : null;
    const expDate = expEntry ? parseDate(expEntry.expenditureDate) : null;

    const amountDisbursed = compEntry?.amountDisbursed ?? null;
    const expenditureAmt = expEntry?.fundDisbursedAmount ?? null;
    const totalPaid = amountDisbursed !== null
      ? amountDisbursed
      : expenditureAmt !== null ? expenditureAmt : null;

    const disbursementRatio = (totalPaid !== null && s.sanctionAmount && s.sanctionAmount > 0)
      ? (totalPaid / s.sanctionAmount) * 100
      : null;

    const district = extractDistrict(s.ida);
    const fy = extractFinancialYear(s.workId);
    const workCategory = extractWorkCategory(s.workId, s.workCategory);
    const workStatus = normalizeWorkStatus(s.workStatus);
    const isCompleted = workStatus === 'Work Completed' || completionDate !== null;
    const mpKey = s.mp.trim().toUpperCase();

    const project: EnrichedProject = {
      workId: cleanId,
      srNo: s.srNo,
      workCategory,
      state: s.state,
      ida: s.ida,
      district,
      mp: s.mp,
      constituency: s.constituency,
      workDescription: s.workDescription,
      financialYear: fy,

      recommendedDate: recDate,
      sanctionDate,
      completionDate,
      expenditureDate: expDate,

      sanctionAmount: s.sanctionAmount,
      recommendedAmount: null,
      amountDisbursed,
      expenditureAmount: expenditureAmt,
      totalPaid,
      allocatedLimit: allocatedByMP.get(mpKey) ?? null,

      disbursementRatio,

      workStatus,
      paymentStatus: expEntry ? normalizePaymentStatus(expEntry.paymentStatus) : 'Unknown',
      isCompleted,
      isSanctioned: true,
      isRecommendedOnly: false,

      daysSinceSanction: daysSince(sanctionDate),
      daysSinceRecommendation: daysSince(recDate),
      daysToComplete: (sanctionDate && completionDate)
        ? differenceInDays(completionDate, sanctionDate)
        : null,

      vendorName: expEntry?.vendorName || null,

      // Placeholders; filled after building global stats
      risk: {
        score: 0,
        level: 'LOW',
        factors: [],
        explanation: 'Analysis not yet run.',
        factorsAvailable: 0,
        factorsTotal: 5,
      },

      verificationStatus: 'New Alert',
      verificationHistory: [],
    };

    projects.push(project);
  }

  // Also add recommended-only works (never sanctioned)
  const sanctionedIds = new Set(sanctioned.map(s => extractCleanWorkId(s.workId)));
  for (const r of recommended) {
    const cleanId = extractCleanWorkId(r.workId);
    if (!cleanId || cleanId === '' || cleanId.startsWith('NA')) continue;
    if (sanctionedIds.has(cleanId)) continue;
    if (r.sanctionDate && r.sanctionDate !== 'NA' && r.sanctionDate !== '') continue;

    const recDate = parseDate(r.recommendedDate);
    const district = extractDistrict(r.ida);
    const fy = extractFinancialYear(r.workId);
    const workCategory = extractWorkCategory(r.workId, r.workCategory);
    const mpKey = r.mp.trim().toUpperCase();

    const project: EnrichedProject = {
      workId: cleanId,
      srNo: r.srNo,
      workCategory,
      state: r.state,
      ida: r.ida,
      district,
      mp: r.mp,
      constituency: r.constituency,
      workDescription: r.workDescription,
      financialYear: fy,

      recommendedDate: recDate,
      sanctionDate: null,
      completionDate: null,
      expenditureDate: null,

      sanctionAmount: null,
      recommendedAmount: r.recommendedAmount,
      amountDisbursed: null,
      expenditureAmount: null,
      totalPaid: null,
      allocatedLimit: allocatedByMP.get(mpKey) ?? null,

      disbursementRatio: null,

      workStatus: 'Unknown',
      paymentStatus: 'Unknown',
      isCompleted: false,
      isSanctioned: false,
      isRecommendedOnly: true,

      daysSinceSanction: null,
      daysSinceRecommendation: daysSince(recDate),
      daysToComplete: null,

      vendorName: null,

      risk: {
        score: 0,
        level: 'LOW',
        factors: [],
        explanation: 'Analysis not yet run.',
        factorsAvailable: 0,
        factorsTotal: 5,
      },

      verificationStatus: 'New Alert',
      verificationHistory: [],
    };
    projects.push(project);
  }

  // Run risk scoring
  const categoryMedians = buildCategoryMedians(projects);
  const vendorCounts = buildVendorCounts(projects);

  for (const p of projects) {
    p.risk = calculateRiskScore(p, categoryMedians, vendorCounts);
    // Only flag as 'New Alert' if risk is MEDIUM or HIGH
    if (p.risk.level === 'LOW') {
      p.verificationStatus = 'New Alert';
    }
  }

  return {
    projects,
    totalSanctionedWorks: sanctioned.length,
    totalRecommendedWorks: recommended.length,
    totalCompletedWorks: completed.length,
    totalExpenditureRecords: expenditure.length,
  };
}
