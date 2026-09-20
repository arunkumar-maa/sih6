import { supabase } from './supabase.service.js';
import type { UserProfile } from '../types/auth.js';
import type {
  AgencyKPIs,
  ExecutionUpdate,
  ExecutionEvidence,
  ExecutionActionItem,
  ProjectQueryParams,
  ImplementingAgencyMasterProfile,
} from '../types/agency.js';

export class ImplementingAgencyService {
  /**
   * Resolves agency UUID from profile
   */
  static async resolveAgency(profile?: UserProfile): Promise<ImplementingAgencyMasterProfile> {
    if (!profile || profile.role !== 'IMPLEMENTING_AGENCY') {
      throw new Error('Access denied: Authentication as IMPLEMENTING_AGENCY required.');
    }

    if (profile.agency_id) {
      const { data, error } = await supabase
        .from('implementing_agency_profiles')
        .select('*')
        .eq('id', profile.agency_id)
        .single();
      if (!error && data) return data as ImplementingAgencyMasterProfile;
    }

    if (profile.agency_name) {
      const norm = profile.agency_name.trim().replace(/\s+/g, ' ').toLowerCase();
      const { data, error } = await supabase
        .from('implementing_agency_profiles')
        .select('*')
        .eq('normalized_agency_name', norm)
        .single();
      if (!error && data) return data as ImplementingAgencyMasterProfile;
    }

    throw new Error('Agency profile could not be resolved for current session.');
  }

  /**
   * Get real dataset KPIs for the agency
   */
  static async getDashboardKPIs(agencyId: string, house?: string): Promise<AgencyKPIs> {
    const { data, error } = await supabase.rpc('get_implementing_agency_kpis', {
      p_agency_id: agencyId,
      p_house: house || null,
    });

    if (error) {
      console.error('[ImplementingAgencyService] Error fetching KPIs:', error);
      throw new Error(`Failed to load agency KPIs: ${error.message}`);
    }

    return data as AgencyKPIs;
  }

  /**
   * Server-side paginated and filtered assigned works list
   */
  static async getAssignedProjects(
    agencyId: string,
    params: ProjectQueryParams
  ): Promise<{ projects: any[]; total: number; page: number; pageSize: number }> {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20));
    const offset = (page - 1) * pageSize;

    // 1. Fetch agency profile to obtain agency_name
    const { data: agencyProfile, error: profileErr } = await supabase
      .from('implementing_agency_profiles')
      .select('id, agency_name, normalized_agency_name')
      .eq('id', agencyId)
      .single();

    if (profileErr || !agencyProfile) {
      throw new Error('Agency profile not found');
    }

    const agencyName = agencyProfile.agency_name;
    const results: any[] = [];
    let totalCount = 0;

    // Fetch matching Lok Sabha projects if requested or general
    if (!params.house || params.house === 'Lok Sabha') {
      let lsQuery = supabase
        .from('lok_sabha_projects')
        .select('*', { count: 'exact' })
        .eq('ida', agencyName);

      if (params.state) lsQuery = lsQuery.eq('state', params.state);
      if (params.district) lsQuery = lsQuery.ilike('district', `%${params.district}%`);
      if (params.constituency) lsQuery = lsQuery.ilike('constituency', `%${params.constituency}%`);
      if (params.category) lsQuery = lsQuery.ilike('work_category', `%${params.category}%`);
      if (params.financialYear) lsQuery = lsQuery.eq('financial_year', params.financialYear);
      if (params.riskLevel) lsQuery = lsQuery.eq('risk_level', params.riskLevel.toUpperCase());
      if (params.workStatus) {
        if (params.workStatus === 'Completed') lsQuery = lsQuery.eq('is_completed', true);
        else if (params.workStatus === 'In Progress') lsQuery = lsQuery.eq('is_completed', false);
        else lsQuery = lsQuery.ilike('work_status', `%${params.workStatus}%`);
      }
      if (params.search) {
        const s = params.search.trim();
        lsQuery = lsQuery.or(`work_id.ilike.%${s}%,work_description.ilike.%${s}%,mp_name.ilike.%${s}%`);
      }

      const { data: lsData, count: lsCount, error: lsErr } = await lsQuery;
      if (!lsErr && lsData) {
        totalCount += lsCount || 0;
        results.push(...lsData.map(p => ({ ...p, house: 'Lok Sabha' })));
      }
    }

    // Fetch matching Rajya Sabha projects
    if (!params.house || params.house === 'Rajya Sabha') {
      let rsQuery = supabase
        .from('rajya_sabha_projects')
        .select('*', { count: 'exact' })
        .eq('ida', agencyName);

      if (params.state) rsQuery = rsQuery.eq('state', params.state);
      if (params.district) rsQuery = rsQuery.ilike('district', `%${params.district}%`);
      if (params.category) rsQuery = rsQuery.ilike('work_category', `%${params.category}%`);
      if (params.financialYear) rsQuery = rsQuery.eq('financial_year', params.financialYear);
      if (params.riskLevel) rsQuery = rsQuery.eq('risk_level', params.riskLevel.toUpperCase());
      if (params.workStatus) {
        if (params.workStatus === 'Completed') rsQuery = rsQuery.eq('is_completed', true);
        else if (params.workStatus === 'In Progress') rsQuery = rsQuery.eq('is_completed', false);
        else rsQuery = rsQuery.ilike('work_status', `%${params.workStatus}%`);
      }
      if (params.search) {
        const s = params.search.trim();
        rsQuery = rsQuery.or(`work_id.ilike.%${s}%,work_description.ilike.%${s}%,mp_name.ilike.%${s}%`);
      }

      const { data: rsData, count: rsCount, error: rsErr } = await rsQuery;
      if (!rsErr && rsData) {
        totalCount += rsCount || 0;
        results.push(...rsData.map(p => ({ ...p, house: 'Rajya Sabha' })));
      }
    }

    // Sort by sanction_amount DESC by default
    results.sort((a, b) => (Number(b.sanction_amount) || 0) - (Number(a.sanction_amount) || 0));

    // Slice for server-side pagination
    const paginated = results.slice(offset, offset + pageSize);

    // Attach latest execution update to each project
    const workHouseKeys = paginated.map(p => p.work_id);
    if (workHouseKeys.length > 0) {
      const { data: latestUpdates } = await supabase
        .from('execution_updates')
        .select('work_id, house, physical_progress, milestone_status, review_status, submitted_at')
        .eq('agency_id', agencyId)
        .in('work_id', workHouseKeys)
        .order('submitted_at', { ascending: false });

      const updateMap = new Map<string, any>();
      for (const u of latestUpdates || []) {
        const key = `${u.work_id}:::${u.house}`;
        if (!updateMap.has(key)) {
          updateMap.set(key, u);
        }
      }

      for (const p of paginated) {
        const key = `${p.work_id}:::${p.house}`;
        const latest = updateMap.get(key);
        if (latest) {
          p.latest_execution_update = latest;
          p.physical_progress = latest.physical_progress;
          p.execution_review_status = latest.review_status;
        } else {
          p.physical_progress = p.is_completed ? 100 : Math.min(95, Math.round(Number(p.disbursement_ratio) || 30));
          p.execution_review_status = 'NO_UPDATES_YET';
        }
      }
    }

    return {
      projects: paginated,
      total: totalCount || results.length,
      page,
      pageSize,
    };
  }

  /**
   * Get single project details for Execution Workspace (Strictly scoped)
   */
  static async getProjectDetails(agencyId: string, workId: string, house?: string) {
    // 1. Verify assignment
    let verifyQuery = supabase
      .from('implementing_agency_project_assignments')
      .select('house')
      .eq('agency_id', agencyId)
      .eq('work_id', workId);

    if (house) {
      verifyQuery = verifyQuery.eq('house', house);
    }

    const { data: assignMatch, error: verifyErr } = await verifyQuery;
    if (verifyErr || !assignMatch || assignMatch.length === 0) {
      const notFoundErr = new Error('Project not found or not assigned to your agency.');
      (notFoundErr as any).statusCode = 404;
      throw notFoundErr;
    }

    const assignedHouse = assignMatch[0].house;
    const tableName = assignedHouse === 'Lok Sabha' ? 'lok_sabha_projects' : 'rajya_sabha_projects';

    // 2. Fetch canonical master record (READ-ONLY)
    const { data: project, error: projErr } = await supabase
      .from(tableName)
      .select('*')
      .eq('work_id', workId)
      .single();

    if (projErr || !project) {
      const err = new Error('Canonical project master record not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    // 3. Fetch read-only anomaly intelligence
    const { data: anomalyResults } = await supabase
      .from('project_anomaly_results')
      .select('*')
      .eq('work_id', workId);

    // 4. Fetch execution updates history (ordered DESC)
    const { data: executionUpdates } = await supabase
      .from('execution_updates')
      .select('*')
      .eq('agency_id', agencyId)
      .eq('work_id', workId)
      .eq('house', assignedHouse)
      .order('submitted_at', { ascending: false });

    // 5. Fetch evidence records
    const { data: evidence } = await supabase
      .from('execution_evidence')
      .select('*')
      .eq('agency_id', agencyId)
      .eq('work_id', workId)
      .eq('house', assignedHouse)
      .order('created_at', { ascending: false });

    // 6. Fetch audit trail history for this work
    const { data: auditTrail } = await supabase
      .from('audit_trail')
      .select('*')
      .eq('work_id', workId)
      .eq('house', assignedHouse)
      .order('created_at', { ascending: false });

    return {
      project: {
        ...project,
        house: assignedHouse,
      },
      anomalyResults: anomalyResults || [],
      executionUpdates: executionUpdates || [],
      evidence: evidence || [],
      auditTrail: auditTrail || [],
    };
  }

  /**
   * Submit an append-only execution update
   */
  static async submitExecutionUpdate(
    agencyId: string,
    agencyName: string,
    userId: string,
    userEmail: string,
    payload: {
      work_id: string;
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
    const {
      work_id,
      house,
      physical_progress,
      milestone_status,
      update_date,
      remarks,
      delay_reason,
      expected_completion_date,
      is_draft,
    } = payload;

    // Validation
    if (!work_id || !house) {
      throw new Error('Project work_id and house are required.');
    }
    if (typeof physical_progress !== 'number' || physical_progress < 0 || physical_progress > 100) {
      throw new Error('Physical progress must be a valid percentage between 0 and 100.');
    }
    if (!milestone_status || !milestone_status.trim()) {
      throw new Error('Milestone / Execution Status is required.');
    }
    if (!update_date) {
      throw new Error('Execution update date is required.');
    }
    if (!remarks || remarks.trim().length < 5) {
      throw new Error('Execution remarks are required (minimum 5 characters).');
    }

    // Verify assignment
    const { data: assignMatch, error: assignErr } = await supabase
      .from('implementing_agency_project_assignments')
      .select('id')
      .eq('agency_id', agencyId)
      .eq('work_id', work_id)
      .eq('house', house)
      .single();

    if (assignErr || !assignMatch) {
      const err = new Error('Access denied: Work is not assigned to your agency.');
      (err as any).statusCode = 403;
      throw err;
    }

    // Get previous physical progress
    const { data: prevUpdates } = await supabase
      .from('execution_updates')
      .select('physical_progress')
      .eq('agency_id', agencyId)
      .eq('work_id', work_id)
      .eq('house', house)
      .order('submitted_at', { ascending: false })
      .limit(1);

    const previous_progress = prevUpdates && prevUpdates.length > 0 ? prevUpdates[0].physical_progress : 0;
    const review_status = is_draft ? 'DRAFT' : 'SUBMITTED';

    // Insert append-only execution update
    const { data: newUpdate, error: insertErr } = await supabase
      .from('execution_updates')
      .insert({
        work_id,
        house,
        agency_id: agencyId,
        agency_name: agencyName,
        submitted_by: userId,
        submitted_at: new Date().toISOString(),
        previous_progress,
        physical_progress,
        milestone_status: milestone_status.trim(),
        update_date,
        remarks: remarks.trim(),
        delay_reason: delay_reason?.trim() || null,
        expected_completion_date: expected_completion_date || null,
        review_status,
      })
      .select()
      .single();

    if (insertErr || !newUpdate) {
      console.error('[ImplementingAgencyService] Insert execution update error:', insertErr);
      throw new Error(`Failed to record execution update: ${insertErr?.message}`);
    }

    // Append to audit_trail
    try {
      await supabase.from('audit_trail').insert({
        work_id,
        house,
        actor_id: userId,
        actor_name: agencyName,
        actor_role: 'IMPLEMENTING_AGENCY',
        action: is_draft ? 'SAVE_EXECUTION_DRAFT' : 'SUBMIT_EXECUTION_UPDATE',
        previous_status: `${previous_progress}% progress`,
        new_status: `${physical_progress}% progress (${review_status})`,
        comment: remarks.trim(),
        reason: delay_reason || 'Periodic physical progress update',
        priority: physical_progress < 30 ? 'HIGH' : 'NORMAL',
        metadata: {
          execution_update_id: newUpdate.id,
          expected_completion_date: expected_completion_date || null,
          user_email: userEmail,
        },
      });
    } catch (auditErr) {
      console.warn('[ImplementingAgencyService] Could not append to audit_trail:', auditErr);
    }

    return newUpdate as ExecutionUpdate;
  }

  /**
   * Update an existing submission (only if DRAFT or NEEDS REVISION; cannot self-approve)
   */
  static async updateExecutionSubmission(
    agencyId: string,
    agencyName: string,
    userId: string,
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
    // 1. Fetch current update
    const { data: existing, error: fetchErr } = await supabase
      .from('execution_updates')
      .select('*')
      .eq('id', updateId)
      .eq('agency_id', agencyId)
      .single();

    if (fetchErr || !existing) {
      const err = new Error('Execution update not found or does not belong to your agency.');
      (err as any).statusCode = 404;
      throw err;
    }

    // Rule: Agency can only modify DRAFT or NEEDS REVISION submissions
    if (!['DRAFT', 'NEEDS REVISION'].includes(existing.review_status)) {
      const err = new Error(
        `Submission in state "${existing.review_status}" is locked and cannot be edited.`
      );
      (err as any).statusCode = 403;
      throw err;
    }

    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (typeof payload.physical_progress === 'number') {
      if (payload.physical_progress < 0 || payload.physical_progress > 100) {
        throw new Error('Physical progress must be between 0 and 100.');
      }
      updates.physical_progress = payload.physical_progress;
    }

    if (payload.milestone_status) updates.milestone_status = payload.milestone_status.trim();
    if (payload.remarks) updates.remarks = payload.remarks.trim();
    if (payload.delay_reason !== undefined) updates.delay_reason = payload.delay_reason?.trim() || null;
    if (payload.expected_completion_date !== undefined) {
      updates.expected_completion_date = payload.expected_completion_date || null;
    }

    // Rule: Agency can NEVER set review_status to ACCEPTED
    if (payload.submit_for_review) {
      updates.review_status = 'SUBMITTED';
    }

    const { data: updated, error: updateErr } = await supabase
      .from('execution_updates')
      .update(updates)
      .eq('id', updateId)
      .select()
      .single();

    if (updateErr || !updated) {
      throw new Error(`Failed to update execution submission: ${updateErr?.message}`);
    }

    // Log update in audit trail
    try {
      await supabase.from('audit_trail').insert({
        work_id: existing.work_id,
        house: existing.house,
        actor_id: userId,
        actor_name: agencyName,
        actor_role: 'IMPLEMENTING_AGENCY',
        action: payload.submit_for_review ? 'RESUBMIT_EXECUTION_UPDATE' : 'UPDATE_EXECUTION_DRAFT',
        previous_status: existing.review_status,
        new_status: updated.review_status,
        comment: payload.remarks || 'Revised execution update submission',
        reason: 'Revision response or draft modification',
        priority: 'NORMAL',
        metadata: { execution_update_id: updateId },
      });
    } catch (auditErr) {
      console.warn('[ImplementingAgencyService] Audit log warning:', auditErr);
    }

    return updated as ExecutionUpdate;
  }

  /**
   * Upload / record evidence for an assigned project
   */
  static async uploadEvidenceRecord(
    agencyId: string,
    agencyName: string,
    userId: string,
    payload: {
      work_id: string;
      house: 'Lok Sabha' | 'Rajya Sabha';
      file_name: string;
      file_type: string;
      storage_path: string;
      description?: string;
      execution_update_id?: string;
      file_size_bytes?: number;
    }
  ): Promise<ExecutionEvidence> {
    const {
      work_id,
      house,
      file_name,
      file_type,
      storage_path,
      description,
      execution_update_id,
      file_size_bytes,
    } = payload;

    // Verify assignment
    const { data: assignMatch } = await supabase
      .from('implementing_agency_project_assignments')
      .select('id')
      .eq('agency_id', agencyId)
      .eq('work_id', work_id)
      .eq('house', house)
      .single();

    if (!assignMatch) {
      const err = new Error('Access denied: Work is not assigned to your agency.');
      (err as any).statusCode = 403;
      throw err;
    }

    const { data: newEvidence, error } = await supabase
      .from('execution_evidence')
      .insert({
        work_id,
        house,
        agency_id: agencyId,
        uploaded_by: userId,
        file_name,
        file_type,
        storage_path,
        description: description?.trim() || null,
        execution_update_id: execution_update_id || null,
        file_size_bytes: file_size_bytes || 0,
      })
      .select()
      .single();

    if (error || !newEvidence) {
      throw new Error(`Failed to record execution evidence: ${error?.message}`);
    }

    // Append to audit trail
    try {
      await supabase.from('audit_trail').insert({
        work_id,
        house,
        actor_id: userId,
        actor_name: agencyName,
        actor_role: 'IMPLEMENTING_AGENCY',
        action: 'ATTACH_EXECUTION_EVIDENCE',
        new_status: 'EVIDENCE_ATTACHED',
        comment: `Attached ${file_type} proof: ${file_name}`,
        reason: description || 'Supporting execution documentation',
        metadata: {
          evidence_id: newEvidence.id,
          file_name,
          storage_path,
        },
      });
    } catch {}

    return newEvidence as ExecutionEvidence;
  }

  /**
   * Action Center: Identify assigned projects requiring attention
   */
  static async getActionCenterItems(agencyId: string): Promise<ExecutionActionItem[]> {
    const { data: assignments } = await supabase
      .from('implementing_agency_project_assignments')
      .select('work_id, house')
      .eq('agency_id', agencyId)
      .eq('is_active', true);

    if (!assignments || assignments.length === 0) return [];

    const lsWorkIds = assignments.filter(a => a.house === 'Lok Sabha').map(a => a.work_id);
    const rsWorkIds = assignments.filter(a => a.house === 'Rajya Sabha').map(a => a.work_id);

    const actionItems: ExecutionActionItem[] = [];

    // Fetch projects with potential attention indicators
    const fetchTable = async (tableName: string, workIds: string[], house: 'Lok Sabha' | 'Rajya Sabha') => {
      if (workIds.length === 0) return;
      const { data: rows } = await supabase
        .from(tableName)
        .select('work_id, work_description, sanction_amount, amount_disbursed, total_paid, disbursement_ratio, is_completed, days_since_sanction, verification_status, risk_score, risk_level')
        .in('work_id', workIds);

      for (const row of rows || []) {
        const sanction = Number(row.sanction_amount) || 0;
        const disbursed = Number(row.amount_disbursed || row.total_paid) || 0;
        const disbRatio = Number(row.disbursement_ratio) || (sanction > 0 ? (disbursed / sanction) * 100 : 0);
        const days = row.days_since_sanction || 0;
        const riskScore = Number(row.risk_score) || 0;
        const riskLevel = row.risk_level || 'LOW';

        // 1. Revision Requested
        if (row.verification_status === 'FLAGGED_FOR_REVIEW' || row.verification_status === 'REJECTED') {
          actionItems.push({
            work_id: row.work_id,
            house,
            work_description: row.work_description || 'MPLADS Work',
            sanction_amount: sanction,
            disbursed_amount: disbursed,
            physical_progress: row.is_completed ? 100 : Math.round(disbRatio * 0.7),
            action_type: 'REVISION_REQUESTED',
            attention_reason: 'Verification Officer requested clarification or resubmission of milestone records.',
            severity: 'CRITICAL',
            risk_level: riskLevel,
            risk_score: riskScore,
          });
        }
        // 2. High Attention
        else if (riskLevel === 'HIGH' || riskScore >= 70) {
          actionItems.push({
            work_id: row.work_id,
            house,
            work_description: row.work_description || 'MPLADS Work',
            sanction_amount: sanction,
            disbursed_amount: disbursed,
            physical_progress: row.is_completed ? 100 : Math.round(disbRatio * 0.7),
            action_type: 'HIGH_ATTENTION',
            attention_reason: 'System intelligence flagged elevated risk factor requiring ground execution review.',
            severity: 'CRITICAL',
            risk_level: riskLevel,
            risk_score: riskScore,
          });
        }
        // 3. Financial ahead of physical progress
        else if (!row.is_completed && disbRatio > 60 && days > 180) {
          actionItems.push({
            work_id: row.work_id,
            house,
            work_description: row.work_description || 'MPLADS Work',
            sanction_amount: sanction,
            disbursed_amount: disbursed,
            physical_progress: Math.round(disbRatio * 0.5),
            action_type: 'FINANCIAL_AHEAD_OF_PHYSICAL',
            attention_reason: `Disbursement (${Math.round(disbRatio)}%) outpaces expected physical completion schedule.`,
            severity: 'WARNING',
            risk_level: riskLevel,
            risk_score: riskScore,
          });
        }
        // 4. Update Overdue
        else if (!row.is_completed && days > 270) {
          actionItems.push({
            work_id: row.work_id,
            house,
            work_description: row.work_description || 'MPLADS Work',
            sanction_amount: sanction,
            disbursed_amount: disbursed,
            physical_progress: row.is_completed ? 100 : Math.round(disbRatio * 0.7),
            action_type: 'UPDATE_OVERDUE',
            attention_reason: `Over ${days} days since sanction date with pending physical completion certificate.`,
            severity: 'ATTENTION',
            risk_level: riskLevel,
            risk_score: riskScore,
          });
        }
      }
    };

    await Promise.all([
      fetchTable('lok_sabha_projects', lsWorkIds, 'Lok Sabha'),
      fetchTable('rajya_sabha_projects', rsWorkIds, 'Rajya Sabha'),
    ]);

    // Limit to top 50 actionable items sorted by severity
    const severityOrder = { CRITICAL: 3, WARNING: 2, ATTENTION: 1 };
    actionItems.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity] || b.risk_score - a.risk_score);

    return actionItems.slice(0, 50);
  }

  /**
   * Fetch agency master profile and statistics
   */
  static async getAgencyProfile(agencyId: string) {
    const { data: profile, error } = await supabase
      .from('implementing_agency_profiles')
      .select('*')
      .eq('id', agencyId)
      .single();

    if (error || !profile) {
      throw new Error('Agency profile not found.');
    }

    // Get house breakdown
    const { data: assignments } = await supabase
      .from('implementing_agency_project_assignments')
      .select('house')
      .eq('agency_id', agencyId);

    const lsCount = assignments?.filter(a => a.house === 'Lok Sabha').length || 0;
    const rsCount = assignments?.filter(a => a.house === 'Rajya Sabha').length || 0;

    return {
      profile,
      houseCoverage: {
        lok_sabha_works: lsCount,
        rajya_sabha_works: rsCount,
        total_works: (assignments?.length || 0),
      },
    };
  }
}
