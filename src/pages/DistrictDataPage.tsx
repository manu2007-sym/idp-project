import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Sprout, 
  Droplets, 
  ThermometerSun, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  History,
  Satellite,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Info,
  Check
} from 'lucide-react';
import { AP_DISTRICTS, MONTH_NAMES } from '../data/districts';
import { ClimateDataRecord, DistrictTelemetry, RiskLevel } from '../types/climate';
import { RiskBadge } from '../components/RiskBadge';

interface DistrictDataPageProps {
  onNavigateToPredict?: (districtName: string) => void;
}

export const DistrictDataPage: React.FC<DistrictDataPageProps> = ({ onNavigateToPredict }) => {
  const [selectedDistrictId, setSelectedDistrictId] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Auto-calculated climate indicators (computed by system, NOT typed by user)
  const [telemetry, setTelemetry] = useState<DistrictTelemetry | null>(null);
  const [districtRecords, setDistrictRecords] = useState<ClimateDataRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const selectedDistrict = AP_DISTRICTS.find(d => d.id === selectedDistrictId) || AP_DISTRICTS[0];

  // Auto-predict and fetch 4 climate features whenever District, Month, or Year changes
  const loadDistrictData = async (distId: number, m: number, y: number) => {
    setLoading(true);
    setSaveSuccess(null);
    setSaveError(null);

    const distObj = AP_DISTRICTS.find(d => d.id === distId);
    if (!distObj) return;

    try {
      // Auto-fetch climate indicators from satellite & weather grid
      const telRes = await fetch(`/api/district-telemetry/${encodeURIComponent(distObj.district_name)}?month=${m}&year=${y}`);
      const telJson = await telRes.json();
      if (telJson.success && telJson.data) {
        setTelemetry(telJson.data);
      }

      // Load previous observations from SQLite
      const recRes = await fetch(`/api/climate-data?district_id=${distId}&limit=12`);
      const recJson = await recRes.json();
      if (recJson.success) {
        setDistrictRecords(recJson.data);
      }
    } catch (e) {
      console.warn('Error loading district records:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDistrictData(selectedDistrictId, selectedMonth, selectedYear);
  }, [selectedDistrictId, selectedMonth, selectedYear]);

  // Handle Save to SQLite (using auto-predicted values)
  const handleSaveObservation = async () => {
    if (!telemetry) return;
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const res = await fetch('/api/climate-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district_id: selectedDistrictId,
          month: selectedMonth,
          year: selectedYear,
          ndvi: telemetry.ndvi,
          rainfall: telemetry.rainfall,
          temperature: telemetry.temperature,
          soil_moisture: telemetry.soil_moisture
        })
      });

      const json = await res.json();
      if (json.success) {
        setSaveSuccess(`Climate telemetry for ${selectedDistrict.district_name} saved in SQLite! (CSI: ${json.data.climate_stress_index.toFixed(3)})`);
        loadDistrictData(selectedDistrictId, selectedMonth, selectedYear);
      } else {
        setSaveError(json.error || 'Failed to save climate observation.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Network error saving record.');
    }
  };

  // Farmer advisory derived from auto-predicted climate indicators
  const getFarmerAdvisory = () => {
    if (!telemetry) return null;
    const { rainfall, ndvi, temperature, soil_moisture, baseline_risk } = telemetry;

    if (baseline_risk === 'HIGH') {
      return {
        title: 'Severe Climate Stress Warning / తీవ్ర వాతావరణ ఒత్తిడి హెచ్చరిక',
        badge: 'Critical Advisory',
        color: 'border-rose-300 bg-rose-50 text-rose-900',
        irrigation: 'Drip/micro-irrigation required immediately. Parched root-zone soil.',
        cropAdvice: 'Delay new sowing; prioritize drought-resilient crops (millets/pulses). Apply mulching to arrest moisture loss.',
        waterStatus: `Depleted Soil Moisture (${soil_moisture}%) and severe rain deficit (${rainfall} mm).`
      };
    } else if (baseline_risk === 'MEDIUM') {
      return {
        title: 'Moderate Stress Advisory / మితమైన ఒత్తిడి సలహా',
        badge: 'Proactive Alert',
        color: 'border-amber-300 bg-amber-50 text-amber-900',
        irrigation: 'Schedule supplemental irrigation during evening hours to minimize evaporation.',
        cropAdvice: 'Monitor vegetative canopy (NDVI: ' + ndvi + '). Watch for pest infestations triggered by temperature rise (' + temperature + '°C).',
        waterStatus: `Adequate for short cycles, but vulnerable if rain is delayed.`
      };
    } else {
      return {
        title: 'Favorable Farming Conditions / అనుకూలమైన వ్యవసాయ పరిస్థితులు',
        badge: 'Optimal Conditions',
        color: 'border-emerald-300 bg-emerald-50 text-emerald-900',
        irrigation: 'Normal irrigation schedule. Soil moisture is at optimal field capacity (' + soil_moisture + '%).',
        cropAdvice: 'Good vegetative health (NDVI: ' + ndvi + '). Ideal condition for paddy, sugarcane, and horticultural crops.',
        waterStatus: `Healthy precipitation reserves (${rainfall} mm) buffer against heat stress.`
      };
    }
  };

  const advisory = getFarmerAdvisory();

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Database className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">District Selection & Auto-Climate Telemetry</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Select any district or city. The system automatically retrieves and computes NDVI, Rainfall, Temperature, and Soil Moisture—no manual input required.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            <span>100% Auto-Populated for Farmers</span>
          </span>
        </div>
      </div>

      {/* District & City Selection Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Select District / City</h3>
            <p className="text-xs text-slate-500">
              Farmers and users only choose the location. The system predicts all 4 environmental indicators automatically.
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {selectedDistrict.zone} Zone • HQ: {selectedDistrict.hq}
          </span>
        </div>

        {/* District & Time Period Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* District Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Andhra Pradesh District / City
            </label>
            <select
              value={selectedDistrictId}
              onChange={(e) => setSelectedDistrictId(Number(e.target.value))}
              className="w-full text-xs font-bold bg-emerald-50/50 border border-emerald-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
            >
              {AP_DISTRICTS.map(d => (
                <option key={d.id} value={d.id}>
                  {d.id}. {d.district_name} ({d.zone})
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">Station: {selectedDistrict.station_code}</span>
          </div>

          {/* Month */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Observation Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} - {name}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">Seasonal Climate Cycle</span>
          </div>

          {/* Year */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Observation Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value={2026}>2026 (Operational)</option>
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">Climate Baseline</span>
          </div>
        </div>

        {/* AUTO-PREDICTED 4 CLIMATE INDICATORS (No typing required!) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Auto-Retrieved Climate Indicators for {selectedDistrict.district_name}
              </h4>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Satellite & AWS Grid Active
            </span>
          </div>

          {telemetry ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. NDVI */}
              <div className="p-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Sprout className="h-4 w-4 text-emerald-600" />
                    NDVI (Vegetation)
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-sm">
                    Satellite
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {telemetry.ndvi.toFixed(2)}
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${((telemetry.ndvi - 0.1) / 0.75) * 100}%` }} />
                </div>
                <p className="text-[11px] font-semibold text-emerald-700">
                  {telemetry.vegetation_health_status}
                </p>
                <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-100">
                  🛰️ Sentinel-2 / Landsat-9
                </span>
              </div>

              {/* 2. Rainfall */}
              <div className="p-4 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/60 to-white space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Droplets className="h-4 w-4 text-blue-600" />
                    Rainfall
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded-sm">
                    Weather Grid
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {telemetry.rainfall.toFixed(1)} <span className="text-sm font-normal text-slate-500">mm</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (telemetry.rainfall / 200) * 100)}%` }} />
                </div>
                <p className="text-[11px] font-semibold text-blue-700">
                  {telemetry.precipitation_condition}
                </p>
                <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-100">
                  🌧️ IMD AWS Gauge Network
                </span>
              </div>

              {/* 3. Temperature */}
              <div className="p-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/60 to-white space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <ThermometerSun className="h-4 w-4 text-amber-600" />
                    Temperature
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-sm">
                    Thermal
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {telemetry.temperature.toFixed(1)} <span className="text-sm font-normal text-slate-500">°C</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, ((telemetry.temperature - 18) / 28) * 100)}%` }} />
                </div>
                <p className="text-[11px] font-semibold text-amber-700">
                  {telemetry.thermal_comfort}
                </p>
                <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-100">
                  🌡️ Surface Thermal Grid
                </span>
              </div>

              {/* 4. Soil Moisture */}
              <div className="p-4 rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50/60 to-white space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-900 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-cyan-600" />
                    Soil Moisture
                  </span>
                  <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-1.5 py-0.5 rounded-sm">
                    Root-Zone
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {telemetry.soil_moisture.toFixed(1)} <span className="text-sm font-normal text-slate-500">%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(100, (telemetry.soil_moisture / 45) * 100)}%` }} />
                </div>
                <p className="text-[11px] font-semibold text-cyan-700">
                  {telemetry.soil_condition}
                </p>
                <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-100">
                  💧 NASA SMAP Radar Sensor
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl text-xs text-slate-400">
              Retrieving climate telemetry for {selectedDistrict.district_name}...
            </div>
          )}
        </div>

        {/* Farmer Advisory Card (Telugu & English) */}
        {advisory && (
          <div className={`p-5 rounded-2xl border ${advisory.color} space-y-2 shadow-2xs`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 shrink-0" />
                <h4 className="font-bold text-xs">{advisory.title}</h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 shadow-2xs">
                {advisory.badge}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 bg-white/70 rounded-xl">
                <span className="font-bold block text-slate-900 text-[11px]">🚜 సాగు మరియు పంట సలహా (Crop Guidance):</span>
                <p className="text-slate-700 text-[11px] mt-0.5">{advisory.cropAdvice}</p>
              </div>
              <div className="p-3 bg-white/70 rounded-xl">
                <span className="font-bold block text-slate-900 text-[11px]">💧 నీటిపారుదల సలహా (Irrigation Guidance):</span>
                <p className="text-slate-700 text-[11px] mt-0.5">{advisory.irrigation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {saveError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleSaveObservation}
            disabled={loading || !telemetry}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-105 text-white font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-60"
          >
            <Database className="h-4 w-4" />
            <span>Save Assessment into SQLite Database</span>
          </button>
        </div>
      </div>

      {/* District Observations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Recent Climate Records for {selectedDistrict.district_name}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">SQLite Stored</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Month / Year</th>
                <th className="py-2.5 px-3">NDVI (Canopy)</th>
                <th className="py-2.5 px-3">Rainfall</th>
                <th className="py-2.5 px-3">Temperature</th>
                <th className="py-2.5 px-3">Soil Moisture</th>
                <th className="py-2.5 px-3">Climate Stress Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {districtRecords.length > 0 ? (
                districtRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {MONTH_NAMES[r.month - 1] || r.month} {r.year}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-700 font-mono font-medium">{r.ndvi}</td>
                    <td className="py-2.5 px-3 text-blue-700 font-mono font-medium">{r.rainfall} mm</td>
                    <td className="py-2.5 px-3 text-amber-700 font-mono font-medium">{r.temperature} °C</td>
                    <td className="py-2.5 px-3 text-cyan-700 font-mono font-medium">{r.soil_moisture} %</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                      {r.climate_stress_index ? r.climate_stress_index.toFixed(3) : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-400">
                    No records stored for this district yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
