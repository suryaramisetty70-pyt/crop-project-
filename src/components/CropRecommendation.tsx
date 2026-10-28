import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sprout,
  CheckCircle2,
  AlertCircle,
  BookmarkCheck,
  RotateCw,
  Sparkles,
  Info,
  Droplets,
  Thermometer,
  Layers,
  ArrowRight
} from 'lucide-react';
import { NeuralNetwork } from '../ml/annEngine';
import { SinglePredictionResult, PredictionCandidate } from '../types/agriculture';
import { CROP_METADATA_REGISTRY } from '../services/cropKnowledge';

interface CropRecommendationProps {
  neuralNet: NeuralNetwork;
  onSavePrediction: (result: SinglePredictionResult) => Promise<void>;
  onNavigateToRotation: (cropName: string, soil: { N: number; P: number; K: number; ph: number; rainfall: number }) => void;
}

export const CropRecommendation: React.FC<CropRecommendationProps> = ({
  neuralNet,
  onSavePrediction,
  onNavigateToRotation,
}) => {
  // Input parameters
  const [nitrogen, setNitrogen] = useState<number>(90);
  const [phosphorus, setPhosphorus] = useState<number>(42);
  const [potassium, setPotassium] = useState<number>(43);
  const [temperature, setTemperature] = useState<number>(20.8);
  const [humidity, setHumidity] = useState<number>(82.0);
  const [ph, setPh] = useState<number>(6.5);
  const [rainfall, setRainfall] = useState<number>(202.9);
  const [previousCrop, setPreviousCrop] = useState<string>('None');

  const [predictionResult, setPredictionResult] = useState<SinglePredictionResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Soil Presets for realistic academic testing
  const applyPreset = (preset: {
    name: string;
    N: number; P: number; K: number;
    temp: number; hum: number; ph: number; rain: number;
    prev: string;
  }) => {
    setNitrogen(preset.N);
    setPhosphorus(preset.P);
    setPotassium(preset.K);
    setTemperature(preset.temp);
    setHumidity(preset.hum);
    setPh(preset.ph);
    setRainfall(preset.rain);
    setPreviousCrop(preset.prev);
    setValidationError(null);
  };

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate inputs
    if (ph < 0 || ph > 14) {
      setValidationError('Soil pH must be between 0.0 and 14.0.');
      return;
    }
    if (humidity < 0 || humidity > 100) {
      setValidationError('Humidity must be between 0% and 100%.');
      return;
    }
    if (rainfall < 0) {
      setValidationError('Rainfall cannot be negative.');
      return;
    }

    try {
      const result = neuralNet.predict({
        N: nitrogen,
        P: phosphorus,
        K: potassium,
        temperature,
        humidity,
        ph,
        rainfall,
        previousCrop: previousCrop === 'None' ? undefined : previousCrop,
      });

      setPredictionResult(result);
      setSaveSuccess(false);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#059669', '#34d399']
        });
      } catch (err) {
        // ignore if canvas-confetti is not supported in iframe
      }
    } catch (err: any) {
      setValidationError(err.message || 'Error executing ANN prediction forward pass.');
    }
  };

  const handleSave = async () => {
    if (!predictionResult) return;
    setIsSaving(true);
    try {
      await onSavePrediction(predictionResult);
      setSaveSuccess(true);
    } catch (err: any) {
      alert('Failed to save record to SQLite: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <Sprout className="w-8 h-8 text-emerald-600" />
          Single-Season Crop Recommendation Engine
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Evaluates soil nutrient status and climate variables through the trained Artificial Neural Network (Softmax Probabilities).
        </p>
      </div>

      {/* Preset Soil Test Scenarios */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 block mb-2 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Quick Load Real Soil Archetypes:
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => applyPreset({
              name: 'Indo-Gangetic Wet Plain',
              N: 90, P: 42, K: 43, temp: 21, hum: 82, ph: 6.5, rain: 210, prev: 'wheat'
            })}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 font-medium border border-emerald-300 shadow-sm transition-all"
          >
            🌾 Indo-Gangetic Alluvial (High N, High Rain)
          </button>
          <button
            type="button"
            onClick={() => applyPreset({
              name: 'Deccan Black Soil (Cotton/Pulses)',
              N: 110, P: 48, K: 20, temp: 24, hum: 80, ph: 6.8, rain: 80, prev: 'chickpea'
            })}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 font-medium border border-emerald-300 shadow-sm transition-all"
          >
            🌱 Deccan Black Cotton Soil (Moderate N/P, Low Rain)
          </button>
          <button
            type="button"
            onClick={() => applyPreset({
              name: 'Semi-Arid Dryland (Gram/Moth)',
              N: 25, P: 65, K: 80, temp: 19, hum: 16, ph: 7.2, rain: 75, prev: 'rice'
            })}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 font-medium border border-emerald-300 shadow-sm transition-all"
          >
            🏜️ Semi-Arid Pulse Belt (Low N, High P/K, Dry)
          </button>
          <button
            type="button"
            onClick={() => applyPreset({
              name: 'Summer Zaid Riverbed (Melons)',
              N: 100, P: 20, K: 50, temp: 26, hum: 85, ph: 6.5, rain: 50, prev: 'mustard'
            })}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 font-medium border border-emerald-300 shadow-sm transition-all"
          >
            🍉 Zaid Warm Season (Watermelon/Muskmelon)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <form onSubmit={handlePredict} className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                Soil Macronutrients (NPK)
              </h3>
              <p className="text-xs text-slate-500">Available elemental nutrients in soil (kg/ha)</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nitrogen (N)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={nitrogen}
                    onChange={(e) => setNitrogen(Number(e.target.value))}
                    min={0}
                    max={200}
                    step={1}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-medium">kg/ha</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phosphorus (P)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={phosphorus}
                    onChange={(e) => setPhosphorus(Number(e.target.value))}
                    min={0}
                    max={200}
                    step={1}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-medium">kg/ha</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Potassium (K)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={potassium}
                    onChange={(e) => setPotassium(Number(e.target.value))}
                    min={0}
                    max={250}
                    step={1}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-medium">kg/ha</span>
                </div>
              </div>
            </div>

            <div className="border-b border-slate-100 pb-3 pt-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-emerald-600" />
                Soil pH & Meteorological Factors
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Soil pH (0 - 14)
                </label>
                <input
                  type="number"
                  value={ph}
                  onChange={(e) => setPh(Number(e.target.value))}
                  min={0}
                  max={14}
                  step={0.1}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  min={-10}
                  max={60}
                  step={0.1}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Humidity (%)
                </label>
                <input
                  type="number"
                  value={humidity}
                  onChange={(e) => setHumidity(Number(e.target.value))}
                  min={0}
                  max={100}
                  step={0.5}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rainfall (mm)
                </label>
                <input
                  type="number"
                  value={rainfall}
                  onChange={(e) => setRainfall(Number(e.target.value))}
                  min={0}
                  max={600}
                  step={1}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Previous Harvested Crop (Rotation Context)
              </label>
              <select
                value={previousCrop}
                onChange={(e) => setPreviousCrop(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="None">None / Fallow / New Field</option>
                {Object.keys(CROP_METADATA_REGISTRY).sort().map((crop) => (
                  <option key={crop} value={crop}>
                    {CROP_METADATA_REGISTRY[crop].name} ({CROP_METADATA_REGISTRY[crop].family})
                  </option>
                ))}
              </select>
            </div>

            {validationError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {validationError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
            >
              <Sprout className="w-4 h-4" />
              Calculate Crop Suitability (ANN)
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {predictionResult ? (
            <div className="space-y-6">
              {/* Primary Crop Card */}
              {(() => {
                const primary = predictionResult.topCandidates[0];
                const meta = primary.metadata;

                return (
                  <div className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-700">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                        Primary Neural Recommendation
                      </span>
                      <span className="text-xs text-emerald-300">
                        Posterior Probability: <strong>{primary.percentage}%</strong>
                      </span>
                    </div>

                    <div className="flex items-baseline gap-3 mb-2">
                      <h3 className="text-3xl font-black text-white capitalize">
                        {meta?.name || primary.crop}
                      </h3>
                      <span className="text-sm italic text-emerald-300 font-serif">
                        {meta?.scientificName}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs mb-4">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-800/80 border border-emerald-600 text-emerald-100">
                        Family: <strong>{meta?.family}</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-emerald-800/80 border border-emerald-600 text-emerald-100">
                        Season: <strong>{meta?.season}</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-emerald-800/80 border border-emerald-600 text-emerald-100">
                        Water Demand: <strong>{meta?.waterRequirement}</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-emerald-800/80 border border-emerald-600 text-emerald-100">
                        Role: <strong>{meta?.feederType}</strong>
                      </span>
                    </div>

                    <p className="text-xs text-emerald-100 leading-relaxed mb-6 bg-emerald-950/40 p-3 rounded-lg border border-emerald-800/50">
                      <strong>Agronomic Assessment:</strong> {meta?.rotationConsiderations}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleSave}
                        disabled={isSaving || saveSuccess}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          saveSuccess
                            ? 'bg-emerald-500 text-emerald-950 cursor-default'
                            : 'bg-white hover:bg-emerald-50 text-emerald-950 shadow-md'
                        }`}
                      >
                        {saveSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-900" />
                            Saved to SQLite Database
                          </>
                        ) : (
                          <>
                            <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                            {isSaving ? 'Saving...' : 'Save Prediction to SQLite'}
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => onNavigateToRotation(primary.crop, {
                          N: nitrogen, P: phosphorus, K: potassium, ph, rainfall
                        })}
                        className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold border border-emerald-600 shadow-md transition-all"
                      >
                        <RotateCw className="w-4 h-4" />
                        Plan Multi-Season Rotation
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Top 5 Candidates Ranked Bar Chart */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span>Top-5 Crop Candidates (ANN Softmax Probabilities)</span>
                  <span className="text-xs text-slate-400 font-normal">Calculated by Multi-Layer Perceptron</span>
                </h4>

                <div className="space-y-3">
                  {predictionResult.topCandidates.map((candidate, idx) => {
                    const isTop = idx === 0;
                    return (
                      <div key={candidate.crop} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-800 capitalize flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-500 text-[10px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            {candidate.metadata?.name || candidate.crop}
                            <span className="text-[10px] font-normal text-slate-500">
                              ({candidate.metadata?.family})
                            </span>
                          </span>
                          <span className={isTop ? 'text-emerald-700 font-bold' : 'text-slate-600'}>
                            {candidate.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                              isTop ? 'bg-emerald-600' : 'bg-slate-400'
                            }`}
                            style={{ width: `${Math.max(4, candidate.percentage)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Environmental Fit Breakdown */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-600" />
                  Parameter Range Matching Analysis for {predictionResult.topCandidates[0].crop.toUpperCase()}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {Object.entries(predictionResult.topCandidates[0].parameterFit).map(([param, score]) => (
                    <div key={param} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 uppercase font-semibold text-[10px] block">{param}</span>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">{score}% match</div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${score > 70 ? 'bg-emerald-500' : score > 40 ? 'bg-amber-500' : 'bg-red-400'}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center justify-center min-h-[400px]">
              <Sprout className="w-12 h-12 text-emerald-400 mb-3" />
              <h4 className="text-base font-bold text-slate-700">No Prediction Generated Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Configure soil Nitrogen, Phosphorus, Potassium, pH, and climate variables on the left, then click 
                <strong> "Calculate Crop Suitability"</strong> to run the Artificial Neural Network.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
