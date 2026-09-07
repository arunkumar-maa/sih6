import { Request, Response } from 'express';
import { fetchAnomalyCounts, fetchAnomalyProjects, runAnomalyScan, AnomalyTab } from '../services/anomalies.service.js';

export async function getAnomalyCounts(req: Request, res: Response) {
  try {
    const house = (req.query.house as 'Lok Sabha' | 'Rajya Sabha') || 'Lok Sabha';
    const counts = await fetchAnomalyCounts(house);
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

    const projects = await fetchAnomalyProjects(house, category, limit, offset);
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
