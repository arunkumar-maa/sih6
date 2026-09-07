import { Router } from 'express';
import { getDashboardKPIs, getCategoryBreakdown } from '../../controllers/analytics.controller.js';

const router = Router();

router.get('/kpis', getDashboardKPIs);
router.get('/categories', getCategoryBreakdown);

export default router;
