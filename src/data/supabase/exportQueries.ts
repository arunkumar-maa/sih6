import { supabase } from './client';
import { rowToEnrichedProject } from './projectQueries';
import type { EnrichedProject } from '../types';

export interface ExportFilters {
  search?: string;
  state?: string;
  district?: string;
  constituency?: string;
  mpName?: string;
  riskLevel?: string;
  status?: string;
  category?: string;
  tenure?: string;
}

export async function getFilteredProjectsForExport(
  house: 'Lok Sabha' | 'Rajya Sabha',
  filters: ExportFilters = {}
): Promise<EnrichedProject[]> {
  const hasFilter = !!(
    filters.search ||
    filters.state ||
    filters.district ||
    filters.constituency ||
    filters.mpName ||
    filters.riskLevel ||
    filters.status ||
    filters.category ||
    (filters.tenure && filters.tenure !== '18th Lok Sabha' && filters.tenure !== 'Current Rajya Sabha')
  );

  // Strict export guard: never allow an accidental entire-database dump
  if (!hasFilter) {
    throw new Error('Export guard: apply at least one filter before exporting.');
  }

  const tableName = house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';

  let query = supabase.from(tableName).select('*');

  if (filters.state) query = query.eq('state', filters.state);
  if (filters.district) query = query.eq('district', filters.district);
  if (filters.constituency) query = query.eq('constituency', filters.constituency);
  if (filters.mpName) query = query.eq('mp_name', filters.mpName);
  if (filters.riskLevel) query = query.eq('risk_level', filters.riskLevel);
  if (filters.status) query = query.eq('work_status', filters.status);
  if (filters.category) query = query.eq('work_category', filters.category);

  if (filters.tenure === '18th Lok Sabha') {
    query = query.or('financial_year.gte.2024-2025,financial_year.eq.Unknown');
  } else if (filters.tenure === '17th Lok Sabha') {
    query = query.gte('financial_year', '2019-2020').lte('financial_year', '2023-2024');
  }

  if (filters.search && filters.search.trim()) {
    const s = filters.search.trim();
    query = query.or(
      `work_description.ilike.%${s}%,work_id.ilike.%${s}%,constituency.ilike.%${s}%,district.ilike.%${s}%,mp_name.ilike.%${s}%`
    );
  }

  // Cap at 10,000 records for safety in a single export batch
  query = query.limit(10000);

  const { data, error } = await query;

  if (error) {
    console.error('[Supabase] Error fetching filtered export records:', error);
    throw error;
  }

  return (data || []).map(rowToEnrichedProject);
}
