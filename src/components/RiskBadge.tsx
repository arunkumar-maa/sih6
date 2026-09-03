import React from 'react';
import type { RiskLevel } from '../data/types';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskBadge({ level, score, size = 'md' }: RiskBadgeProps) {
  const configs = {
    HIGH: {
      className: 'badge-high',
      Icon: AlertTriangle,
      label: 'High Risk',
    },
    MEDIUM: {
      className: 'badge-medium',
      Icon: AlertCircle,
      label: 'Med Risk',
    },
    LOW: {
      className: 'badge-low',
      Icon: CheckCircle,
      label: 'Low Risk',
    },
  };

  const { className, Icon, label } = configs[level];
  const iconSize = size === 'sm' ? 10 : size === 'lg' ? 14 : 11;

  return (
    <span className={className}>
      <Icon size={iconSize} />
      {label}
      {score !== undefined && ` · ${score}`}
    </span>
  );
}

interface RiskScoreRingProps {
  score: number;
  level: RiskLevel;
  size?: number;
}

export function RiskScoreRing({ score, level, size = 80 }: RiskScoreRingProps) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const colors: Record<RiskLevel, string> = {
    HIGH:   '#DC3545',
    MEDIUM: '#FFC107',
    LOW:    '#198754',
  };
  const trackColors: Record<RiskLevel, string> = {
    HIGH:   '#fde8e8',
    MEDIUM: '#fef3c7',
    LOW:    '#d1fae5',
  };

  const color = colors[level];
  const trackColor = trackColors[level];

  return (
    <div
      className="relative inline-flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth="6"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className="font-bold leading-none"
          style={{
            fontSize: size < 64 ? '0.75rem' : '1.1rem',
            color: '#000a1f',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          {score}
        </span>
        <span
          className="text-[8px] font-bold uppercase tracking-wider mt-0.5"
          style={{ color }}
        >
          {level}
        </span>
      </div>
    </div>
  );
}
