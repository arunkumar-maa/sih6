import React from 'react';
import type { RiskLevel } from '../data/types';
import { AlertTriangle, CheckCircle, AlertCircle, Shield } from 'lucide-react';

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
      label: 'HIGH RISK',
    },
    MEDIUM: {
      className: 'badge-medium',
      Icon: AlertCircle,
      label: 'MEDIUM RISK',
    },
    LOW: {
      className: 'badge-low',
      Icon: CheckCircle,
      label: 'LOW RISK',
    },
  };

  const { className, Icon, label } = configs[level];
  const iconSize = size === 'sm' ? 10 : size === 'lg' ? 16 : 12;

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

  const colors = {
    HIGH: '#ef4444',
    MEDIUM: '#f59e0b',
    LOW: '#10b981',
  };
  const color = colors[level];

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e3f7a"
          strokeWidth="6"
        />
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
        <span className="text-lg font-bold text-white leading-none">{score}</span>
        <span className="text-[9px] font-semibold" style={{ color }}>{level}</span>
      </div>
    </div>
  );
}
