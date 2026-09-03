import React from 'react';
import {
  ArrowLeft, MapPin, Calendar, DollarSign, Building2,
  AlertTriangle, CheckCircle, Info, TrendingUp, Clock,
  FileText, User, Hash, Shield
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

  const riskBorderColor =
    p.risk.level === 'HIGH'   ? '#DC3545' :
    p.risk.level === 'MEDIUM' ? '#FFC107' : '#198754';

  const riskBorderClass =
    p.risk.level === 'HIGH'   ? 'risk-border-high' :
    p.risk.level === 'MEDIUM' ? 'risk-border-medium' : 'risk-border-low';

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Header / Case File ────────────────────────── */}
      <div
        className={`bg-white border border-[#E9ECEF] ${riskBorderClass} p-5 shadow-[0_1px_4px_rgba(0,10,31,0.06)]`}
      >
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#44474f] hover:text-[#000a1f] mt-1 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={13} /> Back
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-[#005eb2] uppercase tracking-widest">
                Project Intelligence Profile — Case File
              </span>
            </div>
            <h1 className="text-lg font-bold text-[#000a1f] leading-snug mb-2"
                style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {p.workDescription || p.workCategory || 'Work Description Unavailable'}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-[#005eb2] font-semibold bg-[#dbeafe] px-2 py-0.5 rounded-sm">
                {p.workId}
              </span>
              <span className="text-[#747780]">·</span>
              <span className="text-[#44474f]">{p.district}</span>
              <span className="text-[#747780]">·</span>
              <span className="text-[#44474f]">{p.constituency}</span>
              <span className="text-[#747780]">·</span>
              <span className="text-[#747780]">{p.financialYear}</span>
              <RiskBadge level={p.risk.level} score={p.risk.score} />
            </div>
          </div>
          <RiskScoreRing score={p.risk.score} level={p.risk.level} size={80} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left: Overview + Financial + Timeline ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Project Overview */}
          <div className="panel p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#44474f] mb-4">
              Project Overview
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
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
                  <span className="text-[10px] text-[#747780] font-bold uppercase tracking-wider">{label}</span>
                  <span className={`text-sm ${mono ? 'font-mono text-[#005eb2]' : 'text-[#141d23]'}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Intelligence */}
          <div className="panel p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#44474f] mb-4">
              Financial Intelligence
            </p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'Sanction Amount',        value: formatCurrency(p.sanctionAmount),      color: '#6d28d9' },
                { label: 'Recommended Amount',     value: formatCurrency(p.recommendedAmount),   color: '#005eb2' },
                { label: 'Amount Disbursed',       value: formatCurrency(p.amountDisbursed),     color: '#198754' },
                { label: 'Expenditure (Ongoing)',  value: formatCurrency(p.expenditureAmount),   color: '#0891b2' },
              ].map(({ label, value, color }) => (
                <div key={label} className="panel-muted p-3 border border-[#E9ECEF]">
                  <div className="text-[10px] text-[#747780] font-semibold mb-1">{label}</div>
                  <div className="text-base font-bold" style={{ color, fontFamily: 'Montserrat, sans-serif' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Disbursement bar */}
            {p.sanctionAmount !== null && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#44474f] font-medium">Disbursement vs Sanctioned Amount</span>
                  <span className={`text-xs font-bold ${
                    disbRatio > 90 ? 'text-[#DC3545]' : disbRatio > 60 ? 'text-[#92400e]' : 'text-[#198754]'
                  }`}>
                    {disbRatio.toFixed(1)}%
                  </span>
                </div>
                <div className="relative h-6 bg-[#F8F9FA] rounded-sm overflow-hidden border border-[#E9ECEF]">
                  <div
                    className="absolute left-0 top-0 h-full transition-all duration-700"
                    style={{
                      width: `${Math.min(disbRatio, 110)}%`,
                      background:
                        disbRatio > 100 ? 'linear-gradient(90deg, #DC3545, #b91c1c)' :
                        disbRatio > 80  ? 'linear-gradient(90deg, #FFC107, #d97706)' :
                        'linear-gradient(90deg, #198754, #059669)',
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white drop-shadow-sm">
                      {formatCurrency(p.totalPaid)} / {formatCurrency(p.sanctionAmount)}
                    </span>
                  </div>
                </div>
                {disbRatio > 100 && (
                  <div className="flex items-center gap-1 mt-1.5 text-[11px] text-[#DC3545] font-semibold">
                    <AlertTriangle size={10} />
                    Disbursed amount exceeds sanction — requires verification
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="panel p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#44474f] mb-4">
              Project Timeline
            </p>
            <div className="flex items-center gap-0 text-xs mb-5">
              {[
                { label: 'Recommended', date: p.recommendedDate, color: '#005eb2' },
                { label: 'Sanctioned',  date: p.sanctionDate,    color: '#6d28d9' },
                { label: 'Completed',   date: p.completionDate,  color: '#198754' },
              ].map(({ label, date, color }, i) => (
                <React.Fragment key={label}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className="w-3 h-3 rounded-full border-2 mb-1.5"
                      style={{
                        borderColor: color,
                        background: date ? color : 'transparent',
                        opacity: date ? 1 : 0.3,
                      }}
                    />
                    <div className="font-semibold text-center" style={{ color: date ? color : '#c4c6d0' }}>
                      {label}
                    </div>
                    <div className="text-[#747780] text-center text-[10px] mt-0.5">
                      {date ? formatDate(date) : 'Not Available'}
                    </div>
                  </div>
                  {i < 2 && <div className="flex-1 h-px bg-[#E9ECEF] mb-5" />}
                </React.Fragment>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Days Since Sanction', value: p.daysSinceSanction !== null ? `${p.daysSinceSanction}d` : 'N/A' },
                { label: 'Days to Complete',    value: p.daysToComplete !== null ? `${p.daysToComplete}d` : 'N/A' },
                { label: 'Work Status',         value: p.workStatus },
              ].map(({ label, value }) => (
                <div key={label} className="panel-muted p-3 text-center border border-[#E9ECEF]">
                  <div className="text-[10px] text-[#747780] font-semibold mb-1">{label}</div>
                  <div className="text-sm font-bold text-[#000a1f]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Risk Intelligence ─────────────── */}
        <div className="space-y-4">

          {/* AI Risk Assessment */}
          <div className="panel p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#44474f] mb-4">
              AI Risk Assessment
            </p>
            <div className="flex items-center gap-4 mb-4">
              <RiskScoreRing score={p.risk.score} level={p.risk.level} size={88} />
              <div className="flex-1">
                <p className="text-xs text-[#747780] mb-1 font-semibold">AI Explanation</p>
                <p className="text-sm text-[#141d23] leading-relaxed">{p.risk.explanation}</p>
                <div className="mt-1.5 text-[10px] text-[#747780]">
                  {p.risk.factorsAvailable}/{p.risk.factorsTotal} factors assessed
                </div>
              </div>
            </div>
            <div className="p-3 bg-[#fef3c7] border border-[#fcd34d] rounded-sm">
              <div className="text-[10px] text-[#92400e] font-bold mb-0.5 flex items-center gap-1">
                <Shield size={10} /> Prototype AI Scoring
              </div>
              <div className="text-[10px] text-[#92400e]">
                Rule-based statistical risk indicators for human verification only.
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="panel p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#44474f] mb-4">
              Why Was This Flagged?
            </p>
            <div className="space-y-2.5">
              {p.risk.factors.map((f) => {
                const isHigh = f.available && f.severity === 'HIGH';
                const isMed  = f.available && f.severity === 'MEDIUM';
                const isLow  = f.available && f.severity === 'LOW';

                let cardClass = 'bg-[#F8F9FA] border-[#E9ECEF] opacity-50';
                let labelClass = 'text-[#747780]';
                let descClass  = 'text-[#747780]';

                if (isHigh) {
                  cardClass  = 'bg-[#fde8e8] border-[#fca5a5]';
                  labelClass = 'text-[#991b1b]';
                  descClass  = 'text-[#7f1d1d]';
                } else if (isMed) {
                  cardClass  = 'bg-[#fef3c7] border-[#fcd34d]';
                  labelClass = 'text-[#92400e]';
                  descClass  = 'text-[#78350f]';
                } else if (isLow) {
                  cardClass  = 'bg-[#d1fae5] border-[#6ee7b7]';
                  labelClass = 'text-[#065f46]';
                  descClass  = 'text-[#064e3b]';
                }

                return (
                  <div
                    key={f.id}
                    className={`p-3 border rounded-sm ${cardClass} ${!f.available ? 'opacity-40' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        {!f.available ? (
                          <Info size={11} className="text-[#747780]" />
                        ) : isHigh ? (
                          <AlertTriangle size={11} className="text-[#DC3545]" />
                        ) : isMed ? (
                          <AlertTriangle size={11} className="text-[#92400e]" />
                        ) : (
                          <CheckCircle size={11} className="text-[#198754]" />
                        )}
                        <span className={`text-xs font-bold ${labelClass}`}>{f.label}</span>
                      </div>
                      {f.available && (
                        <span className="text-[10px] font-mono text-[#747780] font-semibold">
                          +{f.score}
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] leading-snug ${descClass}`}>{f.description}</p>
                    {f.value !== undefined && f.available && (
                      <div className="mt-1 text-[10px] font-mono text-[#747780]">
                        Metric: {String(f.value)}
                      </div>
                    )}
                    {!f.available && (
                      <div className="text-[10px] text-[#c4c6d0] italic">Data not available</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verification Status */}
          <div className="panel p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#44474f] mb-3">
              Verification Status
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold border bg-[#fef3c7] border-[#fcd34d] text-[#92400e]">
              {p.verificationStatus}
            </div>
            <p className="text-[11px] text-[#747780] mt-3 leading-relaxed">
              Use the Verification Desk to update status, request inspection, and add officer comments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
