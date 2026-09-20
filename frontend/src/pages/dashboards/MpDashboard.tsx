import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/store';
import { 
  UserCheck, AlertTriangle, CheckCircle2, Clock, DollarSign, 
  FileText, ShieldAlert, ArrowUpRight, Search, Landmark, 
  Sparkles, Award, ExternalLink
} from 'lucide-react';
import { formatCurrency } from '../../utils';
import { getProjects } from '../../services/projectService';
import type { EnrichedProject } from '../../types';
import { MpAvatar } from '../../components/MpAvatar';

export function MpDashboard() {
  const { profile } = useAuthStore();
  const { setCurrentPage, selectProject } = useAppStore();

  const mpName = profile?.mp_name || profile?.full_name || 'Hon\'ble Member of Parliament';
  const house = profile?.house || 'Lok Sabha';
  const constituency = profile?.constituency || profile?.district || 'Constituency';
  const state = profile?.state || 'State';

  const [projects, setProjects] = useState<EnrichedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'attention' | 'completed' | 'ongoing'>('all');

  useEffect(() => {
    async function loadMpData() {
      setLoading(true);
      try {
        const res = await getProjects({
          house: house,
          mpName: profile?.mp_name || undefined,
          pageSize: 250,
          sortField: 'risk',
          sortDir: 'desc',
        });
        setProjects(res.projects);
      } catch (err) {
        console.error('Error fetching MP projects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMpData();
  }, [profile?.mp_name, house]);

  const metrics = useMemo(() => {
    const totalWorks = projects.length;
    const totalRecommendedCost = projects.reduce((sum, p) => sum + (p.sanctionAmount || 0), 0);
    const totalDisbursed = projects.reduce((sum, p) => sum + (p.totalPaid || 0), 0);
    const completed = projects.filter(p => p.isCompleted).length;
    const ongoing = projects.filter(p => !p.isCompleted).length;
    const attentionWorks = projects.filter(p => p.risk.level === 'HIGH' || p.risk.score >= 50);
    const highRiskCount = attentionWorks.length;
    const avgCompletionRate = totalWorks > 0 ? Math.round((completed / totalWorks) * 100) : 0;
    const fundUtilization = totalRecommendedCost > 0 ? Math.round((totalDisbursed / totalRecommendedCost) * 100) : 0;

    return {
      totalWorks,
      totalRecommendedCost,
      totalDisbursed,
      completed,
      ongoing,
      attentionWorks,
      highRiskCount,
      avgCompletionRate,
      fundUtilization,
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = 
        !search || 
        (p.workDescription && p.workDescription.toLowerCase().includes(search.toLowerCase())) ||
        (p.workId && p.workId.toLowerCase().includes(search.toLowerCase())) ||
        (p.workCategory && p.workCategory.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      if (filter === 'attention') return p.risk.level === 'HIGH' || p.risk.score >= 50;
      if (filter === 'completed') return p.isCompleted;
      if (filter === 'ongoing') return !p.isCompleted;
      return true;
    });
  }, [projects, search, filter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Hon'ble MP Dignitary Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 md:p-8 border border-emerald-800/40 shadow-2xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-10 flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border-b border-x border-emerald-500/30 rounded-b-lg text-xs font-semibold tracking-wider uppercase">
          <Award className="w-3.5 h-3.5" />
          Parliamentary Portfolio
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <MpAvatar
              name={mpName}
              id={profile?.id}
              photoUrl={profile?.photo_url}
              size="xl"
              className="ring-2 ring-emerald-400/40 shadow-xl"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 tracking-wider uppercase">
                <Landmark className="w-4 h-4" />
                <span>{house} &bull; {state}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <span>Hon&apos;ble MP: {mpName}</span>
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                Constituency: <strong className="text-white font-semibold">{constituency}</strong> &bull; Comprehensive real-time tracking of recommended developmental works, fund disbursement velocity, and risk oversight under MPLADS guidelines.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-md">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Fund Utilization</div>
              <div className="text-xl font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span>{metrics.fundUtilization}%</span>
                <span className="text-xs text-slate-400 font-normal">of sanctioned</span>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('monitoring')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <span>Explore All Works</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Recommended Works</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{metrics.totalWorks}</div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <span className="text-blue-400 font-medium">{metrics.ongoing} ongoing</span>
            <span>&bull;</span>
            <span className="text-emerald-400 font-medium">{metrics.completed} completed</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sanctioned</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{formatCurrency(metrics.totalRecommendedCost)}</div>
          <div className="text-xs text-slate-400 mt-2">
            Disbursed: <span className="text-slate-200 font-medium">{formatCurrency(metrics.totalDisbursed)}</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Completion Rate</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{metrics.avgCompletionRate}%</div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${metrics.avgCompletionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 hover:border-rose-900/50 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">High Attention Items</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-400">{metrics.highRiskCount}</div>
          <div className="text-xs text-slate-400 mt-2">
            {metrics.highRiskCount > 0 ? (
              <span className="text-rose-400/90 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Requires nodal agency review
              </span>
            ) : (
              <span className="text-emerald-400 font-medium">All projects on schedule</span>
            )}
          </div>
        </div>
      </div>

      {/* Attention / Sentinel Flagged Section if high risk exists */}
      {metrics.highRiskCount > 0 && (
        <div className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-200">Recommended Works Requiring Administrative Attention</h3>
                <p className="text-xs text-rose-300/80">AI Sentinel risk engine flagged these works for schedule delay, fund-expenditure gap, or verification backlog.</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold">
              {metrics.highRiskCount} Flagged
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {metrics.attentionWorks.slice(0, 4).map(p => (
              <div 
                key={p.workId}
                onClick={() => {
                  selectProject(p.workId);
                  setCurrentPage('monitoring');
                }}
                className="p-4 rounded-xl bg-slate-900/90 border border-rose-900/40 hover:border-rose-700/80 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-mono text-slate-400">{p.workId}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      Score: {p.risk.score} / 100
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white line-clamp-1">{p.workDescription}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {p.risk.factors?.[0]?.label ? `${p.risk.factors[0].label}: ${p.risk.factors[0].description || ''}` : 'Stalled work or delayed milestone inspection.'}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800">
                  <span>Sanctioned: <strong className="text-slate-200">{formatCurrency(p.sanctionAmount || 0)}</strong></span>
                  <span className="text-rose-400 font-medium flex items-center gap-1">
                    Inspect <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Oversight Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-white">Constituency Works Ledger</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
              {filteredProjects.length} works
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter tabs */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filter === 'all' ? 'bg-slate-800 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                All Works
              </button>
              <button
                onClick={() => setFilter('attention')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filter === 'attention' ? 'bg-rose-900/60 text-rose-300 font-semibold shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Attention ({metrics.highRiskCount})
              </button>
              <button
                onClick={() => setFilter('ongoing')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filter === 'ongoing' ? 'bg-slate-800 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Ongoing
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filter === 'completed' ? 'bg-slate-800 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Completed
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search works..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 w-44 sm:w-56"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading Hon&apos;ble MP works ledger...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No developmental works found matching the active filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Project ID & Title</th>
                  <th className="py-3 px-4">Category & Sector</th>
                  <th className="py-3 px-4">Sanction Amount</th>
                  <th className="py-3 px-4">Disbursed / %</th>
                  <th className="py-3 px-4">Sentinel Risk</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Intelligence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProjects.slice(0, 100).map(p => {
                  const sanctionAmt = p.sanctionAmount || 0;
                  const totalPaid = p.totalPaid || 0;
                  const disbPercent = sanctionAmt > 0 
                    ? Math.round((totalPaid / sanctionAmt) * 100) 
                    : 0;

                  return (
                    <tr key={p.workId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-mono text-xs text-slate-400 mb-0.5">{p.workId}</div>
                        <div className="font-semibold text-white truncate" title={p.workDescription}>{p.workDescription}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-300">
                        <div>{p.workCategory || 'General'}</div>
                        <div className="text-slate-500 text-[11px]">{p.district || constituency}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200">
                        {formatCurrency(sanctionAmt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-slate-200 font-medium">{formatCurrency(totalPaid)}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-16 bg-slate-800 rounded-full h-1 overflow-hidden">
                            <div 
                              className="bg-emerald-500 h-full rounded-full" 
                              style={{ width: `${Math.min(100, disbPercent)}%` }} 
                            />
                          </div>
                          <span className="text-[10px] text-slate-400">{disbPercent}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                          p.risk.level === 'HIGH' 
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                            : p.risk.level === 'MEDIUM'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {p.risk.level} ({p.risk.score})
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          p.isCompleted 
                            ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/40' 
                            : 'bg-blue-900/40 text-blue-300 border border-blue-800/40'
                        }`}>
                          {p.isCompleted ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            selectProject(p.workId);
                            setCurrentPage('monitoring');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
                        >
                          <span>Analyze</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
