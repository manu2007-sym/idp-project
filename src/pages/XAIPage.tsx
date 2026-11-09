import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  Sprout, 
  Droplets, 
  ThermometerSun, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  Info, 
  ShieldAlert,
  BrainCircuit,
  Scale
} from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { RiskLevel } from '../types/climate';
import { AP_DISTRICTS } from '../data/districts';

interface XAIPageProps {
  initialPredictionId?: number | null;
}

export const XAIPage: React.FC<XAIPageProps> = ({ initialPredictionId }) => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadPredictions = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/predictions?limit=30');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setPredictions(json.data);
          if (initialPredictionId) {
            const found = json.data.find((p: any) => p.id === initialPredictionId);
            setSelectedPrediction(found || json.data[0]);
          } else {
            setSelectedPrediction(json.data[0]);
          }
        }
      } catch (e) {
        console.error('Error fetching predictions for XAI:', e);
      } finally {
        setLoading(false);
      }
    };
    loadPredictions();
  }, [initialPredictionId]);

  const p = selectedPrediction;

  const ndviCont = p?.ndvi_contribution ?? -32.5;
  const rainCont = p?.rainfall_contribution ?? 48.2;
  const tempCont = p?.temperature_contribution ?? 24.1;
  const soilCont = p?.soil_moisture_contribution ?? 16.4;

  const features = [
    {
      name: 'Rainfall',
      unit: 'mm',
      val: p?.rainfall ?? 38.5,
      contribution: rainCont,
      icon: Droplets,
      color: '#2563eb',
      desc: rainCont > 0 ? 'Deficit below seasonal norm pushes risk higher' : 'Adequate precipitation provides drought buffer'
    },
    {
      name: 'NDVI (Canopy)',
      unit: '',
      val: p?.ndvi ?? 0.24,
      contribution: ndviCont,
      icon: Sprout,
      color: '#059669',
      desc: ndviCont > 0 ? 'Sparse canopy indicates persistent biomass stress' : 'Healthy vegetation canopy absorbs climate shocks'
    },
    {
      name: 'Temperature',
      unit: '°C',
      val: p?.temperature ?? 36.5,
      contribution: tempCont,
      icon: ThermometerSun,
      color: '#d97706',
      desc: tempCont > 0 ? 'Elevated thermal load increases evapotranspiration' : 'Moderate temperatures mitigate risk'
    },
    {
      name: 'Soil Moisture',
      unit: '%',
      val: p?.soil_moisture ?? 14.0,
      contribution: soilCont,
      icon: Layers,
      color: '#0891b2',
      desc: soilCont > 0 ? 'Depleted root-zone water worsens crop wilting' : 'High soil moisture buffers heatwaves'
    }
  ];

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Explainable AI (XAI) with Integrated Gradients</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Axiomatic feature attribution explaining why the 1D CNN predicted LOW, MEDIUM, or HIGH risk for each district.
          </p>
        </div>

        {/* Prediction Selector */}
        {predictions.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Select Case:</label>
            <select
              value={selectedPrediction?.id || ''}
              onChange={(e) => {
                const found = predictions.find(pred => pred.id === Number(e.target.value));
                if (found) setSelectedPrediction(found);
              }}
              className="text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
            >
              {predictions.map(pred => (
                <option key={pred.id} value={pred.id}>
                  #{pred.id} {pred.district_name} ({pred.predicted_risk})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Mandatory Scientific Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">Methodological Clarification</h4>
          <p className="text-xs text-amber-800/90 leading-relaxed mt-0.5">
            <strong>"Integrated Gradients explains how input features influence the model prediction. It does not prove physical causation."</strong>
          </p>
          <p className="text-[11px] text-amber-700/80 mt-1">
            Path integration satisfies the axioms of Completeness and Implementation Invariance, reflecting neural network gradient attributions from a neutral environmental baseline.
          </p>
        </div>
      </div>

      {p ? (
        <div className="space-y-6">
          {/* Active Case Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Analyzed District</span>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>{p.district_name}</span>
                  <span className="text-xs font-normal text-slate-400">({p.zone})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prediction #{p.id} • Date: {new Date(p.prediction_date).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold">1D CNN Prediction</span>
                  <RiskBadge risk={p.predicted_risk as RiskLevel} size="md" showPulse />
                </div>
                <div className="text-right pl-3 border-l border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Confidence</span>
                  <span className="text-lg font-black text-slate-800">{p.confidence}%</span>
                </div>
              </div>
            </div>

            {/* Model narrative explanation */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-bold text-slate-800 block mb-1">
                Generated Model Attribution Narrative:
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-light">
                {p.explanation || `The 1D CNN prediction for ${p.district_name} was driven predominantly by precipitation deficit and soil moisture stress.`}
              </p>
            </div>
          </div>

          {/* Feature Importance Bar Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Feature Contribution Breakdown</h3>
              <p className="text-xs text-slate-500">
                Positive percentage (+) pushes the model towards higher risk; Negative percentage (-) mitigates/lowers risk.
              </p>
            </div>

            <div className="space-y-4">
              {features.map((f, i) => {
                const Icon = f.icon;
                const isPositive = f.contribution > 0;
                const absVal = Math.abs(f.contribution);

                return (
                  <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: f.color }}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800">{f.name}</span>
                          <span className="text-slate-400 ml-2 font-mono text-[11px]">(Observed: {f.val} {f.unit})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${
                          isPositive ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isPositive ? <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> : <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />}
                          {isPositive ? `+${f.contribution}% (Risk Driver)` : `${f.contribution}% (Mitigating Factor)`}
                        </span>
                      </div>
                    </div>

                    {/* Visual contribution bar */}
                    <div className="h-3 w-full bg-slate-200/70 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-700 ${isPositive ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, Math.max(8, absVal))}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-500">
                      {f.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mathematical Path Integral Explanation */}
          <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <BrainCircuit className="h-4 w-4" />
              <span>Mathematical Formulation</span>
            </div>
            <h3 className="text-xl font-bold">Integrated Gradients Path Integral Equation</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Unlike simple saliency maps which evaluate gradients only at the input point and suffer from gradient saturation, Integrated Gradients computes the definite integral of gradients along the straight line from a baseline neutral state $x'$ to the input vector $x$:
            </p>

            <div className="p-4 rounded-xl bg-slate-800/90 font-mono text-xs text-emerald-300 border border-slate-700 overflow-x-auto">
              Attribution_i(x) = (x_i - x'_i) × ∫[0, 1] (∂F_c(x' + α(x - x')) / ∂x_i) dα
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400 font-bold block mb-1">Baseline Vector (x')</span>
                <p className="text-[11px] text-slate-300">
                  Neutral climate equilibrium: [NDVI: 0.45, Rain: 90mm, Temp: 28°C, Soil: 28%]
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400 font-bold block mb-1">Riemann Steps (M)</span>
                <p className="text-[11px] text-slate-300">
                  M = 50 interpolation steps with PyTorch autograd accumulation.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400 font-bold block mb-1">Target Class (c)</span>
                <p className="text-[11px] text-slate-300">
                  Gradient computed with respect to predicted logit {p.predicted_risk}.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500">No predictions found. Go to "1D CNN Risk Prediction" to create one.</p>
        </div>
      )}
    </div>
  );
};
