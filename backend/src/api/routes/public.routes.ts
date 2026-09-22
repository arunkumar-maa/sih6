import { Router } from 'express';
import {
  getPublicMps,
  getPublicMpProfile,
  getPublicProjects,
  getPublicProjectDetail,
  getPublicKpis,
  getPublicAnalytics,
  getPublicMeta,
  submitPublicComplaint,
  trackPublicComplaint,
  getDistrictComplaints,
  updateComplaintStatus,
  submitCitizenClarification,
  getComplaintTimeline,
  executeOfficerAction,
  getAgencyComplaintRequests,
  submitAgencyResponse,
  getAuditorVerificationComplaints,
  submitAuditorFinding,
  getStateEscalatedComplaints,
  submitStateNodalDirection,
  attachComplaintEvidence,
  getComplaintEvidence,
} from '../../controllers/public.controller.js';

const router = Router();

// Public Read-Only Portal Endpoints
router.get('/mps', getPublicMps);
router.get('/mps/:mpId', getPublicMpProfile);
router.get('/projects', getPublicProjects);
router.get('/projects/:workId', getPublicProjectDetail);
router.get('/kpis', getPublicKpis);
router.get('/analytics', getPublicAnalytics);
router.get('/meta', getPublicMeta);

// Public Complaints & Workflow Endpoints
// Static GET routes first
router.get('/complaints/district', getDistrictComplaints);
router.get('/complaints/agency', getAgencyComplaintRequests);
router.get('/complaints/auditor', getAuditorVerificationComplaints);
router.get('/complaints/state', getStateEscalatedComplaints);

// Public Submission & Tracking
router.post('/complaints', submitPublicComplaint);
router.post('/complaints/track', trackPublicComplaint);
router.post('/complaints/:complaintId/clarify', submitCitizenClarification);
router.get('/complaints/:complaintId/events', getComplaintTimeline);
router.get('/complaints/:complaintId/evidence', getComplaintEvidence);
router.post('/complaints/:complaintId/evidence', attachComplaintEvidence);

// Administrative Officer Actions & Role Interventions
router.patch('/complaints/:complaintId', updateComplaintStatus);
router.post('/complaints/:complaintId/action', executeOfficerAction);
router.post('/complaints/:complaintId/agency-response', submitAgencyResponse);
router.post('/complaints/:complaintId/auditor-verification', submitAuditorFinding);
router.post('/complaints/:complaintId/state-direction', submitStateNodalDirection);

export default router;


