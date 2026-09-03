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
  accentColor = '#005eb2',
  trend,
  trendLabel,
  loading = false,
}: KPICardProps) {
  return (
    <div className="kpi-card group">
      {/* Colored top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: accentColor }}>
            {label}
          </p>
          {loading ? (
            <div className="h-7 w-24 bg-[#e0e9f2] rounded-sm animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-[#000a1f] leading-none"
               style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {value}
            </p>
          )}
          {subValue && !loading && (
            <p className="text-[11px] text-[#747780] mt-1.5 leading-tight">{subValue}</p>
          )}
          {trendLabel && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${
              trend === 'up'   ? 'text-[#198754]' :
              trend === 'down' ? 'text-[#DC3545]' : 'text-[#747780]'
            }`}>
              <span>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}</span>
              <span>{trendLabel}</span>
            </div>
          )}
        </div>
        {/* Icon */}
        <div
          className="p-2.5 rounded-sm flex-shrink-0"
          style={{ backgroundColor: `${accentColor}14` }}
        >
          <Icon size={20} style={{ color: accentColor }} />
        </div>
      </div>
    </div>
  );
}
