import React, { useState } from 'react';
import {
  History,
  Trash2,
  Download,
  Calendar,
  Layers,
  CheckCircle2,
  FileText,
  Search,
  Filter,
  Eye,
  X,
  Printer
} from 'lucide-react';
import { SinglePredictionResult, RotationPlan } from '../types/agriculture';

interface PredictionHistoryProps {
  predictions: (SinglePredictionResult & { id?: number })[];
  rotations: (RotationPlan & { id?: number })[];
  onDeletePrediction: (id: number) => Promise<void>;
  onDeleteRotation: (id: number) => Promise<void>;
  onClearAll: () => Promise<void>;
}

export const PredictionHistory: React.FC<PredictionHistoryProps> = ({
  predictions,
  rotations,
  onDeletePrediction,
  onDeleteRotation,
  onClearAll,
}) => {
  const [activeTab, setActiveTab] = useState<'predictions' | 'rotations'>('predictions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrediction, setSelectedPrediction] = useState<(SinglePredictionResult & { id?: number }) | null>(null);
  const [selectedRotation, setSelectedRotation] = useState<(RotationPlan & { id?: number }) | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportPredictionsCSV = () => {
    const headers = [
      'ID', 'Timestamp', 'Nitrogen', 'Phosphorus', 'Potassium',
      'Temperature', 'Humidity', 'pH', 'Rainfall', 'Previous_Crop', 'Predicted_Crop', 'Confidence_Pct'
    ];
    const rows = predictions.map((p) => [
      p.id || '',
      p.timestamp,
      p.input.nitrogen,
      p.input.phosphorus,
      p.input.potassium,
      p.input.temperature,
      p.input.humidity,
      p.input.ph,
      p.input.rainfall,
      `"${p.input.previousCrop || 'None'}"`,
      p.recommendedCrop,
      p.confidence
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'prediction_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear all history records from the local SQLite database?')) {
      return;
    }
    setIsDeleting(true);
    try {
      await onClearAll();
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPredictions = predictions.filter((p) => {
    return (
      p.recommendedCrop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.timestamp.includes(searchTerm)
    );
  });

  const filteredRotations = rotations.filter((r) => {
    return (
      r.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.timestamp.includes(searchTerm)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-8 h-8 text-emerald-600" />
            Prediction Audit Trail & SQLite History
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Audit log of all single-season suitability inferences and multi-season rotation plans stored locally in SQLite.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-2 rounded-xl text-xs border border-slate-300 transition-all"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Print Report
          </button>

          <button
            onClick={handleExportPredictionsCSV}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-3.5 py-2 rounded-xl text-xs border border-slate-300 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Export History (CSV)
          </button>

          <button
            onClick={handleClear}
            disabled={isDeleting || (predictions.length === 0 && rotations.length === 0)}
            className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold px-3.5 py-2 rounded-xl text-xs border border-red-200 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            Clear Database
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('predictions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'predictions'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Single Crop Predictions ({predictions.length})
            </button>
            <button
              onClick={() => setActiveTab('rotations')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'rotations'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Crop Rotation Plans ({rotations.length})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by crop or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {activeTab === 'predictions' ? (
          filteredPredictions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Date / Timestamp</th>
                    <th className="py-2.5 px-3">Soil N-P-K (kg/ha)</th>
                    <th className="py-2.5 px-3">pH</th>
                    <th className="py-2.5 px-3">Rainfall</th>
                    <th className="py-2.5 px-3">Recommended Crop</th>
                    <th className="py-2.5 px-3">ANN Confidence</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPredictions.map((p) => (
                    <tr key={p.id || p.timestamp} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(p.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-800">
                        {p.input.nitrogen}-{p.input.phosphorus}-{p.input.potassium}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{p.input.ph}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{p.input.rainfall} mm</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 capitalize">
                        {p.recommendedCrop}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700">
                        {p.confidence}%
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedPrediction(p)}
                          className="text-emerald-700 hover:text-emerald-900 p-1 text-xs font-semibold mr-2"
                        >
                          View Details
                        </button>
                        {p.id && (
                          <button
                            onClick={() => onDeletePrediction(p.id!)}
                            className="text-red-500 hover:text-red-700 p-1 text-xs"
                            title="Delete Record"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              No saved single-crop predictions found in SQLite.
            </div>
          )
        ) : (
          filteredRotations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Date / Timestamp</th>
                    <th className="py-2.5 px-3">Field Name</th>
                    <th className="py-2.5 px-3">Seasons Planned</th>
                    <th className="py-2.5 px-3">Crop Succession Sequence</th>
                    <th className="py-2.5 px-3">Overall Score</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRotations.map((r) => (
                    <tr key={r.id || r.timestamp} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(r.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{r.fieldName}</td>
                      <td className="py-2.5 px-3 text-slate-700">{r.seasonsCount} Seasons</td>
                      <td className="py-2.5 px-3 text-teal-800 font-medium">
                        {r.sequence.map((s) => s.crop).join(' → ')}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-teal-700">{r.totalScore}/100</td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedRotation(r)}
                          className="text-teal-700 hover:text-teal-900 p-1 text-xs font-semibold mr-2"
                        >
                          View Schedule
                        </button>
                        {r.id && (
                          <button
                            onClick={() => onDeleteRotation(r.id!)}
                            className="text-red-500 hover:text-red-700 p-1 text-xs"
                            title="Delete Plan"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              No saved crop rotation plans found in SQLite.
            </div>
          )
        )}
      </div>

      {/* Details Modal */}
      {selectedPrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-base text-slate-900">
                Prediction Details #{selectedPrediction.id || ''}
              </h4>
              <button
                onClick={() => setSelectedPrediction(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Timestamp:</span>
                <span className="font-mono text-slate-800">{new Date(selectedPrediction.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Recommended Crop:</span>
                <span className="font-bold text-emerald-700 capitalize">{selectedPrediction.recommendedCrop}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Softmax Confidence:</span>
                <span className="font-semibold text-slate-800">{selectedPrediction.confidence}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Previous Crop:</span>
                <span className="text-slate-800">{selectedPrediction.input.previousCrop || 'None'}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">Top Crop Candidates:</span>
              <div className="space-y-1.5">
                {selectedPrediction.topCandidates.map((c) => (
                  <div key={c.crop} className="flex justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="capitalize font-medium text-slate-800">{c.crop}</span>
                    <span className="font-bold text-emerald-700">{c.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPrediction(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedRotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-base text-slate-900">
                Rotation Schedule: {selectedRotation.fieldName}
              </h4>
              <button
                onClick={() => setSelectedRotation(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedRotation.sequence.map((step) => (
                <div key={step.seasonIndex} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Season {step.seasonIndex}: {step.seasonName}</span>
                    <span className="capitalize text-teal-800">{step.crop} ({step.family})</span>
                  </div>
                  <p className="text-slate-600">{step.rationale}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRotation(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
