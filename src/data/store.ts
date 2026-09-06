// Zustand global store for MPLADS Intelligence Platform
// CRITICAL: Lok Sabha and Rajya Sabha datasets are ALWAYS kept separate.
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
import {
  loadRajyaSabhaDatasets,
  isRajyaSabhaLoaded,
  getCachedRajyaSabhaProjects,
} from './rajyaSabhaLoader';

// Import LOK SABHA dataset CSV files directly as raw strings using Vite's ?raw import
import sanctionedCsv from '../../lok_sabha_dataset/Works Sanctioned.csv?raw';
import recommendedCsv from '../../lok_sabha_dataset/Works Recommended.csv?raw';
import completedCsv from '../../lok_sabha_dataset/Works Completed.csv?raw';
import expenditureCsv from '../../lok_sabha_dataset/Expenditure on Completed and On-going Works as on Date.csv?raw';
import allocatedCsv from '../../lok_sabha_dataset/Allocated Limit for Honble MPs.csv?raw';
import calamityCsv from '../../lok_sabha_dataset/Amount consented for Calamity.csv?raw';

interface AppStore {
  // ── House-separated datasets ──────────────────────────────────────
  lokSabhaProjects: EnrichedProject[];
  rajyaSabhaProjects: EnrichedProject[];

  // Active house selector — determines which dataset all pages use
  activeHouse: 'Lok Sabha' | 'Rajya Sabha';

  // Derived: returns the currently active house dataset
  // Use this throughout the app instead of raw lokSabhaProjects/rajyaSabhaProjects
  projects: EnrichedProject[];

  // ── Loading state ─────────────────────────────────────────────────
  isLoading: boolean;
  isAnalyzing: boolean;
  analysisComplete: boolean;
  loadError: string | null;
  datasetSummary: DatasetSummary | null;

  // Rajya Sabha lazy loading
  isLoadingRajyaSabha: boolean;
  rajyaSabhaLoadError: string | null;
  rajyaSabhaLoaded: boolean;

  // ── UI state ──────────────────────────────────────────────────────
  selectedProjectId: string | null;
  currentPage: string;
  monitoringFilter: { state?: string; constituency?: string; house?: 'Lok Sabha' | 'Rajya Sabha' } | null;

  // ── Actions ───────────────────────────────────────────────────────
  loadDatasets: () => void;
  loadRajyaSabhaDatasets: () => Promise<void>;
  runAnalysis: () => Promise<void>;
  resetAnalysis: () => void;
  selectProject: (id: string | null) => void;
  setCurrentPage: (page: string) => void;
  setActiveHouse: (house: 'Lok Sabha' | 'Rajya Sabha') => void;
  setMonitoringFilter: (filter: { state?: string; constituency?: string; house?: 'Lok Sabha' | 'Rajya Sabha' } | null) => void;
  updateVerification: (workId: string, status: VerificationStatus, comment?: string) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  lokSabhaProjects: [],
  rajyaSabhaProjects: [],
  activeHouse: 'Lok Sabha',

  // projects = always the currently active house dataset
  projects: [],

  isLoading: true,
  isAnalyzing: false,
  analysisComplete: false,
  loadError: null,
  datasetSummary: null,

  isLoadingRajyaSabha: false,
  rajyaSabhaLoadError: null,
  rajyaSabhaLoaded: false,

  selectedProjectId: null,
  currentPage: 'dashboard',
  monitoringFilter: null,

  // ── Load Lok Sabha dataset (at startup) ───────────────────────────
  loadDatasets: () => {
    set({ isLoading: true, loadError: null });
    try {
      const sanctioned = parseSanctionedWorks(sanctionedCsv);
      const recommended = parseRecommendedWorks(recommendedCsv);
      const completedList = parseCompletedWorks(completedCsv);
      const expenditureList = parseExpenditure(expenditureCsv);
      const allocated = parseAllocatedLimit(allocatedCsv);
      const calamity = parseCalamity(calamityCsv);

      // Process with house = 'Lok Sabha' — every project gets tagged
      const result = processDatasets(
        sanctioned,
        recommended,
        completedList,
        expenditureList,
        allocated,
        'Lok Sabha'
      );

      // Safety check
      const lokSabhaProjects = result.projects.filter(p => p.house === 'Lok Sabha');
      console.log(`[LokSabha] Loaded ${lokSabhaProjects.length} projects`);

      const datasetSummary: DatasetSummary = {
        datasets: [
          {
            name: 'Works Sanctioned (Lok Sabha)',
            filename: 'lok_sabha_dataset/Works Sanctioned.csv',
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
            name: 'Works Recommended (Lok Sabha)',
            filename: 'lok_sabha_dataset/Works Recommended.csv',
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
            name: 'Works Completed (Lok Sabha)',
            filename: 'lok_sabha_dataset/Works Completed.csv',
            records: completedList.length,
            columns: ['Work Category', 'Work', 'State', 'IDA', 'Work Description', 'MP', 'Constituency', 'Completion Date', 'Amount Disbursed'],
            sampleValues: {},
            missingValueCounts: {
              'Amount Disbursed': completedList.filter(c => c.amountDisbursed === null).length,
              'Completion Date': completedList.filter(c => !c.completionDate).length,
            },
          },
          {
            name: 'Expenditure (Lok Sabha)',
            filename: 'lok_sabha_dataset/Expenditure on Completed and On-going Works as on Date.csv',
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
            name: 'Allocated Limit (Lok Sabha MPs)',
            filename: 'lok_sabha_dataset/Allocated Limit for Honble MPs.csv',
            records: allocated.length,
            columns: ['Sr. No.', 'State', 'MP', 'Constituency', 'Allocated Amount'],
            sampleValues: {},
            missingValueCounts: {
              'Allocated Amount': allocated.filter(a => a.allocatedAmount === null).length,
            },
          },
          {
            name: 'Calamity Consents (Lok Sabha)',
            filename: 'lok_sabha_dataset/Amount consented for Calamity.csv',
            records: calamity.length,
            columns: ['Calamity Type', 'Calamity Name', 'MP', 'Date of Consent', 'Consent Amount'],
            sampleValues: {
              'Calamity': calamity[0]?.calamityName ?? 'N/A',
            },
            missingValueCounts: {},
          },
        ],
        totalProjects: lokSabhaProjects.length,
        loadedAt: new Date().toISOString(),
      };

      set({
        lokSabhaProjects,
        projects: lokSabhaProjects,   // sync projects to LS since LS is default
        isLoading: false,
        analysisComplete: true,
        datasetSummary,
      });
    } catch (err) {
      console.error('Error parsing Lok Sabha dataset:', err);
      set({
        isLoading: false,
        loadError: err instanceof Error ? err.message : 'Unknown error parsing Lok Sabha datasets',
      });
    }
  },

  // ── Load Rajya Sabha dataset (lazy, on demand) ─────────────────────
  loadRajyaSabhaDatasets: async () => {
    if (isRajyaSabhaLoaded()) {
      // Already loaded — just sync to store
      const cached = getCachedRajyaSabhaProjects();
      set({ rajyaSabhaProjects: cached, rajyaSabhaLoaded: true });
      return;
    }

    set({ isLoadingRajyaSabha: true, rajyaSabhaLoadError: null });
    try {
      const rsProjects = await loadRajyaSabhaDatasets();

      // Run risk scoring for Rajya Sabha
      const categoryMedians = buildCategoryMedians(rsProjects);
      const vendorCounts = buildVendorCounts(rsProjects);
      const scoredProjects = rsProjects.map(p => ({
        ...p,
        risk: calculateRiskScore(p, categoryMedians, vendorCounts),
        house: 'Rajya Sabha' as const,
      }));

      const { activeHouse } = get();
      console.log(`[RajyaSabha] Risk-scored ${scoredProjects.length} projects`);
      set({
        rajyaSabhaProjects: scoredProjects,
        // Only update projects if RS is the currently active house
        ...(activeHouse === 'Rajya Sabha' ? { projects: scoredProjects } : {}),
        isLoadingRajyaSabha: false,
        rajyaSabhaLoaded: true,
      });
    } catch (err) {
      console.error('Error loading Rajya Sabha dataset:', err);
      set({
        isLoadingRajyaSabha: false,
        rajyaSabhaLoadError: err instanceof Error ? err.message : 'Unknown error loading Rajya Sabha datasets',
      });
    }
  },

  // ── Switch active house ─────────────────────────────────────────────
  setActiveHouse: (house) => {
    const { lokSabhaProjects, rajyaSabhaProjects } = get();
    const newProjects = house === 'Lok Sabha' ? lokSabhaProjects : rajyaSabhaProjects;
    set({ activeHouse: house, projects: newProjects });

    // If switching to Rajya Sabha and not yet loaded, trigger load
    if (house === 'Rajya Sabha' && !get().rajyaSabhaLoaded) {
      get().loadRajyaSabhaDatasets();
    }
  },

  // ── AI Risk Analysis ───────────────────────────────────────────────
  runAnalysis: async () => {
    const { lokSabhaProjects, rajyaSabhaProjects } = get();

    set({ isAnalyzing: true });
    await new Promise(r => setTimeout(r, 800));

    // Re-score Lok Sabha
    if (lokSabhaProjects.length > 0) {
      const lsCategoryMedians = buildCategoryMedians(lokSabhaProjects);
      const lsVendorCounts = buildVendorCounts(lokSabhaProjects);
      const updatedLS = lokSabhaProjects.map(p => ({
        ...p,
        risk: calculateRiskScore(p, lsCategoryMedians, lsVendorCounts),
      }));
      const { activeHouse } = get();
      set({
        lokSabhaProjects: updatedLS,
        ...(activeHouse === 'Lok Sabha' ? { projects: updatedLS } : {}),
      });
    }

    // Re-score Rajya Sabha if loaded
    if (rajyaSabhaProjects.length > 0) {
      const rsCategoryMedians = buildCategoryMedians(rajyaSabhaProjects);
      const rsVendorCounts = buildVendorCounts(rajyaSabhaProjects);
      const updatedRS = rajyaSabhaProjects.map(p => ({
        ...p,
        risk: calculateRiskScore(p, rsCategoryMedians, rsVendorCounts),
      }));
      const { activeHouse } = get();
      set({
        rajyaSabhaProjects: updatedRS,
        ...(activeHouse === 'Rajya Sabha' ? { projects: updatedRS } : {}),
      });
    }

    set({ isAnalyzing: false, analysisComplete: true });
  },

  resetAnalysis: () => {
    const { lokSabhaProjects, rajyaSabhaProjects } = get();
    const resetLS = lokSabhaProjects.map(p => ({
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
    const resetRS = rajyaSabhaProjects.map(p => ({
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
    const { activeHouse } = get();
    set({
      lokSabhaProjects: resetLS,
      rajyaSabhaProjects: resetRS,
      projects: activeHouse === 'Lok Sabha' ? resetLS : resetRS,
      analysisComplete: false,
    });
  },

  selectProject: (id) => set({ selectedProjectId: id }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setMonitoringFilter: (filter) => set({ monitoringFilter: filter }),

  updateVerification: (workId, status, comment) => {
    const { lokSabhaProjects, rajyaSabhaProjects, activeHouse } = get();
    const event: VerificationEvent = {
      timestamp: new Date().toISOString(),
      action: status,
      comment,
      actor: 'Officer',
    };

    const updateList = (list: EnrichedProject[]) =>
      list.map(p =>
        p.workId === workId
          ? { ...p, verificationStatus: status, verificationHistory: [...p.verificationHistory, event] }
          : p
      );

    const updatedLS = updateList(lokSabhaProjects);
    const updatedRS = updateList(rajyaSabhaProjects);
    set({
      lokSabhaProjects: updatedLS,
      rajyaSabhaProjects: updatedRS,
      projects: activeHouse === 'Lok Sabha' ? updatedLS : updatedRS,
    });
  },
}));
