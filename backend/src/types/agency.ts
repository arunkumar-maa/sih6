export type ExecutionReviewStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER REVIEW'
  | 'ACCEPTED'
  | 'NEEDS REVISION';

export interface ImplementingAgencyMasterProfile {
  id: string;
  agency_name: string;
  normalized_agency_name: string;
  agency_code?: string | null;
  state?: string | null;
  district?: string | null;
  total_assigned_works: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgencyKPIs {
  agency_id: string;
  agency_name: string;
  house_filter: string;
  assigned_works: number;
  works_in_progress: number;
  completed_works: number;
  pending_updates: number;
  inspection_review_pending: number;
  high_attention_works: number;
  total_sanction_amount: number;
  total_disbursed_amount: number;
  total_expenditure_amount: number;
}

export interface ExecutionUpdate {
  id: string;
  work_id: string;
  house: 'Lok Sabha' | 'Rajya Sabha';
  agency_id: string;
  agency_name: string;
  submitted_by?: string | null;
  submitted_at: string;
  previous_progress: number;
  physical_progress: number;
  milestone_status: string;
  update_date: string;
  remarks: string;
  delay_reason?: string | null;
  expected_completion_date?: string | null;
  review_status: ExecutionReviewStatus;
  reviewer_remarks?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExecutionEvidence {
  id: string;
  work_id: string;
  house: 'Lok Sabha' | 'Rajya Sabha';
  agency_id: string;
  uploaded_by?: string | null;
  file_name: string;
  file_type: string;
  storage_path: string;
  description?: string | null;
  execution_update_id?: string | null;
  file_size_bytes?: number;
  created_at: string;
}

export interface ExecutionActionItem {
  work_id: string;
  house: 'Lok Sabha' | 'Rajya Sabha';
  work_description: string;
  sanction_amount: number;
  disbursed_amount: number;
  physical_progress: number;
  action_type:
    | 'UPDATE_OVERDUE'
    | 'LOW_PHYSICAL_PROGRESS'
    | 'FINANCIAL_AHEAD_OF_PHYSICAL'
    | 'STALE_EXECUTION'
    | 'INSPECTION_REQUESTED'
    | 'REVISION_REQUESTED'
    | 'HIGH_ATTENTION';
  attention_reason: string;
  severity: 'CRITICAL' | 'WARNING' | 'ATTENTION';
  review_status?: string | null;
  risk_level: string;
  risk_score: number;
  last_update_date?: string | null;
}

export interface ProjectQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  house?: 'Lok Sabha' | 'Rajya Sabha';
  state?: string;
  district?: string;
  constituency?: string;
  category?: string;
  financialYear?: string;
  workStatus?: string;
  riskLevel?: string;
}
