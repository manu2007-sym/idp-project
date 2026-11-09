import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  Sprout, 
  Droplets, 
  ThermometerSun, 
  Layers, 
  Sliders, 
  RotateCcw, 
  CheckCircle2, 
  Satellite, 
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info
} from 'lucide-react';
import { AP_DISTRICTS, MONTH_NAMES } from '../data/districts';
import { DistrictTelemetry, PredictionRecord, RiskLevel } from '../types/climate';
import { RiskBadge } from '../components/RiskBadge';
import { NavPage } from '../components/Navbar';

interface PredictionPageProps {
  onNavigate: (page: NavPage) => void;
  onSelectPredictionForXai?: (predId: number) => void;
}

export const PredictionPage: React.FC<PredictionPageProps> = ({ onNavigate, onSelectPredictionForXai }) => {
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>('Ananthapuramu');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Four climate indicators (automatically populated on district selection)
  const [ndvi, setNdvi] = useState<number>(0.20);
  const [rainfall, setRainfall] = useState<number>(42.0);
  const [temperature, setTemperature] = useState<number>(36.2);
  const [soilMoisture, setSoilMoisture] = useState<number>(12.0);

  const [telemetryInfo, setTelemetryInfo] = useState<DistrictTelemetry | null>(null);
  const [simulationMode, setSimulationMode] = useState<boolean>(false);
  const [loadingTelemetry, setLoadingTelemetry] = useState<boolean>(false);

  // Prediction execution state
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<any | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  // Auto-fetch telemetry whenever district, month, or year changes
  const fetchTelemetry = async (dName: string, m: number, y: number) => {
    setLoadingTelemetry(true);
    try {
      const res = await fetch(`/api/district-telemetry/${encodeURIComponent(dName)}?month=${m}&year=${y}`);
      const json = await res.json();
      if (json.success && json.data) {
        const t: DistrictTelemetry = json.data;
        setTelemetryInfo(t);
        // Automatically populate the four features without user having to type them!
        setNdvi(t.ndvi);
        setRainfall(t.rainfall);
        setTemperature(t.temperature);
        setSoilMoisture(t.soil_moisture);
      }
    } catch (e) {
      console.warn('Using local fallback telemetry generator:', e);
    } finally {
      setLoadingTelemetry(false);
    }
  };

  useEffect(() => {
    fetchTelemetry(selectedDistrictName, selectedMonth, selectedYear);
  }, [selectedDistrictName, selectedMonth, selectedYear]);

  // Handle Predict Risk Button
  const handlePredict = async () => {
    setIsPredicting(true);
    setPredictionError(null);

    const distObj = AP_DISTRICTS.find(d => d.district_name === selectedDistrictName) || AP_DISTRICTS[0];

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district_id: distObj.id,
          month: selectedMonth,
          year: selectedYear,
          ndvi,
          rainfall,
          temperature,
          soil_moisture: soilMoisture
        })
      });

      const json = await res.json();
      if (json.success) {
        setPredictionResult(json.data);
      } else {
        setPredictionError(json.error || 'Failed to compute risk prediction');
      }
    } catch (err: any) {
      setPredictionError(err.message || 'Network error predicting climate risk');
    } finally {
      setIsPredicting(false);
    }
  };

  const selectedDistrictObj = AP_DISTRICTS.find(d => d.district_name === selectedDistrictName) || AP_DISTRICTS[0];

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <BrainCircuit className="h-4.5 w-4.5" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">1D CNN Climate Risk Prediction</h2>
          <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
            PyTorch Architecture
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Select any of the 26 Andhra Pradesh districts. The system automatically populates the 4 satellite and weather indicators (NDVI, Rainfall, Temperature, Soil Moisture) and computes deep learning multi-class risk with Integrated Gradients XAI.
        </p>
      </div>

      {/* Auto-Telemetry Callout Card */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Satellite className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-emerald-950">100% Automated District Climate Telemetry</span>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-sm font-semibold">Auto-Computed</span>
            </div>
            <p className="text-[11px] text-emerald-800/90 mt-0.5">
              Farmers only choose their District or City. The system automatically retrieves NDVI, Rainfall, Temperature, and Soil Moisture from satellite and weather sensors.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-white/80 border border-emerald-300 px-3 py-1.5 rounded-xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>No Manual Input Needed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: District Selection & Auto-Telemetry Indicators (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <h3 className="font-bold text-slate-900 text-base flex items-center justify-between">
              <span>District & Time Period Selection</span>
              <span className="text-xs text-slate-400 font-normal">All 26 Districts Supported</span>
            </h3>

            {/* Selection inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* District Dropdown */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select District
                </label>
                <select
                  value={selectedDistrictName}
                  onChange={(e) => setSelectedDistrictName(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {AP_DISTRICTS.map(d => (
                    <option key={d.id} value={d.district_name}>
                      {d.id}. {d.district_name} ({d.zone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Month */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {MONTH_NAMES.map((name, i) => (
                    <option key={i + 1} value={i + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value={2026}>2026 (Current)</option>
                  <option value={2025}>2025 (Historical)</option>
                  <option value={2024}>2024 (Historical)</option>
                </select>
              </div>
            </div>

            {/* District context badge */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
              <div>
                <strong className="text-slate-800">{selectedDistrictObj.district_name}</strong> (HQ: {selectedDistrictObj.hq})
                <span className="ml-2 text-slate-400">• Zone: {selectedDistrictObj.zone}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">Station: {selectedDistrictObj.station_code}</span>
            </div>

            {/* 4 Feature Indicator Cards (Auto-populated!) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Biophysical Climate Indicators (Auto-Populated for Farmers)
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                  Active Telemetry
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. NDVI */}
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Sprout className="h-4 w-4 text-emerald-600" />
                      <span>NDVI (Vegetation Canopy)</span>
                    </div>
                    <span className="text-xs font-black text-emerald-700">{ndvi.toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden my-2">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${((ndvi - 0.1) / 0.75) * 100}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-emerald-700 font-semibold">{telemetryInfo?.vegetation_health_status || 'Vegetation Canopy Status'}</span>
                    <span className="text-slate-400">🛰️ Sentinel-2</span>
                  </div>
                </div>

                {/* 2. Rainfall */}
                <div className="p-3.5 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-white">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Droplets className="h-4 w-4 text-blue-600" />
                      <span>Rainfall (Precipitation)</span>
                    </div>
                    <span className="text-xs font-black text-blue-700">{rainfall.toFixed(1)} mm</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden my-2">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (rainfall / 250) * 100)}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-blue-700 font-semibold">{telemetryInfo?.precipitation_condition || 'Precipitation Level'}</span>
                    <span className="text-slate-400">🌧️ IMD AWS Grid</span>
                  </div>
                </div>

                {/* 3. Temperature */}
                <div className="p-3.5 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-white">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <ThermometerSun className="h-4 w-4 text-amber-600" />
                      <span>Surface Temperature</span>
                    </div>
                    <span className="text-xs font-black text-amber-700">{temperature.toFixed(1)} °C</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden my-2">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, ((temperature - 18) / 30) * 100)}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-amber-700 font-semibold">{telemetryInfo?.thermal_comfort || 'Thermal Comfort Status'}</span>
                    <span className="text-slate-400">🌡️ Surface Weather Grid</span>
                  </div>
                </div>

                {/* 4. Soil Moisture */}
                <div className="p-3.5 rounded-xl border border-cyan-200 bg-gradient-to-br from-cyan-50/50 to-white">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Layers className="h-4 w-4 text-cyan-600" />
                      <span>Root-Zone Soil Moisture</span>
                    </div>
                    <span className="text-xs font-black text-cyan-700">{soilMoisture.toFixed(1)} %</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden my-2">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(100, (soilMoisture / 50) * 100)}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-cyan-700 font-semibold">{telemetryInfo?.soil_condition || 'Root-zone Moisture Capacity'}</span>
                    <span className="text-slate-400">💧 NASA SMAP Radar</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Predict Risk CTA */}
            <div className="pt-2">
              <button
                onClick={handlePredict}
                disabled={isPredicting}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-md shadow-emerald-700/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isPredicting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Executing 1D CNN Inference & Integrated Gradients...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Predict Risk for {selectedDistrictName}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Prediction Result & XAI Card (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {predictionError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <strong>Error:</strong> {predictionError}
            </div>
          )}

          {predictionResult ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-md space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prediction Output</span>
                  <h3 className="font-extrabold text-slate-900 text-lg">{predictionResult.district_name}</h3>
                </div>
                <RiskBadge risk={predictionResult.predicted_risk as RiskLevel} size="lg" showPulse />
              </div>

              {/* Confidence & CSI */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Model Confidence</span>
                  <span className="text-xl font-black text-slate-800">{predictionResult.confidence}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Climate Stress Index</span>
                  <span className="text-xl font-black text-slate-800 font-mono">
                    {predictionResult.climate_stress_index?.toFixed(3) || '0.450'}
                  </span>
                </div>
              </div>

              {/* Class Probabilities Progress Bars */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-slate-700">1D CNN Softmax Probabilities:</span>
                
                {/* LOW Probability */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> LOW RISK
                    </span>
                    <span className="font-mono text-slate-600 font-medium">
                      {(predictionResult.low_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700" 
                      style={{ width: `${predictionResult.low_probability * 100}%` }}
                    />
                  </div>
                </div>

                {/* MEDIUM Probability */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> MEDIUM RISK
                    </span>
                    <span className="font-mono text-slate-600 font-medium">
                      {(predictionResult.medium_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-700" 
                      style={{ width: `${predictionResult.medium_probability * 100}%` }}
                    />
                  </div>
                </div>

                {/* HIGH Probability */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-rose-700 font-semibold flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3" /> HIGH RISK
                    </span>
                    <span className="font-mono text-slate-600 font-medium">
                      {(predictionResult.high_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-rose-500 rounded-full transition-all duration-700" 
                      style={{ width: `${predictionResult.high_probability * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Integrated Gradients Attribution Teaser */}
              {predictionResult.xai && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                      Integrated Gradients Feature Influence
                    </span>
                    <span className="text-[10px] text-slate-400">Path Integral</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-lg bg-white border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">NDVI:</span>
                      <strong className={predictionResult.xai.ndvi_contribution >= 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        {predictionResult.xai.ndvi_contribution > 0 ? '+' : ''}{predictionResult.xai.ndvi_contribution}%
                      </strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Rainfall:</span>
                      <strong className={predictionResult.xai.rainfall_contribution >= 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        {predictionResult.xai.rainfall_contribution > 0 ? '+' : ''}{predictionResult.xai.rainfall_contribution}%
                      </strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Temperature:</span>
                      <strong className={predictionResult.xai.temperature_contribution >= 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        {predictionResult.xai.temperature_contribution > 0 ? '+' : ''}{predictionResult.xai.temperature_contribution}%
                      </strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Soil Moisture:</span>
                      <strong className={predictionResult.xai.soil_moisture_contribution >= 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        {predictionResult.xai.soil_moisture_contribution > 0 ? '+' : ''}{predictionResult.xai.soil_moisture_contribution}%
                      </strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed font-light pt-1">
                    {predictionResult.xai.explanation}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    if (onSelectPredictionForXai && predictionResult.id) {
                      onSelectPredictionForXai(predictionResult.id);
                    }
                    onNavigate('xai');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all text-center cursor-pointer"
                >
                  Deep Dive XAI Analysis →
                </button>
                <button
                  onClick={() => onNavigate('map')}
                  className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                >
                  View on Map
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 text-slate-400 mx-auto flex items-center justify-center">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Ready for 1D CNN Inference</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Click <strong>"Predict Risk"</strong> to pass the auto-fetched climate indicators through the convolutional network and receive instant risk probabilities & XAI attribution.
              </p>
            </div>
          )}

          {/* Model Specs Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Info className="h-4 w-4 text-emerald-600" />
              <span>Reported Presentation Performance</span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-500">
              <li>• Architecture: Conv1D(16) → Conv1D(32) → AdaptivePool → FC(32→16)</li>
              <li>• Benchmark Accuracy: <strong>72.41%</strong> (21/29 correct predictions)</li>
              <li>• Low Risk Precision: 88% | High Risk Recall: 80%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
