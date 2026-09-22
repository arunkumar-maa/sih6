import React, { useEffect, useState, useMemo } from 'react';
import { PublicService } from '../../services/publicService';
import type {
  PublicKpisResponse,
  PublicMpItem,
  PublicProjectItem,
  PublicMetaResponse,
} from '../../types/public';
import { MpAvatar } from '../../components/MpAvatar';
import { formatCurrency } from '../../utils';
import {
  Layers,
  Award,
  Activity,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  AlertCircle,
  AlertTriangle,
  FolderGit2,
  Users,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';

interface PublicHomePageProps {
  onNavigate: (path: string) => void;
}

const standardStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu And Kashmir', 'Ladakh', 'Puducherry'
];

const standardCategories = [
  'Drinking Water Facility',
  'Education',
  'Electricity Facility',
  'Health and Family Welfare',
  'Irrigation Facility',
  'Non-Conventional Energy Sources',
  'Other Public Facilities',
  'Roads, Pathways and Bridges',
  'Sanitation and Public Health',
];

const standardFYs = ['2025-2026', '2024-2025', '2023-2024', '2022-2023'];

export function PublicHomePage({ onNavigate }: PublicHomePageProps) {
  // House Selector State
  const [selectedHouse, setSelectedHouse] = useState<'LOK_SABHA' | 'RAJYA_SABHA'>('LOK_SABHA');
  const [houseInfoNotice, setHouseInfoNotice] = useState(false);

  // KPIs
  const [kpis, setKpis] = useState<PublicKpisResponse | null>(null);
  const [kpisLoading, setKpisLoading] = useState(true);

  // Active Main Table Tab: 'WORKS' or 'MPS'
  const [activeTableTab, setActiveTableTab] = useState<'WORKS' | 'MPS'>('WORKS');

  // Search & Filter controls
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedFY, setSelectedFY] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  // Works Table State (server-side paginated)
  const [projects, setProjects] = useState<PublicProjectItem[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsTotalCount, setProjectsTotalCount] = useState(0);
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsPageSize, setProjectsPageSize] = useState(15);
  const [projectsTotalPages, setProjectsTotalPages] = useState(1);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // MPs Table State (server-side paginated)
  const [mps, setMps] = useState<PublicMpItem[]>([]);
  const [mpsLoading, setMpsLoading] = useState(false);
  const [mpsTotalCount, setMpsTotalCount] = useState(0);
  const [mpsPage, setMpsPage] = useState(1);
  const [mpsPageSize, setMpsPageSize] = useState(15);
  const [mpsTotalPages, setMpsTotalPages] = useState(1);
  const [mpsError, setMpsError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setProjectsPage(1);
      setMpsPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load KPIs once
  useEffect(() => {
    async function loadKpis() {
      try {
        setKpisLoading(true);
        const res = await PublicService.getKpis();
        setKpis(res);
      } catch (err) {
        console.error('[PublicDashboard] Error loading KPIs:', err);
      } finally {
        setKpisLoading(false);
      }
    }
    loadKpis();
  }, []);

  // Fetch Projects Table when works tab or filters change
  useEffect(() => {
    if (activeTableTab !== 'WORKS') return;

    let isMounted = true;
    async function loadProjectsData() {
      try {
        setProjectsLoading(true);
        setProjectsError(null);
        const res = await PublicService.getProjects({
          page: projectsPage,
          pageSize: projectsPageSize,
          search: debouncedSearch || undefined,
          state: selectedState !== 'ALL' ? selectedState : undefined,
          category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
          financialYear: selectedFY !== 'ALL' ? selectedFY : undefined,
        });

        if (isMounted) {
          setProjects(res.projects || []);
          setProjectsTotalCount(res.totalCount || 0);
          setProjectsTotalPages(res.totalPages || 1);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('[PublicDashboard] Error loading projects:', err);
          setProjectsError(err.message || 'Unable to load projects');
        }
      } finally {
        if (isMounted) setProjectsLoading(false);
      }
    }

    loadProjectsData();
    return () => {
      isMounted = false;
    };
  }, [
    activeTableTab,
    projectsPage,
    projectsPageSize,
    debouncedSearch,
    selectedState,
    selectedCategory,
    selectedStatus,
    selectedFY,
  ]);

  // Fetch MPs Table when MPs tab or filters change
  useEffect(() => {
    if (activeTableTab !== 'MPS') return;

    let isMounted = true;
    async function loadMpsData() {
      try {
        setMpsLoading(true);
        setMpsError(null);
        const res = await PublicService.getMps({
          page: mpsPage,
          pageSize: mpsPageSize,
          search: debouncedSearch || undefined,
          state: selectedState !== 'ALL' ? selectedState : undefined,
        });

        if (isMounted) {
          setMps(res.mps || []);
          setMpsTotalCount(res.totalCount || 0);
          setMpsTotalPages(res.totalPages || 1);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('[PublicDashboard] Error loading MPs:', err);
          setMpsError(err.message || 'Unable to load MP directory');
        }
      } finally {
        if (isMounted) setMpsLoading(false);
      }
    }

    loadMpsData();
    return () => {
      isMounted = false;
    };
  }, [activeTableTab, mpsPage, mpsPageSize, debouncedSearch, selectedState]);

  const hasActiveFilters =
    searchInput.trim() !== '' ||
    selectedState !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    selectedFY !== 'ALL';

  const resetAllFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setSelectedState('ALL');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setSelectedFY('ALL');
    setProjectsPage(1);
    setMpsPage(1);
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      {/* ── 1. Dashboard Title & Top Controls ──────────────────── */}
      <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Dashboard
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded border border-slate-300">
              Live MoSPI Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Details of Lok Sabha MPLADS works and parliamentary project portfolios
          </p>
        </div>

        {/* Right Top Actions & House Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* House Selector */}
          <div className="inline-flex items-center rounded border border-slate-300 bg-slate-100/80 p-0.5 text-xs font-semibold shadow-2xs">
            <button
              onClick={() => {
                setSelectedHouse('LOK_SABHA');
                setHouseInfoNotice(false);
              }}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                selectedHouse === 'LOK_SABHA'
                  ? 'bg-[#00204a] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lok Sabha
            </button>
            <button
              onClick={() => {
                setHouseInfoNotice(true);
              }}
              className="px-3 py-1.5 rounded text-slate-500 hover:text-slate-800 transition-all flex items-center gap-1 cursor-pointer"
              title="Rajya Sabha works are administered under official State Nodal records"
            >
              <span>Rajya Sabha</span>
              <span className="text-[9px] font-normal px-1 py-0.2 rounded bg-slate-200/80 text-slate-600">
                Nodal
              </span>
            </button>
          </div>

          {/* Report an Issue CTA */}
          <button
            onClick={() => onNavigate('/complaints/report')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#DC3545] hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <AlertCircle size={14} />
            <span>Report an Issue</span>
          </button>

          {/* Track Complaint Link */}
          <button
            onClick={() => onNavigate('/complaints/track')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium shadow-2xs transition-all cursor-pointer"
          >
            <Search size={13} />
            <span>Track Complaint</span>
          </button>
        </div>
      </div>

      {/* House Selector Informative Notice (if Rajya Sabha clicked) */}
      {houseInfoNotice && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-4 py-2.5 rounded-sm flex items-center justify-between gap-2 shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
            <span>
              <strong>Note:</strong> Public transparency monitoring actively publishes Lok Sabha parliamentary portfolios (543 seats). Rajya Sabha project records are administered through State Nodal monitoring.
            </span>
          </div>
          <button
            onClick={() => setHouseInfoNotice(false)}
            className="text-amber-700 hover:text-amber-900 p-0.5 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── 2. Prominent Search & Filter Area ──────────────────── */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by MP name, Work ID, project description, constituency, or state..."
              className="w-full pl-10 pr-10 py-2 text-xs border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#005eb2] focus:border-[#005eb2] bg-white placeholder:text-slate-400"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-sm border transition-all cursor-pointer ${
                showFilters || hasActiveFilters
                  ? 'bg-slate-100 border-[#005eb2] text-[#005eb2]'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter size={14} />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#005eb2]" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Filter Bar */}
        {showFilters && (
          <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in text-xs">
            {/* State Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                State / UT
              </label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setProjectsPage(1);
                  setMpsPage(1);
                }}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-sm bg-white text-slate-800 text-xs"
              >
                <option value="ALL">All States (National)</option>
                {standardStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter (Active in Works Tab) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setProjectsPage(1);
                }}
                disabled={activeTableTab === 'MPS'}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-sm bg-white text-slate-800 text-xs disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="ALL">All Categories</option>
                {standardCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Execution Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setProjectsPage(1);
                }}
                disabled={activeTableTab === 'MPS'}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-sm bg-white text-slate-800 text-xs disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="ALL">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Recommended">Recommended</option>
              </select>
            </div>

            {/* Financial Year Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Financial Year
              </label>
              <select
                value={selectedFY}
                onChange={(e) => {
                  setSelectedFY(e.target.value);
                  setProjectsPage(1);
                }}
                disabled={activeTableTab === 'MPS'}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-sm bg-white text-slate-800 text-xs disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="ALL">All Financial Years</option>
                {standardFYs.map((fy) => (
                  <option key={fy} value={fy}>
                    FY {fy}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Database-Driven Public KPI Cards ───────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Works */}
        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Total Works
            </span>
            <Layers size={16} className="text-[#005eb2]" />
          </div>
          <div
            className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {kpisLoading ? (
              <span className="text-slate-300 animate-pulse text-lg">Loading...</span>
            ) : kpis ? (
              kpis.totalWorks.toLocaleString('en-IN')
            ) : (
              '—'
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-normal">
            Publicly Monitored Works
          </span>
        </div>

        {/* Card 2: Total Sanctioned */}
        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Total Sanctioned
            </span>
            <Award size={16} className="text-[#6d28d9]" />
          </div>
          <div
            className="text-2xl font-extrabold text-[#6d28d9] font-mono tracking-tight"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {kpisLoading ? (
              <span className="text-slate-300 animate-pulse text-lg">Loading...</span>
            ) : kpis ? (
              formatCurrency(kpis.totalSanctionedAmount)
            ) : (
              '—'
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-normal">
            Sanctioned Value
          </span>
        </div>

        {/* Card 3: Total Disbursed / Expenditure */}
        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Total Expenditure
            </span>
            <Activity size={16} className="text-[#0891b2]" />
          </div>
          <div
            className="text-2xl font-extrabold text-[#0891b2] font-mono tracking-tight"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {kpisLoading ? (
              <span className="text-slate-300 animate-pulse text-lg">Loading...</span>
            ) : kpis ? (
              formatCurrency(kpis.totalDisbursedAmount)
            ) : (
              '—'
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-normal">
            Fund Utilization
          </span>
        </div>

        {/* Card 4: Completed Works */}
        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Completed Works
            </span>
            <CheckCircle2 size={16} className="text-[#198754]" />
          </div>
          <div
            className="text-2xl font-extrabold text-[#198754] font-mono tracking-tight"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {kpisLoading ? (
              <span className="text-slate-300 animate-pulse text-lg">Loading...</span>
            ) : kpis ? (
              kpis.completedWorks.toLocaleString('en-IN')
            ) : (
              '—'
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-normal">
            Delivered Assets
          </span>
        </div>

        {/* Card 5: Ongoing Works */}
        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs hover:border-slate-300 transition-all col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Ongoing Works
            </span>
            <Clock size={16} className="text-[#d97706]" />
          </div>
          <div
            className="text-2xl font-extrabold text-[#d97706] font-mono tracking-tight"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {kpisLoading ? (
              <span className="text-slate-300 animate-pulse text-lg">Loading...</span>
            ) : kpis ? (
              kpis.ongoingWorks.toLocaleString('en-IN')
            ) : (
              '—'
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-normal">
            In Implementation
          </span>
        </div>
      </div>

      {/* ── 4. Main Public Data Section: Heading & Table Controls ─ */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
        {/* Table Header & View Switch */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2
              className="text-base sm:text-lg font-bold text-slate-900 tracking-tight"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Lok Sabha Representatives / MPLADS Works
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTableTab === 'WORKS'
                ? `Showing ${projects.length > 0 ? (projectsPage - 1) * projectsPageSize + 1 : 0} to ${Math.min(
                    projectsPage * projectsPageSize,
                    projectsTotalCount
                  )} of ${projectsTotalCount.toLocaleString('en-IN')} verified public works`
                : `Showing ${mps.length > 0 ? (mpsPage - 1) * mpsPageSize + 1 : 0} to ${Math.min(
                    mpsPage * mpsPageSize,
                    mpsTotalCount
                  )} of ${mpsTotalCount.toLocaleString('en-IN')} parliamentary representatives`}
            </p>
          </div>

          {/* Table Tab Selector & Direct Explorer Shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded border border-slate-300 bg-white p-0.5 text-xs font-semibold shadow-2xs">
              <button
                onClick={() => {
                  setActiveTableTab('WORKS');
                }}
                className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                  activeTableTab === 'WORKS'
                    ? 'bg-[#00204a] text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                MPLADS Works
              </button>
              <button
                onClick={() => {
                  setActiveTableTab('MPS');
                }}
                className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                  activeTableTab === 'MPS'
                    ? 'bg-[#00204a] text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                MPs (543)
              </button>
            </div>

            {activeTableTab === 'WORKS' ? (
              <button
                onClick={() => onNavigate('/projects')}
                className="flex items-center gap-1 text-xs font-semibold text-[#005eb2] hover:text-[#003161] px-2.5 py-1.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span>View All Projects</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('/mps')}
                className="flex items-center gap-1 text-xs font-semibold text-[#005eb2] hover:text-[#003161] px-2.5 py-1.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span>View All MPs</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>

        {/* ── Table Content ────────────────────────────────────── */}
        {activeTableTab === 'WORKS' ? (
          /* WORKS TABLE */
          <div>
            {projectsLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8">
                <div className="w-8 h-8 border-3 border-[#005eb2] border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs font-semibold text-slate-800">
                  Loading verified Lok Sabha works...
                </p>
                <p className="text-[11px] text-slate-500">
                  Retrieving official database records
                </p>
              </div>
            ) : projectsError ? (
              <div className="p-8 text-center max-w-md mx-auto space-y-3">
                <AlertCircle size={28} className="text-[#DC3545] mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">Query Error</h4>
                <p className="text-xs text-slate-500">{projectsError}</p>
                <button
                  onClick={() => setProjectsPage(1)}
                  className="px-3 py-1.5 rounded-sm bg-[#005eb2] text-white text-xs font-semibold cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : projects.length === 0 ? (
              <div className="p-12 text-center max-w-md mx-auto space-y-3">
                <FolderGit2 size={36} className="text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Projects Found</h4>
                <p className="text-xs text-slate-500">
                  No public works matched your current search and filter parameters.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="text-xs font-semibold text-[#005eb2] hover:underline cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-3 px-3.5 w-12 text-center">Sr.</th>
                      <th className="py-3 px-3.5 min-w-[220px]">Work ID & Details</th>
                      <th className="py-3 px-3.5 min-w-[140px]">Constituency / State</th>
                      <th className="py-3 px-3.5 min-w-[140px]">Hon'ble MP</th>
                      <th className="py-3 px-3.5 min-w-[130px]">Category & FY</th>
                      <th className="py-3 px-3.5 text-right min-w-[120px]">Sanction Amount</th>
                      <th className="py-3 px-3.5 min-w-[100px]">Status</th>
                      <th className="py-3 px-3.5 text-center min-w-[90px]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {projects.map((p, idx) => {
                      const srNo = (projectsPage - 1) * projectsPageSize + idx + 1;
                      return (
                        <tr
                          key={p.workId}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3 px-3.5 text-center font-mono text-slate-400 text-[11px]">
                            {srNo}
                          </td>
                          <td className="py-3 px-3.5 max-w-sm">
                            <span className="font-mono text-[#005eb2] font-semibold block text-[11px]">
                              {p.workId}
                            </span>
                            <h4
                              className="font-medium text-slate-900 line-clamp-2 mt-0.5"
                              title={p.workDescription}
                            >
                              {p.workDescription}
                            </h4>
                            {p.attentionIndicator && p.attentionIndicator.level !== 'NONE' && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-sm mt-1">
                                <AlertTriangle size={10} />
                                <span>{p.attentionIndicator.label}</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <div className="font-medium text-slate-900">
                              {p.constituency}
                            </div>
                            <div className="text-[11px] text-slate-500">{p.state}</div>
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className="font-medium text-slate-700">
                              {p.mp || '—'}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                            <div>{p.workCategory}</div>
                            <div className="text-[10px] font-mono text-slate-400">
                              FY {p.financialYear}
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-right whitespace-nowrap">
                            <div className="font-bold text-slate-900 font-mono">
                              {formatCurrency(p.sanctionAmount)}
                            </div>
                            <div className="text-[10px] text-cyan-700">
                              Paid: {formatCurrency(p.amountDisbursed)}
                            </div>
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span
                              className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                                p.isCompleted
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {p.workStatus}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <button
                              onClick={() => onNavigate(`/projects/${p.workId}`)}
                              className="px-2.5 py-1 rounded bg-[#005eb2] hover:bg-[#004b8f] text-white text-[11px] font-semibold shadow-2xs transition-colors cursor-pointer"
                            >
                              View Work
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Works Pagination */}
            {!projectsLoading && projectsTotalPages > 1 && (
              <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/50">
                <div className="flex items-center gap-2 text-slate-500">
                  <span>Page {projectsPage} of {projectsTotalPages}</span>
                  <span>•</span>
                  <span>{projectsTotalCount.toLocaleString('en-IN')} total records</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={projectsPageSize}
                    onChange={(e) => {
                      setProjectsPageSize(Number(e.target.value));
                      setProjectsPage(1);
                    }}
                    className="px-2 py-1 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value={10}>10 per page</option>
                    <option value={15}>15 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>

                  <button
                    onClick={() => setProjectsPage((p) => Math.max(1, p - 1))}
                    disabled={projectsPage === 1}
                    className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setProjectsPage((p) => Math.min(projectsTotalPages, p + 1))}
                    disabled={projectsPage === projectsTotalPages}
                    className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* MPS TABLE */
          <div>
            {mpsLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8">
                <div className="w-8 h-8 border-3 border-[#005eb2] border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs font-semibold text-slate-800">
                  Loading parliamentary representatives...
                </p>
                <p className="text-[11px] text-slate-500">
                  Fetching 543 Lok Sabha members
                </p>
              </div>
            ) : mpsError ? (
              <div className="p-8 text-center max-w-md mx-auto space-y-3">
                <AlertCircle size={28} className="text-[#DC3545] mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">Directory Error</h4>
                <p className="text-xs text-slate-500">{mpsError}</p>
                <button
                  onClick={() => setMpsPage(1)}
                  className="px-3 py-1.5 rounded-sm bg-[#005eb2] text-white text-xs font-semibold cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : mps.length === 0 ? (
              <div className="p-12 text-center max-w-md mx-auto space-y-3">
                <Users size={36} className="text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Representatives Found</h4>
                <p className="text-xs text-slate-500">
                  No MPs matched your filter criteria.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="text-xs font-semibold text-[#005eb2] hover:underline cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-3 px-3.5 w-12 text-center">Sr.</th>
                      <th className="py-3 px-3.5 min-w-[200px]">Representative</th>
                      <th className="py-3 px-3.5 min-w-[140px]">Constituency</th>
                      <th className="py-3 px-3.5 min-w-[140px]">State</th>
                      <th className="py-3 px-3.5 min-w-[120px]">Party / House</th>
                      <th className="py-3 px-3.5 text-center min-w-[100px]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {mps.map((mp, idx) => {
                      const srNo = (mpsPage - 1) * mpsPageSize + idx + 1;
                      return (
                        <tr
                          key={mp.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3 px-3.5 text-center font-mono text-slate-400 text-[11px]">
                            {srNo}
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-3">
                              <MpAvatar
                                name={mp.name}
                                id={mp.id}
                                photoUrl={mp.photoUrl}
                                size="sm"
                                className="ring-1 ring-slate-200"
                              />
                              <div>
                                <h4 className="font-semibold text-slate-900">
                                  {mp.name}
                                </h4>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {mp.mpId}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3.5 font-medium text-slate-800 whitespace-nowrap">
                            {mp.constituency}
                          </td>
                          <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                            {mp.state}
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className="font-semibold text-slate-700 block">
                              {mp.party || 'Independent'}
                            </span>
                            <span className="text-[10px] text-[#005eb2] font-medium">
                              Lok Sabha
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <button
                              onClick={() => onNavigate(`/mp/${mp.mpId}`)}
                              className="px-2.5 py-1 rounded bg-[#005eb2] hover:bg-[#004b8f] text-white text-[11px] font-semibold shadow-2xs transition-colors cursor-pointer"
                            >
                              View Profile
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* MPs Pagination */}
            {!mpsLoading && mpsTotalPages > 1 && (
              <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/50">
                <div className="flex items-center gap-2 text-slate-500">
                  <span>Page {mpsPage} of {mpsTotalPages}</span>
                  <span>•</span>
                  <span>{mpsTotalCount.toLocaleString('en-IN')} MPs</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={mpsPageSize}
                    onChange={(e) => {
                      setMpsPageSize(Number(e.target.value));
                      setMpsPage(1);
                    }}
                    className="px-2 py-1 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value={10}>10 per page</option>
                    <option value={15}>15 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>

                  <button
                    onClick={() => setMpsPage((p) => Math.max(1, p - 1))}
                    disabled={mpsPage === 1}
                    className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setMpsPage((p) => Math.min(mpsTotalPages, p + 1))}
                    disabled={mpsPage === mpsTotalPages}
                    className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 5. Quick Access Navigation Cards ──────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Explore All 543 MPs */}
        <div
          onClick={() => onNavigate('/mps')}
          className="bg-white border border-slate-200 rounded-sm p-4 hover:border-[#005eb2] hover:shadow-xs transition-all cursor-pointer group flex items-start justify-between gap-3"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 group-hover:text-[#005eb2] transition-colors">
              <Users size={16} className="text-[#005eb2]" />
              <span>543 Lok Sabha MPs</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Browse representatives, profiles, constituency allocations, and works.
            </p>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-[#005eb2] group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
        </div>

        {/* Card 2: Project Explorer */}
        <div
          onClick={() => onNavigate('/projects')}
          className="bg-white border border-slate-200 rounded-sm p-4 hover:border-[#005eb2] hover:shadow-xs transition-all cursor-pointer group flex items-start justify-between gap-3"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 group-hover:text-[#005eb2] transition-colors">
              <FolderGit2 size={16} className="text-[#005eb2]" />
              <span>Full Project Explorer</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Explore 65,000+ works with multi-factor filters and inspection records.
            </p>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-[#005eb2] group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
        </div>

        {/* Card 3: Interactive GIS Map */}
        <div
          onClick={() => onNavigate('/map')}
          className="bg-white border border-slate-200 rounded-sm p-4 hover:border-[#005eb2] hover:shadow-xs transition-all cursor-pointer group flex items-start justify-between gap-3"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 group-hover:text-[#005eb2] transition-colors">
              <MapPin size={16} className="text-[#005eb2]" />
              <span>Interactive GIS Map</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Visualize constituency fund utilization and project clusters geo-spatially.
            </p>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-[#005eb2] group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
        </div>

        {/* Card 4: Report / Grievance Redressal */}
        <div
          onClick={() => onNavigate('/complaints/report')}
          className="bg-rose-50/50 border border-rose-200 rounded-sm p-4 hover:border-rose-400 hover:shadow-xs transition-all cursor-pointer group flex items-start justify-between gap-3"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 group-hover:text-rose-700 transition-colors">
              <AlertCircle size={16} className="text-[#DC3545]" />
              <span>Report an Issue</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Submit public feedback, project delays, or quality concerns anonymously.
            </p>
          </div>
          <ChevronRight size={16} className="text-rose-400 group-hover:text-rose-700 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
        </div>
      </div>
    </div>
  );
}
