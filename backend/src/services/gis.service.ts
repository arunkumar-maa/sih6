import { supabase } from './supabase.service.js';

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

export async function fetchConstituencyGIS(filters: GISFilters = {}): Promise<GISAggregateRegion[]> {
  try {
    const { data, error } = await supabase.rpc('get_constituency_gis_metrics', {
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

    if (!error && Array.isArray(data)) {
      return data.map(item => ({
        id: `${item.state}|||${item.constituency}`,
        name: item.constituency || 'Constituency',
        state: item.state || 'State',
        constituency: item.constituency,
        totalWorks: Number(item.total_works || 0),
        sanctionedAmount: Number(item.sanctioned_amount ?? item.total_sanctioned ?? 0),
        disbursedAmount: Number(item.disbursed_amount ?? item.total_disbursed ?? 0),
        completedWorks: Number(item.completed_works || 0),
        highRiskCount: Number(item.high_risk_count || 0),
        medRiskCount: Number(item.med_risk_count || 0),
        lowRiskCount: Number(item.low_risk_count || 0),
        avgRiskScore: Number(item.avg_risk_score || 0),
        riskRate: Number(item.total_works || 0) > 0 ? Number(item.high_risk_count || 0) / Number(item.total_works) : 0,
      }));
    }
  } catch (err) {
    console.warn('[GISService] RPC failed, returning empty list:', err);
  }

  return [];
}

export async function fetchStateGIS(filters: GISFilters = {}): Promise<GISAggregateRegion[]> {
  try {
    const { data, error } = await supabase.rpc('get_state_gis_metrics', {
      p_state: filters.state || null,
      p_constituency: null,
      p_mp: filters.mpName || null,
      p_risk: filters.riskLevel || null,
      p_status: filters.status || null,
      p_category: filters.category || null,
      p_tenure: filters.tenure || null,
      p_search: filters.search || null,
    });

    if (!error && Array.isArray(data)) {
      return data.map(item => ({
        id: item.state,
        name: item.state || 'State',
        state: item.state || 'State',
        totalWorks: Number(item.total_works || 0),
        sanctionedAmount: Number(item.sanctioned_amount ?? item.total_sanctioned ?? 0),
        disbursedAmount: Number(item.disbursed_amount ?? item.total_disbursed ?? 0),
        completedWorks: Number(item.completed_works || 0),
        highRiskCount: Number(item.high_risk_count || 0),
        medRiskCount: Number(item.med_risk_count || 0),
        lowRiskCount: Number(item.low_risk_count || 0),
        avgRiskScore: Number(item.avg_risk_score || 0),
        riskRate: Number(item.total_works || 0) > 0 ? Number(item.high_risk_count || 0) / Number(item.total_works) : 0,
      }));
    }
  } catch (err) {
    console.warn('[GISService] State RPC failed, returning empty list:', err);
  }

  return [];
}
