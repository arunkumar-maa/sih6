import { Request, Response } from 'express';
import { fetchAnomalyCounts, fetchAnomalyProjects, runAnomalyScan, AnomalyTab } from '../services/anomalies.service.js';
import { getUserDataScope } from '../utils/rbac.js';

export async function getAnomalyCounts(req: Request, res: Response) {
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
            message: `Access Denied: You are not authorized to view anomaly counts outside your assigned state (${scope.state}).`,
          });
        }
        state = scope.state;
      } else if (scope.scope === 'DISTRICT') {
        if (scope.state && state && state.trim().toLowerCase() !== scope.state.trim().toLowerCase()) {
          return res.status(403).json({
            success: false,
            message: `Access Denied: You are not authorized to view anomaly counts outside your assigned state (${scope.state}).`,
          });
        }
        if (scope.state) {
          state = scope.state;
        }
        district = scope.district;
      }
    }

    const counts = await fetchAnomalyCounts(house, state, district);
    return res.json({ success: true, data: counts });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAnomalyProjects(req: Request, res: Response) {
  try {
    const house = (req.query.house as 'Lok Sabha' | 'Rajya Sabha') || 'Lok Sabha';
    const category = (req.query.category as AnomalyTab) || 'stale';
    const limit = Number(req.query.limit) || 25;
    const offset = Number(req.query.offset) || 0;
    let state = req.query.state as string;
    let district = req.query.district as string;

    if (req.profile) {
      const scope = getUserDataScope(req.profile);
      if (scope.scope === 'STATE') {
        if (state && state.trim().toLowerCase() !== scope.state.trim().toLowerCase()) {
          return res.status(403).json({
            success: false,
            message: `Access Denied: You are not authorized to view anomalies outside your assigned state (${scope.state}).`,
          });
        }
        state = scope.state;
      } else if (scope.scope === 'DISTRICT') {
        if (scope.state && state && state.trim().toLowerCase() !== scope.state.trim().toLowerCase()) {
          return res.status(403).json({
            success: false,
            message: `Access Denied: You are not authorized to view anomalies outside your assigned state (${scope.state}).`,
          });
        }
        if (scope.state) {
          state = scope.state;
        }
        district = scope.district;
      }
    }

    const projects = await fetchAnomalyProjects(house, category, limit, offset, state, district);
    return res.json({ success: true, data: projects });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function triggerScan(req: Request, res: Response) {
  try {
    const house = (req.body?.house as 'Lok Sabha' | 'Rajya Sabha') || 'Lok Sabha';
    const summary = await runAnomalyScan(house);
    return res.json({ success: true, data: summary });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

