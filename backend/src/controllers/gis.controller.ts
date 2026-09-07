import { Request, Response } from 'express';
import { fetchConstituencyGIS, fetchStateGIS } from '../services/gis.service.js';

export async function getConstituencyGIS(req: Request, res: Response) {
  try {
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

    const metrics = await fetchConstituencyGIS(filters);
    return res.json({ success: true, data: metrics });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getStateGIS(req: Request, res: Response) {
  try {
    const filters = {
      state: req.query.state as string,
      mpName: req.query.mp as string,
      riskLevel: req.query.risk as string,
      status: req.query.status as string,
      category: req.query.category as string,
      tenure: req.query.tenure as string,
      search: req.query.search as string,
    };

    const metrics = await fetchStateGIS(filters);
    return res.json({ success: true, data: metrics });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
