import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  Scale, ShieldAlert, CheckCircle2, Clock, DollarSign,
  Layers, Search, ArrowUpRight, Filter, FileText, Check, X,
  History, Sparkles, ExternalLink, RotateCcw, AlertTriangle,
  ChevronLeft, ChevronRight, AlertCircle, Eye, ShieldCheck,
  Building2, MapPin, Activity
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils';
import {
  getAuditorKPIs,
  getAuditorQueue,
  getAuditorRecentActivity,
  AuditorKPIs,
  AuditorQueueItem,
  AuditTrailRecord
} from '../../services/auditorService';
import { AuditorCaseFileModal } from '../../components/AuditorCaseFileModal';
import { PublicService } from '../../services/publicService';
import type { AuditorComplaintItem } from '../../types/public';
import type { VerificationStatus } from '../../types';


const ALL_STATES = [
  'Andaman And Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam',
  'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jammu And Kashmir', 'Jharkhand', 'Karnataka', 'Kerala',
  'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const FY_OPTIONS = ['all', '2024-2025', '2023-2024', '2022-2023', '2021-2022', '2020-2021', '2019-2020'];

export function AuditorDashboard() {
  const { profile } = useAuthStore();
  const auditorName = profile?.full_name || 'Senior Audit Officer';

  const [house, setHouse] = useState<'Lok Sabha' | 'Rajya Sabha'>('Lok Sabha');

  // KPI State
  const [kpis, setKpis] = useState<AuditorKPIs | null>(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState<string | null>(null);

  // Queue State
  const [queue, setQueue] = useState<AuditorQueueItem[]>([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [stateFilter, setStateFilter] = useState<string>('');
  const [districtFilter, setDistrictFilter] = useState<string>('');
  const [constituencyFilter, setConstituencyFilter] = useState<string>('');
  const [mpFilter, setMpFilter] = useState<string>('');
  const [fyFilter, setFyFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Recent Activity State
  const [recentActivity, setRecentActivity] = useState<AuditTrailRecord[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);

  // Review Case File Modal
  const [reviewingWorkId, setReviewingWorkId] = useState<string | null>(null);

  // Grievance Verification Queue State
  const [deskView, setDeskView] = useState<'algorithmic-anomalies' | 'grievance-verification'>('algorithmic-anomalies');
  const [auditorComplaints, setAuditorComplaints] = useState<AuditorComplaintItem[]>([]);
  const [auditorComplaintsLoading, setAuditorComplaintsLoading] = useState<boolean>(false);
  const [selectedAuditorComplaint, setSelectedAuditorComplaint] = useState<AuditorComplaintItem | null>(null);
  const [auditorOutcome, setAuditorOutcome] = useState<string>('VERIFIED');
  const [auditorRemarksInput, setAuditorRemarksInput] = useState<string>('');
  const [auditorSubmitting, setAuditorSubmitting] = useState<boolean>(false);
  const [auditorSuccessMsg, setAuditorSuccessMsg] = useState<string | null>(null);
  const [auditorErrorMsg, setAuditorErrorMsg] = useState<string | null>(null);

  const fetchAuditorComplaints = useCallback(async () => {
    setAuditorComplaintsLoading(true);
    try {
      const list = await PublicService.getAuditorVerificationComplaints();
      setAuditorComplaints(list);
    } catch (err) {
      console.warn('Failed to load auditor complaints:', err);
    } finally {
      setAuditorComplaintsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditorComplaints();
  }, [fetchAuditorComplaints]);

  const handleSubmitAuditorFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuditorComplaint) return;
    if (!auditorRemarksInput.trim()) {
      setAuditorErrorMsg('Please provide your audit finding and observation assessment.');
      return;
    }

    setAuditorSubmitting(true);
    setAuditorErrorMsg(null);
    setAuditorSuccessMsg(null);

    try {
      await PublicService.submitAuditorFinding(selectedAuditorComplaint.complaintId, {
        outcome: auditorOutcome,
        remarks: auditorRemarksInput.trim(),
        auditorName,
      });
      setAuditorSuccessMsg(`Audit assessment recorded as "${auditorOutcome}". Findings linked to official case dossier for District Authority.`);
      setAuditorRemarksInput('');
      fetchAuditorComplaints();
      setTimeout(() => {
        setSelectedAuditorComplaint(null);
        setAuditorSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setAuditorErrorMsg(err.message || 'Failed to submit verification finding.');
    } finally {
      setAuditorSubmitting(false);
    }
  };


  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Auditor display metadata
  const authorizedScope = useMemo(() => {
    if (profile?.state && profile?.district) return `${profile.district}, ${profile.state}`;
    if (profile?.state) return `State: ${profile.state}`;
    return 'National Audit Oversight & Scrutiny';
  }, [profile]);

  // Fetch real database KPIs
  const loadKPIs = useCallback(async () => {
    setKpiLoading(true);
    setKpiError(null);
    try {
      const data = await getAuditorKPIs(house, profile?.state || undefined, profile?.district || undefined);
      setKpis(data);
    } catch (err: any) {
      console.error('[AuditorDashboard] KPI fetch failed:', err);
      setKpiError(err.message || 'Unable to load real-time verification metrics.');
    } finally {
      setKpiLoading(false);
    }
  }, [house, profile]);

  // Fetch server-side paginated verification queue
  const loadQueue = useCallback(async () => {
    setQueueLoading(true);
    setQueueError(null);
    try {
      const res = await getAuditorQueue({
        house,
        state: stateFilter || profile?.state || undefined,
        district: districtFilter || profile?.district || undefined,
        constituency: constituencyFilter || undefined,
        mpName: mpFilter || undefined,
        financialYear: fyFilter !== 'all' ? fyFilter : undefined,
        riskLevel: riskFilter !== 'all' ? riskFilter : undefined,
        anomalyCategory: categoryFilter !== 'all' ? categoryFilter : undefined,
        verificationStatus: statusFilter !== 'all' ? statusFilter : undefined,
        search: debouncedSearch || undefined,
        page,
        pageSize,
        sortBy: 'risk_score',
        sortOrder: 'desc',
      });
      setQueue(res.records);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      console.error('[AuditorDashboard] Queue fetch failed:', err);
      setQueueError(err.message || 'Unable to load verification cases.');
      setQueue([]);
    } finally {
      setQueueLoading(false);
    }
  }, [
    house,
    stateFilter,
    districtFilter,
    constituencyFilter,
    mpFilter,
    fyFilter,
    riskFilter,
    categoryFilter,
    statusFilter,
    debouncedSearch,
    page,
    pageSize,
    profile,
  ]);

  // Fetch recent verification activity
  const loadRecentActivity = useCallback(async () => {
    setRecentLoading(true);
    try {
      const activity = await getAuditorRecentActivity(house, 8);
      setRecentActivity(activity);
    } catch (err) {
      console.error('[AuditorDashboard] Recent activity fetch failed:', err);
    } finally {
      setRecentLoading(false);
    }
  }, [house]);

  useEffect(() => {
    loadKPIs();
    loadRecentActivity();
  }, [loadKPIs, loadRecentActivity]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  // Reset filters
  const handleResetFilters = () => {
    setStateFilter('');
    setDistrictFilter('');
    setConstituencyFilter('');
    setMpFilter('');
    setFyFilter('all');
    setRiskFilter('all');
    setCategoryFilter('all');
    setStatusFilter('all');
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
  };

  const handleHouseChange = (newHouse: 'Lok Sabha' | 'Rajya Sabha') => {
    if (newHouse === house) return;
    setHouse(newHouse);
    setPage(1);
  };

  return (
    <div className="w-full space-y-6 pb-16 animate-fade-in">
      {/* ==================================================================== */}
      {/* 1. HEADER: VERIFICATION DESK */}
      {/* ==================================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#090d16] via-[#111827] to-[#1e113a] p-6 md:p-8 border border-purple-900/40 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 tracking-wider uppercase">
              <Scale className="w-4 h-4" />
              <span>MPLADS SENTINEL &bull; Human Verification Layer</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3"
                style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <span>Verification Desk</span>
              <span className="text-xs px-3 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-700/60 font-medium">
                Auditor / Verification Officer
              </span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Risk &amp; Anomaly Verification Workspace &bull; Review algorithmic indicators, inspect Why Attention evidence, mandate site inspections, and record binding audit decisions.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Officer:</span>
                <strong className="text-slate-200">{auditorName}</strong>
              </div>
              <span>&bull;</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Authorized Scope:</span>
                <strong className="text-purple-300">{authorizedScope}</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Workspace Mode Switch */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
              <button
                onClick={() => setDeskView('algorithmic-anomalies')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  deskView === 'algorithmic-anomalies'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-950 border border-purple-500'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                Anomaly Verification Queue
              </button>
              <button
                onClick={() => setDeskView('grievance-verification')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  deskView === 'grievance-verification'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-950 border border-purple-500'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <AlertCircle size={13} />
                <span>Grievance Verification Desk ({auditorComplaints.length})</span>
              </button>
            </div>

            {/* Current House Selector */}
            <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                Chamber:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleHouseChange('Lok Sabha')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    house === 'Lok Sabha'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-950 border border-purple-500'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Lok Sabha
                </button>
                <button
                  onClick={() => handleHouseChange('Rajya Sabha')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    house === 'Rajya Sabha'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-950 border border-purple-500'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Rajya Sabha
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* ==================================================================== */}
      {/* 2. SUMMARY KPI CARDS (Real Database Records) */}
      {/* ==================================================================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>Real Verification Ledger Metrics</span>
          </div>
          <span className="text-[10px] text-slate-400">
            Source: PostgreSQL Canonical Projects Database
          </span>
        </div>

        {kpiError ? (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold">Database Metric Retrieval Alert</p>
              <p className="text-[11px] opacity-90">{kpiError}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {/* 1. Cases Awaiting Review */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Awaiting Review</span>
                <Clock className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {kpiLoading ? '…' : (kpis?.casesAwaitingReview ?? 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Pending first examination</div>
            </div>

            {/* 2. High Risk Cases */}
            <div className="bg-slate-900/90 border border-rose-900/50 rounded-xl p-4 hover:border-rose-700/60 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">High Risk</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-rose-400">
                {kpiLoading ? '…' : (kpis?.highRiskCases ?? 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Top priority scrutiny</div>
            </div>

            {/* 3. Medium Risk Cases */}
            <div className="bg-slate-900/90 border border-amber-900/40 rounded-xl p-4 hover:border-amber-700/60 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Medium Risk</span>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-amber-400">
                {kpiLoading ? '…' : (kpis?.mediumRiskCases ?? 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Elevated attention</div>
            </div>

            {/* 4. Inspection Requested */}
            <div className="bg-slate-900/90 border border-purple-900/40 rounded-xl p-4 hover:border-purple-700/60 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Inspection</span>
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-purple-400">
                {kpiLoading ? '…' : (kpis?.inspectionRequested ?? 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Site inspections ordered</div>
            </div>

            {/* 5. Under Review */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Under Review</span>
                <FileText className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-cyan-300">
                {kpiLoading ? '…' : (kpis?.underReview ?? 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Active case evaluation</div>
            </div>

            {/* 6. Verified */}
            <div className="bg-slate-900/90 border border-emerald-900/40 rounded-xl p-4 hover:border-emerald-700/60 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Verified</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">
                {kpiLoading ? '…' : (kpis?.verified ?? 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Cleared by verification</div>
            </div>

            {/* 7. Needs Further Investigation */}
            <div className="bg-slate-900/90 border border-rose-900/40 rounded-xl p-4 hover:border-rose-700/60 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">Investigation</span>
                <AlertCircle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-rose-500">
                {kpiLoading ? '…' : (kpis?.needsFurtherInvestigation ?? 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Escalated for deep inquiry</div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 2b. GRIEVANCE VERIFICATION DESK                                      */}
      {/* ==================================================================== */}
      {deskView === 'grievance-verification' && (
        <div className="bg-[#0f172a] border border-purple-900/60 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                <Scale className="w-4 h-4" />
                <span>Independent Auditor Grievance Verification Queue</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Referred Citizen Grievance Cases
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Official grievances referred by District Authorities requiring neutral physical &amp; ledger verification before final order.
              </p>
            </div>
            <button
              onClick={fetchAuditorComplaints}
              disabled={auditorComplaintsLoading}
              className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700/60 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${auditorComplaintsLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Queue</span>
            </button>
          </div>

          {auditorComplaintsLoading ? (
            <div className="py-12 text-center text-slate-400">
              <RotateCcw className="w-6 h-6 animate-spin text-purple-400 mx-auto mb-2" />
              <p className="text-xs font-semibold">Retrieving referred grievance cases…</p>
            </div>
          ) : auditorComplaints.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-950/60 rounded-xl border border-dashed border-slate-800 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Grievances Requiring Audit Verification</h3>
              <p className="text-xs max-w-md mx-auto">
                No active citizen grievances are currently flagged with status <code>VERIFICATION_REQUIRED</code>.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {auditorComplaints.map((item) => (
                <div
                  key={item.complaintId}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 hover:border-purple-600/70 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                        {item.complaintId}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                        {item.category}
                      </span>
                      <span className="font-mono text-xs text-white font-semibold">
                        Work ID: {item.workId}
                      </span>
                      {item.district && (
                        <span className="text-[11px] text-slate-400">
                          · {item.district}, {item.state}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-700 uppercase">
                      VERIFICATION REQUIRED
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Sanctioned Work Description:</span>
                    <p className="text-xs font-bold text-slate-200">{item.workDescription}</p>
                  </div>

                  <div className="p-2.5 bg-amber-950/30 rounded-lg border border-amber-900/50 text-xs text-amber-200 space-y-1">
                    <span className="font-bold text-[10px] uppercase text-amber-400 block">Citizen Allegation / Observation:</span>
                    <p className="italic">"{item.description}"</p>
                  </div>

                  {item.publicResponse && (
                    <div className="p-2.5 bg-purple-950/30 rounded-lg border border-purple-900/50 text-xs text-purple-200 space-y-1">
                      <span className="font-bold text-[10px] uppercase text-purple-400 block">District Authority Inquiry / Referral Note:</span>
                      <p>{item.publicResponse}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={() => {
                        setSelectedAuditorComplaint(item);
                        setAuditorOutcome('VERIFIED');
                        setAuditorRemarksInput('');
                        setAuditorErrorMsg(null);
                        setAuditorSuccessMsg(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-950 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Conduct Verification Assessment</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. OFFICIAL FILTER BAR (Visible in Anomaly Verification Queue mode) */}
      {/* ==================================================================== */}
      {deskView === 'algorithmic-anomalies' && (
      <>
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Filter className="w-4 h-4 text-purple-400" />
            <span>Official Scrutiny Filters &bull; Server Query Controls</span>
          </div>


          <div className="flex items-center gap-3">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search box */}
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Search Work ID / Title / MP / District
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search case records..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* State filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              State Jurisdiction
            </label>
            <select
              value={stateFilter}
              onChange={e => { setStateFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="">All States / UTs</option>
              {ALL_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* District filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              District
            </label>
            <input
              type="text"
              placeholder="e.g. Varanasi, Gangtok..."
              value={districtFilter}
              onChange={e => { setDistrictFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Constituency filter (Lok Sabha only) */}
          {house === 'Lok Sabha' ? (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Constituency
              </label>
              <input
                type="text"
                placeholder="e.g. VARANASI, SIKKIM..."
                value={constituencyFilter}
                onChange={e => { setConstituencyFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Hon'ble MP
              </label>
              <input
                type="text"
                placeholder="Filter by MP Name..."
                value={mpFilter}
                onChange={e => { setMpFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          {/* Risk Level Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Risk Severity Level
            </label>
            <select
              value={riskFilter}
              onChange={e => { setRiskFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">HIGH Risk (Score &gt; 50)</option>
              <option value="medium">MEDIUM Risk (Score 20–50)</option>
              <option value="low">LOW Risk (Score &lt; 20)</option>
            </select>
          </div>

          {/* Anomaly Category */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Anomaly Category
            </label>
            <select
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">All Anomaly Categories</option>
              <option value="cost">Cost Outlier (&gt; ₹25 Lakhs)</option>
              <option value="stale">Stale Status (&gt; 180 Days Delay)</option>
              <option value="disbursement">Disbursement Anomaly (&gt; 80% with Incomplete Work)</option>
              <option value="pending">Pending Sanction Flag</option>
              <option value="vendor">Vendor Concentration Check</option>
            </select>
          </div>

          {/* Verification Status */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Verification Status
            </label>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">All Verification Statuses</option>
              <option value="New Alert">New Alert (Awaiting Review)</option>
              <option value="Under Review">Under Review</option>
              <option value="Inspection Requested">Inspection Requested</option>
              <option value="Verified">Verified (Clear)</option>
              <option value="Needs Further Investigation">Needs Further Investigation</option>
              <option value="Dismissed">Dismissed</option>
            </select>
          </div>

          {/* Financial Year */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Financial Year
            </label>
            <select
              value={fyFilter}
              onChange={e => { setFyFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {FY_OPTIONS.map(fy => (
                <option key={fy} value={fy}>{fy === 'all' ? 'All Financial Years' : fy}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. VERIFICATION QUEUE (Full-width, Server-Side Paginated) */}
      {/* ==================================================================== */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-0">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#090d16]">
          <div className="flex items-center gap-3">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Verification Queue</span>
            </h3>
            <span className="px-3 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60 text-xs font-mono font-bold">
              {totalCount.toLocaleString()} total cases
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Page size:</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>

        {queueLoading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">Loading verification cases…</p>
          </div>
        ) : queueError ? (
          <div className="py-20 text-center max-w-md mx-auto space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-bold text-white">Unable to load verification cases.</p>
            <p className="text-xs text-slate-400">{queueError}</p>
          </div>
        ) : queue.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm max-w-md mx-auto space-y-2">
            <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-semibold text-white">No verification cases match the selected filters.</p>
            <p className="text-xs text-slate-500">Try broadening your geographic, risk, or status filter parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090d16] text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Work ID</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">MP &amp; House</th>
                  <th className="py-3.5 px-4">Anomaly Type</th>
                  <th className="py-3.5 px-4">Risk Score &amp; Level</th>
                  <th className="py-3.5 px-4">Detected Date</th>
                  <th className="py-3.5 px-4">Verification Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {queue.map(row => (
                  <tr key={row.workId} className="hover:bg-slate-800/40 transition-colors">
                    {/* Priority */}
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.priority === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : row.priority === 'ELEVATED'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        {row.priority}
                      </span>
                    </td>

                    {/* Work ID & Description */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-mono text-xs font-bold text-purple-300 mb-0.5">{row.workId}</div>
                      <div className="text-slate-300 text-xs truncate max-w-xs" title={row.workDescription}>
                        {row.workDescription}
                      </div>
                    </td>

                    {/* State / District */}
                    <td className="py-3 px-4 text-xs">
                      <div className="font-medium text-slate-200">{row.district}</div>
                      <div className="text-slate-400 text-[11px]">{row.state}</div>
                    </td>

                    {/* MP & House */}
                    <td className="py-3 px-4 text-xs">
                      <div className="font-medium text-slate-200">{row.mp}</div>
                      <div className="text-slate-400 text-[11px]">{row.house}</div>
                    </td>

                    {/* Anomaly Type */}
                    <td className="py-3 px-4 max-w-xs text-xs">
                      <span className="font-semibold text-slate-200">{row.anomalyType}</span>
                    </td>

                    {/* Risk Score & Level */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold border ${
                        row.riskLevel === 'HIGH'
                          ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                          : row.riskLevel === 'MEDIUM'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      }`}>
                        {row.riskLevel} ({row.riskScore})
                      </span>
                    </td>

                    {/* Detected Date */}
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {formatDate(row.detectedDate)}
                    </td>

                    {/* Verification Status */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                        row.verificationStatus === 'Verified'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : row.verificationStatus === 'Inspection Requested'
                          ? 'bg-purple-950 text-purple-300 border-purple-800'
                          : row.verificationStatus === 'Under Review'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : row.verificationStatus === 'Needs Further Investigation'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}>
                        {row.verificationStatus}
                      </span>
                    </td>

                    {/* Action [ Review ] */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setReviewingWorkId(row.workId)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-950 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Server Pagination Bar */}
        <div className="p-4 border-t border-slate-800 bg-[#090d16] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{Math.min(totalCount, (page - 1) * pageSize + 1)}</strong> to{' '}
            <strong className="text-white">{Math.min(totalCount, page * pageSize)}</strong> of{' '}
            <strong className="text-white">{totalCount.toLocaleString()}</strong> cases
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || queueLoading}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1 font-mono font-bold text-white bg-slate-950 border border-slate-800 rounded-lg">
              Page {page} of {Math.max(1, totalPages)}
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || queueLoading}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. RECENT VERIFICATION ACTIVITY & RISK/ANOMALY SUMMARY */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Verification Activity (2 columns on large screens) */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <span>Recent Verification Activity &bull; Audit Trail Feed</span>
            </div>
            <span className="text-[10px] text-slate-400">Live Immutable Log</span>
          </div>

          {recentLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading recent activity…</div>
          ) : recentActivity.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No recent verification events recorded. Cases updated will appear here.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentActivity.map(act => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-purple-300">{act.work_id}</span>
                      <span className="text-slate-500">&bull;</span>
                      <span className="font-semibold text-white">{act.action}</span>
                      {act.new_status && (
                        <span className="px-2 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                          {act.new_status}
                        </span>
                      )}
                    </div>
                    {act.comment && (
                      <p className="text-slate-400 text-[11px] truncate max-w-xl">"{act.comment}"</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-semibold text-slate-300">{act.actor_name}</div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {act.created_at ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Risk / Anomaly Summary (1 column on large screens) */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Anomaly &amp; Risk Intelligence Summary</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">National Scrutiny Protocol</div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Risk scores are generated via canonical multi-factor scoring (cost outlier, stale timeline, disbursement ratio, and vendor concentration). Auditor decisions override AI indicators with binding legal audit trail records.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Decision Protocol Guidance</div>
              <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside">
                <li><strong className="text-amber-300">Under Review:</strong> For cases undergoing active file examination.</li>
                <li><strong className="text-purple-300">Inspection:</strong> Mandates physical site measurement verification.</li>
                <li><strong className="text-rose-300">Needs Investigation:</strong> Refers scheme for detailed administrative inquiry.</li>
                <li><strong className="text-emerald-300">Verified:</strong> Clears the case after satisfactory reconciliation.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </>
      )}


      {/* ==================================================================== */}
      {/* GRIEVANCE AUDIT ASSESSMENT MODAL                                     */}
      {/* ==================================================================== */}
      {selectedAuditorComplaint && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f172a] rounded-2xl border border-purple-800 shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-800">
                  Auditor Verification Desk
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Neutral Verification Finding Order
                </h3>
              </div>
              <button
                onClick={() => setSelectedAuditorComplaint(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Complaint: <strong className="font-mono text-purple-400">{selectedAuditorComplaint.complaintId}</strong></span>
                <span className="text-slate-400">Work ID: <strong className="font-mono text-white">{selectedAuditorComplaint.workId}</strong></span>
              </div>
              <p className="font-semibold text-slate-200">{selectedAuditorComplaint.workDescription}</p>
              <div className="p-2 rounded bg-amber-950/30 border border-amber-900/50 text-amber-200 text-[11px]">
                <strong>Citizen Allegation:</strong> "{selectedAuditorComplaint.description}"
              </div>
            </div>

            {auditorSuccessMsg && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 rounded-xl flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                <span>{auditorSuccessMsg}</span>
              </div>
            )}

            {auditorErrorMsg && (
              <div className="p-3 bg-rose-950/40 border border-rose-800 text-xs text-rose-300 rounded-xl flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
                <span>{auditorErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitAuditorFinding} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-white mb-1.5">
                  Neutral Audit Verification Outcome: <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'VERIFIED', label: 'VERIFIED', desc: 'Concern validated via physical / ledger reconciliation' },
                    { id: 'NEEDS FURTHER INVESTIGATION', label: 'NEEDS FURTHER INVESTIGATION', desc: 'Irregularities / discrepancies detected; recommends comprehensive inquiry' },
                    { id: 'INSUFFICIENT EVIDENCE', label: 'INSUFFICIENT EVIDENCE', desc: 'Available ground or financial records are inconclusive' },
                    { id: 'NO ISSUE ESTABLISHED', label: 'NO ISSUE ESTABLISHED', desc: 'Work executed in accordance with technical sanctions' },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      onClick={() => setAuditorOutcome(opt.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer block ${
                        auditorOutcome === opt.id
                          ? 'border-purple-500 bg-purple-950/60 text-white ring-1 ring-purple-500'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-[11px] text-purple-300">{opt.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{opt.desc}</div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-white mb-1">
                  Verification Findings &amp; Ledger Assessment Remarks: <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={auditorRemarksInput}
                  onChange={e => setAuditorRemarksInput(e.target.value)}
                  placeholder="Record your independent analysis: check of measurement book entries, voucher concordance, physical spot verification observations..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="p-2.5 bg-purple-950/40 rounded-xl border border-purple-800 text-[11px] text-purple-200">
                <strong>Governance Rule:</strong> Auditor verification outcomes are entered as neutral administrative findings and automatically forwarded back to the competent District Officer. Auditors cannot close citizen grievances.
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedAuditorComplaint(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={auditorSubmitting || !auditorRemarksInput.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-950 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {auditorSubmitting ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting Assessment…</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Submit Neutral Assessment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* CASE FILE MODAL (Opened on Review action) */}
      {/* ==================================================================== */}
      {reviewingWorkId && (
        <AuditorCaseFileModal
          workId={reviewingWorkId}
          house={house}
          onClose={() => setReviewingWorkId(null)}
          onStatusUpdated={() => {
            loadKPIs();
            loadQueue();
            loadRecentActivity();
          }}
        />
      )}
    </div>
  );
}

