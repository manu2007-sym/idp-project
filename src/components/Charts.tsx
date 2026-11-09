import React, { useState } from 'react';
import { RiskLevel } from '../types/climate';

interface MonthlyPoint {
  month: number;
  month_name: string;
  rainfall: number;
  ndvi: number;
  temperature: number;
  soil_moisture: number;
}

interface RiskDistributionProps {
  lowCount: number;
  mediumCount: number;
  highCount: number;
}

export const RiskDonutChart: React.FC<RiskDistributionProps> = ({ lowCount, mediumCount, highCount }) => {
  const total = lowCount + mediumCount + highCount || 1;
  const pLow = (lowCount / total) * 100;
  const pMed = (mediumCount / total) * 100;
  const pHigh = (highCount / total) * 100;

  // SVG circle circumference: 2 * PI * r (r=40 -> ~251.3)
  const c = 251.3;
  const strokeLow = (pLow / 100) * c;
  const strokeMed = (pMed / 100) * c;
  const strokeHigh = (pHigh / 100) * c;

  const offsetLow = 0;
  const offsetMed = -strokeLow;
  const offsetHigh = -(strokeLow + strokeMed);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background track */}
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="14" />
          {/* Low Risk (Green) */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#10b981"
            strokeWidth="14"
            strokeDasharray={`${strokeLow} ${c - strokeLow}`}
            strokeDashoffset={offsetLow}
            className="transition-all duration-700 ease-out hover:opacity-80"
          />
          {/* Medium Risk (Amber/Orange) */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#f59e0b"
            strokeWidth="14"
            strokeDasharray={`${strokeMed} ${c - strokeMed}`}
            strokeDashoffset={offsetMed}
            className="transition-all duration-700 ease-out hover:opacity-80"
          />
          {/* High Risk (Red) */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#f43f5e"
            strokeWidth="14"
            strokeDasharray={`${strokeHigh} ${c - strokeHigh}`}
            strokeDashoffset={offsetHigh}
            className="transition-all duration-700 ease-out hover:opacity-80"
          />
        </svg>
        <div className="absolute text-center flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-800">{total}</span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Districts</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-3 w-full mt-4 pt-3 border-t border-slate-100 text-center">
        <div className="p-2 rounded-lg bg-emerald-50/70">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Low</span>
          </div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">{lowCount} ({pLow.toFixed(0)}%)</div>
        </div>
        <div className="p-2 rounded-lg bg-amber-50/70">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-800">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Med</span>
          </div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">{mediumCount} ({pMed.toFixed(0)}%)</div>
        </div>
        <div className="p-2 rounded-lg bg-rose-50/70">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-800">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>High</span>
          </div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">{highCount} ({pHigh.toFixed(0)}%)</div>
        </div>
      </div>
    </div>
  );
};

export const TrendLineChart: React.FC<{
  data: MonthlyPoint[];
  metric: 'rainfall' | 'ndvi' | 'temperature' | 'soil_moisture';
  color: string;
  unit: string;
  title: string;
}> = ({ data, metric, color, unit, title }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const values = data.map(d => d[metric]);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = (maxVal - minVal) * 0.15 || 1;
  const yMin = Math.max(0, minVal - padding);
  const yMax = maxVal + padding;

  const width = 500;
  const height = 180;
  const padLeft = 45;
  const padBottom = 25;
  const padTop = 15;
  const padRight = 15;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const points = data.map((d, i) => {
    const x = padLeft + (i / (data.length - 1)) * chartW;
    const y = padTop + (1 - (d[metric] - yMin) / (yMax - yMin)) * chartH;
    return { x, y, val: d[metric], month: d.month_name };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{title}</h4>
        {hoveredIdx !== null ? (
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
            {data[hoveredIdx].month_name}: {data[hoveredIdx][metric]} {unit}
          </span>
        ) : (
          <span className="text-xs text-slate-400">12-Month AP Average</span>
        )}
      </div>

      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
          <defs>
            <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padLeft} y1={padTop} x2={width - padRight} y2={padTop} stroke="#f1f5f9" strokeDasharray="3 3" />
          <line x1={padLeft} y1={padTop + chartH / 2} x2={width - padRight} y2={padTop + chartH / 2} stroke="#f1f5f9" strokeDasharray="3 3" />
          <line x1={padLeft} y1={padTop + chartH} x2={width - padRight} y2={padTop + chartH} stroke="#e2e8f0" />

          {/* Y-axis labels */}
          <text x={padLeft - 6} y={padTop + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
            {yMax.toFixed(metric === 'ndvi' ? 2 : 0)}
          </text>
          <text x={padLeft - 6} y={padTop + chartH} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
            {yMin.toFixed(metric === 'ndvi' ? 2 : 0)}
          </text>

          {/* Area fill */}
          <path d={areaD} fill={`url(#grad-${metric})`} />

          {/* Line stroke */}
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === i ? 5.5 : 3}
                fill={hoveredIdx === i ? '#ffffff' : color}
                stroke={color}
                strokeWidth={hoveredIdx === i ? 3 : 1.5}
                className="transition-all"
              />
              {/* X label */}
              <text x={p.x} y={height - 6} textAnchor="middle" className="text-[9px] fill-slate-400 font-medium">
                {p.month}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export const DistrictRiskBarChart: React.FC<{
  districts: Array<{
    district_name: string;
    zone: string;
    latest_risk: RiskLevel;
    climate_stress_index: number;
  }>;
}> = ({ districts }) => {
  return (
    <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
      {districts.map((d, i) => {
        const csi = d.climate_stress_index || 0.45;
        const pct = Math.min(100, Math.max(5, csi * 100));

        let barColor = 'bg-emerald-500';
        let badgeColor = 'text-emerald-700 bg-emerald-50';
        if (d.latest_risk === 'HIGH') {
          barColor = 'bg-rose-500';
          badgeColor = 'text-rose-700 bg-rose-50';
        } else if (d.latest_risk === 'MEDIUM') {
          barColor = 'bg-amber-500';
          badgeColor = 'text-amber-700 bg-amber-50';
        }

        return (
          <div key={i} className="group p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">{d.district_name}</span>
                <span className="text-[10px] text-slate-400 font-normal">({d.zone})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-500">CSI: {csi.toFixed(3)}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${badgeColor}`}>
                  {d.latest_risk}
                </span>
              </div>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor} rounded-full transition-all duration-500 group-hover:brightness-95`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
