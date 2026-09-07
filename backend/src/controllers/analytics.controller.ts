import { Request, Response } from 'express';
import { fetchDashboardKPIs, fetchCategoryAnalytics } from '../services/analytics.service.js';

export async function getDashboardKPIs(req: Request, res: Response) {
  try {
    const house = (req.query.house as 'Lok Sabha' | 'Rajya Sabha') || 'Lok Sabha';
    const filters = {
      state: req.query.state as string,
      constituency: req.query.constituency as string,
      mpName: req.query.mp as string,
      riskLevel: req.query.risk as string,
      status: req.query.status as string,
      category: req.query.category as string,
      tenure: req.query.tenure as string,
      search: req.query.search as string,
    };

    const kpis = await fetchDashboardKPIs(house, filters);
    return res.json({ success: true, data: kpis });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getCategoryBreakdown(req: Request, res: Response) {
  try {
    const house = (req.query.house as 'Lok Sabha' | 'Rajya Sabha') || 'Lok Sabha';
    const categories = await fetchCategoryAnalytics(house);
    return res.json({ success: true, data: categories });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
