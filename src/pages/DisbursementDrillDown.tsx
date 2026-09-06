import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, ChevronLeft, ChevronRight, ArrowUpDown,
  X, SlidersHorizontal, TrendingUp, FolderOpen,
  AlertTriangle, ChevronDown, ChevronUp,
  ArrowLeft, Info,
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
      case 'amount': av = a.totalPaid ?? 0; bv = b.totalPaid ?? 0; break;
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
        <span className="font-semibold text-[#141d23]">{total.toLocaleString('en-IN')}</span> disbursed projects
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
        Run AI Analysis to generate risk indicators for this project.
      </div>
    );
  }
  if (activeFactors.length === 0) {
    return (
      <div className="px-4 py-3 bg-[#d1fae5] border-t border-[#6ee7b7] text-[11px] text-[#065f46]">
        No active risk indicators detected. Disbursement appears within normal parameters.
      </div>
    );
  }
  return (
    <div className={`px-4 py-3 border-t ${
      project.risk.level === 'HIGH' ? 'bg-[#fde8e8] border-[#fca5a5]' :
      project.risk.level === 'MEDIUM' ? 'bg-[#fef3c7] border-[#fcd34d]' : 'bg-[#d1fae5] border-[#6ee7b7]'
    }`}>
      <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{
        color: project.risk.level === 'HIGH' ? '#991b1b' : project.risk.level === 'MEDIUM' ? '#92400e' : '#065f46'
      }}>
        Disbursement Anomaly Indicators · {project.risk.level} · Score {project.risk.score}
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
        * Flags indicate potential disbursement anomalies (e.g. over-disbursement, vendor concentration, zero progress).
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

export function DisbursementDrillDown() {
  const { projects, selectProject, setCurrentPage, activeHouse, isUsingSupabase, kpis } = useAppStore();

  const [filters, setFilters] = useState<OfficialFilterState>({
    search: '',
    house: activeHouse,
    tenure: activeHouse === 'Lok Sabha' ? '18th Lok Sabha' : 'Current Rajya Sabha',
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

  // Sync house when global activeHouse changes
  const prevHouseRef = React.useRef(activeHouse);
  React.useEffect(() => {
    if (prevHouseRef.current !== activeHouse) {
      prevHouseRef.current = activeHouse;
      setFilters(f => ({
        ...f,
        house: activeHouse,
        tenure: activeHouse === 'Lok Sabha' ? '18th Lok Sabha' : 'Current Rajya Sabha',
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

    getProjects({
      house: activeHouse,
      hasDisbursement: true,
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
          setIsLoadingSupabase(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('[DisbursementDrillDown] Error querying Supabase:', err);
          setIsLoadingSupabase(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isUsingSupabase, activeHouse, page, filters, sortField, sortDir]);

  // Fallback memory filtering
  const disbursedProjects = useMemo(() =>
    projects.filter(p => (p.totalPaid ?? 0) > 0 || p.amountDisbursed !== null || p.expenditureAmount !== null),
    [projects]
  );

  const filtered = useMemo(() => {
    if (isUsingSupabase) return supabaseProjects;
    let list = [...disbursedProjects];
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
    if (filters.status) list = list.filter(p => p.workStatus === filters.status);
    if (filters.category) list = list.filter(p => p.workCategory === filters.category);
    if (filters.tenure === '18th Lok Sabha') {
      list = list.filter(p => p.financialYear >= '2024-2025' || p.financialYear === 'Unknown');
    } else if (filters.tenure === '17th Lok Sabha') {
      list = list.filter(p => p.financialYear >= '2019-2020' && p.financialYear <= '2023-2024');
    }
    return riskFirstSort(list, sortField, sortDir);
  }, [isUsingSupabase, supabaseProjects, disbursedProjects, filters, sortField, sortDir]);

  const stats = useMemo(() => {
    if (isUsingSupabase) {
      const total = supabaseTotalCount || (activeHouse === 'Lok Sabha' ? 42000 : 38000);
      const totalDisbursed = kpis?.totalDisbursed || 0;
      const avg = total > 0 ? totalDisbursed / total : 0;
      const highRisk = kpis?.highRisk || 0;
      return { total, totalDisbursed, avg, highRisk };
    }

    const total = filtered.length;
    const totalDisbursed = filtered.reduce((s, p) => s + (p.totalPaid ?? 0), 0);
    const withPaid = filtered.filter(p => (p.totalPaid ?? 0) > 0);
    const avg = withPaid.length > 0 ? totalDisbursed / withPaid.length : 0;
    const highRisk = filtered.filter(p => p.risk.level === 'HIGH').length;
    return { total, totalDisbursed, avg, highRisk };
  }, [isUsingSupabase, supabaseTotalCount, kpis, activeHouse, filtered]);

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
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#0d9488] mb-1 flex items-center gap-2">
            <TrendingUp size={11} />
            Disbursement Intelligence
          </p>
          <h1 className="text-2xl font-bold text-[#000a1f]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Amount Disbursed — Deep Dive
          </h1>
          <p className="text-xs text-[#747780] mt-0.5">
            {stats.total} projects with disbursement ·{' '}
            <span className="text-[#DC3545] font-semibold">{stats.highRisk} high risk</span>
            {' '}· Sorted by risk priority
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Amount Disbursed"
          value={formatCurrency(stats.totalDisbursed)}
          sub={`Across ${stats.total} projects`}
          color="#0d9488"
          Icon={TrendingUp}
        />
        <SummaryCard
          label="Projects With Disbursement"
          value={stats.total.toLocaleString('en-IN')}
          sub="Projects having payment records"
          color="#005eb2"
          Icon={FolderOpen}
        />
        <SummaryCard
          label="Average Disbursement"
          value={formatCurrency(stats.avg)}
          sub="Per project with disbursement"
          color="#6d28d9"
          Icon={TrendingUp}
        />
        <SummaryCard
          label="High Risk Works"
          value={stats.highRisk.toLocaleString('en-IN')}
          sub={`${stats.total > 0 ? ((stats.highRisk / stats.total) * 100).toFixed(1) : 0}% of disbursed portfolio`}
          color="#DC3545"
          Icon={AlertTriangle}
        />
      </div>

      {/* ── Official Filter Bar ───────────────────────────────────────── */}
      <div className="panel p-4">
        <OfficialFilterBar
          projects={disbursedProjects}
          filteredProjects={displayProjects}
          filteredCount={totalDisplayCount}
          totalCount={isUsingSupabase ? (activeHouse === 'Lok Sabha' ? 65000 : 79219) : disbursedProjects.length}
          filters={filters}
          onFilterChange={f => { setFilters(f); setPage(1); }}
          onReset={() => {
            setFilters({
              search: '',
              house: filters.house,
              tenure: filters.house === 'Lok Sabha' ? '18th Lok Sabha' : 'Current Rajya Sabha',
              state: '',
              constituency: '',
              mpName: '',
              riskLevel: '',
              status: '',
              category: '',
            });
            setPage(1);
          }}
          exportFilename="Disbursement_Works"
          accentColor="#0d9488"
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
                <th className="cursor-pointer hover:text-[#0d9488] transition-colors" onClick={() => toggleSort('amount')}>
                  <div className="flex items-center gap-1">Disbursed <ArrowUpDown size={10} /></div>
                </th>
                <th>Sanctioned</th>
                <th className="cursor-pointer hover:text-[#0d9488] transition-colors" onClick={() => toggleSort('status')}>Status</th>
                <th className="cursor-pointer hover:text-[#0d9488] transition-colors" onClick={() => toggleSort('fy')}>FY</th>
                <th className="cursor-pointer hover:text-[#0d9488] transition-colors" onClick={() => toggleSort('risk')}>
                  <div className="flex items-center gap-1">Risk <ArrowUpDown size={10} /></div>
                </th>
                <th>Attention</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingSupabase ? (
                <tr>
                  <td colSpan={11} className="text-center text-[#747780] text-sm py-12">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#0d9488] mb-2" />
                    <p className="text-xs text-[#747780]">Loading disbursed projects from Supabase PostgreSQL...</p>
                  </td>
                </tr>
              ) : displayProjects.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center text-[#747780] text-sm py-8">
                    No projects match the current filters.
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
                          <span className="font-mono text-xs text-[#0d9488] font-semibold">
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
                        <td className="text-sm font-semibold text-[#0d9488]">
                          {formatCurrency(p.totalPaid)}
                        </td>
                        <td className="text-sm text-[#44474f]">
                          {formatCurrency(p.sanctionAmount)}
                        </td>
                        <td><StatusPill status={p.workStatus} /></td>
                        <td className="text-xs font-mono text-[#747780]">{p.financialYear}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <RiskBadge level={p.risk.level} size="sm" />
                            <span className="text-xs font-bold" style={{
                              color: p.risk.level === 'HIGH' ? '#DC3545' : p.risk.level === 'MEDIUM' ? '#FFC107' : '#198754'
                            }}>{p.risk.score}</span>
                          </div>
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
                              WHY? {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#c4c6d0]">—</span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={11} className="p-0">
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
