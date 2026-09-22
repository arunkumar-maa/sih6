import React, { useEffect, useState } from 'react';
import { PublicService } from '../../services/publicService';
import { formatCurrency } from '../../utils';
import {
  BarChart3,
  Layers,
  Award,
  Activity,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  PieChart as PieChartIcon,
} from 'lucide-react';

interface PublicAnalyticsPageProps {
  onNavigate: (path: string) => void;
}

export function PublicAnalyticsPage({ onNavigate }: PublicAnalyticsPageProps) {
  const [data, setData] = useState<any | null>(null);
  const [kpis, setKpis] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError(null);
        const [analyticsRes, kpiRes] = await Promise.all([
          PublicService.getAnalytics(),
          PublicService.getKpis(),
        ]);
        setData(analyticsRes);
        setKpis(kpiRes);
      } catch (err: any) {
        console.error('Failed to load public analytics:', err);
        setError(err.message || 'Unable to retrieve analytics observatory');
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-10 h-10 border-3 border-[#005eb2] border-t-transparent rounded-full animate-spin mb-3" />
        <h3 className="text-sm font-bold text-[#000a1f]">Computing Public Macro Analytics…</h3>
        <p className="text-xs text-[#747780]">Running server-side aggregations across verified Lok Sabha works</p>
      </div>
    );
  }

  const categoryBreakdown: any[] = data?.categoryBreakdown || [];
  const statusBreakdown: any[] = data?.statusBreakdown || [];
  const financialYearTrends: any[] = data?.financialYearTrends || [];
  const districtRisk: any[] = data?.districtRisk || [];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="border-b border-[#E9ECEF] pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold text-[#005eb2] uppercase tracking-wider">
            Public Performance Observatory
          </span>
        </div>
        <h1
          className="text-2xl font-bold text-[#000a1f]"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          National MPLADS Public Analytics
        </h1>
        <p className="text-xs text-[#747780] mt-0.5">
          Factual descriptive aggregates across Lok Sabha works, financial commitments, execution statuses, and development categories.
        </p>
      </div>

      {/* ── Non-Partisan Transparency Banner ─────────────────── */}
      <div className="bg-[#f8f9fa] border border-[#E9ECEF] p-4 rounded-sm flex items-start gap-3">
        <ShieldCheck size={18} className="text-[#198754] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-[#44474f] space-y-0.5">
          <p className="font-semibold text-[#000a1f]">Objective Factual Reporting</p>
          <p className="text-[11px] text-[#747780]">
            This portal does not maintain political scorecards, cross-representative rankings, or competitive leaderboards. All charts display purely objective administrative aggregates published by MoSPI.
          </p>
        </div>
      </div>

      {/* ── Macro KPIs ───────────────────────────────────────── */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="bg-white border border-[#E9ECEF] p-4 rounded-sm">
            <span className="text-[10px] uppercase font-bold text-[#747780] block">Total Works</span>
            <div className="text-2xl font-extrabold text-[#000a1f] mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {kpis.totalWorks.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-[#747780]">Sanctioned records</span>
          </div>

          <div className="bg-white border border-[#E9ECEF] p-4 rounded-sm">
            <span className="text-[10px] uppercase font-bold text-[#747780] block">Sanctioned</span>
            <div className="text-2xl font-extrabold text-[#6d28d9] mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {formatCurrency(kpis.totalSanctionedAmount)}
            </div>
            <span className="text-[10px] text-[#747780]">Allocated funds</span>
          </div>

          <div className="bg-white border border-[#E9ECEF] p-4 rounded-sm">
            <span className="text-[10px] uppercase font-bold text-[#747780] block">Disbursed</span>
            <div className="text-2xl font-extrabold text-[#0891b2] mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {formatCurrency(kpis.totalDisbursedAmount)}
            </div>
            <span className="text-[10px] text-[#747780]">Total expenditure</span>
          </div>

          <div className="bg-white border border-[#E9ECEF] p-4 rounded-sm">
            <span className="text-[10px] uppercase font-bold text-[#747780] block">Completed Works</span>
            <div className="text-2xl font-extrabold text-[#198754] mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {kpis.completedWorks.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-[#747780]">Delivered infrastructure</span>
          </div>

          <div className="bg-white border border-[#E9ECEF] p-4 rounded-sm col-span-2 md:col-span-1">
            <span className="text-[10px] uppercase font-bold text-[#747780] block">Ongoing Works</span>
            <div className="text-2xl font-extrabold text-[#d97706] mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {kpis.ongoingWorks.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-[#747780]">Under implementation</span>
          </div>
        </div>
      )}

      {/* ── Grid: Category & Status Distributions ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white border border-[#E9ECEF] rounded-sm p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#000a1f]">
              Works by Development Category
            </h3>
            <span className="text-[10px] text-[#747780]">Sanctioned Value</span>
          </div>

          <div className="space-y-3 pt-2">
            {categoryBreakdown.slice(0, 8).map((cat: any) => {
              const maxSanction = categoryBreakdown[0]?.sanctioned || 1;
              const pct = Math.round(((cat.sanctioned || 0) / maxSanction) * 100);

              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#141d23] truncate max-w-[240px]">
                      {cat.category}
                    </span>
                    <span className="text-[#000a1f] font-bold">
                      {formatCurrency(cat.sanctioned || 0)}{' '}
                      <span className="font-normal text-[10px] text-[#747780]">
                        ({cat.total_projects || cat.count || 0} works)
                      </span>
                    </span>
                  </div>
                  <div className="h-2 bg-[#f6faff] rounded-full overflow-hidden border border-[#E9ECEF]">
                    <div
                      className="h-full bg-[#005eb2] rounded-full"
                      style={{ width: `${Math.max(3, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white border border-[#E9ECEF] rounded-sm p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#000a1f]">
              Implementation Status Breakdown
            </h3>
            <span className="text-[10px] text-[#747780]">Current Milestone</span>
          </div>

          <div className="space-y-3 pt-2">
            {statusBreakdown.map((s: any) => (
              <div key={s.name || s.status} className="p-3 rounded-sm bg-[#f8f9fa] border border-[#E9ECEF] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#000a1f]">{s.name || s.status || 'Active'}</h4>
                  <span className="text-[10px] text-[#747780]">
                    {(s.value || s.count || 0).toLocaleString('en-IN')} works registered ({s.percentage || 0}%)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#005eb2] block">
                    {s.percentage ? `${s.percentage}%` : `${(s.value || s.count || 0).toLocaleString('en-IN')} works`}
                  </span>
                  <span className="text-[9px] uppercase font-semibold text-[#747780]">
                    Dataset Share
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top 10 District High-Risk Concentration ─────────────── */}
      {districtRisk.length > 0 && (
        <div className="bg-white border border-[#E9ECEF] rounded-sm p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#000a1f]">
                Top 10 High-Risk Monitoring Districts
              </h3>
              <p className="text-[11px] text-[#747780]">
                Districts with highest concentration of works flagged for active monitoring &amp; verification
              </p>
            </div>
            <span className="text-[10px] font-mono text-[#DC3545] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-sm font-bold">
              Prioritized Scrutiny
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {districtRisk.slice(0, 10).map((d: any) => (
              <div key={d.district} className="p-3 rounded border border-[#E9ECEF] bg-[#FCFCFD] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#000a1f] truncate" title={d.rawDistrict || d.district}>
                    {d.district}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                    {d.high} High
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Total Works: <strong>{d.total}</strong></span>
                  <span className="text-rose-700 font-semibold">{d.highPct || 0}% high-risk</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                  <div style={{ width: `${d.highPct || 0}%` }} className="bg-rose-500 h-full" />
                  <div style={{ width: `${d.medPct || 0}%` }} className="bg-amber-400 h-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Financial Year Trends ──────────────────────────────── */}
      {financialYearTrends.length > 0 && (
        <div className="bg-white border border-[#E9ECEF] rounded-sm p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#000a1f]">
                Yearly Financial Trends
              </h3>
              <p className="text-[11px] text-[#747780]">
                Sanctions and expenditure progress grouped by financial year
              </p>
            </div>
            <span className="text-[10px] font-mono text-[#005eb2] bg-[#e6eff8] px-2 py-0.5 rounded-sm">
              Lok Sabha Dataset
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#f8f9fa] border-b border-[#E9ECEF] text-[10px] font-bold uppercase text-[#747780]">
                <tr>
                  <th className="py-2.5 px-3">Financial Year</th>
                  <th className="py-2.5 px-3 text-right">Sanctioned Amount</th>
                  <th className="py-2.5 px-3 text-right">Disbursed Amount</th>
                  <th className="py-2.5 px-3 text-right">Recorded Projects</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9ECEF]">
                {financialYearTrends.map((fy: any) => (
                  <tr key={fy.financial_year || fy.financialYear || fy.fy} className="hover:bg-[#f6faff]">
                    <td className="py-2.5 px-3 font-semibold text-[#000a1f]">
                      FY {fy.financial_year || fy.financialYear || fy.fy}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#6d28d9]">
                      {formatCurrency(fy.sanctioned || 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#0891b2]">
                      {formatCurrency(fy.disbursed || 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#44474f]">
                      {(fy.total_projects || fy.count || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
