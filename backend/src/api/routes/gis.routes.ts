import { Router } from 'express';
import { getConstituencyGIS, getStateGIS } from '../../controllers/gis.controller.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';

const router = Router();

router.get(['/constituency', '/constituencies'], optionalAuth, getConstituencyGIS);
router.get(['/state', '/states'], optionalAuth, getStateGIS);

export default router;
