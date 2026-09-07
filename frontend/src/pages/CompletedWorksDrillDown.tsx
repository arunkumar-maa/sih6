import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, ChevronLeft, ChevronRight, ArrowUpDown,
  X, SlidersHorizontal, Building2, FolderOpen,
  AlertTriangle, ChevronDown, ChevronUp,
  ArrowLeft, Info, CheckCircle,
} from 'lucide-react';
import { useAppStore } from '../data/store';
import { RiskBadge } from '../components/RiskBadge';
import { OfficialFilterBar, OfficialFilterState } from '../components/OfficialFilterBar';
import { formatCurrency, truncate } from '../utils';
import type { EnrichedProject, RiskLevel } from '../data/types';
import { getProjects } from '../data/supabase/projectQueries';

const PAGE_SIZE = 20;
const RISK_ORDER: Record<RiskLevel, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

type SortField = 'risk' | 'amount' | 'district' | 'status' | 'fy';
type SortDir = 'asc' | 'desc';

function riskFirstSort(list: EnrichedProject[], sortField: SortField, sortDir: SortDir) {
  return [...list].sort((a, b) => {
    if (sortField === 'risk') {
      const levelDiff = RISK_ORDER[a.risk.level] - RISK_ORDER[b.risk.level];
      if (levelDiff !== 0) return levelDiff;
      return sortDir === 'asc' ? a.risk.score - b.risk.score : b.risk.score - a.risk.score;
    }
    let av: number | string = 0, bv: number | string = 0;
    switch (sortField) {
      case 'amount': av = a.amountDisbursed ?? 0; bv = b.amountDisbursed ?? 0; break;
      case 'district': av = a.district; bv = b.district; break;
      case 'status': av = a.workStatus; bv = b.workStatus; break;
      case 'fy': av = a.financialYear; bv = b.financialYear; break;
    }
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
    return sortDir === 'asc' ? (av - (bv as number)) : ((bv as number) - av);
  });
}

function PaginationBar({ page, totalPages, total, onPage }: {
  page: number; totalPages: number; total: number; onPage: (p: number) => void;
}) {
  const start = Math.min((page - 1) * PAGE_SIZE + 1, total);
  const end = Math.min(page * PAGE_SIZE, total);
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-[#E9ECEF] bg-[#F8F9FA] gap-2">
      <span className="text-xs text-[#747780]">
        Showing <span className="font-semibold text-[#141d23]">{start}–{end}</span> of{' '}
        <span className="font-semibold text-[#141d23]">{total.toLocaleString('en-IN')}</span> completed projects
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-sm text-xs font-semibold text-[#44474f] hover:text-[#000a1f] hover:bg-[#e0e9f2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-[#E9ECEF]">
          <ChevronLeft size={12} /> Previous
        </button>
        {pages.map((p, i) => p === '...' ? (
          <span key={`e-${i}`} className="px-1.5 text-xs text-[#747780]">…</span>
        ) : (
          <button key={p} onClick={() => onPage(p as number)}
            className={`w-7 h-7 rounded-sm text-xs font-semibold transition-colors ${
              p === page ? 'bg-[#00204a] text-white' : 'text-[#44474f] hover:bg-[#e0e9f2] border border-[#E9ECEF]'
            }`}>{p}</button>
        ))}
        <button onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages || totalPages === 0}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-sm text-xs font-semibold text-[#44474f] hover:text-[#000a1f] hover:bg-[#e0e9f2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-[#E9ECEF]">
          Next <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

function WhyAttentionPanel({ project }: { project: EnrichedProject }) {
  const activeFactors = project.risk.factors.filter(f => f.available && f.severity !== 'LOW');
  if (project.risk.score === 0) {
    return (
      <div className="px-4 py-3 bg-[#F8F9FA] border-t border-[#E9ECEF] text-[11px] text-[#747780]">
        <Info size={11} className="inline mr-1" />
        Standard operational parameters. No elevated risk indicators identified.
      </div>
    );
  }
  if (activeFactors.length === 0) {
    return (
      <div className="px-4 py-3 bg-[#d1fae5] border-t border-[#6ee7b7] text-[11px] text-[#065f46]">
        No active risk indicators detected. This completed project appears within normal parameters.
      </div>
    );
  }
  return (
    <div className={`px-4 py-3 border-t ${
      project.risk.level === 'HIGH' ? 'bg-[#fde8e8] border-[#fca5a5]' :
      project.risk.level === 'MEDIUM' ? 'bg-[#fef3c7] border-[#fcd34d]' : 'bg-[#d1fae5] border-[#6ee7b7]'
    }`}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="text-[10px] font-bold uppercase tracking-widest" style={{
          color: project.risk.level === 'HIGH' ? '#991b1b' : project.risk.level === 'MEDIUM' ? '#92400e' : '#065f46'
        }}>
          Monitoring Indicator · {project.risk.level} · Score {project.risk.score}
        </div>
        <span className="text-[9px] text-[#44474f] bg-white/60 px-1.5 py-0.5 rounded-sm border border-[#E9ECEF]">
          Completed Work — Historical Pattern Review
        </span>
      </div>
      <ul className="space-y-1">
        {activeFactors.map(f => (
          <li key={f.id} className="flex items-start gap-2 text-[11px] text-[#141d23]">
            <span className="mt-0.5 flex-shrink-0" style={{ color: f.severity === 'HIGH' ? '#DC3545' : '#FFC107' }}>→</span>
            <span><span className="font-semibold">{f.label}:</span> {f.description}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 text-[10px] text-[#747780]">
        * Monitoring indicator for completed works to identify systemic cost/timeline anomalies across districts.
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, color, Icon }: {
  label: string; value: string; sub?: string; color: string; Icon: React.ElementType;
}) {
  return (
    <div className="kpi-card">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: color }} />
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color }}>{label}</p>
          <p className="text-xl font-bold text-[#000a1f] leading-none" style={{ fontFamily: 'Montserrat, sans-serif' }}>{value}</p>
          {sub && <p className="text-[11px] text-[#747780] mt-1.5">{sub}</p>}
        </div>
        <div className="p-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

export function CompletedWorksDrillDown() {
  const { projects, selectProject, setCurrentPage, activeHouse, isUsingSupabase, kpis } = useAppStore();

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

  // Supabase state
  const [supabaseProjects, setSupabaseProjects] = useState<EnrichedProject[]>([]);
  const [supabaseTotalCount, setSupabaseTotalCount] = useState(0);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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

  const [sortField, setSortField] = useState<SortField>('risk');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Supabase server-side fetch
  React.useEffect(() => {
    if (!isUsingSupabase) return;
    let cancelled = false;
    setIsLoadingSupabase(true);
    setApiError(null);

    getProjects({
      house: activeHouse,
      isCompleted: true,
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
          setSupabaseTotalCount(res.totalCount);
          setApiError(null);
          setIsLoadingSupabase(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('[CompletedWorksDrillDown] Error querying Supabase:', err);
          setApiError(err.message || 'Unable to load MPLADS records.');
          setIsLoadingSupabase(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isUsingSupabase, activeHouse, page, filters, sortField, sortDir]);

  // Fallback memory filtering
  const completedProjects = useMemo(() =>
    projects.filter(p => p.isCompleted),
    [projects]
  );

  const filtered = useMemo(() => {
    if (isUsingSupabase) return supabaseProjects;
    let list = [...completedProjects];
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
    if (filters.tenure === '18th Lok Sabha') {
      list = list.filter(p => p.financialYear >= '2024-2025' || p.financialYear === 'Unknown');
    } else if (filters.tenure === '17th Lok Sabha') {
      list = list.filter(p => p.financialYear >= '2019-2020' && p.financialYear <= '2023-2024');
    }
    return riskFirstSort(list, sortField, sortDir);
  }, [isUsingSupabase, supabaseProjects, completedProjects, filters, sortField, sortDir]);

  const stats = useMemo(() => {
    if (isUsingSupabase) {
      const total = supabaseTotalCount;
      const totalExpenditure = kpis?.totalDisbursed || 0;
      const statesCount = 36;
      const highRisk = kpis?.highRisk || 0;
      return { total, totalExpenditure, statesCount, highRisk, avgDays: 142 };
    }

    const total = filtered.length;
    const totalExpenditure = filtered.reduce((s, p) => s + (p.amountDisbursed ?? p.totalPaid ?? 0), 0);
    const statesCount = new Set(filtered.map(p => p.state)).size;
    const highRisk = filtered.filter(p => p.risk.level === 'HIGH').length;
    const withDays = filtered.filter(p => p.daysToComplete !== null && p.daysToComplete > 0);
    const avgDays = withDays.length > 0
      ? Math.round(withDays.reduce((s, p) => s + (p.daysToComplete ?? 0), 0) / withDays.length)
      : null;
    return { total, totalExpenditure, statesCount, highRisk, avgDays };
  }, [isUsingSupabase, supabaseTotalCount, kpis, filtered]);

  const displayProjects = isUsingSupabase ? supabaseProjects : filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalDisplayCount = isUsingSupabase ? supabaseTotalCount : filtered.length;
  const totalPages = Math.ceil(totalDisplayCount / PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
    setPage(1);
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openProject = (id: string) => {
    selectProject(id);
    setCurrentPage('monitoring');
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#44474f] hover:text-[#005eb2] mb-2 transition-colors"
          >
            <ArrowLeft size={12} /> Command Center
          </button>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#0891b2] mb-1 flex items-center gap-2">
            <Building2 size={11} />
            Completed Works Intelligence
          </p>
          <h1 className="text-2xl font-bold text-[#000a1f]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Works Completed — Deep Dive
          </h1>
          <p className="text-xs text-[#747780] mt-0.5">
            {stats.total.toLocaleString('en-IN')} completed projects ·{' '}
            <span className="text-[#DC3545] font-semibold">{stats.highRisk} have risk indicators</span>
            {' '}· Historical pattern monitoring
          </p>
        </div>
        {/* Completed works disclaimer */}
        <div className="hidden lg:flex items-start gap-2 max-w-xs p-3 bg-[#dbeafe] border border-[#93c5fd] rounded-sm">
          <CheckCircle size={14} className="text-[#1e40af] mt-0.5 flex-shrink-0" />
          <div className="text-[10px] text-[#1e40af] leading-relaxed">
            <span className="font-bold block mb-0.5">Note on Risk Indicators</span>
            Risk flags on completed works are <em>historical pattern alerts</em> — not determinations of misconduct.
            They indicate patterns that may warrant post-completion review.
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Completed Works"
          value={stats.total.toLocaleString('en-IN')}
          sub="Works marked as completed"
          color="#0891b2"
          Icon={Building2}
        />
        <SummaryCard
          label="Total Expenditure"
          value={formatCurrency(stats.totalExpenditure)}
          sub="For completed projects"
          color="#0d9488"
          Icon={FolderOpen}
        />
        <SummaryCard
          label="States / Districts"
          value={stats.statesCount.toLocaleString('en-IN')}
          sub="States with completed works"
          color="#005eb2"
          Icon={FolderOpen}
        />
        <SummaryCard
          label="Requires Review"
          value={stats.highRisk.toLocaleString('en-IN')}
          sub="High risk indicator patterns"
          color="#DC3545"
          Icon={AlertTriangle}
        />
      </div>

      {/* ── Official Filter Bar ───────────────────────────────────────── */}
      <div className="panel p-4">
        <OfficialFilterBar
          projects={completedProjects}
          filteredProjects={displayProjects}
          filteredCount={totalDisplayCount}
          totalCount={isUsingSupabase ? (activeHouse === 'Lok Sabha' ? 65000 : 79219) : completedProjects.length}
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
          exportFilename="Completed_Works"
          accentColor="#0891b2"
        />
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th className="w-8">#</th>
                <th>Work ID</th>
                <th>Project</th>
                <th>Location</th>
                <th>MP</th>
                <th className="cursor-pointer hover:text-[#0891b2] transition-colors" onClick={() => toggleSort('amount')}>
                  <div className="flex items-center gap-1">Expenditure <ArrowUpDown size={10} /></div>
                </th>
                <th>Completion</th>
                <th className="cursor-pointer hover:text-[#0891b2] transition-colors" onClick={() => toggleSort('fy')}>FY</th>
                <th className="cursor-pointer hover:text-[#0891b2] transition-colors" onClick={() => toggleSort('risk')}>
                  <div className="flex items-center gap-1">Risk Indicator <ArrowUpDown size={10} /></div>
                </th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {apiError ? (
                <tr>
                  <td colSpan={10} className="text-center text-[#DC3545] text-sm py-8">
                    <AlertTriangle size={24} className="mx-auto mb-2 text-[#DC3545]" />
                    <p className="font-semibold">Unable to load MPLADS records. Please try again.</p>
                    <p className="text-xs text-[#747780] mt-1">{apiError}</p>
                  </td>
                </tr>
              ) : isLoadingSupabase ? (
                <tr>
                  <td colSpan={10} className="text-center text-[#747780] text-sm py-12">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#0891b2] mb-2" />
                    <p className="text-xs text-[#747780]">Loading MPLADS records…</p>
                  </td>
                </tr>
              ) : displayProjects.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center text-[#747780] text-sm py-8">
                    No MPLADS records match the selected filters.
                  </td>
                </tr>
              ) : (
                displayProjects.map((p, i) => {
                  const isExpanded = expandedRows.has(p.workId);
                  const activeFactors = p.risk.factors.filter(f => f.available && f.severity !== 'LOW');
                  return (
                    <React.Fragment key={p.workId}>
                      <tr className="cursor-pointer hover:bg-[#F8F9FA] transition-colors" onClick={() => openProject(p.workId)}>
                        <td className="text-[#c4c6d0] text-xs font-mono">{(page - 1) * PAGE_SIZE + i + 1}</td>
                        <td>
                          <span className="font-mono text-xs text-[#0891b2] font-semibold">
                            {p.workId.split('/').slice(0, 3).join('/')}
                          </span>
                        </td>
                        <td>
                          <div className="max-w-xs">
                            <div className="text-sm text-[#000a1f] font-medium leading-snug">
                              {truncate(p.workDescription || 'No description', 55)}
                            </div>
                            <div className="text-[10px] text-[#747780]">{truncate(p.workCategory, 40)}</div>
                          </div>
                        </td>
                        <td>
                          <div className="text-xs">
                            <div className="text-[#141d23] font-medium">{p.district}</div>
                            <div className="text-[#747780]">{p.constituency}</div>
                          </div>
                        </td>
                        <td className="text-xs text-[#44474f]">{truncate(p.mp || '—', 22)}</td>
                        <td className="text-sm font-semibold text-[#0891b2]">
                          {formatCurrency(p.amountDisbursed ?? p.totalPaid)}
                        </td>
                        <td>
                          {p.completionDate ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border text-[#065f46] bg-[#d1fae5] border-[#6ee7b7]">
                              <CheckCircle size={9} /> Completed
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#747780]">Date N/A</span>
                          )}
                        </td>
                        <td className="text-xs font-mono text-[#747780]">{p.financialYear}</td>
                        <td>
                          {p.risk.score > 0 ? (
                            <div className="flex items-center gap-2">
                              <RiskBadge level={p.risk.level} size="sm" />
                              <span className="text-xs font-bold" style={{
                                color: p.risk.level === 'HIGH' ? '#DC3545' : p.risk.level === 'MEDIUM' ? '#FFC107' : '#198754'
                              }}>{p.risk.score}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#747780]">Not scored</span>
                          )}
                        </td>
                        <td onClick={e => { e.stopPropagation(); toggleRow(p.workId); }}>
                          {activeFactors.length > 0 || p.risk.score > 0 ? (
                            <button className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-sm transition-colors whitespace-nowrap ${
                              p.risk.level === 'HIGH'
                                ? 'text-[#991b1b] bg-[#fde8e8] hover:bg-[#fca5a5]'
                                : p.risk.level === 'MEDIUM'
                                ? 'text-[#92400e] bg-[#fef3c7] hover:bg-[#fcd34d]'
                                : 'text-[#44474f] bg-[#F8F9FA] hover:bg-[#e0e9f2]'
                            }`}>
                              REVIEW {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#c4c6d0]">—</span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={10} className="p-0">
                            <WhyAttentionPanel project={p} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <PaginationBar page={page} totalPages={totalPages} total={totalDisplayCount}
          onPage={p => { setPage(p); setExpandedRows(new Set()); }} />
      </div>
    </div>
  );
}
