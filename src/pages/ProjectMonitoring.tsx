import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, ChevronLeft, ChevronRight, ArrowUpDown,
  X, SlidersHorizontal, FolderOpen
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
            {filtered.length} works · Click a row to open Project Intelligence Profile
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="panel p-4">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal size={13} className="text-[#44474f]" />
          <span className="text-xs font-semibold text-[#44474f] uppercase tracking-wider">Filters</span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs font-semibold text-[#DC3545] hover:text-red-700 transition-colors"
            >
              <X size={12} /> Clear all
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#747780]" />
            <input
              type="text"
              placeholder="Search works, ID, MP, district…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-2 bg-white border border-[#E9ECEF] rounded-sm text-sm text-[#141d23] placeholder-[#c4c6d0] focus:outline-none focus:border-[#005eb2] focus:ring-1 focus:ring-[#005eb2]/20"
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
              className="px-3 py-2 bg-white border border-[#E9ECEF] rounded-sm text-xs text-[#141d23] focus:outline-none focus:border-[#005eb2] max-w-40"
            >
              <option value="">{label}</option>
              {opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
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
                  className="cursor-pointer hover:text-[#005eb2] transition-colors"
                  onClick={() => toggleSort('amount')}
                >
                  <div className="flex items-center gap-1">
                    Sanction Amount <ArrowUpDown size={10} />
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
              </tr>
            </thead>
            <tbody>
              {paginated.map((p, i) => (
                <tr
                  key={p.workId}
                  className="cursor-pointer"
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
                      <div className="text-[#141d23] font-medium">{p.district}</div>
                      <div className="text-[#747780]">{p.constituency}</div>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E9ECEF] bg-[#F8F9FA]">
          <span className="text-xs text-[#747780]">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} works
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-sm text-[#44474f] hover:text-[#000a1f] hover:bg-[#e0e9f2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-[#44474f] font-semibold px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
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
