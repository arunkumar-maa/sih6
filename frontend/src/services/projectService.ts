import { supabase } from './client';
import type { EnrichedProject, RiskLevel, WorkStatus, PaymentStatus, VerificationStatus } from '../types';
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
      level: (row.risk_level as RiskLevel) || 'LOW',
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
  const {
    house,
    page = 1,
    pageSize = 20,
    search,
    state,
    district,
    constituency,
    mpName,
    riskLevel,
    status,
    category,
    tenure,
    isSanctioned,
    isCompleted,
    hasDisbursement,
    sortField = 'risk',
    sortDir = 'desc',
  } = params;

  const tableName = house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(tableName)
    .select('*', { count: 'exact' });

  if (state) query = query.eq('state', state);
  if (district) query = query.eq('district', district);
  if (constituency) query = query.eq('constituency', constituency);
  if (mpName) query = query.ilike('mp_name', `%${mpName}%`);
  if (riskLevel) query = query.eq('risk_level', riskLevel);
  if (status) query = query.eq('work_status', status);
  if (category) query = query.eq('work_category', category);
  if (tenure) query = query.eq('financial_year', tenure);
  if (isSanctioned !== undefined) query = query.eq('is_sanctioned', isSanctioned);
  if (isCompleted !== undefined) query = query.eq('is_completed', isCompleted);
  if (hasDisbursement) query = query.gt('total_paid', 0);

  if (search && search.trim()) {
    const s = search.trim();
    query = query.or(`work_id.ilike.%${s}%,work_description.ilike.%${s}%,mp_name.ilike.%${s}%,constituency.ilike.%${s}%`);
  }

  const ascending = sortDir === 'asc';
  switch (sortField) {
    case 'risk':
      query = query.order('risk_score', { ascending });
      break;
    case 'amount':
      query = query.order('sanction_amount', { ascending });
      break;
    case 'district':
      query = query.order('district', { ascending });
      break;
    case 'status':
      query = query.order('work_status', { ascending });
      break;
    case 'fy':
      query = query.order('financial_year', { ascending });
      break;
    default:
      query = query.order('sanction_amount', { ascending: false });
  }

  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) {
    console.error('[Supabase] Error fetching projects:', error);
    throw error;
  }

  const totalCount = count ?? 0;
  const projects = (data || []).map(rowToEnrichedProject);

  const overrides = loadVerificationOverrides();
  const projectsWithOverrides = projects.map(p => {
    const override = overrides[p.workId];
    if (!override) return p;
    return {
      ...p,
      verificationStatus: override.status,
      verificationHistory: override.history,
    };
  });

  return {
    projects: projectsWithOverrides,
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

export async function getProjectById(
  workId: string,
  house: 'Lok Sabha' | 'Rajya Sabha'
): Promise<EnrichedProject | null> {
  const tableName = house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('work_id', workId)
    .single();

  if (error || !data) {
    return null;
  }

  const project = rowToEnrichedProject(data);
  const overrides = loadVerificationOverrides();
  const override = overrides[project.workId];

  if (override) {
    return {
      ...project,
      verificationStatus: override.status,
      verificationHistory: override.history,
    };
  }

  return project;
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

