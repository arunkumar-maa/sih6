import React from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  AlertTriangle,
  Map,
  ClipboardCheck,
  BarChart2,
  Database,
  Activity,
  Shield,
  LogOut,
  User,
  ExternalLink,
  ChevronRight,
  Landmark,
  Building2,
  HardHat,
  FileSearch,
  ArrowLeftRight,
  History,
  ShieldAlert,
  TrendingUp,
  Paperclip,
} from 'lucide-react';
import { useAppStore } from '../data/store';
import { useAuthStore } from '../store/authStore';
import { ROLE_DASHBOARD_ROUTES, UserRole } from '../types/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export function Sidebar({ isOpen, onClose, currentPath, onNavigate }: SidebarProps) {
  const {
    currentPage, setCurrentPage,
    projects,
  } = useAppStore();

  const { profile, user, logout } = useAuthStore();
  const role: UserRole = profile?.role || 'MOSPI_ADMIN';

  const highRiskCount = projects.filter(p => p.risk.level === 'HIGH').length;

  const navigateTo = (path: string, pageId?: string) => {
    if (pageId) {
      setCurrentPage(pageId);
    }
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    window.history.pushState({}, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
    onClose();
  };

  // Role dashboard details
  const getRoleDashboardInfo = (r: UserRole) => {
    switch (r) {
      case 'MOSPI_ADMIN':
        return { path: '/admin/dashboard', label: 'MoSPI National Desk', Icon: Shield };
      case 'STATE_NODAL_OFFICER':
        return { path: '/state/dashboard', label: 'State Nodal Desk', Icon: Landmark };
      case 'DISTRICT_OFFICER':
        return { path: '/district/dashboard', label: 'District Officer Desk', Icon: Building2 };
      case 'IMPLEMENTING_AGENCY':
        return { path: '/implementing-agency', label: 'Implementation Workspace', Icon: HardHat };
      case 'MP':
        return { path: '/mp/dashboard', label: 'MP Portfolio Desk', Icon: Landmark };
      case 'AUDITOR':
        return { path: '/auditor/dashboard', label: 'Verification Desk', Icon: FileSearch };
      default:
        return { path: '/admin/dashboard', label: 'Role Dashboard', Icon: Shield };
    }
  };

  const roleDashboard = getRoleDashboardInfo(role);

  // Section 15: Role-Specific Sidebar Module Filtering
  const getAllowedNavItems = (r: UserRole) => {
    switch (r) {
      case 'MOSPI_ADMIN':
        return [
          { id: 'dashboard', label: 'Command Center', Icon: LayoutDashboard, path: '/' },
          { id: 'monitoring', label: 'Project Intelligence', Icon: FolderOpen, path: '/monitoring' },
          { id: 'anomalies', label: 'Anomaly Center', Icon: AlertTriangle, path: '/anomalies' },
          { id: 'gis', label: 'GIS Intelligence', Icon: Map, path: '/gis' },
          { id: 'comparative', label: 'Comparative Intelligence', Icon: ArrowLeftRight, path: '/comparative' },
          { id: 'analytics', label: 'Analytics', Icon: BarChart2, path: '/analytics' },
          { id: 'explorer', label: 'Dataset Explorer', Icon: Database, path: '/explorer' },
        ];
      case 'STATE_NODAL_OFFICER':
        return [
          { id: 'monitoring', label: 'Project Intelligence', Icon: FolderOpen, path: '/monitoring' },
          { id: 'comparative', label: 'District Comparison', Icon: ArrowLeftRight, path: '/comparative' },
          { id: 'anomalies', label: 'Anomaly Center', Icon: AlertTriangle, path: '/anomalies' },
          { id: 'gis', label: 'GIS Intelligence', Icon: Map, path: '/gis' },
          { id: 'analytics', label: 'State Analytics', Icon: BarChart2, path: '/analytics' },
          { id: 'verification', label: 'Verification Desk', Icon: ClipboardCheck, path: '/verification' },
        ];
      case 'DISTRICT_OFFICER':
        return [
          { id: 'monitoring', label: 'Project Intelligence', Icon: FolderOpen, path: '/monitoring' },
          { id: 'anomalies', label: 'District Anomalies', Icon: AlertTriangle, path: '/anomalies' },
          { id: 'verification', label: 'Verification Desk', Icon: ClipboardCheck, path: '/verification' },
          { id: 'gis', label: 'District GIS Map', Icon: Map, path: '/gis' },
          { id: 'analytics', label: 'District Analytics', Icon: BarChart2, path: '/analytics' },
        ];
      case 'IMPLEMENTING_AGENCY':
        return [
          { id: 'assigned-works', label: 'Assigned Works', Icon: FolderOpen, path: '/implementing-agency?tab=assigned-works' },
          { id: 'action-center', label: 'Action Center', Icon: ShieldAlert, path: '/implementing-agency?tab=action-center' },
          { id: 'updates', label: 'Execution Updates', Icon: TrendingUp, path: '/implementing-agency?tab=updates' },
          { id: 'evidence', label: 'Evidence & Documents', Icon: Paperclip, path: '/implementing-agency?tab=evidence' },
          { id: 'profile', label: 'Agency Profile', Icon: User, path: '/implementing-agency?tab=profile' },
        ];
      case 'MP':
        return [
          { id: 'monitoring', label: 'Constituency Works', Icon: FolderOpen, path: '/monitoring' },
          { id: 'gis', label: 'Constituency GIS Map', Icon: Map, path: '/gis' },
          { id: 'analytics', label: 'Development Analytics', Icon: BarChart2, path: '/analytics' },
        ];
      case 'AUDITOR':
        return [
          { id: 'verification', label: 'Verification Desk', Icon: ClipboardCheck, path: '/auditor/dashboard' },
          { id: 'analytics', label: 'Risk Observatory', Icon: BarChart2, path: '/analytics' },
          { id: 'anomalies', label: 'Anomaly Cases', Icon: AlertTriangle, path: '/anomalies' },
          { id: 'monitoring', label: 'Project Intelligence', Icon: FolderOpen, path: '/monitoring' },
          { id: 'gis', label: 'GIS Intelligence', Icon: Map, path: '/gis' },
          { id: 'audit-trail', label: 'Audit Trail', Icon: History, path: '/audit-trail' },
        ];
      default:
        return [];
    }
  };

  const navItems = getAllowedNavItems(role);

  // Friendly scope label
  const getScopeLabel = () => {
    if (!profile) return 'National';
    switch (profile.role) {
      case 'MOSPI_ADMIN': return 'National Directorate';
      case 'STATE_NODAL_OFFICER': return `State: ${profile.state || 'All'}`;
      case 'DISTRICT_OFFICER': return `District: ${profile.district || 'All'}`;
      case 'IMPLEMENTING_AGENCY': return `Agency: ${profile.agency_name || 'All'}`;
      case 'MP': return `${profile.house || 'Lok Sabha'} · ${profile.constituency || profile.state || 'MP'}`;
      case 'AUDITOR': return 'National Audit Oversight';
      default: return 'National';
    }
  };

  const isRoleDashboardActive = currentPath === roleDashboard.path;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <nav
        className={`app-sidebar ${isOpen ? 'open' : ''} flex flex-col justify-between`}
        style={{ overflowY: 'auto' }}
      >
        <div>
          {/* Brand */}
          <div className="px-6 py-5 border-b border-[#E9ECEF]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-[#00204a] flex items-center justify-center flex-shrink-0 shadow-sm">
                <Activity size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-[#000a1f] leading-none tracking-tight"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  MPLADS SENTINEL
                </h1>
                <p className="text-[10px] text-[#44474f] leading-none mt-1">
                  Risk & Anomaly Intelligence
                </p>
              </div>
            </div>
          </div>

          {/* Role Status Strip */}
          <div className="px-6 py-2.5 border-b border-[#E9ECEF] bg-[#F8F9FA] flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-1.5 h-1.5 rounded-full bg-[#198754] blink-dot flex-shrink-0" />
              <span className="text-[10px] font-bold text-[#00204a] uppercase tracking-wider truncate" title={getScopeLabel()}>
                {getScopeLabel()}
              </span>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase flex-shrink-0">
              {role.replace('_', ' ')}
            </span>
          </div>

          {/* Dedicated Role Dashboard Link */}
          <div className="p-3">
            <button
              onClick={() => navigateTo(roleDashboard.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
                isRoleDashboardActive
                  ? 'bg-[#00204a] text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-[#00204a] border border-slate-200'
              }`}
            >
              <roleDashboard.Icon size={16} className="flex-shrink-0" />
              <span className="flex-1 text-left">{roleDashboard.label}</span>
              <ChevronRight size={14} className="opacity-70" />
            </button>
          </div>

          {/* Filtered Modular Navigation Links */}
          <div className="px-2 py-1">
            <div className="px-4 mb-2">
              <span className="text-[10px] font-bold text-[#747780] uppercase tracking-widest">
                Authorized Modules
              </span>
            </div>

            <div className="space-y-0.5">
              {navItems.map(({ id, label, Icon, path }) => {
                const isActive = !isRoleDashboardActive && (currentPage === id || currentPath === path);
                return (
                  <button
                    key={id}
                    onClick={() => navigateTo(path, id)}
                    className={`nav-item w-full text-left relative ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    <span className="flex-1">{label}</span>
                    {id === 'anomalies' && highRiskCount > 0 && (
                      <span className="ml-auto w-5 h-5 rounded-full bg-[#DC3545] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                        {highRiskCount > 9 ? '9+' : highRiskCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="p-4 border-t border-[#E9ECEF] bg-white mt-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 flex-shrink-0 font-bold text-xs">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User size={14} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#000a1f] truncate leading-tight">
                {profile?.full_name || 'Authenticated Officer'}
              </p>
              <p className="text-[10px] text-[#747780] truncate mt-0.5 font-mono">
                {user?.email || 'officer@nic.in'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out Session</span>
          </button>
        </div>
      </nav>
    </>
  );
}
