import { supabase, getTableName } from './supabase.service.js';
import { getRiskLevel } from '../risk/riskEngine.js';

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

export interface AnalyticsObservatoryData {
  kpis: {
    total: number;
    totalSanctionAmount: number;
    totalDisbursed: number;
    highRisk: number;
    medRisk: number;
    lowRisk: number;
    completed: number;
    pendingSanction: number;
  };
  districtRisk: Array<{
    district: string;
    total: number;
    high: number;
    med: number;
    low: number;
    concentration: number;
  }>;
  categoryRisk: Array<{
    category: string;
    total: number;
    high: number;
    med: number;
    low: number;
  }>;
  statusBreakdown: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  fyTrend: Array<{
    fy: string;
    sanctioned: number;
    disbursed: number;
    total_projects: number;
  }>;
}

export async function fetchDashboardKPIs(
  house: 'Lok Sabha' | 'Rajya Sabha',
  filters: {
    state?: string;
    district?: string;
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
      p_district: filters.district || null,
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
    console.warn('[AnalyticsService] RPC get_dashboard_kpis failed, using database count fallback:', err);
  }

  // Database-level exact count aggregation without prototype row limits
  const tbl = getTableName(house);
  try {
    let baseQuery = supabase.from(tbl).select('*', { count: 'exact', head: true });
    if (filters.state) baseQuery = baseQuery.eq('state', filters.state);
    if (filters.constituency) baseQuery = baseQuery.eq('constituency', filters.constituency);
    if (filters.status) baseQuery = baseQuery.eq('work_status', filters.status);
    if (filters.category) baseQuery = baseQuery.eq('work_category', filters.category);
    if (filters.riskLevel) baseQuery = baseQuery.eq('risk_level', filters.riskLevel);

    const { count: total } = await baseQuery;

    // Fetch high and medium risk counts via server-side head count queries
    const [{ count: highRisk }, { count: medRisk }, { count: completed }] = await Promise.all([
      supabase.from(tbl).select('*', { count: 'exact', head: true }).eq('risk_level', 'HIGH'),
      supabase.from(tbl).select('*', { count: 'exact', head: true }).eq('risk_level', 'MEDIUM'),
      supabase.from(tbl).select('*', { count: 'exact', head: true }).eq('is_completed', true),
    ]);

    const totalCount = total || 0;
    const hCount = highRisk || 0;
    const mCount = medRisk || 0;
    const lCount = Math.max(0, totalCount - hCount - mCount);

    return {
      total: totalCount,
      totalSanctionAmount: 0,
      totalDisbursed: 0,
      completed: completed || 0,
      highRisk: hCount,
      medRisk: mCount,
      lowRisk: lCount,
      pendingSanction: 0,
      requiresVerification: hCount + mCount,
      avgRiskScore: totalCount > 0 ? (hCount * 65 + mCount * 35 + lCount * 10) / totalCount : 0,
    };
  } catch (fallbackErr) {
    console.error('[AnalyticsService] Fallback database count failed:', fallbackErr);
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
}

export async function fetchCategoryAnalytics(house: 'Lok Sabha' | 'Rajya Sabha') {
  try {
    const obs = await fetchObservatoryAnalytics(house);
    return obs.categoryRisk.map(c => ({
      category: c.category,
      totalProjects: c.total,
      highRisk: c.high,
      avgAmount: 0,
      avgScore: 0,
    }));
  } catch {
    return [];
  }
}

export async function fetchObservatoryAnalytics(
  house: 'Lok Sabha' | 'Rajya Sabha',
  filters: {
    state?: string;
    district?: string;
    constituency?: string;
    mpName?: string;
    riskLevel?: string;
    status?: string;
    category?: string;
    tenure?: string;
    search?: string;
  } = {}
): Promise<AnalyticsObservatoryData> {
  try {
    const { data, error } = await supabase.rpc('get_analytics_observatory', {
      p_house: house,
      p_state: filters.state || null,
      p_constituency: filters.constituency || null,
      p_mp: filters.mpName || null,
      p_risk: filters.riskLevel || null,
      p_status: filters.status || null,
      p_category: filters.category || null,
      p_tenure: filters.tenure || null,
      p_search: filters.search || null,
      p_district: filters.district || null,
    });

    if (!error && data) {
      return data as AnalyticsObservatoryData;
    }
    if (error) {
      console.warn('[AnalyticsService] RPC get_analytics_observatory error, falling back to database aggregation:', error.message);
    }
  } catch (err) {
    console.warn('[AnalyticsService] RPC get_analytics_observatory exception:', err);
  }

  // Resilient fallback: build aggregated structure using KPI stored procedure and baseline stats
  const kpis = await fetchDashboardKPIs(house, filters);

  return {
    kpis: {
      total: kpis.total,
      totalSanctionAmount: kpis.totalSanctionAmount,
      totalDisbursed: kpis.totalDisbursed,
      highRisk: kpis.highRisk,
      medRisk: kpis.medRisk,
      lowRisk: kpis.lowRisk,
      completed: kpis.completed,
      pendingSanction: kpis.pendingSanction,
    },
    districtRisk: [],
    categoryRisk: [],
    statusBreakdown: [
      { name: 'Work Completed', value: kpis.completed, percentage: kpis.total > 0 ? Math.round((kpis.completed / kpis.total) * 100) : 0 },
      { name: 'In Progress / Other', value: Math.max(0, kpis.total - kpis.completed), percentage: kpis.total > 0 ? Math.round(((kpis.total - kpis.completed) / kpis.total) * 100) : 0 },
    ],
    fyTrend: [],
  };
}
