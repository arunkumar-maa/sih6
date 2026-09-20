import { Router } from 'express';
import { getProjects, getProjectById, getFilterOptions } from '../../controllers/projects.controller.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', optionalAuth, getProjects);
router.get('/filters', optionalAuth, getFilterOptions);
router.get('/:workId', optionalAuth, getProjectById);

export default router;
