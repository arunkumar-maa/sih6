import { Request, Response } from 'express';
import { fetchConstituencyGIS, fetchStateGIS } from '../services/gis.service.js';
import { getUserDataScope } from '../utils/rbac.js';

export async function getConstituencyGIS(req: Request, res: Response) {
  try {
    let state = req.query.state as string;
    let district = req.query.district as string;

    if (req.profile) {
      const scope = getUserDataScope(req.profile);
      if (scope.scope === 'STATE') {
        if (state && state.trim().toLowerCase() !== scope.state.trim().toLowerCase()) {
          return res.status(403).json({
            success: false,
            message: `Access Denied: You are not authorized to view GIS data outside your assigned state (${scope.state}).`,
          });
        }
        state = scope.state;
      } else if (scope.scope === 'DISTRICT') {
        if (scope.state && state && state.trim().toLowerCase() !== scope.state.trim().toLowerCase()) {
          return res.status(403).json({
            success: false,
            message: `Access Denied: You are not authorized to view GIS data outside your assigned state (${scope.state}).`,
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

    const metrics = await fetchConstituencyGIS(filters);
    return res.json({ success: true, data: metrics });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getStateGIS(req: Request, res: Response) {
  try {
    let state = req.query.state as string;

    if (req.profile) {
      const scope = getUserDataScope(req.profile);
      if (scope.scope === 'STATE') {
        if (state && state.trim().toLowerCase() !== scope.state.trim().toLowerCase()) {
          return res.status(403).json({
            success: false,
            message: `Access Denied: You are not authorized to view GIS data outside your assigned state (${scope.state}).`,
          });
        }
        state = scope.state;
      } else if (scope.scope === 'DISTRICT') {
        if (scope.state && state && state.trim().toLowerCase() !== scope.state.trim().toLowerCase()) {
          return res.status(403).json({
            success: false,
            message: `Access Denied: You are not authorized to view GIS data outside your assigned state (${scope.state}).`,
          });
        }
        if (scope.state) {
          state = scope.state;
        }
      }
    }

    const filters = {
      state,
      mpName: req.query.mp as string,
      riskLevel: req.query.risk as string,
      status: req.query.status as string,
      category: req.query.category as string,
      tenure: req.query.tenure as string,
      search: req.query.search as string,
    };

    let metrics = await fetchStateGIS(filters);
    if (req.profile) {
      const scope = getUserDataScope(req.profile);
      if (scope.scope === 'STATE') {
        metrics = metrics.filter((m: any) => m.state?.toLowerCase() === scope.state.toLowerCase());
      }
    }

    return res.json({ success: true, data: metrics });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

