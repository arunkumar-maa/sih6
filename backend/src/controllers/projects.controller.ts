import { Request, Response } from 'express';
import { fetchProjects, fetchProjectById, fetchFilterOptions } from '../services/projects.service.js';

export async function getProjects(req: Request, res: Response) {
  try {
    const filters = {
      house: (req.query.house as 'Lok Sabha' | 'Rajya Sabha') || 'Lok Sabha',
      state: req.query.state as string,
      district: req.query.district as string,
      constituency: req.query.constituency as string,
      mpName: (req.query.mpName || req.query.mp) as string,
      workCategory: (req.query.category || req.query.workCategory) as string,
      status: req.query.status as string,
      financialYear: req.query.financialYear as string,
      tenure: req.query.tenure as string,
      riskLevel: (req.query.riskLevel || req.query.risk) as string,
      isSanctioned: req.query.isSanctioned !== undefined ? req.query.isSanctioned === 'true' : undefined,
      isCompleted: req.query.isCompleted !== undefined ? req.query.isCompleted === 'true' : undefined,
      hasDisbursement: req.query.hasDisbursement !== undefined ? req.query.hasDisbursement === 'true' : undefined,
      search: req.query.search as string,
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 20,
      sortBy: ((req.query.sortBy || req.query.sortField) as string) || 'sanction_amount',
      sortOrder: ((req.query.sortOrder || req.query.sortDir) as 'asc' | 'desc') || 'desc',
    };

    const result = await fetchProjects(filters);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getProjectById(req: Request, res: Response) {
  try {
    const workId = req.params.workId;
    const house = (req.query.house as 'Lok Sabha' | 'Rajya Sabha') || 'Lok Sabha';

    if (!workId) {
      return res.status(400).json({ success: false, message: 'workId parameter is required' });
    }

    const project = await fetchProjectById(workId, house);
    if (!project) {
      return res.status(404).json({ success: false, message: `Project ${workId} not found in ${house}` });
    }

    return res.json({ success: true, data: project });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getFilterOptions(req: Request, res: Response) {
  try {
    const house = (req.query.house as 'Lok Sabha' | 'Rajya Sabha') || 'Lok Sabha';
    const options = await fetchFilterOptions(house);
    return res.json({ success: true, data: options });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
