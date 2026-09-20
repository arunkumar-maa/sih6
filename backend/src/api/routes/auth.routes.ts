import { Router } from 'express';
import { getProfile, getDemoAccounts } from '../../controllers/auth.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/profile', requireAuth, getProfile);
router.get('/demo-accounts', getDemoAccounts);

export default router;
