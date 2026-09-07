import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Search, SlidersHorizontal, X, FileSpreadsheet,
  FileText, Printer, ChevronDown, Check, Download,
  AlertCircle, Info,
} from 'lucide-react';
import type { EnrichedProject, RiskLevel } from '../data/types';
import { useAppStore } from '../data/store';

export interface OfficialFilterState {
  search: string;
  house: 'Lok Sabha' | 'Rajya Sabha';
  tenure: string;
  state: string;
  constituency: string;
  mpName: string;
  riskLevel: string;
  status: string;
  category: string;
}

export interface OfficialFilterBarProps {
  /** Full house-specific dataset (LS or RS only — NEVER mixed) */
  projects: EnrichedProject[];
  /** The currently filtered subset — used for ALL exports */
  filteredProjects: EnrichedProject[];
  filteredCount: number;
  totalCount: number;
  filters: OfficialFilterState;
  onFilterChange: (filters: OfficialFilterState) => void;
  onReset: () => void;
  exportFilename?: string;
  statusOptions?: string[];
  categoryOptions?: string[];
  accentColor?: string;
  showExcel?: boolean;
  showCSV?: boolean;
  showPDF?: boolean;
}

// Toast for export feedback
function ExportToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3 bg-[#000a1f] text-white text-sm font-semibold rounded-lg shadow-2xl border border-[#005eb2] animate-fade-in">
      <Download size={15} className="text-[#4fc3f7]" />
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X size={13} /></button>
    </div>
  );
}

export function OfficialFilterBar({
  projects,
  filteredProjects,
  filteredCount,
  totalCount,
  filters,
  onFilterChange,
  onReset,
  exportFilename = 'MPLADS_Projects',
  statusOptions,
  categoryOptions,
  accentColor = '#005eb2',
  showExcel = true,
  showCSV = true,
  showPDF = true,
}: OfficialFilterBarProps) {
  const { setActiveHouse, isLoadingRajyaSabha, activeHouse, filterOptions, loadFilterOptions, isUsingSupabase } = useAppStore();

  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Toast state
  const [toast, setToast] = useState<string | null>(null);

  // Draft filters inside popover before clicking "Search"
  const [draft, setDraft] = useState<OfficialFilterState>(filters);

  // Sync draft when external filters change
  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  // Dynamically load options from Supabase when draft state changes
  useEffect(() => {
    if (draft.state) {
      loadFilterOptions(draft.state);
    }
  }, [draft.state, loadFilterOptions]);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setPopoverOpen(false);
      }
    }
    if (popoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverOpen]);

  // Dynamic lists from Supabase or fallback project data
  const states = useMemo(() => {
    if (filterOptions?.states && filterOptions.states.length > 0) return filterOptions.states;
    const s = new Set<string>();
    projects.forEach(p => { if (p.state) s.add(p.state); });
    return Array.from(s).sort();
  }, [projects, filterOptions?.states]);

  // Constituencies filtered by selected draft state
  const constituencies = useMemo(() => {
    if (filterOptions?.constituencies && filterOptions.constituencies.length > 0) return filterOptions.constituencies;
    const s = new Set<string>();
    projects.forEach(p => {
      if (draft.state && p.state !== draft.state) return;
      if (p.constituency) s.add(p.constituency);
    });
    return Array.from(s).sort();
  }, [projects, draft.state, filterOptions?.constituencies]);

  // MPs filtered by selected draft state & constituency
  const mps = useMemo(() => {
    if (filterOptions?.mps && filterOptions.mps.length > 0) return filterOptions.mps;
    const s = new Set<string>();
    projects.forEach(p => {
      if (draft.state && p.state !== draft.state) return;
      if (draft.constituency && p.constituency !== draft.constituency) return;
      if (p.mp) s.add(p.mp);
    });
    return Array.from(s).sort();
  }, [projects, draft.state, draft.constituency, filterOptions?.mps]);

  // Count active popover filters (excluding search and default house/tenure)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.state) count++;
    if (filters.constituency) count++;
    if (filters.mpName) count++;
    if (filters.tenure && filters.tenure !== '18th Lok Sabha' && filters.tenure !== 'Current Rajya Sabha' && filters.tenure !== 'All Tenures') count++;
    if (filters.riskLevel) count++;
    if (filters.status) count++;
    if (filters.category) count++;
    return count;
  }, [filters]);

  const hasAnyFilter = !!(filters.search || activeFilterCount > 0);

  // Export guard: must have at least one filter to export
  const canExport = hasAnyFilter && (filteredCount > 0 || filteredProjects.length > 0);

  const exportBlockedReason = !hasAnyFilter
    ? 'Apply at least one filter (State, Constituency, MP, Risk, etc.) before exporting'
    : (filteredCount === 0 && filteredProjects.length === 0)
    ? 'No records match the current filters'
    : null;

  // Handlers
  const handleHouseChange = (newHouse: 'Lok Sabha' | 'Rajya Sabha') => {
    const defaultTenure = newHouse === 'Lok Sabha' ? '18th Lok Sabha' : 'Current Rajya Sabha';
    const updated: OfficialFilterState = {
      ...filters,
      house: newHouse,
      tenure: defaultTenure,
      state: '',
      constituency: '',
      mpName: '',
      riskLevel: '',
      status: '',
      category: '',
      search: '',
    };
    // Switch global active house
    setActiveHouse(newHouse);
    onFilterChange(updated);
    onReset();
  };

  const handleApplySearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onFilterChange(draft);
    setPopoverOpen(false);
  };

  const handleResetFilters = () => {
    const resetState: OfficialFilterState = {
      search: '',
      house: filters.house,
      tenure: filters.house === 'Lok Sabha' ? '18th Lok Sabha' : 'Current Rajya Sabha',
      state: '',
      constituency: '',
      mpName: '',
      riskLevel: '',
      status: '',
      category: '',
    };
    setDraft(resetState);
    onFilterChange(resetState);
    onReset();
    setPopoverOpen(false);
  };

  const removeFilter = (key: keyof OfficialFilterState) => {
    const updated = { ...filters, [key]: '' };
    onFilterChange(updated);
  };

  // Helper to build intelligent export filename from active filters
  const buildSmartFilename = useCallback((ext: 'csv' | 'xlsx') => {
    const parts: string[] = ['MPLADS', filters.house.replace(/\s+/g, '_')];
    if (filters.state) parts.push(filters.state.replace(/\s+/g, '_'));
    if (filters.constituency) parts.push(filters.constituency.replace(/\s+/g, '_'));
    if (filters.mpName) parts.push(filters.mpName.replace(/\s+/g, '_').slice(0, 20));
    if (filters.riskLevel) parts.push(`${filters.riskLevel}_Risk`);
    if (filters.status) parts.push(filters.status.replace(/\s+/g, '_'));
    parts.push(new Date().toISOString().slice(0, 10));
    return `${parts.join('_')}.${ext}`;
  }, [exportFilename, filters]);

  const exportCSV = useCallback(async () => {
    if (!canExport) return;

    setToast('Preparing filtered export records from database…');
    try {
      let recordsToExport = filteredProjects;
      if (isUsingSupabase) {
        const { getFilteredProjectsForExport } = await import('../data/supabase/exportQueries');
        recordsToExport = await getFilteredProjectsForExport(activeHouse, {
          search: filters.search,
          state: filters.state,
          constituency: filters.constituency,
          mpName: filters.mpName,
          riskLevel: filters.riskLevel,
          status: filters.status,
          category: filters.category,
          tenure: filters.tenure,
        });
      }

      const headers = [
        'Work ID', 'Description', 'House', 'State', 'District', 'Constituency', 'MP',
        'Financial Year', 'Sanction Amount (INR)', 'Total Paid (INR)',
        'Status', 'Risk Score', 'Risk Level'
      ];
      const rows = recordsToExport.map(p => [
        `"${(p.workId || '').replace(/"/g, '""')}"`,
        `"${(p.workDescription || '').replace(/"/g, '""')}"`,
        `"${p.house}"`,
        `"${(p.state || '').replace(/"/g, '""')}"`,
        `"${(p.district || '').replace(/"/g, '""')}"`,
        `"${(p.constituency || '').replace(/"/g, '""')}"`,
        `"${(p.mp || '').replace(/"/g, '""')}"`,
        `"${p.financialYear || ''}"`,
        p.sanctionAmount ?? '',
        p.totalPaid ?? p.amountDisbursed ?? '',
        `"${p.workStatus || ''}"`,
        p.risk.score,
        p.risk.level,
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', buildSmartFilename('csv'));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setToast(`Downloaded ${recordsToExport.length.toLocaleString('en-IN')} ${filters.house} works as CSV`);
    } catch (err: any) {
      setToast(err.message || 'Export failed');
    }
  }, [canExport, isUsingSupabase, activeHouse, filters, filteredProjects, buildSmartFilename]);

  const exportExcel = useCallback(() => {
    if (!canExport) return;
    exportCSV();
    setToast(`Generating Excel export for ${filters.house} filtered works…`);
  }, [canExport, exportCSV, filters.house]);

  const exportPDF = useCallback(() => {
    if (!canExport) return;
    setToast(`Printing ${filters.house} filtered works — preparing print view…`);
    setTimeout(() => window.print(), 400);
  }, [canExport, filters.house]);

  return (
    <div className="space-y-3">
      {/* Export Toast */}
      {toast && <ExportToast message={toast} onClose={() => setToast(null)} />}

      {/* ── Top Row: Search Input + Floating Popover (Left) and House Toggle (Right) ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Search Input with Integrated Filter Trigger */}
        <div className="relative" ref={triggerRef}>
          <div
            className="flex items-center w-full sm:w-88 bg-white border border-slate-300 hover:border-slate-400 focus-within:border-[#0084ff] rounded-full shadow-sm px-4 py-2 transition-all cursor-pointer"
            onClick={() => setPopoverOpen(true)}
          >
            <input
              type="text"
              placeholder="Search MP, Constituency, Work ID..."
              value={filters.search}
              onChange={e => {
                const val = e.target.value;
                setDraft(prev => ({ ...prev, search: val }));
                onFilterChange({ ...filters, search: val });
              }}
              onClick={e => e.stopPropagation()}
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none min-w-0"
            />
            <div className="flex items-center gap-2 pl-2 flex-shrink-0">
              <Search
                size={17}
                className="text-slate-700 hover:text-[#0084ff] transition-colors cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  setPopoverOpen(prev => !prev);
                }}
              />
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setPopoverOpen(prev => !prev);
                }}
                className={`p-0.5 transition-colors relative cursor-pointer ${
                  popoverOpen || activeFilterCount > 0 ? 'text-[#0ea5e9]' : 'text-[#0d9488]'
                }`}
                title="Filter by Tenure, State, Constituency, MP"
              >
                <SlidersHorizontal size={17} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#0084ff] text-white text-[9px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ── Official Floating Filter Popover ─────────────────────────── */}
          {popoverOpen && (
            <div
              ref={popoverRef}
              className="absolute left-0 top-[calc(100%+8px)] z-50 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150"
              style={{ boxShadow: '0 12px 36px -4px rgba(0, 32, 74, 0.18)' }}
            >
              <form onSubmit={handleApplySearch} className="space-y-4">
                {/* Tenure */}
                <div>
                  <label className="block text-sm font-normal text-slate-600 mb-1.5">
                    Tenure
                  </label>
                  <select
                    value={draft.tenure}
                    onChange={e => setDraft(prev => ({ ...prev, tenure: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#0084ff] focus:ring-1 focus:ring-[#0084ff]/30 transition-all cursor-pointer"
                  >
                    {draft.house === 'Lok Sabha' ? (
                      <>
                        <option value="18th Lok Sabha">18th Lok Sabha</option>
                        <option value="17th Lok Sabha">17th Lok Sabha</option>
                        <option value="All Tenures">All Tenures</option>
                      </>
                    ) : (
                      <>
                        <option value="Current Rajya Sabha">Current Rajya Sabha</option>
                        <option value="All Tenures">All Tenures</option>
                      </>
                    )}
                  </select>
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-normal text-slate-600 mb-1.5">
                    State
                  </label>
                  <select
                    value={draft.state}
                    onChange={e => setDraft(prev => ({
                      ...prev,
                      state: e.target.value,
                      constituency: '', // reset child selection
                      mpName: '',
                    }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#0084ff] focus:ring-1 focus:ring-[#0084ff]/30 transition-all cursor-pointer"
                  >
                    <option value="">Please Select</option>
                    {states.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Constituency / Representation */}
                <div>
                  <label className="block text-sm font-normal text-slate-600 mb-1.5">
                    {draft.house === 'Rajya Sabha' ? 'Representation' : 'Constituency'}
                  </label>
                  <select
                    value={draft.constituency}
                    onChange={e => setDraft(prev => ({ ...prev, constituency: e.target.value, mpName: '' }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#0084ff] focus:ring-1 focus:ring-[#0084ff]/30 transition-all cursor-pointer"
                  >
                    <option value="">Please Select</option>
                    {constituencies.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* MP Name */}
                <div>
                  <label className="block text-sm font-normal text-slate-600 mb-1.5">
                    {filters.house === 'Rajya Sabha' ? 'Member of Rajya Sabha' : 'MP Name'}
                  </label>
                  <select
                    value={draft.mpName}
                    onChange={e => setDraft(prev => ({ ...prev, mpName: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#0084ff] focus:ring-1 focus:ring-[#0084ff]/30 transition-all cursor-pointer"
                  >
                    <option value="">Please Select</option>
                    {mps.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Risk Level */}
                <div>
                  <label className="block text-sm font-normal text-slate-600 mb-1.5">
                    Risk Level
                  </label>
                  <select
                    value={draft.riskLevel}
                    onChange={e => setDraft(prev => ({ ...prev, riskLevel: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#0084ff] focus:ring-1 focus:ring-[#0084ff]/30 transition-all cursor-pointer"
                  >
                    <option value="">Please Select</option>
                    <option value="HIGH">HIGH Risk Only</option>
                    <option value="MEDIUM">MEDIUM Risk Only</option>
                    <option value="LOW">LOW Risk Only</option>
                  </select>
                </div>

                {/* Status */}
                {statusOptions && statusOptions.length > 0 && (
                  <div>
                    <label className="block text-sm font-normal text-slate-600 mb-1.5">
                      Status
                    </label>
                    <select
                      value={draft.status}
                      onChange={e => setDraft(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#0084ff] focus:ring-1 focus:ring-[#0084ff]/30 transition-all cursor-pointer"
                    >
                      <option value="">Please Select</option>
                      {statusOptions.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Category */}
                {categoryOptions && categoryOptions.length > 0 && (
                  <div>
                    <label className="block text-sm font-normal text-slate-600 mb-1.5">
                      Category
                    </label>
                    <select
                      value={draft.category}
                      onChange={e => setDraft(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#0084ff] focus:ring-1 focus:ring-[#0084ff]/30 transition-all cursor-pointer"
                    >
                      <option value="">Please Select</option>
                      {categoryOptions.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Action Buttons: Reset & Search */}
                <div className="flex items-center justify-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-7 py-2 rounded-full bg-white border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2 rounded-full bg-[#0084ff] hover:bg-[#0074e0] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-95"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Lok Sabha / Rajya Sabha Toggle */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => handleHouseChange('Lok Sabha')}
            className={`px-5 py-2 text-sm font-bold transition-all rounded-lg ${
              filters.house === 'Lok Sabha'
                ? 'bg-[#0084ff] text-white shadow-sm'
                : 'text-slate-900 hover:text-[#0084ff] bg-transparent'
            }`}
          >
            Lok Sabha
          </button>
          <button
            type="button"
            onClick={() => handleHouseChange('Rajya Sabha')}
            disabled={isLoadingRajyaSabha}
            className={`px-5 py-2 text-sm font-bold transition-all rounded-lg relative ${
              filters.house === 'Rajya Sabha'
                ? 'bg-[#0084ff] text-white shadow-sm'
                : 'text-slate-900 hover:text-[#0084ff] bg-transparent'
            } disabled:opacity-60 disabled:cursor-wait`}
          >
            {isLoadingRajyaSabha && filters.house === 'Rajya Sabha' ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Loading…
              </span>
            ) : (
              'Rajya Sabha'
            )}
          </button>
        </div>
      </div>

      {/* ── Bottom Row: Active Filter Chips & Export Buttons ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        
        {/* Active Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 min-h-6">
          <span className="text-xs text-slate-500 font-medium mr-1">
            Showing <span className="font-semibold text-slate-900">{filteredCount.toLocaleString('en-IN')}</span> of{' '}
            <span>{totalCount.toLocaleString('en-IN')}</span>
          </span>

          {/* House badge always visible */}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#005eb2] text-white text-xs font-bold">
            {filters.house}
          </span>

          {filters.state && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e0e9f2] text-[#00204a] text-xs font-semibold">
              State: {filters.state}
              <button onClick={() => removeFilter('state')} className="hover:text-red-600 ml-0.5"><X size={11} /></button>
            </span>
          )}
          {filters.constituency && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e0e9f2] text-[#00204a] text-xs font-semibold">
              {filters.house === 'Rajya Sabha' ? 'Rep' : 'Const'}: {filters.constituency}
              <button onClick={() => removeFilter('constituency')} className="hover:text-red-600 ml-0.5"><X size={11} /></button>
            </span>
          )}
          {filters.mpName && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e0e9f2] text-[#00204a] text-xs font-semibold">
              MP: {filters.mpName.split(' ').slice(0, 2).join(' ')}
              <button onClick={() => removeFilter('mpName')} className="hover:text-red-600 ml-0.5"><X size={11} /></button>
            </span>
          )}
          {filters.riskLevel && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              filters.riskLevel === 'HIGH' ? 'bg-[#fde8e8] text-[#991b1b]' :
              filters.riskLevel === 'MEDIUM' ? 'bg-[#fef3c7] text-[#92400e]' : 'bg-[#d1fae5] text-[#065f46]'
            }`}>
              Risk: {filters.riskLevel}
              <button onClick={() => removeFilter('riskLevel')} className="hover:text-red-600 ml-0.5"><X size={11} /></button>
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e0e9f2] text-[#00204a] text-xs font-semibold">
              Status: {filters.status}
              <button onClick={() => removeFilter('status')} className="hover:text-red-600 ml-0.5"><X size={11} /></button>
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e0e9f2] text-[#00204a] text-xs font-semibold">
              Search: "{filters.search.slice(0, 20)}{filters.search.length > 20 ? '…' : ''}"
              <button onClick={() => removeFilter('search')} className="hover:text-red-600 ml-0.5"><X size={11} /></button>
            </span>
          )}

          {hasAnyFilter && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-red-600 hover:underline ml-1"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Export Buttons with guard */}
        {(showExcel || showCSV || showPDF) && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Export guard warning when no filter applied */}
            {!canExport && (showExcel || showCSV || showPDF) && (
              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 flex items-center gap-1 max-w-[180px]" title={exportBlockedReason ?? ''}>
                <AlertCircle size={11} className="flex-shrink-0" />
                Filter required to export
              </span>
            )}

            {showExcel && (
              <button
                type="button"
                onClick={exportExcel}
                disabled={!canExport}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold shadow-sm transition-all active:scale-95 ${
                  canExport
                    ? 'bg-[#0084ff] hover:bg-[#0074e0] text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                title={canExport ? `Export ${filteredCount.toLocaleString('en-IN')} filtered records to Excel` : exportBlockedReason ?? ''}
              >
                <FileSpreadsheet size={14} />
                Excel
              </button>
            )}
            {showCSV && (
              <button
                type="button"
                onClick={exportCSV}
                disabled={!canExport}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold shadow-sm transition-all active:scale-95 ${
                  canExport
                    ? 'bg-[#0084ff] hover:bg-[#0074e0] text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                title={canExport ? `Export ${filteredCount.toLocaleString('en-IN')} filtered records to CSV` : exportBlockedReason ?? ''}
              >
                CSV
              </button>
            )}
            {showPDF && (
              <button
                type="button"
                onClick={exportPDF}
                disabled={!canExport}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold shadow-sm transition-all active:scale-95 ${
                  canExport
                    ? 'bg-[#0084ff] hover:bg-[#0074e0] text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                title={canExport ? `Print ${filteredCount.toLocaleString('en-IN')} filtered records` : exportBlockedReason ?? ''}
              >
                <Printer size={14} />
                PDF
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
