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
  Shield,
} from 'lucide-react';
import { useAppStore } from '../data/store';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Intelligence', Icon: LayoutDashboard },
  { id: 'monitoring', label: 'Projects', Icon: FolderOpen },
  { id: 'anomalies', label: 'Risk & Anomalies', Icon: AlertTriangle },
  { id: 'gis', label: 'GIS Map', Icon: Map },
  { id: 'verification', label: 'Verification', Icon: ClipboardCheck },
  { id: 'analytics', label: 'Analytics', Icon: BarChart2 },
  { id: 'methodology', label: 'Methodology', Icon: BookOpen },
  { id: 'explorer', label: 'Dataset', Icon: Database },
];

export function Nav() {
  const { currentPage, setCurrentPage, isAnalyzing, analysisComplete, runAnalysis, projects } = useAppStore();

  const highRiskCount = projects.filter(p => p.risk.level === 'HIGH').length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/95 border-b border-[#1e3f7a] backdrop-blur-sm">
      {/* Top strip */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-[#1e3f7a]/50 bg-[#0a1628]/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 blink-dot" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              MPLADS Intelligence Platform · Tamil Nadu
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-600">
            Data Source: Attached MPLADS Dataset
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-900/40 text-amber-400 border border-amber-800/50 uppercase tracking-wider">
            <Shield size={8} />
            Internal Hackathon Prototype
          </span>
        </div>
      </div>

      {/* Main nav */}
      <div className="flex items-center px-4 py-1.5 gap-1">
        {/* Brand */}
        <div className="flex items-center gap-2 mr-4 pr-4 border-r border-[#1e3f7a]">
          <div className="w-7 h-7 rounded-md bg-blue-600/20 border border-blue-600/40 flex items-center justify-center">
            <Activity size={14} className="text-blue-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white leading-none">MPLADS</div>
            <div className="text-[9px] text-slate-500 leading-none">AI Monitor</div>
          </div>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-0.5 flex-1 overflow-x-auto">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={`nav-item relative ${currentPage === id ? 'active' : ''}`}
            >
              <Icon size={14} />
              <span>{label}</span>
              {id === 'anomalies' && highRiskCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                  {highRiskCount > 9 ? '9+' : highRiskCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Run Analysis button */}
        <div className="ml-2 pl-2 border-l border-[#1e3f7a] flex items-center gap-2">
          {analysisComplete && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Analysis Active
            </span>
          )}
          <button
            onClick={() => runAnalysis()}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={11} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Cpu size={11} />
                Run AI Analysis
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
