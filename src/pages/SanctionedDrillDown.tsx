import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, ChevronLeft, ChevronRight, ArrowUpDown,
  X, SlidersHorizontal, DollarSign, FolderOpen,
  TrendingUp, AlertTriangle, ChevronDown, ChevronUp,
  ArrowLeft, ArrowRight, Info,
} from 'lucide-react';
import { useAppStore } from '../data/store';
import { RiskBadge } from '../components/RiskBadge';
import { formatCurrency, truncate } from '../utils';
import type { EnrichedProject, RiskLevel } from '../data/types';

const PAGE_SIZE = 20;
const RISK_ORDER: Record<RiskLevel, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

type SortField = 'risk' | 'amount' | 'district' | 'status' | 'fy';
type SortDir = 'asc' | 'desc';

// ─── Risk-first sort ────────────────────────────────────────────────────────
function riskFirstSort(list: EnrichedProject[], sortField: SortField, sortDir: SortDir) {
  return [...list].sort((a, b) => {
    if (sortField === 'risk') {
      const levelDiff = RISK_ORDER[a.risk.level] - RISK_ORDER[b.risk.level];
      if (levelDiff !== 0) return levelDiff;
      return sortDir === 'asc' ? a.risk.score - b.risk.score : b.risk.score - a.risk.score;
    }
    let av: number | string = 0, bv: number | string = 0;
    switch (sortField) {
      case 'amount': av = a.sanctionAmount ?? 0; bv = b.sanctionAmount ?? 0; break;
      case 'district': av = a.district; bv = b.district; break;
      case 'status': av = a.workStatus; bv = b.workStatus; break;
      case 'fy': av = a.financialYear; bv = b.financialYear; break;
    }
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
    return sortDir === 'asc' ? (av - (bv as number)) : ((bv as number) - av);
  });
}

// ─── Pagination bar ──────────────────────────────────────────────────────────
function PaginationBar({
  page, totalPages, total, onPage,
}: { page: number; totalPages: number; total: number; onPage: (p: number) => void }) {
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
        <span className="font-semibold text-[#141d23]">{total}</span> projects
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-sm text-xs font-semibold text-[#44474f] hover:text-[#000a1f] hover:bg-[#e0e9f2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-[#E9ECEF]"
        >
          <ChevronLeft size={12} /> Previous
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-xs text-[#747780]">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={`w-7 h-7 rounded-sm text-xs font-semibold transition-colors ${
                p === page
                  ? 'bg-[#00204a] text-white'
                  : 'text-[#44474f] hover:bg-[#e0e9f2] border border-[#E9ECEF]'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages || totalPages === 0}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-sm text-xs font-semibold text-[#44474f] hover:text-[#000a1f] hover:bg-[#e0e9f2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-[#E9ECEF]"
        >
          Next <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Why Attention panel ─────────────────────────────────────────────────────
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
        No active risk indicators detected. This project appears within normal parameters.
      </div>
    );
  }
  return (
    <div className={`px-4 py-3 border-t ${
      project.risk.level === 'HIGH' ? 'bg-[#fde8e8] border-[#fca5a5]' :
      project.risk.level === 'MEDIUM' ? 'bg-[#fef3c7] border-[#fcd34d]' :
      'bg-[#d1fae5] border-[#6ee7b7]'
    }`}>
      <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{
        color: project.risk.level === 'HIGH' ? '#991b1b' : project.risk.level === 'MEDIUM' ? '#92400e' : '#065f46'
      }}>
        Risk Indicators · {project.risk.level} · Score {project.risk.score}
      </div>
      <ul className="space-y-1">
        {activeFactors.map(f => (
          <li key={f.id} className="flex items-start gap-2 text-[11px] text-[#141d23]">
            <span className="mt-0.5 flex-shrink-0" style={{
              color: f.severity === 'HIGH' ? '#DC3545' : '#FFC107'
            }}>→</span>
            <span><span className="font-semibold">{f.label}:</span> {f.description}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 text-[10px] text-[#747780]">
        * These are potential anomaly indicators requiring officer review — not determinations of misconduct.
      </div>
    </div>
  );
}

// ─── Status Pill ─────────────────────────────────────────────────────────────
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

// ─── Summary card ────────────────────────────────────────────────────────────
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

// ─── Main Component ──────────────────────────────────────────────────────────
export function SanctionedDrillDown() {
  const { projects, selectProject, setCurrentPage } = useAppStore();

  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [filterConstituency, setFilterConstituency] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFY, setFilterFY] = useState('');
  const [sortField, setSortField] = useState<SortField>('risk');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Only sanctioned works (have a sanctionAmount)
  const sanctionedProjects = useMemo(() =>
    projects.filter(p => p.isSanctioned),
    [projects]
  );

  // Filter options from sanctioned projects only
  const constituencies = useMemo(() =>
    Array.from(new Set(sanctionedProjects.map(p => p.constituency))).filter(Boolean).sort(),
    [sanctionedProjects]
  );
  const categories = useMemo(() =>
    Array.from(new Set(sanctionedProjects.map(p => p.workCategory))).filter(Boolean).sort(),
    [sanctionedProjects]
  );
  const statuses = useMemo(() =>
    Array.from(new Set(sanctionedProjects.map(p => p.workStatus))).filter(Boolean).sort(),
    [sanctionedProjects]
  );
  const financialYears = useMemo(() =>
    Array.from(new Set(sanctionedProjects.map(p => p.financialYear))).filter(Boolean).sort().reverse(),
    [sanctionedProjects]
  );

  // Summary stats
  const stats = useMemo(() => {
    const total = sanctionedProjects.length;
    const totalAmount = sanctionedProjects.reduce((s, p) => s + (p.sanctionAmount ?? 0), 0);
    const withAmount = sanctionedProjects.filter(p => p.sanctionAmount !== null);
    const avg = withAmount.length > 0 ? totalAmount / withAmount.length : 0;
    const highest = sanctionedProjects.reduce((max, p) =>
      (p.sanctionAmount ?? 0) > (max?.sanctionAmount ?? 0) ? p : max,
      null as EnrichedProject | null
    );
    const highRisk = sanctionedProjects.filter(p => p.risk.level === 'HIGH').length;
    return { total, totalAmount, avg, highest, highRisk };
  }, [sanctionedProjects]);

  const filtered = useMemo(() => {
    let list = [...sanctionedProjects];
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
    if (filterStatus) list = list.filter(p => p.workStatus === filterStatus);
    if (filterFY) list = list.filter(p => p.financialYear === filterFY);
    return riskFirstSort(list, sortField, sortDir);
  }, [sanctionedProjects, search, filterRisk, filterConstituency, filterCategory, filterStatus, filterFY, sortField, sortDir]);

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
    setFilterCategory(''); setFilterStatus(''); setFilterFY('');
    setPage(1);
  }, []);

  const hasFilters = search || filterRisk || filterConstituency || filterCategory || filterStatus || filterFY;

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

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#44474f] hover:text-[#005eb2] mb-2 transition-colors"
          >
            <ArrowLeft size={12} /> Command Center
          </button>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#6d28d9] mb-1 flex items-center gap-2">
            <DollarSign size={11} />
            Sanctioned Works Intelligence
          </p>
          <h1 className="text-2xl font-bold text-[#000a1f]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Sanctioned Amount — Deep Dive
          </h1>
          <p className="text-xs text-[#747780] mt-0.5">
            {stats.total} sanctioned projects ·{' '}
            <span className="text-[#DC3545] font-semibold">{stats.highRisk} high risk</span>
            {' '}· Sorted by risk priority
          </p>
        </div>
      </div>

      {/* ── Summary Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Sanctioned Amount"
          value={formatCurrency(stats.totalAmount)}
          sub={`Across ${stats.total} works`}
          color="#6d28d9"
          Icon={DollarSign}
        />
        <SummaryCard
          label="Total Sanctioned Works"
          value={stats.total.toLocaleString('en-IN')}
          sub="Sanctioned projects in dataset"
          color="#005eb2"
          Icon={FolderOpen}
        />
        <SummaryCard
          label="Average Sanctioned Amount"
          value={formatCurrency(stats.avg)}
          sub="Per sanctioned project"
          color="#0d9488"
          Icon={TrendingUp}
        />
        <SummaryCard
          label="High Risk Works"
          value={stats.highRisk.toLocaleString('en-IN')}
          sub={`${stats.total > 0 ? ((stats.highRisk / stats.total) * 100).toFixed(1) : 0}% of sanctioned portfolio`}
          color="#DC3545"
          Icon={AlertTriangle}
        />
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────── */}
      <div className="panel p-4">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal size={13} className="text-[#44474f]" />
          <span className="text-xs font-semibold text-[#44474f] uppercase tracking-wider">Filters</span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs font-semibold text-[#DC3545] hover:text-red-700 transition-colors"
            >
              <X size={12} /> Reset
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#747780]" />
            <input
              type="text"
              placeholder="Search by project ID, name, district, constituency, MP…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-2 bg-white border border-[#E9ECEF] rounded-sm text-sm text-[#141d23] placeholder-[#c4c6d0] focus:outline-none focus:border-[#6d28d9] focus:ring-1 focus:ring-[#6d28d9]/20"
            />
          </div>
          {[
            { label: 'Risk Level', value: filterRisk, setter: setFilterRisk, opts: ['HIGH', 'MEDIUM', 'LOW'] },
            { label: 'Constituency', value: filterConstituency, setter: setFilterConstituency, opts: constituencies.slice(0, 50) },
            { label: 'Category', value: filterCategory, setter: setFilterCategory, opts: categories.slice(0, 30) },
            { label: 'Status', value: filterStatus, setter: setFilterStatus, opts: statuses },
            { label: 'Financial Year', value: filterFY, setter: setFilterFY, opts: financialYears },
          ].map(({ label, value, setter, opts }) => (
            <select
              key={label}
              value={value}
              onChange={e => { setter(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-white border border-[#E9ECEF] rounded-sm text-xs text-[#141d23] focus:outline-none focus:border-[#6d28d9] max-w-44"
            >
              <option value="">{label}</option>
              {opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
        </div>
        {hasFilters && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] font-semibold text-[#6d28d9] uppercase tracking-wider">Filtered View</span>
            <span className="text-[10px] text-[#44474f]">· {filtered.length} results</span>
          </div>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
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
                <th
                  className="cursor-pointer hover:text-[#6d28d9] transition-colors"
                  onClick={() => toggleSort('amount')}
                >
                  <div className="flex items-center gap-1">
                    Sanctioned <ArrowUpDown size={10} />
                  </div>
                </th>
                <th>Disbursed</th>
                <th
                  className="cursor-pointer hover:text-[#6d28d9] transition-colors"
                  onClick={() => toggleSort('status')}
                >Status</th>
                <th
                  className="cursor-pointer hover:text-[#6d28d9] transition-colors"
                  onClick={() => toggleSort('fy')}
                >FY</th>
                <th
                  className="cursor-pointer hover:text-[#6d28d9] transition-colors"
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
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center text-[#747780] text-sm py-8">
                    No projects match the current filters.
                  </td>
                </tr>
              )}
              {paginated.map((p, i) => {
                const isExpanded = expandedRows.has(p.workId);
                const activeFactors = p.risk.factors.filter(f => f.available && f.severity !== 'LOW');
                return (
                  <React.Fragment key={p.workId}>
                    <tr
                      className="cursor-pointer hover:bg-[#F8F9FA] transition-colors"
                      onClick={() => openProject(p.workId)}
                    >
                      <td className="text-[#c4c6d0] text-xs font-mono">{(page - 1) * PAGE_SIZE + i + 1}</td>
                      <td>
                        <span className="font-mono text-xs text-[#6d28d9] font-semibold">
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
                      <td onClick={e => { e.stopPropagation(); toggleRow(p.workId); }}>
                        {activeFactors.length > 0 || p.risk.score > 0 ? (
                          <button
                            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-sm transition-colors whitespace-nowrap ${
                              p.risk.level === 'HIGH'
                                ? 'text-[#991b1b] bg-[#fde8e8] hover:bg-[#fca5a5]'
                                : p.risk.level === 'MEDIUM'
                                ? 'text-[#92400e] bg-[#fef3c7] hover:bg-[#fcd34d]'
                                : 'text-[#44474f] bg-[#F8F9FA] hover:bg-[#e0e9f2]'
                            }`}
                          >
                            WHY?
                            {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#c4c6d0]">—</span>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-transparent">
                        <td colSpan={11} className="p-0">
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

        <PaginationBar
          page={page}
          totalPages={totalPages}
          total={filtered.length}
          onPage={p => { setPage(p); setExpandedRows(new Set()); }}
        />
      </div>
    </div>
  );
}
