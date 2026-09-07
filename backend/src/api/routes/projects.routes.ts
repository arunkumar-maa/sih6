import { Router } from 'express';
import { getProjects, getProjectById, getFilterOptions } from '../../controllers/projects.controller.js';

const router = Router();

router.get('/', getProjects);
router.get('/filters', getFilterOptions);
router.get('/:workId', getProjectById);

export default router;
