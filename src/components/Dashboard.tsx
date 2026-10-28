import React from 'react';
import {
  Sprout,
  RefreshCw,
  BarChart3,
  Database,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Droplets,
  Thermometer,
  Layers,
  Download,
  Film
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { SinglePredictionResult, RotationPlan } from '../types/agriculture';

interface DashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
  recentPredictions: SinglePredictionResult[];
  recentRotations: RotationPlan[];
  totalRecords: number;
  testAccuracy: number;
  onDownloadZip?: () => void;
  isDownloadingZip?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  setActiveTab,
  recentPredictions,
  recentRotations,
  totalRecords,
  testAccuracy,
  onDownloadZip,
  isDownloadingZip,
}) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-8 shadow-xl border border-emerald-700/50">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-200 text-xs font-semibold mb-4">
            <Sprout className="w-3.5 h-3.5 text-emerald-300" />
            CSE Minor Project-I • Precision Agriculture
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            An Artificial Neural Network Approach for Optimizing Crop Rotation and Agricultural Productivity
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed mb-6">
            A comprehensive, zero-cost decision support system. Combines locally trained feed-forward neural networks 
            with an agronomic rotation engine to sustain soil fertility, interrupt pest lifecycles, and maximize yield potential.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('recommendation')}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all text-sm"
            >
              <Sprout className="w-4 h-4" />
              Recommend Crop
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('rotation')}
              className="inline-flex items-center gap-2 bg-emerald-800/80 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl border border-emerald-600 transition-all text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Plan Crop Rotation
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className="inline-flex items-center gap-2 bg-emerald-700/80 hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-xl border border-emerald-500 transition-all text-sm"
            >
              <Film className="w-4 h-4 text-emerald-300" />
              Watch Demo Video (MP4)
            </button>
            <button
              onClick={() => setActiveTab('training')}
              className="inline-flex items-center gap-2 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 font-medium px-4 py-2.5 rounded-xl border border-emerald-800 transition-all text-sm"
            >
              <BarChart3 className="w-4 h-4" />
              View ANN Evaluation (98.18%)
            </button>
            {onDownloadZip ? (
              <button
                onClick={onDownloadZip}
                disabled={isDownloadingZip}
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all text-sm disabled:opacity-75"
              >
                <Download className="w-4 h-4" />
                {isDownloadingZip ? 'Downloading ZIP...' : 'Download Full Project (.ZIP)'}
              </button>
            ) : (
              <a
                href="/crop_rotation_optimizer_project.zip"
                download="crop_rotation_optimizer_project.zip"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all text-sm"
              >
                <Download className="w-4 h-4" />
                Download Full Project (.ZIP)
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">ANN Test Accuracy</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{testAccuracy}%</div>
          <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Held-out test set (330 samples)
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Supported Crops</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">22 Categories</div>
          <p className="text-xs text-slate-500 mt-1">Cereals, pulses, fiber & fruits</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Authentic Dataset</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalRecords.toLocaleString()} Records</div>
          <p className="text-xs text-emerald-700 mt-1 font-medium">ICAR & FAO benchmark data</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Saved Audits</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {recentPredictions.length + recentRotations.length} Plans
          </div>
          <p className="text-xs text-slate-500 mt-1">Stored in local SQLite database</p>
        </div>
      </div>

      {/* Core Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 border border-emerald-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-md">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-emerald-950 mb-2">
              Single-Season Crop Suitability
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Enter Nitrogen, Phosphorus, Potassium, pH, Temperature, Humidity, and Rainfall.
              The trained ANN calculates the exact softmax suitability probabilities across all 22 crop classes 
              and displays a parameter compatibility radar chart.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('recommendation')}
            className="inline-flex items-center justify-between w-full bg-white hover:bg-emerald-50 text-emerald-800 font-semibold px-4 py-2.5 rounded-xl border border-emerald-300 text-sm transition-all"
          >
            <span>Launch Prediction Form</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl p-6 border border-teal-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-4 shadow-md">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-teal-950 mb-2">
              Multi-Season Rotation Planner
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Monoculture degrades soil and fosters root fungi. Our constrained optimizer constructs 3 to 6 season schedules, 
              alternating Poaceae cereals with Fabaceae legumes (Rhizobium nitrogen fixation) to restore soil fertility naturally.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('rotation')}
            className="inline-flex items-center justify-between w-full bg-white hover:bg-teal-50 text-teal-800 font-semibold px-4 py-2.5 rounded-xl border border-teal-300 text-sm transition-all"
          >
            <span>Plan Sustainable Rotation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Environmental Parameters Reference */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-emerald-600" />
          Agronomic Feature Schema & Soil Context
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Features required by the trained Artificial Neural Network with physical measurement ranges:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-emerald-900 block text-sm">Nitrogen (N)</span>
            <span className="text-slate-600">0 - 140 kg/ha</span>
            <p className="text-slate-500 mt-1">Essential for vegetative growth and chlorophyll synthesis.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-emerald-900 block text-sm">Phosphorus (P)</span>
            <span className="text-slate-600">5 - 145 kg/ha</span>
            <p className="text-slate-500 mt-1">Crucial for root proliferation, nodulation, and early vigor.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-emerald-900 block text-sm">Potassium (K)</span>
            <span className="text-slate-600">5 - 205 kg/ha</span>
            <p className="text-slate-500 mt-1">Regulates stomatal conductance, water stress, and disease resistance.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-emerald-900 block text-sm">Soil pH</span>
            <span className="text-slate-600">3.5 - 9.9 pH</span>
            <p className="text-slate-500 mt-1">Determines nutrient bioavailability and microbial nodulation activity.</p>
          </div>
        </div>
      </div>

      {/* Scientific Notice */}
      <div className="rounded-xl p-4 bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs leading-relaxed">
        <Thermometer className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-sm mb-0.5">Decision-Support Notice & Academic Disclaimer</span>
          This system provides agricultural decision-support suggestions based on empirical soil-climate trials. Recommendations are not guaranteed financial or yield guarantees. Local agricultural extension advisors should be consulted for hyper-local soil drainage and certified seed sourcing.
        </div>
      </div>
    </div>
  );
};
