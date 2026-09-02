import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { useAppStore } from '../data/store';
import { getDistrictCoords } from '../data/districtCoordinates';
import { formatCurrency } from '../utils';
import { Layers, Info } from 'lucide-react';
import type { EnrichedProject } from '../data/types';

export function GISIntelligenceMap() {
  const { projects, selectProject, setCurrentPage } = useAppStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  // Group projects by district
  const districtData = useMemo(() => {
    const map = new Map<string, {
      district: string;
      lat: number;
      lng: number;
      projects: EnrichedProject[];
      totalWorks: number;
      highRisk: number;
      medRisk: number;
      lowRisk: number;
      totalSanctionAmount: number;
      totalDisbursed: number;
      avgScore: number;
    }>();

    for (const p of projects) {
      if (riskFilter !== 'ALL' && p.risk.level !== riskFilter) continue;

      const dName = p.district || 'UNKNOWN';
      const coords = getDistrictCoords(dName);
      if (!coords) continue;

      if (!map.has(dName)) {
        map.set(dName, {
          district: dName,
          lat: coords.lat,
          lng: coords.lng,
          projects: [],
          totalWorks: 0,
          highRisk: 0,
          medRisk: 0,
          lowRisk: 0,
          totalSanctionAmount: 0,
          totalDisbursed: 0,
          avgScore: 0,
        });
      }

      const entry = map.get(dName)!;
      entry.projects.push(p);
      entry.totalWorks++;
      if (p.risk.level === 'HIGH') entry.highRisk++;
      else if (p.risk.level === 'MEDIUM') entry.medRisk++;
      else entry.lowRisk++;
      entry.totalSanctionAmount += p.sanctionAmount ?? 0;
      entry.totalDisbursed += p.totalPaid ?? 0;
    }

    for (const entry of map.values()) {
      const sum = entry.projects.reduce((s, p) => s + p.risk.score, 0);
      entry.avgScore = entry.projects.length > 0 ? Math.round(sum / entry.projects.length) : 0;
    }

    return Array.from(map.values()).sort((a, b) => b.highRisk - a.highRisk || b.avgScore - a.avgScore);
  }, [projects, riskFilter]);

  // High risk projects list for side panel
  const sidePanelProjects = useMemo(() => {
    let list = projects;
    if (selectedDistrict) {
      list = list.filter(p => p.district === selectedDistrict);
    }
    if (riskFilter !== 'ALL') {
      list = list.filter(p => p.risk.level === riskFilter);
    }
    return [...list].sort((a, b) => b.risk.score - a.risk.score).slice(0, 15);
  }, [projects, selectedDistrict, riskFilter]);

  // Initialize leaflet map safely
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Reset container _leaflet_id if present to prevent initialization crash
    if ((mapContainerRef.current as any)._leaflet_id) {
      (mapContainerRef.current as any)._leaflet_id = null;
    }

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        // ignore removal error
      }
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [10.8505, 78.6856],
        zoom: 7,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } catch (err) {
      console.error("Leaflet map initialization error:", err);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map markers when districtData changes
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    layerGroupRef.current.clearLayers();

    districtData.forEach(d => {
      let color = '#10b981';
      if (d.highRisk > 5 || d.avgScore > 50) color = '#ef4444';
      else if (d.highRisk > 0 || d.medRisk > 5 || d.avgScore > 30) color = '#f59e0b';

      const radius = Math.min(Math.max(12, Math.sqrt(d.totalWorks) * 4), 32);

      const circle = L.circleMarker([d.lat, d.lng], {
        radius,
        fillColor: color,
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.6,
      });

      const popupContent = `
        <div style="padding: 4px; color: #f0f6ff; font-family: Inter, sans-serif;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #60a5fa;">${d.district} District</div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">District Centroid GIS Marker</div>
          <div style="display: flex; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 11px; background: rgba(239, 68, 68, 0.2); color: #fca5a5; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(239, 68, 68, 0.4);">
              ${d.highRisk} High Risk
            </span>
            <span style="font-size: 11px; background: rgba(245, 158, 11, 0.2); color: #fcd34d; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(245, 158, 11, 0.4);">
              ${d.medRisk} Med Risk
            </span>
          </div>
          <div style="font-size: 11px; line-height: 1.5; color: #cbd5e1;">
            <div>Total Works: <strong>${d.totalWorks}</strong></div>
            <div>Avg Risk Score: <strong>${d.avgScore} / 100</strong></div>
            <div>Sanctioned: <strong>${formatCurrency(d.totalSanctionAmount)}</strong></div>
            <div>Disbursed: <strong>${formatCurrency(d.totalDisbursed)}</strong></div>
          </div>
        </div>
      `;

      circle.bindPopup(popupContent);
      circle.on('click', () => setSelectedDistrict(d.district));
      layerGroupRef.current?.addLayer(circle);
    });
  }, [districtData]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">GIS Infrastructure Intelligence Map</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic risk concentration across Tamil Nadu districts · District Centroid Visualization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Risk Filter:</span>
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(level => (
            <button
              key={level}
              onClick={() => setRiskFilter(level)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                riskFilter === level
                  ? level === 'HIGH' ? 'bg-red-600 text-white'
                    : level === 'MEDIUM' ? 'bg-amber-600 text-white'
                    : level === 'LOW' ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 text-white'
                  : 'bg-[#152d5a] text-slate-300 hover:bg-[#1e3f7a]'
              }`}
            >
              {level}
            </button>
          ))}
          {selectedDistrict && (
            <button
              onClick={() => setSelectedDistrict(null)}
              className="text-xs text-slate-400 hover:text-white underline ml-2"
            >
              Clear District ({selectedDistrict})
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[620px]">
        {/* Map Container */}
        <div className="lg:col-span-2 panel overflow-hidden relative flex flex-col">
          <div ref={mapContainerRef} className="w-full h-full min-h-[400px] z-0" />

          <div className="absolute bottom-4 left-4 z-10 bg-[#0a1628]/90 backdrop-blur-md p-3 rounded-lg border border-[#1e3f7a] text-xs space-y-1.5 shadow-xl max-w-xs">
            <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
              <Layers size={13} className="text-blue-400" />
              GIS Risk Concentration Scale
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 opacity-90 border border-white" />
              <span className="text-slate-300 text-[11px]">High Risk Cluster (&gt;5 High Risk works)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500 opacity-90 border border-white" />
              <span className="text-slate-300 text-[11px]">Moderate Concentration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-90 border border-white" />
              <span className="text-slate-300 text-[11px]">Low Risk / Stable</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-[#1e3f7a]/50">
              * Marker size represents total works count in district
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="panel p-4 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-3 border-b border-[#1e3f7a] pb-2">
            <div>
              <div className="text-label text-blue-400">Spatial Intelligence</div>
              <h2 className="text-sm font-semibold text-white">
                {selectedDistrict ? `${selectedDistrict} District` : 'High-Risk Works Across TN'}
              </h2>
            </div>
            <span className="text-xs text-slate-500">{sidePanelProjects.length} works</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {sidePanelProjects.map((p) => (
              <div
                key={p.workId}
                onClick={() => { selectProject(p.workId); setCurrentPage('monitoring'); }}
                className="panel-card p-3 hover:border-blue-500 cursor-pointer transition-colors duration-150"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-white truncate flex-1">
                    {p.workDescription || p.workCategory}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    p.risk.level === 'HIGH' ? 'bg-red-900/60 text-red-300' :
                    p.risk.level === 'MEDIUM' ? 'bg-amber-900/60 text-amber-300' : 'bg-emerald-900/60 text-emerald-300'
                  }`}>
                    {p.risk.level}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="font-mono text-blue-400">{p.workId.split('/').slice(0, 3).join('/')}</span>
                  <span>·</span>
                  <span>{p.district}</span>
                  <span>·</span>
                  <span className="text-slate-300 font-medium">{formatCurrency(p.sanctionAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel-card p-3 flex items-center gap-2 text-xs text-slate-400">
        <Info size={14} className="text-blue-400 flex-shrink-0" />
        <span>
          <strong>Geographic Data Note:</strong> The MPLADS dataset provides district names via the IDA field (e.g. ARIYALUR_IDA).
          Specific street latitude/longitude coordinates are not present in official CSVs. Map pins display district centroid spatial intelligence.
        </span>
      </div>
    </div>
  );
}
