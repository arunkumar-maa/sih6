import React from 'react';
import { Menu, LogOut, Shield, User } from 'lucide-react';
import { useAppStore } from '../data/store';
import { useAuthStore } from '../store/authStore';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard:    { title: 'Command Center', subtitle: 'Intelligence Dashboard' },
  monitoring:   { title: 'Project Intelligence', subtitle: 'Project Monitoring & Case Files' },
  anomalies:    { title: 'Anomaly Center', subtitle: 'Risk Observatory' },
  gis:          { title: 'GIS Intelligence', subtitle: 'Spatial Analytics' },
  verification: { title: 'Verification Desk', subtitle: 'Officer Review Workflow' },
  analytics:    { title: 'Performance Observatory', subtitle: 'Analytics & Insights' },
  explorer:     { title: 'Dataset Explorer', subtitle: 'Raw Data Exploration' },
  sanctioned:   { title: 'Sanctioned Works Intelligence', subtitle: 'Command Center › Sanctioned Amount' },
  disbursed:    { title: 'Disbursement Intelligence', subtitle: 'Command Center › Amount Disbursed' },
  completed:    { title: 'Completed Works Intelligence', subtitle: 'Command Center › Works Completed' },
  comparative:  { title: 'Comparative Intelligence', subtitle: 'Side-by-Side Analytical Comparison' },
  'admin-dashboard':    { title: 'MoSPI National Command', subtitle: 'Executive Governance & Scheme Oversight' },
  'state-dashboard':    { title: 'State Nodal Desk', subtitle: 'State-Level Allocation & District Tracking' },
  'district-dashboard': { title: 'District Officer Desk', subtitle: 'Field Execution, Stalled Works & Local Approvals' },
  'agency-dashboard':   { title: 'Implementing Agency Desk', subtitle: 'Assigned Works Execution & Milestone Submissions' },
  'mp-dashboard':       { title: 'Parliamentary Constituency Desk', subtitle: 'Hon’ble MP Developmental Portfolio & Tracking' },
  'auditor-dashboard':  { title: 'Verification Desk', subtitle: 'Risk & Anomaly Verification Workspace' },
  'audit-trail':        { title: 'Audit Trail & Verification Ledger', subtitle: 'Tamper-Evident Governance Log' },
};

interface TopBarProps {
  onMenuClick: () => void;
  currentPath?: string;
}

export function TopBar({ onMenuClick, currentPath }: TopBarProps) {
  const { currentPage, isAnalyzing } = useAppStore();
  const { profile, logout } = useAuthStore();

  const getPageInfo = () => {
    let info: { title: string; subtitle: string } | undefined;
    if (currentPath === '/admin/dashboard') info = PAGE_TITLES['admin-dashboard'];
    else if (currentPath === '/state/dashboard') info = PAGE_TITLES['state-dashboard'];
    else if (currentPath === '/district/dashboard') info = PAGE_TITLES['district-dashboard'];
    else if (currentPath === '/agency/dashboard') info = PAGE_TITLES['agency-dashboard'];
    else if (currentPath === '/mp/dashboard') info = PAGE_TITLES['mp-dashboard'];
    else if (currentPath === '/auditor/dashboard') info = PAGE_TITLES['auditor-dashboard'];
    else if (currentPath === '/audit-trail') info = PAGE_TITLES['audit-trail'];
    else if (currentPath === '/comparative') {
      if (profile?.role === 'STATE_NODAL_OFFICER') {
        return {
          title: `${profile.state || 'State'} — District Comparison`,
          subtitle: 'Intra-State District Analysis & Benchmarking'
        };
      }
      info = PAGE_TITLES['comparative'];
    } else {
      info = PAGE_TITLES[currentPage];
    }
    return info || { title: 'MPLADS Sentinel', subtitle: 'AI Risk & Anomaly Intelligence' };
  };

  const pageInfo = getPageInfo() || { title: 'MPLADS Sentinel', subtitle: 'AI Risk & Anomaly Intelligence' };

  const handleLogout = async () => {
    await logout();
    window.history.pushState({}, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const getRoleBadgeColor = () => {
    switch (profile?.role) {
      case 'MOSPI_ADMIN': return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'STATE_NODAL_OFFICER': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'DISTRICT_OFFICER': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'IMPLEMENTING_AGENCY': return 'bg-orange-100 text-orange-900 border-orange-300';
      case 'MP': return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'AUDITOR': return 'bg-rose-100 text-rose-900 border-rose-300';
      default: return 'bg-slate-100 text-slate-900 border-slate-300';
    }
  };

  return (
    <header className="bg-white border-b border-[#E9ECEF] px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
      {/* Mobile menu button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-sm hover:bg-[#F8F9FA] text-[#44474f] transition-colors cursor-pointer"
        >
          <Menu size={18} />
        </button>

        {/* Page title */}
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-[#000a1f] leading-none"
              style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {pageInfo.title}
          </h2>
          <p className="text-[10px] text-[#747780] mt-0.5 truncate max-w-xs sm:max-w-md">{pageInfo.subtitle}</p>
        </div>
      </div>

      {/* Status indicators & Authenticated User Info */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {isAnalyzing ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dbeafe] border border-[#93c5fd]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
            <span className="text-[10px] font-semibold text-[#1e40af]">Re-analyzing…</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#198754] blink-dot" />
            <span className="text-[10px] font-semibold text-[#44474f]">Live Intelligence</span>
          </div>
        )}

        {/* Authenticated user badge */}
        {profile && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-[#000a1f] leading-tight">
                {profile.full_name}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeColor()}`}>
                {profile.role.replace(/_/g, ' ')}
              </span>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out Session"
              className="p-1.5 rounded-md hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
