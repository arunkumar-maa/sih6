import React from 'react';
import { Menu, Shield, Activity } from 'lucide-react';
import { useAppStore } from '../data/store';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard:    { title: 'Command Center', subtitle: 'Intelligence Dashboard' },
  monitoring:   { title: 'Project Intelligence', subtitle: 'Project Monitoring & Case Files' },
  anomalies:    { title: 'Anomaly Center', subtitle: 'Risk Observatory' },
  gis:          { title: 'GIS Intelligence', subtitle: 'Spatial Analytics' },
  verification: { title: 'Verification Desk', subtitle: 'Officer Review Workflow' },
  analytics:    { title: 'Performance Observatory', subtitle: 'Analytics & Insights' },
  methodology:  { title: 'Methodology', subtitle: 'Under the Hood' },
  explorer:     { title: 'Dataset Explorer', subtitle: 'Raw Data Exploration' },
};

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { currentPage, isAnalyzing } = useAppStore();
  const pageInfo = PAGE_TITLES[currentPage] || { title: 'MPLADS Sentinel', subtitle: '' };

  return (
    <header className="bg-white border-b border-[#E9ECEF] px-6 py-3 flex items-center gap-4 sticky top-0 z-20">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-sm hover:bg-[#F8F9FA] text-[#44474f] transition-colors"
      >
        <Menu size={18} />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-bold text-[#000a1f] leading-none"
            style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {pageInfo.title}
        </h2>
        <p className="text-[10px] text-[#747780] mt-0.5">{pageInfo.subtitle}</p>
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {isAnalyzing ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dbeafe] border border-[#93c5fd]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
            <span className="text-[10px] font-semibold text-[#1e40af]">Re-analyzing…</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#198754] blink-dot" />
            <span className="text-[10px] font-semibold text-[#44474f] hidden sm:block">Live Data</span>
          </div>
        )}

        <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full bg-[#fef3c7] border border-[#fcd34d]">
          <Shield size={9} className="text-[#92400e]" />
          <span className="text-[9px] font-bold text-[#92400e] uppercase tracking-wider">
            SIH Prototype
          </span>
        </div>

        <div className="hidden sm:block text-[10px] text-[#747780] font-mono">
          Data: MPLADS Dataset
        </div>
      </div>
    </header>
  );
}
