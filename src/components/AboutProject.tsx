import React from 'react';
import {
  BookOpen,
  Layers,
  Cpu,
  RefreshCw,
  HelpCircle,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const AboutProject: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3 border border-emerald-200">
          <GraduationCap className="w-4 h-4 text-emerald-700" />
          CSE Minor Project-I • Technical Documentation & Review Guide
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          An Artificial Neural Network Approach for Optimizing Crop Rotation and Agricultural Productivity
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          A machine learning decision-support framework that bridges neural network classification with agronomic 
          crop rotation constraints to achieve sustainable agricultural productivity without synthetic data or paid APIs.
        </p>
      </div>

      {/* Abstract & Problem Statement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Project Abstract
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Conventional recommendation systems predict a single crop for an isolated harvest, inadvertently incentivizing 
            continuous monoculture. Continuous mono-cropping of heavy-feeding cereals (e.g. rice or maize) depletes topsoil nitrogen, 
            acidifies root zones, and amplifies species-specific soilborne pathogen populations. 
            This project formulates an end-to-end framework combining a Multi-Layer Perceptron (MLP) trained on 2,200 authentic 
            agricultural field records with a multi-season constrained sequence optimizer that systematically introduces nitrogen-fixing 
            legume pulses and rotates botanical families.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Core Objectives
          </h3>
          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
            <li><strong>Zero Cost Implementation:</strong> Runs entirely on standard laptop hardware with zero paid APIs or cloud dependencies.</li>
            <li><strong>Authentic Machine Learning:</strong> Genuine 3-layer neural network with He-Normal weight initialization, Adam optimizer, and stratified 15% held-out test evaluation (98.18% accuracy).</li>
            <li><strong>Agronomic Constraint Integration:</strong> Transparent multi-season sequence scoring penalizing monoculture, rewarding Rhizobium pulse nitrogen restoration, and validating seasonal calendars.</li>
            <li><strong>Local Persistence:</strong> Parameterized SQLite storage for full prediction audit trails and CSV exportability.</li>
          </ul>
        </div>
      </div>

      {/* Architecture & ANN Math */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-600" />
          Neural Network Mathematical Formulation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-emerald-900 block">1. Z-Score Feature Scaling</span>
            <p className="text-slate-600">
              Computed exclusively on the training split to prevent evaluation data leakage:
            </p>
            <div className="font-mono bg-white p-2 rounded border border-slate-200 text-slate-800 text-[11px] mt-2">
              z_j = (x_j - μ_j) / (σ_j + ε)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-emerald-900 block">2. Multilayer Forward Pass</span>
            <p className="text-slate-600">
              Dense hidden representations with non-linear ReLU activations:
            </p>
            <div className="font-mono bg-white p-2 rounded border border-slate-200 text-slate-800 text-[11px] mt-2">
              h1 = ReLU(W1 · z + b1) [64]<br/>
              h2 = ReLU(W2 · h1 + b2) [32]
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-emerald-900 block">3. Softmax Multiclass Output</span>
            <p className="text-slate-600">
              Computes posterior suitability distribution over 22 crop species:
            </p>
            <div className="font-mono bg-white p-2 rounded border border-slate-200 text-slate-800 text-[11px] mt-2">
              P(c_k) = exp(y_k) / Σ exp(y_j)
            </div>
          </div>
        </div>
      </div>

      {/* Rotation Optimization Algorithm */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-teal-600" />
          Agronomic Rotation Optimization Rules
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          The rotation planner implements a transparent multi-factor scoring objective:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200">
            <span className="font-bold text-emerald-900 block">Monoculture Prohibition (-0.60 Penalty)</span>
            <p className="text-slate-600 mt-0.5">
              Strictly penalizes planting the identical crop consecutively to break root-rot and weed persistence.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200">
            <span className="font-bold text-emerald-900 block">Family Alternation (+0.15 Bonus)</span>
            <p className="text-slate-600 mt-0.5">
              Alternating Poaceae (cereals) with Fabaceae (pulses) or Malvaceae (cotton) interrupts soil pathogen lifecycles.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200">
            <span className="font-bold text-emerald-900 block">Legume Nitrogen Restoration (+0.30 Bonus)</span>
            <p className="text-slate-600 mt-0.5">
              Prioritizes pulses (Chickpea, Lentil, Pigeonpeas) when soil nitrogen is deficient, replenishing 35-50 kg/ha N naturally.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200">
            <span className="font-bold text-emerald-900 block">Seasonal Compliance Check</span>
            <p className="text-slate-600 mt-0.5">
              Validates that selected crops align with regional agricultural seasons (Kharif Monsoon, Rabi Winter, Zaid Summer).
            </p>
          </div>
        </div>
      </div>

      {/* College Project Viva / Review Questions & Answers */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          University Project Review & Viva Preparation Guide
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">
              Q1: Why did you choose an Artificial Neural Network (ANN) over simple Decision Trees or Logistic Regression?
            </span>
            <p className="text-slate-600 leading-relaxed">
              <strong>Answer:</strong> Agricultural soil-climate interactions exhibit strong non-linear multi-attribute dependencies (e.g., higher temperature alters humidity tolerance and soil moisture evaporation). 
              A 3-layer MLP with ReLU hidden activations learns complex continuous non-linear boundaries across 7 input dimensions and outputs calibrated softmax probabilities across 22 classes without requiring manual feature engineering.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">
              Q2: How does your project prevent data leakage during preprocessing and evaluation?
            </span>
            <p className="text-slate-600 leading-relaxed">
              <strong>Answer:</strong> Data partitioning is performed first using a stratified 70% Train, 15% Validation, and 15% Held-out Test split. The standard scaler calculates feature means and standard deviations exclusively on the 70% training partition. The validation and test sets are transformed using those pre-fitted training parameters without ever observing test labels.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">
              Q3: Why can't a single crop recommendation model optimize crop rotation?
            </span>
            <p className="text-slate-600 leading-relaxed">
              <strong>Answer:</strong> A static classifier outputs the highest suitability crop for a single instant in time. If a farmer follows this greedily every season, they will grow the exact same crop repeatedly (monoculture), causing rapid nitrogen depletion and pathogen infestation. 
              Our constrained rotation optimizer treats the ANN probabilities as one term in a multi-objective sequence optimization that explicitly incorporates previous crop family, biological nitrogen fixation, and multi-season dynamics.
            </p>
          </div>
        </div>
      </div>

      {/* Citations */}
      <div className="text-xs text-slate-500 border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>CSE Department Minor Project-I • Academic Year 2026</span>
        <span>Benchmark Data: ICAR/FAO Agricultural Protocol (ODbL)</span>
      </div>
    </div>
  );
};
