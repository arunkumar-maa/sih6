import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, ChevronLeft, ChevronRight, ArrowUpDown,
  X, SlidersHorizontal, Building2, FolderOpen,
  AlertTriangle, ChevronDown, ChevronUp,
  ArrowLeft, Info, CheckCircle,
} from 'lucide-react';
import { useAppStore } from '../data/store';
import { RiskBadge } from '../components/RiskBadge';
import { formatCurrency, truncate } from '../utils';
import type { EnrichedProject, RiskLevel } from '../data/types';

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
        <span className="font-semibold text-[#141d23]">{total}</span> completed projects
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
        * These are potential anomaly indicators requiring officer review — not determinations of misconduct.
        This project is marked as completed. Historical patterns warrant monitoring attention.
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
  const { projects, selectProject, setCurrentPage } = useAppStore();

  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [filterConstituency, setFilterConstituency] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFY, setFilterFY] = useState('');
  const [sortField, setSortField] = useState<SortField>('risk');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const completedProjects = useMemo(() =>
    projects.filter(p => p.isCompleted),
    [projects]
  );

  const constituencies = useMemo(() =>
    Array.from(new Set(completedProjects.map(p => p.constituency))).filter(Boolean).sort(),
    [completedProjects]
  );
  const categories = useMemo(() =>
    Array.from(new Set(completedProjects.map(p => p.workCategory))).filter(Boolean).sort(),
    [completedProjects]
  );
  const financialYears = useMemo(() =>
    Array.from(new Set(completedProjects.map(p => p.financialYear))).filter(Boolean).sort().reverse(),
    [completedProjects]
  );
  const states = useMemo(() =>
    Array.from(new Set(completedProjects.map(p => p.state))).filter(Boolean).sort(),
    [completedProjects]
  );

  const stats = useMemo(() => {
    const total = completedProjects.length;
    const totalExpenditure = completedProjects.reduce((s, p) => s + (p.amountDisbursed ?? p.totalPaid ?? 0), 0);
    const statesCount = new Set(completedProjects.map(p => p.state)).size;
    const highRisk = completedProjects.filter(p => p.risk.level === 'HIGH').length;
    const withDays = completedProjects.filter(p => p.daysToComplete !== null && p.daysToComplete > 0);
    const avgDays = withDays.length > 0
      ? Math.round(withDays.reduce((s, p) => s + (p.daysToComplete ?? 0), 0) / withDays.length)
      : null;
    return { total, totalExpenditure, statesCount, highRisk, avgDays };
  }, [completedProjects]);

  const filtered = useMemo(() => {
    let list = [...completedProjects];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.workDescription?.toLowerCase().includes(q) ||
        p.workId?.toLowerCase().includes(q) ||
        p.constituency?.toLowerCase().includes(q) ||
        p.district?.toLowerCase().includes(q) ||
        p.mp?.toLowerCase().includes(q) ||
        p.workCategory?.toLowerCase().includes(q)
      );
    }
    if (filterRisk) list = list.filter(p => p.risk.level === filterRisk);
    if (filterConstituency) list = list.filter(p => p.constituency === filterConstituency);
    if (filterCategory) list = list.filter(p => p.workCategory === filterCategory);
    if (filterFY) list = list.filter(p => p.financialYear === filterFY);
    return riskFirstSort(list, sortField, sortDir);
  }, [completedProjects, search, filterRisk, filterConstituency, filterCategory, filterFY, sortField, sortDir]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
    setPage(1);
  };

  const clearFilters = useCallback(() => {
    setSearch(''); setFilterRisk(''); setFilterConstituency('');
    setFilterCategory(''); setFilterFY('');
    setPage(1);
  }, []);

  const hasFilters = search || filterRisk || filterConstituency || filterCategory || filterFY;

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
            {stats.total} completed projects ·{' '}
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

      {/* Filter Bar */}
      <div className="panel p-4">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal size={13} className="text-[#44474f]" />
          <span className="text-xs font-semibold text-[#44474f] uppercase tracking-wider">Filters</span>
          {hasFilters && (
            <button onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs font-semibold text-[#DC3545] hover:text-red-700 transition-colors">
              <X size={12} /> Reset
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#747780]" />
            <input
              type="text"
              placeholder="Search by project ID, name, district, constituency, MP…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-2 bg-white border border-[#E9ECEF] rounded-sm text-sm text-[#141d23] placeholder-[#c4c6d0] focus:outline-none focus:border-[#0891b2] focus:ring-1 focus:ring-[#0891b2]/20"
            />
          </div>
          {[
            { label: 'Risk Indicator', value: filterRisk, setter: setFilterRisk, opts: ['HIGH', 'MEDIUM', 'LOW'] },
            { label: 'Constituency', value: filterConstituency, setter: setFilterConstituency, opts: constituencies.slice(0, 50) },
            { label: 'Category', value: filterCategory, setter: setFilterCategory, opts: categories.slice(0, 30) },
            { label: 'Financial Year', value: filterFY, setter: setFilterFY, opts: financialYears },
          ].map(({ label, value, setter, opts }) => (
            <select key={label} value={value} onChange={e => { setter(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-white border border-[#E9ECEF] rounded-sm text-xs text-[#141d23] focus:outline-none focus:border-[#0891b2] max-w-44">
              <option value="">{label}</option>
              {opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
        </div>
        {hasFilters && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] font-semibold text-[#0891b2] uppercase tracking-wider">Filtered View</span>
            <span className="text-[10px] text-[#44474f]">· {filtered.length} results</span>
          </div>
        )}
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
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center text-[#747780] text-sm py-8">
                    No completed projects match the current filters.
                  </td>
                </tr>
              )}
              {paginated.map((p, i) => {
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
              })}
            </tbody>
          </table>
        </div>
        <PaginationBar page={page} totalPages={totalPages} total={filtered.length}
          onPage={p => { setPage(p); setExpandedRows(new Set()); }} />
      </div>
    </div>
  );
}
