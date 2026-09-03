import React, { useMemo } from 'react';
import {
  TrendingUp, Building2, DollarSign, AlertTriangle,
  ClipboardCheck, FolderOpen, ChevronRight, Clock,
  Zap, Activity, ArrowRight
} from 'lucide-react';
import { useAppStore } from '../data/store';
import { KPICard } from '../components/KPICard';
import { RiskBadge, RiskScoreRing } from '../components/RiskBadge';
import { formatCurrency, truncate } from '../utils';

export function IntelligenceDashboard() {
  const { projects, isLoading, isAnalyzing, setCurrentPage, selectProject } = useAppStore();

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

  const topRiskProjects = useMemo(() =>
    [...projects].sort((a, b) => b.risk.score - a.risk.score).slice(0, 6),
    [projects]
  );

  const statusSummary = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    projects.forEach(p => { statusCounts[p.workStatus] = (statusCounts[p.workStatus] ?? 0) + 1; });
    return Object.entries(statusCounts).sort(([, a], [, b]) => b - a).slice(0, 6);
  }, [projects]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#005eb2] border-t-transparent animate-spin" />
        <p className="text-[#44474f] text-sm">Loading MPLADS datasets…</p>
      </div>
    );
  }

  const riskDistribution = [
    { label: 'High Risk',    count: stats?.highRisk ?? 0,   color: '#DC3545', bg: '#DC3545' },
    { label: 'Medium Risk',  count: stats?.medRisk ?? 0,    color: '#FFC107', bg: '#FFC107' },
    { label: 'Low Risk',
      count: (stats?.total ?? 0) - (stats?.highRisk ?? 0) - (stats?.medRisk ?? 0),
      color: '#198754', bg: '#198754' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Hero Header ─────────────────────────────── */}
      <div className="mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#005eb2] mb-1 flex items-center gap-2">
          <Activity size={12} />
          MPLADS Intelligence Platform · Tamil Nadu
        </p>
        <h1
          className="text-3xl font-bold text-[#000a1f] leading-tight"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Monitor Everything.{' '}
          <span className="text-[#44474f] font-semibold">Prioritize what matters.</span>
        </h1>
        <p className="text-sm text-[#747780] mt-1">
          AI-assisted risk intelligence for proactive MPLADS project monitoring ·{' '}
          <span className="font-semibold text-[#44474f]">{stats?.total ?? 0} works</span>
        </p>
      </div>

      {/* ── KPI Cards ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard
          label="Total Works"
          value={stats?.total ?? 0}
          subValue="Sanctioned + Recommended"
          Icon={FolderOpen}
          accentColor="#005eb2"
          loading={!stats}
        />
        <KPICard
          label="Sanctioned Amount"
          value={stats ? formatCurrency(stats.totalSanctionAmount) : '—'}
          subValue="Across all works"
          Icon={DollarSign}
          accentColor="#6d28d9"
          loading={!stats}
        />
        <KPICard
          label="Amount Disbursed"
          value={stats ? formatCurrency(stats.totalDisbursed) : '—'}
          subValue="Payments processed"
          Icon={TrendingUp}
          accentColor="#0d9488"
          loading={!stats}
        />
        <KPICard
          label="Works Completed"
          value={stats?.completed ?? 0}
          subValue={stats ? `${((stats.completed / stats.total) * 100).toFixed(0)}% of total` : ''}
          Icon={Building2}
          accentColor="#0891b2"
          loading={!stats}
        />
        <KPICard
          label="High Risk Works"
          value={stats?.highRisk ?? 0}
          subValue={`+ ${stats?.medRisk ?? 0} medium risk`}
          Icon={AlertTriangle}
          accentColor="#DC3545"
          loading={!stats}
        />
      </div>

      {/* ── Main Intelligence Grid ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Priority Intelligence Panel (2/3 width) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#DC3545] blink-dot" />
                <span className="text-[10px] font-bold text-[#DC3545] uppercase tracking-widest">
                  Priority Intelligence
                </span>
              </div>
              <h2 className="text-base font-bold text-[#000a1f] mt-0.5"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Projects Requiring Attention
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {(stats?.highRisk ?? 0) > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-[#DC3545]">
                  <AlertTriangle size={12} />
                  {stats?.highRisk} High Risk Anomalies
                </span>
              )}
              <button
                onClick={() => setCurrentPage('anomalies')}
                className="flex items-center gap-1 text-xs font-semibold text-[#005eb2] hover:text-[#003161] transition-colors"
              >
                View all <ChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Risk Cards – Bento Style */}
          <div className="space-y-3">
            {topRiskProjects.map((project, i) => {
              const borderClass =
                project.risk.level === 'HIGH'   ? 'risk-border-high' :
                project.risk.level === 'MEDIUM' ? 'risk-border-medium' : 'risk-border-low';
              const topFactor = project.risk.factors.find(f => f.available && f.severity !== 'LOW');

              return (
                <div
                  key={project.workId}
                  onClick={() => { selectProject(project.workId); setCurrentPage('monitoring'); }}
                  className={`bg-white border border-[#E9ECEF] ${borderClass} p-5 cursor-pointer hover:shadow-[0_4px_16px_rgba(0,10,31,0.08)] hover:border-[#c4c6d0] transition-all duration-150 group shadow-[0_1px_4px_rgba(0,10,31,0.04)]`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-[#E9ECEF] text-xs font-mono w-5 flex-shrink-0 pt-0.5">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <RiskBadge level={project.risk.level} />
                        <span className="text-[10px] font-mono text-[#747780]">
                          {project.workId.split('/').slice(0, 3).join('/')}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#000a1f] leading-snug mb-1">
                        {truncate(project.workDescription || project.workCategory, 70)}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-[#747780]">
                        <span>{project.district}</span>
                        <span>·</span>
                        <span>{project.constituency}</span>
                        {project.financialYear && (
                          <>
                            <span>·</span>
                            <span>{project.financialYear}</span>
                          </>
                        )}
                      </div>
                      {topFactor && (
                        <div className="mt-2 text-[11px] text-[#44474f] bg-[#F8F9FA] border border-[#E9ECEF] px-3 py-1.5 rounded-sm">
                          <span className="font-semibold">{topFactor.label}:</span>{' '}
                          {truncate(topFactor.description ?? '', 90)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <RiskScoreRing score={project.risk.score} level={project.risk.level} size={56} />
                      <ArrowRight size={14} className="text-[#c4c6d0] group-hover:text-[#005eb2] transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage('monitoring')}
            className="w-full border border-[#E9ECEF] bg-white text-[#44474f] hover:bg-[#F8F9FA] px-4 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 rounded-sm"
          >
            View Full Project Ledger <ArrowRight size={14} />
          </button>
        </div>

        {/* Right Column */}
        <div className="space-y-4">

          {/* Risk Distribution */}
          <div className="panel p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#44474f] mb-4">
              Risk Distribution
            </p>
            <div className="space-y-3">
              {riskDistribution.map(({ label, count, color, bg }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-[#44474f]">{label}</span>
                    <span className="text-sm font-bold" style={{ color }}>{count}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: stats ? `${(count / stats.total) * 100}%` : '0%',
                        backgroundColor: bg,
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-[#747780] mt-0.5">
                    {stats ? `${((count / stats.total) * 100).toFixed(1)}% of portfolio` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Alert */}
          {(stats?.requiresVerification ?? 0) > 0 && (
            <div className="panel p-4 border-l-4 border-l-[#FFC107]">
              <div className="flex items-start gap-3">
                <ClipboardCheck size={16} className="text-[#92400e] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-bold text-[#92400e]">
                    {stats?.requiresVerification} Awaiting Verification
                  </div>
                  <div className="text-[11px] text-[#747780] mt-0.5">
                    New alerts pending officer review
                  </div>
                  <button
                    onClick={() => setCurrentPage('verification')}
                    className="text-[11px] font-semibold text-[#005eb2] hover:text-[#003161] mt-1.5 flex items-center gap-1"
                  >
                    Open Verification Desk <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Work Status Summary */}
          <div className="panel p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#44474f] mb-4">
              Work Status Summary
            </p>
            <div className="space-y-2">
              {statusSummary.map(([status, count]) => (
                <div key={status} className="flex items-center justify-between py-1 border-b border-[#E9ECEF] last:border-0">
                  <span className="text-xs text-[#44474f] truncate flex-1 mr-2">{status}</span>
                  <span className="text-xs font-bold text-[#000a1f] flex-shrink-0">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Unsanctioned works notice */}
          {(stats?.pendingSanction ?? 0) > 0 && (
            <div className="panel p-4 border-l-4 border-l-[#FFC107]">
              <div className="flex items-start gap-3">
                <Clock size={14} className="text-[#92400e] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-[#92400e]">
                    {stats?.pendingSanction} Unsanctioned Recommendations
                  </div>
                  <div className="text-[11px] text-[#747780] mt-0.5">
                    Works recommended but sanction date is NA
                  </div>
                  <button
                    onClick={() => setCurrentPage('anomalies')}
                    className="text-[11px] font-semibold text-[#005eb2] hover:text-[#003161] mt-1 flex items-center gap-1"
                  >
                    Review in Anomaly Center <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Note */}
          <div className="panel-muted p-4 border border-[#E9ECEF]">
            <div className="flex items-start gap-2.5">
              <Zap size={13} className="text-[#005eb2] mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-[10px] font-bold text-[#005eb2] uppercase tracking-wider mb-1">
                  Prototype AI Scoring
                </div>
                <div className="text-[11px] text-[#747780] leading-relaxed">
                  Rule-based statistical risk intelligence. Future: Isolation Forest + XGBoost + SHAP.
                </div>
                <button
                  onClick={() => setCurrentPage('methodology')}
                  className="text-[11px] font-semibold text-[#005eb2] hover:text-[#003161] mt-1.5 flex items-center gap-1"
                >
                  View Methodology <ArrowRight size={10} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
