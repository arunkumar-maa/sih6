import { apiFetch } from './apiClient';
import type {
  AgencyKPIs,
  AgencyProjectItem,
  ExecutionUpdate,
  ExecutionEvidence,
  ExecutionActionItem,
} from '../types/agency';

const API_BASE = '/api/implementing-agency';

export class ImplementingAgencyService {
  /**
   * Fetch agency dashboard KPIs
   */
  static async getDashboardKPIs(house?: string): Promise<AgencyKPIs> {
    const url = house ? `${API_BASE}/dashboard?house=${encodeURIComponent(house)}` : `${API_BASE}/dashboard`;
    const res = await apiFetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch agency dashboard KPIs');
    }
    const json = await res.json();
    return json.data.kpis;
  }

  /**
   * Fetch server-side paginated assigned works
   */
  static async getAssignedProjects(filters: {
    page?: number;
    pageSize?: number;
    search?: string;
    house?: string;
    state?: string;
    district?: string;
    constituency?: string;
    category?: string;
    financialYear?: string;
    workStatus?: string;
    riskLevel?: string;
  }): Promise<{ projects: AgencyProjectItem[]; total: number; page: number; pageSize: number }> {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
    if (filters.search) params.set('search', filters.search);
    if (filters.house && filters.house !== 'ALL') params.set('house', filters.house);
    if (filters.state && filters.state !== 'ALL') params.set('state', filters.state);
    if (filters.district && filters.district !== 'ALL') params.set('district', filters.district);
    if (filters.constituency) params.set('constituency', filters.constituency);
    if (filters.category && filters.category !== 'ALL') params.set('category', filters.category);
    if (filters.financialYear && filters.financialYear !== 'ALL') params.set('financialYear', filters.financialYear);
    if (filters.workStatus && filters.workStatus !== 'ALL') params.set('workStatus', filters.workStatus);
    if (filters.riskLevel && filters.riskLevel !== 'ALL') params.set('riskLevel', filters.riskLevel);

    const res = await apiFetch(`${API_BASE}/projects?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch assigned projects');
    }
    const json = await res.json();
    return json.data;
  }

  /**
   * Fetch complete project workspace details
   */
  static async getProjectDetails(workId: string, house?: string) {
    const url = house
      ? `${API_BASE}/projects/${encodeURIComponent(workId)}?house=${encodeURIComponent(house)}`
      : `${API_BASE}/projects/${encodeURIComponent(workId)}`;
    const res = await apiFetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch project workspace details');
    }
    const json = await res.json();
    return json.data;
  }

  /**
   * Submit execution update
   */
  static async submitExecutionUpdate(
    workId: string,
    payload: {
      house: 'Lok Sabha' | 'Rajya Sabha';
      physical_progress: number;
      milestone_status: string;
      update_date: string;
      remarks: string;
      delay_reason?: string;
      expected_completion_date?: string;
      is_draft?: boolean;
    }
  ): Promise<ExecutionUpdate> {
    const res = await apiFetch(`${API_BASE}/projects/${encodeURIComponent(workId)}/execution-updates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to submit execution update');
    }
    const json = await res.json();
    return json.data;
  }

  /**
   * Update draft or revise submission
   */
  static async updateExecutionSubmission(
    updateId: string,
    payload: {
      physical_progress?: number;
      milestone_status?: string;
      remarks?: string;
      delay_reason?: string;
      expected_completion_date?: string;
      submit_for_review?: boolean;
    }
  ): Promise<ExecutionUpdate> {
    const res = await apiFetch(`${API_BASE}/execution-updates/${encodeURIComponent(updateId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update submission');
    }
    const json = await res.json();
    return json.data;
  }

  /**
   * Upload / attach evidence record
   */
  static async uploadEvidence(
    workId: string,
    payload: {
      house: 'Lok Sabha' | 'Rajya Sabha';
      file_name: string;
      file_type: string;
      storage_path: string;
      description?: string;
      execution_update_id?: string;
      file_size_bytes?: number;
    }
  ): Promise<ExecutionEvidence> {
    const res = await apiFetch(`${API_BASE}/projects/${encodeURIComponent(workId)}/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to attach evidence');
    }
    const json = await res.json();
    return json.data;
  }

  /**
   * Fetch action center attention items
   */
  static async getActionCenter(): Promise<ExecutionActionItem[]> {
    const res = await apiFetch(`${API_BASE}/action-center`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to load action center');
    }
    const json = await res.json();
    return json.data;
  }

  /**
   * Fetch agency profile metadata
   */
  static async getProfile(): Promise<any> {
    const res = await apiFetch(`${API_BASE}/profile`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to load agency profile');
    }
    const json = await res.json();
    return json.data;
  }
}
