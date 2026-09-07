// Zustand global store for MPLADS Intelligence Platform
// Integrates high-performance Supabase database backend with backward-compatible CSV fallback.
// CRITICAL: Lok Sabha and Rajya Sabha datasets are ALWAYS kept strictly separate.
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
import { detectDuplicates } from '../utils/duplicateDetection';
import { loadVerificationOverrides, saveVerificationOverride } from './verificationStorage';
import {
  loadRajyaSabhaDatasets as loadLocalRajyaSabha,
  isRajyaSabhaLoaded,
  getCachedRajyaSabhaProjects,
} from './rajyaSabhaLoader';
import { checkSupabaseConnection } from './supabase/client';
import { getProjects, getProjectById, updateProjectVerification } from './supabase/projectQueries';
import { getDashboardKPIs, getDistinctFilterOptions, DashboardKPIs, FilterOptions } from './supabase/analyticsQueries';
import {
  getAnomalyCounts,
  getAnomalyProjects,
  runHouseAnomalyAnalysis,
  AnomalyTab,
  AnomalyCounts,
  AnalysisSummary,
} from './supabase/anomalyQueries';

function applyVerificationOverrides(projects: EnrichedProject[]): EnrichedProject[] {
  const overrides = loadVerificationOverrides();
  return projects.map(p => {
    const override = overrides[p.workId];
    if (!override) return p;
    return {
      ...p,
      verificationStatus: override.status,
      verificationHistory: override.history,
    };
  });
}

// Import LOK SABHA dataset CSV files for fallback reference
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

  // Active projects (paginated or subset currently active)
  projects: EnrichedProject[];
  totalProjectCount: number;

  // Supabase Backend State
  isUsingSupabase: boolean;
  kpis: DashboardKPIs | null;
  kpisLoading: boolean;
  filterOptions: FilterOptions | null;

  // Anomaly Center State
  anomalyCounts: AnomalyCounts | null;
  anomalyProjects: Record<AnomalyTab, EnrichedProject[]>;
  anomalyLoading: boolean;
  anomalyError: string | null;
  lastAnalysisSummary: AnalysisSummary | null;

  // ── Loading state ─────────────────────────────────────────────────
  isLoading: boolean;
  isAnalyzing: boolean;
  analysisComplete: boolean;
  loadError: string | null;
  datasetSummary: DatasetSummary | null;

  // Rajya Sabha state
  isLoadingRajyaSabha: boolean;
  rajyaSabhaLoadError: string | null;
  rajyaSabhaLoaded: boolean;

  // ── UI state ──────────────────────────────────────────────────────
  selectedProjectId: string | null;
  currentPage: string;
  monitoringFilter: { state?: string; constituency?: string; house?: 'Lok Sabha' | 'Rajya Sabha' } | null;

  // ── Actions ───────────────────────────────────────────────────────
  loadDatasets: () => Promise<void>;
  loadKPIs: (filters?: Record<string, string>) => Promise<void>;
  loadFilterOptions: (state?: string) => Promise<void>;
  loadAnomalyData: (house?: 'Lok Sabha' | 'Rajya Sabha') => Promise<void>;
  loadRajyaSabhaDatasets: () => Promise<void>;
  runAnalysis: () => Promise<void>;
  resetAnalysis: () => void;
  selectProject: (id: string | null) => void;
  setCurrentPage: (page: string) => void;
  setActiveHouse: (house: 'Lok Sabha' | 'Rajya Sabha') => void;
  setMonitoringFilter: (filter: { state?: string; constituency?: string; house?: 'Lok Sabha' | 'Rajya Sabha' } | null) => void;
  updateVerification: (workId: string, status: VerificationStatus, comment?: string) => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  lokSabhaProjects: [],
  rajyaSabhaProjects: [],
  activeHouse: 'Lok Sabha',
  projects: [],
  totalProjectCount: 65000,

  isUsingSupabase: true,
  kpis: null,
  kpisLoading: false,
  filterOptions: null,

  anomalyCounts: null,
  anomalyProjects: {
    pending: [],
    stale: [],
    cost: [],
    disbursement: [],
    vendor: [],
  },
  anomalyLoading: false,
  anomalyError: null,
  lastAnalysisSummary: null,

  isLoading: true,
  isAnalyzing: false,
  analysisComplete: true,
  loadError: null,
  datasetSummary: null,

  isLoadingRajyaSabha: false,
  rajyaSabhaLoadError: null,
  rajyaSabhaLoaded: false,

  selectedProjectId: null,
  currentPage: 'dashboard',
  monitoringFilter: null,

  // Load Dashboard KPIs via Supabase RPC
  loadKPIs: async (filters = {}) => {
    const { activeHouse, isUsingSupabase } = get();
    if (!isUsingSupabase) return;

    set({ kpisLoading: true });
    try {
      const kpis = await getDashboardKPIs(activeHouse, filters);
      set({ kpis, kpisLoading: false });
    } catch (err) {
      console.warn('[Store] Failed to fetch Supabase KPIs:', err);
      set({ kpisLoading: false });
    }
  },

  // Load Distinct Filter Options via Supabase RPC
  loadFilterOptions: async (state) => {
    const { activeHouse, isUsingSupabase } = get();
    if (!isUsingSupabase) return;

    try {
      const options = await getDistinctFilterOptions(activeHouse, state);
      set(prev => ({
        filterOptions: {
          ...prev.filterOptions,
          ...options,
        },
      }));
    } catch (err) {
      console.warn('[Store] Failed to fetch distinct filter options:', err);
    }
  },

  // Load Anomaly Center Intelligence
  loadAnomalyData: async (targetHouse) => {
    const house = targetHouse || get().activeHouse;
    set({ anomalyLoading: true, anomalyError: null });
    try {
      const [counts, pending, stale, cost, disbursement] = await Promise.all([
        getAnomalyCounts(house),
        getAnomalyProjects(house, 'pending', 25),
        getAnomalyProjects(house, 'stale', 25),
        getAnomalyProjects(house, 'cost', 25),
        getAnomalyProjects(house, 'disbursement', 25),
      ]);

      if (get().activeHouse === house) {
        set({
          anomalyCounts: counts,
          anomalyProjects: {
            pending,
            stale,
            cost,
            disbursement,
            vendor: [],
          },
          anomalyLoading: false,
        });
      }
    } catch (err) {
      console.error('[Store] Failed to load anomaly data:', err);
      set({
        anomalyLoading: false,
        anomalyError: err instanceof Error ? err.message : 'Unable to load anomaly analysis',
      });
    }
  },

  // ── Primary Dataset Initializer ───────────────────────────────────
  loadDatasets: async () => {
    set({ isLoading: true, loadError: null });

    // Step 1: Check Supabase connection
    const supabaseHealthy = await checkSupabaseConnection();

    if (supabaseHealthy) {
      console.log('[Store] Supabase connection healthy. Using PostgreSQL data layer.');
      set({ isUsingSupabase: true });

      try {
        // Fetch KPIs & Distinct options from Supabase
        const [kpiData, optionsData, paginatedData] = await Promise.all([
          getDashboardKPIs('Lok Sabha'),
          getDistinctFilterOptions('Lok Sabha'),
          getProjects({ house: 'Lok Sabha', page: 1, pageSize: 500, sortField: 'risk', sortDir: 'desc' }),
        ]);

        const datasetSummary: DatasetSummary = {
          datasets: [
            {
              name: 'Lok Sabha Works (PostgreSQL Indexed)',
              filename: 'public.lok_sabha_projects',
              records: 65000,
              columns: ['work_id', 'work_category', 'state', 'district', 'mp_name', 'constituency', 'work_description', 'sanction_amount', 'total_paid', 'work_status', 'risk_score', 'risk_level'],
              sampleValues: {
                'State': 'Tamil Nadu',
                'Status': 'Work Completed',
              },
              missingValueCounts: {},
            },
            {
              name: 'Rajya Sabha Works (PostgreSQL Indexed)',
              filename: 'public.rajya_sabha_projects',
              records: 79219,
              columns: ['work_id', 'work_category', 'state', 'district', 'mp_name', 'work_description', 'sanction_amount', 'total_paid', 'work_status', 'risk_score', 'risk_level'],
              sampleValues: {
                'State': 'Uttar Pradesh',
                'Status': 'Sanction',
              },
              missingValueCounts: {},
            },
          ],
          totalProjects: 65000,
          loadedAt: new Date().toISOString(),
        };

        set({
          kpis: kpiData,
          filterOptions: optionsData,
          projects: applyVerificationOverrides(paginatedData.projects),
          totalProjectCount: paginatedData.totalCount || 65000,
          isLoading: false,
          analysisComplete: true,
          datasetSummary,
        });
        // Pre-load Anomaly Center intelligence for Lok Sabha
        get().loadAnomalyData('Lok Sabha');
        return;
      } catch (err) {
        console.warn('[Store] Error querying Supabase initial batch, falling back to local CSV parser:', err);
      }
    }

    // Fallback: local CSV processing
    console.log('[Store] Falling back to local flat-file CSV parser...');
    set({ isUsingSupabase: false });
    try {
      const sanctioned = parseSanctionedWorks(sanctionedCsv);
      const recommended = parseRecommendedWorks(recommendedCsv);
      const completedList = parseCompletedWorks(completedCsv);
      const expenditureList = parseExpenditure(expenditureCsv);
      const allocated = parseAllocatedLimit(allocatedCsv);

      const result = processDatasets(
        sanctioned,
        recommended,
        completedList,
        expenditureList,
        allocated,
        'Lok Sabha'
      );

      const lokSabhaProjects = applyVerificationOverrides(result.projects.filter(p => p.house === 'Lok Sabha'));

      set({
        lokSabhaProjects,
        projects: lokSabhaProjects,
        totalProjectCount: lokSabhaProjects.length,
        isLoading: false,
        analysisComplete: true,
      });
    } catch (err) {
      console.error('Error parsing local fallback datasets:', err);
      set({
        isLoading: false,
        loadError: err instanceof Error ? err.message : 'Unknown error loading datasets',
      });
    }
  },

  // ── Load Rajya Sabha dataset ──────────────────────────────────────
  loadRajyaSabhaDatasets: async () => {
    const { isUsingSupabase } = get();

    if (isUsingSupabase) {
      set({ isLoadingRajyaSabha: true, rajyaSabhaLoadError: null });
      try {
        const [kpiData, optionsData, paginatedData] = await Promise.all([
          getDashboardKPIs('Rajya Sabha'),
          getDistinctFilterOptions('Rajya Sabha'),
          getProjects({ house: 'Rajya Sabha', page: 1, pageSize: 500, sortField: 'risk', sortDir: 'desc' }),
        ]);

        const { activeHouse } = get();
        set({
          isLoadingRajyaSabha: false,
          rajyaSabhaLoaded: true,
          totalProjectCount: 79219,
          ...(activeHouse === 'Rajya Sabha'
            ? {
                kpis: kpiData,
                filterOptions: optionsData,
                projects: applyVerificationOverrides(paginatedData.projects),
              }
            : {}),
        });
      } catch (err) {
        console.error('[Store] Error loading Rajya Sabha from Supabase:', err);
        set({
          isLoadingRajyaSabha: false,
          rajyaSabhaLoadError: err instanceof Error ? err.message : 'Failed to load Rajya Sabha',
        });
      }
      return;
    }

    // Fallback to local CSV loader
    if (isRajyaSabhaLoaded()) {
      const cached = applyVerificationOverrides(getCachedRajyaSabhaProjects());
      set({ rajyaSabhaProjects: cached, rajyaSabhaLoaded: true });
      return;
    }

    set({ isLoadingRajyaSabha: true, rajyaSabhaLoadError: null });
    try {
      const rsProjects = await loadLocalRajyaSabha();
      const categoryMedians = buildCategoryMedians(rsProjects);
      const vendorCounts = buildVendorCounts(rsProjects);
      const rsDuplicates = detectDuplicates(rsProjects);
      const scoredProjects = applyVerificationOverrides(rsProjects.map(p => ({
        ...p,
        risk: calculateRiskScore(p, categoryMedians, vendorCounts, rsDuplicates),
        house: 'Rajya Sabha' as const,
      })));

      const { activeHouse } = get();
      set({
        rajyaSabhaProjects: scoredProjects,
        ...(activeHouse === 'Rajya Sabha' ? { projects: scoredProjects } : {}),
        isLoadingRajyaSabha: false,
        rajyaSabhaLoaded: true,
      });
    } catch (err) {
      set({
        isLoadingRajyaSabha: false,
        rajyaSabhaLoadError: err instanceof Error ? err.message : 'Failed to load Rajya Sabha',
      });
    }
  },

  // ── Switch active house ───────────────────────────────────────────
  setActiveHouse: (house) => {
    const { isUsingSupabase, lokSabhaProjects, rajyaSabhaProjects } = get();

    if (isUsingSupabase) {
      set({
        activeHouse: house,
        totalProjectCount: house === 'Lok Sabha' ? 65000 : 79219,
        anomalyProjects: {
          pending: [],
          stale: [],
          cost: [],
          disbursement: [],
          vendor: [],
        },
      });
      get().loadKPIs();
      get().loadFilterOptions();
      get().loadAnomalyData(house);

      getProjects({ house, page: 1, pageSize: 500, sortField: 'risk', sortDir: 'desc' }).then(res => {
        if (get().activeHouse === house) {
          set({ projects: applyVerificationOverrides(res.projects) });
        }
      });
      return;
    }

    const newProjects = applyVerificationOverrides(house === 'Lok Sabha' ? lokSabhaProjects : rajyaSabhaProjects);
    set({ activeHouse: house, projects: newProjects, totalProjectCount: newProjects.length });
  },

  runAnalysis: async () => {
    const { isUsingSupabase, activeHouse, lokSabhaProjects, rajyaSabhaProjects, projects } = get();

    set({ isAnalyzing: true });

    if (isUsingSupabase) {
      try {
        const summary = await runHouseAnomalyAnalysis(activeHouse);
        await get().loadAnomalyData(activeHouse);
        set({
          lastAnalysisSummary: summary,
          isAnalyzing: false,
          analysisComplete: true,
        });
        return;
      } catch (err) {
        console.error('[Store] Error running Supabase AI anomaly analysis:', err);
      }
    }

    await new Promise(r => setTimeout(r, 400));

    // Re-score Lok Sabha
    if (lokSabhaProjects.length > 0) {
      const lsCategoryMedians = buildCategoryMedians(lokSabhaProjects);
      const lsVendorCounts = buildVendorCounts(lokSabhaProjects);
      const lsDuplicates = detectDuplicates(lokSabhaProjects);
      const updatedLS = applyVerificationOverrides(lokSabhaProjects.map(p => ({
        ...p,
        risk: calculateRiskScore(p, lsCategoryMedians, lsVendorCounts, lsDuplicates),
      })));
      const { activeHouse: currentHouse } = get();
      set({
        lokSabhaProjects: updatedLS,
        ...(currentHouse === 'Lok Sabha' ? { projects: updatedLS } : {}),
      });
    }

    // Re-score Rajya Sabha if loaded
    if (rajyaSabhaProjects.length > 0) {
      const rsCategoryMedians = buildCategoryMedians(rajyaSabhaProjects);
      const rsVendorCounts = buildVendorCounts(rajyaSabhaProjects);
      const rsDuplicates = detectDuplicates(rajyaSabhaProjects);
      const updatedRS = applyVerificationOverrides(rajyaSabhaProjects.map(p => ({
        ...p,
        risk: calculateRiskScore(p, rsCategoryMedians, rsVendorCounts, rsDuplicates),
      })));
      const { activeHouse: currentHouse } = get();
      set({
        rajyaSabhaProjects: updatedRS,
        ...(currentHouse === 'Rajya Sabha' ? { projects: updatedRS } : {}),
      });
    }

    // Re-score currently active projects if loaded via Supabase
    if (projects.length > 0 && lokSabhaProjects.length === 0 && rajyaSabhaProjects.length === 0) {
      const activeMedians = buildCategoryMedians(projects);
      const activeVendors = buildVendorCounts(projects);
      const activeDuplicates = detectDuplicates(projects);
      const updatedProjects = applyVerificationOverrides(projects.map(p => ({
        ...p,
        risk: calculateRiskScore(p, activeMedians, activeVendors, activeDuplicates),
      })));
      set({ projects: updatedProjects });
    }

    set({ isAnalyzing: false, analysisComplete: true });
  },

  resetAnalysis: () => {
    set({ analysisComplete: false });
  },

  selectProject: (id) => {
    set({ selectedProjectId: id });
  },

  setCurrentPage: (page) => {
    set({ currentPage: page });
  },

  setMonitoringFilter: (filter) => {
    set({ monitoringFilter: filter });
  },

  updateVerification: async (workId, status, comment) => {
    const { isUsingSupabase, activeHouse, projects } = get();

    if (isUsingSupabase) {
      await updateProjectVerification(workId, activeHouse, status, comment);
    }

    // Update locally in active state
    const event: VerificationEvent = {
      timestamp: new Date().toISOString(),
      action: status,
      comment,
      actor: 'Field Officer',
    };

    let updatedHistory: VerificationEvent[] = [event];

    const updatedProjects = projects.map(p => {
      if (p.workId !== workId) return p;
      updatedHistory = [event, ...p.verificationHistory];
      return {
        ...p,
        verificationStatus: status,
        verificationHistory: updatedHistory,
      };
    });

    saveVerificationOverride(workId, {
      status,
      history: updatedHistory,
    });

    set({
      projects: updatedProjects,
      lokSabhaProjects: get().lokSabhaProjects.map(p =>
        p.workId === workId
          ? { ...p, verificationStatus: status, verificationHistory: updatedHistory }
          : p
      ),
      rajyaSabhaProjects: get().rajyaSabhaProjects.map(p =>
        p.workId === workId
          ? { ...p, verificationStatus: status, verificationHistory: updatedHistory }
          : p
      ),
    });
  },
}));
