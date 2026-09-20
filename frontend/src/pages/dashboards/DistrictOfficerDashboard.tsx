import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/store';
import {
  MapPin, AlertTriangle, CheckCircle2, TrendingUp,
  Layers, ShieldCheck, ArrowUpRight, RotateCw,
  Search, Building2, User, ChevronRight, AlertCircle,
  ExternalLink, FileText, CheckCircle, ArrowLeftRight,
  Filter, Clock, ShieldAlert, Eye, DollarSign
} from 'lucide-react';
import { formatCurrency } from '../../utils';
import {
  getDistrictOfficerOverview,
  type DistrictOfficerOverview,
  updateProjectVerification
} from '../../services/projectService';
import type { VerificationStatus } from '../../types';

export function DistrictOfficerDashboard() {
  const { profile, user } = useAuthStore();
  const { setCurrentPage, selectProject, setFilters, setActiveHouse } = useAppStore();

  const assignedDistrictRaw = profile?.district || 'VARANASI(DISTRICT MAGISTRAE VARANASI_IDA)';
  const assignedDistrictClean = assignedDistrictRaw.split('(')[0].trim();
  const assignedState = profile?.state || 'Uttar Pradesh';
  const officerName = profile?.full_name || `District Magistrate (${assignedDistrictClean})`;
  const officerEmail = user?.email || (profile as any)?.email || `${assignedDistrictClean.toLowerCase()}.district@mplads-demo.local`;

  const [house, setHouse] = useState<'Lok Sabha' | 'Rajya Sabha'>('Lok Sabha');
  const [overview, setOverview] = useState<DistrictOfficerOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [queueSearch, setQueueSearch] = useState<string>('');
  const [activeQueueTab, setActiveQueueTab] = useState<'all' | 'unverified' | 'high_risk' | 'stale' | 'cost' | 'disbursement'>('all');
  const [repSearch, setRepSearch] = useState<string>('');

  // Intra-district comparison state
  const [viewMode, setViewMode] = useState<'overview' | 'comparative'>('overview');
  const [compareConstituencyA, setCompareConstituencyA] = useState<string>('');
  const [compareConstituencyB, setCompareConstituencyB] = useState<string>('');

  // Inspection & Verification modal state
  const [inspectingWork, setInspectingWork] = useState<any | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('Under Review');
  const [verificationComment, setVerificationComment] = useState<string>('');
  const [isSavingVerification, setIsSavingVerification] = useState<boolean>(false);

  const loadData = async (targetHouse: 'Lok Sabha' | 'Rajya Sabha') => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDistrictOfficerOverview(targetHouse, assignedState, assignedDistrictRaw);
      setOverview(data);
      if (data.constituencies && data.constituencies.length >= 2) {
        setCompareConstituencyA(data.constituencies[0].constituency);
        setCompareConstituencyB(data.constituencies[1].constituency);
      }
    } catch (err: any) {
      console.error('Error fetching district officer overview:', err);
      setError(err?.message || 'Failed to load district dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(house);
  }, [house, assignedState, assignedDistrictRaw]);

  const kpis = overview?.kpis || {
    total: 0,
    totalSanctionAmount: 0,
    totalDisbursed: 0,
    completed: 0,
    highRisk: 0,
    medRisk: 0,
    lowRisk: 0,
    pendingSanction: 0,
    requiresVerification: 0,
    staleCount: 0,
    costAnomalies: 0,
    disbAnomalies: 0,
    avgRiskScore: 0,
  };

  const completionRate = kpis.total > 0 ? Math.round((kpis.completed / kpis.total) * 100) : 0;
  const disbursementRate = kpis.totalSanctionAmount > 0
    ? Math.round((kpis.totalDisbursed / kpis.totalSanctionAmount) * 100)
    : 0;

  // Filtered Priority Queue
  const filteredQueue = useMemo(() => {
    if (!overview?.priorityQueue) return [];
    return overview.priorityQueue.filter(item => {
      // Tab filter
      if (activeQueueTab === 'unverified') {
        const v = item.verification_status;
        if (v === 'Verified' || v === 'Resolved') return false;
      } else if (activeQueueTab === 'high_risk') {
        if (item.risk_level !== 'HIGH') return false;
      } else if (activeQueueTab === 'stale') {
        if (item.days_since_sanction <= 365 || item.work_status === 'Completed') return false;
      } else if (activeQueueTab === 'cost') {
        if (!item.risk_explanation.toLowerCase().includes('cost') && !item.risk_explanation.toLowerCase().includes('outlier')) return false;
      } else if (activeQueueTab === 'disbursement') {
        if (item.disbursement_ratio <= 1.0 && !item.risk_explanation.toLowerCase().includes('disburs')) return false;
      }

      // Text search
      if (!queueSearch.trim()) return true;
      const q = queueSearch.toLowerCase();
      return (
        item.work_id.toLowerCase().includes(q) ||
        item.work_description.toLowerCase().includes(q) ||
        item.mp_name.toLowerCase().includes(q) ||
        (item.constituency && item.constituency.toLowerCase().includes(q)) ||
        (item.vendor_name && item.vendor_name.toLowerCase().includes(q))
      );
    });
  }, [overview?.priorityQueue, activeQueueTab, queueSearch]);

  // Filtered constituencies / MPs
  const filteredConstituencies = useMemo(() => {
    if (!overview?.constituencies) return [];
    if (!repSearch.trim()) return overview.constituencies;
    const q = repSearch.toLowerCase();
    return overview.constituencies.filter(
      c => c.constituency.toLowerCase().includes(q) || c.mp_name.toLowerCase().includes(q)
    );
  }, [overview?.constituencies, repSearch]);

  const filteredMps = useMemo(() => {
    if (!overview?.mps) return [];
    if (!repSearch.trim()) return overview.mps;
    const q = repSearch.toLowerCase();
    return overview.mps.filter(m => m.mp_name.toLowerCase().includes(q));
  }, [overview?.mps, repSearch]);

  // Drilldown helper
  const handleDrilldown = (opts: { constituency?: string; mpName?: string; riskLevel?: string }) => {
    setActiveHouse(house);
    setFilters({
      state: assignedState,
      district: assignedDistrictClean,
      constituency: opts.constituency || '',
      mpName: opts.mpName || '',
      riskLevel: opts.riskLevel || '',
    });
    setCurrentPage('monitoring');
    window.history.pushState({}, '', '/monitoring');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Open Project Details in Monitoring Page
  const handleOpenProject = (workId: string) => {
    selectProject(workId);
    setCurrentPage('monitoring');
    window.history.pushState({}, '', '/monitoring');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Submit Inspection & Verification
  const handleSaveVerification = async () => {
    if (!inspectingWork) return;
    setIsSavingVerification(true);
    try {
      await updateProjectVerification(
        inspectingWork.work_id,
        house,
        verificationStatus,
        officerName,
        verificationComment
      );

      // Update local item in priority queue
      if (overview) {
        const updatedQueue = overview.priorityQueue.map(item => {
          if (item.work_id === inspectingWork.work_id) {
            return { ...item, verification_status: verificationStatus };
          }
          return item;
        });
        setOverview({ ...overview, priorityQueue: updatedQueue });
      }

      setInspectingWork(null);
      setVerificationComment('');
    } catch (err: any) {
      console.error('Error saving verification:', err);
      alert('Failed to save verification status: ' + err.message);
    } finally {
      setIsSavingVerification(false);
    }
  };

  // Comparative data
  const compDataA = useMemo(() => {
    return overview?.constituencies.find(c => c.constituency === compareConstituencyA) || null;
  }, [overview?.constituencies, compareConstituencyA]);

  const compDataB = useMemo(() => {
    return overview?.constituencies.find(c => c.constituency === compareConstituencyB) || null;
  }, [overview?.constituencies, compareConstituencyB]);

  return (
    <div className="space-y-6">
      {/* 1. Header with Official Authority */}
      <div className="bg-white border border-[#E9ECEF] rounded-sm p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-[#00204a] tracking-wider uppercase bg-[#EEF2F6] px-2.5 py-0.5 rounded-sm border border-[#D5DCE4]">
              District Officer Jurisdiction · MPLADS Sentinel
            </span>
            <span className="text-[10px] font-bold text-[#198754] bg-[#E8F5E9] px-2.5 py-0.5 rounded-sm border border-[#C8E6C9] flex items-center gap-1">
              <MapPin size={10} />
              District: {assignedDistrictClean} ({assignedState}) [LOCKED]
            </span>
            <span className="text-[10px] font-bold text-[#0D6EFD] bg-[#E7F1FF] px-2 py-0.5 rounded-sm border border-[#B6D4FE]">
              RLS STRICT BOUND
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#000a1f]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            District Monitoring & Executive Authority Desk
          </h1>
          <p className="text-xs text-[#747780] mt-1">
            Logged in as <strong>{officerName}</strong> ({officerEmail}) · Real-time local milestone tracking, contractor verification, and expenditure oversight.
          </p>
        </div>

        {/* House Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* House Pill */}
          <div className="flex bg-[#F1F3F5] p-0.5 rounded border border-[#DEE2E6]">
            <button
              onClick={() => setHouse('Lok Sabha')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 ${
                house === 'Lok Sabha'
                  ? 'bg-[#00204a] text-white shadow-sm'
                  : 'text-[#495057] hover:text-[#00204a]'
              }`}
            >
              Lok Sabha
            </button>
            <button
              onClick={() => setHouse('Rajya Sabha')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 ${
                house === 'Rajya Sabha'
                  ? 'bg-[#00204a] text-white shadow-sm'
                  : 'text-[#495057] hover:text-[#00204a]'
              }`}
            >
              Rajya Sabha
            </button>
          </div>

          <button
            onClick={() => {
              setCurrentPage('gis');
              window.history.pushState({}, '', '/gis');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="btn-outline text-xs flex items-center gap-1.5 py-1.5 px-3"
            title="View District GIS Geospatial Distribution"
          >
            <MapPin size={13} />
            District GIS Map
          </button>

          <button
            onClick={() => {
              setCurrentPage('analytics');
              window.history.pushState({}, '', '/analytics');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="btn-outline text-xs flex items-center gap-1.5 py-1.5 px-3"
            title="View District Analytics Observatory"
          >
            <TrendingUp size={13} />
            Analytics
          </button>

          <button
            onClick={() => loadData(house)}
            disabled={loading}
            className="btn-outline text-xs flex items-center gap-1.5 py-1.5 px-2.5"
            title="Refresh Data from Supabase"
          >
            <RotateCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 2. Locked Official Scope Filter Banner */}
      <div className="bg-[#F8F9FA] border border-[#DEE2E6] rounded-sm px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#495057] uppercase tracking-wider">State:</span>
            <span className="font-semibold text-[#00204a] bg-white px-2.5 py-1 rounded border border-[#CED4DA] shadow-2xs">
              {assignedState}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#495057] uppercase tracking-wider">District:</span>
            <span className="font-bold text-[#00204a] bg-white px-2.5 py-1 rounded border border-[#CED4DA] shadow-2xs">
              {assignedDistrictClean}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#6C757D]">
            <span className="text-[11px]">IDA Reference:</span>
            <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-[#E9ECEF]">
              {assignedDistrictRaw}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#28A745] font-semibold flex items-center gap-1">
            <CheckCircle size={13} />
            Data Isolation: 100% District-Bound
          </span>
          <div className="h-3.5 w-px bg-[#CED4DA]"></div>
          <span className="text-[11px] text-[#6C757D]">
            House: <strong className="text-[#00204a]">{house}</strong>
          </span>
        </div>
      </div>

      {/* Error state alert */}
      {error && (
        <div className="bg-[#FFF5F5] border border-[#FFC9C9] rounded-sm p-4 text-[#C92A2A] flex items-center gap-3 text-xs">
          <AlertCircle size={18} />
          <div>
            <strong>Error loading district records:</strong> {error}
          </div>
        </div>
      )}

      {/* View Mode Toggle: Overview vs Intra-District Comparison */}
      <div className="flex border-b border-[#DEE2E6] gap-6 text-sm font-semibold">
        <button
          onClick={() => setViewMode('overview')}
          className={`pb-2.5 flex items-center gap-2 transition-all ${
            viewMode === 'overview'
              ? 'border-b-2 border-[#00204a] text-[#00204a]'
              : 'text-[#6C757D] hover:text-[#00204a]'
          }`}
        >
          <Building2 size={16} />
          District Action & Inspection Center
        </button>

        {house === 'Lok Sabha' && overview?.constituencies && overview.constituencies.length >= 2 && (
          <button
            onClick={() => setViewMode('comparative')}
            className={`pb-2.5 flex items-center gap-2 transition-all ${
              viewMode === 'comparative'
                ? 'border-b-2 border-[#00204a] text-[#00204a]'
                : 'text-[#6C757D] hover:text-[#00204a]'
            }`}
          >
            <ArrowLeftRight size={16} />
            Intra-District Constituency Comparison
          </button>
        )}
      </div>

      {/* 3. Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Works */}
        <div className="card p-4 bg-white border border-[#E9ECEF] rounded-sm shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6C757D] uppercase tracking-wider">
              Total District Works
            </span>
            <div className="p-2 bg-[#EEF2F6] rounded text-[#00204a]">
              <Building2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#000a1f] mt-2 font-mono">
            {kpis.total.toLocaleString()}
          </div>
          <div className="mt-2.5">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-[#6C757D]">{kpis.completed.toLocaleString()} Completed</span>
              <span className="font-bold text-[#28A745]">{completionRate}%</span>
            </div>
            <div className="w-full bg-[#E9ECEF] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#28A745] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(completionRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Financial Sanctions & Disbursements */}
        <div className="card p-4 bg-white border border-[#E9ECEF] rounded-sm shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6C757D] uppercase tracking-wider">
              Sanctioned & Disbursed
            </span>
            <div className="p-2 bg-[#E7F1FF] rounded text-[#0D6EFD]">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#000a1f] mt-2 font-mono">
            {formatCurrency(kpis.totalSanctionAmount)}
          </div>
          <div className="mt-2.5 text-[11px] text-[#495057] flex items-center justify-between">
            <span>Disbursed: <strong>{formatCurrency(kpis.totalDisbursed)}</strong></span>
            <span className="font-bold text-[#0D6EFD]">{disbursementRate}%</span>
          </div>
          <div className="w-full bg-[#E9ECEF] h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-[#0D6EFD] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(disbursementRate, 100)}%` }}
            />
          </div>
        </div>

        {/* High Risk & Anomalies */}
        <div className="card p-4 bg-white border border-[#E9ECEF] rounded-sm shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6C757D] uppercase tracking-wider">
              High Risk & Anomalies
            </span>
            <div className="p-2 bg-[#FFF5F5] rounded text-[#DC3545]">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#DC3545] mt-2 font-mono flex items-baseline gap-2">
            <span>{kpis.highRisk.toLocaleString()}</span>
            <span className="text-xs font-normal text-[#6C757D]">
              ({kpis.total > 0 ? Math.round((kpis.highRisk / kpis.total) * 100) : 0}% of works)
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
            <span className="bg-[#FFF0F2] text-[#DC3545] px-1.5 py-0.5 rounded font-semibold border border-[#FFD8D8]">
              {kpis.staleCount} Stale
            </span>
            <span className="bg-[#FFF9DB] text-[#F08C00] px-1.5 py-0.5 rounded font-semibold border border-[#FFE066]">
              {kpis.costAnomalies} Cost
            </span>
            <span className="bg-[#E7F5FF] text-[#1971C2] px-1.5 py-0.5 rounded font-semibold border border-[#D0EBFF]">
              {kpis.disbAnomalies} Disb
            </span>
          </div>
        </div>

        {/* Verification Priority Desk */}
        <div className="card p-4 bg-white border border-[#E9ECEF] rounded-sm shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6C757D] uppercase tracking-wider">
              Verification Priority Queue
            </span>
            <div className="p-2 bg-[#F3E8FF] rounded text-[#7950F2]">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#000a1f] mt-2 font-mono">
            {kpis.requiresVerification.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-[#6C757D]">District Avg Risk Score:</span>
            <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
              kpis.avgRiskScore >= 50 ? 'bg-[#DC3545] text-white' : kpis.avgRiskScore >= 25 ? 'bg-[#FFC107] text-black' : 'bg-[#28A745] text-white'
            }`}>
              {kpis.avgRiskScore}/100
            </span>
          </div>
        </div>
      </div>

      {viewMode === 'overview' ? (
        <>
          {/* 4. District Action Center & Priority Inspection Queue */}
          <div className="bg-white border border-[#E9ECEF] rounded-sm shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E9ECEF] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#FCFCFD]">
              <div>
                <h2 className="text-base font-bold text-[#000a1f] flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#00204a]" />
                  Priority Inspection Queue & Anomaly Resolution Desk
                </h2>
                <p className="text-xs text-[#6C757D] mt-0.5">
                  Top prioritized works requiring physical inspection, milestone verification, or expenditure audit in {assignedDistrictClean}.
                </p>
              </div>

              {/* Search in Priority Queue */}
              <div className="relative min-w-[260px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB5BD]" />
                <input
                  type="text"
                  placeholder="Search work ID, MP, vendor..."
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-[#CED4DA] focus:outline-none focus:border-[#00204a]"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 pt-3 pb-2 flex flex-wrap items-center gap-2 border-b border-[#E9ECEF] bg-[#F8F9FA] text-xs">
              <span className="text-[11px] font-bold text-[#6C757D] mr-1 uppercase">Filter:</span>
              <button
                onClick={() => setActiveQueueTab('all')}
                className={`px-3 py-1 rounded-sm font-semibold transition-all ${
                  activeQueueTab === 'all'
                    ? 'bg-[#00204a] text-white'
                    : 'bg-white text-[#495057] border border-[#CED4DA] hover:bg-[#F1F3F5]'
                }`}
              >
                All Prioritized ({overview?.priorityQueue?.length || 0})
              </button>
              <button
                onClick={() => setActiveQueueTab('unverified')}
                className={`px-3 py-1 rounded-sm font-semibold transition-all ${
                  activeQueueTab === 'unverified'
                    ? 'bg-[#00204a] text-white'
                    : 'bg-white text-[#495057] border border-[#CED4DA] hover:bg-[#F1F3F5]'
                }`}
              >
                Requires Verification ({kpis.requiresVerification})
              </button>
              <button
                onClick={() => setActiveQueueTab('high_risk')}
                className={`px-3 py-1 rounded-sm font-semibold transition-all ${
                  activeQueueTab === 'high_risk'
                    ? 'bg-[#DC3545] text-white'
                    : 'bg-white text-[#DC3545] border border-[#FFC9C9] hover:bg-[#FFF5F5]'
                }`}
              >
                High Risk ({kpis.highRisk})
              </button>
              <button
                onClick={() => setActiveQueueTab('stale')}
                className={`px-3 py-1 rounded-sm font-semibold transition-all ${
                  activeQueueTab === 'stale'
                    ? 'bg-[#00204a] text-white'
                    : 'bg-white text-[#495057] border border-[#CED4DA] hover:bg-[#F1F3F5]'
                }`}
              >
                Stale (&gt;365d) ({kpis.staleCount})
              </button>
              <button
                onClick={() => setActiveQueueTab('cost')}
                className={`px-3 py-1 rounded-sm font-semibold transition-all ${
                  activeQueueTab === 'cost'
                    ? 'bg-[#00204a] text-white'
                    : 'bg-white text-[#495057] border border-[#CED4DA] hover:bg-[#F1F3F5]'
                }`}
              >
                Cost Outliers ({kpis.costAnomalies})
              </button>
              <button
                onClick={() => setActiveQueueTab('disbursement')}
                className={`px-3 py-1 rounded-sm font-semibold transition-all ${
                  activeQueueTab === 'disbursement'
                    ? 'bg-[#00204a] text-white'
                    : 'bg-white text-[#495057] border border-[#CED4DA] hover:bg-[#F1F3F5]'
                }`}
              >
                Disbursement Issues ({kpis.disbAnomalies})
              </button>
            </div>

            {/* Queue Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA] text-[#495057] border-b border-[#E9ECEF]">
                    <th className="py-2.5 px-3 font-bold">Work ID & Description</th>
                    {house === 'Lok Sabha' && <th className="py-2.5 px-3 font-bold">Constituency</th>}
                    <th className="py-2.5 px-3 font-bold">Hon'ble MP</th>
                    <th className="py-2.5 px-3 font-bold text-right">Sanctioned</th>
                    <th className="py-2.5 px-3 font-bold text-right">Disbursed</th>
                    <th className="py-2.5 px-3 font-bold text-center">Risk Score</th>
                    <th className="py-2.5 px-3 font-bold">Status & Anomalies</th>
                    <th className="py-2.5 px-3 font-bold">Verification Status</th>
                    <th className="py-2.5 px-3 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9ECEF]">
                  {filteredQueue.length === 0 ? (
                    <tr>
                      <td colSpan={house === 'Lok Sabha' ? 9 : 8} className="py-8 text-center text-[#6C757D]">
                        No works match the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredQueue.map((item) => (
                      <tr key={item.work_id} className="hover:bg-[#F8F9FA] transition-colors">
                        <td className="py-3 px-3 max-w-xs">
                          <div className="font-mono font-bold text-[#00204a] text-[11px]">
                            {item.work_id}
                          </div>
                          <div className="text-[#495057] truncate text-[11px] mt-0.5" title={item.work_description}>
                            {item.work_description}
                          </div>
                          {item.vendor_name && (
                            <div className="text-[10px] text-[#6C757D] mt-0.5 truncate">
                              Vendor: {item.vendor_name}
                            </div>
                          )}
                        </td>

                        {house === 'Lok Sabha' && (
                          <td className="py-3 px-3 font-semibold text-[#00204a]">
                            {item.constituency || 'District Wide'}
                          </td>
                        )}

                        <td className="py-3 px-3 font-medium text-[#495057]">
                          {item.mp_name}
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-[#00204a]">
                          {formatCurrency(item.sanction_amount)}
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-[#495057]">
                          <div>{formatCurrency(item.total_paid)}</div>
                          <div className="text-[10px] text-[#6C757D]">
                            {item.disbursement_ratio ? `${Math.round(item.disbursement_ratio * 100)}%` : '0%'}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                              item.risk_level === 'HIGH'
                                ? 'bg-[#DC3545] text-white'
                                : item.risk_level === 'MEDIUM'
                                ? 'bg-[#FFC107] text-[#000a1f]'
                                : 'bg-[#28A745] text-white'
                            }`}
                          >
                            {item.risk_score}/100 ({item.risk_level})
                          </span>
                        </td>

                        <td className="py-3 px-3 max-w-[200px]">
                          <div className="text-[10px] text-[#6C757D]">
                            Status: <strong>{item.work_status}</strong> ({item.days_since_sanction}d)
                          </div>
                          <div className="text-[10px] text-[#C92A2A] mt-0.5 truncate" title={item.risk_explanation}>
                            {item.risk_explanation}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.verification_status === 'Verified'
                                ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                                : item.verification_status === 'Under Review'
                                ? 'bg-[#FFF9DB] text-[#F08C00] border border-[#FFE066]'
                                : item.verification_status === 'Inspection Requested'
                                ? 'bg-[#F3E8FF] text-[#7950F2] border border-[#E5DBFF]'
                                : item.verification_status === 'Rejected'
                                ? 'bg-[#FFF5F5] text-[#DC3545] border border-[#FFC9C9]'
                                : 'bg-[#F1F3F5] text-[#495057] border border-[#CED4DA]'
                            }`}
                          >
                            {item.verification_status || 'New Alert'}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setInspectingWork(item);
                                setVerificationStatus((item.verification_status as VerificationStatus) || 'Under Review');
                              }}
                              className="px-2.5 py-1 bg-[#00204a] text-white rounded text-[10px] font-bold hover:bg-[#003366] transition-colors"
                              title="Inspect and change verification status"
                            >
                              Inspect
                            </button>
                            <button
                              onClick={() => handleOpenProject(item.work_id)}
                              className="p-1 text-[#6C757D] hover:text-[#00204a] rounded border border-[#CED4DA] hover:bg-[#F8F9FA]"
                              title="Open Project Intelligence"
                            >
                              <ExternalLink size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Constituency Breakdown & MP Representation Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Constituencies Table (Lok Sabha) */}
            {house === 'Lok Sabha' && (
              <div className="bg-white border border-[#E9ECEF] rounded-sm shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#E9ECEF] flex items-center justify-between bg-[#FCFCFD]">
                  <div>
                    <h3 className="text-sm font-bold text-[#000a1f] flex items-center gap-2">
                      <Layers size={16} className="text-[#00204a]" />
                      Constituency Breakdown ({overview?.constituencies.length || 0})
                    </h3>
                    <p className="text-xs text-[#6C757D]">
                      Parliamentary constituencies overlapping {assignedDistrictClean} district
                    </p>
                  </div>
                  <div className="relative min-w-[150px]">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#ADB5BD]" />
                    <input
                      type="text"
                      placeholder="Filter..."
                      value={repSearch}
                      onChange={(e) => setRepSearch(e.target.value)}
                      className="w-full pl-7 pr-2 py-1 text-xs rounded border border-[#CED4DA] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-[#F8F9FA] z-10">
                      <tr className="border-b border-[#E9ECEF] text-[#495057]">
                        <th className="py-2 px-3 font-bold">Constituency</th>
                        <th className="py-2 px-3 font-bold">Hon'ble MP</th>
                        <th className="py-2 px-3 font-bold text-center">Works</th>
                        <th className="py-2 px-3 font-bold text-right">Sanctioned</th>
                        <th className="py-2 px-3 font-bold text-center">High Risk</th>
                        <th className="py-2 px-3 font-bold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9ECEF]">
                      {filteredConstituencies.map((c) => (
                        <tr key={c.constituency} className="hover:bg-[#F8F9FA] transition-colors">
                          <td className="py-2.5 px-3 font-bold text-[#00204a]">
                            {c.constituency}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-[#495057]">
                            {c.mp_name}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold">
                            {c.total}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-[#00204a] font-semibold">
                            {formatCurrency(c.sanctioned)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              c.high_risk > 0 ? 'bg-[#FFF5F5] text-[#DC3545] border border-[#FFC9C9]' : 'text-[#28A745]'
                            }`}>
                              {c.high_risk}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => handleDrilldown({ constituency: c.constituency })}
                              className="text-[#00204a] hover:underline font-bold text-[11px] flex items-center justify-center gap-1 mx-auto"
                            >
                              Explore <ChevronRight size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MP Representation Table */}
            <div className={`bg-white border border-[#E9ECEF] rounded-sm shadow-sm overflow-hidden ${house === 'Rajya Sabha' ? 'lg:col-span-2' : ''}`}>
              <div className="p-4 border-b border-[#E9ECEF] flex items-center justify-between bg-[#FCFCFD]">
                <div>
                  <h3 className="text-sm font-bold text-[#000a1f] flex items-center gap-2">
                    <User size={16} className="text-[#00204a]" />
                    Hon'ble Member of Parliament Representation ({overview?.mps.length || 0})
                  </h3>
                  <p className="text-xs text-[#6C757D]">
                    MPs with active or completed development works in {assignedDistrictClean}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-[#F8F9FA] z-10">
                    <tr className="border-b border-[#E9ECEF] text-[#495057]">
                      <th className="py-2 px-3 font-bold">Hon'ble MP Name</th>
                      <th className="py-2 px-3 font-bold text-center">Works</th>
                      <th className="py-2 px-3 font-bold text-right">Sanctioned</th>
                      <th className="py-2 px-3 font-bold text-right">Disbursed</th>
                      <th className="py-2 px-3 font-bold text-center">High Risk</th>
                      <th className="py-2 px-3 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9ECEF]">
                    {filteredMps.map((m) => (
                      <tr key={m.mp_name} className="hover:bg-[#F8F9FA] transition-colors">
                        <td className="py-2.5 px-3 font-bold text-[#00204a]">
                          {m.mp_name}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold">
                          {m.total}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#00204a] font-semibold">
                          {formatCurrency(m.sanctioned)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#495057]">
                          {formatCurrency(m.disbursed)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            m.high_risk > 0 ? 'bg-[#FFF5F5] text-[#DC3545] border border-[#FFC9C9]' : 'text-[#28A745]'
                          }`}>
                            {m.high_risk}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => handleDrilldown({ mpName: m.mp_name })}
                            className="text-[#00204a] hover:underline font-bold text-[11px] flex items-center justify-center gap-1 mx-auto"
                          >
                            Explore <ChevronRight size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* 6. Intra-District Constituency Comparative Intelligence */
        <div className="bg-white border border-[#E9ECEF] rounded-sm shadow-sm p-5 space-y-5">
          <div className="border-b border-[#E9ECEF] pb-3">
            <h2 className="text-base font-bold text-[#000a1f] flex items-center gap-2">
              <ArrowLeftRight size={18} className="text-[#00204a]" />
              Intra-District Constituency Comparative Intelligence
            </h2>
            <p className="text-xs text-[#6C757D] mt-0.5">
              Perform side-by-side comparative diagnostics across parliamentary constituencies within {assignedDistrictClean} district.
            </p>
          </div>

          {/* Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#495057] mb-1">
                Select Constituency A:
              </label>
              <select
                value={compareConstituencyA}
                onChange={(e) => setCompareConstituencyA(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-[#CED4DA] bg-white font-semibold text-[#00204a]"
              >
                {overview?.constituencies.map((c) => (
                  <option key={c.constituency} value={c.constituency}>
                    {c.constituency} ({c.mp_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#495057] mb-1">
                Select Constituency B:
              </label>
              <select
                value={compareConstituencyB}
                onChange={(e) => setCompareConstituencyB(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-[#CED4DA] bg-white font-semibold text-[#00204a]"
              >
                {overview?.constituencies.map((c) => (
                  <option key={c.constituency} value={c.constituency}>
                    {c.constituency} ({c.mp_name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Side by side comparison table */}
          {compDataA && compDataB && (
            <div className="overflow-x-auto border border-[#E9ECEF] rounded">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA] border-b border-[#E9ECEF]">
                    <th className="py-2.5 px-4 font-bold text-[#495057] w-1/3">Benchmark Metric</th>
                    <th className="py-2.5 px-4 font-bold text-[#00204a] text-center w-1/3 bg-[#F1F3F5]">
                      {compDataA.constituency}
                    </th>
                    <th className="py-2.5 px-4 font-bold text-[#00204a] text-center w-1/3 bg-[#E9ECEF]">
                      {compDataB.constituency}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9ECEF]">
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-[#495057]">Hon'ble MP</td>
                    <td className="py-2.5 px-4 text-center font-medium">{compDataA.mp_name}</td>
                    <td className="py-2.5 px-4 text-center font-medium">{compDataB.mp_name}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-[#495057]">Total Works Count</td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold">{compDataA.total}</td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold">{compDataB.total}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-[#495057]">Sanctioned Amount</td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-[#00204a]">
                      {formatCurrency(compDataA.sanctioned)}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-[#00204a]">
                      {formatCurrency(compDataB.sanctioned)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-[#495057]">Total Disbursed</td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-[#0D6EFD]">
                      {formatCurrency(compDataA.disbursed)}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-[#0D6EFD]">
                      {formatCurrency(compDataB.disbursed)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-[#495057]">Completed Works</td>
                    <td className="py-2.5 px-4 text-center font-mono text-[#28A745] font-bold">
                      {compDataA.completed} ({compDataA.total > 0 ? Math.round((compDataA.completed / compDataA.total) * 100) : 0}%)
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono text-[#28A745] font-bold">
                      {compDataB.completed} ({compDataB.total > 0 ? Math.round((compDataB.completed / compDataB.total) * 100) : 0}%)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-[#495057]">High Risk Works</td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-[#DC3545]">
                      {compDataA.high_risk}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-[#DC3545]">
                      {compDataB.high_risk}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-[#495057]">Average Risk Score</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#EEF2F6] text-[#00204a]">
                        {compDataA.avg_risk}/100
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#EEF2F6] text-[#00204a]">
                        {compDataB.avg_risk}/100
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 7. Interactive Inspection & Verification Modal */}
      {inspectingWork && (
        <div className="fixed inset-0 z-50 bg-[#000a1f]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-sm border border-[#CED4DA] shadow-xl max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#E9ECEF] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#00204a] uppercase tracking-wider bg-[#EEF2F6] px-2 py-0.5 rounded">
                  Official Verification Action
                </span>
                <h3 className="text-base font-bold text-[#000a1f] mt-1">
                  Physical Inspection & Compliance Order
                </h3>
              </div>
              <button
                onClick={() => setInspectingWork(null)}
                className="text-[#ADB5BD] hover:text-[#000a1f] text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            {/* Work Details Summary */}
            <div className="bg-[#F8F9FA] p-3 rounded border border-[#E9ECEF] text-xs space-y-1.5">
              <div>
                <span className="text-[#6C757D]">Work ID: </span>
                <strong className="font-mono text-[#00204a]">{inspectingWork.work_id}</strong>
              </div>
              <div>
                <span className="text-[#6C757D]">Description: </span>
                <span className="text-[#495057]">{inspectingWork.work_description}</span>
              </div>
              <div className="flex flex-wrap gap-4 pt-1">
                <div>
                  <span className="text-[#6C757D]">Sanctioned: </span>
                  <strong className="font-mono text-[#00204a]">{formatCurrency(inspectingWork.sanction_amount)}</strong>
                </div>
                <div>
                  <span className="text-[#6C757D]">Paid: </span>
                  <strong className="font-mono text-[#495057]">{formatCurrency(inspectingWork.total_paid)}</strong>
                </div>
                <div>
                  <span className="text-[#6C757D]">Risk: </span>
                  <strong className={`font-mono ${inspectingWork.risk_level === 'HIGH' ? 'text-[#DC3545]' : 'text-[#F08C00]'}`}>
                    {inspectingWork.risk_score}/100 ({inspectingWork.risk_level})
                  </strong>
                </div>
              </div>
              {inspectingWork.risk_explanation && (
                <div className="text-[11px] text-[#C92A2A] bg-white p-2 rounded border border-[#FFD8D8] mt-1">
                  <strong>Risk Anomaly Flags:</strong> {inspectingWork.risk_explanation}
                </div>
              )}
            </div>

            {/* Verification Status Choice */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-[#495057]">Update Official Status:</label>
              <select
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
                className="w-full px-3 py-2 rounded border border-[#CED4DA] bg-white text-xs font-semibold text-[#00204a] focus:outline-none focus:border-[#00204a]"
              >
                <option value="Under Review">Under Review (Collectorate Scrutiny)</option>
                <option value="Inspection Requested">Inspection Requested (Depute Field Engineer)</option>
                <option value="Verified">Verified & Cleared (Physical Milestone Validated)</option>
                <option value="Rejected">Rejected / Work Halted (Irregularity Found)</option>
                <option value="New Alert">New Alert (Pending Initial Assessment)</option>
              </select>
            </div>

            {/* Comment / Inspection Notes */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-[#495057]">Inspection Notes / Remarks:</label>
              <textarea
                rows={3}
                placeholder="Enter field inspection findings, officer remarks, or instructions for the implementing agency..."
                value={verificationComment}
                onChange={(e) => setVerificationComment(e.target.value)}
                className="w-full p-2.5 rounded border border-[#CED4DA] text-xs focus:outline-none focus:border-[#00204a]"
              />
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E9ECEF]">
              <button
                onClick={() => setInspectingWork(null)}
                className="px-3.5 py-1.5 rounded text-xs font-semibold text-[#6C757D] hover:bg-[#F1F3F5]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVerification}
                disabled={isSavingVerification}
                className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
              >
                {isSavingVerification ? 'Saving...' : 'Confirm & Save Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
