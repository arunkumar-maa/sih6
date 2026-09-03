import React, { useMemo, useState } from 'react';
import {
  AlertTriangle, Clock, DollarSign, Users, TrendingUp,
  ChevronRight, Info, Shield
} from 'lucide-react';
import { useAppStore } from '../data/store';
import { RiskBadge } from '../components/RiskBadge';
import { formatCurrency, truncate } from '../utils';
import type { EnrichedProject } from '../data/types';

type AnomalyTab = 'pending' | 'stale' | 'cost' | 'disbursement' | 'vendor';

const TAB_CONFIG: { id: AnomalyTab; label: string; Icon: React.ElementType; color: string }[] = [
  { id: 'pending',      label: 'Unsanctioned Works',  Icon: Clock,          color: '#92400e' },
  { id: 'stale',        label: 'Stale Status',        Icon: AlertTriangle,  color: '#DC3545' },
  { id: 'cost',         label: 'Cost Anomalies',      Icon: DollarSign,     color: '#6d28d9' },
  { id: 'disbursement', label: 'Disbursement Issues', Icon: TrendingUp,     color: '#ea580c' },
  { id: 'vendor',       label: 'Vendor Concentration',Icon: Users,          color: '#0891b2' },
];

export function RiskAnomaliesCenter() {
  const { projects, selectProject, setCurrentPage } = useAppStore();
  const [activeTab, setActiveTab] = useState<AnomalyTab>('stale');

  const anomalies = useMemo(() => {
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

  const activeTabConfig = TAB_CONFIG.find(t => t.id === activeTab)!;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DC3545] mb-1 flex items-center gap-2">
          <AlertTriangle size={11} />
          Anomaly Center — Risk Observatory
        </p>
        <h1 className="text-2xl font-bold text-[#000a1f]"
            style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Risk &amp; Anomaly Intelligence
        </h1>
        <p className="text-xs text-[#747780] mt-0.5">
          Automatically detected risk patterns · For human verification only
        </p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {TAB_CONFIG.map(({ id, label, Icon, color }) => {
          const count = tabData[id].length;
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
                {count}
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
              <p className="text-[11px] text-[#747780]">{currentList.length} detected anomalies</p>
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

        {currentList.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-[#44474f] text-sm font-semibold">No anomalies detected in this category.</div>
            <div className="text-[#747780] text-xs mt-1">Run AI Analysis to refresh detection.</div>
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
                      style={{ backgroundColor: tab.color, opacity: 0.8 }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-semibold text-[#000a1f]">
                              {truncate(project.workDescription || project.workCategory, 70)}
                            </span>
                            <RiskBadge level={project.risk.level} size="sm" />
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[#747780]">
                            <span className="font-mono text-[#005eb2] font-semibold">
                              {project.workId.split('/').slice(0, 3).join('/')}
                            </span>
                            <span>·</span>
                            <span>{project.district}</span>
                            <span>·</span>
                            <span>{project.constituency}</span>
                            {project.sanctionAmount !== null && (
                              <>
                                <span>·</span>
                                <span className="font-semibold text-[#44474f]">{formatCurrency(project.sanctionAmount)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="text-base font-bold" style={{ color: tab.color, fontFamily: 'Montserrat, sans-serif' }}>
                            +{factor?.score ?? 0}
                          </div>
                          <div className="text-[10px] text-[#747780]">factor score</div>
                        </div>
                      </div>

                      {factor && (
                        <div
                          className="mt-2 px-3 py-2 rounded-sm text-[11px] text-[#141d23]"
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
          These patterns are identified using rule-based statistical analysis of the MPLADS dataset.
          They are <em className="font-semibold">risk indicators for human verification</em>, not evidence of wrongdoing.
          Officers should investigate flagged projects using official records and site visits before taking any action.
        </div>
      </div>
    </div>
  );
}
