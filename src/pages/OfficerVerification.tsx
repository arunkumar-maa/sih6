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
  { status: 'New Alert', label: 'New Alert', icon: AlertTriangle, color: '#f59e0b' },
  { status: 'Under Review', label: 'Under Review', icon: Clock, color: '#3b82f6' },
  { status: 'Inspection Requested', label: 'Inspection Requested', icon: ShieldAlert, color: '#8b5cf6' },
  { status: 'Verified', label: 'Verified (Clear)', icon: CheckCircle2, color: '#10b981' },
  { status: 'Needs Further Investigation', label: 'Needs Investigation', icon: FileText, color: '#f97316' },
  { status: 'Dismissed', label: 'Dismissed', icon: XCircle, color: '#64748b' },
];

export function OfficerVerification() {
  const { projects, updateVerification, selectProject, setCurrentPage } = useAppStore();

  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('ALL');
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [selectedStatusInput, setSelectedStatusInput] = useState<VerificationStatus>('Under Review');

  const flaggedProjects = useMemo(() => {
    return projects.filter(p => p.risk.level !== 'LOW' || p.verificationStatus !== 'New Alert');
  }, [projects]);

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
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Officer Verification & Human-in-the-Loop Workflow</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          AI suggests risk indicators · District Officers verify, request inspection, and issue decisions
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
            activeStatusFilter === 'ALL'
              ? 'bg-blue-600 text-white'
              : 'bg-[#0f2040] text-slate-400 hover:text-white border border-[#1e3f7a]'
          }`}
        >
          All Flagged ({flaggedProjects.length})
        </button>
        {STATUS_OPTIONS.map(({ status, label, icon: Icon, color }) => {
          const count = flaggedProjects.filter(p => p.verificationStatus === status).length;
          return (
            <button
              key={status}
              onClick={() => setActiveStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                activeStatusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#0f2040] text-slate-400 hover:text-white border border-[#1e3f7a]'
              }`}
            >
              <Icon size={12} style={{ color }} />
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[650px]">
        {/* Left List */}
        <div className="lg:col-span-5 panel p-3 flex flex-col h-full overflow-hidden">
          <div className="text-label mb-2">Flagged Works Queue ({filteredList.length})</div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredList.map(p => {
              const isSelected = activeProject?.workId === p.workId;
              return (
                <div
                  key={p.workId}
                  onClick={() => setSelectedWorkId(p.workId)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-[#1e3f7a]/40 shadow-md'
                      : 'border-[#1e3f7a] bg-[#1a2744]/40 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-white line-clamp-1">
                      {p.workDescription || p.workCategory}
                    </span>
                    <RiskBadge level={p.risk.level} score={p.risk.score} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{p.district} · {p.constituency}</span>
                    <span className="font-mono text-slate-500">{formatCurrency(p.sanctionAmount)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#0a1628] border border-[#1e3f7a] text-slate-300">
                      Status: <strong>{p.verificationStatus}</strong>
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {p.verificationHistory.length} audit logs
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail & Verification Form */}
        <div className="lg:col-span-7 panel p-4 flex flex-col h-full overflow-y-auto">
          {activeProject ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="border-b border-[#1e3f7a] pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-blue-400">{activeProject.workId}</span>
                  <RiskBadge level={activeProject.risk.level} score={activeProject.risk.score} />
                </div>
                <h2 className="text-base font-bold text-white">{activeProject.workDescription || activeProject.workCategory}</h2>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>District: <strong>{activeProject.district}</strong></span>
                  <span>MP: <strong>{activeProject.mp}</strong></span>
                  <span>Sanction: <strong>{formatCurrency(activeProject.sanctionAmount)}</strong></span>
                </div>
              </div>

              {/* AI Risk Justification */}
              <div className="panel-card p-3 border-l-2 border-amber-500 space-y-1">
                <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle size={13} />
                  AI Risk Indicator Explanation
                </div>
                <p className="text-xs text-slate-300">{activeProject.risk.explanation}</p>
                <div className="text-[11px] text-slate-500 pt-1">
                  Primary factors: {activeProject.risk.factors.filter(f => f.available && f.severity !== 'LOW').map(f => f.label).join(', ') || 'General review'}
                </div>
              </div>

              {/* Action Form */}
              <form onSubmit={handleUpdate} className="panel-card p-4 space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider">Update Officer Decision</div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Select Verification Action</label>
                    <select
                      value={selectedStatusInput}
                      onChange={e => setSelectedStatusInput(e.target.value as VerificationStatus)}
                      className="w-full bg-[#0a1628] border border-[#1e3f7a] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      {STATUS_OPTIONS.map(o => (
                        <option key={o.status} value={o.status}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Inspector/Officer ID</label>
                    <input
                      type="text"
                      disabled
                      value="Officer #TN-8492 (District Collectorate)"
                      className="w-full bg-[#0a1628]/50 border border-[#1e3f7a] rounded-md px-3 py-1.5 text-xs text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Inspection Notes / Comments</label>
                  <textarea
                    rows={3}
                    placeholder="Add mandatory comments or field inspection instructions..."
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    className="w-full bg-[#0a1628] border border-[#1e3f7a] rounded-md p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">
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
                <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <History size={13} className="text-blue-400" />
                  Audit Trail & History
                </div>
                <div className="space-y-2">
                  <div className="panel-card p-2.5 text-xs border-l-2 border-blue-500 flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-slate-300">AI Risk Analysis Generated</div>
                      <div className="text-[10px] text-slate-500">Initial anomaly classification: {activeProject.risk.level} Risk ({activeProject.risk.score}/100)</div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">System</span>
                  </div>

                  {activeProject.verificationHistory.map((ev, idx) => (
                    <div key={idx} className="panel-card p-2.5 text-xs border-l-2 border-emerald-500 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-emerald-300">Status Changed to: {ev.action}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                      </div>
                      {ev.comment && <p className="text-slate-300 italic text-[11px]">"{ev.comment}"</p>}
                      <div className="text-[10px] text-slate-500">Updated by {ev.actor}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <ClipboardCheck size={32} />
              <p className="mt-2 text-sm">Select a project to review and submit verification.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
