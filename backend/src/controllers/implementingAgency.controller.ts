import { Request, Response } from 'express';
import { ImplementingAgencyService } from '../services/implementingAgency.service.js';

export class ImplementingAgencyController {
  /**
   * Helper: Extracts and resolves authenticated agency
   */
  private static async getResolvedAgency(req: Request) {
    return await ImplementingAgencyService.resolveAgency(req.profile);
  }

  /**
   * GET /api/implementing-agency/dashboard
   */
  static async getDashboard(req: Request, res: Response) {
    try {
      const agency = await ImplementingAgencyController.getResolvedAgency(req);
      const house = req.query.house as string | undefined;

      const kpis = await ImplementingAgencyService.getDashboardKPIs(agency.id, house);

      return res.json({
        success: true,
        data: {
          agency: {
            id: agency.id,
            name: agency.agency_name,
            totalAssigned: agency.total_assigned_works,
          },
          kpis,
        },
      });
    } catch (err: any) {
      const status = err.statusCode || 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/implementing-agency/projects
   */
  static async getProjects(req: Request, res: Response) {
    try {
      const agency = await ImplementingAgencyController.getResolvedAgency(req);
      const {
        page,
        pageSize,
        search,
        house,
        state,
        district,
        constituency,
        category,
        financialYear,
        workStatus,
        riskLevel,
      } = req.query;

      const result = await ImplementingAgencyService.getAssignedProjects(agency.id, {
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 20,
        search: search as string,
        house: house as any,
        state: state as string,
        district: district as string,
        constituency: constituency as string,
        category: category as string,
        financialYear: financialYear as string,
        workStatus: workStatus as string,
        riskLevel: riskLevel as string,
      });

      return res.json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      const status = err.statusCode || 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/implementing-agency/projects/:workId
   */
  static async getProjectDetails(req: Request, res: Response) {
    try {
      const agency = await ImplementingAgencyController.getResolvedAgency(req);
      const { workId } = req.params;
      const { house } = req.query;

      const details = await ImplementingAgencyService.getProjectDetails(
        agency.id,
        workId,
        house as string
      );

      return res.json({
        success: true,
        data: details,
      });
    } catch (err: any) {
      const status = err.statusCode || 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/implementing-agency/projects/:workId/execution-updates
   */
  static async submitExecutionUpdate(req: Request, res: Response) {
    try {
      const agency = await ImplementingAgencyController.getResolvedAgency(req);
      const { workId } = req.params;
      const {
        house,
        physical_progress,
        milestone_status,
        update_date,
        remarks,
        delay_reason,
        expected_completion_date,
        is_draft,
      } = req.body;

      const update = await ImplementingAgencyService.submitExecutionUpdate(
        agency.id,
        agency.agency_name,
        req.user?.id || req.profile?.id || 'demo-agency-user',
        req.user?.email || req.profile?.email || 'agency@mplads-demo.local',
        {
          work_id: workId,
          house,
          physical_progress: Number(physical_progress),
          milestone_status,
          update_date,
          remarks,
          delay_reason,
          expected_completion_date,
          is_draft: Boolean(is_draft),
        }
      );

      return res.status(201).json({
        success: true,
        message: is_draft
          ? 'Execution progress draft saved.'
          : 'Execution progress update submitted for review.',
        data: update,
      });
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  /**
   * PATCH /api/implementing-agency/execution-updates/:updateId
   */
  static async updateExecutionSubmission(req: Request, res: Response) {
    try {
      const agency = await ImplementingAgencyController.getResolvedAgency(req);
      const { updateId } = req.params;
      const {
        physical_progress,
        milestone_status,
        remarks,
        delay_reason,
        expected_completion_date,
        submit_for_review,
      } = req.body;

      const updated = await ImplementingAgencyService.updateExecutionSubmission(
        agency.id,
        agency.agency_name,
        req.user?.id || req.profile?.id || 'demo-agency-user',
        updateId,
        {
          physical_progress: physical_progress !== undefined ? Number(physical_progress) : undefined,
          milestone_status,
          remarks,
          delay_reason,
          expected_completion_date,
          submit_for_review: Boolean(submit_for_review),
        }
      );

      return res.json({
        success: true,
        message: 'Execution update modified successfully.',
        data: updated,
      });
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/implementing-agency/projects/:workId/evidence
   */
  static async uploadEvidence(req: Request, res: Response) {
    try {
      const agency = await ImplementingAgencyController.getResolvedAgency(req);
      const { workId } = req.params;
      const {
        house,
        file_name,
        file_type,
        storage_path,
        description,
        execution_update_id,
        file_size_bytes,
      } = req.body;

      if (!file_name || !storage_path) {
        return res.status(400).json({
          success: false,
          message: 'File name and storage path are required.',
        });
      }

      const evidence = await ImplementingAgencyService.uploadEvidenceRecord(
        agency.id,
        agency.agency_name,
        req.user?.id || req.profile?.id || 'demo-agency-user',
        {
          work_id: workId,
          house,
          file_name,
          file_type: file_type || 'application/pdf',
          storage_path,
          description,
          execution_update_id,
          file_size_bytes: file_size_bytes ? Number(file_size_bytes) : 0,
        }
      );

      return res.status(201).json({
        success: true,
        message: 'Supporting execution evidence recorded.',
        data: evidence,
      });
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/implementing-agency/action-center
   */
  static async getActionCenter(req: Request, res: Response) {
    try {
      const agency = await ImplementingAgencyController.getResolvedAgency(req);
      const items = await ImplementingAgencyService.getActionCenterItems(agency.id);

      return res.json({
        success: true,
        data: items,
      });
    } catch (err: any) {
      const status = err.statusCode || 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/implementing-agency/profile
   */
  static async getProfile(req: Request, res: Response) {
    try {
      const agency = await ImplementingAgencyController.getResolvedAgency(req);
      const profileData = await ImplementingAgencyService.getAgencyProfile(agency.id);

      return res.json({
        success: true,
        data: profileData,
      });
    } catch (err: any) {
      const status = err.statusCode || 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }
}
