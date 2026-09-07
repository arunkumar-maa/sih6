import React from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  AlertTriangle,
  Map,
  ClipboardCheck,
  BarChart2,
  BookOpen,
  Database,
  Cpu,
  RefreshCw,
  Activity,
  Menu,
  X,
  Globe,
} from 'lucide-react';
import { useAppStore } from '../data/store';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Command Center', Icon: LayoutDashboard },
  { id: 'monitoring', label: 'Project Intelligence', Icon: FolderOpen },
  { id: 'anomalies', label: 'Anomaly Center', Icon: AlertTriangle },
  { id: 'gis', label: 'GIS Intelligence', Icon: Map },
  { id: 'verification', label: 'Verification Desk', Icon: ClipboardCheck },
  { id: 'analytics', label: 'Analytics', Icon: BarChart2 },
  { id: 'methodology', label: 'Methodology', Icon: BookOpen },
  { id: 'explorer', label: 'Dataset Explorer', Icon: Database },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const {
    currentPage, setCurrentPage,
    isAnalyzing, analysisComplete, runAnalysis,
    projects,
  } = useAppStore();

  const highRiskCount = projects.filter(p => p.risk.level === 'HIGH').length;

  const handleNav = (id: string) => {
    setCurrentPage(id);
    onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <nav
        className={`app-sidebar ${isOpen ? 'open' : ''}`}
        style={{ overflowY: 'auto' }}
      >
        {/* Brand */}
        <div className="px-8 py-6 border-b border-[#E9ECEF]">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-sm bg-[#00204a] flex items-center justify-center flex-shrink-0">
              <Activity size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#000a1f] leading-none tracking-tight"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}>
                MPLADS SENTINEL
              </h1>
              <p className="text-[10px] text-[#44474f] leading-none mt-0.5">
                AI Infrastructure Monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Status strip */}
        <div className="px-8 py-2.5 border-b border-[#E9ECEF] bg-[#F8F9FA]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#198754] blink-dot" />
            <span className="text-[10px] font-semibold text-[#44474f] uppercase tracking-widest">
              Tamil Nadu · Live
            </span>
          </div>
        </div>

        {/* Nav links */}
        <div className="flex-1 py-3">
          <div className="px-2 mb-1">
            <span className="px-4 text-[10px] font-bold text-[#747780] uppercase tracking-widest">
              Navigation
            </span>
          </div>
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`nav-item w-full text-left relative ${currentPage === id ? 'active' : ''}`}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {id === 'anomalies' && highRiskCount > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-[#DC3545] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                  {highRiskCount > 9 ? '9+' : highRiskCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom actions */}
        <div className="px-4 pb-4 border-t border-[#E9ECEF] pt-4 space-y-3">
          {analysisComplete && (
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-sm bg-[#d1fae5] border border-[#6ee7b7]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#198754]" />
              <span className="text-[10px] font-semibold text-[#065f46]">Analysis Active</span>
            </div>
          )}
          <button
            onClick={() => runAnalysis()}
            disabled={isAnalyzing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm text-sm font-semibold bg-[#00204a] hover:bg-[#000a1f] text-white transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Cpu size={13} />
                Run AI Analysis
              </>
            )}
          </button>

        </div>
      </nav>
    </>
  );
}
