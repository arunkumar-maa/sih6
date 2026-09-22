import { apiFetch } from './apiClient';
import type {
  MpDashboardResponse,
  MpProfileResponse,
  MpProjectFilters,
  MpProjectsResponse,
} from '../types/mp';
import type { EnrichedProject } from '../types/index';

const API_BASE = '/api/mp';

export class MpService {
  /**
   * Get MP overview dashboard metrics and sentinel attention works
   */
  static async getDashboard(): Promise<MpDashboardResponse> {
    const res = await apiFetch(`${API_BASE}/dashboard`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch MP dashboard data');
    }
    const json = await res.json();
    return json.data;
  }

  /**
   * Get MP comprehensive profile dossier including financial breakdown, categories, and districts
   */
  static async getProfile(): Promise<MpProfileResponse> {
    const res = await apiFetch(`${API_BASE}/profile`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch MP profile data');
    }
    const json = await res.json();
    return json.data;
  }

  /**
   * Get server-side paginated and filtered project list scoped to the MP
   */
  static async getProjects(filters: MpProjectFilters = {}): Promise<MpProjectsResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
    if (filters.district && filters.district !== 'ALL') params.set('district', filters.district);
    if (filters.category && filters.category !== 'ALL') params.set('category', filters.category);
    if (filters.financialYear && filters.financialYear !== 'ALL') params.set('financialYear', filters.financialYear);
    if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
    if (filters.riskLevel && filters.riskLevel !== 'ALL') params.set('riskLevel', filters.riskLevel);
    if (filters.search) params.set('search', filters.search);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

    const res = await apiFetch(`${API_BASE}/projects?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch MP projects');
    }
    const json = await res.json();
    return json.data;
  }

  /**
   * Get detailed work record for an individual project in MP's constituency
   */
  static async getProjectDetail(workId: string): Promise<EnrichedProject> {
    const res = await apiFetch(`${API_BASE}/projects/${encodeURIComponent(workId)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch project detail for ${workId}`);
    }
    const json = await res.json();
    return json.data.project;
  }
}
