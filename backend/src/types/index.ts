export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export { getRiskLevel, RISK_THRESHOLDS } from '../risk/riskEngine.js';

export type WorkStatus =
  | 'Sanction'
  | 'Vendor Identification'
  | 'Work In Progress'
  | 'Physical Inspection'
  | 'Work Completed'
  | 'Unknown';

export type VerificationStatus =
  | 'New Alert'
  | 'Under Review'
  | 'Inspection Requested'
  | 'Verified'
  | 'Needs Further Investigation'
  | 'Dismissed';

export type PaymentStatus = 'Payment Completed' | 'Payment In-Progress' | 'Unknown';

export interface RiskFactor {
  id: string;
  label: string;
  description: string;
  severity: RiskLevel;
  score: number;
  available: boolean;
  value?: string | number;
}

export interface RiskResult {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
  explanation: string;
  factorsAvailable: number;
  factorsTotal: number;
}

export interface EnrichedProject {
  workId: string;
  srNo: string;
  workCategory: string;
  state: string;
  ida: string;
  district: string;
  mp: string;
  constituency: string;
  workDescription: string;
  financialYear: string;
  house: 'Lok Sabha' | 'Rajya Sabha';

  recommendedDate: string | null;
  sanctionDate: string | null;
  completionDate: string | null;
  expenditureDate: string | null;

  sanctionAmount: number | null;
  recommendedAmount: number | null;
  amountDisbursed: number | null;
  expenditureAmount: number | null;
  totalPaid: number | null;
  allocatedLimit: number | null;
  disbursementRatio: number | null;

  workStatus: WorkStatus;
  paymentStatus: PaymentStatus;
  isCompleted: boolean;
  isSanctioned: boolean;
  isRecommendedOnly: boolean;

  daysSinceSanction: number | null;
  daysSinceRecommendation: number | null;
  daysToComplete: number | null;

  vendorName: string | null;
  risk?: RiskResult;
  whyAttention?: string[];
  featureContributions?: Array<{ name: string; points: number }>;
}

export interface ProjectFilters {
  house?: 'Lok Sabha' | 'Rajya Sabha';
  state?: string;
  district?: string;
  constituency?: string;
  mpName?: string;
  workCategory?: string;
  status?: string;
  financialYear?: string;
  tenure?: string;
  riskLevel?: string;
  isSanctioned?: boolean;
  isCompleted?: boolean;
  hasDisbursement?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AnomalyRecord {
  id?: string;
  work_id: string;
  house: 'Lok Sabha' | 'Rajya Sabha';
  anomaly_type: 'unsanctioned' | 'stale_status' | 'cost_anomaly' | 'disbursement_anomaly' | 'vendor_concentration' | 'duplicate_work';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number;
  details: Record<string, any>;
  created_at?: string;
}

export interface DashboardKPIs {
  totalProjects: number;
  totalSanctionedAmount: number;
  totalDisbursedAmount: number;
  totalExpenditureAmount: number;
  completedProjects: number;
  completionRate: number;
  highRiskCount: number;
  avgRiskScore: number;
}
