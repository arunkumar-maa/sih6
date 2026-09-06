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
  } = useAppStore();

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

  // Apply pre-filter from GIS Map / drill-down navigation
  useEffect(() => {
    if (monitoringFilter) {
      if (monitoringFilter.house && monitoringFilter.house !== activeHouse) {
        setActiveHouse(monitoringFilter.house);
      }
      setFilters(f => ({
        ...f,
        house: monitoringFilter.house || activeHouse,
        tenure: (monitoringFilter.house || activeHouse) === 'Lok Sabha' ? '18th Lok Sabha' : 'Current Rajya Sabha',
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
        tenure: activeHouse === 'Lok Sabha' ? '18th Lok Sabha' : 'Current Rajya Sabha',
        state: '', constituency: '', mpName: '', riskLevel: '', status: '', category: '', search: '',
      }));
      setPage(1);
    }
  }, [activeHouse]);
  const [sortField, setSortField] = useState<SortField>('risk');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
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
  }, [projects, filters, sortField, sortDir]);

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

      {/* ── Official Filter Bar ───────────────────────────────────────── */}
      <div className="panel p-4">
        <OfficialFilterBar
          projects={projects}
          filteredProjects={filtered}
          filteredCount={filtered.length}
          totalCount={projects.length}
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
          exportFilename="Project_Monitoring"
          accentColor="#005eb2"
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
