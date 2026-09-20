import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle, Clock, DollarSign, Users, TrendingUp,
  ChevronRight, ChevronLeft, Info, Shield, RefreshCw, CheckCircle2, AlertCircle,
  ArrowRight, ExternalLink
} from 'lucide-react';
import { useAppStore } from '../data/store';
import { useAuthStore } from '../store/authStore';
import { RiskBadge } from '../components/RiskBadge';
import { formatCurrency, truncate } from '../utils';
import type { EnrichedProject } from '../data/types';
import type { AnomalyTab } from '../data/supabase/anomalyQueries';
import { getAnomalyProjects } from '../services/anomalyService';

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

const PAGE_SIZE = 25;

export function RiskAnomaliesCenter() {
  const {
    activeHouse,
    selectProject,
    setCurrentPage,
    anomalyCounts,
    lastAnalysisSummary,
    loadAnomalyData,
    setActiveHouse,
  } = useAppStore();

  const { profile } = useAuthStore();
  const isDistrictOfficer = profile?.role === 'DISTRICT_OFFICER';
  const isStateNodal = profile?.role === 'STATE_NODAL_OFFICER';
  const cleanDistrict = profile?.district ? profile.district.split('(')[0].trim() : '';

  const scopeBadge = isDistrictOfficer
    ? `District: ${cleanDistrict}, ${profile?.state} (Locked)`
    : isStateNodal
    ? `State: ${profile?.state} (Locked)`
    : 'National';

  const [activeTab, setActiveTab] = useState<AnomalyTab>('stale');
  const [page, setPage] = useState(1);
  const [paginatedProjects, setPaginatedProjects] = useState<EnrichedProject[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // Load summary counts on initial mount and whenever activeHouse changes
  useEffect(() => {
    loadAnomalyData(activeHouse);
  }, [activeHouse, loadAnomalyData]);

  // Reset page when tab or house changes
  useEffect(() => {
    setPage(1);
  }, [activeHouse, activeTab]);

  // Fetch paginated projects for activeTab & page
  const fetchPageProjects = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const offset = (page - 1) * PAGE_SIZE;
      const data = await getAnomalyProjects(activeHouse, activeTab, PAGE_SIZE, offset);
      setPaginatedProjects(data);
    } catch (err: any) {
      console.error(`[RiskAnomaliesCenter] Failed to fetch ${activeTab} page ${page}:`, err);
      setListError(err.message || 'Unable to load anomaly records.');
    } finally {
      setListLoading(false);
    }
  }, [activeHouse, activeTab, page]);

  useEffect(() => {
    fetchPageProjects();
  }, [fetchPageProjects]);

  // Card counts: dataset-wide server counts from Supabase RPC
  const getTabCount = (tab: AnomalyTab): number => {
    if (anomalyCounts && anomalyCounts[tab] !== undefined) {
      return anomalyCounts[tab];
    }
    return 0;
  };

  const totalTabCount = getTabCount(activeTab);
  const totalPages = Math.max(1, Math.ceil(totalTabCount / PAGE_SIZE));
  const activeTabConfig = TAB_CONFIG.find(t => t.id === activeTab)!;

  const handleProjectClick = (project: EnrichedProject) => {
    if (project.house && (project.house === 'Lok Sabha' || project.house === 'Rajya Sabha')) {
      if (project.house !== activeHouse) {
        setActiveHouse(project.house);
      }
    }
    selectProject(project.workId);
    setCurrentPage('monitoring');
    window.history.pushState({}, '', '/monitoring');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#DC3545] mb-1 flex items-center gap-2">
            <AlertTriangle size={11} />
            Anomaly Center — Risk Observatory · {activeHouse} · {scopeBadge}
          </p>
          <h1 className="text-2xl font-bold text-[#000a1f]"
              style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Risk &amp; Anomaly Intelligence
          </h1>
          <p className="text-xs text-[#747780] mt-0.5">
            Automatically detected risk patterns for {activeHouse} ({scopeBadge}) · For human verification only
          </p>
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

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {TAB_CONFIG.map(({ id, label, Icon, color }) => {
          const count = getTabCount(id);
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`p-4 border text-left transition-all duration-150 rounded-sm shadow-[0_1px_4px_rgba(0,10,31,0.04)] cursor-pointer ${
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
                {!anomalyCounts ? '...' : count.toLocaleString('en-IN')}
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
                {totalTabCount === 0
                  ? '0 anomalies detected'
                  : `Showing ${Math.min((page - 1) * PAGE_SIZE + 1, totalTabCount)}–${Math.min(page * PAGE_SIZE, totalTabCount)} of ${totalTabCount.toLocaleString('en-IN')} priority anomaly cases · ${totalTabCount.toLocaleString('en-IN')} total detected`}
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
        {listLoading && paginatedProjects.length === 0 ? (
          <div className="py-16 text-center">
            <RefreshCw size={24} className="mx-auto text-[#005eb2] animate-spin mb-2" />
            <div className="text-[#44474f] text-sm font-semibold">Analyzing MPLADS project data...</div>
            <div className="text-[#747780] text-xs mt-1">Evaluating multi-dimensional risk signals from Supabase</div>
          </div>
        ) : listError ? (
          <div className="py-16 text-center">
            <AlertCircle size={32} className="mx-auto text-[#DC3545] mb-2" />
            <div className="text-[#44474f] text-sm font-semibold">Unable to load anomaly records</div>
            <div className="text-[#747780] text-xs mt-1 mb-3">{listError}</div>
            <button
              onClick={fetchPageProjects}
              className="px-3.5 py-1.5 bg-[#005eb2] text-white text-xs font-semibold rounded hover:bg-[#004a8f] cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : paginatedProjects.length === 0 && totalTabCount > 0 ? (
          <div className="py-16 text-center">
            <AlertCircle size={32} className="mx-auto text-[#DC3545] mb-2" />
            <div className="text-[#44474f] text-sm font-semibold">Unable to load anomaly records</div>
            <div className="text-[#747780] text-xs mt-1 mb-3">Detected {totalTabCount.toLocaleString('en-IN')} cases, but records could not be retrieved.</div>
            <button
              onClick={fetchPageProjects}
              className="px-3.5 py-1.5 bg-[#005eb2] text-white text-xs font-semibold rounded hover:bg-[#004a8f] cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : paginatedProjects.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-[#44474f] text-sm font-semibold">No anomalies detected in this category.</div>
            <div className="text-[#747780] text-xs mt-1">No anomalies found matching current filters.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedProjects.map((project) => {
              const factor = project.risk.factors.find(f => f.id === FACTOR_ID_MAP[activeTab]) || project.risk.factors[0];
              const tab = TAB_CONFIG.find(t => t.id === activeTab)!;
              const whyAttention: string[] = (project as any).whyAttention || [];
              const featureContributions: { name: string; points: number }[] = (project as any).featureContributions || [];

              return (
                <div
                  key={`${project.house}-${project.workId}-${activeTab}`}
                  onClick={() => handleProjectClick(project)}
                  className="anomaly-card cursor-pointer group hover:border-[#005eb2] hover:shadow-[0_4px_16px_rgba(0,10,31,0.08)] transition-all"
                  title="Click to open project intelligence"
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
                            <span className="text-sm font-semibold text-[#000a1f] group-hover:text-[#005eb2] transition-colors">
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
                            <span>{project.house === 'Rajya Sabha' ? (project.state || 'State N/A') : (project.constituency || 'Constituency N/A')}</span>
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
                        <div className="flex-shrink-0 text-right flex items-center gap-2.5">
                          <div>
                            <div className="text-base font-bold" style={{ color: tab.color, fontFamily: 'Montserrat, sans-serif' }}>
                              +{factor?.score ?? project.risk.score}
                            </div>
                            <div className="text-[10px] text-[#747780]">factor score</div>
                          </div>
                          <ArrowRight size={15} className="text-[#CED4DA] group-hover:text-[#005eb2] group-hover:translate-x-0.5 transition-all" />
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

            {/* Pagination Controls */}
            {totalTabCount > PAGE_SIZE && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-5 border-t border-[#E9ECEF]">
                <div className="text-xs text-[#747780]">
                  Showing <strong className="text-[#000a1f]">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalTabCount)}</strong> of <strong className="text-[#000a1f]">{totalTabCount.toLocaleString('en-IN')}</strong> records
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1 || listLoading}
                    className="px-3 py-1.5 text-xs font-semibold rounded border border-[#E9ECEF] bg-white text-[#44474f] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </button>
                  <span className="text-xs font-mono px-2.5 py-1 bg-slate-100 rounded text-slate-700 font-semibold">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || listLoading}
                    className="px-3 py-1.5 text-xs font-semibold rounded border border-[#E9ECEF] bg-white text-[#44474f] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="panel-muted p-4 border border-[#E9ECEF] flex items-start gap-3">
        <Info size={14} className="text-[#005eb2] mt-0.5 flex-shrink-0" />
        <div className="text-[11px] text-[#44474f] leading-relaxed">
          <strong className="text-[#141d23] font-bold">About Anomaly Detection:</strong>{' '}
          These patterns are identified using multi-dimensional statistical indicators and official business rules on the {activeHouse} dataset.
          They are <em className="font-semibold">indicators requiring human verification</em>, not evidence of wrongdoing.
          Officers should cross-verify flagged projects using physical site inspection and official sanction records before taking administrative action.
        </div>
      </div>
    </div>
  );
}
