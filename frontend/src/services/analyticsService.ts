import { supabase } from './client';
import type { DistrictSummary, CategorySummary, MPSummary } from '../types';

export interface DashboardKPIs {
  total: number;
  totalSanctionAmount: number;
  totalDisbursed: number;
  completed: number;
  highRisk: number;
  medRisk: number;
  lowRisk: number;
  pendingSanction: number;
  requiresVerification: number;
  avgRiskScore: number;
}

export interface FilterOptions {
  states?: string[];
  constituencies?: string[];
  mps?: string[];
  categories?: string[];
  statuses?: string[];
}

export async function getDashboardKPIs(
  house: 'Lok Sabha' | 'Rajya Sabha',
  filters: {
    state?: string;
    constituency?: string;
    mpName?: string;
    riskLevel?: string;
    status?: string;
    category?: string;
    tenure?: string;
    search?: string;
  } = {}
): Promise<DashboardKPIs> {
  const { data, error } = await supabase.rpc('get_dashboard_kpis', {
    p_house: house,
    p_state: filters.state || null,
    p_constituency: filters.constituency || null,
    p_mp: filters.mpName || null,
    p_risk: filters.riskLevel || null,
    p_status: filters.status || null,
    p_category: filters.category || null,
    p_tenure: filters.tenure || null,
    p_search: filters.search || null,
  });

  if (error) {
    console.error('[Supabase] Error calling get_dashboard_kpis:', error);
    throw error;
  }

  return {
    total: Number(data?.total || 0),
    totalSanctionAmount: Number(data?.totalSanctionAmount || 0),
    totalDisbursed: Number(data?.totalDisbursed || 0),
    completed: Number(data?.completed || 0),
    highRisk: Number(data?.highRisk || 0),
    medRisk: Number(data?.medRisk || 0),
    lowRisk: Number(data?.lowRisk || 0),
    pendingSanction: Number(data?.pendingSanction || 0),
    requiresVerification: Number(data?.requiresVerification || 0),
    avgRiskScore: Number(data?.avgRiskScore || 0),
  };
}

export async function getDistinctFilterOptions(
  house: 'Lok Sabha' | 'Rajya Sabha',
  state?: string
): Promise<FilterOptions> {
  const { data, error } = await supabase.rpc('get_distinct_filter_options', {
    p_house: house,
    p_state: state || null,
  });

  if (error) {
    console.error('[Supabase] Error fetching filter options:', error);
    return {};
  }

  return {
    states: data?.states || [],
    constituencies: data?.constituencies || [],
    mps: data?.mps || [],
    categories: data?.categories || [],
    statuses: data?.statuses || [],
  };
}

export async function getDistrictAnalytics(
  house: 'Lok Sabha' | 'Rajya Sabha',
  state?: string
): Promise<DistrictSummary[]> {
  const tbl = house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';

  let query = supabase
    .from(tbl)
    .select('district, sanction_amount, total_paid, risk_level, risk_score');

  if (state) {
    query = query.eq('state', state);
  }

  const { data, error } = await query.limit(2000);
  if (error || !data) return [];

  const districtMap = new Map<string, {
    total: number;
    high: number;
    med: number;
    low: number;
    sanctioned: number;
    disbursed: number;
    scoreSum: number;
  }>();

  for (const row of data) {
    const dist = row.district || 'Unknown District';
    const entry = districtMap.get(dist) || {
      total: 0,
      high: 0,
      med: 0,
      low: 0,
      sanctioned: 0,
      disbursed: 0,
      scoreSum: 0,
    };

    entry.total++;
    entry.sanctioned += Number(row.sanction_amount || 0);
    entry.disbursed += Number(row.total_paid || 0);
    entry.scoreSum += Number(row.risk_score || 0);

    if (row.risk_level === 'HIGH') entry.high++;
    else if (row.risk_level === 'MEDIUM') entry.med++;
    else entry.low++;

    districtMap.set(dist, entry);
  }

  return Array.from(districtMap.entries()).map(([district, stats]) => ({
    district,
    totalProjects: stats.total,
    highRisk: stats.high,
    mediumRisk: stats.med,
    lowRisk: stats.low,
    totalSanctionAmount: stats.sanctioned,
    totalDisbursed: stats.disbursed,
    avgScore: stats.total > 0 ? Math.round(stats.scoreSum / stats.total) : 0,
  }));
}

export async function getCategoryAnalytics(
  house: 'Lok Sabha' | 'Rajya Sabha'
): Promise<CategorySummary[]> {
  const tbl = house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';

  const { data, error } = await supabase
    .from(tbl)
    .select('work_category, sanction_amount, risk_level, risk_score')
    .limit(3000);

  if (error || !data) return [];

  const catMap = new Map<string, { total: number; amount: number; high: number; scoreSum: number }>();
  for (const row of data) {
    const cat = row.work_category || 'General';
    const entry = catMap.get(cat) || { total: 0, amount: 0, high: 0, scoreSum: 0 };
    entry.total++;
    entry.amount += Number(row.sanction_amount || 0);
    if (row.risk_level === 'HIGH') entry.high++;
    entry.scoreSum += Number(row.risk_score || 0);
    catMap.set(cat, entry);
  }

  return Array.from(catMap.entries()).map(([category, stats]) => ({
    category,
    totalProjects: stats.total,
    highRisk: stats.high,
    avgAmount: stats.total > 0 ? stats.amount / stats.total : 0,
    avgScore: stats.total > 0 ? Math.round(stats.scoreSum / stats.total) : 0,
  }));
}

export async function getMPAnalytics(
  house: 'Lok Sabha' | 'Rajya Sabha'
): Promise<MPSummary[]> {
  const tbl = house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';

  const { data, error } = await supabase
    .from(tbl)
    .select('mp_name, constituency, allocated_limit, sanction_amount, risk_level')
    .limit(3000);

  if (error || !data) return [];

  const mpMap = new Map<string, {
    constituency: string;
    total: number;
    allocated: number | null;
    sanctioned: number;
    high: number;
  }>();

  for (const row of data) {
    const mp = row.mp_name || 'Unknown MP';
    const entry = mpMap.get(mp) || {
      constituency: row.constituency || '',
      total: 0,
      allocated: row.allocated_limit !== null ? Number(row.allocated_limit) : null,
      sanctioned: 0,
      high: 0,
    };

    entry.total++;
    entry.sanctioned += Number(row.sanction_amount || 0);
    if (row.risk_level === 'HIGH') entry.high++;
    mpMap.set(mp, entry);
  }

  return Array.from(mpMap.entries()).map(([mp, stats]) => ({
    mp,
    constituency: stats.constituency,
    totalProjects: stats.total,
    allocatedAmount: stats.allocated,
    totalSanctioned: stats.sanctioned,
    highRisk: stats.high,
  }));
}
