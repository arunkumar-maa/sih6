import React, { useMemo, useState } from 'react';
import { useAppStore } from '../data/store';
import { formatCurrency } from '../utils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import {
  BarChart3, PieChart as PieIcon, TrendingUp, Layers,
  DollarSign, FolderOpen, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { OfficialFilterBar, OfficialFilterState } from '../components/OfficialFilterBar';

export function Analytics() {
  const { projects, activeHouse } = useAppStore();

  const [filters, setFilters] = useState<OfficialFilterState>({
    search: '',
    house: activeHouse,
    tenure: activeHouse === 'Lok Sabha' ? '18th Lok Sabha' : 'Current Rajya Sabha',
    state: '',
    constituency: '',
    mpName: '',
    riskLevel: '',
    status: '',
    category: '',
  });

  // Sync house when global activeHouse changes
  const prevHouseRef = React.useRef(activeHouse);
  React.useEffect(() => {
    if (prevHouseRef.current !== activeHouse) {
      prevHouseRef.current = activeHouse;
      setFilters(f => ({
        ...f,
        house: activeHouse,
        tenure: activeHouse === 'Lok Sabha' ? '18th Lok Sabha' : 'Current Rajya Sabha',
        state: '', constituency: '', mpName: '', riskLevel: '', status: '', category: '', search: '',
      }));
    }
  }, [activeHouse]);

  const filteredProjects = useMemo(() => {
    let list = [...projects];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p =>
        p.workDescription?.toLowerCase().includes(q) ||
        p.workId?.toLowerCase().includes(q) ||
        p.constituency?.toLowerCase().includes(q) ||
        p.district?.toLowerCase().includes(q) ||
        p.mp?.toLowerCase().includes(q) ||
        p.workCategory?.toLowerCase().includes(q)
      );
    }
    if (filters.state) list = list.filter(p => p.state === filters.state);
    if (filters.constituency) list = list.filter(p => p.constituency === filters.constituency);
    if (filters.mpName) list = list.filter(p => p.mp === filters.mpName);
    if (filters.riskLevel) list = list.filter(p => p.risk.level === filters.riskLevel);
    if (filters.status) list = list.filter(p => p.workStatus === filters.status);
    if (filters.category) list = list.filter(p => p.workCategory === filters.category);
    if (filters.tenure === '18th Lok Sabha') {
      list = list.filter(p => p.financialYear >= '2024-2025' || p.financialYear === 'Unknown');
    } else if (filters.tenure === '17th Lok Sabha') {
      list = list.filter(p => p.financialYear >= '2019-2020' && p.financialYear <= '2023-2024');
    }
    return list;
  }, [projects, filters]);

  // Summary stats for filtered dataset
  const filteredStats = useMemo(() => {
    const total = filteredProjects.length;
    const totalSanctioned = filteredProjects.reduce((s, p) => s + (p.sanctionAmount ?? 0), 0);
    const totalDisbursed = filteredProjects.reduce((s, p) => s + (p.totalPaid ?? p.amountDisbursed ?? 0), 0);
    const highRisk = filteredProjects.filter(p => p.risk.level === 'HIGH').length;
    return {
      total,
      totalSanctioned,
      totalDisbursed,
      highRisk,
    };
  }, [filteredProjects]);

  // 1. Risk by District (Top 10)
  const riskByDistrict = useMemo(() => {
    const map = new Map<string, { district: string; high: number; med: number; low: number; total: number }>();
    filteredProjects.forEach(p => {
      const d = p.district || p.constituency || 'UNKNOWN';
      if (!map.has(d)) map.set(d, { district: d, high: 0, med: 0, low: 0, total: 0 });
      const item = map.get(d)!;
      item.total++;
      if (p.risk.level === 'HIGH') item.high++;
      else if (p.risk.level === 'MEDIUM') item.med++;
      else item.low++;
    });
    return Array.from(map.values()).sort((a, b) => b.high - a.high || b.total - a.total).slice(0, 10);
  }, [filteredProjects]);

  // 2. Risk by Category (Top 8)
  const riskByCategory = useMemo(() => {
    const map = new Map<string, { category: string; high: number; med: number; low: number; total: number }>();
    filteredProjects.forEach(p => {
      const c = p.workCategory ? (p.workCategory.length > 22 ? p.workCategory.slice(0, 20) + '...' : p.workCategory) : 'Unknown';
      if (!map.has(c)) map.set(c, { category: c, high: 0, med: 0, low: 0, total: 0 });
      const item = map.get(c)!;
      item.total++;
      if (p.risk.level === 'HIGH') item.high++;
      else if (p.risk.level === 'MEDIUM') item.med++;
      else item.low++;
    });
    return Array.from(map.values()).sort((a, b) => b.high - a.high || b.total - a.total).slice(0, 8);
  }, [filteredProjects]);

  // 3. Status Breakdown Pie
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredProjects.forEach(p => {
      counts[p.workStatus || 'Unknown'] = (counts[p.workStatus || 'Unknown'] || 0) + 1;
    });
    const COLORS = ['#0084ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];
    return Object.entries(counts).map(([name, value], i) => ({
      name,
      value,
      color: COLORS[i % COLORS.length],
    }));
  }, [filteredProjects]);

  // 4. Financial Year Trend
  const fyTrend = useMemo(() => {
    const map = new Map<string, { fy: string; sanctioned: number; disbursed: number }>();
    filteredProjects.forEach(p => {
      const fy = p.financialYear || 'Unknown';
      if (fy === 'Unknown') return;
      if (!map.has(fy)) map.set(fy, { fy, sanctioned: 0, disbursed: 0 });
      const item = map.get(fy)!;
      item.sanctioned += (p.sanctionAmount || 0) / 10000000; // in Cr
      item.disbursed += (p.totalPaid || p.amountDisbursed || 0) / 10000000; // in Cr
    });
    return Array.from(map.values()).sort((a, b) => a.fy.localeCompare(b.fy));
  }, [filteredProjects]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#005eb2] mb-1 flex items-center gap-2">
          <BarChart3 size={11} />
          Performance Observatory — Analytics
        </p>
        <h1 className="text-2xl font-bold text-[#000a1f]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          MPLADS Analytics &amp; Empirical Insights
        </h1>
        <p className="text-xs text-[#747780] mt-0.5">
          Aggregated statistical analysis derived dynamically from active datasets
        </p>
      </div>

      {/* ── Official Filter Bar Panel ─────────────────────────────────── */}
      <div className="bg-white border border-[#E9ECEF] rounded-xl p-4 shadow-sm">
        <OfficialFilterBar
          projects={projects}
          filteredProjects={filteredProjects}
          filteredCount={filteredProjects.length}
          totalCount={projects.length}
          filters={filters}
          onFilterChange={setFilters}
          onReset={() => setFilters({
            search: '',
            house: filters.house,
            tenure: filters.house === 'Lok Sabha' ? '18th Lok Sabha' : 'Current Rajya Sabha',
            state: '',
            constituency: '',
            mpName: '',
            riskLevel: '',
            status: '',
            category: '',
          })}
          exportFilename="MPLADS_Analytics"
          accentColor="#005eb2"
          showExcel={false}
          showCSV={false}
          showPDF={true}
        />
      </div>

      {/* ── Dynamic Filter Summary KPI Metrics ──────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#0084ff]" />
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#0084ff] mb-1.5">
                Filtered Works
              </p>
              <p className="text-2xl font-bold text-[#000a1f] leading-none" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {filteredStats.total.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-[#747780] mt-1.5">Matching criteria</p>
            </div>
            <div className="p-2 rounded-sm bg-[#0084ff]/10 text-[#0084ff]">
              <FolderOpen size={18} />
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#6d28d9]" />
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6d28d9] mb-1.5">
                Sanctioned Amount
              </p>
              <p className="text-2xl font-bold text-[#000a1f] leading-none" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {formatCurrency(filteredStats.totalSanctioned)}
              </p>
              <p className="text-[11px] text-[#747780] mt-1.5">Filtered sum</p>
            </div>
            <div className="p-2 rounded-sm bg-[#6d28d9]/10 text-[#6d28d9]">
              <DollarSign size={18} />
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#198754]" />
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#198754] mb-1.5">
                Expenditure / Disbursed
              </p>
              <p className="text-2xl font-bold text-[#000a1f] leading-none" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {formatCurrency(filteredStats.totalDisbursed)}
              </p>
              <p className="text-[11px] text-[#747780] mt-1.5">Released funds</p>
            </div>
            <div className="p-2 rounded-sm bg-[#198754]/10 text-[#198754]">
              <CheckCircle2 size={18} />
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#DC3545]" />
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#DC3545] mb-1.5">
                High-Risk Anomalies
              </p>
              <p className="text-2xl font-bold text-[#DC3545] leading-none" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {filteredStats.highRisk.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-[#747780] mt-1.5">Priority scrutiny</p>
            </div>
            <div className="p-2 rounded-sm bg-[#DC3545]/10 text-[#DC3545]">
              <AlertTriangle size={18} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: High Risk Works Concentration by District */}
        <div className="panel p-5 flex flex-col h-[360px]">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-[#000a1f] flex items-center gap-1.5">
              <BarChart3 size={14} className="text-[#DC3545]" />
              High-Risk Project Concentration by District (Top 10)
            </div>
          </div>
          <div className="flex-1 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskByDistrict} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="district" stroke="#c4c6d0" fontSize={10} interval={0} angle={-25} textAnchor="end" tick={{ fill: '#44474f' }} />
                <YAxis stroke="#c4c6d0" fontSize={10} tick={{ fill: '#44474f' }} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #E9ECEF', borderRadius: '4px', color: '#141d23', fontSize: '11px', boxShadow: '0 4px 16px rgba(0,10,31,0.1)' }}
                />
                <Bar dataKey="high" name="High Risk" fill="#DC3545" radius={[4, 4, 0, 0]} />
                <Bar dataKey="med" name="Medium Risk" fill="#FFC107" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Financial Year Spend Trend */}
        <div className="panel p-5 flex flex-col h-[360px]">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-[#000a1f] flex items-center gap-1.5">
              <TrendingUp size={14} className="text-[#198754]" />
              Sanction vs Disbursement Trend by FY (₹ Crores)
            </div>
          </div>
          <div className="flex-1 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <XAxis dataKey="fy" stroke="#c4c6d0" fontSize={11} tick={{ fill: '#44474f' }} />
                <YAxis stroke="#c4c6d0" fontSize={11} tick={{ fill: '#44474f' }} />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toFixed(2)} Cr`, '']}
                  contentStyle={{ background: '#ffffff', border: '1px solid #E9ECEF', borderRadius: '4px', color: '#141d23', fontSize: '11px', boxShadow: '0 4px 16px rgba(0,10,31,0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#44474f' }} />
                <Line type="monotone" dataKey="sanctioned" name="Sanctioned (Cr)" stroke="#6d28d9" strokeWidth={2} dot={{ r: 4, fill: '#6d28d9' }} />
                <Line type="monotone" dataKey="disbursed" name="Disbursed (Cr)" stroke="#198754" strokeWidth={2} dot={{ r: 4, fill: '#198754' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Risk by Category */}
        <div className="panel p-5 flex flex-col h-[360px]">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-[#000a1f] flex items-center gap-1.5">
              <Layers size={14} className="text-[#005eb2]" />
              Risk Distribution by Work Category
            </div>
          </div>
          <div className="flex-1 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskByCategory} layout="vertical" margin={{ top: 5, right: 10, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#c4c6d0" fontSize={10} tick={{ fill: '#44474f' }} />
                <YAxis dataKey="category" type="category" stroke="#c4c6d0" fontSize={9} width={130} tick={{ fill: '#44474f' }} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #E9ECEF', borderRadius: '4px', color: '#141d23', fontSize: '11px', boxShadow: '0 4px 16px rgba(0,10,31,0.1)' }}
                />
                <Bar dataKey="high" name="High Risk" stackId="a" fill="#DC3545" />
                <Bar dataKey="med" name="Medium Risk" stackId="a" fill="#FFC107" />
                <Bar dataKey="low" name="Low Risk" stackId="a" fill="#198754" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Work Status Breakdown */}
        <div className="panel p-5 flex flex-col h-[360px]">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-[#000a1f] flex items-center gap-1.5">
              <PieIcon size={14} className="text-[#6d28d9]" />
              Overall Work Implementation Status
            </div>
          </div>
          <div className="flex-1 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #E9ECEF', borderRadius: '4px', color: '#141d23', fontSize: '11px', boxShadow: '0 4px 16px rgba(0,10,31,0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#44474f' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
