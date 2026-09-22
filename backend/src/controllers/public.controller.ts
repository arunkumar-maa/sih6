import { Request, Response } from 'express';
import { PublicService } from '../services/public.service.js';

export async function getPublicMps(req: Request, res: Response) {
  try {
    const result = await PublicService.getMps(req.query);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getPublicMpProfile(req: Request, res: Response) {
  try {
    const mpId = req.params.mpId;
    if (!mpId) {
      return res.status(400).json({ success: false, message: 'MP identifier is required' });
    }
    const result = await PublicService.getMpProfile(mpId);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(404).json({ success: false, message: error.message });
  }
}

export async function getPublicProjects(req: Request, res: Response) {
  try {
    const result = await PublicService.getProjects(req.query);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getPublicProjectDetail(req: Request, res: Response) {
  try {
    const workId = req.params.workId;
    if (!workId) {
      return res.status(400).json({ success: false, message: 'workId parameter is required' });
    }
    const result = await PublicService.getProjectDetail(workId);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(404).json({ success: false, message: error.message });
  }
}

export async function getPublicKpis(req: Request, res: Response) {
  try {
    const result = await PublicService.getKpis();
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getPublicAnalytics(req: Request, res: Response) {
  try {
    const result = await PublicService.getAnalytics();
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getPublicMeta(req: Request, res: Response) {
  try {
    const result = await PublicService.getMeta();
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function submitPublicComplaint(req: Request, res: Response) {
  try {
    const result = await PublicService.submitComplaint(req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function trackPublicComplaint(req: Request, res: Response) {
  try {
    const { complaintId, verificationValue } = req.body;
    if (!complaintId || !verificationValue) {
      return res.status(400).json({
        success: false,
        message: 'Complaint ID and Verification Value (Mobile, Email, or Reference Token) are required.',
      });
    }
    const result = await PublicService.trackComplaint(complaintId, verificationValue);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(403).json({ success: false, message: error.message });
  }
}

export async function getDistrictComplaints(req: Request, res: Response) {
  try {
    const district = req.query.district as string;
    const state = req.query.state as string | undefined;
    if (!district) {
      return res.status(400).json({ success: false, message: 'district parameter is required.' });
    }
    const result = await PublicService.getDistrictComplaints(district, state);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateComplaintStatus(req: Request, res: Response) {
  try {
    const { complaintId } = req.params;
    const result = await PublicService.updateComplaintStatus(complaintId, req.body);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function submitCitizenClarification(req: Request, res: Response) {
  try {
    const complaintId = req.params.complaintId || req.body.complaintId;
    const { verificationValue, clarificationText } = req.body;
    const result = await PublicService.submitClarification(complaintId, verificationValue, clarificationText);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function getComplaintTimeline(req: Request, res: Response) {
  try {
    const { complaintId } = req.params;
    const publicOnly = req.query.publicOnly !== 'false';
    const result = await PublicService.getComplaintTimeline(complaintId, publicOnly);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function executeOfficerAction(req: Request, res: Response) {
  try {
    const { complaintId } = req.params;
    const { action, remarks, publicResponse, internalNotes, assignedAgency, status, officerName, evidence } = req.body;
    if (!action) {
      return res.status(400).json({ success: false, message: 'Action name is required.' });
    }
    const result = await PublicService.executeOfficerAction(
      complaintId,
      action,
      { remarks, publicResponse, internalNotes, assignedAgency, status, evidence },
      officerName
    );
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function getAgencyComplaintRequests(req: Request, res: Response) {
  try {
    const agencyName = req.query.agencyName as string | undefined;
    const district = req.query.district as string | undefined;
    const status = req.query.status as string | undefined;
    const result = await PublicService.getAgencyComplaintRequests(agencyName, district, status);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function submitAgencyResponse(req: Request, res: Response) {
  try {
    const { complaintId } = req.params;
    const { remarks, progress, agencyName } = req.body;
    const result = await PublicService.submitAgencyResponse(complaintId, { remarks, progress, agencyName });
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function getAuditorVerificationComplaints(req: Request, res: Response) {
  try {
    const result = await PublicService.getAuditorVerificationComplaints();
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function submitAuditorFinding(req: Request, res: Response) {
  try {
    const { complaintId } = req.params;
    const { outcome, remarks, auditorName } = req.body;
    const result = await PublicService.submitAuditorFinding(complaintId, { outcome, remarks, auditorName });
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function getStateEscalatedComplaints(req: Request, res: Response) {
  try {
    const state = req.query.state as string | undefined;
    const result = await PublicService.getStateEscalatedComplaints(state || 'ALL');
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function submitStateNodalDirection(req: Request, res: Response) {
  try {
    const { complaintId } = req.params;
    const { direction, officerName } = req.body;
    const result = await PublicService.submitStateNodalDirection(complaintId, { direction, officerName });
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function attachComplaintEvidence(req: Request, res: Response) {
  try {
    const { complaintId } = req.params;
    const { fileName, fileType, fileSize, storagePath, description, uploadedBy } = req.body;
    if (!fileName) {
      return res.status(400).json({ success: false, message: 'File name is required.' });
    }
    const result = await PublicService.attachComplaintEvidence(complaintId, {
      fileName,
      fileType: fileType || 'Document',
      fileSize,
      storagePath,
      description,
      uploadedBy,
    });
    return res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function getComplaintEvidence(req: Request, res: Response) {
  try {
    const { complaintId } = req.params;
    const result = await PublicService.getComplaintEvidence(complaintId);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}


