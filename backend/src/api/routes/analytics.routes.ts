import { Router } from 'express';
import { getDashboardKPIs, getCategoryBreakdown, getObservatoryAnalytics } from '../../controllers/analytics.controller.js';

const router = Router();

router.get('/kpis', getDashboardKPIs);
router.get('/categories', getCategoryBreakdown);
router.get('/observatory', getObservatoryAnalytics);

export default router;
