import React, { useState } from 'react';
import {
  RefreshCw,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  BookmarkCheck,
  TrendingUp,
  Sparkles,
  Info
} from 'lucide-react';
import { NeuralNetwork } from '../ml/annEngine';
import { Season, RotationPlan, PredictionCandidate } from '../types/agriculture';
import { generateOptimizedRotationPlan } from '../services/rotationOptimizer';
import { CROP_METADATA_REGISTRY } from '../services/cropKnowledge';

interface RotationPlannerProps {
  neuralNet: NeuralNetwork;
  initialSoilFromRecommendation?: {
    N: number; P: number; K: number; ph: number; rainfall: number; previousCrop?: string;
  };
  onSaveRotationPlan: (plan: RotationPlan) => Promise<void>;
}

export const RotationPlanner: React.FC<RotationPlannerProps> = ({
  neuralNet,
  initialSoilFromRecommendation,
  onSaveRotationPlan,
}) => {
  const [fieldName, setFieldName] = useState('Plot A - Central Field');
  const [seasonsCount, setSeasonsCount] = useState<number>(4);
  const [startSeason, setStartSeason] = useState<Season>('Kharif');
  const [previousCrop, setPreviousCrop] = useState<string>(
    initialSoilFromRecommendation?.previousCrop || 'rice'
  );
  const [soilN, setSoilN] = useState<number>(initialSoilFromRecommendation?.N ?? 60);
  const [soilP, setSoilP] = useState<number>(initialSoilFromRecommendation?.P ?? 45);
  const [soilK, setSoilK] = useState<number>(initialSoilFromRecommendation?.K ?? 40);
  const [ph, setPh] = useState<number>(initialSoilFromRecommendation?.ph ?? 6.5);
  const [rainfall, setRainfall] = useState<number>(initialSoilFromRecommendation?.rainfall ?? 120);

  const [activePlan, setActivePlan] = useState<RotationPlan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleGeneratePlan = () => {
    // Generate base predictions using ANN
    const predResult = neuralNet.predict({
      N: soilN,
      P: soilP,
      K: soilK,
      temperature: 25.0,
      humidity: 70.0,
      ph,
      rainfall,
      previousCrop,
    });

    const plan = generateOptimizedRotationPlan({
      fieldName,
      seasonsCount,
      startSeason,
      initialSoil: {
        N: soilN,
        P: soilP,
        K: soilK,
        ph,
        rainfall,
        previousCrop,
      },
      annCandidates: predResult.topCandidates,
    });

    setActivePlan(plan);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!activePlan) return;
    setIsSaving(true);
    try {
      await onSaveRotationPlan(activePlan);
      setSaveSuccess(true);
    } catch (err: any) {
      alert('Failed to save rotation plan to SQLite: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!activePlan) return;
    const headers = ['Season_Index', 'Season_Name', 'Calendar_Window', 'Crop', 'Family', 'ANN_Suitability_Pct', 'Rotation_Score', 'Nitrogen_Impact', 'Rationale'];
    const rows = activePlan.sequence.map(s => [
      s.seasonIndex,
      s.seasonName,
      `"${s.calendarMonth}"`,
      s.crop,
      `"${s.family}"`,
      s.annSuitability,
      s.rotationScore,
      `"${s.soilImpact.nitrogenChange}"`,
      `"${s.rationale.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `crop_rotation_plan_${activePlan.fieldName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <RefreshCw className="w-8 h-8 text-teal-600" />
          Multi-Season Crop Rotation Optimization Engine
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Solves the multi-season constrained sequence problem: combines ANN suitability probabilities with 
          botanical family alternation, legume atmospheric nitrogen replenishment, and seasonal calendars.
        </p>
      </div>

      {/* Control Form */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field / Plot Identifier
            </label>
            <input
              type="text"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Planning Horizon ({seasonsCount} Seasons)
            </label>
            <select
              value={seasonsCount}
              onChange={(e) => setSeasonsCount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value={3}>3 Seasons (1 Year Cycle: Kharif, Rabi, Zaid)</option>
              <option value={4}>4 Seasons (1.3 Year Transition Cycle)</option>
              <option value={5}>5 Seasons (Multi-Year Sustainable Schedule)</option>
              <option value={6}>6 Seasons (2 Full Agro-Ecological Years)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Starting Season
            </label>
            <select
              value={startSeason}
              onChange={(e) => setStartSeason(e.target.value as Season)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="Kharif">Kharif (Monsoon: June - October)</option>
              <option value="Rabi">Rabi (Winter: November - March)</option>
              <option value="Zaid">Zaid (Summer: April - May)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Preceding Harvested Crop
            </label>
            <select
              value={previousCrop}
              onChange={(e) => setPreviousCrop(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="None">None / Fallow</option>
              {Object.keys(CROP_METADATA_REGISTRY).sort().map(crop => (
                <option key={crop} value={crop}>
                  {CROP_METADATA_REGISTRY[crop].name} ({CROP_METADATA_REGISTRY[crop].family})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Soil Baseline: N={soilN} kg/ha, P={soilP} kg/ha, K={soilK} kg/ha, pH={ph}, Rain={rainfall} mm</span>
          </div>

          <button
            onClick={handleGeneratePlan}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Generate Optimized Rotation Schedule
          </button>
        </div>
      </div>

      {/* Plan Output */}
      {activePlan ? (
        <div className="space-y-8">
          {/* Summary Banner */}
          <div className="bg-gradient-to-r from-teal-900 to-emerald-900 rounded-2xl p-6 text-white shadow-lg border border-teal-700">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-teal-300 block mb-1">
                  Active Rotation Plan
                </span>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  {activePlan.fieldName}
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-800 text-teal-200 border border-teal-600 font-semibold">
                    {activePlan.seasonsCount} Seasons
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving || saveSuccess}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    saveSuccess
                      ? 'bg-teal-400 text-teal-950 font-bold'
                      : 'bg-white hover:bg-teal-50 text-teal-950 shadow-md'
                  }`}
                >
                  <BookmarkCheck className="w-4 h-4 text-teal-600" />
                  {saveSuccess ? 'Saved to SQLite' : isSaving ? 'Saving...' : 'Save Plan to SQLite'}
                </button>

                <button
                  onClick={handleDownloadCSV}
                  className="inline-flex items-center gap-2 bg-teal-800 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-semibold border border-teal-600 shadow-md transition-all"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            <p className="text-xs text-teal-100 leading-relaxed bg-teal-950/50 p-3 rounded-xl border border-teal-800/60">
              {activePlan.rationale}
            </p>
          </div>

          {/* Step Timeline */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              Multi-Season Succession Timeline & Rationale
            </h4>

            <div className="grid grid-cols-1 gap-4">
              {activePlan.sequence.map((step, idx) => {
                const meta = CROP_METADATA_REGISTRY[step.crop];
                const isLegume = meta?.isLegume;

                return (
                  <div
                    key={step.seasonIndex}
                    className={`rounded-2xl p-5 border transition-all ${
                      isLegume
                        ? 'bg-emerald-50/80 border-emerald-300'
                        : 'bg-white border-slate-200'
                    } shadow-sm`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                          S{step.seasonIndex}
                        </span>
                        <div>
                          <span className="font-bold text-sm text-slate-900">{step.seasonName} Season</span>
                          <span className="text-xs text-slate-500 block">{step.calendarMonth}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isLegume && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            Soil Rejuvenator Pulse (+N Fixer)
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          Rotation Score: {step.rotationScore}/100
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-4">
                        <span className="text-xs text-slate-500 block uppercase font-semibold">Recommended Crop</span>
                        <h5 className="text-xl font-extrabold text-slate-900 capitalize flex items-center gap-2">
                          {meta?.name || step.crop}
                        </h5>
                        <span className="text-xs text-slate-500 italic">
                          Family: {step.family} • {meta?.durationDays}
                        </span>
                      </div>

                      <div className="md:col-span-3">
                        <span className="text-xs text-slate-500 block uppercase font-semibold">Nutrient & Soil Dynamics</span>
                        <span className={`text-xs font-bold block mt-0.5 ${isLegume ? 'text-emerald-700' : 'text-slate-700'}`}>
                          {step.soilImpact.nitrogenChange}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Water: {step.soilImpact.waterFeasibility}
                        </span>
                      </div>

                      <div className="md:col-span-5 bg-white/70 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                        <span className="font-semibold text-slate-900 block text-[11px] mb-0.5">
                          Agronomic Rationale:
                        </span>
                        {step.rationale}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comparison: Monoculture vs Rotation-Aware Schedule */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              Scientific Agronomic Comparison: Monoculture vs. Rotation-Aware Sequence
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 text-xs space-y-2">
                <span className="font-bold text-red-900 text-sm flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Naive Monoculture Pitfalls (Continuous Same Crop)
                </span>
                <p className="text-red-800 leading-relaxed">
                  {activePlan.comparisonWithMonoculture.monocultureRisk}
                </p>
                <ul className="list-disc list-inside text-red-700 space-y-1">
                  <li>Progressive depletion of identical soil horizons (N-P-K exhaustion).</li>
                  <li>Buildup of species-specific fungal spores (e.g. Fusarium wilt) and parasitic nematodes.</li>
                  <li>Increased herbicide and synthetic urea expenditure year-over-year.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
                <span className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Rotation-Aware Plan Benefits (Our Constrained Model)
                </span>
                <ul className="list-disc list-inside text-emerald-800 space-y-1 leading-relaxed">
                  {activePlan.comparisonWithMonoculture.rotationBenefits.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
                <p className="text-emerald-900 font-semibold pt-1 border-t border-emerald-200">
                  {activePlan.comparisonWithMonoculture.soilNutrientTrajectory}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center justify-center min-h-[300px]">
          <RefreshCw className="w-10 h-10 text-teal-400 mb-3" />
          <h4 className="text-base font-bold text-slate-700">No Rotation Plan Generated</h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Choose your planning horizon and starting season above, then click 
            <strong> "Generate Optimized Rotation Schedule"</strong> to run the constrained algorithm.
          </p>
        </div>
      )}
    </div>
  );
};
