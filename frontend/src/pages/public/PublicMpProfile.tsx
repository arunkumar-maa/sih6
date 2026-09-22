import React, { useEffect, useState } from 'react';
import { PublicService } from '../../services/publicService';
import type { PublicMpProfileResponse } from '../../types/public';
import { MpAvatar } from '../../components/MpAvatar';
import { formatCurrency } from '../../utils';
import {
  ArrowLeft,
  Landmark,
  MapPin,
  Calendar,
  Layers,
  Award,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderGit2,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface PublicMpProfileProps {
  mpId: string;
  onNavigate: (path: string) => void;
}

export function PublicMpProfile({ mpId, onNavigate }: PublicMpProfileProps) {
  const [data, setData] = useState<PublicMpProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);
        const res = await PublicService.getMpProfile(mpId);
        setData(res);
      } catch (err: any) {
        console.error('Failed to load MP profile:', err);
        setError(err.message || 'Unable to retrieve MP profile dossier');
      } finally {
        setLoading(false);
      }
    }
    if (mpId) {
      loadProfile();
    }
  }, [mpId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-10 h-10 border-3 border-[#005eb2] border-t-transparent rounded-full animate-spin mb-3" />
        <h3 className="text-sm font-bold text-[#000a1f]">Loading Representative Dossier…</h3>
        <p className="text-xs text-[#747780]">Aggregating verified Lok Sabha portfolio and public works records</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center bg-white border border-[#E9ECEF] rounded-sm space-y-4">
        <AlertCircle size={36} className="text-[#DC3545] mx-auto" />
        <h2 className="text-lg font-bold text-[#000a1f]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Representative Profile Not Found
        </h2>
        <p className="text-xs text-[#44474f]">
          {error || 'Unable to locate official Lok Sabha profile for the requested identifier.'}
        </p>
        <button
          onClick={() => onNavigate('/mps')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-[#005eb2] text-white text-xs font-semibold hover:bg-[#004b8f] cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Return to MP Directory</span>
        </button>
      </div>
    );
  }

  const { mpInfo, portfolioSummary, categoryBreakdown, districtBreakdown, attentionItems, recentWorks } = data;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* ── Navigation Top Bar ───────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/mps')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#44474f] hover:text-[#000a1f] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to MP Directory</span>
        </button>
        <span className="text-[11px] text-[#747780] font-mono">
          ID: {mpInfo.mpId}
        </span>
      </div>

      {/* ── Profile Header ───────────────────────────────────── */}
      <div className="bg-white border border-[#E9ECEF] rounded-sm p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Prominent MP Image */}
          <MpAvatar
            name={mpInfo.mpName}
            id={mpInfo.mpId}
            photoUrl={mpInfo.photoUrl}
            size="2xl"
            className="ring-2 ring-[#E9ECEF] shadow-sm flex-shrink-0"
          />

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#005eb2]/10 text-[#005eb2] text-[10px] font-bold uppercase tracking-wider">
              <Landmark size={12} />
              <span>House of the People · Lok Sabha</span>
            </div>

            <h1
              className="text-2xl sm:text-3xl font-extrabold text-[#000a1f] leading-snug"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {mpInfo.fullName}
            </h1>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#44474f]">
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-[#005eb2]" />
                <span className="font-semibold text-[#000a1f]">{mpInfo.constituency}</span>
              </div>
              <span>•</span>
              <span>{mpInfo.state}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar size={13} className="text-[#747780]" />
                <span>{mpInfo.tenure}</span>
              </div>
            </div>

            {/* Factual public metadata */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs">
              <div className="bg-[#f8f9fa] border border-[#E9ECEF] px-2.5 py-1 rounded-sm text-[11px]">
                <span className="text-[#747780]">Party Affiliation: </span>
                <strong className="text-[#141d23]">{mpInfo.party}</strong>
              </div>
              <div className="bg-[#f8f9fa] border border-[#E9ECEF] px-2.5 py-1 rounded-sm text-[11px]">
                <span className="text-[#747780]">Constituency: </span>
                <strong className="text-[#141d23]">{mpInfo.constituency} ({mpInfo.state})</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Portfolio Summary KPIs ───────────────────────────── */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-[#747780] uppercase tracking-wider">
          Parliamentary Portfolio Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white border border-[#E9ECEF] p-4 rounded-sm">
            <span className="text-[10px] uppercase font-bold text-[#747780] block">Total Works</span>
            <div className="text-xl font-bold text-[#000a1f] mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {portfolioSummary.totalWorks}
            </div>
            <span className="text-[10px] text-[#747780]">All recorded works</span>
          </div>

          <div className="bg-white border border-[#E9ECEF] p-4 rounded-sm">
            <span className="text-[10px] uppercase font-bold text-[#747780] block">Sanctioned</span>
            <div className="text-xl font-bold text-[#6d28d9] mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {formatCurrency(portfolioSummary.totalSanctioned)}
            </div>
            <span className="text-[10px] text-[#747780]">Total sanctioned</span>
          </div>

          <div className="bg-white border border-[#E9ECEF] p-4 rounded-sm">
            <span className="text-[10px] uppercase font-bold text-[#747780] block">Disbursed</span>
            <div className="text-xl font-bold text-[#0891b2] mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {formatCurrency(portfolioSummary.totalDisbursed)}
            </div>
            <span className="text-[10px] text-[#747780]">Cumulative paid</span>
          </div>

          <div className="bg-white border border-[#E9ECEF] p-4 rounded-sm">
            <span className="text-[10px] uppercase font-bold text-[#747780] block">Completed</span>
            <div className="text-xl font-bold text-[#198754] mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {portfolioSummary.completedCount}
            </div>
            <span className="text-[10px] text-[#747780]">Asset delivered</span>
          </div>

          <div className="bg-white border border-[#E9ECEF] p-4 rounded-sm">
            <span className="text-[10px] uppercase font-bold text-[#747780] block">Ongoing</span>
            <div className="text-xl font-bold text-[#d97706] mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {portfolioSummary.ongoingCount}
            </div>
            <span className="text-[10px] text-[#747780]">Active execution</span>
          </div>

          <div className="bg-white border border-[#E9ECEF] p-4 rounded-sm">
            <span className="text-[10px] uppercase font-bold text-[#747780] block">Completion Rate</span>
            <div className="text-xl font-bold text-[#005eb2] mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {portfolioSummary.avgProgress}%
            </div>
            <span className="text-[10px] text-[#747780]">Works completion</span>
          </div>
        </div>
      </div>

      {/* ── Category Breakdown & District Breakdown ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white border border-[#E9ECEF] rounded-sm p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#000a1f]">
              Works by Development Category
            </h3>
            <span className="text-[10px] text-[#747780]">
              {categoryBreakdown.length} Categories
            </span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <p className="text-xs text-[#747780] italic">No category breakdown available.</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.slice(0, 6).map((cat) => {
                const pct = portfolioSummary.totalSanctioned > 0
                  ? Math.round((cat.sanctioned / portfolioSummary.totalSanctioned) * 100)
                  : 0;

                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#141d23] truncate max-w-[240px]">
                        {cat.category}
                      </span>
                      <span className="text-[#747780] font-mono">
                        {cat.count} works ({formatCurrency(cat.sanctioned)})
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#f6faff] rounded-full overflow-hidden border border-[#E9ECEF]">
                      <div
                        className="h-full bg-[#005eb2] rounded-full"
                        style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* District Breakdown */}
        <div className="bg-white border border-[#E9ECEF] rounded-sm p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#000a1f]">
              District Distribution
            </h3>
            <span className="text-[10px] text-[#747780]">
              {districtBreakdown.length} Administrative Units
            </span>
          </div>

          {districtBreakdown.length === 0 ? (
            <p className="text-xs text-[#747780] italic">No district records available.</p>
          ) : (
            <div className="divide-y divide-[#E9ECEF]">
              {districtBreakdown.map((dist) => (
                <div key={dist.district} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-semibold text-[#141d23]">{dist.district}</h5>
                    <span className="text-[10px] text-[#747780]">
                      {dist.completed} of {dist.count} works completed
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#000a1f] block">
                      {formatCurrency(dist.sanctioned)}
                    </span>
                    <span className="text-[10px] text-[#0891b2]">
                      Paid: {formatCurrency(dist.disbursed)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Public Attention Indicators (Neutral Language) ────── */}
      {attentionItems.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-sm p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle size={16} />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Public Monitoring Attention Indicators
            </h3>
          </div>
          <p className="text-[11px] text-[#747780]">
            The following works display statistical indicators (e.g. expenditure or milestone progression delays) requiring standard administrative verification.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {attentionItems.map((item) => (
              <div
                key={item.workId}
                onClick={() => onNavigate(`/projects/${item.workId}`)}
                className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-sm hover:border-amber-400 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono text-[#005eb2] font-semibold">
                    {item.workId}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    {item.indicatorLabel}
                  </span>
                </div>
                <h5 className="text-xs font-semibold text-[#141d23] mt-1 line-clamp-2 group-hover:text-[#005eb2]">
                  {item.workDescription}
                </h5>
                <p className="text-[10px] text-[#747780] mt-1 italic">
                  {item.explanation}
                </p>
                <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[10px] text-[#44474f]">
                  <span>Sanction: {formatCurrency(item.sanctionAmount)}</span>
                  <span className="text-[#005eb2] font-semibold group-hover:underline">
                    View Project →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Works ─────────────────────────────────────── */}
      <div className="bg-white border border-[#E9ECEF] rounded-sm p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#000a1f]">
              Recent Parliamentary Works
            </h3>
            <p className="text-[11px] text-[#747780]">
              Latest sanctioned works under {mpInfo.mpName}'s constituency allocation
            </p>
          </div>
          <button
            onClick={() => onNavigate(`/projects?mpName=${encodeURIComponent(mpInfo.mpName)}`)}
            className="text-xs font-semibold text-[#005eb2] hover:underline cursor-pointer"
          >
            Explore All MP Works →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f8f9fa] border-b border-[#E9ECEF] text-[10px] font-bold uppercase text-[#747780]">
              <tr>
                <th className="py-2.5 px-3">Work ID</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Financial Year</th>
                <th className="py-2.5 px-3 text-right">Sanction Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECEF]">
              {recentWorks.map((work) => (
                <tr key={work.workId} className="hover:bg-[#f6faff] transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[#005eb2] font-semibold whitespace-nowrap">
                    {work.workId}
                  </td>
                  <td className="py-2.5 px-3 max-w-xs truncate font-medium text-[#141d23]" title={work.workDescription}>
                    {work.workDescription}
                  </td>
                  <td className="py-2.5 px-3 text-[#44474f] whitespace-nowrap">
                    {work.workCategory}
                  </td>
                  <td className="py-2.5 px-3 text-[#747780] whitespace-nowrap font-mono">
                    {work.financialYear}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#000a1f] whitespace-nowrap">
                    {formatCurrency(work.sanctionAmount)}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                        work.isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {work.workStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => onNavigate(`/projects/${work.workId}`)}
                      className="px-2 py-1 rounded-sm bg-[#005eb2] hover:bg-[#004b8f] text-white text-[11px] font-medium cursor-pointer"
                    >
                      View Project
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
