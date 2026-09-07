import { supabase, getTableName } from './supabase.service.js';
import { getRiskLevel } from '../risk/riskEngine.js';
import type { EnrichedProject, ProjectFilters, RiskLevel, WorkStatus, PaymentStatus, VerificationStatus } from '../types/index.js';

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

    recommendedDate: row.recommended_date || null,
    sanctionDate: row.sanction_date || null,
    completionDate: row.completion_date || null,
    expenditureDate: row.expenditure_date || null,

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
  };
}

export async function fetchProjects(filters: ProjectFilters) {
  const house = filters.house || 'Lok Sabha';
  const tableName = getTableName(house);
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.min(500, Math.max(1, Number(filters.pageSize) || 20));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(tableName)
    .select('*', { count: 'exact' });

  if (filters.state) {
    query = query.eq('state', filters.state);
  }
  if (filters.district) {
    query = query.eq('district', filters.district);
  }
  if (filters.constituency) {
    query = query.eq('constituency', filters.constituency);
  }
  if (filters.mpName) {
    query = query.ilike('mp_name', `%${filters.mpName}%`);
  }
  if (filters.workCategory) {
    query = query.eq('work_category', filters.workCategory);
  }
  if (filters.status) {
    query = query.eq('work_status', filters.status);
  }
  if (filters.financialYear) {
    query = query.eq('financial_year', filters.financialYear);
  }
  if (filters.tenure && filters.tenure !== 'All Tenures' && filters.tenure.trim() !== '') {
    if (filters.tenure === '18th Lok Sabha') {
      query = query.or('financial_year.gte.2024-2025,financial_year.eq.Unknown');
    } else if (filters.tenure === '17th Lok Sabha') {
      query = query.gte('financial_year', '2019-2020').lte('financial_year', '2023-2024');
    }
  }
  if (filters.riskLevel) {
    query = query.eq('risk_level', filters.riskLevel);
  }
  if (filters.isSanctioned !== undefined) {
    query = query.eq('is_sanctioned', filters.isSanctioned);
  }
  if (filters.isCompleted !== undefined) {
    query = query.eq('is_completed', filters.isCompleted);
  }
  if (filters.hasDisbursement) {
    query = query.gt('total_paid', 0);
  }
  if (filters.search) {
    const s = filters.search.trim();
    query = query.or(`work_id.ilike.%${s}%,work_description.ilike.%${s}%,mp_name.ilike.%${s}%,constituency.ilike.%${s}%`);
  }

  let sortField = filters.sortBy || 'sanction_amount';
  if (sortField === 'risk') sortField = 'risk_score';
  else if (sortField === 'amount') sortField = 'sanction_amount';
  else if (sortField === 'status') sortField = 'work_status';
  else if (sortField === 'fy') sortField = 'financial_year';

  const sortAsc = filters.sortOrder === 'asc';
  query = query.order(sortField, { ascending: sortAsc }).range(from, to);

  const { data, count, error } = await query;
  if (error) {
    throw new Error(`Database error fetching projects: ${error.message}`);
  }

  const totalCount = count || 0;
  const projects = (data || []).map(rowToEnrichedProject);

  return {
    projects,
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

export async function fetchProjectById(workId: string, house: 'Lok Sabha' | 'Rajya Sabha' = 'Lok Sabha') {
  const tableName = getTableName(house);
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('work_id', workId)
    .single();

  if (error || !data) {
    return null;
  }

  return rowToEnrichedProject(data);
}

export async function fetchFilterOptions(house: 'Lok Sabha' | 'Rajya Sabha' = 'Lok Sabha') {
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_distinct_filter_options', {
      p_house: house,
    });
    if (!rpcError && rpcData) {
      return rpcData;
    }
  } catch {
    // Fall back to table sampling if RPC is unavailable
  }

  const tableName = getTableName(house);
  const { data, error } = await supabase
    .from(tableName)
    .select('state, district, constituency, work_category, financial_year, work_status')
    .limit(3000);

  if (error || !data) {
    return { states: [], districts: [], categories: [], years: [], statuses: [] };
  }

  const states = Array.from(new Set(data.map(d => d.state).filter(Boolean))).sort();
  const districts = Array.from(new Set(data.map(d => d.district).filter(Boolean))).sort();
  const constituencies = Array.from(new Set(data.map(d => d.constituency).filter(Boolean))).sort();
  const categories = Array.from(new Set(data.map(d => d.work_category).filter(Boolean))).sort();
  const years = Array.from(new Set(data.map(d => d.financial_year).filter(Boolean))).sort();
  const statuses = Array.from(new Set(data.map(d => d.work_status).filter(Boolean))).sort();

  return { states, districts, constituencies, categories, years, statuses };
}
