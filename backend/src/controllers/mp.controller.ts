import { Request, Response } from 'express';
import { getMpDashboardData, getMpProfileData, getMpProjects } from '../services/mp.service.js';
import { fetchProjectById } from '../services/projects.service.js';
import { getUserDataScope } from '../utils/rbac.js';

export class MpController {
  /**
   * GET /api/mp/me
   * Return authenticated MP profile and authorization scope
   */
  static async getMe(req: Request, res: Response) {
    try {
      if (!req.profile) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      const scope = getUserDataScope(req.profile);
      return res.json({
        success: true,
        data: {
          profile: req.profile,
          scope,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/mp/dashboard
   * Real dataset-driven KPI cards and attention indicators for authenticated MP
   */
  static async getDashboard(req: Request, res: Response) {
    try {
      if (!req.profile) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      // MP role and House validation
      if (req.profile.role === 'MP' && req.profile.house !== 'Lok Sabha') {
        return res.status(403).json({
          success: false,
          message: 'Access Restricted: This dashboard is exclusively for Lok Sabha Members of Parliament.',
        });
      }

      const data = await getMpDashboardData(req.profile);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/mp/profile
   * Comprehensive, read-only MP Profile dossier with constituency portfolio breakdowns
   */
  static async getProfile(req: Request, res: Response) {
    try {
      if (!req.profile) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      if (req.profile.role === 'MP' && req.profile.house !== 'Lok Sabha') {
        return res.status(403).json({
          success: false,
          message: 'Access Restricted: Lok Sabha MP Profile view only.',
        });
      }

      const data = await getMpProfileData(req.profile);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/mp/projects
   * Server-side paginated and filtered works ledger restricted to authenticated MP
   */
  static async getProjects(req: Request, res: Response) {
    try {
      if (!req.profile) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      if (req.profile.role === 'MP' && req.profile.house !== 'Lok Sabha') {
        return res.status(403).json({
          success: false,
          message: 'Access Restricted: Lok Sabha MP project ledger only.',
        });
      }

      const data = await getMpProjects(req.profile, req.query);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/mp/projects/:workId
   * Project detail with strict ownership verification
   */
  static async getProjectDetail(req: Request, res: Response) {
    try {
      if (!req.profile) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const { workId } = req.params;
      if (!workId) {
        return res.status(400).json({ success: false, message: 'workId parameter is required.' });
      }

      const project = await fetchProjectById(workId, 'Lok Sabha');
      if (!project) {
        return res.status(404).json({ success: false, message: `Project ${workId} not found in Lok Sabha.` });
      }

      // Enforce strict ownership if authenticated as MP
      if (req.profile.role === 'MP') {
        const mpClean = (req.profile.mp_name || '').trim().toLowerCase();
        const pMp = (project.mp || '').trim().toLowerCase();
        const pConst = (project.constituency || '').trim().toLowerCase();
        const uConst = (req.profile.constituency || '').trim().toLowerCase();

        const isOwner = (mpClean && (pMp.includes(mpClean) || mpClean.includes(pMp))) ||
                        (uConst && (pConst.includes(uConst) || uConst.includes(pConst)));

        if (!isOwner) {
          return res.status(403).json({
            success: false,
            message: `Access Denied: You are not authorized to view project ${workId} belonging to another MP portfolio.`,
          });
        }
      }

      return res.json({ success: true, data: project });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
