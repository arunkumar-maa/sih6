import React, { useMemo } from 'react';
import {
  TrendingUp, Building2, DollarSign, AlertTriangle,
  ClipboardCheck, FolderOpen, ArrowRight, Clock,
  Activity, Zap, ChevronRight
} from 'lucide-react';
import { useAppStore } from '../data/store';
import { KPICard } from '../components/KPICard';
import { RiskBadge, RiskScoreRing } from '../components/RiskBadge';
import { formatCurrency, formatDate, truncate } from '../utils';

export function IntelligenceDashboard() {
  const { projects, isLoading, isAnalyzing, setCurrentPage, selectProject } = useAppStore();

  // ALL HOOKS DECLARED AT THE VERY TOP (BEFORE ANY EARLY RETURN)
  const stats = useMemo(() => {
    if (projects.length === 0) return null;
    const totalSanctionAmount = projects.reduce((s, p) => s + (p.sanctionAmount ?? 0), 0);
    const totalDisbursed = projects.reduce((s, p) => s + (p.totalPaid ?? 0), 0);
    const completed = projects.filter(p => p.isCompleted).length;
    const highRisk = projects.filter(p => p.risk.level === 'HIGH').length;
    const medRisk = projects.filter(p => p.risk.level === 'MEDIUM').length;
    const pendingSanction = projects.filter(p => p.isRecommendedOnly).length;
    const requiresVerification = projects.filter(p => p.risk.level !== 'LOW' && p.verificationStatus === 'New Alert').length;
    return {
      total: projects.length,
      totalSanctionAmount,
      totalDisbursed,
      completed,
      highRisk,
      medRisk,
      pendingSanction,
      requiresVerification,
    };
  }, [projects]);

  const topRiskProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => b.risk.score - a.risk.score)
      .slice(0, 8);
  }, [projects]);

  const statusSummary = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    projects.forEach(p => {
      statusCounts[p.workStatus] = (statusCounts[p.workStatus] ?? 0) + 1;
    });
    return Object.entries(statusCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);
  }, [projects]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-slate-400 text-sm">Loading MPLADS datasets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={16} className="text-blue-400" />
            <span className="text-label text-blue-400">Intelligence Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold text-white">MPLADS Project Intelligence</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tamil Nadu · {stats?.total ?? 0} Works · AI-Assisted Risk Analysis
          </p>
        </div>
        {isAnalyzing && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-900/30 border border-blue-700/40">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs text-blue-300 font-medium">Re-analyzing all projects...</span>
          </div>
        )}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard
          label="Total Works"
          value={stats?.total ?? 0}
          subValue="Sanctioned + Recommended"
          Icon={FolderOpen}
          accentColor="#3b82f6"
          loading={!stats}
        />
        <KPICard
          label="Sanctioned Amount"
          value={stats ? formatCurrency(stats.totalSanctionAmount) : '—'}
          subValue="Across all works"
          Icon={DollarSign}
          accentColor="#8b5cf6"
          loading={!stats}
        />
        <KPICard
          label="Amount Disbursed"
          value={stats ? formatCurrency(stats.totalDisbursed) : '—'}
          subValue="Payments processed"
          Icon={TrendingUp}
          accentColor="#10b981"
          loading={!stats}
        />
        <KPICard
          label="Works Completed"
          value={stats?.completed ?? 0}
          subValue={stats ? `${((stats.completed / stats.total) * 100).toFixed(0)}% of total` : ''}
          Icon={Building2}
          accentColor="#06b6d4"
          loading={!stats}
        />
        <KPICard
          label="High Risk Works"
          value={stats?.highRisk ?? 0}
          subValue={`+ ${stats?.medRisk ?? 0} medium risk`}
          Icon={AlertTriangle}
          accentColor="#ef4444"
          loading={!stats}
        />
        <KPICard
          label="Needs Verification"
          value={stats?.requiresVerification ?? 0}
          subValue="New alerts pending"
          Icon={ClipboardCheck}
          accentColor="#f59e0b"
          loading={!stats}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Priority Intelligence Panel */}
        <div className="lg:col-span-2 panel p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-2 h-2 rounded-full bg-red-400 blink-dot" />
                <span className="text-label text-red-400">Priority Intelligence</span>
              </div>
              <h2 className="text-base font-semibold text-white">Projects Requiring Attention</h2>
            </div>
            <button
              onClick={() => setCurrentPage('anomalies')}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              View all <ChevronRight size={12} />
            </button>
          </div>

          <div className="space-y-2">
            {topRiskProjects.map((project, i) => (
              <div
                key={project.workId}
                onClick={() => { selectProject(project.workId); setCurrentPage('monitoring'); }}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150 hover:border-[#2a52a0] ${
                  project.risk.level === 'HIGH'
                    ? 'bg-red-950/20 border-red-900/40'
                    : project.risk.level === 'MEDIUM'
                    ? 'bg-amber-950/20 border-amber-900/40'
                    : 'bg-[#0f2040] border-[#1e3f7a]/50'
                }`}
              >
                <div className="text-slate-600 text-xs font-mono w-5 text-center">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-white truncate">
                      {truncate(project.workDescription || project.workCategory, 60)}
                    </span>
                    <RiskBadge level={project.risk.level} size="sm" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{project.district}</span>
                    <span>·</span>
                    <span>{project.constituency}</span>
                    <span>·</span>
                    <span className="font-mono text-slate-600">{project.workId.split('/').slice(0, 3).join('/')}</span>
                  </div>
                  {project.risk.factors.filter(f => f.available && f.severity !== 'LOW').length > 0 && (
                    <div className="mt-1 text-[10px] text-slate-500 truncate">
                      ⚑ {project.risk.factors.find(f => f.available && f.severity !== 'LOW')?.label}:&nbsp;
                      {truncate(project.risk.factors.find(f => f.available && f.severity !== 'LOW')?.description ?? '', 80)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{
                      color: project.risk.level === 'HIGH' ? '#ef4444' : project.risk.level === 'MEDIUM' ? '#f59e0b' : '#10b981'
                    }}>
                      {project.risk.score}
                    </div>
                    <div className="text-[10px] text-slate-600">risk score</div>
                  </div>
                  <ArrowRight size={14} className="text-slate-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Risk distribution */}
          <div className="panel p-4">
            <div className="text-label mb-3">Risk Distribution</div>
            <div className="space-y-2">
              {[
                { label: 'High Risk', count: stats?.highRisk ?? 0, color: '#ef4444', bg: 'bg-red-500' },
                { label: 'Medium Risk', count: stats?.medRisk ?? 0, color: '#f59e0b', bg: 'bg-amber-500' },
                { label: 'Low Risk', count: (stats?.total ?? 0) - (stats?.highRisk ?? 0) - (stats?.medRisk ?? 0), color: '#10b981', bg: 'bg-emerald-500' },
              ].map(({ label, count, color, bg }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">{label}</span>
                    <span className="text-xs font-bold" style={{ color }}>{count}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${bg}`}
                      style={{ width: stats ? `${(count / stats.total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status breakdown */}
          <div className="panel p-4">
            <div className="text-label mb-3">Work Status Summary</div>
            <div className="space-y-1.5">
              {statusSummary.map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 truncate">{status}</span>
                  <span className="text-xs font-medium text-slate-300 ml-2">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending sanction alert */}
          {(stats?.pendingSanction ?? 0) > 0 && (
            <div className="panel-card p-3 border-l-2 border-amber-500">
              <div className="flex items-start gap-2">
                <Clock size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-amber-300">
                    {stats?.pendingSanction} Unsanctioned Recommendations
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Works recommended but sanction date is NA
                  </div>
                  <button
                    onClick={() => setCurrentPage('anomalies')}
                    className="text-[11px] text-amber-400 hover:text-amber-300 mt-1"
                  >
                    Review →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Methodology note */}
          <div className="panel-card p-3">
            <div className="flex items-start gap-2">
              <Zap size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider mb-1">
                  Prototype AI Scoring
                </div>
                <div className="text-[10px] text-slate-500">
                  Rule-based statistical risk intelligence. Future: Isolation Forest + XGBoost + SHAP.
                </div>
                <button
                  onClick={() => setCurrentPage('methodology')}
                  className="text-[10px] text-blue-400 hover:text-blue-300 mt-1"
                >
                  View Methodology →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
