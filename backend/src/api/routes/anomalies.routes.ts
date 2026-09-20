import { Router } from 'express';
import { getAnomalyCounts, getAnomalyProjects, triggerScan } from '../../controllers/anomalies.controller.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/counts', optionalAuth, getAnomalyCounts);
router.get('/projects', optionalAuth, getAnomalyProjects);
router.post('/scan', optionalAuth, triggerScan);

export default router;
