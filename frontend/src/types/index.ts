// Data types for the MPLADS Intelligence Platform
// Maps to Supabase PostgreSQL schemas and domain models

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

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

export interface RawSanctionedWork {
  srNo: string;
  workCategory: string;
  workId: string;
  state: string;
  ida: string;
  mp: string;
  constituency: string;
  workDescription: string;
  recommendedDate: string;
  sanctionDate: string;
  sanctionAmount: number | null;
  workStatus: string;
}

export interface RawRecommendedWork {
  srNo: string;
  workCategory: string;
  workId: string;
  state: string;
  ida: string;
  mp: string;
  constituency: string;
  workDescription: string;
  recommendedDate: string;
  recommendedAmount: number | null;
  sanctionDate: string;
}

export interface RawCompletedWork {
  srNo: string;
  workCategory: string;
  workId: string;
  state: string;
  ida: string;
  workDescription: string;
  mp: string;
  constituency: string;
  image: string;
  completionDate: string;
  amountDisbursed: number | null;
}

export interface RawExpenditure {
  srNo: string;
  state: string;
  workCategory: string;
  workId: string;
  ida: string;
  mp: string;
  constituency: string;
  expenditureDate: string;
  vendorName: string;
  paymentStatus: string;
  fundDisbursedAmount: number | null;
}

export interface RawAllocatedLimit {
  srNo: string;
  state: string;
  mp: string;
  constituency: string;
  allocatedAmount: number | null;
}

export interface RawCalamity {
  srNo: string;
  calamityType: string;
  calamityName: string;
  mp: string;
  dateOfConsent: string;
  consentAmount: number | null;
}

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

  recommendedDate: Date | null;
  sanctionDate: Date | null;
  completionDate: Date | null;
  expenditureDate: Date | null;

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
  risk: RiskResult;

  verificationStatus: VerificationStatus;
  verificationHistory: VerificationEvent[];

  // Optional explainability properties from Anomaly scan
  whyAttention?: string[];
  featureContributions?: { feature: string; value: any; contribution: number }[];
}

export interface VerificationEvent {
  timestamp: string;
  action: string;
  comment?: string;
  actor: string;
}

export interface DatasetInfo {
  name: string;
  filename: string;
  records: number;
  columns: string[];
  sampleValues: Record<string, string>;
  missingValueCounts: Record<string, number>;
}

export interface DatasetSummary {
  datasets: DatasetInfo[];
  totalProjects: number;
  loadedAt: string;
}

export interface DistrictSummary {
  district: string;
  totalProjects: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  totalSanctionAmount: number;
  totalDisbursed: number;
  avgScore: number;
}

export interface CategorySummary {
  category: string;
  totalProjects: number;
  highRisk: number;
  avgAmount: number;
  avgScore: number;
}

export interface MPSummary {
  mp: string;
  constituency: string;
  totalProjects: number;
  allocatedAmount: number | null;
  totalSanctioned: number;
  highRisk: number;
}
