import React, { useState, useMemo } from 'react';
import { useAppStore } from '../data/store';
import { RiskBadge } from '../components/RiskBadge';
import { formatCurrency, formatDateStr, truncate } from '../utils';
import type { VerificationStatus, EnrichedProject } from '../data/types';
import {
  ClipboardCheck, UserCheck, ShieldAlert, CheckCircle2,
  XCircle, Clock, AlertTriangle, FileText, Send, History
} from 'lucide-react';

const STATUS_OPTIONS: { status: VerificationStatus; label: string; icon: React.ElementType; color: string }[] = [
  { status: 'New Alert',                label: 'New Alert',             icon: AlertTriangle,  color: '#92400e' },
  { status: 'Under Review',            label: 'Under Review',           icon: Clock,          color: '#1e40af' },
  { status: 'Inspection Requested',    label: 'Inspection Requested',   icon: ShieldAlert,    color: '#6b21a8' },
  { status: 'Verified',                label: 'Verified (Clear)',        icon: CheckCircle2,   color: '#065f46' },
  { status: 'Needs Further Investigation', label: 'Needs Investigation', icon: FileText,       color: '#9a3412' },
  { status: 'Dismissed',               label: 'Dismissed',              icon: XCircle,        color: '#747780' },
];

const STATUS_BADGE_CLASS: Record<string, string> = {
  'New Alert':                  'status-new-alert',
  'Under Review':               'status-under-review',
  'Inspection Requested':       'status-inspection',
  'Verified':                   'status-verified',
  'Needs Further Investigation':'status-needs-investigation',
  'Dismissed':                  'status-dismissed',
};

export function OfficerVerification() {
  const { projects, updateVerification, selectProject, setCurrentPage } = useAppStore();

  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('ALL');
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [selectedStatusInput, setSelectedStatusInput] = useState<VerificationStatus>('Under Review');

  const flaggedProjects = useMemo(() =>
    projects.filter(p => p.risk.level !== 'LOW' || p.verificationStatus !== 'New Alert'),
    [projects]
  );

  const filteredList = useMemo(() => {
    if (activeStatusFilter === 'ALL') return flaggedProjects;
    return flaggedProjects.filter(p => p.verificationStatus === activeStatusFilter);
  }, [flaggedProjects, activeStatusFilter]);

  const activeProject = useMemo(() => {
    if (selectedWorkId) return projects.find(p => p.workId === selectedWorkId) || null;
    return filteredList[0] || null;
  }, [projects, selectedWorkId, filteredList]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;
    updateVerification(activeProject.workId, selectedStatusInput, commentInput);
    setCommentInput('');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#005eb2] mb-1 flex items-center gap-2">
          <ClipboardCheck size={11} />
          Verification Desk — Officer Review
        </p>
        <h1 className="text-2xl font-bold text-[#000a1f]"
            style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Officer Verification &amp; Human-in-the-Loop Workflow
        </h1>
        <p className="text-xs text-[#747780] mt-0.5">
          AI suggests risk indicators · District Officers verify, request inspection, and issue decisions
        </p>
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveStatusFilter('ALL')}
          className={`chip ${activeStatusFilter === 'ALL' ? 'chip-active' : 'chip-inactive'}`}
        >
          All Flagged ({flaggedProjects.length})
        </button>
        {STATUS_OPTIONS.map(({ status, label, icon: Icon, color }) => {
          const count = flaggedProjects.filter(p => p.verificationStatus === status).length;
          return (
            <button
              key={status}
              onClick={() => setActiveStatusFilter(status)}
              className={`chip ${activeStatusFilter === status ? 'chip-active' : 'chip-inactive'}`}
            >
              <Icon size={11} style={{ color: activeStatusFilter === status ? '#ffffff' : color }} />
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ minHeight: '650px' }}>

        {/* Left: Project Queue */}
        <div className="lg:col-span-5 panel flex flex-col overflow-hidden" style={{ maxHeight: '70vh' }}>
          <div className="px-4 py-3 border-b border-[#E9ECEF] flex-shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#44474f]">
              Flagged Works Queue ({filteredList.length})
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredList.map(p => {
              const isSelected = activeProject?.workId === p.workId;
              const riskBorderClass =
                p.risk.level === 'HIGH'   ? 'risk-border-high' :
                p.risk.level === 'MEDIUM' ? 'risk-border-medium' : 'risk-border-low';
              return (
                <div
                  key={p.workId}
                  onClick={() => setSelectedWorkId(p.workId)}
                  className={`p-3 border cursor-pointer transition-all rounded-sm ${riskBorderClass} ${
                    isSelected
                      ? 'bg-[#dbeafe] border-[#93c5fd] shadow-sm'
                      : 'bg-white border-[#E9ECEF] hover:border-[#c4c6d0] hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={`text-xs font-semibold line-clamp-1 ${isSelected ? 'text-[#1e40af]' : 'text-[#000a1f]'}`}>
                      {truncate(p.workDescription || p.workCategory, 55)}
                    </span>
                    <RiskBadge level={p.risk.level} score={p.risk.score} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#747780]">
                    <span>{p.district} · {p.constituency}</span>
                    <span className="font-mono font-semibold text-[#44474f]">{formatCurrency(p.sanctionAmount)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-[10px] font-semibold ${STATUS_BADGE_CLASS[p.verificationStatus] ?? 'status-dismissed'} px-2 py-0.5 rounded-full border`}>
                      {p.verificationStatus}
                    </span>
                    <span className="text-[9px] text-[#747780] font-mono">
                      {p.verificationHistory.length} audit logs
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detail & Form */}
        <div className="lg:col-span-7 panel p-5 flex flex-col overflow-y-auto" style={{ maxHeight: '70vh' }}>
          {activeProject ? (
            <div className="space-y-4">
              {/* Project Header */}
              <div className="border-b border-[#E9ECEF] pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-[#005eb2] font-semibold bg-[#dbeafe] px-2 py-0.5 rounded-sm">
                    {activeProject.workId}
                  </span>
                  <RiskBadge level={activeProject.risk.level} score={activeProject.risk.score} />
                </div>
                <h2 className="text-base font-bold text-[#000a1f] mb-2"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {truncate(activeProject.workDescription || activeProject.workCategory, 80)}
                </h2>
                <div className="flex items-center gap-4 text-xs text-[#44474f] flex-wrap">
                  <span>District: <strong className="text-[#000a1f]">{activeProject.district}</strong></span>
                  <span>MP: <strong className="text-[#000a1f]">{activeProject.mp}</strong></span>
                  <span>Sanction: <strong className="text-[#000a1f]">{formatCurrency(activeProject.sanctionAmount)}</strong></span>
                </div>
              </div>

              {/* AI Risk Explanation */}
              <div className="p-4 bg-[#fef3c7] border border-[#fcd34d] rounded-sm">
                <div className="text-xs font-bold text-[#92400e] flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle size={13} />
                  AI Risk Indicator Explanation
                </div>
                <p className="text-xs text-[#78350f] leading-relaxed">{activeProject.risk.explanation}</p>
                <div className="text-[11px] text-[#92400e] mt-2 font-medium">
                  Primary factors: {activeProject.risk.factors.filter(f => f.available && f.severity !== 'LOW').map(f => f.label).join(', ') || 'General review'}
                </div>
              </div>

              {/* Officer Action Form */}
              <form onSubmit={handleUpdate} className="panel-muted p-4 space-y-3 border border-[#E9ECEF]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#44474f]">
                  Update Officer Decision
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#44474f] font-semibold block mb-1">
                      Verification Action
                    </label>
                    <select
                      value={selectedStatusInput}
                      onChange={e => setSelectedStatusInput(e.target.value as VerificationStatus)}
                      className="w-full bg-white border border-[#E9ECEF] rounded-sm px-3 py-2 text-xs text-[#141d23] focus:outline-none focus:border-[#005eb2] focus:ring-1 focus:ring-[#005eb2]/20"
                    >
                      {STATUS_OPTIONS.map(o => (
                        <option key={o.status} value={o.status}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-[#44474f] font-semibold block mb-1">
                      Inspector / Officer ID
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Officer #TN-8492 (District Collectorate)"
                      className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-sm px-3 py-2 text-xs text-[#747780]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-[#44474f] font-semibold block mb-1">
                    Inspection Notes / Comments
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Add mandatory comments or field inspection instructions…"
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    className="w-full bg-white border border-[#E9ECEF] rounded-sm p-3 text-xs text-[#141d23] placeholder-[#c4c6d0] focus:outline-none focus:border-[#005eb2] focus:ring-1 focus:ring-[#005eb2]/20"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#747780]">
                    Human decision will override automated AI risk flag.
                  </span>
                  <button
                    type="submit"
                    className="btn-primary flex items-center gap-1.5 text-xs"
                  >
                    <Send size={12} />
                    Commit Verification
                  </button>
                </div>
              </form>

              {/* Audit Trail */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#44474f] flex items-center gap-1.5">
                  <History size={12} className="text-[#005eb2]" />
                  Audit Trail &amp; History
                </p>
                <div className="space-y-2">
                  {/* System entry */}
                  <div className="p-3 border border-[#E9ECEF] bg-[#F8F9FA] rounded-sm text-xs border-l-2 border-l-[#005eb2] flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-[#141d23]">AI Risk Analysis Generated</div>
                      <div className="text-[10px] text-[#747780] mt-0.5">
                        Initial anomaly classification: {activeProject.risk.level} Risk ({activeProject.risk.score}/100)
                      </div>
                    </div>
                    <span className="text-[10px] text-[#747780] font-mono flex-shrink-0 ml-2">System</span>
                  </div>
                  {/* Officer entries */}
                  {activeProject.verificationHistory.map((ev, idx) => (
                    <div key={idx} className="p-3 border border-[#E9ECEF] rounded-sm text-xs border-l-2 border-l-[#198754] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#065f46]">Status Changed → {ev.action}</span>
                        <span className="text-[10px] text-[#747780] font-mono">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                      </div>
                      {ev.comment && (
                        <p className="text-[#141d23] italic text-[11px]">"{ev.comment}"</p>
                      )}
                      <div className="text-[10px] text-[#747780]">Updated by {ev.actor}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[#c4c6d0] gap-3">
              <ClipboardCheck size={40} />
              <p className="text-sm font-semibold text-[#747780]">Select a project to review and submit verification.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
