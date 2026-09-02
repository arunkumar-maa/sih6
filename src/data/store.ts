// Zustand global store for MPLADS Intelligence Platform
import { create } from 'zustand';
import type {
  EnrichedProject,
  VerificationStatus,
  VerificationEvent,
  DatasetSummary,
} from './types';
import {
  parseSanctionedWorks,
  parseRecommendedWorks,
  parseCompletedWorks,
  parseExpenditure,
  parseAllocatedLimit,
  parseCalamity,
} from './parser';
import { processDatasets } from './processor';
import { buildCategoryMedians, buildVendorCounts, calculateRiskScore } from './riskEngine';

// Import dataset CSV files directly as raw strings using Vite's ?raw import
import sanctionedCsv from '../../dataset/Works Sanctioned.csv?raw';
import recommendedCsv from '../../dataset/Works Recommended.csv?raw';
import completedCsv from '../../dataset/Works Completed.csv?raw';
import expenditureCsv from '../../dataset/Expenditure on Completed and On-going Works as on Date.csv?raw';
import allocatedCsv from '../../dataset/Allocated Limit for Honble MPs.csv?raw';
import calamityCsv from '../../dataset/Amount consented for Calamity.csv?raw';

interface AppStore {
  // Data state
  projects: EnrichedProject[];
  isLoading: boolean;
  isAnalyzing: boolean;
  analysisComplete: boolean;
  loadError: string | null;
  datasetSummary: DatasetSummary | null;

  // UI state
  selectedProjectId: string | null;
  currentPage: string;

  // Actions
  loadDatasets: () => void;
  runAnalysis: () => Promise<void>;
  resetAnalysis: () => void;
  selectProject: (id: string | null) => void;
  setCurrentPage: (page: string) => void;
  updateVerification: (workId: string, status: VerificationStatus, comment?: string) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  projects: [],
  isLoading: true,
  isAnalyzing: false,
  analysisComplete: false,
  loadError: null,
  datasetSummary: null,
  selectedProjectId: null,
  currentPage: 'dashboard',

  loadDatasets: () => {
    set({ isLoading: true, loadError: null });
    try {
      const sanctioned = parseSanctionedWorks(sanctionedCsv);
      const recommended = parseRecommendedWorks(recommendedCsv);
      const completedList = parseCompletedWorks(completedCsv);
      const expenditureList = parseExpenditure(expenditureCsv);
      const allocated = parseAllocatedLimit(allocatedCsv);
      const calamity = parseCalamity(calamityCsv);

      const result = processDatasets(sanctioned, recommended, completedList, expenditureList, allocated);

      // Build dataset summary
      const datasetSummary: DatasetSummary = {
        datasets: [
          {
            name: 'Works Sanctioned',
            filename: 'Works Sanctioned.csv',
            records: sanctioned.length,
            columns: ['Work category', 'Work', 'State', 'IDA', 'MP', 'Constituency', 'Work description', 'Recommended date', 'Sanction Date', 'Sanction Amount', 'Work Status'],
            sampleValues: {
              'Work Status': Array.from(new Set(sanctioned.slice(0, 50).map(s => s.workStatus))).slice(0, 3).join(', '),
              'State': 'Tamil Nadu',
            },
            missingValueCounts: {
              'Sanction Date': sanctioned.filter(s => !s.sanctionDate || s.sanctionDate === 'NA').length,
              'Sanction Amount': sanctioned.filter(s => s.sanctionAmount === null).length,
            },
          },
          {
            name: 'Works Recommended',
            filename: 'Works Recommended.csv',
            records: recommended.length,
            columns: ['Work category', 'WORK', 'State', 'IDA', 'MP', 'Constituency', 'Work description', 'Recommended date', 'RECOMMENDED AMOUNT', 'Sanction Date'],
            sampleValues: {
              'Sanction Date (NA)': recommended.filter(r => !r.sanctionDate || r.sanctionDate === 'NA').length + ' records',
            },
            missingValueCounts: {
              'Sanction Date': recommended.filter(r => !r.sanctionDate || r.sanctionDate === 'NA').length,
              'Recommended Amount': recommended.filter(r => r.recommendedAmount === null).length,
            },
          },
          {
            name: 'Works Completed',
            filename: 'Works Completed.csv',
            records: completedList.length,
            columns: ['Work Category', 'Work', 'State', 'IDA', 'Work Description', 'MP', 'Constituency', 'Completion Date', 'Amount Disbursed'],
            sampleValues: {},
            missingValueCounts: {
              'Amount Disbursed': completedList.filter(c => c.amountDisbursed === null).length,
              'Completion Date': completedList.filter(c => !c.completionDate).length,
            },
          },
          {
            name: 'Expenditure (Ongoing)',
            filename: 'Expenditure on Completed and On-going Works as on Date.csv',
            records: expenditureList.length,
            columns: ['State', 'Work', 'Work ID', 'IDA', 'MP', 'Constituency', 'Expenditure Date', 'Vendor Name', 'Payment Status', 'Fund Disbursed Amount'],
            sampleValues: {
              'Payment Status': Array.from(new Set(expenditureList.slice(0, 20).map(e => e.paymentStatus))).join(', '),
            },
            missingValueCounts: {
              'Fund Disbursed Amount': expenditureList.filter(e => e.fundDisbursedAmount === null).length,
              'Vendor Name': expenditureList.filter(e => !e.vendorName).length,
            },
          },
          {
            name: 'Allocated Limit (MPs)',
            filename: 'Allocated Limit for Honble MPs.csv',
            records: allocated.length,
            columns: ['Sr. No.', 'State', 'MP', 'Constituency', 'Allocated Amount'],
            sampleValues: {},
            missingValueCounts: {
              'Allocated Amount': allocated.filter(a => a.allocatedAmount === null).length,
            },
          },
          {
            name: 'Calamity Consents',
            filename: 'Amount consented for Calamity.csv',
            records: calamity.length,
            columns: ['Calamity Type', 'Calamity Name', 'MP', 'Date of Consent', 'Consent Amount'],
            sampleValues: {
              'Calamity': calamity[0]?.calamityName ?? 'N/A',
            },
            missingValueCounts: {},
          },
        ],
        totalProjects: result.projects.length,
        loadedAt: new Date().toISOString(),
      };

      set({
        projects: result.projects,
        isLoading: false,
        analysisComplete: true,
        datasetSummary,
      });
    } catch (err) {
      console.error("Error parsing dataset:", err);
      set({
        isLoading: false,
        loadError: err instanceof Error ? err.message : 'Unknown error parsing datasets',
      });
    }
  },

  runAnalysis: async () => {
    const { projects } = get();
    if (projects.length === 0) return;

    set({ isAnalyzing: true });
    await new Promise(r => setTimeout(r, 800));

    const categoryMedians = buildCategoryMedians(projects);
    const vendorCounts = buildVendorCounts(projects);

    const updated = projects.map(p => ({
      ...p,
      risk: calculateRiskScore(p, categoryMedians, vendorCounts),
    }));

    set({ projects: updated, isAnalyzing: false, analysisComplete: true });
  },

  resetAnalysis: () => {
    const { projects } = get();
    const reset = projects.map(p => ({
      ...p,
      risk: {
        score: 0,
        level: 'LOW' as const,
        factors: [],
        explanation: 'Analysis reset. Click Run AI Analysis to re-score.',
        factorsAvailable: 0,
        factorsTotal: 5,
      },
      verificationStatus: 'New Alert' as const,
      verificationHistory: [],
    }));
    set({ projects: reset, analysisComplete: false });
  },

  selectProject: (id) => set({ selectedProjectId: id }),
  setCurrentPage: (page) => set({ currentPage: page }),

  updateVerification: (workId, status, comment) => {
    const { projects } = get();
    const event: VerificationEvent = {
      timestamp: new Date().toISOString(),
      action: status,
      comment,
      actor: 'Officer',
    };
    const updated = projects.map(p =>
      p.workId === workId
        ? { ...p, verificationStatus: status, verificationHistory: [...p.verificationHistory, event] }
        : p
    );
    set({ projects: updated });
  },
}));
