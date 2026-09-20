import { Request, Response } from 'express';
import { fetchDashboardKPIs, fetchCategoryAnalytics, fetchObservatoryAnalytics } from '../services/analytics.service.js';
import { getUserDataScope } from '../utils/rbac.js';

export async function getDashboardKPIs(req: Request, res: Response) {
  try {
    const house = (req.query.house as 'Lok Sabha' | 'Rajya Sabha') || 'Lok Sabha';
    let state = req.query.state as string;
    let district = req.query.district as string;

    if (req.profile) {
      const scope = getUserDataScope(req.profile);
      if (scope.scope === 'STATE') {
        if (state && state.trim().toLowerCase() !== scope.state.trim().toLowerCase()) {
          return res.status(403).json({
            success: false,
            message: `Access Denied: You are not authorized to view analytics outside your assigned state (${scope.state}).`,
          });
        }
        state = scope.state;
      } else if (scope.scope === 'DISTRICT') {
        if (scope.state && state && state.trim().toLowerCase() !== scope.state.trim().toLowerCase()) {
          return res.status(403).json({
            success: false,
            message: `Access Denied: You are not authorized to view analytics outside your assigned state (${scope.state}).`,
          });
        }
        if (scope.state) {
          state = scope.state;
        }
        district = scope.district;
      }
    }

    const filters = {
      state,
      district,
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

export async function getObservatoryAnalytics(req: Request, res: Response) {
  try {
    const house = (req.query.house as 'Lok Sabha' | 'Rajya Sabha') || 'Lok Sabha';
    let state = req.query.state as string;
    let district = req.query.district as string;

    if (req.profile) {
      const scope = getUserDataScope(req.profile);
      if (scope.scope === 'STATE') {
        if (state && state.trim().toLowerCase() !== scope.state.trim().toLowerCase()) {
          return res.status(403).json({
            success: false,
            message: `Access Denied: You are not authorized to view analytics outside your assigned state (${scope.state}).`,
          });
        }
        state = scope.state;
      } else if (scope.scope === 'DISTRICT') {
        if (scope.state && state && state.trim().toLowerCase() !== scope.state.trim().toLowerCase()) {
          return res.status(403).json({
            success: false,
            message: `Access Denied: You are not authorized to view analytics outside your assigned state (${scope.state}).`,
          });
        }
        if (scope.state) {
          state = scope.state;
        }
        district = scope.district;
      }
    }

    const filters = {
      state,
      district,
      constituency: req.query.constituency as string,
      mpName: req.query.mp as string,
      riskLevel: req.query.risk as string,
      status: req.query.status as string,
      category: req.query.category as string,
      tenure: req.query.tenure as string,
      search: req.query.search as string,
    };

    const data = await fetchObservatoryAnalytics(house, filters);
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
