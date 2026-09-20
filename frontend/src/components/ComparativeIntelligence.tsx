/**
 * ComparativeIntelligence.tsx
 * MoSPI National Command — Comparative Intelligence Platform
 * 
 * Side-by-side analytical comparison of MPLADS entities (States, Districts, Houses,
 * Financial Years, and Categories) using real database-backed metrics from Supabase RPC.
 * Adheres strictly to government-grade, neutral analytical guidelines.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  BarChart2, RefreshCw, ChevronDown, ArrowLeftRight,
  AlertTriangle, CheckCircle, TrendingUp, DollarSign,
  Layers, Calendar, Map, Tag, Loader2, Info,
  SlidersHorizontal, Search, ExternalLink, RotateCcw,
  ShieldAlert, CheckCheck, FileText, ArrowRight,
  Activity, X, Building2, ArrowLeft
} from 'lucide-react';
import { supabase } from '../services/client';
import { useAppStore } from '../store/store';
import { useAuthStore } from '../store/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CompareMode = 'state' | 'district' | 'house' | 'fy' | 'category';

export interface EntityMetrics {
  label: string;
  total: number;
  sanctioned: number;
  disbursed: number;
  expenditure: number;
  completed: number;
  completionRate: number;
  highRisk: number;
  medRisk: number;
  lowRisk: number;
  avgRisk: number;
  highRiskRate: number;
  verificationCases: number;
  pendingWorks: number;
  staleWorks: number;
  costAnomalies: number;
  disbursementIssues: number;
  vendorConcentration: number;
  potentialSimilarWork: number;
}

interface FilterState {
  house: 'Lok Sabha' | 'Rajya Sabha';
  state: string;
  district: string;
  category: string;
  fy: string;
  riskLevel: string;
  status: string;
  search: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_STATES = [
  'Andaman And Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam',
  'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jammu And Kashmir', 'Jharkhand', 'Karnataka', 'Kerala',
  'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const FY_OPTIONS = ['2024-2025', '2025-2026', '2026-2027'];

const CLEAN_CATEGORIES = [
  'Construction of roads, link roads, pathways or any other road with or without drainage system',
  'Lighting of public spaces',
  'Street lights',
  'Construction of community centers and community halls',
  'Installing tube-wells and borewells',
  'Construction of common work sheds/ common covered sitting area',
  'Purchase of mobile water tankers',
  'Installing hand pumps',
  'Construction of buildings for community cultural activities',
  'Crematoriums/energy efficient crematoriums or structures on burial/cremation ground',
  'Installing community drinking water plants',
  'Construction of bus-sheds or bus-stops',
  'Construction of rooms and halls in school and colleges',
  'Construction of boundary walls of existing public and community buildings',
  'Repair and Renovation',
  'Improvement of electricity distribution infrastructure',
  'Purchase of books and periodicals for libraries/digitization of library books',
  'Construction of footpaths and pedestrian ways',
  'Purchase of smart boards, visual display units and projectors',
  'Construction of culverts and bridges',
  'Providing drains and gutters for public drainage',
  'Installation of fixed garden gym equipment',
  'Construction of additional rooms and halls in the existing public and community building',
  'Purchase of IT systems, including hardware and software for educational purposes',
  'Trust and Society'
];

const STATUS_OPTIONS = [
  'Physical Inspection',
  'Sanction',
  'Work Completed',
  'Vendor Identification'
];

const RISK_OPTIONS = ['HIGH', 'MEDIUM', 'LOW'];

const MODE_CONFIG: Record<CompareMode, {
  label: string;
  icon: React.FC<any>;
  defaultA: string;
  defaultB: string;
  description: string;
}> = {
  state: {
    label: 'State vs State',
    icon: Map,
    defaultA: 'Tamil Nadu',
    defaultB: 'Karnataka',
    description: 'Compare all projects across two Indian States / Union Territories.'
  },
  district: {
    label: 'District vs District',
    icon: Map,
    defaultA: 'CHENNAI(COMMISSIONER MUNCIPAL CORPORATION CHENNAI_IDA)',
    defaultB: 'BENGALURU URBAN(DEPUTY COMMISSIONER BANGALORE URBAN_IDA)',
    description: 'Compare execution and risk metrics between two administrative districts.'
  },
  house: {
    label: 'House vs House',
    icon: Layers,
    defaultA: 'Lok Sabha',
    defaultB: 'Rajya Sabha',
    description: 'Compare parliamentary aggregate performance between Lok Sabha and Rajya Sabha.'
  },
  fy: {
    label: 'Financial Year vs Financial Year',
    icon: Calendar,
    defaultA: '2024-2025',
    defaultB: '2025-2026',
    description: 'Analyze year-over-year allocation, expenditure, and execution shifts.'
  },
  category: {
    label: 'Category vs Category',
    icon: Tag,
    defaultA: CLEAN_CATEGORIES[0],
    defaultB: CLEAN_CATEGORIES[1],
    description: 'Compare resource distribution and completion rates between project categories.'
  },
};

const COLOR_A = '#0066CC';
const COLOR_B = '#E67E22';

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtCr(n: number): string {
  if (isNaN(n) || n === 0) return '₹0.00 Cr';
  if (Math.abs(n) >= 1e9) return '₹' + (n / 1e9).toFixed(2) + ' Bn';
  if (Math.abs(n) >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr';
  if (Math.abs(n) >= 1e5) return '₹' + (n / 1e5).toFixed(2) + ' L';
  return '₹' + n.toLocaleString('en-IN');
}

function fmtN(n: number): string {
  if (isNaN(n)) return '0';
  return n.toLocaleString('en-IN');
}

function truncateText(str: string, maxLen: number = 40): string {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

function calcPctDiff(a: number, b: number): { diff: number; pct: string; isAHigh: boolean } {
  const diff = a - b;
  if (b === 0) {
    return { diff, pct: a > 0 ? '+100%' : '0%', isAHigh: a > b };
  }
  const pctVal = ((a - b) / b) * 100;
  const sign = pctVal > 0 ? '+' : '';
  return {
    diff,
    pct: `${sign}${pctVal.toFixed(1)}%`,
    isAHigh: a > b
  };
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

export interface ComparativeIntelligenceProps {
  activeHouse?: 'Lok Sabha' | 'Rajya Sabha';
  lockedState?: string;
  initialMode?: CompareMode;
  allowedModes?: CompareMode[];
  preselectedA?: string;
  preselectedB?: string;
  title?: string;
  subtitle?: string;
  onBackToOverview?: () => void;
}

export function ComparativeIntelligence({
  activeHouse = 'Lok Sabha',
  lockedState,
  initialMode,
  allowedModes,
  preselectedA,
  preselectedB,
  title,
  subtitle,
  onBackToOverview,
}: ComparativeIntelligenceProps) {
  const { setMonitoringFilter, setCurrentPage, setActiveHouse } = useAppStore();
  const { profile } = useAuthStore();

  const effectiveLockedState = lockedState || (profile?.role === 'STATE_NODAL_OFFICER' ? (profile.state as string) : undefined);

  // Mode & Entities
  const [mode, setMode] = useState<CompareMode>(() => {
    if (initialMode) return initialMode;
    if (effectiveLockedState) return 'district';
    return 'state';
  });
  const [house, setHouse] = useState<'Lok Sabha' | 'Rajya Sabha'>(activeHouse);

  const availableModes = useMemo(() => {
    if (allowedModes && allowedModes.length > 0) return allowedModes;
    if (effectiveLockedState) return ['district', 'category', 'fy', 'house'] as CompareMode[];
    return Object.keys(MODE_CONFIG) as CompareMode[];
  }, [allowedModes, effectiveLockedState]);

  const [selA, setSelA] = useState(() => preselectedA || (effectiveLockedState ? '' : MODE_CONFIG.state.defaultA));
  const [selB, setSelB] = useState(() => preselectedB || (effectiveLockedState ? '' : MODE_CONFIG.state.defaultB));

  // District mode specific state
  const [districtStateA, setDistrictStateA] = useState(effectiveLockedState || 'Tamil Nadu');
  const [districtStateB, setDistrictStateB] = useState(effectiveLockedState || 'Karnataka');
  const [districtsListA, setDistrictsListA] = useState<string[]>([]);
  const [districtsListB, setDistrictsListB] = useState<string[]>([]);
  const [loadingDistrictsA, setLoadingDistrictsA] = useState(false);
  const [loadingDistrictsB, setLoadingDistrictsB] = useState(false);

  // Additional Filters (Filter Consistency)
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    house: activeHouse,
    state: effectiveLockedState || '',
    district: '',
    category: '',
    fy: '',
    riskLevel: '',
    status: '',
    search: '',
  });

  // Results
  const [metricsA, setMetricsA] = useState<EntityMetrics | null>(null);
  const [metricsB, setMetricsB] = useState<EntityMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ran, setRan] = useState(false);

  // Synchronize house with activeHouse when it changes externally
  useEffect(() => {
    if (activeHouse) {
      setHouse(activeHouse);
      setFilters(f => ({ ...f, house: activeHouse }));
    }
  }, [activeHouse]);

  // Keep districtState locked if effectiveLockedState is active
  useEffect(() => {
    if (effectiveLockedState) {
      setDistrictStateA(effectiveLockedState);
      setDistrictStateB(effectiveLockedState);
      setFilters(f => ({ ...f, state: effectiveLockedState }));
    }
  }, [effectiveLockedState]);

  // Load districts for State A
  const loadDistrictsForA = useCallback(async (st: string) => {
    if (!st) return;
    setLoadingDistrictsA(true);
    try {
      const { data, error: rpcErr } = await supabase.rpc('get_districts_by_state', {
        p_state: st,
        p_house: house,
      });
      if (!rpcErr && Array.isArray(data) && data.length > 0) {
        setDistrictsListA(data);
        setSelA(prev => {
          if (preselectedA && data.includes(preselectedA)) return preselectedA;
          if (prev && data.includes(prev)) return prev;
          return data[0];
        });
      }
    } catch (err) {
      console.warn('Failed to load districts for State A:', err);
    } finally {
      setLoadingDistrictsA(false);
    }
  }, [house, preselectedA]);

  // Load districts for State B
  const loadDistrictsForB = useCallback(async (st: string) => {
    if (!st) return;
    setLoadingDistrictsB(true);
    try {
      const { data, error: rpcErr } = await supabase.rpc('get_districts_by_state', {
        p_state: st,
        p_house: house,
      });
      if (!rpcErr && Array.isArray(data) && data.length > 0) {
        setDistrictsListB(data);
        setSelB(prev => {
          if (preselectedB && data.includes(preselectedB)) return preselectedB;
          if (prev && data.includes(prev)) return prev;
          if (data.length > 1) return data[1];
          return data[0];
        });
      }
    } catch (err) {
      console.warn('Failed to load districts for State B:', err);
    } finally {
      setLoadingDistrictsB(false);
    }
  }, [house, preselectedB]);

  // Synchronize preselected districts when passed externally
  useEffect(() => {
    if (preselectedA) setSelA(preselectedA);
  }, [preselectedA]);

  useEffect(() => {
    if (preselectedB) setSelB(preselectedB);
  }, [preselectedB]);

  // Trigger district load on district mode
  useEffect(() => {
    if (mode === 'district') {
      loadDistrictsForA(effectiveLockedState || districtStateA);
      loadDistrictsForB(effectiveLockedState || districtStateB);
    }
  }, [mode, districtStateA, districtStateB, effectiveLockedState, loadDistrictsForA, loadDistrictsForB]);

  // Handle Mode Change
  const handleModeChange = (newMode: CompareMode) => {
    setMode(newMode);
    if (newMode === 'district' && effectiveLockedState) {
      setSelA(preselectedA || (districtsListA[0] || ''));
      setSelB(preselectedB || (districtsListB[1] || districtsListB[0] || ''));
    } else {
      setSelA(MODE_CONFIG[newMode].defaultA);
      setSelB(MODE_CONFIG[newMode].defaultB);
    }
    setMetricsA(null);
    setMetricsB(null);
    setRan(false);
    setError(null);
  };

  // Validation
  const isSameEntity = useMemo(() => {
    if (mode === 'house') return false;
    if (mode === 'district') {
      return districtStateA === districtStateB && selA === selB;
    }
    return Boolean(selA && selB && selA.trim().toLowerCase() === selB.trim().toLowerCase());
  }, [mode, selA, selB, districtStateA, districtStateB]);

  const canCompare = useMemo(() => {
    if (loading) return false;
    if (mode === 'house') return true;
    if (isSameEntity) return false;
    return Boolean(selA && selB);
  }, [loading, mode, isSameEntity, selA, selB]);

  // Swap Entities
  const handleSwap = () => {
    if (mode === 'house') return;

    const tempA = selA;
    const tempB = selB;
    setSelA(tempB);
    setSelB(tempA);

    if (mode === 'district' && !effectiveLockedState) {
      const tempStA = districtStateA;
      const tempStB = districtStateB;
      setDistrictStateA(tempStB);
      setDistrictStateB(tempStA);
      const tempDistA = districtsListA;
      setDistrictsListA(districtsListB);
      setDistrictsListB(tempDistA);
    }

    if (ran && metricsA && metricsB) {
      setMetricsA(metricsB);
      setMetricsB(metricsA);
    }
  };

  // Clear Comparison
  const handleClear = () => {
    if (mode === 'district' && effectiveLockedState) {
      setSelA(districtsListA[0] || '');
      setSelB(districtsListB[1] || districtsListB[0] || '');
    } else {
      setSelA(MODE_CONFIG[mode].defaultA);
      setSelB(MODE_CONFIG[mode].defaultB);
    }
    setFilters({
      house,
      state: effectiveLockedState || '',
      district: '',
      category: '',
      fy: '',
      riskLevel: '',
      status: '',
      search: '',
    });
    setMetricsA(null);
    setMetricsB(null);
    setRan(false);
    setError(null);
  };

  // Compare Execution
  const runComparison = useCallback(async () => {
    if (!canCompare && mode !== 'house') {
      if (isSameEntity) {
        setError('Please select two different entities.');
      } else {
        setError('Please select both entities to compare.');
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        p_mode: mode,
        p_entity_a: mode === 'house' ? 'Lok Sabha' : selA,
        p_entity_b: mode === 'house' ? 'Rajya Sabha' : selB,
        p_house: house,
        p_state_a: mode === 'district' ? (effectiveLockedState || districtStateA) : null,
        p_state_b: mode === 'district' ? (effectiveLockedState || districtStateB) : null,
        p_filter_house: mode === 'house' ? null : (filters.house || house),
        p_filter_state: effectiveLockedState || (mode === 'state' ? null : (filters.state || null)),
        p_filter_district: mode === 'district' ? null : (filters.district || null),
        p_filter_category: mode === 'category' ? null : (filters.category || null),
        p_filter_fy: mode === 'fy' ? null : (filters.fy || null),
        p_filter_risk: filters.riskLevel || null,
        p_filter_status: filters.status || null,
        p_filter_search: filters.search || null,
      };

      const { data, error: rpcError } = await supabase.rpc('get_comparative_metrics', payload);

      if (rpcError) {
        throw new Error(rpcError.message || 'Unable to load comparison data from Supabase RPC.');
      }

      if (!data || !data.entityA || !data.entityB) {
        throw new Error('Invalid comparison response structure from database.');
      }

      setMetricsA(data.entityA);
      setMetricsB(data.entityB);
      setRan(true);
    } catch (err: any) {
      console.error('[ComparativeIntelligence] Query error:', err);
      setError(err.message || 'Unable to load comparison data. Please verify database connectivity.');
    } finally {
      setLoading(false);
    }
  }, [canCompare, mode, selA, selB, house, effectiveLockedState, districtStateA, districtStateB, filters, isSameEntity]);

  // Auto-run once on initial mount if entities are ready and comparison has not yet run
  const hasAutoRunRef = useRef(false);
  useEffect(() => {
    if (!hasAutoRunRef.current && canCompare && selA && selB && !ran && !loading) {
      hasAutoRunRef.current = true;
      runComparison();
    }
  }, [canCompare, selA, selB, ran, loading, runComparison]);

  // Drill-Down to Existing Project Intelligence Page
  const handleDrillDown = (which: 'A' | 'B') => {
    const targetEntity = which === 'A' ? selA : selB;
    const targetState = mode === 'state'
      ? targetEntity
      : mode === 'district'
      ? (effectiveLockedState || (which === 'A' ? districtStateA : districtStateB))
      : (effectiveLockedState || filters.state || '');

    const targetHouse = mode === 'house'
      ? (which === 'A' ? 'Lok Sabha' : 'Rajya Sabha')
      : (filters.house || house);

    const targetCategory = mode === 'category' ? targetEntity : filters.category || '';
    const targetFY = mode === 'fy' ? targetEntity : filters.fy || '';

    // Push into store
    setMonitoringFilter({
      house: targetHouse as 'Lok Sabha' | 'Rajya Sabha',
      state: targetState,
      category: targetCategory,
      fy: targetFY,
      riskLevel: filters.riskLevel || '',
      status: filters.status || '',
      search: filters.search || (mode === 'district' ? targetEntity : ''),
    });

    if (targetHouse !== house) {
      setActiveHouse(targetHouse as 'Lok Sabha' | 'Rajya Sabha');
    }

    setCurrentPage('monitoring');
    window.history.pushState({}, '', '/monitoring');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.state && mode !== 'state') count++;
    if (filters.district && mode !== 'district') count++;
    if (filters.category && mode !== 'category') count++;
    if (filters.fy && mode !== 'fy') count++;
    if (filters.riskLevel) count++;
    if (filters.status) count++;
    if (filters.search) count++;
    return count;
  }, [filters, mode]);

  // Generated Neutral Factual Insights
  const factualInsights = useMemo(() => {
    if (!metricsA || !metricsB) return [];
    const insights: string[] = [];

    // Works insight
    const worksDiff = metricsA.total - metricsB.total;
    if (worksDiff !== 0) {
      const higher = worksDiff > 0 ? metricsA.label : metricsB.label;
      const count = Math.abs(worksDiff).toLocaleString('en-IN');
      insights.push(`${higher} has ${count} more recorded projects in this dataset (${fmtN(metricsA.total)} vs ${fmtN(metricsB.total)}).`);
    } else {
      insights.push(`Both entities have identical recorded project volumes (${fmtN(metricsA.total)} works).`);
    }

    // Average Risk insight
    const riskDiff = Number((metricsA.avgRisk - metricsB.avgRisk).toFixed(2));
    if (riskDiff !== 0) {
      const higher = riskDiff > 0 ? metricsA.label : metricsB.label;
      const pts = Math.abs(riskDiff).toFixed(1);
      insights.push(`${higher} exhibits a ${pts}-point higher average risk score (${metricsA.avgRisk.toFixed(1)} vs ${metricsB.avgRisk.toFixed(1)}).`);
    } else {
      insights.push(`Both entities share an identical average risk score of ${metricsA.avgRisk.toFixed(1)}.`);
    }

    // Completion Rate insight
    const compDiff = Number((metricsA.completionRate - metricsB.completionRate).toFixed(2));
    if (compDiff !== 0) {
      const higher = compDiff > 0 ? metricsA.label : metricsB.label;
      const pts = Math.abs(compDiff).toFixed(1);
      insights.push(`${higher} demonstrates a ${pts} percentage-point higher completion rate (${metricsA.completionRate.toFixed(1)}% vs ${metricsB.completionRate.toFixed(1)}%).`);
    }

    // High Risk insight
    const hrA = metricsA.highRisk;
    const hrB = metricsB.highRisk;
    const hrDiff = hrA - hrB;
    if (hrDiff !== 0) {
      const higher = hrDiff > 0 ? metricsA.label : metricsB.label;
      insights.push(`${higher} has ${Math.abs(hrDiff).toLocaleString('en-IN')} more projects classified in the High-Risk band (${metricsA.highRiskRate.toFixed(1)}% vs ${metricsB.highRiskRate.toFixed(1)}% of total works).`);
    }

    // Sanctioned financial allocation insight
    const sancDiff = metricsA.sanctioned - metricsB.sanctioned;
    if (Math.abs(sancDiff) > 100000) {
      const higher = sancDiff > 0 ? metricsA.label : metricsB.label;
      insights.push(`${higher} reflects ${fmtCr(Math.abs(sancDiff))} higher cumulative sanctioned project funding.`);
    }

    return insights;
  }, [metricsA, metricsB]);

  return (
    <div className="w-full space-y-6" id="comparative-intelligence-root">

      {/* ── TOP HEADER ───────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E9ECEF] rounded-sm p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#0066CC] uppercase tracking-widest bg-[#0066CC14] px-2 py-0.5 rounded-sm">
                {effectiveLockedState ? `${effectiveLockedState} Jurisdiction` : 'MoSPI National Command'}
              </span>
              <span className="text-[10px] text-[#747780]">·</span>
              <span className="text-[10px] font-semibold text-[#198754] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#198754]" /> PostgreSQL RPC Aggregated
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#000a1f]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {title || (effectiveLockedState ? `${effectiveLockedState} — Comparative Intelligence` : 'Comparative Intelligence')}
            </h1>
            <p className="text-xs text-[#747780] mt-0.5">
              {subtitle || (effectiveLockedState 
                ? `Compare MPLADS performance metrics between districts and categories within ${effectiveLockedState}.`
                : 'Compare MPLADS monitoring metrics across selected entities using real database-backed data.')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onBackToOverview && (
              <button
                type="button"
                onClick={onBackToOverview}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F9FA] hover:bg-[#E9ECEF] text-[#44474f] border border-[#CED4DA] rounded-sm text-xs font-bold transition-all cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Back to State Overview</span>
              </button>
            )}

            {/* House Selector for Non-House Mode */}
            {mode !== 'house' && (
              <div className="flex items-center gap-2 bg-[#F8F9FA] p-1 rounded-sm border border-[#E9ECEF] self-start md:self-auto">
                <span className="text-[10px] font-bold text-[#747780] uppercase px-2">Scope:</span>
                {(['Lok Sabha', 'Rajya Sabha'] as const).map(h => (
                  <button
                    key={h}
                    onClick={() => {
                      setHouse(h);
                      setFilters(f => ({ ...f, house: h }));
                      setMetricsA(null);
                      setMetricsB(null);
                      setRan(false);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-all ${
                      house === h
                        ? 'bg-[#00204a] text-white shadow-sm'
                        : 'text-[#44474f] hover:text-[#000a1f] hover:bg-white'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── COMPARISON CONTROL PANEL ─────────────────────────────────────────── */}
      <div className="bg-white border border-[#E9ECEF] rounded-sm shadow-sm overflow-hidden">
        
        {/* Panel Header */}
        <div className="px-5 py-4 border-b border-[#E9ECEF] flex items-center justify-between bg-[#FCFDFE]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-[#00204a] flex items-center justify-center text-white">
              <BarChart2 size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#000a1f]">Comparison Configuration</h2>
              <p className="text-[11px] text-[#747780]">
                {MODE_CONFIG[mode].description}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-bold transition-all ${
              showFilters || activeFiltersCount > 0
                ? 'bg-[#00204a] text-white border-[#00204a]'
                : 'border-[#E9ECEF] bg-white text-[#44474f] hover:bg-[#F8F9FA]'
            }`}
          >
            <SlidersHorizontal size={12} />
            <span>Additional Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#E67E22] text-white text-[10px] flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <div className="p-5 space-y-5">
          
          {/* ROW 1: Comparison Type Tabs */}
          <div>
            <label className="block text-[10px] font-bold text-[#747780] uppercase tracking-widest mb-2">
              Row 1: Comparison Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {availableModes.map(m => {
                const cfg = MODE_CONFIG[m];
                const Icon = cfg.icon;
                const active = m === mode;
                return (
                  <button
                    key={m}
                    onClick={() => handleModeChange(m)}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-sm text-xs font-bold border transition-all text-center ${
                      active
                        ? 'bg-[#00204a] text-white border-[#00204a] shadow-sm'
                        : 'bg-[#F8F9FA] border-[#E9ECEF] text-[#44474f] hover:bg-white hover:border-[#CED4DA]'
                    }`}
                  >
                    <Icon size={13} className={active ? 'text-white' : 'text-[#747780]'} />
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ROW 2: ENTITY A & ENTITY B Selectors */}
          <div>
            <label className="block text-[10px] font-bold text-[#747780] uppercase tracking-widest mb-2">
              Row 2: Select Comparison Entities
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center bg-[#F8F9FA] p-4 rounded-sm border border-[#E9ECEF]">
              
              {/* ENTITY A */}
              <div className="md:col-span-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLOR_A }} />
                    <span className="text-xs font-bold text-[#000a1f] uppercase tracking-wider">Entity A</span>
                  </div>
                  {metricsA && (
                    <span className="text-[10px] font-mono font-bold text-[#0066CC]">
                      {fmtN(metricsA.total)} works
                    </span>
                  )}
                </div>

                {/* Selectors according to mode */}
                {mode === 'state' && (
                  <div className="relative">
                    <select
                      value={selA}
                      onChange={e => setSelA(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border-2 rounded-sm text-xs font-bold text-[#000a1f] appearance-none cursor-pointer outline-none focus:border-[#0066CC]"
                      style={{ borderColor: COLOR_A }}
                    >
                      <option value="">Select State A</option>
                      {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-3 text-[#747780] pointer-events-none" />
                  </div>
                )}

                {mode === 'district' && (
                  <div className="space-y-2">
                    {effectiveLockedState ? (
                      <div className="flex items-center justify-between px-3 py-2 bg-[#EBF3FC] border border-[#B8D5F8] rounded-sm text-xs text-[#0066CC] font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Building2 size={13} />
                          <span>State: <strong>{effectiveLockedState}</strong></span>
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-[#0066CC] text-white px-1.5 py-0.5 rounded-xs">
                          Jurisdiction
                        </span>
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          value={districtStateA}
                          onChange={e => setDistrictStateA(e.target.value)}
                          className="w-full px-3 py-2 bg-white border rounded-sm text-xs font-medium text-[#000a1f] appearance-none cursor-pointer outline-none"
                        >
                          {ALL_STATES.map(s => <option key={s} value={s}>State: {s}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-2.5 text-[#747780] pointer-events-none" />
                      </div>
                    )}
                    <div className="relative">
                      <select
                        value={selA}
                        onChange={e => setSelA(e.target.value)}
                        disabled={loadingDistrictsA}
                        className="w-full px-3 py-2.5 bg-white border-2 rounded-sm text-xs font-bold text-[#000a1f] appearance-none cursor-pointer outline-none"
                        style={{ borderColor: COLOR_A }}
                      >
                        {loadingDistrictsA ? (
                          <option>Loading districts…</option>
                        ) : districtsListA.length === 0 ? (
                          <option value="">No districts found</option>
                        ) : (
                          districtsListA.map(d => <option key={d} value={d}>{truncateText(d, 45)}</option>)
                        )}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-3 text-[#747780] pointer-events-none" />
                    </div>
                  </div>
                )}

                {mode === 'house' && (
                  <div className="p-3 bg-white border-2 rounded-sm text-xs font-bold flex items-center justify-between"
                    style={{ borderColor: COLOR_A, color: COLOR_A }}>
                    <span>Lok Sabha</span>
                    <span className="text-[10px] font-mono text-[#747780]">543 Parliamentary Seats</span>
                  </div>
                )}

                {mode === 'fy' && (
                  <div className="relative">
                    <select
                      value={selA}
                      onChange={e => setSelA(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border-2 rounded-sm text-xs font-bold text-[#000a1f] appearance-none cursor-pointer outline-none focus:border-[#0066CC]"
                      style={{ borderColor: COLOR_A }}
                    >
                      {FY_OPTIONS.map(f => <option key={f} value={f}>Financial Year: {f}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-3 text-[#747780] pointer-events-none" />
                  </div>
                )}

                {mode === 'category' && (
                  <div className="relative">
                    <select
                      value={selA}
                      onChange={e => setSelA(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border-2 rounded-sm text-xs font-bold text-[#000a1f] appearance-none cursor-pointer outline-none focus:border-[#0066CC]"
                      style={{ borderColor: COLOR_A }}
                    >
                      {CLEAN_CATEGORIES.map(c => <option key={c} value={c}>{truncateText(c, 50)}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-3 text-[#747780] pointer-events-none" />
                  </div>
                )}
              </div>

              {/* CENTER: VS & SWAP */}
              <div className="md:col-span-1 flex flex-col items-center justify-center py-2">
                <button
                  type="button"
                  onClick={handleSwap}
                  disabled={mode === 'house'}
                  title="Swap Entity A and Entity B"
                  className="w-9 h-9 rounded-full bg-white border border-[#CED4DA] flex items-center justify-center text-[#747780] hover:text-[#00204a] hover:border-[#00204a] hover:bg-[#F8F9FA] transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowLeftRight size={14} />
                </button>
                <span className="text-[10px] font-bold text-[#747780] uppercase tracking-widest mt-1">
                  VS
                </span>
              </div>

              {/* ENTITY B */}
              <div className="md:col-span-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLOR_B }} />
                    <span className="text-xs font-bold text-[#000a1f] uppercase tracking-wider">Entity B</span>
                  </div>
                  {metricsB && (
                    <span className="text-[10px] font-mono font-bold text-[#E67E22]">
                      {fmtN(metricsB.total)} works
                    </span>
                  )}
                </div>

                {/* Selectors according to mode */}
                {mode === 'state' && (
                  <div className="relative">
                    <select
                      value={selB}
                      onChange={e => setSelB(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border-2 rounded-sm text-xs font-bold text-[#000a1f] appearance-none cursor-pointer outline-none focus:border-[#E67E22]"
                      style={{ borderColor: COLOR_B }}
                    >
                      <option value="">Select State B</option>
                      {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-3 text-[#747780] pointer-events-none" />
                  </div>
                )}

                {mode === 'district' && (
                  <div className="space-y-2">
                    {effectiveLockedState ? (
                      <div className="flex items-center justify-between px-3 py-2 bg-[#EBF3FC] border border-[#B8D5F8] rounded-sm text-xs text-[#0066CC] font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Building2 size={13} />
                          <span>State: <strong>{effectiveLockedState}</strong></span>
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-[#0066CC] text-white px-1.5 py-0.5 rounded-xs">
                          Jurisdiction
                        </span>
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          value={districtStateB}
                          onChange={e => setDistrictStateB(e.target.value)}
                          className="w-full px-3 py-2 bg-white border rounded-sm text-xs font-medium text-[#000a1f] appearance-none cursor-pointer outline-none"
                        >
                          {ALL_STATES.map(s => <option key={s} value={s}>State: {s}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-2.5 text-[#747780] pointer-events-none" />
                      </div>
                    )}
                    <div className="relative">
                      <select
                        value={selB}
                        onChange={e => setSelB(e.target.value)}
                        disabled={loadingDistrictsB}
                        className="w-full px-3 py-2.5 bg-white border-2 rounded-sm text-xs font-bold text-[#000a1f] appearance-none cursor-pointer outline-none"
                        style={{ borderColor: COLOR_B }}
                      >
                        {loadingDistrictsB ? (
                          <option>Loading districts…</option>
                        ) : districtsListB.length === 0 ? (
                          <option value="">No districts found</option>
                        ) : (
                          districtsListB.map(d => <option key={d} value={d}>{truncateText(d, 45)}</option>)
                        )}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-3 text-[#747780] pointer-events-none" />
                    </div>
                  </div>
                )}

                {mode === 'house' && (
                  <div className="p-3 bg-white border-2 rounded-sm text-xs font-bold flex items-center justify-between"
                    style={{ borderColor: COLOR_B, color: COLOR_B }}>
                    <span>Rajya Sabha</span>
                    <span className="text-[10px] font-mono text-[#747780]">State / UT Nominations</span>
                  </div>
                )}

                {mode === 'fy' && (
                  <div className="relative">
                    <select
                      value={selB}
                      onChange={e => setSelB(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border-2 rounded-sm text-xs font-bold text-[#000a1f] appearance-none cursor-pointer outline-none focus:border-[#E67E22]"
                      style={{ borderColor: COLOR_B }}
                    >
                      {FY_OPTIONS.map(f => <option key={f} value={f}>Financial Year: {f}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-3 text-[#747780] pointer-events-none" />
                  </div>
                )}

                {mode === 'category' && (
                  <div className="relative">
                    <select
                      value={selB}
                      onChange={e => setSelB(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border-2 rounded-sm text-xs font-bold text-[#000a1f] appearance-none cursor-pointer outline-none focus:border-[#E67E22]"
                      style={{ borderColor: COLOR_B }}
                    >
                      {CLEAN_CATEGORIES.map(c => <option key={c} value={c}>{truncateText(c, 50)}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-3 text-[#747780] pointer-events-none" />
                  </div>
                )}
              </div>

            </div>

            {/* Validation Notice */}
            {isSameEntity && (
              <div className="mt-2.5 flex items-center gap-2 p-2.5 bg-[#FFF5F5] border border-[#FFD8D8] rounded-sm text-xs text-[#DC3545]">
                <AlertTriangle size={14} className="flex-shrink-0" />
                <span><strong>Validation Note:</strong> Please select two different entities. Comparison requires distinct subjects.</span>
              </div>
            )}
          </div>

          {/* ROW 3: Additional Filters (Filter Consistency) */}
          {showFilters && (
            <div className="border border-[#E9ECEF] rounded-sm p-4 bg-[#FBFBFC] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E9ECEF]">
                <span className="text-xs font-bold text-[#000a1f] flex items-center gap-1.5">
                  <SlidersHorizontal size={13} className="text-[#00204a]" />
                  Additional Filter Consistency Options
                </span>
                <button
                  onClick={() => setFilters({
                    house,
                    state: effectiveLockedState || '',
                    district: '',
                    category: '',
                    fy: '',
                    riskLevel: '',
                    status: '',
                    search: '',
                  })}
                  className="text-[10px] text-[#0066CC] hover:underline flex items-center gap-1"
                >
                  <RotateCcw size={10} /> Reset Filters
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* State filter (if not state mode) */}
                {mode !== 'state' && (
                  <div>
                    <label className="block text-[10px] font-bold text-[#747780] uppercase mb-1">State Filter</label>
                    {effectiveLockedState ? (
                      <input
                        type="text"
                        disabled
                        value={`${effectiveLockedState} (Locked)`}
                        className="w-full px-2.5 py-1.5 bg-[#F1F3F5] border border-[#CED4DA] rounded-sm text-xs font-semibold text-[#0066CC] cursor-not-allowed outline-none"
                      />
                    ) : (
                      <select
                        value={filters.state}
                        onChange={e => setFilters(f => ({ ...f, state: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#CED4DA] rounded-sm text-xs outline-none"
                      >
                        <option value="">All States</option>
                        {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                  </div>
                )}

                {/* Category filter (if not category mode) */}
                {mode !== 'category' && (
                  <div>
                    <label className="block text-[10px] font-bold text-[#747780] uppercase mb-1">Category Filter</label>
                    <select
                      value={filters.category}
                      onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#CED4DA] rounded-sm text-xs outline-none"
                    >
                      <option value="">All Categories</option>
                      {CLEAN_CATEGORIES.map(c => <option key={c} value={c}>{truncateText(c, 30)}</option>)}
                    </select>
                  </div>
                )}

                {/* Financial Year filter (if not fy mode) */}
                {mode !== 'fy' && (
                  <div>
                    <label className="block text-[10px] font-bold text-[#747780] uppercase mb-1">Financial Year</label>
                    <select
                      value={filters.fy}
                      onChange={e => setFilters(f => ({ ...f, fy: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#CED4DA] rounded-sm text-xs outline-none"
                    >
                      <option value="">All Financial Years</option>
                      {FY_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                )}

                {/* Risk Level filter */}
                <div>
                  <label className="block text-[10px] font-bold text-[#747780] uppercase mb-1">Risk Level</label>
                  <select
                    value={filters.riskLevel}
                    onChange={e => setFilters(f => ({ ...f, riskLevel: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#CED4DA] rounded-sm text-xs outline-none"
                  >
                    <option value="">All Risk Bands</option>
                    {RISK_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Status filter */}
                <div>
                  <label className="block text-[10px] font-bold text-[#747780] uppercase mb-1">Work Status</label>
                  <select
                    value={filters.status}
                    onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#CED4DA] rounded-sm text-xs outline-none"
                  >
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Keyword search */}
                <div>
                  <label className="block text-[10px] font-bold text-[#747780] uppercase mb-1">Search Keyword</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.search}
                      onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                      placeholder="Description, MP, etc."
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-[#CED4DA] rounded-sm text-xs outline-none"
                    />
                    <Search size={12} className="absolute left-2.5 top-2 text-[#747780]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACTION BUTTONS: [ Compare ] [ Swap ] [ Clear ] */}
          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-[#E9ECEF]">
            <button
              onClick={runComparison}
              disabled={!canCompare}
              className="flex-1 min-w-[200px] py-2.5 px-6 rounded-sm text-xs font-bold flex items-center justify-center gap-2 transition-all bg-[#00204a] text-white hover:bg-[#001736] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Loading comparison data…</span>
                </>
              ) : (
                <>
                  <BarChart2 size={14} />
                  <span>Compare Entities · {MODE_CONFIG[mode].label}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSwap}
              disabled={mode === 'house' || loading}
              className="px-4 py-2.5 rounded-sm border border-[#CED4DA] bg-white text-xs font-bold text-[#44474f] hover:bg-[#F8F9FA] hover:text-[#000a1f] flex items-center gap-1.5 transition-all disabled:opacity-40"
            >
              <ArrowLeftRight size={13} />
              <span>Swap</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              className="px-4 py-2.5 rounded-sm border border-[#CED4DA] bg-white text-xs font-bold text-[#DC3545] hover:bg-[#FFF5F5] flex items-center gap-1.5 transition-all disabled:opacity-40"
            >
              <RotateCcw size={13} />
              <span>Clear</span>
            </button>
          </div>

        </div>

      </div>

      {/* ── ERROR STATE ──────────────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 bg-[#FFF5F5] border border-[#FFD8D8] rounded-sm flex items-start gap-3 text-xs text-[#DC3545]">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold">Comparison Error</h4>
            <p className="mt-0.5">{error}</p>
            <button
              onClick={runComparison}
              className="mt-2 px-3 py-1 bg-[#DC3545] text-white rounded-sm text-[11px] font-bold inline-flex items-center gap-1 hover:bg-[#B02A37]"
            >
              <RefreshCw size={10} /> Retry Comparison
            </button>
          </div>
        </div>
      )}

      {/* ── INITIAL EMPTY STATE ──────────────────────────────────────────────── */}
      {!ran && !loading && !error && (
        <div className="bg-white border border-[#E9ECEF] rounded-sm p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#F0F4F8] flex items-center justify-center mx-auto mb-3 text-[#00204a]">
            <BarChart2 size={24} />
          </div>
          <h3 className="text-sm font-bold text-[#000a1f]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Select two entities to begin comparison
          </h3>
          <p className="text-xs text-[#747780] max-w-md mx-auto mt-1">
            Configure your comparison type and subjects above, optionally apply additional filters, and click <strong>Compare Entities</strong> to generate server-side aggregated metrics.
          </p>
        </div>
      )}

      {/* ── VALID EMPTY RESULT ───────────────────────────────────────────────── */}
      {ran && metricsA && metricsB && metricsA.total === 0 && metricsB.total === 0 && (
        <div className="bg-white border border-[#E9ECEF] rounded-sm p-10 text-center shadow-sm">
          <Info size={28} className="text-[#747780] mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#000a1f]">No data available for the selected comparison</h3>
          <p className="text-xs text-[#747780] mt-1">
            No projects matched the selected entity filters in the active database tables.
          </p>
        </div>
      )}

      {/* ── COMPARISON RESULTS AREA ─────────────────────────────────────────── */}
      {ran && metricsA && metricsB && (metricsA.total > 0 || metricsB.total > 0) && (
        <div className="space-y-6">

          {/* Active Filters Display */}
          <div className="bg-[#EEF2F6] border border-[#D5DCE4] rounded-sm px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#00204a] uppercase tracking-wide text-[10px]">Active Filters:</span>
              <span className="bg-white px-2 py-0.5 rounded border border-[#CED4DA] font-semibold text-[#000a1f]">
                {MODE_CONFIG[mode].label}
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-[#CED4DA] text-[#44474f]">
                House: <strong>{mode === 'house' ? 'Both' : (filters.house || house)}</strong>
              </span>
              {filters.state && mode !== 'state' && (
                <span className="bg-white px-2 py-0.5 rounded border border-[#CED4DA] text-[#44474f]">
                  State: <strong>{filters.state}</strong>
                </span>
              )}
              {filters.category && mode !== 'category' && (
                <span className="bg-white px-2 py-0.5 rounded border border-[#CED4DA] text-[#44474f]">
                  Category: <strong>{truncateText(filters.category, 25)}</strong>
                </span>
              )}
              {filters.fy && mode !== 'fy' && (
                <span className="bg-white px-2 py-0.5 rounded border border-[#CED4DA] text-[#44474f]">
                  FY: <strong>{filters.fy}</strong>
                </span>
              )}
              {filters.riskLevel && (
                <span className="bg-white px-2 py-0.5 rounded border border-[#CED4DA] text-[#44474f]">
                  Risk: <strong>{filters.riskLevel}</strong>
                </span>
              )}
              {filters.status && (
                <span className="bg-white px-2 py-0.5 rounded border border-[#CED4DA] text-[#44474f]">
                  Status: <strong>{filters.status}</strong>
                </span>
              )}
            </div>
            <div className="text-[10px] text-[#747780] font-mono">
              Database Sourced: <code>lok_sabha_projects</code> &amp; <code>rajya_sabha_projects</code>
            </div>
          </div>

          {/* ── RESULT SUMMARY (SIDE-BY-SIDE CARDS) ─────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Entity A Card */}
            <div className="bg-white border-2 rounded-sm p-5 shadow-sm space-y-4" style={{ borderColor: COLOR_A }}>
              <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
                <div>
                  <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-sm uppercase tracking-wider"
                    style={{ backgroundColor: COLOR_A }}>
                    Entity A
                  </span>
                  <h3 className="text-base font-bold text-[#000a1f] mt-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {metricsA.label}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold" style={{ color: COLOR_A }}>
                    {fmtN(metricsA.total)}
                  </div>
                  <div className="text-[10px] text-[#747780]">Total Projects</div>
                </div>
              </div>

              {/* Side-by-side metric lines */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#F0F4F8]">
                  <span className="text-[#747780]">Sanctioned Amount</span>
                  <span className="font-bold text-[#000a1f]">{fmtCr(metricsA.sanctioned)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0F4F8]">
                  <span className="text-[#747780]">Disbursed Amount</span>
                  <span className="font-bold text-[#000a1f]">{fmtCr(metricsA.disbursed)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0F4F8]">
                  <span className="text-[#747780]">Completed Works</span>
                  <span className="font-bold text-[#000a1f]">{fmtN(metricsA.completed)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0F4F8]">
                  <span className="text-[#747780]">Completion Rate</span>
                  <span className="font-bold text-[#198754]">{metricsA.completionRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0F4F8]">
                  <span className="text-[#747780]">High Risk Works</span>
                  <span className="font-bold text-[#DC3545]">{fmtN(metricsA.highRisk)} ({metricsA.highRiskRate.toFixed(1)}%)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0F4F8]">
                  <span className="text-[#747780]">Medium Risk Works</span>
                  <span className="font-bold text-[#E67E22]">{fmtN(metricsA.medRisk)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0F4F8]">
                  <span className="text-[#747780]">Low Risk Works</span>
                  <span className="font-bold text-[#198754]">{fmtN(metricsA.lowRisk)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0F4F8]">
                  <span className="text-[#747780]">Average Risk Score</span>
                  <span className="font-bold text-[#000a1f]">{metricsA.avgRisk.toFixed(1)} / 100</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#747780]">Verification Cases</span>
                  <span className="font-bold text-[#6F42C1]">{fmtN(metricsA.verificationCases)}</span>
                </div>
              </div>

              {/* Drill-down button for A */}
              <button
                onClick={() => handleDrillDown('A')}
                className="w-full py-2.5 rounded-sm border border-[#0066CC] text-[#0066CC] hover:bg-[#0066CC10] text-xs font-bold flex items-center justify-center gap-1.5 transition-all mt-2"
              >
                <span>View Entity A Projects</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Entity B Card */}
            <div className="bg-white border-2 rounded-sm p-5 shadow-sm space-y-4" style={{ borderColor: COLOR_B }}>
              <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
                <div>
                  <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-sm uppercase tracking-wider"
                    style={{ backgroundColor: COLOR_B }}>
                    Entity B
                  </span>
                  <h3 className="text-base font-bold text-[#000a1f] mt-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {metricsB.label}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold" style={{ color: COLOR_B }}>
                    {fmtN(metricsB.total)}
                  </div>
                  <div className="text-[10px] text-[#747780]">Total Projects</div>
                </div>
              </div>

              {/* Side-by-side metric lines */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#F0F4F8]">
                  <span className="text-[#747780]">Sanctioned Amount</span>
                  <span className="font-bold text-[#000a1f]">{fmtCr(metricsB.sanctioned)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0F4F8]">
                  <span className="text-[#747780]">Disbursed Amount</span>
                  <span className="font-bold text-[#000a1f]">{fmtCr(metricsB.disbursed)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0F4F8]">
                  <span className="text-[#747780]">Completed Works</span>
                  <span className="font-bold text-[#000a1f]">{fmtN(metricsB.completed)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0F4F8]">
                  <span className="text-[#747780]">Completion Rate</span>
                  <span className="font-bold text-[#198754]">{metricsB.completionRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0F4F8]">
                  <span className="text-[#747780]">High Risk Works</span>
                  <span className="font-bold text-[#DC3545]">{fmtN(metricsB.highRisk)} ({metricsB.highRiskRate.toFixed(1)}%)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0F4F8]">
                  <span className="text-[#747780]">Medium Risk Works</span>
                  <span className="font-bold text-[#E67E22]">{fmtN(metricsB.medRisk)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0F4F8]">
                  <span className="text-[#747780]">Low Risk Works</span>
                  <span className="font-bold text-[#198754]">{fmtN(metricsB.lowRisk)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0F4F8]">
                  <span className="text-[#747780]">Average Risk Score</span>
                  <span className="font-bold text-[#000a1f]">{metricsB.avgRisk.toFixed(1)} / 100</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#747780]">Verification Cases</span>
                  <span className="font-bold text-[#6F42C1]">{fmtN(metricsB.verificationCases)}</span>
                </div>
              </div>

              {/* Drill-down button for B */}
              <button
                onClick={() => handleDrillDown('B')}
                className="w-full py-2.5 rounded-sm border border-[#E67E22] text-[#E67E22] hover:bg-[#E67E2210] text-xs font-bold flex items-center justify-center gap-1.5 transition-all mt-2"
              >
                <span>View Entity B Projects</span>
                <ArrowRight size={13} />
              </button>
            </div>

          </div>

          {/* ── DIFFERENCE TABLE ────────────────────────────────────────────────── */}
          <div className="bg-white border border-[#E9ECEF] rounded-sm shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E9ECEF] bg-[#FCFDFE]">
              <h3 className="text-sm font-bold text-[#000a1f]">Analytical Difference Table</h3>
              <p className="text-[11px] text-[#747780]">
                Neutral mathematical variance between {metricsA.label} and {metricsB.label}. Percentage difference is computed with reference to Entity B basis.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8F9FA] text-[#747780] font-bold text-[10px] uppercase tracking-wider border-b border-[#E9ECEF]">
                  <tr>
                    <th className="px-5 py-3">Metric</th>
                    <th className="px-4 py-3" style={{ color: COLOR_A }}>{metricsA.label} (Entity A)</th>
                    <th className="px-4 py-3" style={{ color: COLOR_B }}>{metricsB.label} (Entity B)</th>
                    <th className="px-4 py-3">Absolute Difference</th>
                    <th className="px-4 py-3">Percentage Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F8]">
                  {[
                    {
                      label: 'Total Works',
                      valA: fmtN(metricsA.total),
                      valB: fmtN(metricsB.total),
                      diffData: calcPctDiff(metricsA.total, metricsB.total),
                      diffFmt: (d: number) => `${d > 0 ? '+' : ''}${fmtN(d)} works`,
                    },
                    {
                      label: 'Sanctioned Amount',
                      valA: fmtCr(metricsA.sanctioned),
                      valB: fmtCr(metricsB.sanctioned),
                      diffData: calcPctDiff(metricsA.sanctioned, metricsB.sanctioned),
                      diffFmt: (d: number) => `${d > 0 ? '+' : ''}${fmtCr(d)}`,
                    },
                    {
                      label: 'Disbursed Amount',
                      valA: fmtCr(metricsA.disbursed),
                      valB: fmtCr(metricsB.disbursed),
                      diffData: calcPctDiff(metricsA.disbursed, metricsB.disbursed),
                      diffFmt: (d: number) => `${d > 0 ? '+' : ''}${fmtCr(d)}`,
                    },
                    {
                      label: 'Completed Works',
                      valA: fmtN(metricsA.completed),
                      valB: fmtN(metricsB.completed),
                      diffData: calcPctDiff(metricsA.completed, metricsB.completed),
                      diffFmt: (d: number) => `${d > 0 ? '+' : ''}${fmtN(d)} works`,
                    },
                    {
                      label: 'Completion Rate',
                      valA: `${metricsA.completionRate.toFixed(1)}%`,
                      valB: `${metricsB.completionRate.toFixed(1)}%`,
                      diffData: {
                        diff: Number((metricsA.completionRate - metricsB.completionRate).toFixed(1)),
                        pct: `${(metricsA.completionRate - metricsB.completionRate) >= 0 ? '+' : ''}${(metricsA.completionRate - metricsB.completionRate).toFixed(1)} pp`,
                        isAHigh: metricsA.completionRate > metricsB.completionRate
                      },
                      diffFmt: (d: number) => `${d > 0 ? '+' : ''}${d.toFixed(1)} percentage pts`,
                    },
                    {
                      label: 'High Risk Works',
                      valA: fmtN(metricsA.highRisk),
                      valB: fmtN(metricsB.highRisk),
                      diffData: calcPctDiff(metricsA.highRisk, metricsB.highRisk),
                      diffFmt: (d: number) => `${d > 0 ? '+' : ''}${fmtN(d)} works`,
                    },
                    {
                      label: 'High-Risk Rate',
                      valA: `${metricsA.highRiskRate.toFixed(1)}%`,
                      valB: `${metricsB.highRiskRate.toFixed(1)}%`,
                      diffData: {
                        diff: Number((metricsA.highRiskRate - metricsB.highRiskRate).toFixed(1)),
                        pct: `${(metricsA.highRiskRate - metricsB.highRiskRate) >= 0 ? '+' : ''}${(metricsA.highRiskRate - metricsB.highRiskRate).toFixed(1)} pp`,
                        isAHigh: metricsA.highRiskRate > metricsB.highRiskRate
                      },
                      diffFmt: (d: number) => `${d > 0 ? '+' : ''}${d.toFixed(1)} percentage pts`,
                    },
                    {
                      label: 'Average Risk Score',
                      valA: `${metricsA.avgRisk.toFixed(1)} / 100`,
                      valB: `${metricsB.avgRisk.toFixed(1)} / 100`,
                      diffData: {
                        diff: Number((metricsA.avgRisk - metricsB.avgRisk).toFixed(1)),
                        pct: `${(metricsA.avgRisk - metricsB.avgRisk) >= 0 ? '+' : ''}${(metricsA.avgRisk - metricsB.avgRisk).toFixed(1)} pts`,
                        isAHigh: metricsA.avgRisk > metricsB.avgRisk
                      },
                      diffFmt: (d: number) => `${d > 0 ? '+' : ''}${d.toFixed(1)} points`,
                    },
                    {
                      label: 'Verification Cases',
                      valA: fmtN(metricsA.verificationCases),
                      valB: fmtN(metricsB.verificationCases),
                      diffData: calcPctDiff(metricsA.verificationCases, metricsB.verificationCases),
                      diffFmt: (d: number) => `${d > 0 ? '+' : ''}${fmtN(d)} cases`,
                    },
                    {
                      label: 'Pending / Unsanctioned Works',
                      valA: fmtN(metricsA.pendingWorks),
                      valB: fmtN(metricsB.pendingWorks),
                      diffData: calcPctDiff(metricsA.pendingWorks, metricsB.pendingWorks),
                      diffFmt: (d: number) => `${d > 0 ? '+' : ''}${fmtN(d)} works`,
                    },
                    {
                      label: 'Stale Status Works (>180d)',
                      valA: fmtN(metricsA.staleWorks),
                      valB: fmtN(metricsB.staleWorks),
                      diffData: calcPctDiff(metricsA.staleWorks, metricsB.staleWorks),
                      diffFmt: (d: number) => `${d > 0 ? '+' : ''}${fmtN(d)} works`,
                    },
                    {
                      label: 'Cost Anomalies (>₹25L)',
                      valA: fmtN(metricsA.costAnomalies),
                      valB: fmtN(metricsB.costAnomalies),
                      diffData: calcPctDiff(metricsA.costAnomalies, metricsB.costAnomalies),
                      diffFmt: (d: number) => `${d > 0 ? '+' : ''}${fmtN(d)} works`,
                    },
                    {
                      label: 'Disbursement Gaps (>80% paid)',
                      valA: fmtN(metricsA.disbursementIssues),
                      valB: fmtN(metricsB.disbursementIssues),
                      diffData: calcPctDiff(metricsA.disbursementIssues, metricsB.disbursementIssues),
                      diffFmt: (d: number) => `${d > 0 ? '+' : ''}${fmtN(d)} works`,
                    },
                    {
                      label: 'Vendor Concentration Records',
                      valA: fmtN(metricsA.vendorConcentration),
                      valB: fmtN(metricsB.vendorConcentration),
                      diffData: calcPctDiff(metricsA.vendorConcentration, metricsB.vendorConcentration),
                      diffFmt: (d: number) => `${d > 0 ? '+' : ''}${fmtN(d)} records`,
                    },
                  ].map(row => (
                    <tr key={row.label} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="px-5 py-2.5 font-medium text-[#000a1f]">{row.label}</td>
                      <td className="px-4 py-2.5 font-bold text-[#000a1f]">{row.valA}</td>
                      <td className="px-4 py-2.5 font-bold text-[#000a1f]">{row.valB}</td>
                      <td className="px-4 py-2.5 font-mono font-medium text-[#44474f]">
                        {row.diffFmt(row.diffData.diff)}
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          row.diffData.diff === 0
                            ? 'bg-[#F0F4F8] text-[#747780]'
                            : row.diffData.isAHigh
                            ? 'bg-[#EEF2F6] text-[#0066CC]'
                            : 'bg-[#FFF8ED] text-[#E67E22]'
                        }`}>
                          {row.diffData.pct}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── VISUAL COMPARISON (CHARTS) ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Chart 1: Works & Completion */}
            <div className="bg-white border border-[#E9ECEF] rounded-sm p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#000a1f] uppercase tracking-wide">Works &amp; Completion</h4>
                  <p className="text-[10px] text-[#747780]">Total volume vs completed project counts</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: COLOR_A }} /> {truncateText(metricsA.label, 12)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: COLOR_B }} /> {truncateText(metricsB.label, 12)}
                  </span>
                </div>
              </div>

              {/* Grouped Bar Graph */}
              <div className="space-y-4 pt-2">
                {[
                  { label: 'Total Works', a: metricsA.total, b: metricsB.total },
                  { label: 'Completed Works', a: metricsA.completed, b: metricsB.completed },
                  { label: 'High Risk Works', a: metricsA.highRisk, b: metricsB.highRisk },
                  { label: 'Verification Cases', a: metricsA.verificationCases, b: metricsB.verificationCases },
                ].map(item => {
                  const max = Math.max(item.a, item.b, 1);
                  const wA = (item.a / max) * 100;
                  const wB = (item.b / max) * 100;
                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-medium text-[#44474f]">{item.label}</span>
                        <div className="flex items-center gap-3 font-mono text-[10px]">
                          <span style={{ color: COLOR_A }} className="font-bold">{fmtN(item.a)}</span>
                          <span className="text-[#CED4DA]">/</span>
                          <span style={{ color: COLOR_B }} className="font-bold">{fmtN(item.b)}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="w-full bg-[#F0F4F8] h-2.5 rounded-xs overflow-hidden">
                          <div className="h-full rounded-xs transition-all duration-500"
                            style={{ width: `${wA}%`, backgroundColor: COLOR_A }} />
                        </div>
                        <div className="w-full bg-[#F0F4F8] h-2.5 rounded-xs overflow-hidden">
                          <div className="h-full rounded-xs transition-all duration-500"
                            style={{ width: `${wB}%`, backgroundColor: COLOR_B }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Sanction vs Disbursement */}
            <div className="bg-white border border-[#E9ECEF] rounded-sm p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#000a1f] uppercase tracking-wide">Financial Utilization</h4>
                  <p className="text-[10px] text-[#747780]">Sanctioned allocation vs actual disbursements</p>
                </div>
                <span className="text-[10px] font-mono text-[#198754] font-bold">In Indian Rupees (Cr)</span>
              </div>

              <div className="space-y-4 pt-2">
                {[
                  { label: 'Sanctioned Amount', a: metricsA.sanctioned, b: metricsB.sanctioned },
                  { label: 'Disbursed Amount', a: metricsA.disbursed, b: metricsB.disbursed },
                  { label: 'Expenditure Recorded', a: metricsA.expenditure, b: metricsB.expenditure },
                ].map(item => {
                  const max = Math.max(item.a, item.b, 1);
                  const wA = (item.a / max) * 100;
                  const wB = (item.b / max) * 100;
                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-medium text-[#44474f]">{item.label}</span>
                        <div className="flex items-center gap-3 font-mono text-[10px]">
                          <span style={{ color: COLOR_A }} className="font-bold">{fmtCr(item.a)}</span>
                          <span className="text-[#CED4DA]">/</span>
                          <span style={{ color: COLOR_B }} className="font-bold">{fmtCr(item.b)}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="w-full bg-[#F0F4F8] h-2.5 rounded-xs overflow-hidden">
                          <div className="h-full rounded-xs transition-all duration-500"
                            style={{ width: `${wA}%`, backgroundColor: COLOR_A }} />
                        </div>
                        <div className="w-full bg-[#F0F4F8] h-2.5 rounded-xs overflow-hidden">
                          <div className="h-full rounded-xs transition-all duration-500"
                            style={{ width: `${wB}%`, backgroundColor: COLOR_B }} />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Utilization rate comparison */}
                <div className="pt-2 border-t border-[#F0F4F8] grid grid-cols-2 gap-3 text-center">
                  <div className="p-2.5 bg-[#F8F9FA] rounded-sm border border-[#E9ECEF]">
                    <div className="text-[10px] text-[#747780]">{truncateText(metricsA.label, 15)} Disbursed %</div>
                    <div className="text-sm font-bold mt-0.5" style={{ color: COLOR_A }}>
                      {metricsA.sanctioned > 0 ? ((metricsA.disbursed / metricsA.sanctioned) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                  <div className="p-2.5 bg-[#F8F9FA] rounded-sm border border-[#E9ECEF]">
                    <div className="text-[10px] text-[#747780]">{truncateText(metricsB.label, 15)} Disbursed %</div>
                    <div className="text-sm font-bold mt-0.5" style={{ color: COLOR_B }}>
                      {metricsB.sanctioned > 0 ? ((metricsB.disbursed / metricsB.sanctioned) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 3: Risk Distribution */}
            <div className="bg-white border border-[#E9ECEF] rounded-sm p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#000a1f] uppercase tracking-wide">Risk Distribution</h4>
                  <p className="text-[10px] text-[#747780]">Canonical LOW / MEDIUM / HIGH risk engine classification</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#DC3545]" /> HIGH</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E67E22]" /> MED</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#198754]" /> LOW</span>
                </div>
              </div>

              {/* Entity A Stacked Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold" style={{ color: COLOR_A }}>{metricsA.label}</span>
                  <span className="text-[10px] text-[#747780] font-mono">Avg Score: {metricsA.avgRisk.toFixed(1)}</span>
                </div>
                <div className="flex h-4 w-full rounded-sm overflow-hidden bg-[#F0F4F8]">
                  {metricsA.total > 0 && (
                    <>
                      <div style={{ width: `${(metricsA.highRisk / metricsA.total) * 100}%`, backgroundColor: '#DC3545' }}
                        title={`High Risk: ${fmtN(metricsA.highRisk)}`} />
                      <div style={{ width: `${(metricsA.medRisk / metricsA.total) * 100}%`, backgroundColor: '#E67E22' }}
                        title={`Medium Risk: ${fmtN(metricsA.medRisk)}`} />
                      <div style={{ width: `${(metricsA.lowRisk / metricsA.total) * 100}%`, backgroundColor: '#198754' }}
                        title={`Low Risk: ${fmtN(metricsA.lowRisk)}`} />
                    </>
                  )}
                </div>
                <div className="flex justify-between text-[10px] text-[#747780] font-mono">
                  <span>HIGH: {fmtN(metricsA.highRisk)} ({metricsA.highRiskRate.toFixed(1)}%)</span>
                  <span>MED: {fmtN(metricsA.medRisk)}</span>
                  <span>LOW: {fmtN(metricsA.lowRisk)}</span>
                </div>
              </div>

              {/* Entity B Stacked Bar */}
              <div className="space-y-1.5 pt-2 border-t border-[#F0F4F8]">
                <div className="flex justify-between text-xs">
                  <span className="font-bold" style={{ color: COLOR_B }}>{metricsB.label}</span>
                  <span className="text-[10px] text-[#747780] font-mono">Avg Score: {metricsB.avgRisk.toFixed(1)}</span>
                </div>
                <div className="flex h-4 w-full rounded-sm overflow-hidden bg-[#F0F4F8]">
                  {metricsB.total > 0 && (
                    <>
                      <div style={{ width: `${(metricsB.highRisk / metricsB.total) * 100}%`, backgroundColor: '#DC3545' }}
                        title={`High Risk: ${fmtN(metricsB.highRisk)}`} />
                      <div style={{ width: `${(metricsB.medRisk / metricsB.total) * 100}%`, backgroundColor: '#E67E22' }}
                        title={`Medium Risk: ${fmtN(metricsB.medRisk)}`} />
                      <div style={{ width: `${(metricsB.lowRisk / metricsB.total) * 100}%`, backgroundColor: '#198754' }}
                        title={`Low Risk: ${fmtN(metricsB.lowRisk)}`} />
                    </>
                  )}
                </div>
                <div className="flex justify-between text-[10px] text-[#747780] font-mono">
                  <span>HIGH: {fmtN(metricsB.highRisk)} ({metricsB.highRiskRate.toFixed(1)}%)</span>
                  <span>MED: {fmtN(metricsB.medRisk)}</span>
                  <span>LOW: {fmtN(metricsB.lowRisk)}</span>
                </div>
              </div>
            </div>

            {/* Chart 4: Anomaly Indicators */}
            <div className="bg-white border border-[#E9ECEF] rounded-sm p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#000a1f] uppercase tracking-wide">Anomaly Indicators</h4>
                  <p className="text-[10px] text-[#747780]">Heuristic &amp; rule-based flag counts (Not indicative of fraud)</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: COLOR_A }} /> A</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: COLOR_B }} /> B</span>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {[
                  { label: 'Pending / Unsanctioned', a: metricsA.pendingWorks, b: metricsB.pendingWorks },
                  { label: 'Stale Status (>180d)', a: metricsA.staleWorks, b: metricsB.staleWorks },
                  { label: 'Cost Anomalies (>₹25L)', a: metricsA.costAnomalies, b: metricsB.costAnomalies },
                  { label: 'Disbursement Gaps', a: metricsA.disbursementIssues, b: metricsB.disbursementIssues },
                  { label: 'Vendor Concentration', a: metricsA.vendorConcentration, b: metricsB.vendorConcentration },
                ].map(item => {
                  const max = Math.max(item.a, item.b, 1);
                  const wA = (item.a / max) * 100;
                  const wB = (item.b / max) * 100;
                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#44474f]">{item.label}</span>
                        <div className="flex items-center gap-2 font-mono text-[10px]">
                          <span style={{ color: COLOR_A }} className="font-bold">{fmtN(item.a)}</span>
                          <span className="text-[#CED4DA]">vs</span>
                          <span style={{ color: COLOR_B }} className="font-bold">{fmtN(item.b)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 h-2">
                        <div className="flex-1 bg-[#F0F4F8] h-full rounded-l-xs overflow-hidden flex justify-end">
                          <div className="h-full rounded-l-xs transition-all duration-500"
                            style={{ width: `${wA}%`, backgroundColor: COLOR_A }} />
                        </div>
                        <div className="w-px h-3 bg-[#CED4DA]" />
                        <div className="flex-1 bg-[#F0F4F8] h-full rounded-r-xs overflow-hidden">
                          <div className="h-full rounded-r-xs transition-all duration-500"
                            style={{ width: `${wB}%`, backgroundColor: COLOR_B }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ── FACTUAL INSIGHTS ─────────────────────────────────────────────────── */}
          <div className="bg-white border border-[#E9ECEF] rounded-sm p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-[#E9ECEF] pb-2.5">
              <Activity size={16} className="text-[#00204a]" />
              <h3 className="text-sm font-bold text-[#000a1f]">Automated Factual Analytical Insights</h3>
              <span className="text-[10px] text-[#747780] ml-auto">Objective observations derived from database</span>
            </div>

            <div className="space-y-2">
              {factualInsights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-[#141d23] bg-[#F8F9FA] p-3 rounded-sm border border-[#E9ECEF]">
                  <CheckCheck size={14} className="text-[#198754] flex-shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-[10px] text-[#747780] flex items-center gap-1.5">
              <Info size={11} />
              <span>
                Note: All comparisons are descriptive and computed from official MPLADS records. No normative ranking or subjective scoring is applied.
              </span>
            </div>
          </div>

          {/* ── DRILL-DOWN ACTION PANEL ────────────────────────────────────────── */}
          <div className="bg-[#00204a] text-white rounded-sm p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Drill-Down to Project Intelligence
              </h3>
              <p className="text-xs text-[#CED4DA] mt-0.5">
                Inspect and filter individual project records for either comparative subject.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => handleDrillDown('A')}
                className="flex-1 sm:flex-initial px-4 py-2 bg-white text-[#00204a] hover:bg-[#F0F4F8] rounded-sm text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span>View {truncateText(metricsA.label, 15)} Works</span>
                <ExternalLink size={12} />
              </button>
              <button
                onClick={() => handleDrillDown('B')}
                className="flex-1 sm:flex-initial px-4 py-2 bg-[#E67E22] text-white hover:bg-[#D35400] rounded-sm text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span>View {truncateText(metricsB.label, 15)} Works</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default ComparativeIntelligence;
