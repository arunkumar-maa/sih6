import { Request, Response } from 'express';
import {
  fetchAuditorKPIs,
  fetchAuditorQueue,
  fetchAuditorCaseFile,
  updateAuditorStatus,
  requestAuditorInspection,
  addAuditorReviewNote,
  fetchRecentAuditActivity,
  fetchAuditTrailList,
} from '../services/auditor.service.js';
import { getUserDataScope } from '../utils/rbac.js';

export async function getKPIs(req: Request, res: Response) {
  try {
    const house = (req.query.house as 'Lok Sabha' | 'Rajya Sabha') || 'Lok Sabha';
    let state = req.query.state as string;
    let district = req.query.district as string;

    if (req.profile) {
      const scope = getUserDataScope(req.profile);
      if (scope.scope === 'STATE') {
        state = scope.state;
      } else if (scope.scope === 'DISTRICT') {
        state = scope.state || state;
        district = scope.district;
      }
    }

    const data = await fetchAuditorKPIs(house, state, district);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[AuditorController] getKPIs error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Unable to load verification KPIs' });
  }
}

export async function getQueue(req: Request, res: Response) {
  try {
    const house = (req.query.house as 'Lok Sabha' | 'Rajya Sabha') || 'Lok Sabha';
    let state = req.query.state as string;
    let district = req.query.district as string;

    if (req.profile) {
      const scope = getUserDataScope(req.profile);
      if (scope.scope === 'STATE') {
        state = scope.state;
      } else if (scope.scope === 'DISTRICT') {
        state = scope.state || state;
        district = scope.district;
      }
    }

    const filters = {
      house,
      state,
      district,
      constituency: req.query.constituency as string,
      mpName: (req.query.mpName || req.query.mp) as string,
      financialYear: req.query.financialYear as string,
      riskLevel: (req.query.riskLevel || req.query.risk) as string,
      anomalyCategory: req.query.anomalyCategory as string,
      verificationStatus: req.query.verificationStatus as string,
      search: req.query.search as string,
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 25,
      sortBy: (req.query.sortBy as string) || 'risk_score',
      sortOrder: ((req.query.sortOrder || req.query.sortDir) as 'asc' | 'desc') || 'desc',
    };

    const data = await fetchAuditorQueue(filters);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[AuditorController] getQueue error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Unable to load verification cases.' });
  }
}

export async function getCaseFile(req: Request, res: Response) {
  try {
    const { workId } = req.params;
    const house = (req.query.house as 'Lok Sabha' | 'Rajya Sabha') || 'Lok Sabha';

    if (!workId) {
      return res.status(400).json({ success: false, message: 'Work ID is required' });
    }

    const data = await fetchAuditorCaseFile(workId, house);

    // Enforce Auditor geographic scope if restricted
    if (req.profile) {
      const scope = getUserDataScope(req.profile);
      if (scope.scope === 'STATE' && data.project.state?.toLowerCase() !== scope.state?.toLowerCase()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to access this case.' });
      }
      if (scope.scope === 'DISTRICT' && !data.project.district?.toLowerCase().includes(scope.district?.toLowerCase())) {
        return res.status(403).json({ success: false, message: 'You are not authorized to access this case.' });
      }
    }

    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[AuditorController] getCaseFile error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Unable to load case details.' });
  }
}

export async function updateStatus(req: Request, res: Response) {
  try {
    const { workId } = req.params;
    const { house = 'Lok Sabha', status, comment } = req.body;

    if (!workId || !status) {
      return res.status(400).json({ success: false, message: 'Work ID and target status are required' });
    }

    const allowedStatuses = [
      'New Alert',
      'Under Review',
      'Inspection Requested',
      'Verified',
      'Needs Further Investigation',
      'Dismissed',
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid verification status "${status}"` });
    }

    const actorName = req.profile?.full_name || 'Senior Audit Officer';
    const actorRole = req.profile?.role || 'AUDITOR';
    const actorId = req.user?.id;

    const result = await updateAuditorStatus(
      workId,
      house,
      status,
      comment || '',
      actorName,
      actorRole,
      actorId
    );

    return res.json({ success: true, data: result });
  } catch (err: any) {
    console.error('[AuditorController] updateStatus error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Unable to update verification status' });
  }
}

export async function submitInspectionRequest(req: Request, res: Response) {
  try {
    const { workId } = req.params;
    const { house = 'Lok Sabha', reason, priority = 'High', notes = '' } = req.body;

    if (!workId || !reason) {
      return res.status(400).json({ success: false, message: 'Work ID and inspection reason are required' });
    }

    const actorName = req.profile?.full_name || 'Senior Audit Officer';
    const actorRole = req.profile?.role || 'AUDITOR';
    const actorId = req.user?.id;

    const result = await requestAuditorInspection(
      workId,
      house,
      { reason, priority, notes },
      actorName,
      actorRole,
      actorId
    );

    return res.json({ success: true, data: result });
  } catch (err: any) {
    console.error('[AuditorController] submitInspectionRequest error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Unable to submit inspection request' });
  }
}

export async function addReviewNote(req: Request, res: Response) {
  try {
    const { workId } = req.params;
    const { house = 'Lok Sabha', note } = req.body;

    if (!workId || !note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Work ID and non-empty note are required' });
    }

    const actorName = req.profile?.full_name || 'Senior Audit Officer';
    const actorRole = req.profile?.role || 'AUDITOR';
    const actorId = req.user?.id;

    const result = await addAuditorReviewNote(
      workId,
      house,
      note.trim(),
      actorName,
      actorRole,
      actorId
    );

    return res.json({ success: true, data: result });
  } catch (err: any) {
    console.error('[AuditorController] addReviewNote error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Unable to record review note' });
  }
}

export async function getRecentActivity(req: Request, res: Response) {
  try {
    const house = req.query.house as 'Lok Sabha' | 'Rajya Sabha' | undefined;
    const limit = Number(req.query.limit) || 10;
    const data = await fetchRecentAuditActivity(limit, house);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[AuditorController] getRecentActivity error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Unable to load recent audit activity' });
  }
}

export async function getAuditTrail(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 25;
    const house = req.query.house as 'Lok Sabha' | 'Rajya Sabha' | undefined;
    const action = req.query.action as string | undefined;
    const search = req.query.search as string | undefined;

    const data = await fetchAuditTrailList(page, pageSize, house, action, search);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[AuditorController] getAuditTrail error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Unable to load audit trail' });
  }
}
