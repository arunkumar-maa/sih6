import React, { useState, useEffect, useCallback } from 'react';
import {
  History, Search, Filter, ArrowLeft, RefreshCw,
  Scale, FileText, CheckCircle2, ShieldAlert, Eye,
  ChevronLeft, ChevronRight, AlertCircle, Download
} from 'lucide-react';
import { formatDate } from '../utils';
import { getAuditorAuditTrail, AuditTrailRecord } from '../services/auditorService';
import { AuditorCaseFileModal } from '../components/AuditorCaseFileModal';
import { useAppStore } from '../store/store';

export function AuditTrailPage() {
  const { setCurrentPage } = useAppStore();

  const [house, setHouse] = useState<'Lok Sabha' | 'Rajya Sabha' | ''>('');
  const [action, setAction] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  const [records, setRecords] = useState<AuditTrailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  const [inspectingWorkId, setInspectingWorkId] = useState<{ workId: string; house: 'Lok Sabha' | 'Rajya Sabha' } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadAuditTrail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAuditorAuditTrail({
        page,
        pageSize,
        house: house || undefined,
        action: action !== 'all' ? action : undefined,
        search: debouncedSearch || undefined,
      });
      setRecords(res.records);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      console.error('[AuditTrailPage] Error loading audit trail:', err);
      setError(err.message || 'Unable to load audit trail events.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, house, action, debouncedSearch]);

  useEffect(() => {
    loadAuditTrail();
  }, [loadAuditTrail]);

  return (
    <div className="w-full space-y-6 pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 p-6 rounded-2xl border border-purple-800/40 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest">
            <History className="w-4 h-4" />
            <span>Immutable Governance Record</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Audit Trail &amp; Verification Ledger
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Tamper-evident audit log preserving every officer review, inspection request, verification finding, and decision timestamp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadAuditTrail()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* Filter controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Work ID, Officer, Remarks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Chamber / House */}
          <select
            value={house}
            onChange={e => { setHouse(e.target.value as any); setPage(1); }}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none cursor-pointer"
          >
            <option value="">All Houses</option>
            <option value="Lok Sabha">Lok Sabha</option>
            <option value="Rajya Sabha">Rajya Sabha</option>
          </select>

          {/* Action Filter */}
          <select
            value={action}
            onChange={e => { setAction(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">All Actions</option>
            <option value="VERIFICATION_STATUS_UPDATED">Verification Status Updates</option>
            <option value="INSPECTION_REQUESTED">Inspection Orders</option>
            <option value="REVIEW_NOTE_ADDED">Review Notes</option>
          </select>
        </div>

        <div className="text-slate-400 text-xs">
          Total Logged Events: <strong className="text-white">{totalCount.toLocaleString()}</strong>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-xs">Querying immutable audit ledger…</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-rose-400 text-xs">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
            {error}
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No audit trail records found matching the active criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090d16] text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Work ID</th>
                  <th className="py-3 px-4">House</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Transition</th>
                  <th className="py-3 px-4">Observation / Remarks</th>
                  <th className="py-3 px-4 text-right">Case File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {records.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(rec.created_at).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono text-purple-300 font-bold">
                      {rec.work_id}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {rec.house}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{rec.actor_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{rec.actor_role}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white">{rec.action}</span>
                    </td>
                    <td className="py-3 px-4">
                      {rec.new_status ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                          {rec.previous_status ? `${rec.previous_status} → ` : ''}{rec.new_status}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-sm text-slate-300 truncate" title={rec.comment || rec.reason || ''}>
                      {rec.comment || rec.reason || <span className="text-slate-600 italic">No notes</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setInspectingWorkId({ workId: rec.work_id, house: rec.house as any })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-slate-800 bg-[#090d16] flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{Math.min(totalCount, (page - 1) * pageSize + 1)}</strong> to{' '}
            <strong className="text-white">{Math.min(totalCount, page * pageSize)}</strong> of{' '}
            <strong className="text-white">{totalCount.toLocaleString()}</strong> events
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <span className="px-2 font-mono font-bold text-white">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {inspectingWorkId && (
        <AuditorCaseFileModal
          workId={inspectingWorkId.workId}
          house={inspectingWorkId.house}
          onClose={() => setInspectingWorkId(null)}
          onStatusUpdated={() => loadAuditTrail()}
        />
      )}
    </div>
  );
}
