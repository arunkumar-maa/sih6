import React, { useEffect, useState } from 'react';
import { PublicService } from '../../services/publicService';
import type { PublicProjectDetailResponse } from '../../types/public';
import { formatCurrency, formatDate } from '../../utils';
import {
  ArrowLeft,
  FolderGit2,
  Landmark,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Award,
  Activity,
  AlertCircle,
  FileText,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface PublicProjectDetailProps {
  workId: string;
  onNavigate: (path: string) => void;
}

export function PublicProjectDetail({ workId, onNavigate }: PublicProjectDetailProps) {
  const [data, setData] = useState<PublicProjectDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);
        setError(null);
        const res = await PublicService.getProjectDetail(workId);
        setData(res);
      } catch (err: any) {
        console.error('Failed to load public project detail:', err);
        setError(err.message || 'Unable to retrieve project details');
      } finally {
        setLoading(false);
      }
    }
    if (workId) {
      loadProject();
    }
  }, [workId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-10 h-10 border-3 border-[#005eb2] border-t-transparent rounded-full animate-spin mb-3" />
        <h3 className="text-sm font-bold text-[#000a1f]">Loading Project Dossier…</h3>
        <p className="text-xs text-[#747780]">Retrieving verified records for {workId}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center bg-white border border-[#E9ECEF] rounded-sm space-y-4">
        <AlertCircle size={36} className="text-[#DC3545] mx-auto" />
        <h2 className="text-lg font-bold text-[#000a1f]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Project Record Not Found
        </h2>
        <p className="text-xs text-[#44474f]">
          {error || `Project ${workId} was not found in the official Lok Sabha public dataset.`}
        </p>
        <button
          onClick={() => onNavigate('/projects')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-[#005eb2] text-white text-xs font-semibold hover:bg-[#004b8f] cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Projects Explorer</span>
        </button>
      </div>
    );
  }

  const { financials, execution, attentionIndicator } = data;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* ── Top Bar ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/projects')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#44474f] hover:text-[#000a1f] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Projects</span>
        </button>

        <button
          onClick={() => onNavigate(`/complaints/report?workId=${encodeURIComponent(data.workId)}`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#DC3545] hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <AlertCircle size={14} />
          <span>Report an Issue About This Project</span>
        </button>
      </div>

      {/* ── Project Header Card ───────────────────────────────── */}
      <div className="bg-white border border-[#E9ECEF] rounded-sm p-6 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-[#005eb2] bg-[#e6eff8] px-2 py-0.5 rounded-sm">
            {data.workId}
          </span>
          <span className="text-[10px] uppercase font-bold text-[#747780] bg-[#f8f9fa] border border-[#E9ECEF] px-2 py-0.5 rounded-sm">
            {data.house}
          </span>
          <span className="text-[10px] font-semibold text-[#44474f] bg-[#f8f9fa] border border-[#E9ECEF] px-2 py-0.5 rounded-sm">
            FY {data.financialYear}
          </span>
          {attentionIndicator.level !== 'NONE' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-sm">
              <AlertTriangle size={11} />
              <span>{attentionIndicator.label}</span>
            </span>
          )}
        </div>

        <h1
          className="text-xl sm:text-2xl font-bold text-[#000a1f] leading-snug"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {data.workDescription}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-xs text-[#44474f] pt-1 border-t border-[#E9ECEF]">
          <div className="flex items-center gap-1">
            <MapPin size={13} className="text-[#005eb2]" />
            <span className="font-semibold text-[#000a1f]">{data.constituency}</span>
            <span>({data.state})</span>
          </div>
          <span>•</span>
          <div>
            <span className="text-[#747780]">District: </span>
            <span className="font-medium text-[#141d23]">{data.district}</span>
          </div>
          <span>•</span>
          <div>
            <span className="text-[#747780]">Representative: </span>
            <span className="font-medium text-[#141d23]">{data.mp}</span>
          </div>
        </div>
      </div>

      {/* ── Financial Information ─────────────────────────────── */}
      <div className="bg-white border border-[#E9ECEF] rounded-sm p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#000a1f]">
          Financial Information
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-sm bg-[#f8f9fa] border border-[#E9ECEF]">
            <span className="text-[10px] font-bold uppercase text-[#747780] block mb-1">
              Sanctioned Amount
            </span>
            <div className="text-lg font-bold text-[#6d28d9]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {formatCurrency(financials.sanctionAmount)}
            </div>
          </div>

          <div className="p-3.5 rounded-sm bg-[#f8f9fa] border border-[#E9ECEF]">
            <span className="text-[10px] font-bold uppercase text-[#747780] block mb-1">
              Disbursed / Paid
            </span>
            <div className="text-lg font-bold text-[#0891b2]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {formatCurrency(financials.amountDisbursed)}
            </div>
          </div>

          <div className="p-3.5 rounded-sm bg-[#f8f9fa] border border-[#E9ECEF]">
            <span className="text-[10px] font-bold uppercase text-[#747780] block mb-1">
              Recommended Amount
            </span>
            <div className="text-lg font-bold text-[#005eb2]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {formatCurrency(financials.recommendedAmount)}
            </div>
          </div>

          <div className="p-3.5 rounded-sm bg-[#f8f9fa] border border-[#E9ECEF]">
            <span className="text-[10px] font-bold uppercase text-[#747780] block mb-1">
              Disbursement Ratio
            </span>
            <div className="text-lg font-bold text-[#000a1f]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {financials.disbursementRatio}%
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs text-[#747780]">
            <span>Fund Disbursement vs Sanction</span>
            <span className="font-semibold text-[#141d23]">{financials.disbursementRatio}%</span>
          </div>
          <div className="h-2.5 bg-[#f6faff] rounded-full overflow-hidden border border-[#E9ECEF]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                financials.disbursementRatio > 100
                  ? 'bg-rose-600'
                  : financials.disbursementRatio >= 75
                  ? 'bg-emerald-600'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, financials.disbursementRatio)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Execution & Timeline ──────────────────────────────── */}
      <div className="bg-white border border-[#E9ECEF] rounded-sm p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#000a1f]">
          Execution Progress & Timeline
        </h3>

        {/* Milestone Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-sm border border-[#E9ECEF] bg-[#f8f9fa] space-y-1">
            <div className="flex items-center gap-2 text-[#005eb2]">
              <Clock size={15} />
              <span className="text-[11px] font-bold uppercase">1. Recommended</span>
            </div>
            <div className="text-sm font-semibold text-[#141d23]">
              {data.execution.recommendedDate ? formatDate(data.execution.recommendedDate) : 'Recorded'}
            </div>
            <p className="text-[10px] text-[#747780]">Official MP Recommendation</p>
          </div>

          <div className="p-4 rounded-sm border border-[#E9ECEF] bg-[#f8f9fa] space-y-1">
            <div className="flex items-center gap-2 text-[#6d28d9]">
              <Award size={15} />
              <span className="text-[11px] font-bold uppercase">2. Sanctioned</span>
            </div>
            <div className="text-sm font-semibold text-[#141d23]">
              {data.execution.sanctionDate ? formatDate(data.execution.sanctionDate) : 'Recorded'}
            </div>
            <p className="text-[10px] text-[#747780]">District Authority Sanction Order</p>
          </div>

          <div className="p-4 rounded-sm border border-[#E9ECEF] bg-[#f8f9fa] space-y-1">
            <div className="flex items-center gap-2 text-[#198754]">
              <CheckCircle2 size={15} />
              <span className="text-[11px] font-bold uppercase">3. Completion</span>
            </div>
            <div className="text-sm font-semibold text-[#141d23]">
              {data.execution.isCompleted
                ? (data.execution.completionDate ? formatDate(data.execution.completionDate) : 'Completed')
                : 'In Progress'}
            </div>
            <p className="text-[10px] text-[#747780]">Physical Work Delivery Status</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="pt-2 flex items-center justify-between text-xs">
          <span className="text-[#747780]">Current Recorded Work Status:</span>
          <span
            className={`font-semibold px-2.5 py-1 rounded-sm ${
              execution.isCompleted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {execution.workStatus}
          </span>
        </div>
      </div>

      {/* ── Public Attention Indicator Note ───────────────────── */}
      {attentionIndicator.level !== 'NONE' && (
        <div className="p-5 rounded-sm bg-amber-50/70 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle size={16} />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Public Monitoring Signal: {attentionIndicator.label}
            </h4>
          </div>
          <p className="text-xs text-[#44474f] leading-relaxed">
            {attentionIndicator.reason || 'This work displays an automated statistical attention flag (e.g. milestone duration or expenditure pace). This indicator is purely informational and subject to administrative field verification.'}
          </p>
        </div>
      )}

      {/* ── Report An Issue Callout ───────────────────────────── */}
      <div className="p-6 rounded-sm bg-[#f6faff] border border-[#005eb2]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#000a1f]">
            Have Information or Concerns About This Work?
          </h4>
          <p className="text-xs text-[#747780]">
            Citizens can submit a public report directly referencing Work ID <code className="text-[#005eb2] font-mono font-bold">{data.workId}</code>.
          </p>
        </div>
        <button
          onClick={() => onNavigate(`/complaints/report?workId=${encodeURIComponent(data.workId)}`)}
          className="px-4 py-2 rounded-sm bg-[#DC3545] hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
        >
          Report an Issue About This Project
        </button>
      </div>
    </div>
  );
}
