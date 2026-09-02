import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  subValue?: string;
  Icon: LucideIcon;
  accentColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  loading?: boolean;
}

export function KPICard({
  label,
  value,
  subValue,
  Icon,
  accentColor = '#3b82f6',
  trend,
  trendLabel,
  loading = false,
}: KPICardProps) {
  return (
    <div
      className="kpi-card group hover:border-opacity-80 transition-all duration-200"
      style={{ borderTopColor: accentColor }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-label mb-2" style={{ color: accentColor }}>
            {label}
          </p>
          {loading ? (
            <div className="h-7 w-24 bg-[#1e3f7a] rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-white leading-none">{value}</p>
          )}
          {subValue && !loading && (
            <p className="text-xs text-slate-500 mt-1.5">{subValue}</p>
          )}
          {trendLabel && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${
              trend === 'up' ? 'text-emerald-400' : 
              trend === 'down' ? 'text-red-400' : 'text-slate-500'
            }`}>
              <span>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}</span>
              <span>{trendLabel}</span>
            </div>
          )}
        </div>
        <div
          className="ml-3 p-2.5 rounded-lg flex-shrink-0"
          style={{ background: `${accentColor}18` }}
        >
          <Icon size={20} style={{ color: accentColor }} />
        </div>
      </div>
    </div>
  );
}
