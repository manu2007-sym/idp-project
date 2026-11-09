import React from 'react';
import { 
  Satellite, 
  Droplets, 
  ThermometerSun, 
  Sprout, 
  Layers, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  ArrowRight, 
  Cpu, 
  Database, 
  Sparkles,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { NavPage } from '../components/Navbar';

interface HomePageProps {
  onNavigate: (page: NavPage) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-8 md:p-12 shadow-xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Driven Climate Intelligence & Geospatial Analytics</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Climate Risk Prediction for Andhra Pradesh
          </h1>
          <p className="text-emerald-100/90 text-base md:text-lg leading-relaxed font-light">
            An advanced deep learning framework utilizing a <strong className="font-semibold text-white">1D Convolutional Neural Network (1D CNN)</strong> and <strong className="font-semibold text-white">Explainable AI (Integrated Gradients)</strong> to monitor, evaluate, and interpret climate risks across all 26 districts of Andhra Pradesh.
          </p>

          {/* Quick Value Propositiion Chips */}
          <div className="flex flex-wrap gap-3 pt-2">
            <span className="flex items-center gap-1.5 text-xs bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              All 26 AP Districts
            </span>
            <span className="flex items-center gap-1.5 text-xs bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Zero-Typing Auto-Telemetry
            </span>
            <span className="flex items-center gap-1.5 text-xs bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Reported 72.41% Accuracy (400 Epochs)
            </span>
            <span className="flex items-center gap-1.5 text-xs bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Integrated Gradients (XAI)
            </span>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('predict')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Predict District Risk</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/15 transition-all cursor-pointer"
            >
              <span>View Main Dashboard</span>
            </button>
            <button
              onClick={() => onNavigate('map')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-200 font-semibold text-sm border border-cyan-800/60 transition-all cursor-pointer"
            >
              <MapPin className="h-4 w-4 text-cyan-400" />
              <span>Explore AP Risk Map</span>
            </button>
          </div>
        </div>
      </section>

      {/* Andhra Pradesh Climate Monitoring Introduction */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-xs">
        <div className="max-w-4xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <Satellite className="h-4 w-4" />
            <span>State Environmental Context</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Climate Vulnerability & Biophysical Dynamics in Andhra Pradesh
          </h2>
          <p className="text-slate-600 leading-relaxed text-sm md:text-base">
            Andhra Pradesh features a diverse geography ranging from the arid Rayalaseema plateau (Ananthapuramu, Kurnool, Kadapa) prone to frequent rain deficits, to the fertile Godavari and Krishna river deltas vulnerable to tropical cyclonic surges, and the elevated tribal Eastern Ghats of Alluri Sitharama Raju and Parvathipuram Manyam.
          </p>
          <p className="text-slate-600 leading-relaxed text-sm">
            To provide comprehensive early warning and decision support, this application monitors four foundational climate indicators, passes them through a weighted <strong>Climate Stress Index (CSI)</strong>, infers multi-class risk using a <strong>1D CNN</strong>, and reveals the exact feature influences using <strong>Integrated Gradients</strong>.
          </p>
        </div>
      </section>

      {/* Four Climate Indicator Cards */}
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Four Core Climate Indicators</h3>
          <p className="text-sm text-slate-500">The 4 satellite and in-situ features fed into the 1D CNN architecture</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. NDVI */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-300 transition-all">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Sprout className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-slate-900 text-base">NDVI</h4>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">Weight: 30%</span>
            </div>
            <p className="text-xs font-medium text-emerald-600 mb-2">Normalized Difference Vegetation Index</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Derived from Sentinel-2 / Landsat NIR & Red bands. Measures canopy greenness and photosynthetic activity. Range: 0.10 (arid) to 0.85 (dense forest).
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Source: ISRO / Copernicus</span>
              <span className="font-mono">Unit: Ratio</span>
            </div>
          </div>

          {/* 2. Rainfall */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-300 transition-all">
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
              <Droplets className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-slate-900 text-base">Rainfall</h4>
              <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md">Weight: 35%</span>
            </div>
            <p className="text-xs font-medium text-blue-600 mb-2">Precipitation Accumulation</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Total monthly rainfall in millimeters. The highest weighted driver in the CSI formula; dry spells trigger severe meteorological drought.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Source: IMD Weather Grid</span>
              <span className="font-mono">Unit: mm</span>
            </div>
          </div>

          {/* 3. Temperature */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-amber-300 transition-all">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <ThermometerSun className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-slate-900 text-base">Temperature</h4>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">Weight: 15%</span>
            </div>
            <p className="text-xs font-medium text-amber-600 mb-2">Surface Ambient Heat</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Average monthly ambient surface temperature. Identifies heatwaves, evapotranspiration surges, and crop heat stress during peak summer.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Source: AWS & ERA5</span>
              <span className="font-mono">Unit: °C</span>
            </div>
          </div>

          {/* 4. Soil Moisture */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-cyan-300 transition-all">
            <div className="h-10 w-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-3">
              <Layers className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-slate-900 text-base">Soil Moisture</h4>
              <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md">Weight: 20%</span>
            </div>
            <p className="text-xs font-medium text-cyan-600 mb-2">Root-Zone Water Availability</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Volumetric percentage of water content in the top 0-30 cm of soil. Direct predictor of agricultural drought and crop wilting.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Source: NASA SMAP / Soil Sensors</span>
              <span className="font-mono">Unit: % Vol</span>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Category Explanations */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-xs">
        <h3 className="text-xl font-bold text-slate-900 mb-1">Climate Risk Categorization Standards</h3>
        <p className="text-sm text-slate-500 mb-6">Classification criteria generated by 1D CNN Softmax probabilities and Climate Stress Index thresholds</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Low Risk */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                LOW RISK
              </span>
              <span className="text-xs font-mono font-semibold text-emerald-700">CSI &lt; 0.38</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Favorable climatic equilibrium. Abundant rainfall, optimal soil moisture reserves, robust vegetative canopy (high NDVI), and tolerable thermal ranges.
            </p>
            <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-100/70 p-2.5 rounded-xl">
              ✓ Typical in Godavari / Konaseema deltas and post-monsoon coastal zones.
            </div>
          </div>

          {/* Medium Risk */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                MEDIUM RISK
              </span>
              <span className="text-xs font-mono font-semibold text-amber-700">0.38 ≤ CSI &lt; 0.62</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Moderate biophysical stress. Rainfall deficit or soil moisture depletion is compensated partially by canopy resilience or mild temperatures.
            </p>
            <div className="text-[11px] text-amber-800 font-semibold bg-amber-100/70 p-2.5 rounded-xl">
              ⚠ Warrants proactive water conservation and crop health surveillance.
            </div>
          </div>

          {/* High Risk */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                HIGH RISK
              </span>
              <span className="text-xs font-mono font-semibold text-rose-700">CSI ≥ 0.62</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Critical environmental stress. Compounded drought conditions: severe rainfall deficit, parched root-zones, sparse vegetation, and extreme heatwaves.
            </p>
            <div className="text-[11px] text-rose-800 font-semibold bg-rose-100/70 p-2.5 rounded-xl">
              🚨 Immediate drought response, groundwater recharge, and relief advisories needed.
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Grid */}
      <section className="bg-slate-900 rounded-3xl p-8 text-white space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">End-to-End Architecture</span>
          <h3 className="text-2xl font-bold mt-1">Integrated Technology Stack</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <Cpu className="h-6 w-6 text-emerald-400 mb-2" />
            <h4 className="font-bold text-sm text-slate-200">PyTorch 1D CNN</h4>
            <p className="text-xs text-slate-400 mt-1">2 Conv1D layers + Adaptive Pooling + FC classifier trained for 400 epochs.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <Sparkles className="h-6 w-6 text-cyan-400 mb-2" />
            <h4 className="font-bold text-sm text-slate-200">Integrated Gradients</h4>
            <p className="text-xs text-slate-400 mt-1">Riemann path integral (M=50) for rigorous Explainable AI feature attribution.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <Database className="h-6 w-6 text-amber-400 mb-2" />
            <h4 className="font-bold text-sm text-slate-200">SQLite & SQLAlchemy</h4>
            <p className="text-xs text-slate-400 mt-1">Persistent database storing 26 districts, 312 climate observations & XAI logs.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <MapPin className="h-6 w-6 text-rose-400 mb-2" />
            <h4 className="font-bold text-sm text-slate-200">Leaflet.js Geospatial</h4>
            <p className="text-xs text-slate-400 mt-1">Interactive Andhra Pradesh map with risk markers and live district telemetry.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
