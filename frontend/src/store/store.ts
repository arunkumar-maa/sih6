// Zustand global store for MPLADS Intelligence Platform
// Integrates high-performance Supabase database backend services.
// CRITICAL: Lok Sabha and Rajya Sabha datasets are ALWAYS kept strictly separate.
import { create } from 'zustand';
import type {
  EnrichedProject,
  VerificationStatus,
  VerificationEvent,
  DatasetSummary,
} from '../types';
import { loadVerificationOverrides, saveVerificationOverride } from '../utils/verificationStorage';
import { checkSupabaseConnection } from '../services/client';
import {
  getProjects,
  getProjectById,
  updateProjectVerification,
  ProjectQueryParams,
} from '../services/projectService';
import {
  getDashboardKPIs,
  getDistinctFilterOptions,
  DashboardKPIs,
  FilterOptions,
} from '../services/analyticsService';
import {
  getAnomalyCounts,
  getAnomalyProjects,
  runHouseAnomalyAnalysis,
  AnomalyTab,
  AnomalyCounts,
  AnalysisSummary,
} from '../services/anomalyService';

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

export interface AppFilters {
  search: string;
  state: string;
  district: string;
  constituency: string;
  mpName: string;
  riskLevel: string;
  status: string;
  category: string;
  tenure: string;
}

interface AppStore {
  // House-separated datasets
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

  // Loading state
  isLoading: boolean;
  isAnalyzing: boolean;
  analysisComplete: boolean;
  loadError: string | null;
  datasetSummary: DatasetSummary | null;

  // Rajya Sabha state
  isLoadingRajyaSabha: boolean;
  rajyaSabhaLoadError: string | null;
  rajyaSabhaLoaded: boolean;

  // UI state
  selectedProjectId: string | null;
  currentPage: string;
  activeTab: string;
  monitoringFilter: { house?: 'Lok Sabha' | 'Rajya Sabha'; state?: string; constituency?: string } | null;

  // Global Filter State
  filters: AppFilters;

  // Actions
  setActiveHouse: (house: 'Lok Sabha' | 'Rajya Sabha') => Promise<void>;
  setCurrentPage: (page: string) => void;
  setActiveTab: (tab: string) => void;
  selectProject: (workId: string | null) => void;
  setMonitoringFilter: (filter: { house?: 'Lok Sabha' | 'Rajya Sabha'; state?: string; constituency?: string } | null) => void;
  setFilters: (filters: Partial<AppFilters>) => void;
  resetFilters: () => void;
  loadDatasets: () => Promise<void>;
  loadRajyaSabha: () => Promise<void>;
  loadRajyaSabhaDatasets: () => Promise<void>;
  updateVerification: (workId: string, status: VerificationStatus, comment?: string) => Promise<void>;
  fetchDistinctOptions: (state?: string) => Promise<void>;
  loadFilterOptions: (state?: string) => Promise<void>;
  loadKPIs: (filters?: any) => Promise<void>;
  loadAnomalyData: (targetHouse?: 'Lok Sabha' | 'Rajya Sabha') => Promise<void>;
  runAnomalyScan: (targetHouse?: 'Lok Sabha' | 'Rajya Sabha') => Promise<void>;
  runAnalysis: () => Promise<void>;
  fetchProjectsPage: (page?: number, pageSize?: number) => Promise<void>;
  getActiveProjects: () => EnrichedProject[];
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

  isLoading: false,
  isAnalyzing: false,
  analysisComplete: false,
  loadError: null,
  datasetSummary: null,

  isLoadingRajyaSabha: false,
  rajyaSabhaLoadError: null,
  rajyaSabhaLoaded: true,

  selectedProjectId: null,
  currentPage: 'dashboard',
  activeTab: 'all',
  monitoringFilter: null,

  filters: {
    search: '',
    state: '',
    district: '',
    constituency: '',
    mpName: '',
    riskLevel: '',
    status: '',
    category: '',
    tenure: '18th Lok Sabha',
  },

  setActiveHouse: async (house) => {
    if (get().activeHouse === house) return;

    const defaultTenure = house === 'Lok Sabha' ? '18th Lok Sabha' : 'Current Rajya Sabha';

    set({
      activeHouse: house,
      selectedProjectId: null,
      isLoading: true,
      kpisLoading: true,
      filters: {
        search: '',
        state: '',
        district: '',
        constituency: '',
        mpName: '',
        riskLevel: '',
        status: '',
        category: '',
        tenure: defaultTenure,
      },
    });

    try {
      const [kpiData, optionsData, paginatedData] = await Promise.all([
        getDashboardKPIs(house),
        getDistinctFilterOptions(house),
        getProjects({ house, page: 1, pageSize: 500, sortField: 'risk', sortDir: 'desc' }),
      ]);

      set({
        kpis: kpiData,
        filterOptions: optionsData,
        projects: applyVerificationOverrides(paginatedData.projects),
        totalProjectCount: paginatedData.totalCount,
        isLoading: false,
        kpisLoading: false,
      });

      // Load anomaly data for the active house
      get().loadAnomalyData(house);
    } catch (err: any) {
      console.error(`[Store] Error switching house to ${house}:`, err);
      set({
        isLoading: false,
        kpisLoading: false,
        loadError: err.message || `Failed to load data for ${house}`,
      });
    }
  },

  setCurrentPage: (page) => set({ currentPage: page }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  selectProject: (workId) => set({ selectedProjectId: workId }),

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().fetchProjectsPage(1);
  },

  resetFilters: () => {
    const house = get().activeHouse;
    const defaultTenure = house === 'Lok Sabha' ? '18th Lok Sabha' : 'Current Rajya Sabha';
    set({
      filters: {
        search: '',
        state: '',
        district: '',
        constituency: '',
        mpName: '',
        riskLevel: '',
        status: '',
        category: '',
        tenure: defaultTenure,
      },
    });
    get().fetchProjectsPage(1);
  },

  fetchDistinctOptions: async (state) => {
    const house = get().activeHouse;
    try {
      const options = await getDistinctFilterOptions(house, state);
      set((prev) => ({
        filterOptions: {
          ...prev.filterOptions,
          ...options,
        },
      }));
    } catch (err) {
      console.warn('[Store] Failed to fetch distinct filter options:', err);
    }
  },

  setMonitoringFilter: (filter) => set({ monitoringFilter: filter }),

  loadFilterOptions: async (state) => {
    await get().fetchDistinctOptions(state);
  },

  loadKPIs: async (filters = {}) => {
    const { activeHouse } = get();
    set({ kpisLoading: true });
    try {
      const kpis = await getDashboardKPIs(activeHouse, filters);
      set({ kpis, kpisLoading: false });
    } catch (err) {
      console.warn('[Store] Failed to fetch KPIs:', err);
      set({ kpisLoading: false });
    }
  },

  loadRajyaSabhaDatasets: async () => {
    await get().loadRajyaSabha();
  },


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
    } catch (err: any) {
      console.error('[Store] Failed to load anomaly data:', err);
      set({
        anomalyLoading: false,
        anomalyError: err.message || 'Unable to load anomaly analysis',
      });
    }
  },

  runAnomalyScan: async (targetHouse) => {
    const house = targetHouse || get().activeHouse;
    set({ isAnalyzing: true });
    try {
      const summary = await runHouseAnomalyAnalysis(house);
      set({ lastAnalysisSummary: summary, isAnalyzing: false });
      await get().loadAnomalyData(house);
    } catch (err: any) {
      console.error('[Store] Anomaly scan failed:', err);
      set({ isAnalyzing: false });
    }
  },

  runAnalysis: async () => {
    await get().runAnomalyScan();
  },

  fetchProjectsPage: async (page = 1, pageSize = 200) => {
    const { activeHouse, filters } = get();
    try {
      const res = await getProjects({
        house: activeHouse,
        page,
        pageSize,
        search: filters.search,
        state: filters.state,
        district: filters.district,
        constituency: filters.constituency,
        mpName: filters.mpName,
        riskLevel: filters.riskLevel,
        status: filters.status,
        category: filters.category,
        tenure: filters.tenure,
      });

      set({
        projects: applyVerificationOverrides(res.projects),
        totalProjectCount: res.totalCount,
      });
    } catch (err) {
      console.error('[Store] Failed to fetch paginated projects:', err);
    }
  },

  loadDatasets: async () => {
    set({ isLoading: true, loadError: null });

    const supabaseHealthy = await checkSupabaseConnection();
    if (supabaseHealthy) {
      console.log('[Store] Supabase connection healthy. Using PostgreSQL data layer.');
      set({ isUsingSupabase: true });

      try {
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
                State: 'Tamil Nadu',
                Status: 'Work Completed',
              },
              missingValueCounts: {},
            },
            {
              name: 'Rajya Sabha Works (PostgreSQL Indexed)',
              filename: 'public.rajya_sabha_projects',
              records: 79219,
              columns: ['work_id', 'work_category', 'state', 'district', 'mp_name', 'work_description', 'sanction_amount', 'total_paid', 'work_status', 'risk_score', 'risk_level'],
              sampleValues: {
                State: 'Uttar Pradesh',
                Status: 'Sanction',
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

        get().loadAnomalyData('Lok Sabha');
        return;
      } catch (err: any) {
        console.error('[Store] Error querying initial Supabase batch:', err);
        set({
          isLoading: false,
          loadError: err.message || 'Failed to initialize database connection',
        });
        return;
      }
    }

    set({
      isLoading: false,
      loadError: 'Supabase database is currently unreachable. Please check network connection.',
    });
  },

  loadRajyaSabha: async () => {
    // When using Supabase, Rajya Sabha is directly available in PostgreSQL
    set({ rajyaSabhaLoaded: true });
  },

  updateVerification: async (workId, status, comment) => {
    const { activeHouse, projects } = get();
    const actor = 'Auditor / Field Officer';
    await updateProjectVerification(workId, activeHouse, status, actor, comment);

    const updatedProjects = projects.map(p => {
      if (p.workId !== workId) return p;
      const newEvent: VerificationEvent = {
        timestamp: new Date().toISOString(),
        action: `Status updated to ${status}`,
        actor,
        comment,
      };
      return {
        ...p,
        verificationStatus: status,
        verificationHistory: [newEvent, ...p.verificationHistory],
      };
    });

    set({ projects: updatedProjects });
  },

  getActiveProjects: () => {
    return get().projects;
  },
}));
