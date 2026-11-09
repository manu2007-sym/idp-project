import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  Layers, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  ArrowRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { DashboardStats, RiskLevel } from '../types/climate';
import { RiskDonutChart, TrendLineChart, DistrictRiskBarChart } from '../components/Charts';
import { RiskBadge } from '../components/RiskBadge';
import { NavPage } from '../components/Navbar';

interface DashboardPageProps {
  onNavigate: (page: NavPage) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>('ALL');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Failed to load dashboard data');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredDistricts = (stats?.district_risks || []).filter(d => {
    if (selectedZone === 'ALL') return true;
    return d.zone === selectedZone;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Executive Climate Dashboard</h2>
            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Live SQLite Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time climate indicators and 1D CNN risk intelligence across Andhra Pradesh
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => onNavigate('predict')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 hover:brightness-105 transition-all cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Predict Risk</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <span>Failed to connect to SQLite API: {error}</span>
          <button onClick={fetchDashboardData} className="font-bold underline cursor-pointer">Retry</button>
        </div>
      )}

      {/* Primary Key Stats Cards (12 -> 26 districts, 312 observations, 4 indicators, 3 categories) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Districts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Districts</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats?.total_districts || 26}</span>
            <span className="text-xs text-slate-400 font-medium">All AP</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">4 Agro-Ecological Zones</p>
        </div>

        {/* Total Observations */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Observations</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats?.total_observations || 312}</span>
            <span className="text-xs text-slate-400 font-medium">Records</span>
          </div>
          <p className="text-[11px] text-blue-600 font-medium mt-1">Stored in SQLite</p>
        </div>

        {/* Climate Indicators */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Climate Indicators</span>
            <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats?.climate_indicators_count || 4}</span>
            <span className="text-xs text-slate-400 font-medium">Features</span>
          </div>
          <p className="text-[11px] text-teal-600 font-medium mt-1">NDVI, Rain, Temp, Soil</p>
        </div>

        {/* Risk Categories */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Risk Classes</span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats?.risk_categories_count || 3}</span>
            <span className="text-xs text-slate-400 font-medium">Levels</span>
          </div>
          <p className="text-[11px] text-purple-600 font-medium mt-1">LOW, MEDIUM, HIGH</p>
        </div>
      </div>

      {/* Risk Distribution Cards + Latest Prediction Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Classification Counts Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">Current Risk Distribution</h3>
              <span className="text-xs text-slate-400">Latest Run</span>
            </div>
            <RiskDonutChart
              lowCount={stats?.low_risk_count || 12}
              mediumCount={stats?.medium_risk_count || 9}
              highCount={stats?.high_risk_count || 5}
            />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>High Risk Hotspots: Rayalaseema</span>
            <button onClick={() => onNavigate('map')} className="text-emerald-700 font-bold hover:underline">
              View Map →
            </button>
          </div>
        </div>

        {/* Latest Prediction Spotlight Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Latest CNN Inference</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {stats?.latest_prediction?.prediction_date 
                  ? new Date(stats.latest_prediction.prediction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Just now'}
              </span>
            </div>

            {stats?.latest_prediction ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-black text-white">
                      {stats.latest_prediction.district_name || 'Ananthapuramu'}
                    </h3>
                    <p className="text-xs text-slate-300">
                      Zone: {stats.latest_prediction.zone || 'Rayalaseema'} • Observation: Month {stats.latest_prediction.month || 11}, {stats.latest_prediction.year || 2026}
                    </p>
                  </div>
                  <RiskBadge 
                    risk={stats.latest_prediction.predicted_risk as RiskLevel} 
                    size="lg" 
                    showPulse 
                  />
                </div>

                {/* Indicators grid in spotlight */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">NDVI Canopy</span>
                    <span className="text-base font-bold text-emerald-400">{stats.latest_prediction.ndvi ?? 0.22}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Rainfall</span>
                    <span className="text-base font-bold text-blue-400">{stats.latest_prediction.rainfall ?? 42.5} mm</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Temperature</span>
                    <span className="text-base font-bold text-amber-400">{stats.latest_prediction.temperature ?? 36.2} °C</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Soil Moisture</span>
                    <span className="text-base font-bold text-cyan-400">{stats.latest_prediction.soil_moisture ?? 12.0} %</span>
                  </div>
                </div>

                {/* XAI highlight */}
                {stats.latest_prediction.explanation && (
                  <p className="text-xs text-slate-300/90 bg-white/5 p-3 rounded-xl border border-white/10 leading-relaxed font-light">
                    <strong className="text-white font-semibold">XAI Integrated Gradients:</strong> {stats.latest_prediction.explanation}
                  </p>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">
                <p>No predictions recorded yet. Run your first 1D CNN prediction!</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Model Confidence: <strong>{stats?.latest_prediction?.confidence ?? 88.5}%</strong></span>
            <button
              onClick={() => onNavigate('predict')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
            >
              <span>Test New District</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Time-Series Charts Grid (Rainfall, NDVI, Temperature, Soil Moisture) */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Seasonal Climate Trends Across Andhra Pradesh</h3>
          <p className="text-xs text-slate-500">12-month baseline averages aggregated from SQLite climate observation records</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <TrendLineChart
              data={stats?.monthly_averages || []}
              metric="rainfall"
              color="#2563eb"
              unit="mm"
              title="Monthly Rainfall (Precipitation Deficit/Surplus)"
            />
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <TrendLineChart
              data={stats?.monthly_averages || []}
              metric="ndvi"
              color="#059669"
              unit=""
              title="NDVI Vegetation Canopy Index (Sentinel-2)"
            />
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <TrendLineChart
              data={stats?.monthly_averages || []}
              metric="temperature"
              color="#d97706"
              unit="°C"
              title="Surface Temperature (Thermal Heat Load)"
            />
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <TrendLineChart
              data={stats?.monthly_averages || []}
              metric="soil_moisture"
              color="#0891b2"
              unit="%"
              title="Root-Zone Volumetric Soil Moisture"
            />
          </div>
        </div>
      </section>

      {/* District-wise Comparative Matrix / Bar Chart */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">District Climate Stress Index (CSI) Overview</h3>
            <p className="text-xs text-slate-500">Comparative risk score based on weighted biophysical stress</p>
          </div>

          {/* Zone filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'North Coastal', 'Coastal Delta', 'South Coastal', 'Rayalaseema'].map(zone => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`
                  px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer
                  ${selectedZone === zone 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }
                `}
              >
                {zone}
              </button>
            ))}
          </div>
        </div>

        <DistrictRiskBarChart districts={filteredDistricts} />
      </section>
    </div>
  );
};
