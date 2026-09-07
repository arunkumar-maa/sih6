import type { EnrichedProject, RiskLevel, WorkStatus, PaymentStatus, VerificationStatus } from '../types';
import { getRiskLevel } from '../utils/risk';
import { loadVerificationOverrides, saveVerificationOverride } from '../utils/verificationStorage';

export interface ProjectQueryParams {
  house: 'Lok Sabha' | 'Rajya Sabha';
  page?: number;
  pageSize?: number;
  search?: string;
  state?: string;
  district?: string;
  constituency?: string;
  mpName?: string;
  riskLevel?: string;
  status?: string;
  category?: string;
  tenure?: string;
  isSanctioned?: boolean;
  isCompleted?: boolean;
  hasDisbursement?: boolean;
  sortField?: 'risk' | 'amount' | 'district' | 'status' | 'fy';
  sortDir?: 'asc' | 'desc';
}

export interface PaginatedProjectsResult {
  projects: EnrichedProject[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function rowToEnrichedProject(row: any): EnrichedProject {
  return {
    workId: row.work_id,
    srNo: row.sr_no || '',
    workCategory: row.work_category || '',
    state: row.state || '',
    ida: row.ida || '',
    district: row.district || '',
    mp: row.mp_name || '',
    constituency: row.constituency || '',
    workDescription: row.work_description || '',
    financialYear: row.financial_year || '',
    house: (row.house as 'Lok Sabha' | 'Rajya Sabha') || 'Lok Sabha',

    recommendedDate: row.recommended_date ? new Date(row.recommended_date) : null,
    sanctionDate: row.sanction_date ? new Date(row.sanction_date) : null,
    completionDate: row.completion_date ? new Date(row.completion_date) : null,
    expenditureDate: row.expenditure_date ? new Date(row.expenditure_date) : null,

    sanctionAmount: row.sanction_amount !== null ? Number(row.sanction_amount) : null,
    recommendedAmount: row.recommended_amount !== null ? Number(row.recommended_amount) : null,
    amountDisbursed: row.amount_disbursed !== null ? Number(row.amount_disbursed) : null,
    expenditureAmount: row.expenditure_amount !== null ? Number(row.expenditure_amount) : null,
    totalPaid: row.total_paid !== null ? Number(row.total_paid) : null,
    allocatedLimit: row.allocated_limit !== null ? Number(row.allocated_limit) : null,
    disbursementRatio: row.disbursement_ratio !== null ? Number(row.disbursement_ratio) : null,

    workStatus: (row.work_status as WorkStatus) || 'Unknown',
    paymentStatus: (row.payment_status as PaymentStatus) || 'Unknown',
    isCompleted: !!row.is_completed,
    isSanctioned: !!row.is_sanctioned,
    isRecommendedOnly: !!row.is_recommended_only,

    daysSinceSanction: row.days_since_sanction !== null ? Number(row.days_since_sanction) : null,
    daysSinceRecommendation: row.days_since_recommendation !== null ? Number(row.days_since_recommendation) : null,
    daysToComplete: row.days_to_complete !== null ? Number(row.days_to_complete) : null,
    vendorName: row.vendor_name || null,

    risk: {
      score: Number(row.risk_score || 0),
      level: (row.risk_level as RiskLevel) || getRiskLevel(Number(row.risk_score || 0)),
      factors: Array.isArray(row.risk_factors) ? row.risk_factors : [],
      explanation: row.risk_explanation || '',
      factorsAvailable: Array.isArray(row.risk_factors) ? row.risk_factors.filter((f: any) => f.available).length : 0,
      factorsTotal: 6,
    },

    verificationStatus: (row.verification_status as VerificationStatus) || 'New Alert',
    verificationHistory: Array.isArray(row.verification_history) ? row.verification_history : [],
  };
}

export async function getProjects(params: ProjectQueryParams): Promise<PaginatedProjectsResult> {
  const query = new URLSearchParams();
  query.set('house', params.house || 'Lok Sabha');
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));
  if (params.search && params.search.trim()) query.set('search', params.search.trim());
  if (params.state) query.set('state', params.state);
  if (params.district) query.set('district', params.district);
  if (params.constituency) query.set('constituency', params.constituency);
  if (params.mpName) query.set('mpName', params.mpName);
  if (params.riskLevel) query.set('riskLevel', params.riskLevel);
  if (params.status) query.set('status', params.status);
  if (params.category) query.set('category', params.category);
  if (params.tenure && params.tenure !== 'All Tenures' && params.tenure.trim() !== '') {
    query.set('tenure', params.tenure);
  }
  if (params.isSanctioned !== undefined) query.set('isSanctioned', String(params.isSanctioned));
  if (params.isCompleted !== undefined) query.set('isCompleted', String(params.isCompleted));
  if (params.hasDisbursement !== undefined) query.set('hasDisbursement', String(params.hasDisbursement));
  if (params.sortField) query.set('sortBy', params.sortField);
  const apiBase = import.meta.env.VITE_API_URL || '';
  const res = await fetch(`${apiBase}/api/projects?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.message || 'Failed to fetch projects');
  }

  const { projects: rawProjects, totalCount, page, pageSize, totalPages } = json.data;
  const overrides = loadVerificationOverrides();
  const projects: EnrichedProject[] = (rawProjects || []).map((p: any) => {
    const override = overrides[p.workId];
    return {
      ...p,
      recommendedDate: p.recommendedDate ? new Date(p.recommendedDate) : null,
      sanctionDate: p.sanctionDate ? new Date(p.sanctionDate) : null,
      completionDate: p.completionDate ? new Date(p.completionDate) : null,
      expenditureDate: p.expenditureDate ? new Date(p.expenditureDate) : null,
      verificationStatus: override?.status || p.verificationStatus || 'New Alert',
      verificationHistory: override?.history || p.verificationHistory || [],
    };
  });

  return {
    projects,
    totalCount: Number(totalCount || 0),
    page: Number(page || 1),
    pageSize: Number(pageSize || 20),
    totalPages: Number(totalPages || 1),
  };
}

export async function getProjectById(
  workId: string,
  house: 'Lok Sabha' | 'Rajya Sabha' = 'Lok Sabha'
): Promise<EnrichedProject | null> {
  try {
    const apiBase = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${apiBase}/api/projects/${encodeURIComponent(workId)}?house=${encodeURIComponent(house)}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.data) return null;
    const p = json.data;
    const overrides = loadVerificationOverrides();
    const override = overrides[p.workId];
    return {
      ...p,
      recommendedDate: p.recommendedDate ? new Date(p.recommendedDate) : null,
      sanctionDate: p.sanctionDate ? new Date(p.sanctionDate) : null,
      completionDate: p.completionDate ? new Date(p.completionDate) : null,
      expenditureDate: p.expenditureDate ? new Date(p.expenditureDate) : null,
      verificationStatus: override?.status || p.verificationStatus || 'New Alert',
      verificationHistory: override?.history || p.verificationHistory || [],
    };
  } catch (err) {
    console.error('[projectService] getProjectById error:', err);
    return null;
  }
}

export async function updateProjectVerification(
  workId: string,
  house: 'Lok Sabha' | 'Rajya Sabha',
  status: VerificationStatus,
  actor: string,
  comment?: string
): Promise<boolean> {
  const event = {
    timestamp: new Date().toISOString(),
    action: `Status updated to ${status}`,
    actor,
    comment,
  };

  saveVerificationOverride(workId, { status, history: [event] });
  return true;
}

