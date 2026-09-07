import { Router } from 'express';
import { getConstituencyGIS, getStateGIS } from '../../controllers/gis.controller.js';

const router = Router();

router.get('/constituency', getConstituencyGIS);
router.get('/state', getStateGIS);

export default router;
