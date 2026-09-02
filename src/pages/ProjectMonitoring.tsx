import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown,
  X, ExternalLink, SlidersHorizontal
} from 'lucide-react';
import { useAppStore } from '../data/store';
import { RiskBadge } from '../components/RiskBadge';
import { formatCurrency, truncate } from '../utils';
import type { EnrichedProject } from '../data/types';
import { ProjectIntelligenceView } from './ProjectIntelligenceView';

const PAGE_SIZE = 20;

type SortField = 'risk' | 'amount' | 'district' | 'status' | 'fy';
type SortDir = 'asc' | 'desc';

export function ProjectMonitoring() {
  const { projects, selectedProjectId, selectProject } = useAppStore();

  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [filterConstituency, setFilterConstituency] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFY, setFilterFY] = useState('');
  const [sortField, setSortField] = useState<SortField>('risk');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const constituencies = useMemo(() =>
    Array.from(new Set(projects.map(p => p.constituency))).sort(), [projects]);
  const categories = useMemo(() =>
    Array.from(new Set(projects.map(p => p.workCategory))).filter(Boolean).sort(), [projects]);
  const statuses = useMemo(() =>
    Array.from(new Set(projects.map(p => p.workStatus))).sort(), [projects]);
  const financialYears = useMemo(() =>
    Array.from(new Set(projects.map(p => p.financialYear))).sort().reverse(), [projects]);

  const filtered = useMemo(() => {
    let list = [...projects];
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

    list.sort((a, b) => {
      let av: number | string = 0, bv: number | string = 0;
      switch (sortField) {
        case 'risk': av = a.risk.score; bv = b.risk.score; break;
        case 'amount': av = a.sanctionAmount ?? 0; bv = b.sanctionAmount ?? 0; break;
        case 'district': av = a.district; bv = b.district; break;
        case 'status': av = a.workStatus; bv = b.workStatus; break;
        case 'fy': av = a.financialYear; bv = b.financialYear; break;
      }
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortDir === 'asc' ? (av - (bv as number)) : ((bv as number) - av);
    });
    return list;
  }, [projects, search, filterRisk, filterConstituency, filterCategory, filterStatus, filterFY, sortField, sortDir]);

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

  const clearFilters = () => {
    setSearch(''); setFilterRisk(''); setFilterConstituency('');
    setFilterCategory(''); setFilterStatus(''); setFilterFY('');
    setPage(1);
  };

  const hasFilters = search || filterRisk || filterConstituency || filterCategory || filterStatus || filterFY;

  const selectedProject = selectedProjectId ? projects.find(p => p.workId === selectedProjectId) : null;

  if (selectedProject) {
    return <ProjectIntelligenceView project={selectedProject} onBack={() => selectProject(null)} />;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Project Monitoring</h1>
          <p className="text-xs text-slate-500">{filtered.length} works · Click a row to open Project Intelligence</p>
        </div>
      </div>

      {/* Filters */}
      <div className="panel p-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search works, ID, MP, district..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-1.5 bg-[#0a1628] border border-[#1e3f7a] rounded-md text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-600"
            />
          </div>

          {[
            { label: 'Risk Level', value: filterRisk, setter: setFilterRisk, opts: ['HIGH', 'MEDIUM', 'LOW'] },
            { label: 'Constituency', value: filterConstituency, setter: setFilterConstituency, opts: constituencies.slice(0, 40) },
            { label: 'Category', value: filterCategory, setter: setFilterCategory, opts: categories.slice(0, 30) },
            { label: 'Status', value: filterStatus, setter: setFilterStatus, opts: statuses },
            { label: 'Fin. Year', value: filterFY, setter: setFilterFY, opts: financialYears },
          ].map(({ label, value, setter, opts }) => (
            <select
              key={label}
              value={value}
              onChange={e => { setter(e.target.value); setPage(1); }}
              className="px-2 py-1.5 bg-[#0a1628] border border-[#1e3f7a] rounded-md text-xs text-slate-300 focus:outline-none focus:border-blue-600 max-w-36"
            >
              <option value="">{label}</option>
              {opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}

          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 px-2 py-1.5">
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th className="w-8">#</th>
                <th>Work ID</th>
                <th>Description</th>
                <th>District · Constituency</th>
                <th
                  className="cursor-pointer hover:text-blue-400"
                  onClick={() => toggleSort('amount')}
                >
                  <div className="flex items-center gap-1">
                    Sanction Amount <ArrowUpDown size={10} />
                  </div>
                </th>
                <th>Disbursed</th>
                <th
                  className="cursor-pointer hover:text-blue-400"
                  onClick={() => toggleSort('status')}
                >
                  Status
                </th>
                <th
                  className="cursor-pointer hover:text-blue-400"
                  onClick={() => toggleSort('fy')}
                >
                  FY
                </th>
                <th
                  className="cursor-pointer hover:text-blue-400"
                  onClick={() => toggleSort('risk')}
                >
                  <div className="flex items-center gap-1">
                    Risk <ArrowUpDown size={10} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p, i) => (
                <tr
                  key={p.workId}
                  className="cursor-pointer"
                  onClick={() => selectProject(p.workId)}
                >
                  <td className="text-slate-600 text-xs font-mono">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td>
                    <span className="font-mono text-xs text-blue-400">
                      {p.workId.split('/').slice(0, 3).join('/')}
                    </span>
                  </td>
                  <td>
                    <div className="max-w-xs">
                      <div className="text-sm text-white font-medium truncate">
                        {truncate(p.workDescription || 'No description', 55)}
                      </div>
                      <div className="text-[10px] text-slate-600 truncate">{truncate(p.workCategory, 45)}</div>
                    </div>
                  </td>
                  <td>
                    <div className="text-xs">
                      <div className="text-slate-300">{p.district}</div>
                      <div className="text-slate-600">{p.constituency}</div>
                    </div>
                  </td>
                  <td className="text-sm font-medium text-slate-200">
                    {formatCurrency(p.sanctionAmount)}
                  </td>
                  <td className="text-sm text-slate-400">
                    {formatCurrency(p.totalPaid)}
                  </td>
                  <td>
                    <StatusPill status={p.workStatus} />
                  </td>
                  <td className="text-xs font-mono text-slate-500">{p.financialYear}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <RiskBadge level={p.risk.level} size="sm" />
                      <span className="text-xs font-bold" style={{
                        color: p.risk.level === 'HIGH' ? '#ef4444' : p.risk.level === 'MEDIUM' ? '#f59e0b' : '#10b981'
                      }}>
                        {p.risk.score}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e3f7a]">
          <span className="text-xs text-slate-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#1e3f7a] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-slate-400 px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#1e3f7a] disabled:opacity-40 disabled:cursor-not-allowed"
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
    'Work Completed': 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50',
    'Work In Progress': 'text-blue-400 bg-blue-900/30 border-blue-800/50',
    'Physical Inspection': 'text-cyan-400 bg-cyan-900/30 border-cyan-800/50',
    'Vendor Identification': 'text-amber-400 bg-amber-900/30 border-amber-800/50',
    'Sanction': 'text-slate-400 bg-slate-900/30 border-slate-700/50',
    'Unknown': 'text-slate-600 bg-transparent border-slate-800/30',
  };
  const cls = configs[status] ?? configs['Unknown'];
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${cls}`}>
      {status}
    </span>
  );
}
