import React, { useEffect, useState } from 'react';
import { PublicService } from '../../services/publicService';
import type { PublicProjectItem } from '../../types/public';
import { formatCurrency } from '../../utils';
import {
  FolderGit2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

interface PublicProjectExplorerProps {
  onNavigate: (path: string) => void;
}

export function PublicProjectExplorer({ onNavigate }: PublicProjectExplorerProps) {
  const [projects, setProjects] = useState<PublicProjectItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  // Filters
  const [search, setSearch] = useState('');
  const [state, setState] = useState('ALL');
  const [district, setDistrict] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [financialYear, setFinancialYear] = useState('ALL');
  const [sortBy, setSortBy] = useState('sanction_amount');
  const [sortOrder, setSortOrder] = useState('desc');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Standard filter options
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
    'Irrigation Facilities',
    'Non-Conventional Energy Sources',
    'Roads, Pathways and Bridges',
    'Sanitation and Community Facilities',
    'Sports',
    'Other Public Facilities',
  ];

  const standardFYs = [
    '2025-2026', '2024-2025', '2023-2024', '2022-2023', '2021-2022', '2020-2021', '2019-2020'
  ];

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        setError(null);
        const res = await PublicService.getProjects({
          page,
          pageSize,
          search: search.trim() || undefined,
          state: state !== 'ALL' ? state : undefined,
          district: district !== 'ALL' ? district : undefined,
          status: status !== 'ALL' ? status : undefined,
          category: category !== 'ALL' ? category : undefined,
          financialYear: financialYear !== 'ALL' ? financialYear : undefined,
          sortBy,
          sortOrder,
        });

        setProjects(res.projects);
        setTotalCount(res.totalCount);
        setTotalPages(res.totalPages);
      } catch (err: any) {
        console.error('Failed to query public projects:', err);
        setError(err.message || 'Unable to fetch projects');
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [page, state, status, category, financialYear, sortBy, sortOrder, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleReset = () => {
    setSearch('');
    setState('ALL');
    setDistrict('ALL');
    setStatus('ALL');
    setCategory('ALL');
    setFinancialYear('ALL');
    setPage(1);
  };

  const isFiltered = search || state !== 'ALL' || status !== 'ALL' || category !== 'ALL' || financialYear !== 'ALL';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E9ECEF] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-[#005eb2] uppercase tracking-wider">
              Public Works Explorer
            </span>
          </div>
          <h1
            className="text-2xl font-bold text-[#000a1f]"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Lok Sabha MPLADS Projects
          </h1>
          <p className="text-xs text-[#747780] mt-0.5">
            Search and inspect sanctioned public works, expenditure progress, and execution milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-sm bg-[#e6eff8] border border-[#d2dbe4] text-xs font-semibold text-[#00204a]">
            {totalCount.toLocaleString('en-IN')} Works Found
          </div>
        </div>
      </div>

      {/* ── Filter Controls Bar ───────────────────────────────── */}
      <div className="bg-white border border-[#E9ECEF] rounded-sm p-4 shadow-xs space-y-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#747780]" />
            <input
              type="text"
              placeholder="Search by Work ID, Project Description, MP Name, or Constituency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#E9ECEF] rounded-sm focus:outline-none focus:border-[#005eb2] bg-[#f8f9fa] focus:bg-white transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#005eb2] hover:bg-[#004b8f] text-white text-xs font-semibold rounded-sm cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
          {/* State */}
          <div>
            <label className="text-[10px] font-bold text-[#747780] uppercase block mb-1">State / UT</label>
            <select
              value={state}
              onChange={(e) => { setState(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 text-xs border border-[#E9ECEF] rounded-sm bg-white"
            >
              <option value="ALL">All States</option>
              {standardStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] font-bold text-[#747780] uppercase block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 text-xs border border-[#E9ECEF] rounded-sm bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Recommended">Recommended</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] font-bold text-[#747780] uppercase block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 text-xs border border-[#E9ECEF] rounded-sm bg-white"
            >
              <option value="ALL">All Categories</option>
              {standardCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Financial Year */}
          <div>
            <label className="text-[10px] font-bold text-[#747780] uppercase block mb-1">Financial Year</label>
            <select
              value={financialYear}
              onChange={(e) => { setFinancialYear(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 text-xs border border-[#E9ECEF] rounded-sm bg-white"
            >
              <option value="ALL">All Financial Years</option>
              {standardFYs.map(fy => <option key={fy} value={fy}>FY {fy}</option>)}
            </select>
          </div>

          {/* Sort */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <label className="text-[10px] font-bold text-[#747780] uppercase block mb-1">Sort By</label>
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('_');
                setSortBy(sb);
                setSortOrder(so);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs border border-[#E9ECEF] rounded-sm bg-white"
            >
              <option value="sanction_amount_desc">Sanction Amount (High to Low)</option>
              <option value="sanction_amount_asc">Sanction Amount (Low to High)</option>
              <option value="total_paid_desc">Expenditure (High to Low)</option>
              <option value="sanction_date_desc">Latest Sanction Date</option>
            </select>
          </div>
        </div>

        {/* Reset filter trigger */}
        {isFiltered && (
          <div className="pt-2 border-t border-[#E9ECEF] flex items-center justify-between text-xs">
            <span className="text-[#747780]">Active filters applied</span>
            <button
              onClick={handleReset}
              className="text-[#DC3545] hover:underline font-semibold cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* ── Results Table / Cards ─────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <div className="w-9 h-9 border-3 border-[#005eb2] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-[#000a1f]">Loading Lok Sabha Works…</p>
          <p className="text-[11px] text-[#747780]">Running server-side filtered database query</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-white border border-rose-200 rounded-sm text-center max-w-lg mx-auto space-y-3">
          <AlertCircle size={28} className="text-[#DC3545] mx-auto" />
          <h3 className="text-sm font-bold text-[#000a1f]">Query Error</h3>
          <p className="text-xs text-[#44474f]">{error}</p>
          <button
            onClick={() => setPage(1)}
            className="px-3 py-1.5 rounded-sm bg-[#005eb2] text-white text-xs font-semibold cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 bg-white border border-[#E9ECEF] rounded-sm text-center max-w-lg mx-auto space-y-3">
          <FolderGit2 size={36} className="text-[#747780] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-[#000a1f]">No Projects Matched</h3>
          <p className="text-xs text-[#747780]">
            No public works found matching your filter criteria.
          </p>
          <button
            onClick={handleReset}
            className="text-xs text-[#005eb2] font-semibold hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-[#E9ECEF] rounded-sm overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f8f9fa] border-b border-[#E9ECEF] text-[10px] font-bold uppercase text-[#747780]">
                  <tr>
                    <th className="py-3 px-3.5">Work ID & Description</th>
                    <th className="py-3 px-3.5">Constituency / State</th>
                    <th className="py-3 px-3.5">Hon'ble MP</th>
                    <th className="py-3 px-3.5">Category</th>
                    <th className="py-3 px-3.5 text-right">Sanction Amount</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9ECEF]">
                  {projects.map((p) => (
                    <tr key={p.workId} className="hover:bg-[#f6faff] transition-colors">
                      <td className="py-3 px-3.5 max-w-sm">
                        <span className="font-mono text-[#005eb2] font-semibold block text-[11px]">
                          {p.workId}
                        </span>
                        <h4 className="font-semibold text-[#141d23] line-clamp-2 mt-0.5" title={p.workDescription}>
                          {p.workDescription}
                        </h4>
                        {p.attentionIndicator.level !== 'NONE' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-sm mt-1">
                            <AlertTriangle size={10} />
                            <span>{p.attentionIndicator.label}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-medium text-[#141d23]">{p.constituency}</div>
                        <div className="text-[11px] text-[#747780]">{p.state}</div>
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap font-medium text-[#44474f]">
                        {p.mp}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap text-[#44474f]">
                        <div>{p.workCategory}</div>
                        <div className="text-[10px] font-mono text-[#747780]">FY {p.financialYear}</div>
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="font-bold text-[#000a1f]">{formatCurrency(p.sanctionAmount)}</div>
                        <div className="text-[10px] text-[#0891b2]">Paid: {formatCurrency(p.amountDisbursed)}</div>
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
                          className="px-2.5 py-1 rounded-sm bg-[#005eb2] hover:bg-[#004b8f] text-white text-xs font-medium cursor-pointer shadow-xs transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Pagination ─────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="bg-white border border-[#E9ECEF] rounded-sm p-3.5 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
              <span className="text-[#747780]">
                Page <strong className="text-[#141d23]">{page}</strong> of{' '}
                <strong className="text-[#141d23]">{totalPages}</strong> ({totalCount.toLocaleString('en-IN')} total projects)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded-sm border border-[#E9ECEF] hover:bg-[#f6faff] disabled:opacity-40 disabled:pointer-events-none text-[#141d23] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 rounded-sm border border-[#E9ECEF] hover:bg-[#f6faff] disabled:opacity-40 disabled:pointer-events-none text-[#141d23] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
