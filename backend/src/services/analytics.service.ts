import { supabase, getTableName } from './supabase.service.js';

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

export async function fetchDashboardKPIs(
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
  try {
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

    if (!error && data) {
      return {
        total: Number(data.total || 0),
        totalSanctionAmount: Number(data.totalSanctionAmount || 0),
        totalDisbursed: Number(data.totalDisbursed || 0),
        completed: Number(data.completed || 0),
        highRisk: Number(data.highRisk || 0),
        medRisk: Number(data.medRisk || 0),
        lowRisk: Number(data.lowRisk || 0),
        pendingSanction: Number(data.pendingSanction || 0),
        requiresVerification: Number(data.requiresVerification || 0),
        avgRiskScore: Number(data.avgRiskScore || 0),
      };
    }
  } catch (err) {
    console.warn('[AnalyticsService] RPC get_dashboard_kpis failed, using fallback query:', err);
  }

  // Fallback direct count query
  const tbl = getTableName(house);
  const { data: rows, error } = await supabase
    .from(tbl)
    .select('sanction_amount, total_paid, work_status, risk_level, risk_score')
    .limit(5000);

  if (error || !rows) {
    return {
      total: 0,
      totalSanctionAmount: 0,
      totalDisbursed: 0,
      completed: 0,
      highRisk: 0,
      medRisk: 0,
      lowRisk: 0,
      pendingSanction: 0,
      requiresVerification: 0,
      avgRiskScore: 0,
    };
  }

  let totalSanctionAmount = 0;
  let totalDisbursed = 0;
  let completed = 0;
  let highRisk = 0;
  let medRisk = 0;
  let lowRisk = 0;
  let riskScoreSum = 0;

  for (const r of rows) {
    totalSanctionAmount += Number(r.sanction_amount || 0);
    totalDisbursed += Number(r.total_paid || 0);
    if (r.work_status === 'Work Completed') completed++;
    if (r.risk_level === 'HIGH') highRisk++;
    else if (r.risk_level === 'MEDIUM') medRisk++;
    else lowRisk++;
    riskScoreSum += Number(r.risk_score || 0);
  }

  return {
    total: rows.length,
    totalSanctionAmount,
    totalDisbursed,
    completed,
    highRisk,
    medRisk,
    lowRisk,
    pendingSanction: 0,
    requiresVerification: highRisk,
    avgRiskScore: rows.length > 0 ? Math.round(riskScoreSum / rows.length) : 0,
  };
}

export async function fetchCategoryAnalytics(house: 'Lok Sabha' | 'Rajya Sabha') {
  const tbl = getTableName(house);
  const { data, error } = await supabase
    .from(tbl)
    .select('work_category, sanction_amount, risk_level, risk_score')
    .limit(10000);

  if (error || !data) return [];

  const map = new Map<string, { total: number; amount: number; highRisk: number; scoreSum: number }>();
  for (const row of data) {
    const cat = row.work_category || 'General';
    const entry = map.get(cat) || { total: 0, amount: 0, highRisk: 0, scoreSum: 0 };
    entry.total++;
    entry.amount += Number(row.sanction_amount || 0);
    if (row.risk_level === 'HIGH') entry.highRisk++;
    entry.scoreSum += Number(row.risk_score || 0);
    map.set(cat, entry);
  }

  return Array.from(map.entries()).map(([category, stats]) => ({
    category,
    totalProjects: stats.total,
    highRisk: stats.highRisk,
    avgAmount: stats.total > 0 ? stats.amount / stats.total : 0,
    avgScore: stats.total > 0 ? Math.round(stats.scoreSum / stats.total) : 0,
  }));
}
