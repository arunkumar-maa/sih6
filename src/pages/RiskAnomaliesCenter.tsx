import React, { useMemo, useState, useEffect } from 'react';
import {
  AlertTriangle, Clock, DollarSign, Users, TrendingUp,
  ChevronRight, Info, Shield, RefreshCw, Cpu, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useAppStore } from '../data/store';
import { RiskBadge } from '../components/RiskBadge';
import { formatCurrency, truncate } from '../utils';
import type { EnrichedProject } from '../data/types';
import type { AnomalyTab } from '../data/supabase/anomalyQueries';

const TAB_CONFIG: { id: AnomalyTab; label: string; Icon: React.ElementType; color: string }[] = [
  { id: 'pending',      label: 'Unsanctioned Works',  Icon: Clock,          color: '#92400e' },
  { id: 'stale',        label: 'Stale Status',        Icon: AlertTriangle,  color: '#DC3545' },
  { id: 'cost',         label: 'Cost Anomalies',      Icon: DollarSign,     color: '#6d28d9' },
  { id: 'disbursement', label: 'Disbursement Issues', Icon: TrendingUp,     color: '#ea580c' },
  { id: 'vendor',       label: 'Vendor Concentration',Icon: Users,          color: '#0891b2' },
];

const RECOMMENDED_ACTIONS: Record<AnomalyTab, string> = {
  pending: 'Review recommendation priority and consider sanctioning or formally cancelling the work.',
  stale: 'Verify with the IDA whether work has commenced. Request physical inspection report.',
  cost: 'Compare with similar category works. Request cost justification from IDA.',
  disbursement: 'Cross-verify disbursement records with physical site inspection. Halt further disbursement if discrepancy confirmed.',
  vendor: 'Review vendor allocation process. Ensure competitive bidding compliance.',
};

const FACTOR_ID_MAP: Record<AnomalyTab, string> = {
  pending: 'pending_recommendation',
  stale: 'stale_status',
  cost: 'high_amount_anomaly',
  disbursement: 'disbursement_anomaly',
  vendor: 'vendor_concentration',
};

export function RiskAnomaliesCenter() {
  const {
    projects,
    activeHouse,
    selectProject,
    setCurrentPage,
    anomalyCounts,
    anomalyProjects,
    anomalyLoading,
    anomalyError,
    lastAnalysisSummary,
    isAnalyzing,
    runAnalysis,
    loadAnomalyData,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<AnomalyTab>('stale');

  // Load anomaly data on initial mount and whenever activeHouse changes
  useEffect(() => {
    loadAnomalyData(activeHouse);
  }, [activeHouse, loadAnomalyData]);

  // Local fallback calculations from projects in store
  const localAnomalies = useMemo(() => {
    const pending = projects
      .filter(p => { const f = p.risk.factors.find(f => f.id === 'pending_recommendation'); return f?.available && f.score > 30; })
      .sort((a, b) => b.risk.score - a.risk.score);

    const stale = projects
      .filter(p => { const f = p.risk.factors.find(f => f.id === 'stale_status'); return f?.available && f.score > 20; })
      .sort((a, b) => {
        const fa = a.risk.factors.find(f => f.id === 'stale_status')!;
        const fb = b.risk.factors.find(f => f.id === 'stale_status')!;
        return fb.score - fa.score;
      });

    const cost = projects
      .filter(p => { const f = p.risk.factors.find(f => f.id === 'high_amount_anomaly'); return f?.available && f.score > 30; })
      .sort((a, b) => {
        const fa = a.risk.factors.find(f => f.id === 'high_amount_anomaly')!;
        const fb = b.risk.factors.find(f => f.id === 'high_amount_anomaly')!;
        return fb.score - fa.score;
      });

    const disbursement = projects
      .filter(p => { const f = p.risk.factors.find(f => f.id === 'disbursement_anomaly'); return f?.available && f.score > 20; })
      .sort((a, b) => {
        const fa = a.risk.factors.find(f => f.id === 'disbursement_anomaly')!;
        const fb = b.risk.factors.find(f => f.id === 'disbursement_anomaly')!;
        return fb.score - fa.score;
      });

    const vendor = projects
      .filter(p => { const f = p.risk.factors.find(f => f.id === 'vendor_concentration'); return f?.available && f.score > 10; })
      .sort((a, b) => {
        const fa = a.risk.factors.find(f => f.id === 'vendor_concentration')!;
        const fb = b.risk.factors.find(f => f.id === 'vendor_concentration')!;
        return fb.score - fa.score;
      });

    return { pending, stale, cost, disbursement, vendor };
  }, [projects]);

  // Selected category project list (prefers Supabase anomaly query results)
  const currentList: EnrichedProject[] = useMemo(() => {
    if (activeTab === 'vendor') return [];
    if (anomalyProjects && anomalyProjects[activeTab] && anomalyProjects[activeTab].length > 0) {
      return anomalyProjects[activeTab].slice(0, 25);
    }
    return localAnomalies[activeTab].slice(0, 25);
  }, [activeTab, anomalyProjects, localAnomalies]);

  // Card counts: prioritize dataset-wide server counts from Supabase
  const getTabCount = (tab: AnomalyTab): number => {
    if (tab === 'vendor') return 0;
    if (anomalyCounts && anomalyCounts[tab] !== undefined) {
      return anomalyCounts[tab];
    }
    if (anomalyProjects && anomalyProjects[tab] && anomalyProjects[tab].length > 0) {
      return anomalyProjects[tab].length;
    }
    return localAnomalies[tab].length;
  };

  const activeTabConfig = TAB_CONFIG.find(t => t.id === activeTab)!;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#DC3545] mb-1 flex items-center gap-2">
            <AlertTriangle size={11} />
            Anomaly Center — Risk Observatory · {activeHouse}
          </p>
          <h1 className="text-2xl font-bold text-[#000a1f]"
              style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Risk &amp; Anomaly Intelligence
          </h1>
          <p className="text-xs text-[#747780] mt-0.5">
            Automatically detected risk patterns for {activeHouse} · For human verification only
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => runAnalysis()}
            disabled={isAnalyzing || anomalyLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-semibold bg-[#00204a] hover:bg-[#000a1f] text-white transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                Analyzing {activeHouse}...
              </>
            ) : (
              <>
                <Cpu size={13} />
                Run AI Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Status Banner */}
      {lastAnalysisSummary && (
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-sm text-xs text-[#166534] shadow-[0_1px_3px_rgba(0,10,31,0.02)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[#16a34a] flex-shrink-0" />
            <span className="font-medium">
              Analysis completed — {lastAnalysisSummary.projectsAnalyzed.toLocaleString('en-IN')} projects analyzed, {lastAnalysisSummary.indicatorsDetected.toLocaleString('en-IN')} attention indicators detected.
            </span>
          </div>
          <span className="text-[10px] text-[#15803d] font-mono hidden sm:inline-block">
            {lastAnalysisSummary.timestamp} ({lastAnalysisSummary.house})
          </span>
        </div>
      )}

      {/* Error State Banner if Supabase query failed */}
      {anomalyError && (
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#fef2f2] border border-[#fecaca] rounded-sm text-xs text-[#991b1b]">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-[#dc2626] flex-shrink-0" />
            <span>Anomaly analysis data could not be loaded. Please retry.</span>
          </div>
          <button
            onClick={() => loadAnomalyData(activeHouse)}
            className="text-[11px] font-bold text-[#dc2626] hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {TAB_CONFIG.map(({ id, label, Icon, color }) => {
          const count = getTabCount(id);
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`p-4 border text-left transition-all duration-150 rounded-sm shadow-[0_1px_4px_rgba(0,10,31,0.04)] ${
                isActive
                  ? 'border-opacity-60 shadow-[0_4px_16px_rgba(0,10,31,0.1)]'
                  : 'bg-white border-[#E9ECEF] hover:border-[#c4c6d0] hover:shadow-[0_2px_8px_rgba(0,10,31,0.06)]'
              }`}
              style={isActive ? {
                borderColor: color,
                backgroundColor: `${color}08`,
              } : {}}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 rounded-sm" style={{ backgroundColor: `${color}14` }}>
                  <Icon size={12} style={{ color }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isActive ? color : '#747780' }}>
                  {label}
                </span>
              </div>
              <div className="text-2xl font-bold" style={{ color: isActive ? color : '#000a1f', fontFamily: 'Montserrat, sans-serif' }}>
                {anomalyLoading && !anomalyCounts ? '...' : count.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-[#747780] mt-0.5">anomalies</div>
            </button>
          );
        })}
      </div>

      {/* Active Anomaly List */}
      <div className="panel p-5">
        {/* Section header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm" style={{ backgroundColor: `${activeTabConfig.color}14` }}>
              <activeTabConfig.Icon size={16} style={{ color: activeTabConfig.color }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#000a1f]"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {activeTabConfig.label}
              </h2>
              <p className="text-[11px] text-[#747780]">
                {activeTab === 'vendor'
                  ? 'Vendor data unavailable for this dataset'
                  : `${currentList.length} priority anomaly cases displayed · ${getTabCount(activeTab).toLocaleString('en-IN')} total detected`}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 px-3 py-2 bg-[#fef3c7] border border-[#fcd34d] rounded-sm max-w-sm">
            <Shield size={12} className="text-[#92400e] flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-[#92400e]">Recommended Action: </span>
              <span className="text-[10px] text-[#78350f]">{RECOMMENDED_ACTIONS[activeTab]}</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {anomalyLoading && currentList.length === 0 ? (
          <div className="py-16 text-center">
            <RefreshCw size={24} className="mx-auto text-[#005eb2] animate-spin mb-2" />
            <div className="text-[#44474f] text-sm font-semibold">Analyzing MPLADS project data...</div>
            <div className="text-[#747780] text-xs mt-1">Evaluating multi-dimensional risk signals from Supabase</div>
          </div>
        ) : activeTab === 'vendor' ? (
          // Explicit section 5E mandate: Vendor data unavailable
          <div className="py-16 text-center">
            <Users size={32} className="mx-auto text-[#747780] mb-2 opacity-50" />
            <div className="text-[#44474f] text-sm font-semibold">Vendor data unavailable for this dataset</div>
            <div className="text-[#747780] text-xs mt-1">Contractor and vendor fields are unrecorded in official {activeHouse} project data.</div>
          </div>
        ) : currentList.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-[#44474f] text-sm font-semibold">No anomalies detected in this category.</div>
            <div className="text-[#747780] text-xs mt-1">Click "Run AI Analysis" to refresh detection.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {currentList.map((project) => {
              const factor = project.risk.factors.find(f => f.id === FACTOR_ID_MAP[activeTab]) || project.risk.factors[0];
              const tab = TAB_CONFIG.find(t => t.id === activeTab)!;
              const whyAttention: string[] = (project as any).whyAttention || [];
              const featureContributions: { name: string; points: number }[] = (project as any).featureContributions || [];

              return (
                <div
                  key={`${project.house}-${project.workId}-${activeTab}`}
                  onClick={() => { selectProject(project.workId); setCurrentPage('monitoring'); }}
                  className="anomaly-card cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-1 self-stretch rounded-full flex-shrink-0"
                      style={{ backgroundColor: tab.color, opacity: 0.8 }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-semibold text-[#000a1f]">
                              {truncate(project.workDescription || project.workCategory, 80)}
                            </span>
                            <RiskBadge level={project.risk.level} size="sm" />
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                              Score: {project.risk.score}/100
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[#747780] flex-wrap">
                            <span className="font-mono text-[#005eb2] font-semibold">
                              {project.workId.split('/').slice(0, 3).join('/')}
                            </span>
                            <span>·</span>
                            <span>{project.district || 'District N/A'}</span>
                            <span>·</span>
                            <span>{project.constituency || 'Constituency N/A'}</span>
                            {project.sanctionAmount !== null && (
                              <>
                                <span>·</span>
                                <span className="font-semibold text-[#44474f]">
                                  Sanction: {formatCurrency(project.sanctionAmount)}
                                </span>
                              </>
                            )}
                            {project.totalPaid !== null && project.totalPaid > 0 && (
                              <>
                                <span>·</span>
                                <span className="text-[#198754] font-medium">
                                  Paid: {formatCurrency(project.totalPaid)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="text-base font-bold" style={{ color: tab.color, fontFamily: 'Montserrat, sans-serif' }}>
                            +{factor?.score ?? project.risk.score}
                          </div>
                          <div className="text-[10px] text-[#747780]">factor score</div>
                        </div>
                      </div>

                      {/* Primary Factor Description */}
                      {factor && (
                        <div
                          className="mt-2.5 px-3 py-2 rounded-sm text-[11px] text-[#141d23]"
                          style={{
                            backgroundColor: `${tab.color}08`,
                            borderLeft: `2px solid ${tab.color}`,
                          }}
                        >
                          <span className="font-bold" style={{ color: tab.color }}>{factor.label}: </span>
                          <span className="text-[#44474f]">{factor.description}</span>
                          {factor.value !== undefined && (
                            <span className="ml-1 font-mono text-[#747780]"> [{String(factor.value)}]</span>
                          )}
                        </div>
                      )}

                      {/* Explainable Evidence: WHY ATTENTION? */}
                      {whyAttention.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-dashed border-[#E9ECEF]">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#44474f] mb-1">
                            Why Attention?
                          </p>
                          <ul className="space-y-0.5">
                            {whyAttention.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-[11px] text-[#44474f] flex items-start gap-1.5">
                                <span className="text-[#DC3545] font-bold">→</span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Feature Contribution Breakdown (Explainability Layer) */}
                      {featureContributions.length > 0 && (
                        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-semibold text-[#747780] mr-1">Risk Contribution:</span>
                          {featureContributions.map((fc, cIdx) => (
                            <span
                              key={cIdx}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-[#f1f5f9] text-[#334155] font-medium"
                            >
                              {fc.name} <strong className="text-[#0f172a]">+{fc.points}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight size={14} className="text-[#c4c6d0] flex-shrink-0 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="panel-muted p-4 border border-[#E9ECEF] flex items-start gap-3">
        <Info size={14} className="text-[#005eb2] mt-0.5 flex-shrink-0" />
        <div className="text-[11px] text-[#44474f] leading-relaxed">
          <strong className="text-[#141d23] font-bold">About Anomaly Detection:</strong>{' '}
          These patterns are identified using multi-dimensional Isolation Forest machine learning and rule-based statistical analysis of the MPLADS dataset.
          They are <em className="font-semibold">indicators requiring human verification</em>, not evidence of wrongdoing.
          Officers should investigate flagged projects using official records and site visits before taking any administrative action.
        </div>
      </div>
    </div>
  );
}
