import type { EnrichedProject } from './index';

export interface MpDashboardMetrics {
  totalWorks: number;
  totalSanctionedAmount: number;
  totalDisbursedAmount: number;
  completedWorks: number;
  ongoingWorks: number;
  highAttentionWorks: number;
  avgCompletionRate: number;
  fundUtilization: number;
}

export interface MpDashboardResponse {
  metrics: MpDashboardMetrics;
  attentionWorks: EnrichedProject[];
  totalCount: number;
}

export interface MpInfo {
  fullName: string;
  mpName: string;
  party: string;
  constituency: string;
  state: string;
  house: 'Lok Sabha';
  mpId: string;
  email: string | null;
  photoUrl: string | null;
  allocatedLimit: number | null;
  tenureYears: string;
}

export interface MpPortfolioSummary {
  totalWorks: number;
  totalSanctioned: number;
  totalDisbursed: number;
  completedCount: number;
  ongoingCount: number;
  pendingCount: number;
  avgProgress: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

export interface MpCategoryBreakdown {
  category: string;
  count: number;
  sanctioned: number;
  completed: number;
  ongoing: number;
}

export interface MpDistrictBreakdown {
  district: string;
  count: number;
  sanctioned: number;
  disbursed: number;
  completed: number;
}

export interface MpAttentionItem {
  workId: string;
  workDescription: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  sanctionAmount: number | null;
  totalPaid: number | null;
  factors: Array<{
    id: string;
    label: string;
    description: string;
    severity: string;
    score: number;
  }>;
  explanation: string;
}

export interface MpProfileResponse {
  mpInfo: MpInfo;
  portfolioSummary: MpPortfolioSummary;
  categoryBreakdown: MpCategoryBreakdown[];
  districtBreakdown: MpDistrictBreakdown[];
  attentionItems: MpAttentionItem[];
  recentWorks: EnrichedProject[];
}

export interface MpProjectFilters {
  page?: number;
  pageSize?: number;
  district?: string;
  category?: string;
  financialYear?: string;
  status?: string;
  riskLevel?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MpProjectsResponse {
  projects: EnrichedProject[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
