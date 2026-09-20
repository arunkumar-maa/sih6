import { Router } from 'express';
import {
  getKPIs,
  getQueue,
  getCaseFile,
  updateStatus,
  submitInspectionRequest,
  addReviewNote,
  getRecentActivity,
  getAuditTrail,
} from '../../controllers/auditor.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

// Guard all auditor routes: must be authenticated and have role AUDITOR or MOSPI_ADMIN
const auditorAuthGuard = [requireAuth, requireRole('AUDITOR', 'MOSPI_ADMIN')];

router.get('/kpis', auditorAuthGuard, getKPIs);
router.get('/queue', auditorAuthGuard, getQueue);
router.get('/case/:workId', auditorAuthGuard, getCaseFile);
router.post('/case/:workId/status', auditorAuthGuard, updateStatus);
router.post('/case/:workId/inspect', auditorAuthGuard, submitInspectionRequest);
router.post('/case/:workId/note', auditorAuthGuard, addReviewNote);
router.get('/recent-activity', auditorAuthGuard, getRecentActivity);
router.get('/audit-trail', auditorAuthGuard, getAuditTrail);

export default router;
