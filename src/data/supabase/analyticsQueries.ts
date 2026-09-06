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

  const { data, error } = await query;
  if (error || !data) {
    console.error('[Supabase] Error fetching district analytics:', error);
    return [];
  }

  const map = new Map<string, DistrictSummary>();
  for (const r of data) {
    const d = r.district || 'Unknown';
    if (!map.has(d)) {
      map.set(d, {
        district: d,
        totalProjects: 0,
        highRisk: 0,
        mediumRisk: 0,
        lowRisk: 0,
        totalSanctionAmount: 0,
        totalDisbursed: 0,
        avgScore: 0,
      });
    }
    const sum = map.get(d)!;
    sum.totalProjects++;
    sum.totalSanctionAmount += Number(r.sanction_amount || 0);
    sum.totalDisbursed += Number(r.total_paid || 0);
    if (r.risk_level === 'HIGH') sum.highRisk++;
    else if (r.risk_level === 'MEDIUM') sum.mediumRisk++;
    else sum.lowRisk++;
    sum.avgScore += Number(r.risk_score || 0);
  }

  const list = Array.from(map.values());
  for (const item of list) {
    item.avgScore = item.totalProjects > 0 ? Math.round(item.avgScore / item.totalProjects) : 0;
  }
  return list.sort((a, b) => b.totalProjects - a.totalProjects);
}

export async function getCategoryAnalytics(
  house: 'Lok Sabha' | 'Rajya Sabha',
  state?: string
): Promise<CategorySummary[]> {
  const tbl = house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';

  let query = supabase
    .from(tbl)
    .select('work_category, sanction_amount, risk_level, risk_score');

  if (state) {
    query = query.eq('state', state);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  const map = new Map<string, CategorySummary>();
  for (const r of data) {
    const c = r.work_category || 'Unknown';
    if (!map.has(c)) {
      map.set(c, {
        category: c,
        totalProjects: 0,
        highRisk: 0,
        avgAmount: 0,
        avgScore: 0,
      });
    }
    const sum = map.get(c)!;
    sum.totalProjects++;
    sum.avgAmount += Number(r.sanction_amount || 0);
    sum.avgScore += Number(r.risk_score || 0);
    if (r.risk_level === 'HIGH') sum.highRisk++;
  }

  const list = Array.from(map.values());
  for (const item of list) {
    item.avgAmount = item.totalProjects > 0 ? item.avgAmount / item.totalProjects : 0;
    item.avgScore = item.totalProjects > 0 ? Math.round(item.avgScore / item.totalProjects) : 0;
  }
  return list.sort((a, b) => b.totalProjects - a.totalProjects);
}

export async function getMPSummary(
  house: 'Lok Sabha' | 'Rajya Sabha',
  state?: string
): Promise<MPSummary[]> {
  const tbl = house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';

  let query = supabase
    .from(tbl)
    .select('mp_name, constituency, sanction_amount, allocated_limit, risk_level');

  if (state) {
    query = query.eq('state', state);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  const map = new Map<string, MPSummary>();
  for (const r of data) {
    const mp = r.mp_name || 'Unknown';
    if (!map.has(mp)) {
      map.set(mp, {
        mp,
        constituency: r.constituency || '',
        totalProjects: 0,
        allocatedAmount: r.allocated_limit !== null ? Number(r.allocated_limit) : null,
        totalSanctioned: 0,
        highRisk: 0,
      });
    }
    const sum = map.get(mp)!;
    sum.totalProjects++;
    sum.totalSanctioned += Number(r.sanction_amount || 0);
    if (r.risk_level === 'HIGH') sum.highRisk++;
  }

  return Array.from(map.values()).sort((a, b) => b.totalProjects - a.totalProjects);
}
