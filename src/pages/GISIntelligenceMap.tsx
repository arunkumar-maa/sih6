import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { useAppStore } from '../data/store';
import { getDistrictCoords } from '../data/districtCoordinates';
import { formatCurrency, truncate } from '../utils';
import { Layers, Info, Map as MapIcon } from 'lucide-react';
import type { EnrichedProject } from '../data/types';

export function GISIntelligenceMap() {
  const { projects, selectProject, setCurrentPage } = useAppStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const districtData = useMemo(() => {
    const map = new Map<string, {
      district: string; lat: number; lng: number;
      projects: EnrichedProject[]; totalWorks: number;
      highRisk: number; medRisk: number; lowRisk: number;
      totalSanctionAmount: number; totalDisbursed: number; avgScore: number;
    }>();

    for (const p of projects) {
      if (riskFilter !== 'ALL' && p.risk.level !== riskFilter) continue;
      const dName = p.district || 'UNKNOWN';
      const coords = getDistrictCoords(dName);
      if (!coords) continue;

      if (!map.has(dName)) {
        map.set(dName, {
          district: dName, lat: coords.lat, lng: coords.lng,
          projects: [], totalWorks: 0, highRisk: 0, medRisk: 0, lowRisk: 0,
          totalSanctionAmount: 0, totalDisbursed: 0, avgScore: 0,
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

  const sidePanelProjects = useMemo(() => {
    let list = projects;
    if (selectedDistrict) list = list.filter(p => p.district === selectedDistrict);
    if (riskFilter !== 'ALL') list = list.filter(p => p.risk.level === riskFilter);
    return [...list].sort((a, b) => b.risk.score - a.risk.score).slice(0, 15);
  }, [projects, selectedDistrict, riskFilter]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if ((mapContainerRef.current as any)._leaflet_id) {
      (mapContainerRef.current as any)._leaflet_id = null;
    }
    if (mapInstanceRef.current) {
      try { mapInstanceRef.current.remove(); } catch (e) {}
      mapInstanceRef.current = null;
    }
    try {
      const map = L.map(mapContainerRef.current, { center: [10.8505, 78.6856], zoom: 7, zoomControl: true });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);
      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } catch (err) {
      console.error('Leaflet map initialization error:', err);
    }
    return () => {
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    layerGroupRef.current.clearLayers();

    districtData.forEach(d => {
      let color = '#198754';
      if (d.highRisk > 5 || d.avgScore > 50) color = '#DC3545';
      else if (d.highRisk > 0 || d.medRisk > 5 || d.avgScore > 30) color = '#FFC107';

      const radius = Math.min(Math.max(12, Math.sqrt(d.totalWorks) * 4), 32);

      const circle = L.circleMarker([d.lat, d.lng], {
        radius,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7,
      });

      const popupContent = `
        <div style="padding: 6px; font-family: Inter, sans-serif; color: #141d23;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #000a1f;">${d.district} District</div>
          <div style="font-size: 11px; color: #747780; margin-bottom: 8px;">District Centroid GIS Marker</div>
          <div style="display: flex; gap: 6px; margin-bottom: 8px;">
            <span style="font-size: 11px; background: #fde8e8; color: #991b1b; padding: 2px 8px; border-radius: 999px; border: 1px solid #fca5a5; font-weight: 600;">
              ${d.highRisk} High
            </span>
            <span style="font-size: 11px; background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 999px; border: 1px solid #fcd34d; font-weight: 600;">
              ${d.medRisk} Med
            </span>
          </div>
          <div style="font-size: 11px; line-height: 1.7; color: #44474f;">
            <div>Total Works: <strong style="color:#000a1f">${d.totalWorks}</strong></div>
            <div>Avg Risk Score: <strong style="color:#000a1f">${d.avgScore} / 100</strong></div>
            <div>Sanctioned: <strong style="color:#000a1f">${formatCurrency(d.totalSanctionAmount)}</strong></div>
            <div>Disbursed: <strong style="color:#000a1f">${formatCurrency(d.totalDisbursed)}</strong></div>
          </div>
        </div>
      `;

      circle.bindPopup(popupContent);
      circle.on('click', () => setSelectedDistrict(d.district));
      layerGroupRef.current?.addLayer(circle);
    });
  }, [districtData]);

  const RISK_LEVELS = ['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const;
  const riskButtonColors: Record<typeof RISK_LEVELS[number], { active: string; inactive: string }> = {
    ALL:    { active: 'bg-[#00204a] text-white border-[#00204a]', inactive: 'bg-white text-[#44474f] border-[#E9ECEF] hover:border-[#c4c6d0]' },
    HIGH:   { active: 'bg-[#DC3545] text-white border-[#DC3545]', inactive: 'bg-[#fde8e8] text-[#991b1b] border-[#fca5a5] hover:bg-[#fca5a5]' },
    MEDIUM: { active: 'bg-[#FFC107] text-[#000a1f] border-[#FFC107]', inactive: 'bg-[#fef3c7] text-[#92400e] border-[#fcd34d] hover:bg-[#fcd34d]' },
    LOW:    { active: 'bg-[#198754] text-white border-[#198754]', inactive: 'bg-[#d1fae5] text-[#065f46] border-[#6ee7b7] hover:bg-[#6ee7b7]' },
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#005eb2] mb-1 flex items-center gap-2">
            <MapIcon size={11} />
            GIS Intelligence — Spatial Analytics
          </p>
          <h1 className="text-2xl font-bold text-[#000a1f]"
              style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Infrastructure Intelligence Map
          </h1>
          <p className="text-xs text-[#747780] mt-0.5">
            Geographic risk concentration across Tamil Nadu districts · District Centroid Visualization
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#44474f] font-semibold">Risk Filter:</span>
          {RISK_LEVELS.map(level => {
            const isActive = riskFilter === level;
            const colors = riskButtonColors[level];
            return (
              <button
                key={level}
                onClick={() => setRiskFilter(level)}
                className={`px-3 py-1.5 rounded-sm text-xs font-bold border transition-all ${isActive ? colors.active : colors.inactive}`}
              >
                {level}
              </button>
            );
          })}
          {selectedDistrict && (
            <button
              onClick={() => setSelectedDistrict(null)}
              className="text-xs text-[#005eb2] hover:text-[#003161] font-semibold underline ml-1"
            >
              Clear District ({selectedDistrict})
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: '600px' }}>
        {/* Map Container */}
        <div className="lg:col-span-2 panel overflow-hidden relative flex flex-col">
          <div ref={mapContainerRef} className="w-full h-full min-h-[400px] z-0" />

          {/* Legend overlay */}
          <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-sm p-3 rounded-sm border border-[#E9ECEF] shadow-[0_4px_16px_rgba(0,10,31,0.12)] text-xs space-y-2 max-w-xs">
            <div className="font-bold text-[#000a1f] flex items-center gap-1.5 mb-2"
                 style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Layers size={13} className="text-[#005eb2]" />
              GIS Risk Concentration Scale
            </div>
            {[
              { color: '#DC3545', label: 'High Risk Cluster (>5 High Risk works)', bg: '#fde8e8' },
              { color: '#FFC107', label: 'Moderate Concentration',                  bg: '#fef3c7' },
              { color: '#198754', label: 'Low Risk / Stable',                       bg: '#d1fae5' },
            ].map(({ color, label, bg }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border border-white/80 flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[11px] text-[#44474f]">{label}</span>
              </div>
            ))}
            <div className="text-[10px] text-[#747780] pt-1 border-t border-[#E9ECEF]">
              * Marker size ∝ total works count in district
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="panel flex flex-col h-full overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E9ECEF] flex-shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#005eb2] mb-0.5">
              Spatial Intelligence
            </p>
            <h2 className="text-sm font-bold text-[#000a1f]"
                style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {selectedDistrict ? `${selectedDistrict} District` : 'High-Risk Works Across TN'}
            </h2>
            <span className="text-[10px] text-[#747780]">{sidePanelProjects.length} works</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {sidePanelProjects.map((p) => {
              const riskBorderClass =
                p.risk.level === 'HIGH'   ? 'risk-border-high' :
                p.risk.level === 'MEDIUM' ? 'risk-border-medium' : 'risk-border-low';
              return (
                <div
                  key={p.workId}
                  onClick={() => { selectProject(p.workId); setCurrentPage('monitoring'); }}
                  className={`bg-white border border-[#E9ECEF] ${riskBorderClass} p-3 cursor-pointer hover:shadow-sm hover:border-[#c4c6d0] transition-all rounded-sm`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-[#000a1f] truncate flex-1">
                      {truncate(p.workDescription || p.workCategory, 45)}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0 ${
                      p.risk.level === 'HIGH'   ? 'bg-[#fde8e8] text-[#991b1b]' :
                      p.risk.level === 'MEDIUM' ? 'bg-[#fef3c7] text-[#92400e]' : 'bg-[#d1fae5] text-[#065f46]'
                    }`}>
                      {p.risk.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#747780]">
                    <span className="font-mono text-[#005eb2] font-semibold">
                      {p.workId.split('/').slice(0, 3).join('/')}
                    </span>
                    <span>·</span>
                    <span>{p.district}</span>
                    <span>·</span>
                    <span className="text-[#44474f] font-semibold">{formatCurrency(p.sanctionAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="panel-muted p-4 border border-[#E9ECEF] flex items-center gap-3 text-xs text-[#44474f]">
        <Info size={14} className="text-[#005eb2] flex-shrink-0" />
        <span>
          <strong className="text-[#141d23] font-bold">Geographic Data Note:</strong>{' '}
          The MPLADS dataset provides district names via the IDA field (e.g. ARIYALUR_IDA).
          Specific street latitude/longitude coordinates are not present in official CSVs. Map pins display district centroid spatial intelligence.
        </span>
      </div>
    </div>
  );
}
