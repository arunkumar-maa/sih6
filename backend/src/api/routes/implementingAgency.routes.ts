import { Router } from 'express';
import { ImplementingAgencyController } from '../../controllers/implementingAgency.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

// Protect all routes with authentication and strict role requirement
router.use(requireAuth);
router.use(requireRole('IMPLEMENTING_AGENCY'));

// Dashboard & KPIs
router.get('/dashboard', ImplementingAgencyController.getDashboard);

// Assigned Works (Server-side paginated & filtered inside agency scope)
router.get('/projects', ImplementingAgencyController.getProjects);
router.get('/projects/:workId', ImplementingAgencyController.getProjectDetails);

// Execution updates
router.post('/projects/:workId/execution-updates', ImplementingAgencyController.submitExecutionUpdate);
router.patch('/execution-updates/:updateId', ImplementingAgencyController.updateExecutionSubmission);

// Evidence upload / record
router.post('/projects/:workId/evidence', ImplementingAgencyController.uploadEvidence);

// Action center & profile
router.get('/action-center', ImplementingAgencyController.getActionCenter);
router.get('/profile', ImplementingAgencyController.getProfile);

export default router;
