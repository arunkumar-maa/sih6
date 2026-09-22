import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { useAppStore } from '../data/store';
import { useAuthStore } from '../store/authStore';
import { OfficialFilterBar, OfficialFilterState } from '../components/OfficialFilterBar';
import { RiskBadge } from '../components/RiskBadge';
import { formatCurrency } from '../utils';
import {
  buildGeoIndex,
  normalizeStateName,
  normalizeConstituencyName,
  logGeoMatchingDiagnostics,
  GeoIndex,
} from '../utils/geoMatching';
import {
  Map as MapIcon, Layers, Info, FolderOpen,
  DollarSign, TrendingUp, AlertTriangle, ArrowRight,
  RotateCcw, Compass, Landmark, Building2, CheckCircle2
} from 'lucide-react';
import type { EnrichedProject } from '../data/types';
import { getConstituencyGISAggregation, getStateGISAggregation } from '../data/supabase/gisQueries';
import { getProjects } from '../data/supabase/projectQueries';

// In-memory GeoJSON caches for instant tab switching
let cachedPcGeoJson: any = null;
let cachedStateGeoJson: any = null;

interface RegionMetrics {
  id: string;
  name: string;
  state: string;
  constituency?: string;
  totalWorks: number;
  sanctionedAmount: number;
  disbursedAmount: number;
  completedWorks: number;
  highRiskCount: number;
  medRiskCount: number;
  lowRiskCount: number;
  avgRiskScore: number;
  riskRate: number; // highRisk / totalWorks
  projects: EnrichedProject[];
  topIndicators: string[];
}

function SummaryCard({
  label,
  value,
  sub,
  color = '#005eb2',
  Icon,
}: {
  label: string;
  value: string;
  sub: string;
  color?: string;
  Icon: React.ElementType;
}) {
  return (
    <div className="card p-3.5 space-y-1.5 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#747780]">
          {label}
        </span>
        <div
          className="w-6 h-6 rounded-sm flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}18`, color }}
        >
          <Icon size={13} />
        </div>
      </div>
      <p className="text-xl font-bold text-[#000a1f]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        {value}
      </p>
      <p className="text-[10px] text-[#747780]">{sub}</p>
    </div>
  );
}

export function GISIntelligenceMap() {
  const {
    lokSabhaProjects,
    rajyaSabhaProjects,
    activeHouse,
    setActiveHouse,
    selectProject,
    setCurrentPage,
    setMonitoringFilter,
    loadRajyaSabhaDatasets,
    isLoadingRajyaSabha,
    isUsingSupabase,
  } = useAppStore();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoLayerRef = useRef<L.GeoJSON | null>(null);
  const selectedFeatureLayerRef = useRef<L.Path | null>(null);

  const [geoDataLoading, setGeoDataLoading] = useState(false);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionMetrics | null>(null);

  const { profile } = useAuthStore();
  const isMP = profile?.role === 'MP';
  const isDistrictOfficer = profile?.role === 'DISTRICT_OFFICER';
  const isStateNodal = profile?.role === 'STATE_NODAL_OFFICER';
  const lockedState = (isStateNodal || isDistrictOfficer || isMP) ? (profile?.state || '') : '';
  const lockedDistrictClean = isDistrictOfficer && profile?.district ? profile.district.split('(')[0].trim() : '';
  const lockedConstituency = isMP ? (profile?.constituency || '') : '';
  const lockedMPName = isMP ? (profile?.mp_name || profile?.full_name || '') : '';

  // Filter state for OfficialFilterBar
  const [filters, setFilters] = useState<OfficialFilterState>({
    search: '',
    house: isMP ? 'Lok Sabha' : activeHouse,
    tenure: '',
    state: lockedState,
    constituency: lockedConstituency,
    mpName: lockedMPName,
    riskLevel: '',
    status: '',
    category: '',
  });

  // Current active house dataset (Lok Sabha or Rajya Sabha strictly isolated)
  const activeHouseProjects = useMemo(() => {
    return activeHouse === 'Lok Sabha' ? lokSabhaProjects : rajyaSabhaProjects;
  }, [activeHouse, lokSabhaProjects, rajyaSabhaProjects]);

  // Sync house toggle
  const handleHouseSwitch = (house: 'Lok Sabha' | 'Rajya Sabha') => {
    if (isMP) return; // MP is strictly locked to Lok Sabha
    if (house === activeHouse) return;
    setActiveHouse(house);
    if (house === 'Rajya Sabha' && rajyaSabhaProjects.length === 0) {
      loadRajyaSabhaDatasets();
    }
    setFilters({
      search: '',
      house,
      tenure: '',
      state: lockedState,
      constituency: '',
      mpName: '',
      riskLevel: '',
      status: '',
      category: '',
    });
    setSelectedRegion(null);
  };

  // Filtered dataset driven by OfficialFilterBar
  const filteredProjects = useMemo(() => {
    let list = [...activeHouseProjects];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p =>
        p.workDescription?.toLowerCase().includes(q) ||
        p.workId?.toLowerCase().includes(q) ||
        p.constituency?.toLowerCase().includes(q) ||
        p.district?.toLowerCase().includes(q) ||
        p.state?.toLowerCase().includes(q) ||
        p.mp?.toLowerCase().includes(q) ||
        p.workCategory?.toLowerCase().includes(q)
      );
    }
    if (filters.state) list = list.filter(p => p.state === filters.state);
    if (filters.constituency) list = list.filter(p => p.constituency === filters.constituency);
    if (filters.mpName) list = list.filter(p => p.mp === filters.mpName);
    if (filters.riskLevel) list = list.filter(p => p.risk.level === filters.riskLevel);
    if (filters.category) list = list.filter(p => p.workCategory === filters.category);
    if (filters.status) list = list.filter(p => p.workStatus === filters.status);

    if (filters.tenure === '18th Lok Sabha') {
      list = list.filter(p => p.financialYear >= '2024-2025' || p.financialYear === 'Unknown');
    } else if (filters.tenure === '17th Lok Sabha') {
      list = list.filter(p => p.financialYear >= '2019-2020' && p.financialYear <= '2023-2024');
    }

    return list;
  }, [activeHouseProjects, filters]);

  // Load GeoJSON data for active house
  useEffect(() => {
    let cancelled = false;

    async function loadGeo() {
      setGeoDataLoading(true);
      try {
        if (activeHouse === 'Lok Sabha') {
          if (cachedPcGeoJson) {
            setGeoJsonData(cachedPcGeoJson);
            setGeoDataLoading(false);
            return;
          }
          const res = await fetch('/geo/india_pc_2019.json');
          const data = await res.json();
          if (!cancelled) {
            cachedPcGeoJson = data;
            setGeoJsonData(data);
          }
        } else {
          if (cachedStateGeoJson) {
            setGeoJsonData(cachedStateGeoJson);
            setGeoDataLoading(false);
            return;
          }
          const res = await fetch('/geo/india_states.json');
          const data = await res.json();
          if (!cancelled) {
            cachedStateGeoJson = data;
            setGeoJsonData(data);
          }
        }
      } catch (err) {
        console.error('Failed to load GeoJSON:', err);
      } finally {
        if (!cancelled) setGeoDataLoading(false);
      }
    }

    loadGeo();
    return () => {
      cancelled = true;
    };
  }, [activeHouse]);

  // Build high-performance in-memory geographic lookup index
  const geoIndex: GeoIndex = useMemo(() => {
    return buildGeoIndex(geoJsonData, activeHouse);
  }, [geoJsonData, activeHouse]);

  // Supabase Server-Aggregated GIS Metrics
  const [supabaseGisMap, setSupabaseGisMap] = useState<Map<string, RegionMetrics>>(new Map());
  const [isGisLoading, setIsGisLoading] = useState(false);

  useEffect(() => {
    if (!isUsingSupabase) return;

    let cancelled = false;
    setIsGisLoading(true);

    const promise = activeHouse === 'Lok Sabha'
      ? getConstituencyGISAggregation({
          ...filters,
          district: isDistrictOfficer ? (profile?.district || undefined) : undefined,
        })
      : getStateGISAggregation(filters);

    promise
      .then(resMap => {
        if (!cancelled) {
          const converted = new Map<string, RegionMetrics>();
          for (const [key, v] of resMap.entries()) {
            converted.set(key, {
              ...v,
              projects: [],
              topIndicators: ['Progress vs Expenditure', 'Operational Parameters'],
            });
          }
          setSupabaseGisMap(converted);
          setIsGisLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('[GISIntelligenceMap] Error fetching GIS aggregation from Supabase:', err);
          setIsGisLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isUsingSupabase, activeHouse, filters, isDistrictOfficer, profile?.district]);

  // Dynamically load real priority attention projects for selected region
  useEffect(() => {
    if (!isUsingSupabase || !selectedRegion || selectedRegion.totalWorks === 0) return;
    if (selectedRegion.projects && selectedRegion.projects.length > 0) return;

    let cancelled = false;
    getProjects({
      house: activeHouse,
      state: selectedRegion.state && selectedRegion.state !== 'Unknown' ? selectedRegion.state : undefined,
      constituency: activeHouse === 'Lok Sabha' ? selectedRegion.constituency : undefined,
      pageSize: 10,
      sortField: 'risk',
      sortDir: 'desc',
    })
      .then(res => {
        if (!cancelled && res.projects && res.projects.length > 0) {
          setSelectedRegion(prev => prev ? { ...prev, projects: res.projects } : null);
        }
      })
      .catch(err => console.warn('[GISIntelligenceMap] Failed to fetch region projects:', err));

    return () => {
      cancelled = true;
    };
  }, [isUsingSupabase, selectedRegion?.id, activeHouse]);

  // Aggregate project metrics locally (fallback mode)
  const fallbackRegionMetricsMap = useMemo(() => {
    if (isUsingSupabase) return new Map<string, RegionMetrics>();
    const map = new Map<string, RegionMetrics>();

    for (const p of filteredProjects) {
      const matchedKey = geoIndex.getFeatureKey(p.state, p.constituency || p.district);
      if (!matchedKey) continue;

      if (!map.has(matchedKey)) {
        const feat = geoIndex.getFeature(matchedKey);
        const props = feat?.properties || {};
        const displayName = activeHouse === 'Lok Sabha'
          ? (props.pc_name || p.constituency || p.district || 'Unknown Constituency')
          : (props.st_nm || props.NAME_1 || p.state || 'Unknown State');
        const displayState = props.st_name || props.st_nm || p.state || 'Unknown State';

        map.set(matchedKey, {
          id: matchedKey,
          name: displayName,
          state: displayState,
          constituency: activeHouse === 'Lok Sabha' ? (props.pc_name || p.constituency) : undefined,
          totalWorks: 0,
          sanctionedAmount: 0,
          disbursedAmount: 0,
          completedWorks: 0,
          highRiskCount: 0,
          medRiskCount: 0,
          lowRiskCount: 0,
          avgRiskScore: 0,
          riskRate: 0,
          projects: [],
          topIndicators: [],
        });
      }

      const metric = map.get(matchedKey)!;
      metric.projects.push(p);
      metric.totalWorks++;
      metric.sanctionedAmount += p.sanctionAmount ?? 0;
      metric.disbursedAmount += p.totalPaid ?? p.amountDisbursed ?? 0;
      if (p.isCompleted || p.workStatus?.toLowerCase().includes('complete')) {
        metric.completedWorks++;
      }
      if (p.risk.level === 'HIGH') metric.highRiskCount++;
      else if (p.risk.level === 'MEDIUM') metric.medRiskCount++;
      else metric.lowRiskCount++;
    }

    // Calculate averages and top risk indicators
    for (const metric of map.values()) {
      const sum = metric.projects.reduce((s, p) => s + p.risk.score, 0);
      metric.avgRiskScore = metric.projects.length > 0 ? Math.round(sum / metric.projects.length) : 0;
      metric.riskRate = metric.totalWorks > 0 ? metric.highRiskCount / metric.totalWorks : 0;

      const factors = new Set<string>();
      for (const p of metric.projects) {
        if (p.risk.factors) {
          p.risk.factors.forEach(f => {
            if (f.label) factors.add(f.label);
          });
        }
      }
      metric.topIndicators = Array.from(factors).slice(0, 3);
    }

    return map;
  }, [isUsingSupabase, filteredProjects, geoIndex, activeHouse]);

  const regionMetricsMap = isUsingSupabase ? supabaseGisMap : fallbackRegionMetricsMap;

  // Overall KPI statistics from filtered projects (or Supabase region metrics)
  const stats = useMemo(() => {
    if (isUsingSupabase) {
      let total = 0;
      let totalSanctioned = 0;
      let totalDisbursed = 0;
      let completed = 0;
      let highRisk = 0;

      for (const m of regionMetricsMap.values()) {
        total += m.totalWorks;
        totalSanctioned += m.sanctionedAmount;
        totalDisbursed += m.disbursedAmount;
        completed += m.completedWorks;
        highRisk += m.highRiskCount;
      }

      return { total, totalSanctioned, totalDisbursed, completed, highRisk };
    }

    const total = filteredProjects.length;
    const totalSanctioned = filteredProjects.reduce((s, p) => s + (p.sanctionAmount ?? 0), 0);
    const totalDisbursed = filteredProjects.reduce((s, p) => s + (p.totalPaid ?? p.amountDisbursed ?? 0), 0);
    const completed = filteredProjects.filter(p => p.isCompleted || p.workStatus?.toLowerCase().includes('complete')).length;
    const highRisk = filteredProjects.filter(p => p.risk.level === 'HIGH').length;
    return { total, totalSanctioned, totalDisbursed, completed, highRisk };
  }, [isUsingSupabase, regionMetricsMap, filteredProjects]);

  // Output development matching diagnostics to console
  useEffect(() => {
    if (!isUsingSupabase && geoJsonData && filteredProjects.length > 0) {
      logGeoMatchingDiagnostics(filteredProjects, geoIndex, activeHouse);
    }
  }, [isUsingSupabase, filteredProjects, geoIndex, geoJsonData, activeHouse]);

  // Leaflet Map Initialization
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
      // National view centered on India
      const map = L.map(mapContainerRef.current, {
        center: [22.8, 80.5],
        zoom: 5,
        minZoom: 4,
        maxZoom: 10,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Clean, muted Carto Positron basemap
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO · Government of India Boundaries',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    } catch (err) {
      console.error('Error initializing Leaflet:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Determine choropleth color
  // Step 7: Distinguish between NO DATA and LOW RISK
  const getFeatureStyle = useCallback((metric?: RegionMetrics, isSelected = false) => {
    if (isSelected) {
      return {
        fillColor: '#005eb2',
        fillOpacity: 0.9,
        color: '#00204a',
        weight: 2.8,
      };
    }

    // State 1: NO DATA / NO MATCH
    if (!metric || metric.totalWorks === 0) {
      return {
        fillColor: '#f1f5f9',
        fillOpacity: 0.35,
        color: '#cbd5e1',
        weight: 0.6,
      };
    }

    // State 5: CRITICAL / HIGH CONCENTRATION
    if (metric.highRiskCount >= 5 || metric.riskRate >= 0.35 || metric.avgRiskScore >= 65) {
      return {
        fillColor: '#b91c1c', // Deep Burgundy
        fillOpacity: 0.85,
        color: '#7f1d1d',
        weight: 1.2,
      };
    }
    // State 4: HIGH-RISK CONCENTRATION
    else if (metric.highRiskCount > 0 || metric.riskRate >= 0.15 || metric.avgRiskScore >= 45) {
      return {
        fillColor: '#ef4444', // Red
        fillOpacity: 0.8,
        color: '#b91c1c',
        weight: 1.0,
      };
    }
    // State 3: MODERATE CONCENTRATION
    else if (metric.medRiskCount > 0 || metric.avgRiskScore >= 25) {
      return {
        fillColor: '#f59e0b', // Amber
        fillOpacity: 0.75,
        color: '#d97706',
        weight: 0.9,
      };
    }
    // State 2: LOW / STABLE (Has matching data, low risk)
    else {
      return {
        fillColor: '#10b981', // Emerald / Green
        fillOpacity: 0.72,
        color: '#047857',
        weight: 0.8,
      };
    }
  }, []);

  // Render GeoJSON choropleth layer on map
  useEffect(() => {
    if (!mapInstanceRef.current || !geoJsonData) return;

    if (geoLayerRef.current) {
      mapInstanceRef.current.removeLayer(geoLayerRef.current);
      geoLayerRef.current = null;
    }

    try {
      const layer = L.geoJSON(geoJsonData, {
        style: (feature) => {
          if (!feature || !feature.properties) return {};
          const props = feature.properties;
          const key = activeHouse === 'Lok Sabha'
            ? `${normalizeStateName(props.st_name)}|||${normalizeConstituencyName(props.pc_name)}`
            : normalizeStateName(props.st_nm || props.NAME_1 || props.st_name || props.state || props.name);

          const metric = regionMetricsMap.get(key);
          const isSelected = selectedRegion?.id === key;
          return getFeatureStyle(metric, isSelected);
        },
        onEachFeature: (feature, featureLayer) => {
          const props = feature.properties;
          const key = activeHouse === 'Lok Sabha'
            ? `${normalizeStateName(props.st_name)}|||${normalizeConstituencyName(props.pc_name)}`
            : normalizeStateName(props.st_nm || props.NAME_1 || props.st_name || props.state || props.name);

          const metric = regionMetricsMap.get(key);
          const title = activeHouse === 'Lok Sabha'
            ? (props.pc_name || 'Constituency')
            : (props.st_nm || props.NAME_1 || props.st_name || 'State');
          const sub = activeHouse === 'Lok Sabha'
            ? (props.st_name || 'State')
            : 'Union Territory / State';

          // Step 11: Tooltip with honest data representation
          const tooltipHtml = `
            <div style="padding: 6px 8px; font-family: Inter, sans-serif; min-width: 175px;">
              <div style="font-weight: 700; font-size: 13px; color: #000a1f;">${title}</div>
              <div style="font-size: 10px; color: #747780; margin-bottom: 6px;">${sub} · ${activeHouse}</div>
              ${metric && metric.totalWorks > 0 ? `
                <div style="display: flex; gap: 4px; margin-bottom: 6px;">
                  ${metric.highRiskCount > 0 ? `
                    <span style="font-size: 10px; background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 4px; font-weight: 700;">
                      ${metric.highRiskCount} High Risk
                    </span>
                  ` : ''}
                  ${metric.medRiskCount > 0 ? `
                    <span style="font-size: 10px; background: #fef3c7; color: #92400e; padding: 1px 6px; border-radius: 4px; font-weight: 600;">
                      ${metric.medRiskCount} Med
                    </span>
                  ` : ''}
                  ${metric.highRiskCount === 0 && metric.medRiskCount === 0 ? `
                    <span style="font-size: 10px; background: #d1fae5; color: #065f46; padding: 1px 6px; border-radius: 4px; font-weight: 600;">
                      Stable / Low Risk
                    </span>
                  ` : ''}
                </div>
                <div style="font-size: 11px; line-height: 1.5; color: #44474f;">
                  <div>Works: <strong style="color: #000a1f;">${metric.totalWorks}</strong></div>
                  <div>Sanctioned: <strong style="color: #000a1f;">${formatCurrency(metric.sanctionedAmount)}</strong></div>
                  <div>Disbursed: <strong style="color: #000a1f;">${formatCurrency(metric.disbursedAmount)}</strong></div>
                  <div>Completed: <strong style="color: #198754;">${metric.completedWorks}</strong></div>
                  <div>High Risk: <strong style="color: ${metric.highRiskCount > 0 ? '#b91c1c' : '#44474f'};">${metric.highRiskCount}</strong></div>
                  <div>Average Risk Score: <strong style="color: #000a1f;">${metric.avgRiskScore}/100</strong></div>
                </div>
              ` : `
                <div style="font-size: 10px; color: #94a3b8; font-style: italic; padding: 2px 0;">
                  No matching MPLADS records in current filter
                </div>
              `}
            </div>
          `;

          featureLayer.bindTooltip(tooltipHtml, {
            sticky: true,
            direction: 'auto',
            className: 'gis-boundary-tooltip',
          });

          // Hover and Click interactions
          (featureLayer as any).on({
            mouseover: (e: any) => {
              const target = e.target;
              if (selectedFeatureLayerRef.current !== target) {
                target.setStyle({
                  weight: 2,
                  color: '#005eb2',
                  fillOpacity: 0.9,
                });
              }
              if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                target.bringToFront();
              }
            },
            mouseout: (e: any) => {
              const target = e.target;
              if (selectedFeatureLayerRef.current !== target) {
                layer.resetStyle(target);
              }
            },
            click: (e: any) => {
              // Highlight clicked layer
              if (selectedFeatureLayerRef.current) {
                layer.resetStyle(selectedFeatureLayerRef.current as any);
              }
              selectedFeatureLayerRef.current = e.target;
              e.target.setStyle({
                fillColor: '#005eb2',
                fillOpacity: 0.88,
                color: '#00204a',
                weight: 3,
              });

              // Set active region details
              if (metric) {
                setSelectedRegion(metric);
              } else {
                setSelectedRegion({
                  id: key,
                  name: title,
                  state: props.st_name || props.st_nm || props.NAME_1 || 'Unknown',
                  constituency: activeHouse === 'Lok Sabha' ? title : undefined,
                  totalWorks: 0,
                  sanctionedAmount: 0,
                  disbursedAmount: 0,
                  completedWorks: 0,
                  highRiskCount: 0,
                  medRiskCount: 0,
                  lowRiskCount: 0,
                  avgRiskScore: 0,
                  riskRate: 0,
                  projects: [],
                  topIndicators: [],
                });
              }

              // Zoom smoothly into clicked bounds
              if (mapInstanceRef.current && e.target.getBounds) {
                mapInstanceRef.current.fitBounds(e.target.getBounds(), {
                  maxZoom: 7,
                  padding: [30, 30],
                });
              }
            },
          });
        },
      }).addTo(mapInstanceRef.current);

      geoLayerRef.current = layer;

      // Auto-fit map to district constituencies if logged in as DISTRICT_OFFICER
      if (isDistrictOfficer && mapInstanceRef.current && regionMetricsMap.size > 0) {
        const bounds = L.latLngBounds([]);
        layer.eachLayer((fl: any) => {
          const props = fl.feature?.properties;
          if (!props) return;
          const key = activeHouse === 'Lok Sabha'
            ? `${normalizeStateName(props.st_name)}|||${normalizeConstituencyName(props.pc_name)}`
            : normalizeStateName(props.st_nm || props.NAME_1 || props.st_name || props.state || props.name);
          const metric = regionMetricsMap.get(key);
          if (metric && metric.totalWorks > 0 && fl.getBounds) {
            bounds.extend(fl.getBounds());
          }
        });
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 });
        }
      }

      // Auto-fit and focus map to MP constituency boundary if logged in as MP
      if (isMP && mapInstanceRef.current && profile?.constituency) {
        const normTargetConst = normalizeConstituencyName(profile.constituency);
        const normTargetState = profile.state ? normalizeStateName(profile.state) : '';
        let matchedLayer: any = null;
        let matchedKey = '';

        layer.eachLayer((fl: any) => {
          if (matchedLayer) return;
          const props = fl.feature?.properties;
          if (!props) return;
          const pcName = props.pc_name || '';
          const stName = props.st_name || props.st_nm || '';
          const cMatch = normalizeConstituencyName(pcName) === normTargetConst;
          const sMatch = !normTargetState || normalizeStateName(stName) === normTargetState;
          if (cMatch && sMatch) {
            matchedLayer = fl;
            matchedKey = `${normalizeStateName(stName)}|||${normalizeConstituencyName(pcName)}`;
          }
        });

        if (matchedLayer && matchedLayer.getBounds) {
          if (selectedFeatureLayerRef.current) {
            layer.resetStyle(selectedFeatureLayerRef.current as any);
          }
          selectedFeatureLayerRef.current = matchedLayer;
          matchedLayer.setStyle({
            fillColor: '#005eb2',
            fillOpacity: 0.88,
            color: '#00204a',
            weight: 3,
          });
          mapInstanceRef.current.fitBounds(matchedLayer.getBounds(), { padding: [50, 50], maxZoom: 9 });
          if (!selectedRegion) {
            const metric = regionMetricsMap.get(matchedKey);
            if (metric) {
              setSelectedRegion(metric);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error rendering GeoJSON on Leaflet:', err);
    }
  }, [geoJsonData, regionMetricsMap, activeHouse, getFeatureStyle, selectedRegion, isDistrictOfficer, isMP, profile]);

  // Reset zoom to view
  const handleResetZoom = () => {
    if (mapInstanceRef.current) {
      if (isMP && geoLayerRef.current && profile?.constituency) {
        const normTargetConst = normalizeConstituencyName(profile.constituency);
        let matchedLayer: any = null;
        geoLayerRef.current.eachLayer((fl: any) => {
          if (matchedLayer) return;
          const props = fl.feature?.properties;
          if (props && normalizeConstituencyName(props.pc_name || '') === normTargetConst) {
            matchedLayer = fl;
          }
        });
        if (matchedLayer && matchedLayer.getBounds) {
          mapInstanceRef.current.fitBounds(matchedLayer.getBounds(), { padding: [50, 50], maxZoom: 9 });
          return;
        }
      }
      if (isDistrictOfficer && geoLayerRef.current && regionMetricsMap.size > 0) {
        const bounds = L.latLngBounds([]);
        geoLayerRef.current.eachLayer((fl: any) => {
          const props = fl.feature?.properties;
          if (!props) return;
          const key = activeHouse === 'Lok Sabha'
            ? `${normalizeStateName(props.st_name)}|||${normalizeConstituencyName(props.pc_name)}`
            : normalizeStateName(props.st_nm || props.NAME_1 || props.st_name || props.state || props.name);
          const metric = regionMetricsMap.get(key);
          if (metric && metric.totalWorks > 0 && fl.getBounds) {
            bounds.extend(fl.getBounds());
          }
        });
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 });
          if (selectedFeatureLayerRef.current && geoLayerRef.current) {
            geoLayerRef.current.resetStyle(selectedFeatureLayerRef.current as any);
            selectedFeatureLayerRef.current = null;
          }
          setSelectedRegion(null);
          return;
        }
      }
      mapInstanceRef.current.setView([22.8, 80.5], 5);
      if (selectedFeatureLayerRef.current && geoLayerRef.current) {
        geoLayerRef.current.resetStyle(selectedFeatureLayerRef.current as any);
        selectedFeatureLayerRef.current = null;
      }
      setSelectedRegion(null);
    }
  };

  // Step 13: Drill down from selected region to Project Monitoring with house & region preserved
  const handleDrillDownToMonitoring = (region: RegionMetrics) => {
    setMonitoringFilter({
      house: activeHouse,
      state: region.state,
      constituency: region.constituency,
    });
    setCurrentPage('monitoring');
  };

  // Top risk concentration regions for quick exploration
  const topRiskRegions = useMemo(() => {
    return Array.from(regionMetricsMap.values())
      .filter(r => r.totalWorks > 0)
      .sort((a, b) => b.highRiskCount - a.highRiskCount || b.avgRiskScore - a.avgRiskScore)
      .slice(0, 5);
  }, [regionMetricsMap]);

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#005eb2] mb-1 flex items-center gap-2">
            <Compass size={12} />
            {isMP
              ? `Parliamentary Spatial Observatory · ${profile?.constituency} (${profile?.state}) · Hon'ble MP ${profile?.mp_name || profile?.full_name}`
              : isDistrictOfficer
              ? `District Spatial Risk Observatory · ${lockedDistrictClean || profile?.district}, ${profile?.state}`
              : isStateNodal
              ? `State Spatial Risk Observatory · ${profile?.state}`
              : 'National Spatial Risk Observatory · Geographic Intelligence'}
          </p>
          <h1 className="text-2xl font-bold text-[#000a1f]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {isMP
              ? `Constituency Geographic Intelligence — ${profile?.constituency || 'Lok Sabha'}`
              : isDistrictOfficer
              ? `District Geographic Intelligence — ${lockedDistrictClean || profile?.district}`
              : isStateNodal
              ? `State Geographic Intelligence — ${profile?.state}`
              : 'National MPLADS Geographic Intelligence'}
          </h1>
          <p className="text-xs text-[#747780] mt-0.5">
            {isMP
              ? `Geospatial boundary and infrastructure intelligence localized to ${profile?.constituency}, ${profile?.state} (Hon'ble MP ${profile?.mp_name || profile?.full_name})`
              : isDistrictOfficer
              ? `Geospatial constituency and boundary intelligence localized to ${lockedDistrictClean || profile?.district}, ${profile?.state}`
              : isStateNodal
              ? `Geospatial anomaly clustering across constituencies in ${profile?.state}`
              : 'Geospatial anomaly clustering across all 543 Parliamentary Constituencies and States'}
          </p>
        </div>

        {/* ── Segmented House Selector ─────────────────────────────── */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#44474f] hidden sm:inline">Parliamentary House:</span>
          {isMP ? (
            <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Building2 size={13} />
                Lok Sabha · {profile?.constituency || 'Constituency Locked'}
              </span>
            </div>
          ) : (
            <div className="flex items-center bg-white p-1 rounded-lg border border-[#E9ECEF] shadow-sm">
              <button
                onClick={() => handleHouseSwitch('Lok Sabha')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition-all ${
                  activeHouse === 'Lok Sabha'
                    ? 'bg-[#005eb2] text-white shadow-sm'
                    : 'text-[#44474f] hover:text-[#000a1f] hover:bg-[#F8F9FA]'
                }`}
              >
                <Building2 size={13} />
                Lok Sabha (543 Constituencies)
              </button>
              <button
                onClick={() => handleHouseSwitch('Rajya Sabha')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition-all ${
                  activeHouse === 'Rajya Sabha'
                    ? 'bg-[#005eb2] text-white shadow-sm'
                    : 'text-[#44474f] hover:text-[#000a1f] hover:bg-[#F8F9FA]'
                }`}
              >
                <Landmark size={13} />
                Rajya Sabha (State-Level)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Summary KPI Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <SummaryCard
          label="Total Works"
          value={stats.total.toLocaleString('en-IN')}
          sub={`Filtered ${activeHouse} records`}
          color="#005eb2"
          Icon={FolderOpen}
        />
        <SummaryCard
          label="Sanctioned Amount"
          value={formatCurrency(stats.totalSanctioned)}
          sub="Sanctioned fund allocation"
          color="#6d28d9"
          Icon={DollarSign}
        />
        <SummaryCard
          label="Disbursed / Paid"
          value={formatCurrency(stats.totalDisbursed)}
          sub="Expenditure to date"
          color="#0d9488"
          Icon={TrendingUp}
        />
        <SummaryCard
          label="Completed Works"
          value={stats.completed.toLocaleString('en-IN')}
          sub={`${stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}% completion rate`}
          color="#198754"
          Icon={CheckCircle2}
        />
        <SummaryCard
          label="High-Risk Anomalies"
          value={stats.highRisk.toLocaleString('en-IN')}
          sub={`${stats.total > 0 ? ((stats.highRisk / stats.total) * 100).toFixed(1) : 0}% of portfolio`}
          color="#DC3545"
          Icon={AlertTriangle}
        />
      </div>

      {/* ── Official Filter Bar ─────────────────────────────────────── */}
      <div className="panel p-4">
        <OfficialFilterBar
          projects={activeHouseProjects}
          filteredProjects={filteredProjects}
          filteredCount={isUsingSupabase ? stats.total : filteredProjects.length}
          totalCount={isUsingSupabase ? (activeHouse === 'Lok Sabha' ? 65000 : 79219) : activeHouseProjects.length}
          filters={filters}
          onFilterChange={(f) => {
            if (isMP) {
              setFilters({
                ...f,
                house: 'Lok Sabha',
                state: lockedState,
                constituency: lockedConstituency,
                mpName: lockedMPName,
              });
            } else if (f.house !== activeHouse) {
              handleHouseSwitch(f.house);
            } else {
              setFilters(lockedState ? { ...f, state: lockedState } : f);
            }
          }}
          onReset={() => {
            setFilters({
              search: '',
              house: isMP ? 'Lok Sabha' : activeHouse,
              tenure: '',
              state: lockedState,
              constituency: lockedConstituency,
              mpName: lockedMPName,
              riskLevel: '',
              status: '',
              category: '',
            });
            setSelectedRegion(null);
          }}
          exportFilename={`MPLADS_GIS_${activeHouse.replace(' ', '_')}`}
          accentColor="#005eb2"
        />
      </div>

      {/* ── Map and Selected Region Intelligence Layout ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left/Center: Leaflet Map Container */}
        <div className="lg:col-span-2 panel overflow-hidden relative flex flex-col" style={{ minHeight: '620px' }}>
          {/* Map canvas */}
          <div ref={mapContainerRef} className="w-full h-full min-h-[550px] z-0" />

          {/* Reset Zoom Button */}
          <button
            onClick={handleResetZoom}
            className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-md border border-[#E9ECEF] shadow-md text-xs font-semibold text-[#000a1f] hover:bg-[#F8F9FA] transition-colors"
          >
            <RotateCcw size={12} className="text-[#005eb2]" />
            {isDistrictOfficer ? 'District View' : isStateNodal ? 'State View' : 'National View'}
          </button>

          {/* Map Loading indicator */}
          {(geoDataLoading || isLoadingRajyaSabha) && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center z-20">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg border border-[#E9ECEF] text-xs font-semibold text-[#000a1f]">
                <div className="w-4 h-4 border-2 border-[#005eb2] border-t-transparent rounded-full animate-spin" />
                Loading {activeHouse} boundary topology...
              </div>
            </div>
          )}

          {/* Risk Intensity Legend */}
          <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-sm p-3 rounded-md border border-[#E9ECEF] shadow-[0_4px_16px_rgba(0,10,31,0.12)] text-xs space-y-1.5 max-w-xs">
            <div className="font-bold text-[#000a1f] flex items-center gap-1.5 mb-1 text-[11px]"
                 style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Layers size={13} className="text-[#005eb2]" />
              {activeHouse === 'Lok Sabha' ? 'Constituency Risk Concentration' : 'State-Level Risk Concentration'}
            </div>
            {[
              { color: '#b91c1c', label: 'Critical / High Concentration', sub: '≥5 High Risk or >35% Anomaly rate' },
              { color: '#ef4444', label: 'High-Risk Concentration', sub: '≥1 High Risk works' },
              { color: '#f59e0b', label: 'Moderate Concentration', sub: 'Moderate score or medium risks' },
              { color: '#10b981', label: 'Low Risk / Stable', sub: 'Low anomaly indicators' },
              { color: '#f1f5f9', label: 'No Active Projects in Filter', border: '#cbd5e1' },
            ].map(({ color, label, sub, border }) => (
              <div key={label} className="flex items-center gap-2 text-[10px]">
                <div
                  className="w-3 h-3 rounded-xs flex-shrink-0"
                  style={{
                    backgroundColor: color,
                    border: border ? `1px solid ${border}` : '1px solid rgba(0,0,0,0.15)'
                  }}
                />
                <div className="leading-tight">
                  <span className="font-medium text-[#1e293b]">{label}</span>
                  {sub && <span className="text-[#747780] block text-[9px]">{sub}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Region Intelligence Panel */}
        <div className="panel flex flex-col h-full overflow-hidden" style={{ minHeight: '620px' }}>
          <div className="px-4 py-3.5 border-b border-[#E9ECEF] bg-[#F8F9FA] flex-shrink-0 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#005eb2] mb-0.5">
                Region Intelligence Profile
              </p>
              <h2 className="text-base font-bold text-[#000a1f]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {selectedRegion ? selectedRegion.name : 'Select a Region on Map'}
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
              {activeHouse}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedRegion ? (
              <>
                {/* Region Subtitle */}
                <div className="text-xs text-[#747780]">
                  {selectedRegion.constituency ? (
                    <span>Constituency in <strong className="text-[#000a1f]">{selectedRegion.state}</strong></span>
                  ) : (
                    <span>State / Union Territory</span>
                  )}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 bg-[#F8F9FA] p-3 rounded-lg border border-[#E9ECEF] text-xs">
                  <div>
                    <span className="text-[10px] text-[#747780] uppercase tracking-wider block">Total Works</span>
                    <strong className="text-sm text-[#000a1f]">{selectedRegion.totalWorks}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#747780] uppercase tracking-wider block">Avg Risk Score</span>
                    <strong className="text-sm text-[#000a1f]">{selectedRegion.avgRiskScore} / 100</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#747780] uppercase tracking-wider block">Sanctioned</span>
                    <strong className="text-xs text-[#000a1f]">{formatCurrency(selectedRegion.sanctionedAmount)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#747780] uppercase tracking-wider block">Disbursed</span>
                    <strong className="text-xs text-[#000a1f]">{formatCurrency(selectedRegion.disbursedAmount)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#747780] uppercase tracking-wider block">Completed</span>
                    <strong className="text-xs text-[#198754] font-semibold">{selectedRegion.completedWorks} works</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#747780] uppercase tracking-wider block">High-Risk Works</span>
                    <strong className="text-xs text-[#DC3545] font-semibold">{selectedRegion.highRiskCount} works</strong>
                  </div>
                </div>

                {/* Top Anomaly / Risk Indicators */}
                {selectedRegion.topIndicators.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#44474f]">
                      Key Monitoring Indicators
                    </p>
                    <div className="space-y-1">
                      {selectedRegion.topIndicators.map((ind) => (
                        <div
                          key={ind}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-[11px] font-medium"
                        >
                          <AlertTriangle size={11} className="flex-shrink-0" />
                          <span>{ind}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drill-down action button */}
                {selectedRegion.totalWorks > 0 && (
                  <button
                    onClick={() => handleDrillDownToMonitoring(selectedRegion)}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-2 text-xs font-bold"
                  >
                    <span>Open Project Monitoring for this Region</span>
                    <ArrowRight size={13} />
                  </button>
                )}

                {/* Region Project List */}
                <div className="space-y-2 pt-2 border-t border-[#E9ECEF]">
                  <p className="text-[11px] font-bold text-[#44474f] uppercase tracking-wider">
                    Priority Attention Works ({selectedRegion.projects.length})
                  </p>
                  {selectedRegion.projects.length === 0 ? (
                    <p className="text-xs text-[#747780] py-4 text-center">
                      No works matching current filters.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {selectedRegion.projects
                        .sort((a, b) => b.risk.score - a.risk.score)
                        .slice(0, 10)
                        .map((p) => (
                          <div
                            key={p.workId}
                            onClick={() => {
                              selectProject(p.workId);
                              setCurrentPage('monitoring');
                            }}
                            className="p-2.5 rounded border border-[#E9ECEF] bg-white hover:border-[#005eb2] hover:shadow-xs transition-all cursor-pointer space-y-1"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-xs font-semibold text-[#000a1f] line-clamp-1 flex-1">
                                {p.workDescription || p.workCategory}
                              </span>
                              <RiskBadge level={p.risk.level} score={p.risk.score} size="sm" />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-[#747780]">
                              <span className="font-mono text-[#005eb2]">{p.workId}</span>
                              <span className="font-semibold text-[#000a1f]">{formatCurrency(p.sanctionAmount)}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* State when no region is selected */
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] text-center space-y-2">
                  <Compass size={28} className="text-[#005eb2] mx-auto opacity-70" />
                  <h3 className="text-xs font-bold text-[#000a1f]">Interactive Geographic Exploration</h3>
                  <p className="text-[11px] text-[#747780] leading-relaxed">
                    Hover over any {activeHouse === 'Lok Sabha' ? 'constituency' : 'state'} on the India map to inspect live metrics, or click on a region to load its complete spatial intelligence profile.
                  </p>
                </div>

                {/* Top National Risk Concentrations */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#44474f]">
                      Top Risk Concentrations
                    </span>
                    <span className="text-[10px] text-[#747780]">High-Risk Count</span>
                  </div>

                  <div className="space-y-1.5">
                    {topRiskRegions.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => setSelectedRegion(r)}
                        className="p-2.5 rounded-md border border-[#E9ECEF] bg-white hover:bg-[#F8F9FA] hover:border-[#005eb2] cursor-pointer transition-all flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-[#000a1f]">{r.name}</div>
                          <div className="text-[10px] text-[#747780]">
                            {r.totalWorks} works · Avg Score: {r.avgRiskScore}/100
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]">
                            {r.highRiskCount} High
                          </span>
                          <ArrowRight size={12} className="text-[#94a3b8]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Geographic Reference Note ────────────────────────────── */}
      <div className="panel-muted p-4 border border-[#E9ECEF] flex items-center gap-3 text-xs text-[#44474f]">
        <Info size={15} className="text-[#005eb2] flex-shrink-0" />
        <span>
          <strong className="text-[#141d23] font-bold">National GIS Oversight Note:</strong>{' '}
          Lok Sabha maps project records to official Delimited Parliamentary Constituencies (543 seats).
          Rajya Sabha maps records at the State/UT level reflecting the Council of States representation model.
          Shading intensity reflects AI anomaly concentrations and verification priorities, calculated strictly from the active house dataset.
        </span>
      </div>
    </div>
  );
}
