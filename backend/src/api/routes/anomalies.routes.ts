import { Router } from 'express';
import { getAnomalyCounts, getAnomalyProjects, triggerScan } from '../../controllers/anomalies.controller.js';

const router = Router();

router.get('/counts', getAnomalyCounts);
router.get('/projects', getAnomalyProjects);
router.post('/scan', triggerScan);

export default router;
