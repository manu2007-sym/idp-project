import React from 'react';
import { 
  Info, 
  Target, 
  CheckCircle2, 
  Scale, 
  ShieldAlert
} from 'lucide-react';
import { REPORTED_MODEL_METRICS } from '../ml/engine.ts';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-10 pb-12 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Info className="h-4.5 w-4.5" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">About Project & Research Methodology</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          Complete academic methodology, architecture specifications, and benchmark evaluation results from the project presentation: <em>"Climate Risk Prediction for Andhra Pradesh Using 1D CNN with Explainable AI"</em>.
        </p>
      </div>

      {/* 1. Problem Statement & Objectives */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-600" />
          <span>Problem Statement & Project Objectives</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Andhra Pradesh experiences acute agro-climatic disparities. The semi-arid Rayalaseema region faces recurrent agricultural and meteorological droughts characterized by erratic rainfall and depleted root-zone moisture, while the coastal delta regions contend with cyclonic inundation and rapid thermal swings. Traditional weather forecasting relies on scalar thresholds that fail to capture non-linear interactions across satellite vegetation indices and in-situ hydrologic variables.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <h4 className="text-xs font-bold text-slate-800 mb-1">1. Multi-Sensor Integration</h4>
            <p className="text-[11px] text-slate-500">
              Fuse Sentinel-2 NDVI with IMD rainfall, surface temperature, and SMAP soil moisture into unified district records.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <h4 className="text-xs font-bold text-slate-800 mb-1">2. 1D CNN Risk Learning</h4>
            <p className="text-[11px] text-slate-500">
              Train a 1D Convolutional Neural Network across 400 epochs to model complex feature correlations into LOW, MEDIUM, and HIGH classes.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <h4 className="text-xs font-bold text-slate-800 mb-1">3. Axiomatic Transparency (XAI)</h4>
            <p className="text-[11px] text-slate-500">
              Apply Integrated Gradients to dismantle the neural "black box" and provide auditable feature attributions for disaster management agencies.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Climate Stress Index (CSI) Formula */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Scale className="h-5 w-5 text-teal-600" />
          <span>Climate Stress Index (CSI) Formulation</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Ground-truth labels are established through a weighted biophysical stress index converting raw climate variables into normalized stress functions $S \in [0, 1]$:
        </p>

        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 font-mono text-xs text-emerald-950 font-bold overflow-x-auto text-center">
          CSI = (0.35 × Rainfall Stress) + (0.30 × NDVI Stress) + (0.20 × Soil Moisture Stress) + (0.15 × Temperature Stress)
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-slate-400 font-bold block text-[10px]">RAINFALL (35%)</span>
            <span className="font-semibold text-slate-800 text-xs">S = clamp(1 - Rain/180, 0, 1)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-slate-400 font-bold block text-[10px]">NDVI (30%)</span>
            <span className="font-semibold text-slate-800 text-xs">S = clamp(1 - (NDVI-0.15)/0.5, 0, 1)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-slate-400 font-bold block text-[10px]">SOIL MOISTURE (20%)</span>
            <span className="font-semibold text-slate-800 text-xs">S = clamp(1 - (Soil-10)/30, 0, 1)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-slate-400 font-bold block text-[10px]">TEMPERATURE (15%)</span>
            <span className="font-semibold text-slate-800 text-xs">S = clamp((Temp-26)/16, 0, 1)</span>
          </div>
        </div>
      </section>

      {/* 3. 1D CNN Architecture & Layer Pipeline */}
      <section className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Deep Learning Model</span>
          <h3 className="text-xl font-bold mt-1">PyTorch 1D Convolutional Neural Network Architecture</h3>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/80 font-mono text-xs text-emerald-300 border border-slate-700/80 space-y-2">
          <div className="text-white font-bold pb-1 border-b border-slate-700">Pipeline Flow:</div>
          <div>Input: Tensor(Batch, 1, 4)  [NDVI, Rainfall, Temperature, Soil Moisture]</div>
          <div> └─ Conv1D (in=1, out=16, kernel_size=2, padding=1) + BatchNorm1d + ReLU</div>
          <div> └─ Conv1D (in=16, out=32, kernel_size=2, padding=1) + BatchNorm1d + ReLU</div>
          <div> └─ AdaptiveAvgPool1d(1) → Tensor(Batch, 32, 1) → Squeeze to Tensor(Batch, 32)</div>
          <div> └─ Dense Layer (32 → 16) + ReLU + Dropout(0.2)</div>
          <div> └─ Dense Output (16 → 3) → Logits for [LOW RISK, MEDIUM RISK, HIGH RISK]</div>
          <div> └─ Softmax Activation → [P_Low, P_Medium, P_High]</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Framework</span>
            <strong className="text-white">PyTorch 2.2+</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Training Epochs</span>
            <strong className="text-white">400 Epochs</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Optimizer</span>
            <strong className="text-white">Adam (lr=0.005)</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Loss Function</span>
            <strong className="text-white">CrossEntropyLoss</strong>
          </div>
        </div>
      </section>

      {/* 4. Reported Project Evaluation Results */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Presentation Benchmark</span>
          <h3 className="text-xl font-bold text-slate-900 mt-1">Reported Evaluation Metrics (Project Presentation)</h3>
          <p className="text-xs text-slate-500">
            Reported performance achieved on the 144 observation test split (115 train, 29 test):
          </p>
        </div>

        {/* Big Accuracy Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-xs text-emerald-800 font-bold uppercase block">Reported Accuracy</span>
            <span className="text-3xl font-black text-emerald-900 mt-1 block">72.41%</span>
            <span className="text-[11px] text-emerald-700">21 out of 29 Correct</span>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-xs text-blue-800 font-bold uppercase block">Training Observations</span>
            <span className="text-3xl font-black text-blue-900 mt-1 block">115</span>
            <span className="text-[11px] text-blue-700">Observations</span>
          </div>
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
            <span className="text-xs text-purple-800 font-bold uppercase block">Testing Observations</span>
            <span className="text-3xl font-black text-purple-900 mt-1 block">29</span>
            <span className="text-[11px] text-purple-700">Observations</span>
          </div>
        </div>

        {/* Precision / Recall Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Risk Class</th>
                <th className="py-2.5 px-4">Precision (%)</th>
                <th className="py-2.5 px-4">Recall (%)</th>
                <th className="py-2.5 px-4">F1-Score (%)</th>
                <th className="py-2.5 px-4">Evaluation Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-3 px-4 font-bold text-emerald-700">LOW RISK</td>
                <td className="py-3 px-4 font-bold text-slate-800">88%</td>
                <td className="py-3 px-4 font-bold text-slate-800">78%</td>
                <td className="py-3 px-4 font-mono">82.7%</td>
                <td className="py-3 px-4 text-slate-500">Highest precision; accurately flags fertile delta conditions</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-amber-700">MEDIUM RISK</td>
                <td className="py-3 px-4 font-bold text-slate-800">67%</td>
                <td className="py-3 px-4 font-bold text-slate-800">60%</td>
                <td className="py-3 px-4 font-mono">63.3%</td>
                <td className="py-3 px-4 text-slate-500">Transitional states with boundary overlap</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-rose-700">HIGH RISK</td>
                <td className="py-3 px-4 font-bold text-slate-800">67%</td>
                <td className="py-3 px-4 font-bold text-slate-800">80%</td>
                <td className="py-3 px-4 font-mono">72.9%</td>
                <td className="py-3 px-4 text-slate-500">High sensitivity/recall; ensures critical drought conditions are caught</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Advantages, Limitations, and Prototype Disclaimer */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Advantages of Proposed System</span>
          </h4>
          <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <li>• Receptive field of 1D CNN captures multi-feature interactions better than static regression models.</li>
            <li>• Integrated Gradients satisfies the axioms of completeness, eliminating black-box opacity.</li>
            <li>• Instant automatic telemetry ingestion across all 26 districts of Andhra Pradesh.</li>
            <li>• Low inference latency (&lt;20ms) allows real-time interactive district monitoring.</li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <span>Limitations & Operational Disclaimer</span>
          </h4>
          <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <li>• <strong>Prototype Disclaimer:</strong> This web application is an academic monitoring prototype and not an official emergency disaster warning system issued by APSDMA or IMD.</li>
            <li>• Data resolution is currently aggregated at the monthly district level; village or mandal-level granularity is planned for future iterations.</li>
            <li>• Extreme episodic flash floods or localized cloudbursts require hourly hydrodynamic modeling.</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
