import { Router } from 'express';
import { MpController } from '../../controllers/mp.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

// Guard all MP routes: must be authenticated and possess MP or MOSPI_ADMIN role
router.use(requireAuth);
router.use(requireRole('MP', 'MOSPI_ADMIN'));

// MP Endpoints
router.get('/me', MpController.getMe);
router.get('/dashboard', MpController.getDashboard);
router.get('/profile', MpController.getProfile);
router.get('/projects', MpController.getProjects);
router.get('/projects/:workId', MpController.getProjectDetail);

export default router;
