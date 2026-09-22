import React, { useEffect, useState, useMemo } from 'react';
import { PublicService } from '../../services/publicService';
import type { PublicMpItem } from '../../types/public';
import { MpAvatar } from '../../components/MpAvatar';
import {
  Users,
  Search,
  Filter,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Landmark,
  MapPin,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface PublicMpDirectoryProps {
  onNavigate: (path: string) => void;
}

export function PublicMpDirectory({ onNavigate }: PublicMpDirectoryProps) {
  const [mps, setMps] = useState<PublicMpItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(24);

  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [availableStates, setAvailableStates] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch MPs when page, search or state changes
  useEffect(() => {
    async function loadMps() {
      try {
        setLoading(true);
        setError(null);
        const res = await PublicService.getMps({
          page,
          pageSize,
          search: search.trim() || undefined,
          state: selectedState !== 'ALL' ? selectedState : undefined,
        });
        setMps(res.mps);
        setTotalCount(res.totalCount);
        setTotalPages(res.totalPages);
      } catch (err: any) {
        console.error('Failed to load MP directory:', err);
        setError(err.message || 'Unable to load MP directory');
      } finally {
        setLoading(false);
      }
    }
    loadMps();
  }, [page, selectedState, search]);

  // Fetch unique states for filter on mount
  useEffect(() => {
    async function loadFilterStates() {
      try {
        const res = await PublicService.getMps({ page: 1, pageSize: 100 });
        if (res?.mps) {
          const statesSet = new Set<string>();
          res.mps.forEach(m => {
            if (m.state) statesSet.add(m.state);
          });
          // Also fetch next pages or complete states
          const standardStates = [
            'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
            'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
            'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
            'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
            'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
            'Andaman And Nicobar Islands', 'Chandigarh', 'Dadra And Nagar Haveli And Daman And Diu',
            'Delhi', 'Jammu And Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
          ];
          setAvailableStates(standardStates.sort());
        }
      } catch (e) {}
    }
    loadFilterStates();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E9ECEF] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-[#005eb2] uppercase tracking-wider">
              Parliamentary Representatives
            </span>
          </div>
          <h1
            className="text-2xl font-bold text-[#000a1f]"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Lok Sabha Members of Parliament
          </h1>
          <p className="text-xs text-[#747780] mt-0.5">
            Dataset-driven directory of all 543 Lok Sabha representatives and their MPLADS works portfolio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-sm bg-[#e6eff8] border border-[#d2dbe4] text-xs font-semibold text-[#00204a]">
            {totalCount > 0 ? `${totalCount} MPs Found` : '543 Lok Sabha Constituencies'}
          </div>
        </div>
      </div>

      {/* ── Search & Filters Bar ──────────────────────────────── */}
      <div className="bg-white border border-[#E9ECEF] rounded-sm p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#747780]" />
          <input
            type="text"
            placeholder="Search by MP Name or Constituency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#E9ECEF] rounded-sm focus:outline-none focus:border-[#005eb2] bg-[#f8f9fa] focus:bg-white transition-colors"
          />
        </form>

        {/* State Filter */}
        <div className="w-full sm:w-64">
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs border border-[#E9ECEF] rounded-sm focus:outline-none focus:border-[#005eb2] bg-white cursor-pointer"
          >
            <option value="ALL">All States / UTs</option>
            {availableStates.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Reset */}
        {(search || selectedState !== 'ALL') && (
          <button
            onClick={() => {
              setSearch('');
              setSelectedState('ALL');
              setPage(1);
            }}
            className="text-xs text-[#DC3545] hover:underline font-semibold cursor-pointer whitespace-nowrap px-2"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* ── Loading / Error / Empty States ───────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <div className="w-9 h-9 border-3 border-[#005eb2] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-[#000a1f]">Loading Lok Sabha Representatives…</p>
          <p className="text-[11px] text-[#747780]">Connecting to official parliamentary directory records</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-white border border-rose-200 rounded-sm text-center max-w-lg mx-auto space-y-3">
          <AlertCircle size={28} className="text-[#DC3545] mx-auto" />
          <h3 className="text-sm font-bold text-[#000a1f]">Directory Error</h3>
          <p className="text-xs text-[#44474f]">{error}</p>
          <button
            onClick={() => setPage(1)}
            className="px-3 py-1.5 rounded-sm bg-[#005eb2] text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
          >
            <RefreshCw size={13} />
            <span>Retry</span>
          </button>
        </div>
      ) : mps.length === 0 ? (
        <div className="p-12 bg-white border border-[#E9ECEF] rounded-sm text-center max-w-lg mx-auto space-y-3">
          <Users size={36} className="text-[#747780] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-[#000a1f]">No Representatives Found</h3>
          <p className="text-xs text-[#747780]">
            No Lok Sabha MP records matched your search query or state filter.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedState('ALL');
              setPage(1);
            }}
            className="text-xs text-[#005eb2] font-semibold hover:underline cursor-pointer"
          >
            Clear filters and show all MPs
          </button>
        </div>
      ) : (
        /* ── Responsive MP Card Grid ────────────────────────── */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mps.map((mp) => (
              <div
                key={mp.id}
                className="bg-white border border-[#E9ECEF] rounded-sm p-4 hover:shadow-md hover:border-[#005eb2]/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <MpAvatar
                      name={mp.name}
                      id={mp.id}
                      photoUrl={mp.photoUrl}
                      size="lg"
                      className="ring-1 ring-[#E9ECEF] flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-[#000a1f] leading-snug group-hover:text-[#005eb2] transition-colors line-clamp-2">
                        {mp.name}
                      </h3>
                      <div className="mt-1 space-y-0.5 text-[11px] text-[#747780]">
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="text-[#747780] flex-shrink-0" />
                          <span className="font-semibold text-[#141d23] truncate">{mp.constituency}</span>
                        </div>
                        <p className="truncate pl-4">{mp.state}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E9ECEF] flex items-center justify-between text-[11px]">
                    <span className="text-[#747780]">Party:</span>
                    <span className="text-[#44474f] font-medium">{mp.party}</span>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-[#747780]">House:</span>
                    <span className="text-[#005eb2] font-semibold">{mp.house}</span>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-[#E9ECEF]">
                  <button
                    onClick={() => onNavigate(`/mp/${mp.mpId}`)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-sm bg-[#005eb2] hover:bg-[#004b8f] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <span>View Profile</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Pagination Controls ───────────────────────────── */}
          {totalPages > 1 && (
            <div className="bg-white border border-[#E9ECEF] rounded-sm p-3 flex items-center justify-between text-xs">
              <span className="text-[#747780]">
                Showing Page <strong className="text-[#141d23]">{page}</strong> of{' '}
                <strong className="text-[#141d23]">{totalPages}</strong> ({totalCount} total MPs)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-sm border border-[#E9ECEF] hover:bg-[#f6faff] disabled:opacity-40 disabled:pointer-events-none text-[#141d23] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded-sm border border-[#E9ECEF] hover:bg-[#f6faff] disabled:opacity-40 disabled:pointer-events-none text-[#141d23] font-medium flex items-center gap-1 cursor-pointer"
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
