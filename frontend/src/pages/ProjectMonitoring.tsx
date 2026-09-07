import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Search, ChevronLeft, ChevronRight, ArrowUpDown,
  X, SlidersHorizontal, FolderOpen
} from 'lucide-react';
import { useAppStore } from '../data/store';
import { RiskBadge } from '../components/RiskBadge';
import { OfficialFilterBar, OfficialFilterState } from '../components/OfficialFilterBar';
import { formatCurrency, truncate } from '../utils';
import type { EnrichedProject } from '../data/types';
import { ProjectIntelligenceView } from './ProjectIntelligenceView';

import { getProjects, getProjectById } from '../data/supabase/projectQueries';

const PAGE_SIZE = 20;

type SortField = 'risk' | 'amount' | 'district' | 'status' | 'fy';
type SortDir = 'asc' | 'desc';

export function ProjectMonitoring() {
  const {
    projects,
    selectedProjectId,
    selectProject,
    activeHouse,
    monitoringFilter,
    setMonitoringFilter,
    setActiveHouse,
    isUsingSupabase,
  } = useAppStore();

  const [filters, setFilters] = useState<OfficialFilterState>({
    search: '',
    house: activeHouse,
    tenure: '',
    state: '',
    constituency: '',
    mpName: '',
    riskLevel: '',
    status: '',
    category: '',
  });

  const [sortField, setSortField] = useState<SortField>('risk');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  // Supabase Server-Side State
  const [supabaseProjects, setSupabaseProjects] = useState<EnrichedProject[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState<EnrichedProject | null>(null);

  // Apply pre-filter from GIS Map / drill-down navigation
  useEffect(() => {
    if (monitoringFilter) {
      if (monitoringFilter.house && monitoringFilter.house !== activeHouse) {
        setActiveHouse(monitoringFilter.house);
      }
      setFilters(f => ({
        ...f,
        house: monitoringFilter.house || activeHouse,
        tenure: '',
        state: monitoringFilter.state || '',
        constituency: monitoringFilter.constituency || '',
      }));
      setPage(1);
      setMonitoringFilter(null);
    }
  }, [monitoringFilter, activeHouse, setActiveHouse, setMonitoringFilter]);

  // Sync house when global activeHouse changes
  const prevHouseRef = React.useRef(activeHouse);
  React.useEffect(() => {
    if (prevHouseRef.current !== activeHouse) {
      prevHouseRef.current = activeHouse;
      setFilters(f => ({
        ...f,
        house: activeHouse,
        tenure: '',
        state: '', constituency: '', mpName: '', riskLevel: '', status: '', category: '', search: '',
      }));
      setPage(1);
    }
  }, [activeHouse]);

  // Query projects from backend API when in database mode
  useEffect(() => {
    if (!isUsingSupabase) return;

    let cancelled = false;
    setIsLoadingList(true);
    setApiError(null);

    getProjects({
      house: activeHouse,
      page,
      pageSize: PAGE_SIZE,
      search: filters.search,
      state: filters.state,
      constituency: filters.constituency,
      mpName: filters.mpName,
      riskLevel: filters.riskLevel,
      status: filters.status,
      category: filters.category,
      tenure: filters.tenure,
      sortField,
      sortDir,
    })
      .then(res => {
        if (!cancelled) {
          setSupabaseProjects(res.projects);
          setTotalCount(res.totalCount);
          setApiError(null);
          setIsLoadingList(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('[ProjectMonitoring] API query error:', err);
          setApiError(err.message || 'Unable to load MPLADS records.');
          setIsLoadingList(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isUsingSupabase, activeHouse, page, filters, sortField, sortDir]);

  // Fetch single project details when clicked
  useEffect(() => {
    if (!selectedProjectId) {
      setSelectedProjectDetail(null);
      return;
    }

    if (isUsingSupabase) {
      getProjectById(selectedProjectId, activeHouse).then(p => {
        setSelectedProjectDetail(p);
      });
    } else {
      const p = projects.find(x => x.workId === selectedProjectId) || null;
      setSelectedProjectDetail(p);
    }
  }, [selectedProjectId, activeHouse, isUsingSupabase, projects]);

  // Fallback local filtering for offline mode
  const localFiltered = useMemo(() => {
    if (isUsingSupabase) return [];
    let list = [...projects];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p =>
        p.workDescription?.toLowerCase().includes(q) ||
        p.workId?.toLowerCase().includes(q) ||
        p.constituency?.toLowerCase().includes(q) ||
        p.district?.toLowerCase().includes(q) ||
        p.mp?.toLowerCase().includes(q) ||
        p.workCategory?.toLowerCase().includes(q)
      );
    }
    if (filters.state) list = list.filter(p => p.state === filters.state);
    if (filters.constituency) list = list.filter(p => p.constituency === filters.constituency);
    if (filters.mpName) list = list.filter(p => p.mp === filters.mpName);
    if (filters.riskLevel) list = list.filter(p => p.risk.level === filters.riskLevel);
    if (filters.category) list = list.filter(p => p.workCategory === filters.category);
    if (filters.status) list = list.filter(p => p.workStatus === filters.status);
    if (filters.tenure === '18th Lok Sabha') {
      list = list.filter(p => p.financialYear >= '2024-2025' || p.financialYear === 'Unknown');
    } else if (filters.tenure === '17th Lok Sabha') {
      list = list.filter(p => p.financialYear >= '2019-2020' && p.financialYear <= '2023-2024');
    }

    list.sort((a, b) => {
      let av: number | string = 0, bv: number | string = 0;
      switch (sortField) {
        case 'risk':   av = a.risk.score; bv = b.risk.score; break;
        case 'amount': av = a.sanctionAmount ?? 0; bv = b.sanctionAmount ?? 0; break;
        case 'district': av = a.district; bv = b.district; break;
        case 'status': av = a.workStatus; bv = b.workStatus; break;
        case 'fy':     av = a.financialYear; bv = b.financialYear; break;
      }
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortDir === 'asc' ? (av - (bv as number)) : ((bv as number) - av);
    });
    return list;
  }, [isUsingSupabase, projects, filters, sortField, sortDir]);

  const activeProjectsList = isUsingSupabase ? supabaseProjects : localFiltered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeTotalCount = isUsingSupabase ? totalCount : localFiltered.length;
  const totalPages = Math.max(1, Math.ceil(activeTotalCount / PAGE_SIZE));

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
    setPage(1);
  };

  if (selectedProjectDetail) {
    return <ProjectIntelligenceView project={selectedProjectDetail} onBack={() => selectProject(null)} />;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#005eb2] mb-1 flex items-center gap-2">
            <FolderOpen size={11} />
            Project Intelligence List
          </p>
          <h1 className="text-2xl font-bold text-[#000a1f]"
              style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Project Monitoring
          </h1>
          <p className="text-xs text-[#747780] mt-0.5">
            {isLoadingList
              ? 'Loading MPLADS records…'
              : apiError
              ? 'Unable to load MPLADS records. Please try again.'
              : `${activeTotalCount.toLocaleString('en-IN')} works · Click a row to open Project Intelligence Profile`}
          </p>
        </div>
      </div>

      {/* ── Official Filter Bar ───────────────────────────────────────── */}
      <div className="panel p-4">
        <OfficialFilterBar
          projects={projects}
          filteredProjects={activeProjectsList}
          filteredCount={activeTotalCount}
          totalCount={activeTotalCount}
          filters={filters}
          onFilterChange={f => { setFilters(f); setPage(1); }}
          onReset={() => {
            setFilters({
              search: '',
              house: filters.house,
              tenure: '',
              state: '',
              constituency: '',
              mpName: '',
              riskLevel: '',
              status: '',
              category: '',
            });
            setPage(1);
          }}
          exportFilename="Project_Monitoring"
          accentColor="#005eb2"
        />
      </div>

      {/* Table */}
      <div className="panel overflow-hidden relative">
        {isLoadingList && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-slate-200">
              <div className="w-4 h-4 rounded-full border-2 border-[#005eb2] border-t-transparent animate-spin" />
              <span className="text-xs font-semibold text-[#000a1f]">Loading MPLADS records…</span>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th className="w-8">#</th>
                <th>Work ID</th>
                <th>Project / Description</th>
                <th>Location</th>
                <th>MP</th>
                <th
                  className="cursor-pointer hover:text-[#005eb2] transition-colors"
                  onClick={() => toggleSort('amount')}
                >
                  <div className="flex items-center gap-1">
                    Sanctioned <ArrowUpDown size={10} />
                  </div>
                </th>
                <th>Disbursed</th>
                <th
                  className="cursor-pointer hover:text-[#005eb2] transition-colors"
                  onClick={() => toggleSort('status')}
                >
                  Status
                </th>
                <th
                  className="cursor-pointer hover:text-[#005eb2] transition-colors"
                  onClick={() => toggleSort('fy')}
                >
                  FY
                </th>
                <th
                  className="cursor-pointer hover:text-[#005eb2] transition-colors"
                  onClick={() => toggleSort('risk')}
                >
                  <div className="flex items-center gap-1">
                    Risk <ArrowUpDown size={10} />
                  </div>
                </th>
                <th>Attention</th>
              </tr>
            </thead>
            <tbody>
              {apiError ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-[#DC3545] font-semibold text-sm">
                    Unable to load MPLADS records. Please try again.
                  </td>
                </tr>
              ) : activeProjectsList.length === 0 && !isLoadingList ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-slate-500 text-sm">
                    No MPLADS records match the selected filters.
                  </td>
                </tr>
              ) : (
                activeProjectsList.map((p, i) => (
                  <tr
                    key={p.workId}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => selectProject(p.workId)}
                  >
                    <td className="text-[#c4c6d0] text-xs font-mono">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td>
                      <span className="font-mono text-xs text-[#005eb2] font-semibold">
                        {p.workId.split('/').slice(0, 3).join('/')}
                      </span>
                    </td>
                    <td>
                      <div className="max-w-xs">
                        <div className="text-sm text-[#000a1f] font-medium truncate">
                          {truncate(p.workDescription || 'No description', 55)}
                        </div>
                        <div className="text-[10px] text-[#747780] truncate">{truncate(p.workCategory, 45)}</div>
                      </div>
                    </td>
                    <td>
                      <div className="text-xs">
                        <div className="text-[#141d23] font-medium">{p.district || p.state}</div>
                        <div className="text-[#747780]">{p.constituency || p.state}</div>
                      </div>
                    </td>
                    <td>
                      <div className="text-xs font-medium text-[#141d23] max-w-[140px] truncate" title={p.mp}>
                        {p.mp || '—'}
                      </div>
                    </td>
                    <td className="text-sm font-semibold text-[#141d23]">
                      {formatCurrency(p.sanctionAmount)}
                    </td>
                    <td className="text-sm text-[#44474f]">
                      {formatCurrency(p.totalPaid)}
                    </td>
                    <td>
                      <StatusPill status={p.workStatus} />
                    </td>
                    <td className="text-xs font-mono text-[#747780]">{p.financialYear}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <RiskBadge level={p.risk.level} size="sm" />
                        <span className="text-xs font-bold" style={{
                          color: p.risk.level === 'HIGH' ? '#DC3545' : p.risk.level === 'MEDIUM' ? '#FFC107' : '#198754'
                        }}>
                          {p.risk.score}
                        </span>
                      </div>
                    </td>
                    <td>
                      {p.risk.level === 'HIGH' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]">
                          Action Required
                        </span>
                      ) : p.risk.level === 'MEDIUM' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]">
                          Watch List
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#d1fae5] text-[#065f46] border border-[#6ee7b7]">
                          Standard
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E9ECEF] bg-[#F8F9FA]">
          <span className="text-xs text-[#747780]">
            Showing {activeTotalCount === 0 ? 0 : Math.min((page - 1) * PAGE_SIZE + 1, activeTotalCount)}–{Math.min(page * PAGE_SIZE, activeTotalCount)} of {activeTotalCount.toLocaleString('en-IN')} works
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-sm text-[#44474f] hover:text-[#000a1f] hover:bg-[#e0e9f2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-[#44474f] font-semibold px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-sm text-[#44474f] hover:text-[#000a1f] hover:bg-[#e0e9f2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const configs: Record<string, string> = {
    'Work Completed':         'text-[#065f46] bg-[#d1fae5] border-[#6ee7b7]',
    'Work In Progress':       'text-[#1e40af] bg-[#dbeafe] border-[#93c5fd]',
    'Physical Inspection':    'text-[#0e7490] bg-[#cffafe] border-[#67e8f9]',
    'Vendor Identification':  'text-[#92400e] bg-[#fef3c7] border-[#fcd34d]',
    'Sanction':               'text-[#44474f] bg-[#F8F9FA] border-[#E9ECEF]',
    'Unknown':                'text-[#747780] bg-[#F8F9FA] border-transparent',
  };
  const cls = configs[status] ?? configs['Unknown'];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cls}`}>
      {status}
    </span>
  );
}
