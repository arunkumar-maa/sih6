import { supabase } from './client';
import type { VerificationStatus } from '../types';

export interface AuditorKPIs {
  casesAwaitingReview: number;
  highRiskCases: number;
  mediumRiskCases: number;
  inspectionRequested: number;
  underReview: number;
  verified: number;
  needsFurtherInvestigation: number;
  dismissed: number;
  totalCases: number;
  totalSanctionAmount: number;
}

export interface AuditorQueueFilters {
  house?: 'Lok Sabha' | 'Rajya Sabha';
  state?: string;
  district?: string;
  constituency?: string;
  mpName?: string;
  financialYear?: string;
  riskLevel?: string;
  anomalyCategory?: string;
  verificationStatus?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuditorQueueItem {
  priority: 'CRITICAL' | 'ELEVATED' | 'STANDARD';
  workId: string;
  state: string;
  district: string;
  constituency: string;
  mp: string;
  house: 'Lok Sabha' | 'Rajya Sabha';
  anomalyType: string;
  riskScore: number;
  riskLevel: string;
  detectedDate: string;
  verificationStatus: string;
  workDescription: string;
  sanctionAmount: number;
  totalPaid: number;
  disbursementRatio: number;
  workStatus: string;
  verificationHistory: any[];
}

export interface AuditorQueueResponse {
  records: AuditorQueueItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CaseFileDetail {
  project: any;
  anomalyRecord?: any;
  whyAttention: Array<{
    label: string;
    detail: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    metric?: string;
  }>;
  potentialSimilarWork?: {
    workA: { workId: string; description: string; sanctionAmount: number };
    workB: { workId: string; description: string; sanctionAmount: number; mp: string; riskScore: number; riskLevel: string };
    similarityScore: number;
  } | null;
  timelineEvents: Array<{
    title: string;
    timestamp: string;
    type: string;
    description: string;
    actor?: string;
  }>;
  evidence: {
    available: boolean;
    documents: any[];
    message: string;
    inspectionRecords: any[];
  };
  verificationHistory: any[];
}

export interface AuditTrailRecord {
  id: string;
  work_id: string;
  house: string;
  actor_id?: string;
  actor_name: string;
  actor_role: string;
  action: string;
  previous_status?: string;
  new_status?: string;
  comment?: string;
  reason?: string;
  priority?: string;
  metadata?: any;
  created_at: string;
}

async function getAuthHeader(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fetch Auditor KPIs from backend API (or fallback to Supabase RPC directly)
 */
export async function getAuditorKPIs(
  house: 'Lok Sabha' | 'Rajya Sabha' = 'Lok Sabha',
  state?: string,
  district?: string
): Promise<AuditorKPIs> {
  try {
    const headers = await getAuthHeader();
    const params = new URLSearchParams({ house });
    if (state) params.set('state', state);
    if (district) params.set('district', district);

    const res = await fetch(`/api/auditor/kpis?${params.toString()}`, { headers });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch {
    // API server unreachable -> fallback to direct Supabase RPC
  }

  // Fallback to direct Supabase RPC
  const { data, error } = await supabase.rpc('get_auditor_kpis', {
    p_house: house,
    p_state: state || null,
    p_district: district || null,
  });

  if (error) {
    throw new Error(`Failed to load KPIs: ${error.message}`);
  }

  return (
    data || {
      casesAwaitingReview: 0,
      highRiskCases: 0,
      mediumRiskCases: 0,
      inspectionRequested: 0,
      underReview: 0,
      verified: 0,
      needsFurtherInvestigation: 0,
      dismissed: 0,
      totalCases: 0,
      totalSanctionAmount: 0,
    }
  );
}

/**
 * Fetch server-side paginated verification queue
 */
export async function getAuditorQueue(filters: AuditorQueueFilters): Promise<AuditorQueueResponse> {
  try {
    const headers = await getAuthHeader();
    const params = new URLSearchParams();
    if (filters.house) params.set('house', filters.house);
    if (filters.state) params.set('state', filters.state);
    if (filters.district) params.set('district', filters.district);
    if (filters.constituency) params.set('constituency', filters.constituency);
    if (filters.mpName) params.set('mpName', filters.mpName);
    if (filters.financialYear) params.set('financialYear', filters.financialYear);
    if (filters.riskLevel) params.set('riskLevel', filters.riskLevel);
    if (filters.anomalyCategory) params.set('anomalyCategory', filters.anomalyCategory);
    if (filters.verificationStatus) params.set('verificationStatus', filters.verificationStatus);
    if (filters.search) params.set('search', filters.search);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

    const res = await fetch(`/api/auditor/queue?${params.toString()}`, { headers });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch {
    // Fallback to Supabase direct query
  }

  // Supabase direct query fallback
  const house = filters.house || 'Lok Sabha';
  const tableName = house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.min(100, Math.max(5, Number(filters.pageSize) || 25));
  const offset = (page - 1) * pageSize;

  let q = supabase
    .from(tableName)
    .select(
      `
      work_id, work_description, work_category, state, district, constituency,
      mp_name, house, financial_year, sanction_amount, total_paid, amount_disbursed,
      disbursement_ratio, work_status, risk_score, risk_level, risk_factors,
      risk_explanation, verification_status, verification_history, sanction_date,
      recommended_date, created_at
    `,
      { count: 'exact' }
    );

  if (filters.state) q = q.eq('state', filters.state);
  if (filters.district) q = q.ilike('district', `%${filters.district.split('(')[0].trim()}%`);
  if (filters.constituency && house === 'Lok Sabha') q = q.eq('constituency', filters.constituency);
  if (filters.mpName) q = q.ilike('mp_name', `%${filters.mpName}%`);
  if (filters.financialYear && filters.financialYear !== 'all') q = q.eq('financial_year', filters.financialYear);
  if (filters.riskLevel && filters.riskLevel !== 'all') q = q.eq('risk_level', filters.riskLevel.toUpperCase());
  if (filters.verificationStatus && filters.verificationStatus !== 'all') {
    if (filters.verificationStatus === 'New Alert') {
      q = q.or('verification_status.eq.New Alert,verification_status.is.null');
    } else {
      q = q.eq('verification_status', filters.verificationStatus);
    }
  }

  if (filters.search && filters.search.trim()) {
    const s = filters.search.trim();
    q = q.or(`work_id.ilike.%${s}%,work_description.ilike.%${s}%,mp_name.ilike.%${s}%,district.ilike.%${s}%`);
  }

  const sortBy = filters.sortBy || 'risk_score';
  const ascending = filters.sortOrder === 'asc';
  q = q.order(sortBy, { ascending }).order('sanction_amount', { ascending: false });
  q = q.range(offset, offset + pageSize - 1);

  const { data, count, error } = await q;
  if (error) throw error;

  const totalCount = count || 0;
  const records: AuditorQueueItem[] = (data || []).map((p: any) => {
    let anomalyType = 'Standard Review';
    const riskFactors = Array.isArray(p.risk_factors) ? p.risk_factors : [];
    if (riskFactors.length > 0) {
      anomalyType = riskFactors[0].label || riskFactors[0].id || 'Anomaly Flag';
    } else if (p.sanction_amount > 2500000) {
      anomalyType = 'Cost Anomaly (Outlier)';
    } else if (p.disbursement_ratio > 1) {
      anomalyType = 'Disbursement Mismatch';
    } else if (p.days_since_sanction > 300) {
      anomalyType = 'Stale Timeline';
    }

    const level = (p.risk_level || 'LOW').toUpperCase();
    const priority = level === 'HIGH' ? 'CRITICAL' : level === 'MEDIUM' ? 'ELEVATED' : 'STANDARD';

    return {
      priority,
      workId: p.work_id,
      state: p.state || 'N/A',
      district: p.district || 'N/A',
      constituency: p.constituency || 'N/A',
      mp: p.mp_name || 'N/A',
      house: p.house || house,
      anomalyType,
      riskScore: Number(p.risk_score) || 0,
      riskLevel: level,
      detectedDate: p.sanction_date || p.recommended_date || p.created_at || new Date().toISOString(),
      verificationStatus: p.verification_status || 'New Alert',
      workDescription: p.work_description || p.work_category || 'Work Description Unavailable',
      sanctionAmount: Number(p.sanction_amount) || 0,
      totalPaid: Number(p.total_paid || p.amount_disbursed) || 0,
      disbursementRatio: Number(p.disbursement_ratio) || 0,
      workStatus: p.work_status || 'Under Execution',
      verificationHistory: Array.isArray(p.verification_history) ? p.verification_history : [],
    };
  });

  return {
    records,
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

/**
 * Fetch full Case File for Auditor
 */
export async function getAuditorCaseFile(
  workId: string,
  house: 'Lok Sabha' | 'Rajya Sabha' = 'Lok Sabha'
): Promise<CaseFileDetail> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`/api/auditor/case/${encodeURIComponent(workId)}?house=${encodeURIComponent(house)}`, { headers });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch {
    // Fallback below
  }

  // Direct Supabase query fallback
  const tableName = house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';
  const { data: project, error } = await supabase.from(tableName).select('*').eq('work_id', workId).single();
  if (error || !project) throw new Error(`Case ${workId} not found`);

  const { data: anomalyRecord } = await supabase.from('project_anomaly_results').select('*').eq('work_id', workId).maybeSingle();

  const whyAttention: any[] = [];
  const factors = Array.isArray(project.risk_factors) ? project.risk_factors : [];
  factors.forEach((f: any) => {
    whyAttention.push({
      label: f.label || f.id || 'Risk Factor',
      detail: f.description || 'Elevated anomaly indicator detected by intelligence engine.',
      severity: f.severity || (f.score > 30 ? 'HIGH' : f.score > 15 ? 'MEDIUM' : 'LOW'),
      metric: f.value !== undefined ? String(f.value) : undefined,
    });
  });

  if (whyAttention.length === 0) {
    if (project.days_since_sanction > 180 && project.work_status !== 'Work Completed') {
      whyAttention.push({
        label: 'Stale Status',
        detail: `${project.days_since_sanction} days since sanction without completion`,
        severity: project.days_since_sanction > 365 ? 'HIGH' : 'MEDIUM',
        metric: `${project.days_since_sanction} days`,
      });
    }
    if (project.disbursement_ratio > 1) {
      whyAttention.push({
        label: 'Disbursement Mismatch',
        detail: `Disbursed ${Math.round(project.disbursement_ratio * 100)}% of sanctioned limit`,
        severity: 'HIGH',
        metric: `${Math.round(project.disbursement_ratio * 100)}%`,
      });
    }
    if (project.sanction_amount > 2500000) {
      whyAttention.push({
        label: 'Cost Anomaly',
        detail: `Cost exceeds category threshold: ₹${(project.sanction_amount / 100000).toFixed(1)} Lakh`,
        severity: 'MEDIUM',
        metric: `₹${(project.sanction_amount / 100000).toFixed(1)}L`,
      });
    }
  }

  const history = Array.isArray(project.verification_history) ? project.verification_history : [];

  const timelineEvents = [
    ...(project.recommended_date
      ? [{ title: 'Work Recommended', timestamp: project.recommended_date, type: 'MP_RECOMMENDATION', description: `Recommended by MP ${project.mp_name || ''}` }]
      : []),
    ...(project.sanction_date
      ? [{ title: 'Sanction Accorded', timestamp: project.sanction_date, type: 'SANCTION', description: `Sanctioned amount ₹${((project.sanction_amount || 0) / 100000).toFixed(2)} Lakh` }]
      : []),
    {
      title: 'AI Anomaly & Risk Evaluation',
      timestamp: project.sanction_date || project.created_at || new Date().toISOString(),
      type: 'SYSTEM_ANOMALY',
      description: `Risk score: ${project.risk_score || 0}/100 (${project.risk_level || 'LOW'})`,
      actor: 'MPLADS Sentinel AI Engine',
    },
    ...history.map((h: any) => ({
      title: h.action || 'Verification Action',
      timestamp: h.timestamp || new Date().toISOString(),
      type: 'VERIFICATION_ACTION',
      description: h.comment || 'Action recorded',
      actor: h.actor || 'Auditor',
    })),
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return {
    project,
    anomalyRecord,
    whyAttention,
    potentialSimilarWork: null,
    timelineEvents,
    evidence: {
      available: false,
      documents: [],
      message: 'Evidence documents not uploaded for this work record in the central portal.',
      inspectionRecords: [],
    },
    verificationHistory: history,
  };
}

/**
 * Update verification status (New Alert, Under Review, Verified, Needs Further Investigation, Dismissed)
 */
export async function updateAuditorStatus(
  workId: string,
  house: 'Lok Sabha' | 'Rajya Sabha',
  status: VerificationStatus,
  comment?: string
) {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/auditor/case/${encodeURIComponent(workId)}/status`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ house, status, comment }),
  });

  if (res.ok) {
    const json = await res.json();
    return json.data;
  }

  // Direct Supabase fallback
  const tableName = house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';
  const { data: cur } = await supabase.from(tableName).select('verification_history').eq('work_id', workId).single();
  const history = Array.isArray(cur?.verification_history) ? cur.verification_history : [];

  const newEvent = {
    timestamp: new Date().toISOString(),
    action: `Status updated to ${status}`,
    comment: comment || `Status updated to ${status}`,
    actor: 'Auditor / Verification Officer',
  };

  const updatedHistory = [newEvent, ...history];

  await supabase
    .from(tableName)
    .update({
      verification_status: status,
      verification_history: updatedHistory,
      updated_at: new Date().toISOString(),
    })
    .eq('work_id', workId);

  // Insert to audit_trail
  await supabase.from('audit_trail').insert({
    work_id: workId,
    house,
    actor_name: 'Auditor / Verification Officer',
    actor_role: 'AUDITOR',
    action: 'VERIFICATION_STATUS_UPDATED',
    new_status: status,
    comment: comment || `Status updated to ${status}`,
  });

  return { success: true, newStatus: status, updatedHistory };
}

/**
 * Formal Inspection Request
 */
export async function requestAuditorInspection(
  workId: string,
  house: 'Lok Sabha' | 'Rajya Sabha',
  payload: { reason: string; priority: string; notes: string }
) {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/auditor/case/${encodeURIComponent(workId)}/inspect`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ house, ...payload }),
  });

  if (res.ok) {
    const json = await res.json();
    return json.data;
  }

  // Fallback direct
  return updateAuditorStatus(
    workId,
    house,
    'Inspection Requested',
    `[Priority: ${payload.priority}] ${payload.reason}: ${payload.notes}`
  );
}

/**
 * Add Review Note
 */
export async function addAuditorReviewNote(
  workId: string,
  house: 'Lok Sabha' | 'Rajya Sabha',
  note: string
) {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/auditor/case/${encodeURIComponent(workId)}/note`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ house, note }),
  });

  if (res.ok) {
    const json = await res.json();
    return json.data;
  }

  // Direct Supabase fallback
  const tableName = house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';
  const { data: cur } = await supabase.from(tableName).select('verification_history').eq('work_id', workId).single();
  const history = Array.isArray(cur?.verification_history) ? cur.verification_history : [];

  const newEvent = {
    timestamp: new Date().toISOString(),
    action: 'Audit Review Note',
    comment: note,
    actor: 'Auditor / Verification Officer',
  };

  const updatedHistory = [newEvent, ...history];

  await supabase
    .from(tableName)
    .update({
      verification_history: updatedHistory,
      updated_at: new Date().toISOString(),
    })
    .eq('work_id', workId);

  await supabase.from('audit_trail').insert({
    work_id: workId,
    house,
    actor_name: 'Auditor / Verification Officer',
    actor_role: 'AUDITOR',
    action: 'REVIEW_NOTE_ADDED',
    comment: note,
  });

  return { success: true, updatedHistory };
}

/**
 * Fetch Recent Verification Activity
 */
export async function getAuditorRecentActivity(house?: 'Lok Sabha' | 'Rajya Sabha', limit: number = 10): Promise<AuditTrailRecord[]> {
  try {
    const headers = await getAuthHeader();
    const params = new URLSearchParams({ limit: String(limit) });
    if (house) params.set('house', house);

    const res = await fetch(`/api/auditor/recent-activity?${params.toString()}`, { headers });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch {
    // Fallback
  }

  let query = supabase.from('audit_trail').select('*').order('created_at', { ascending: false }).limit(limit);
  if (house) query = query.eq('house', house);
  const { data } = await query;
  return data || [];
}

/**
 * Fetch Full Audit Trail List
 */
export async function getAuditorAuditTrail(params: {
  page?: number;
  pageSize?: number;
  house?: string;
  action?: string;
  search?: string;
}) {
  try {
    const headers = await getAuthHeader();
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    if (params.house) q.set('house', params.house);
    if (params.action) q.set('action', params.action);
    if (params.search) q.set('search', params.search);

    const res = await fetch(`/api/auditor/audit-trail?${q.toString()}`, { headers });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch {
    // Fallback
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 25;
  const offset = (page - 1) * pageSize;

  let query = supabase.from('audit_trail').select('*', { count: 'exact' });
  if (params.house) query = query.eq('house', params.house);
  if (params.action && params.action !== 'all') query = query.eq('action', params.action);
  if (params.search && params.search.trim()) {
    const s = params.search.trim();
    query = query.or(`work_id.ilike.%${s}%,actor_name.ilike.%${s}%,comment.ilike.%${s}%`);
  }

  query = query.order('created_at', { ascending: false }).range(offset, offset + pageSize - 1);
  const { data, count, error } = await query;
  if (error) throw error;

  return {
    records: data || [],
    totalCount: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}
