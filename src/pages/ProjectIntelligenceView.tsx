import React from 'react';
import {
  ArrowLeft, MapPin, Calendar, DollarSign, Building2,
  AlertTriangle, CheckCircle, Info, TrendingUp, Clock,
  FileText, User, Hash
} from 'lucide-react';
import { RiskBadge, RiskScoreRing } from '../components/RiskBadge';
import { formatCurrency, formatDate, truncate } from '../utils';
import type { EnrichedProject } from '../data/types';

interface Props {
  project: EnrichedProject;
  onBack: () => void;
}

export function ProjectIntelligenceView({ project, onBack }: Props) {
  const p = project;
  const disbRatio = p.disbursementRatio ?? 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white mt-1"
        >
          <ArrowLeft size={13} /> Back
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-label text-blue-400">Project Intelligence Profile</span>
          </div>
          <h1 className="text-lg font-bold text-white leading-snug">
            {p.workDescription || p.workCategory || 'Work Description Unavailable'}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="font-mono text-blue-400">{p.workId}</span>
            <span>·</span>
            <span>{p.district}</span>
            <span>·</span>
            <span>{p.constituency}</span>
            <span>·</span>
            <span>{p.financialYear}</span>
            <RiskBadge level={p.risk.level} score={p.risk.score} />
          </div>
        </div>
        <RiskScoreRing score={p.risk.score} level={p.risk.level} size={90} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Overview + Financial */}
        <div className="lg:col-span-2 space-y-4">
          {/* Project Overview */}
          <div className="panel p-4">
            <div className="text-label mb-3">Project Overview</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {[
                { label: 'Work ID', value: p.workId, mono: true },
                { label: 'Work Category', value: p.workCategory || 'Not Available' },
                { label: 'State', value: p.state || 'Not Available' },
                { label: 'IDA', value: truncate(p.ida, 50) || 'Not Available' },
                { label: 'District', value: p.district || 'Not Available' },
                { label: 'Constituency', value: p.constituency || 'Not Available' },
                { label: 'Hon\'ble MP', value: p.mp || 'Not Available' },
                { label: 'Financial Year', value: p.financialYear || 'Not Available' },
                { label: 'Sanctioned', value: p.isSanctioned ? 'Yes' : 'No (Recommended Only)' },
                { label: 'Vendor', value: p.vendorName || 'Not Available' },
              ].map(({ label, value, mono }) => (
                <div key={label} className="data-row grid-cols-none">
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{label}</span>
                  <span className={`text-sm ${mono ? 'font-mono text-blue-300' : 'text-slate-200'}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Intelligence */}
          <div className="panel p-4">
            <div className="text-label mb-3">Financial Intelligence</div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Sanction Amount', value: formatCurrency(p.sanctionAmount), color: '#8b5cf6' },
                { label: 'Recommended Amount', value: formatCurrency(p.recommendedAmount), color: '#3b82f6' },
                { label: 'Amount Disbursed', value: formatCurrency(p.amountDisbursed), color: '#10b981' },
                { label: 'Expenditure (Ongoing)', value: formatCurrency(p.expenditureAmount), color: '#06b6d4' },
              ].map(({ label, value, color }) => (
                <div key={label} className="panel-card p-3">
                  <div className="text-[10px] text-slate-500 mb-1">{label}</div>
                  <div className="text-base font-bold" style={{ color }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Disbursement bar */}
            {p.sanctionAmount !== null && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-400">Money Disbursed vs Sanctioned Amount</span>
                  <span className={`text-xs font-bold ${disbRatio > 90 ? 'text-red-400' : disbRatio > 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {disbRatio.toFixed(1)}%
                  </span>
                </div>
                <div className="relative h-5 bg-[#0a1628] rounded-full overflow-hidden border border-[#1e3f7a]">
                  {/* Sanctioned = full width context */}
                  <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(disbRatio, 110)}%`,
                      background: disbRatio > 100
                        ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                        : disbRatio > 80
                        ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                        : 'linear-gradient(90deg, #10b981, #059669)',
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white drop-shadow-md">
                      {formatCurrency(p.totalPaid)} / {formatCurrency(p.sanctionAmount)}
                    </span>
                  </div>
                </div>
                {disbRatio > 100 && (
                  <div className="flex items-center gap-1 mt-1.5 text-[11px] text-red-400">
                    <AlertTriangle size={10} />
                    Disbursed amount exceeds sanction — requires verification
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="panel p-4">
            <div className="text-label mb-3">Project Timeline</div>
            <div className="flex items-center gap-0 text-xs">
              {[
                { label: 'Recommended', date: p.recommendedDate, color: '#3b82f6' },
                { label: 'Sanctioned', date: p.sanctionDate, color: '#8b5cf6' },
                { label: 'Completed', date: p.completionDate, color: '#10b981' },
              ].map(({ label, date, color }, i) => (
                <React.Fragment key={label}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className="w-3 h-3 rounded-full border-2 mb-1"
                      style={{
                        borderColor: color,
                        background: date ? color : 'transparent',
                        opacity: date ? 1 : 0.3,
                      }}
                    />
                    <div className="font-medium text-center" style={{ color: date ? color : '#475569' }}>
                      {label}
                    </div>
                    <div className="text-slate-500 text-center text-[10px] mt-0.5">
                      {date ? formatDate(date) : 'Not Available'}
                    </div>
                  </div>
                  {i < 2 && (
                    <div className="flex-1 h-px bg-[#1e3f7a] mb-4" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="panel-card p-2 text-center">
                <div className="text-[10px] text-slate-500">Days Since Sanction</div>
                <div className="text-sm font-bold text-white">
                  {p.daysSinceSanction !== null ? `${p.daysSinceSanction}d` : 'N/A'}
                </div>
              </div>
              <div className="panel-card p-2 text-center">
                <div className="text-[10px] text-slate-500">Days to Complete</div>
                <div className="text-sm font-bold text-white">
                  {p.daysToComplete !== null ? `${p.daysToComplete}d` : 'N/A'}
                </div>
              </div>
              <div className="panel-card p-2 text-center">
                <div className="text-[10px] text-slate-500">Work Status</div>
                <div className="text-sm font-bold text-white">{p.workStatus}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Risk Intelligence */}
        <div className="space-y-4">
          {/* Risk score card */}
          <div className="panel p-4">
            <div className="text-label mb-3">AI Risk Assessment</div>
            <div className="flex items-center justify-between mb-4">
              <RiskScoreRing score={p.risk.score} level={p.risk.level} size={100} />
              <div className="flex-1 ml-3">
                <div className="text-xs text-slate-400 mb-1">Explanation</div>
                <p className="text-sm text-slate-300 leading-snug">{p.risk.explanation}</p>
                <div className="mt-2 text-[10px] text-slate-600">
                  {p.risk.factorsAvailable}/{p.risk.factorsTotal} factors available
                </div>
              </div>
            </div>
            <div className="p-2 rounded-md bg-amber-950/20 border border-amber-900/30">
              <div className="text-[10px] text-amber-400 font-semibold mb-0.5">⚠ Prototype AI Scoring</div>
              <div className="text-[10px] text-slate-500">
                Rule-based statistical risk intelligence. Scores are risk indicators for human verification only.
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="panel p-4">
            <div className="text-label mb-3">Why Was This Flagged?</div>
            <div className="space-y-3">
              {p.risk.factors.map((f) => (
                <div
                  key={f.id}
                  className={`p-3 rounded-lg border ${
                    !f.available
                      ? 'opacity-40 border-slate-800/30 bg-transparent'
                      : f.severity === 'HIGH'
                      ? 'border-red-800/50 bg-red-950/20'
                      : f.severity === 'MEDIUM'
                      ? 'border-amber-800/50 bg-amber-950/20'
                      : 'border-emerald-900/30 bg-emerald-950/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      {!f.available ? (
                        <Info size={11} className="text-slate-600" />
                      ) : f.severity === 'HIGH' ? (
                        <AlertTriangle size={11} className="text-red-400" />
                      ) : f.severity === 'MEDIUM' ? (
                        <AlertTriangle size={11} className="text-amber-400" />
                      ) : (
                        <CheckCircle size={11} className="text-emerald-400" />
                      )}
                      <span className={`text-xs font-semibold ${
                        !f.available ? 'text-slate-600' :
                        f.severity === 'HIGH' ? 'text-red-300' :
                        f.severity === 'MEDIUM' ? 'text-amber-300' : 'text-emerald-300'
                      }`}>
                        {f.label}
                      </span>
                    </div>
                    {f.available && (
                      <span className="text-[10px] font-mono text-slate-500">+{f.score}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{f.description}</p>
                  {f.value !== undefined && f.available && (
                    <div className="mt-1 text-[10px] font-mono text-slate-600">
                      Metric: {String(f.value)}
                    </div>
                  )}
                  {!f.available && (
                    <div className="text-[10px] text-slate-700 italic">Data not available</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Verification status */}
          <div className="panel p-4">
            <div className="text-label mb-2">Verification Status</div>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium
              bg-amber-950/30 border-amber-800/50 text-amber-300">
              {p.verificationStatus}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Use the Officer Verification section to update status and add comments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
