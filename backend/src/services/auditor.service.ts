import { supabase } from './supabase.service.js';
import type { VerificationStatus } from '../types/index.js';

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

export interface AuditorKPIData {
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

/**
 * Fetch real aggregate KPI counts from database via get_auditor_kpis stored procedure
 */
export async function fetchAuditorKPIs(
  house: 'Lok Sabha' | 'Rajya Sabha' = 'Lok Sabha',
  state?: string,
  district?: string
): Promise<AuditorKPIData> {
  const { data, error } = await supabase.rpc('get_auditor_kpis', {
    p_house: house,
    p_state: state || null,
    p_district: district || null,
  });

  if (error) {
    console.error('[AuditorService] Error fetching auditor KPIs:', error);
    throw new Error(`Failed to load auditor KPIs: ${error.message}`);
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
 * Fetch server-side paginated verification queue of real projects
 */
export async function fetchAuditorQueue(filters: AuditorQueueFilters) {
  const house = filters.house || 'Lok Sabha';
  const tableName = house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.min(100, Math.max(5, Number(filters.pageSize) || 25));
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from(tableName)
    .select(
      `
      work_id,
      work_description,
      work_category,
      state,
      district,
      constituency,
      mp_name,
      house,
      financial_year,
      sanction_amount,
      total_paid,
      amount_disbursed,
      expenditure_amount,
      disbursement_ratio,
      work_status,
      risk_score,
      risk_level,
      risk_factors,
      risk_explanation,
      verification_status,
      verification_history,
      sanction_date,
      recommended_date,
      created_at
    `,
      { count: 'exact' }
    );

  // Geographic / Scope Filters
  if (filters.state) {
    query = query.eq('state', filters.state);
  }
  if (filters.district) {
    const cleanDist = filters.district.split('(')[0].trim();
    query = query.ilike('district', `%${cleanDist}%`);
  }
  if (filters.constituency && house === 'Lok Sabha') {
    query = query.eq('constituency', filters.constituency);
  }
  if (filters.mpName) {
    query = query.ilike('mp_name', `%${filters.mpName}%`);
  }
  if (filters.financialYear && filters.financialYear !== 'all') {
    query = query.eq('financial_year', filters.financialYear);
  }

  // Risk Level Filter
  if (filters.riskLevel && filters.riskLevel !== 'all') {
    query = query.eq('risk_level', filters.riskLevel.toUpperCase());
  }

  // Verification Status Filter
  if (filters.verificationStatus && filters.verificationStatus !== 'all') {
    if (filters.verificationStatus === 'New Alert') {
      query = query.or('verification_status.eq.New Alert,verification_status.is.null');
    } else {
      query = query.eq('verification_status', filters.verificationStatus);
    }
  }

  // Anomaly Category Filter (mapped to project risk criteria)
  if (filters.anomalyCategory && filters.anomalyCategory !== 'all') {
    switch (filters.anomalyCategory) {
      case 'cost':
        query = query.gt('sanction_amount', 2500000);
        break;
      case 'stale':
        query = query.eq('is_completed', false).gt('days_since_sanction', 180);
        break;
      case 'disbursement':
        query = query.gt('total_paid', 0).neq('work_status', 'Work Completed');
        break;
      case 'pending':
        query = query.or('is_recommended_only.eq.true,is_sanctioned.eq.false');
        break;
      case 'vendor':
        query = query.not('vendor_name', 'is', null);
        break;
    }
  }

  // Search filter
  if (filters.search && filters.search.trim()) {
    const s = filters.search.trim();
    if (house === 'Lok Sabha') {
      query = query.or(
        `work_id.ilike.%${s}%,work_description.ilike.%${s}%,mp_name.ilike.%${s}%,district.ilike.%${s}%,constituency.ilike.%${s}%`
      );
    } else {
      query = query.or(
        `work_id.ilike.%${s}%,work_description.ilike.%${s}%,mp_name.ilike.%${s}%,district.ilike.%${s}%`
      );
    }
  }

  // Sorting
  const sortBy = filters.sortBy || 'risk_score';
  const ascending = filters.sortOrder === 'asc';
  query = query.order(sortBy, { ascending }).order('sanction_amount', { ascending: false });

  // Pagination
  query = query.range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('[AuditorService] Error fetching auditor queue:', error);
    throw new Error(`Failed to load verification queue: ${error.message}`);
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const records: AuditorQueueItem[] = (data || []).map((p: any) => {
    // Derive human-readable primary anomaly indicator
    let anomalyType = 'Standard Review';
    const riskFactors = Array.isArray(p.risk_factors) ? p.risk_factors : [];
    if (riskFactors.length > 0) {
      const topFactor = riskFactors[0];
      anomalyType = topFactor.label || topFactor.id || 'Anomaly Flag';
    } else if (p.sanction_amount > 2500000) {
      anomalyType = 'Cost Anomaly (Outlier)';
    } else if (p.disbursement_ratio > 1) {
      anomalyType = 'Disbursement Mismatch';
    } else if (p.days_since_sanction > 300) {
      anomalyType = 'Stale Timeline';
    }

    const level = (p.risk_level || 'LOW').toUpperCase();
    const priority: 'CRITICAL' | 'ELEVATED' | 'STANDARD' =
      level === 'HIGH' ? 'CRITICAL' : level === 'MEDIUM' ? 'ELEVATED' : 'STANDARD';

    const detectedDate = p.sanction_date || p.recommended_date || p.created_at || new Date().toISOString();

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
      detectedDate,
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
    totalPages,
  };
}

/**
 * Fetch a complete, unadulterated Case File for a specific Work ID
 */
export async function fetchAuditorCaseFile(workId: string, house: 'Lok Sabha' | 'Rajya Sabha' = 'Lok Sabha') {
  const tableName = house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';

  // 1. Fetch real project record
  const { data: project, error: projectError } = await supabase
    .from(tableName)
    .select('*')
    .eq('work_id', workId)
    .single();

  if (projectError || !project) {
    throw new Error(`Project ${workId} not found in ${house}`);
  }

  // 2. Fetch cached anomaly intelligence if present
  const { data: anomalyRecord } = await supabase
    .from('project_anomaly_results')
    .select('*')
    .eq('work_id', workId)
    .maybeSingle();

  // 3. Construct canonical Why Attention risk factors
  const whyAttention: Array<{ label: string; detail: string; severity: 'HIGH' | 'MEDIUM' | 'LOW'; metric?: string }> = [];

  const riskFactors = Array.isArray(project.risk_factors) ? project.risk_factors : [];
  riskFactors.forEach((rf: any) => {
    whyAttention.push({
      label: rf.label || rf.id || 'Risk Factor',
      detail: rf.description || 'Elevated anomaly indicator detected by intelligence engine.',
      severity: (rf.severity || (rf.score > 30 ? 'HIGH' : rf.score > 15 ? 'MEDIUM' : 'LOW')) as any,
      metric: rf.value !== undefined ? String(rf.value) : undefined,
    });
  });

  if (whyAttention.length === 0) {
    if (anomalyRecord && Array.isArray(anomalyRecord.why_attention)) {
      anomalyRecord.why_attention.forEach((str: string) => {
        whyAttention.push({
          label: 'Anomaly Signal',
          detail: str,
          severity: project.risk_level === 'HIGH' ? 'HIGH' : 'MEDIUM',
        });
      });
    } else {
      if (project.days_since_sanction > 180 && project.work_status !== 'Work Completed') {
        whyAttention.push({
          label: 'Stale Status',
          detail: `${project.days_since_sanction} days elapsed since sanction without completion.`,
          severity: project.days_since_sanction > 365 ? 'HIGH' : 'MEDIUM',
          metric: `${project.days_since_sanction} days`,
        });
      }
      if (project.disbursement_ratio > 1) {
        whyAttention.push({
          label: 'Disbursement Mismatch',
          detail: `Disbursed amount is ${Math.round(project.disbursement_ratio * 100)}% of sanction value.`,
          severity: 'HIGH',
          metric: `${Math.round(project.disbursement_ratio * 100)}%`,
        });
      }
      if (project.sanction_amount > 2500000) {
        whyAttention.push({
          label: 'Cost Anomaly',
          detail: `Sanctioned expenditure of ₹${(project.sanction_amount / 100000).toFixed(1)} Lakh exceeds standard threshold.`,
          severity: 'MEDIUM',
          metric: `₹${(project.sanction_amount / 100000).toFixed(1)}L`,
        });
      }
    }
  }

  // 4. Look up potential similar work in the same constituency or district
  let potentialSimilarWork: any = null;
  if (project.district) {
    const { data: similarCandidates } = await supabase
      .from(tableName)
      .select('work_id, work_description, work_category, sanction_amount, mp_name, risk_score, risk_level')
      .eq('district', project.district)
      .neq('work_id', workId)
      .limit(10);

    if (similarCandidates && similarCandidates.length > 0) {
      // Find candidate with most shared word tokens
      const baseTokens = new Set(
        (project.work_description || '')
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter((t: string) => t.length > 3)
      );

      let bestScore = 0;
      let bestMatch: any = null;

      for (const cand of similarCandidates) {
        const candTokens = (cand.work_description || '')
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter((t: string) => t.length > 3);

        if (candTokens.length === 0 || baseTokens.size === 0) continue;

        let intersection = 0;
        candTokens.forEach((t: string) => {
          if (baseTokens.has(t)) intersection++;
        });

        const sim = intersection / Math.sqrt(baseTokens.size * candTokens.length);
        if (sim > bestScore) {
          bestScore = sim;
          bestMatch = cand;
        }
      }

      if (bestMatch && bestScore >= 0.45) {
        potentialSimilarWork = {
          workA: {
            workId: project.work_id,
            description: project.work_description,
            sanctionAmount: project.sanction_amount,
          },
          workB: {
            workId: bestMatch.work_id,
            description: bestMatch.work_description,
            sanctionAmount: bestMatch.sanction_amount,
            mp: bestMatch.mp_name,
            riskScore: bestMatch.risk_score,
            riskLevel: bestMatch.risk_level,
          },
          similarityScore: Math.min(0.96, Math.round(bestScore * 100)),
        };
      }
    }
  }

  // 5. Build timeline from real project dates & verification history
  const verificationHistory = Array.isArray(project.verification_history) ? project.verification_history : [];

  const timelineEvents: Array<{ title: string; timestamp: string; type: string; description: string; actor?: string }> = [];

  if (project.recommended_date) {
    timelineEvents.push({
      title: 'Work Recommended by MP',
      timestamp: project.recommended_date,
      type: 'MP_RECOMMENDATION',
      description: `Recommended by Hon'ble MP ${project.mp_name || ''}`,
    });
  }
  if (project.sanction_date) {
    timelineEvents.push({
      title: 'Administrative Sanction Accorded',
      timestamp: project.sanction_date,
      type: 'SANCTION',
      description: `Sanctioned amount ₹${((project.sanction_amount || 0) / 100000).toFixed(2)} Lakh by District Authority`,
    });
  }
  if (project.completion_date) {
    timelineEvents.push({
      title: 'Milestone: Work Completed',
      timestamp: project.completion_date,
      type: 'COMPLETION',
      description: 'Physical completion recorded by Implementing Agency',
    });
  }

  timelineEvents.push({
    title: 'AI Anomaly & Risk Profile Detected',
    timestamp: project.created_at || project.sanction_date || new Date().toISOString(),
    type: 'SYSTEM_ANOMALY',
    description: `Computed ${project.risk_level || 'LOW'} risk (${project.risk_score || 0}/100) with ${whyAttention.length} attention indicators.`,
    actor: 'MPLADS Sentinel AI Engine',
  });

  // Add historical officer verification actions
  verificationHistory.forEach((ev: any) => {
    timelineEvents.push({
      title: ev.action || 'Verification Action',
      timestamp: ev.timestamp || new Date().toISOString(),
      type: 'VERIFICATION_ACTION',
      description: ev.comment || 'Official observation recorded',
      actor: ev.actor || 'Auditor',
    });
  });

  // Sort chronological
  timelineEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // 6. Evidence representation
  const evidence = {
    available: false,
    documents: [] as any[],
    message: 'Evidence documents not uploaded for this work record in the central portal.',
    inspectionRecords: [] as any[],
  };

  return {
    project,
    anomalyRecord,
    whyAttention,
    potentialSimilarWork,
    timelineEvents,
    evidence,
    verificationHistory,
  };
}

/**
 * Update verification status, append to verification_history on project, and record in audit_trail
 */
export async function updateAuditorStatus(
  workId: string,
  house: 'Lok Sabha' | 'Rajya Sabha',
  status: VerificationStatus,
  comment: string,
  actorName: string,
  actorRole: string,
  actorId?: string
) {
  const tableName = house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';

  // 1. Fetch current status and history
  const { data: current, error: fetchErr } = await supabase
    .from(tableName)
    .select('verification_status, verification_history')
    .eq('work_id', workId)
    .single();

  if (fetchErr || !current) {
    throw new Error(`Project ${workId} not found`);
  }

  const previousStatus = current.verification_status || 'New Alert';
  const existingHistory = Array.isArray(current.verification_history) ? current.verification_history : [];

  const newEvent = {
    timestamp: new Date().toISOString(),
    action: `Status changed to ${status}`,
    previousStatus,
    newStatus: status,
    actor: `${actorName} (${actorRole})`,
    comment: comment || `Verification status transitioned to ${status}`,
  };

  const updatedHistory = [newEvent, ...existingHistory];

  // 2. Update project record (ONLY verification columns; source project data remains untouched)
  const { error: updateErr } = await supabase
    .from(tableName)
    .update({
      verification_status: status,
      verification_history: updatedHistory,
      updated_at: new Date().toISOString(),
    })
    .eq('work_id', workId);

  if (updateErr) {
    console.error('[AuditorService] Error updating project verification:', updateErr);
    throw new Error(`Failed to update project status: ${updateErr.message}`);
  }

  // 3. Log into canonical audit_trail table
  const { error: auditErr } = await supabase.from('audit_trail').insert({
    work_id: workId,
    house,
    actor_id: actorId || null,
    actor_name: actorName,
    actor_role: actorRole,
    action: 'VERIFICATION_STATUS_UPDATED',
    previous_status: previousStatus,
    new_status: status,
    comment: comment || `Status updated from "${previousStatus}" to "${status}"`,
    metadata: { source: 'AUDITOR_VERIFICATION_DESK' },
  });

  if (auditErr) {
    console.warn('[AuditorService] Warning logging audit trail:', auditErr);
  }

  return { success: true, newStatus: status, previousStatus, updatedHistory };
}

/**
 * Request formal on-site or technical inspection
 */
export async function requestAuditorInspection(
  workId: string,
  house: 'Lok Sabha' | 'Rajya Sabha',
  payload: { reason: string; priority: string; notes: string },
  actorName: string,
  actorRole: string,
  actorId?: string
) {
  const tableName = house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';

  const { data: current, error: fetchErr } = await supabase
    .from(tableName)
    .select('verification_status, verification_history')
    .eq('work_id', workId)
    .single();

  if (fetchErr || !current) {
    throw new Error(`Project ${workId} not found`);
  }

  const previousStatus = current.verification_status || 'New Alert';
  const existingHistory = Array.isArray(current.verification_history) ? current.verification_history : [];

  const newEvent = {
    timestamp: new Date().toISOString(),
    action: 'Inspection Requested',
    previousStatus,
    newStatus: 'Inspection Requested',
    actor: `${actorName} (${actorRole})`,
    comment: `[Priority: ${payload.priority || 'High'}] ${payload.reason}: ${payload.notes}`,
    reason: payload.reason,
    priority: payload.priority,
  };

  const updatedHistory = [newEvent, ...existingHistory];

  // Update project status to 'Inspection Requested'
  const { error: updateErr } = await supabase
    .from(tableName)
    .update({
      verification_status: 'Inspection Requested',
      verification_history: updatedHistory,
      updated_at: new Date().toISOString(),
    })
    .eq('work_id', workId);

  if (updateErr) {
    throw new Error(`Failed to request inspection: ${updateErr.message}`);
  }

  // Log in audit_trail
  await supabase.from('audit_trail').insert({
    work_id: workId,
    house,
    actor_id: actorId || null,
    actor_name: actorName,
    actor_role: actorRole,
    action: 'INSPECTION_REQUESTED',
    previous_status: previousStatus,
    new_status: 'Inspection Requested',
    reason: payload.reason,
    priority: payload.priority,
    comment: payload.notes,
    metadata: { source: 'AUDITOR_VERIFICATION_DESK' },
  });

  return { success: true, newStatus: 'Inspection Requested', updatedHistory };
}

/**
 * Append review note to verification history without altering project data
 */
export async function addAuditorReviewNote(
  workId: string,
  house: 'Lok Sabha' | 'Rajya Sabha',
  note: string,
  actorName: string,
  actorRole: string,
  actorId?: string
) {
  const tableName = house === 'Rajya Sabha' ? 'rajya_sabha_projects' : 'lok_sabha_projects';

  const { data: current, error: fetchErr } = await supabase
    .from(tableName)
    .select('verification_status, verification_history')
    .eq('work_id', workId)
    .single();

  if (fetchErr || !current) {
    throw new Error(`Project ${workId} not found`);
  }

  const existingHistory = Array.isArray(current.verification_history) ? current.verification_history : [];

  const newNoteEvent = {
    timestamp: new Date().toISOString(),
    action: 'Audit Review Note',
    actor: `${actorName} (${actorRole})`,
    comment: note,
  };

  const updatedHistory = [newNoteEvent, ...existingHistory];

  const { error: updateErr } = await supabase
    .from(tableName)
    .update({
      verification_history: updatedHistory,
      updated_at: new Date().toISOString(),
    })
    .eq('work_id', workId);

  if (updateErr) {
    throw new Error(`Failed to save review note: ${updateErr.message}`);
  }

  // Log in audit_trail
  await supabase.from('audit_trail').insert({
    work_id: workId,
    house,
    actor_id: actorId || null,
    actor_name: actorName,
    actor_role: actorRole,
    action: 'REVIEW_NOTE_ADDED',
    comment: note,
    metadata: { source: 'AUDITOR_VERIFICATION_DESK' },
  });

  return { success: true, updatedHistory };
}

/**
 * Fetch recent verification activity from audit_trail
 */
export async function fetchRecentAuditActivity(limit: number = 10, house?: 'Lok Sabha' | 'Rajya Sabha') {
  let query = supabase
    .from('audit_trail')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (house) {
    query = query.eq('house', house);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[AuditorService] Error loading recent audit activity:', error);
    return [];
  }
  return data || [];
}

/**
 * Fetch paginated audit trail for the Audit Trail module
 */
export async function fetchAuditTrailList(
  page: number = 1,
  pageSize: number = 25,
  house?: 'Lok Sabha' | 'Rajya Sabha',
  action?: string,
  search?: string
) {
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('audit_trail')
    .select('*', { count: 'exact' });

  if (house) {
    query = query.eq('house', house);
  }
  if (action && action !== 'all') {
    query = query.eq('action', action);
  }
  if (search && search.trim()) {
    const s = search.trim();
    query = query.or(`work_id.ilike.%${s}%,actor_name.ilike.%${s}%,comment.ilike.%${s}%`);
  }

  query = query.order('created_at', { ascending: false }).range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('[AuditorService] Error fetching audit trail list:', error);
    throw new Error(`Failed to load audit trail: ${error.message}`);
  }

  return {
    records: data || [],
    totalCount: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}
