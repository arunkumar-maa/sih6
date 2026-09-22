import React, { useEffect } from 'react';
import { GISIntelligenceMap } from '../GISIntelligenceMap';
import { useAppStore } from '../../store/store';
import { MapPin, Info, ArrowRight } from 'lucide-react';

interface PublicMapPageProps {
  onNavigate: (path: string) => void;
}

export function PublicMapPage({ onNavigate }: PublicMapPageProps) {
  const { setActiveHouse, loadDatasets, lokSabhaProjects } = useAppStore();

  useEffect(() => {
    setActiveHouse('Lok Sabha');
    if (lokSabhaProjects.length === 0) {
      loadDatasets();
    }
  }, [setActiveHouse, loadDatasets, lokSabhaProjects.length]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E9ECEF] pb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-[#005eb2] uppercase tracking-wider">
            <MapPin size={14} />
            <span>Spatial Intelligence & Mapping</span>
          </div>
          <h1
            className="text-2xl font-bold text-[#000a1f]"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Lok Sabha Constituency GIS Map
          </h1>
          <p className="text-xs text-[#747780]">
            Interactive geospatial mapping across all 543 Parliamentary Constituencies. Click any constituency to inspect public works and expenditures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/projects')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white border border-[#E9ECEF] hover:bg-[#f6faff] text-xs font-semibold text-[#141d23] shadow-xs cursor-pointer"
          >
            <span>Open Table View</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* ── Map Component ────────────────────────────────────── */}
      <div className="bg-white border border-[#E9ECEF] rounded-sm shadow-xs overflow-hidden">
        <GISIntelligenceMap />
      </div>
    </div>
  );
}
