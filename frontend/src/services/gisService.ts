import { supabase } from './client';
import { normalizeStateName, normalizeConstituencyName, CONSTITUENCY_ALIASES } from '../utils/geoMatching';

export interface GISAggregateRegion {
  id: string;
  name: string;
  state: string;
  constituency?: string;
  totalWorks: number;
  sanctionedAmount: number;
  disbursedAmount: number;
  completedWorks: number;
  highRiskCount: number;
  medRiskCount: number;
  lowRiskCount: number;
  avgRiskScore: number;
  riskRate: number;
}

export interface GISFilters {
  state?: string;
  constituency?: string;
  mpName?: string;
  riskLevel?: string;
  status?: string;
  category?: string;
  tenure?: string;
  search?: string;
}

export async function getConstituencyGISAggregation(
  filters: GISFilters = {}
): Promise<Map<string, GISAggregateRegion>> {
  const { data, error } = await supabase.rpc('get_constituency_gis_metrics', {
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
    console.error('[Supabase] Error calling get_constituency_gis_metrics:', error);
    throw error;
  }

  const map = new Map<string, GISAggregateRegion>();
  const list = Array.isArray(data) ? data : [];

  for (const item of list) {
    const sNorm = normalizeStateName(item.state);
    let pcNorm = normalizeConstituencyName(item.constituency);

    if (sNorm && CONSTITUENCY_ALIASES[sNorm] && CONSTITUENCY_ALIASES[sNorm][pcNorm]) {
      pcNorm = CONSTITUENCY_ALIASES[sNorm][pcNorm];
    }

    const key = `${sNorm}|||${pcNorm}`;
    const totalWorks = Number(item.total_works || 0);
    const highRisk = Number(item.high_risk_count || 0);

    map.set(key, {
      id: key,
      name: item.constituency || 'Constituency',
      state: item.state || 'State',
      constituency: item.constituency,
      totalWorks,
      sanctionedAmount: Number(item.sanctioned_amount || 0),
      disbursedAmount: Number(item.disbursed_amount || 0),
      completedWorks: Number(item.completed_works || 0),
      highRiskCount: highRisk,
      medRiskCount: Number(item.med_risk_count || 0),
      lowRiskCount: Number(item.low_risk_count || 0),
      avgRiskScore: Number(item.avg_risk_score || 0),
      riskRate: totalWorks > 0 ? highRisk / totalWorks : 0,
    });
  }

  return map;
}

export async function getStateGISAggregation(
  filters: GISFilters = {}
): Promise<Map<string, GISAggregateRegion>> {
  const { data, error } = await supabase.rpc('get_state_gis_metrics', {
    p_state: filters.state || null,
    p_mp: filters.mpName || null,
    p_risk: filters.riskLevel || null,
    p_status: filters.status || null,
    p_category: filters.category || null,
    p_tenure: filters.tenure || null,
    p_search: filters.search || null,
  });

  if (error) {
    console.error('[Supabase] Error calling get_state_gis_metrics:', error);
    throw error;
  }

  const map = new Map<string, GISAggregateRegion>();
  const list = Array.isArray(data) ? data : [];

  for (const item of list) {
    const sNorm = normalizeStateName(item.state);
    const totalWorks = Number(item.total_works || 0);
    const highRisk = Number(item.high_risk_count || 0);

    map.set(sNorm, {
      id: sNorm,
      name: item.state || 'State',
      state: item.state || 'State',
      totalWorks,
      sanctionedAmount: Number(item.sanctioned_amount || 0),
      disbursedAmount: Number(item.disbursed_amount || 0),
      completedWorks: Number(item.completed_works || 0),
      highRiskCount: highRisk,
      medRiskCount: Number(item.med_risk_count || 0),
      lowRiskCount: Number(item.low_risk_count || 0),
      avgRiskScore: Number(item.avg_risk_score || 0),
      riskRate: totalWorks > 0 ? highRisk / totalWorks : 0,
    });
  }

  return map;
}
