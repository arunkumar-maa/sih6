import { supabase } from './client';
import { normalizeStateName, normalizeConstituencyName, CONSTITUENCY_ALIASES } from '../utils/geoMatching';

import { useAuthStore } from '../store/authStore';

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
  district?: string;
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
  let effectiveState = filters.state;
  let effectiveDistrict = filters.district;
  let effectiveConstituency = filters.constituency;
  let effectiveMp = filters.mpName;

  const authProfile = useAuthStore.getState().profile;
  if (authProfile?.role === 'STATE_NODAL_OFFICER' && authProfile.state) {
    effectiveState = authProfile.state;
  } else if (authProfile?.role === 'DISTRICT_OFFICER') {
    if (authProfile.state) effectiveState = authProfile.state;
    if (authProfile.district) effectiveDistrict = authProfile.district;
  } else if (authProfile?.role === 'MP') {
    if (authProfile.state) effectiveState = authProfile.state;
    if (authProfile.constituency) effectiveConstituency = authProfile.constituency;
    if (authProfile.mp_name || authProfile.full_name) {
      effectiveMp = authProfile.mp_name || authProfile.full_name;
    }
  }

  const { data, error } = await supabase.rpc('get_constituency_gis_metrics', {
    p_state: effectiveState || null,
    p_constituency: effectiveConstituency || null,
    p_mp: effectiveMp || null,
    p_risk: filters.riskLevel || null,
    p_status: filters.status || null,
    p_category: filters.category || null,
    p_tenure: filters.tenure || null,
    p_search: filters.search || null,
    p_district: effectiveDistrict || null,
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
      sanctionedAmount: Number(item.sanctioned_amount ?? item.total_sanctioned ?? 0),
      disbursedAmount: Number(item.disbursed_amount ?? item.total_disbursed ?? 0),
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
  let effectiveState = filters.state;
  let effectiveMp = filters.mpName;
  const authProfile = useAuthStore.getState().profile;
  if ((authProfile?.role === 'STATE_NODAL_OFFICER' || authProfile?.role === 'MP') && authProfile.state) {
    effectiveState = authProfile.state;
  }
  if (authProfile?.role === 'MP' && (authProfile.mp_name || authProfile.full_name)) {
    effectiveMp = authProfile.mp_name || authProfile.full_name;
  }

  const { data, error } = await supabase.rpc('get_state_gis_metrics', {
    p_state: effectiveState || null,
    p_constituency: null,
    p_mp: effectiveMp || null,
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
      sanctionedAmount: Number(item.sanctioned_amount ?? item.total_sanctioned ?? 0),
      disbursedAmount: Number(item.disbursed_amount ?? item.total_disbursed ?? 0),
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
