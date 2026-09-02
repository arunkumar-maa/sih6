import React, { useMemo, useState } from 'react';
import { useAppStore } from '../data/store';
import { formatCurrency } from '../utils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, Layers } from 'lucide-react';

export function Analytics() {
  const { projects } = useAppStore();
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');

  const filteredProjects = useMemo(() => {
    if (districtFilter === 'ALL') return projects;
    return projects.filter(p => p.district === districtFilter);
  }, [projects, districtFilter]);

  const districts = useMemo(() => {
    return Array.from(new Set(projects.map(p => p.district))).filter(Boolean).sort();
  }, [projects]);

  // 1. Risk by District (Top 10)
  const riskByDistrict = useMemo(() => {
    const map = new Map<string, { district: string; high: number; med: number; low: number; total: number }>();
    projects.forEach(p => {
      const d = p.district || 'UNKNOWN';
      if (!map.has(d)) map.set(d, { district: d, high: 0, med: 0, low: 0, total: 0 });
      const item = map.get(d)!;
      item.total++;
      if (p.risk.level === 'HIGH') item.high++;
      else if (p.risk.level === 'MEDIUM') item.med++;
      else item.low++;
    });
    return Array.from(map.values()).sort((a, b) => b.high - a.high).slice(0, 10);
  }, [projects]);

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
    return Array.from(map.values()).sort((a, b) => b.high - a.high).slice(0, 8);
  }, [filteredProjects]);

  // 3. Status Breakdown Pie
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredProjects.forEach(p => {
      counts[p.workStatus] = (counts[p.workStatus] || 0) + 1;
    });
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];
    return Object.entries(counts).map(([name, value], i) => ({
      name,
      value,
      color: COLORS[i % COLORS.length],
    }));
  }, [filteredProjects]);

  // 4. Financial Year Trend
  const fyTrend = useMemo(() => {
    const map = new Map<string, { fy: string; sanctioned: number; disbursed: number }>();
    projects.forEach(p => {
      const fy = p.financialYear || 'Unknown';
      if (fy === 'Unknown') return;
      if (!map.has(fy)) map.set(fy, { fy, sanctioned: 0, disbursed: 0 });
      const item = map.get(fy)!;
      item.sanctioned += (p.sanctionAmount || 0) / 10000000; // in Cr
      item.disbursed += (p.totalPaid || 0) / 10000000; // in Cr
    });
    return Array.from(map.values()).sort((a, b) => a.fy.localeCompare(b.fy));
  }, [projects]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">MPLADS Analytics & Empirical Insights</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated statistical analysis derived dynamically from the attached dataset
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Filter District:</span>
          <select
            value={districtFilter}
            onChange={e => setDistrictFilter(e.target.value)}
            className="bg-[#0a1628] border border-[#1e3f7a] rounded-md px-3 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Districts</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: High Risk Works Concentration by District */}
        <div className="panel p-4 flex flex-col h-[360px]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <BarChart3 size={14} className="text-red-400" />
              High-Risk Project Concentration by District (Top 10)
            </div>
          </div>
          <div className="flex-1 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskByDistrict} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="district" stroke="#64748b" fontSize={10} interval={0} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ background: '#0a1628', borderColor: '#1e3f7a', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="high" name="High Risk" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="med" name="Medium Risk" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Financial Year Spend Trend */}
        <div className="panel p-4 flex flex-col h-[360px]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <TrendingUp size={14} className="text-emerald-400" />
              Sanction vs Disbursement Trend by FY (₹ Crores)
            </div>
          </div>
          <div className="flex-1 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <XAxis dataKey="fy" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toFixed(2)} Cr`, '']}
                  contentStyle={{ background: '#0a1628', borderColor: '#1e3f7a', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="sanctioned" name="Sanctioned (Cr)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="disbursed" name="Disbursed (Cr)" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Risk by Category */}
        <div className="panel p-4 flex flex-col h-[360px]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Layers size={14} className="text-blue-400" />
              Risk Distribution by Work Category
            </div>
          </div>
          <div className="flex-1 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskByCategory} layout="vertical" margin={{ top: 5, right: 10, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={9} width={130} />
                <Tooltip
                  contentStyle={{ background: '#0a1628', borderColor: '#1e3f7a', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="high" name="High Risk" stackId="a" fill="#ef4444" />
                <Bar dataKey="med" name="Medium Risk" stackId="a" fill="#f59e0b" />
                <Bar dataKey="low" name="Low Risk" stackId="a" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Work Status Breakdown */}
        <div className="panel p-4 flex flex-col h-[360px]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <PieIcon size={14} className="text-purple-400" />
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
                  contentStyle={{ background: '#0a1628', borderColor: '#1e3f7a', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
