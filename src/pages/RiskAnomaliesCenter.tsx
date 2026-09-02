import React, { useMemo, useState } from 'react';
import {
  AlertTriangle, Clock, DollarSign, Users, FileSearch,
  ChevronRight, TrendingUp, Info, Shield
} from 'lucide-react';
import { useAppStore } from '../data/store';
import { RiskBadge } from '../components/RiskBadge';
import { formatCurrency, truncate } from '../utils';
import type { EnrichedProject } from '../data/types';

type AnomalyTab = 'pending' | 'stale' | 'cost' | 'disbursement' | 'vendor';

const TAB_CONFIG: { id: AnomalyTab; label: string; Icon: React.ElementType; color: string }[] = [
  { id: 'pending', label: 'Unsanctioned Works', Icon: Clock, color: '#f59e0b' },
  { id: 'stale', label: 'Stale Status', Icon: AlertTriangle, color: '#ef4444' },
  { id: 'cost', label: 'Cost Anomalies', Icon: DollarSign, color: '#8b5cf6' },
  { id: 'disbursement', label: 'Disbursement Issues', Icon: TrendingUp, color: '#f97316' },
  { id: 'vendor', label: 'Vendor Concentration', Icon: Users, color: '#06b6d4' },
];

export function RiskAnomaliesCenter() {
  const { projects, selectProject, setCurrentPage } = useAppStore();
  const [activeTab, setActiveTab] = useState<AnomalyTab>('stale');

  const anomalies = useMemo(() => {
    const pending = projects
      .filter(p => {
        const f = p.risk.factors.find(f => f.id === 'pending_recommendation');
        return f?.available && f.score > 30;
      })
      .sort((a, b) => b.risk.score - a.risk.score);

    const stale = projects
      .filter(p => {
        const f = p.risk.factors.find(f => f.id === 'stale_status');
        return f?.available && f.score > 20;
      })
      .sort((a, b) => {
        const fa = a.risk.factors.find(f => f.id === 'stale_status')!;
        const fb = b.risk.factors.find(f => f.id === 'stale_status')!;
        return fb.score - fa.score;
      });

    const cost = projects
      .filter(p => {
        const f = p.risk.factors.find(f => f.id === 'high_amount_anomaly');
        return f?.available && f.score > 30;
      })
      .sort((a, b) => {
        const fa = a.risk.factors.find(f => f.id === 'high_amount_anomaly')!;
        const fb = b.risk.factors.find(f => f.id === 'high_amount_anomaly')!;
        return fb.score - fa.score;
      });

    const disbursement = projects
      .filter(p => {
        const f = p.risk.factors.find(f => f.id === 'disbursement_anomaly');
        return f?.available && f.score > 20;
      })
      .sort((a, b) => {
        const fa = a.risk.factors.find(f => f.id === 'disbursement_anomaly')!;
        const fb = b.risk.factors.find(f => f.id === 'disbursement_anomaly')!;
        return fb.score - fa.score;
      });

    const vendor = projects
      .filter(p => {
        const f = p.risk.factors.find(f => f.id === 'vendor_concentration');
        return f?.available && f.score > 10;
      })
      .sort((a, b) => {
        const fa = a.risk.factors.find(f => f.id === 'vendor_concentration')!;
        const fb = b.risk.factors.find(f => f.id === 'vendor_concentration')!;
        return fb.score - fa.score;
      });

    return { pending, stale, cost, disbursement, vendor };
  }, [projects]);

  const tabData: Record<AnomalyTab, EnrichedProject[]> = {
    pending: anomalies.pending,
    stale: anomalies.stale,
    cost: anomalies.cost,
    disbursement: anomalies.disbursement,
    vendor: anomalies.vendor,
  };

  const currentList = tabData[activeTab].slice(0, 25);
  const factorId: Record<AnomalyTab, string> = {
    pending: 'pending_recommendation',
    stale: 'stale_status',
    cost: 'high_amount_anomaly',
    disbursement: 'disbursement_anomaly',
    vendor: 'vendor_concentration',
  };

  const RECOMMENDED_ACTIONS: Record<AnomalyTab, string> = {
    pending: 'Review recommendation priority and consider sanctioning or formally cancelling the work.',
    stale: 'Verify with the IDA whether work has commenced. Request physical inspection report.',
    cost: 'Compare with similar category works. Request cost justification from IDA.',
    disbursement: 'Cross-verify disbursement records with physical site inspection. Halt further disbursement if discrepancy confirmed.',
    vendor: 'Review vendor allocation process. Ensure competitive bidding compliance.',
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Risk & Anomaly Intelligence Center</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Automatically detected risk patterns from the MPLADS dataset · For human verification only
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-5 gap-2">
        {TAB_CONFIG.map(({ id, label, Icon, color }) => {
          const count = tabData[id].length;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`p-3 rounded-lg border text-left transition-all duration-150 ${
                activeTab === id
                  ? 'border-opacity-80 shadow-lg'
                  : 'border-[#1e3f7a] bg-[#0f2040] hover:border-[#2a52a0]'
              }`}
              style={activeTab === id ? {
                borderColor: color,
                background: `${color}12`,
              } : {}}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon size={12} style={{ color: activeTab === id ? color : '#64748b' }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{
                  color: activeTab === id ? color : '#64748b'
                }}>
                  {label}
                </span>
              </div>
              <div className="text-xl font-bold" style={{ color: activeTab === id ? color : '#94a3b8' }}>
                {count}
              </div>
              <div className="text-[10px] text-slate-600">anomalies</div>
            </button>
          );
        })}
      </div>

      {/* Active anomaly list */}
      <div className="panel p-4">
        {(() => {
          const tab = TAB_CONFIG.find(t => t.id === activeTab)!;
          return (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md" style={{ background: `${tab.color}20` }}>
                  <tab.Icon size={14} style={{ color: tab.color }} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">{tab.label}</h2>
                  <p className="text-[11px] text-slate-500">{currentList.length} detected anomalies</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-950/30 border border-amber-900/30">
                <Shield size={11} className="text-amber-400" />
                <span className="text-[10px] text-amber-300 font-medium">Recommended Action: </span>
                <span className="text-[10px] text-slate-400">{RECOMMENDED_ACTIONS[activeTab]}</span>
              </div>
            </div>
          );
        })()}

        {currentList.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-slate-600 text-sm">No anomalies detected in this category.</div>
            <div className="text-slate-700 text-xs mt-1">Run AI Analysis to refresh detection.</div>
          </div>
        ) : (
          <div className="space-y-2">
            {currentList.map((project) => {
              const factor = project.risk.factors.find(f => f.id === factorId[activeTab]);
              const tab = TAB_CONFIG.find(t => t.id === activeTab)!;
              return (
                <div
                  key={project.workId}
                  onClick={() => { selectProject(project.workId); setCurrentPage('monitoring'); }}
                  className="anomaly-card"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-1 self-stretch rounded-full flex-shrink-0"
                      style={{ background: tab.color, opacity: 0.7 }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="text-sm font-medium text-white">
                              {truncate(project.workDescription || project.workCategory, 70)}
                            </span>
                            <RiskBadge level={project.risk.level} size="sm" />
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="font-mono text-blue-400">{project.workId.split('/').slice(0, 3).join('/')}</span>
                            <span>·</span>
                            <span>{project.district}</span>
                            <span>·</span>
                            <span>{project.constituency}</span>
                            {project.sanctionAmount !== null && (
                              <>
                                <span>·</span>
                                <span className="text-slate-400">{formatCurrency(project.sanctionAmount)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="text-base font-bold" style={{ color: tab.color }}>
                            +{factor?.score ?? 0}
                          </div>
                          <div className="text-[10px] text-slate-600">factor score</div>
                        </div>
                      </div>

                      {factor && (
                        <div
                          className="mt-2 px-2 py-1.5 rounded-md text-[11px] text-slate-300"
                          style={{ background: `${tab.color}10`, borderLeft: `2px solid ${tab.color}` }}
                        >
                          <span className="font-semibold" style={{ color: tab.color }}>{factor.label}: </span>
                          {factor.description}
                          {factor.value !== undefined && (
                            <span className="ml-1 font-mono text-slate-500"> [{String(factor.value)}]</span>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronRight size={14} className="text-slate-600 flex-shrink-0 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="panel-card p-3 flex items-start gap-2">
        <Info size={13} className="text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-[11px] text-slate-500">
          <strong className="text-slate-400">About Anomaly Detection:</strong> These patterns are identified using rule-based statistical analysis of the MPLADS dataset.
          They are <em>risk indicators for human verification</em>, not evidence of wrongdoing.
          Officers should investigate flagged projects using official records and site visits before taking any action.
        </div>
      </div>
    </div>
  );
}
