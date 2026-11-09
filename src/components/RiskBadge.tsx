import React from 'react';
import { RiskLevel } from '../types/climate';

interface RiskBadgeProps {
  risk: RiskLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ risk, size = 'md', showPulse = false }) => {
  const normalized = (risk || 'LOW').toUpperCase() as RiskLevel;

  let bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dotClass = 'bg-emerald-500';
  let label = 'LOW RISK';

  if (normalized === 'HIGH') {
    bgClass = 'bg-rose-50 text-rose-700 border-rose-200';
    dotClass = 'bg-rose-500';
    label = 'HIGH RISK';
  } else if (normalized === 'MEDIUM') {
    bgClass = 'bg-amber-50 text-amber-700 border-amber-200';
    dotClass = 'bg-amber-500';
    label = 'MEDIUM RISK';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-semibold px-2.5 py-1 gap-2',
    lg: 'text-sm font-bold px-3.5 py-1.5 gap-2.5'
  };

  return (
    <span className={`inline-flex items-center rounded-full border shadow-xs tracking-wide transition-all ${bgClass} ${sizeClasses[size]}`}>
      <span className="relative flex h-2 w-2">
        {showPulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotClass}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotClass}`} />
      </span>
      <span>{label}</span>
    </span>
  );
};
