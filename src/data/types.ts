// Data types for the MPLADS Intelligence Platform
// Maps to actual dataset columns from the 6 provided CSV files

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

// ─── Raw parsed rows (direct from CSV) ─────────────────────────────────────

export interface RawSanctionedWork {
  srNo: string;
  workCategory: string;
  workId: string;           // "Work" column — contains the full work ID string
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
  sanctionDate: string;     // may be "NA"
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

// ─── Processed / enriched project record ───────────────────────────────────

export interface RiskFactor {
  id: string;
  label: string;
  description: string;
  severity: RiskLevel;
  score: number;           // 0-100 contribution
  available: boolean;      // was the data available to compute this?
  value?: string | number; // supporting metric
}

export interface RiskResult {
  score: number;           // 0-100
  level: RiskLevel;
  factors: RiskFactor[];
  explanation: string;
  factorsAvailable: number;
  factorsTotal: number;
}

export interface EnrichedProject {
  // Identity
  workId: string;
  srNo: string;
  workCategory: string;
  state: string;
  ida: string;
  district: string;           // extracted from IDA
  mp: string;
  constituency: string;
  workDescription: string;
  financialYear: string;      // extracted from workId
  house: 'Lok Sabha' | 'Rajya Sabha'; // Source house — NEVER mix

  // Dates
  recommendedDate: Date | null;
  sanctionDate: Date | null;
  completionDate: Date | null;
  expenditureDate: Date | null;

  // Financial
  sanctionAmount: number | null;
  recommendedAmount: number | null;
  amountDisbursed: number | null;    // from completed works
  expenditureAmount: number | null;  // from expenditure table
  totalPaid: number | null;          // disbursed + expenditure
  allocatedLimit: number | null;     // from MP allocation

  // Derived financials
  disbursementRatio: number | null;  // amountDisbursed / sanctionAmount * 100

  // Status
  workStatus: WorkStatus;
  paymentStatus: PaymentStatus;
  isCompleted: boolean;
  isSanctioned: boolean;
  isRecommendedOnly: boolean;        // recommended but never sanctioned

  // Timing
  daysSinceSanction: number | null;
  daysSinceRecommendation: number | null;
  daysToComplete: number | null;

  // Vendor
  vendorName: string | null;

  // Risk
  risk: RiskResult;

  // Verification (user-driven state)
  verificationStatus: VerificationStatus;
  verificationHistory: VerificationEvent[];
}

export interface VerificationEvent {
  timestamp: string;
  action: string;
  comment?: string;
  actor: string;
}

// ─── Dataset metadata ───────────────────────────────────────────────────────

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

// ─── Analytics aggregations ─────────────────────────────────────────────────

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
