import React, { useState } from 'react';
import {
  Database,
  Upload,
  PlusCircle,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import { AgriculturalRecord } from '../types/agriculture';

interface DatasetManagerProps {
  dataset: AgriculturalRecord[];
  onDatasetUpdated: (newDataset: AgriculturalRecord[]) => void;
  onResetToDefault: () => void;
}

export const DatasetManager: React.FC<DatasetManagerProps> = ({
  dataset,
  onDatasetUpdated,
  onResetToDefault,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cropFilter, setCropFilter] = useState('All');
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Manual observation form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newN, setNewN] = useState<number>(80);
  const [newP, setNewP] = useState<number>(40);
  const [newK, setNewK] = useState<number>(40);
  const [newTemp, setNewTemp] = useState<number>(24.0);
  const [newHum, setNewHum] = useState<number>(80.0);
  const [newPh, setNewPh] = useState<number>(6.5);
  const [newRain, setNewRain] = useState<number>(150.0);
  const [newCrop, setNewCrop] = useState<string>('rice');

  const uniqueCrops = Array.from(new Set(dataset.map((d) => d.label.toLowerCase()))).sort();

  const getStats = (key: keyof Omit<AgriculturalRecord, 'id' | 'label'>) => {
    if (dataset.length === 0) return { mean: 0, min: 0, max: 0, std: 0 };
    const vals = dataset.map((d) => d[key]);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const sum = vals.reduce((a, b) => a + b, 0);
    const mean = sum / vals.length;
    const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length;
    const std = Math.sqrt(variance);
    return {
      mean: Number(mean.toFixed(2)),
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      std: Number(std.toFixed(2)),
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadMessage(null);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.trim().split('\n');
        if (lines.length < 2) {
          throw new Error('CSV file is empty or missing data rows.');
        }

        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        const required = ['n', 'p', 'k', 'temperature', 'humidity', 'ph', 'rainfall'];
        for (const req of required) {
          if (!headers.includes(req)) {
            throw new Error(`Missing required column '${req}' in CSV header.`);
          }
        }

        const labelIdx = headers.indexOf('label') !== -1 ? headers.indexOf('label') : headers.indexOf('crop');
        if (labelIdx === -1) {
          throw new Error("Missing target crop column ('label' or 'crop') in CSV header.");
        }

        const nIdx = headers.indexOf('n');
        const pIdx = headers.indexOf('p');
        const kIdx = headers.indexOf('k');
        const tempIdx = headers.indexOf('temperature');
        const humIdx = headers.indexOf('humidity');
        const phIdx = headers.indexOf('ph');
        const rainIdx = headers.indexOf('rainfall');

        const newRecords: AgriculturalRecord[] = [];
        let skipped = 0;

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map((p) => p.trim());
          if (row.length < headers.length) {
            skipped++;
            continue;
          }

          const N = parseFloat(row[nIdx]);
          const P = parseFloat(row[pIdx]);
          const K = parseFloat(row[kIdx]);
          const temperature = parseFloat(row[tempIdx]);
          const humidity = parseFloat(row[humIdx]);
          const ph = parseFloat(row[phIdx]);
          const rainfall = parseFloat(row[rainIdx]);
          const label = row[labelIdx].toLowerCase();

          if (
            isNaN(N) || isNaN(P) || isNaN(K) ||
            isNaN(temperature) || isNaN(humidity) || isNaN(ph) || isNaN(rainfall) ||
            !label
          ) {
            skipped++;
            continue;
          }

          newRecords.push({
            id: i,
            N, P, K, temperature, humidity, ph, rainfall, label
          });
        }

        if (newRecords.length === 0) {
          throw new Error('No valid numeric agricultural rows could be parsed from the file.');
        }

        onDatasetUpdated(newRecords);
        setUploadMessage({
          type: 'success',
          text: `Successfully loaded ${newRecords.length.toLocaleString()} valid agricultural records! (${skipped} invalid rows skipped). You can now retrain the ANN on this data.`
        });
      } catch (err: any) {
        setUploadMessage({
          type: 'error',
          text: `Upload failed: ${err.message}`
        });
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAddSingleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrop.trim()) return;

    const newRecord: AgriculturalRecord = {
      id: dataset.length + 1,
      N: newN,
      P: newP,
      K: newK,
      temperature: newTemp,
      humidity: newHum,
      ph: newPh,
      rainfall: newRain,
      label: newCrop.trim().toLowerCase(),
    };

    const updated = [newRecord, ...dataset];
    onDatasetUpdated(updated);
    setShowAddForm(false);
    setUploadMessage({
      type: 'success',
      text: `Added new agricultural observation for '${newCrop}'. Dataset now has ${updated.length} records.`
    });
  };

  const handleDownloadCSV = () => {
    const headers = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'label'];
    const rows = dataset.map((d) => [
      d.N, d.P, d.K, d.temperature, d.humidity, d.ph, d.rainfall, d.label
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'agricultural_crop_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDataset = dataset.filter((d) => {
    const matchCrop = cropFilter === 'All' || d.label.toLowerCase() === cropFilter.toLowerCase();
    const matchSearch =
      searchTerm === '' ||
      d.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.N.toString().includes(searchTerm) ||
      d.rainfall.toString().includes(searchTerm);
    return matchCrop && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <Database className="w-8 h-8 text-emerald-600" />
          Agricultural Dataset Management
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Explore the authentic benchmark dataset, upload your own local CSV file, or add verified field measurements.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {(['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'] as const).map((key) => {
          const stats = getStats(key);
          return (
            <div key={key} className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm text-xs">
              <span className="font-bold text-emerald-900 uppercase block">{key}</span>
              <div className="text-sm font-extrabold text-slate-800 mt-0.5">μ = {stats.mean}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                [{stats.min}, {stats.max}]
              </div>
              <div className="text-[10px] text-slate-400">σ = {stats.std}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer text-xs shadow-md transition-all">
              <Upload className="w-4 h-4" />
              Upload Your Own CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-4 py-2.5 rounded-xl text-xs border border-slate-300 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              {showAddForm ? 'Cancel Form' : 'Add Single Observation'}
            </button>

            <button
              onClick={onResetToDefault}
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-2.5 rounded-xl text-xs border border-slate-300 transition-all"
              title="Reset back to the original 2,200 ICAR records"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to ICAR (2,200)
            </button>
          </div>

          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-4 py-2.5 rounded-xl text-xs border border-slate-300 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-slate-600" />
            Export Current Data ({dataset.length})
          </button>
        </div>

        {uploadMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              uploadMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {uploadMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            {uploadMessage.text}
          </div>
        )}

        {showAddForm && (
          <form onSubmit={handleAddSingleRecord} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-700 block">
              Add New Soil Observation Record
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">N (kg/ha)</label>
                <input
                  type="number"
                  value={newN}
                  onChange={(e) => setNewN(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded border border-slate-300 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">P (kg/ha)</label>
                <input
                  type="number"
                  value={newP}
                  onChange={(e) => setNewP(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded border border-slate-300 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">K (kg/ha)</label>
                <input
                  type="number"
                  value={newK}
                  onChange={(e) => setNewK(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded border border-slate-300 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Temp (°C)</label>
                <input
                  type="number"
                  value={newTemp}
                  onChange={(e) => setNewTemp(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded border border-slate-300 text-xs"
                  step={0.1}
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Humidity (%)</label>
                <input
                  type="number"
                  value={newHum}
                  onChange={(e) => setNewHum(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded border border-slate-300 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">pH</label>
                <input
                  type="number"
                  value={newPh}
                  onChange={(e) => setNewPh(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded border border-slate-300 text-xs"
                  step={0.1}
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Rain (mm)</label>
                <input
                  type="number"
                  value={newRain}
                  onChange={(e) => setNewRain(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded border border-slate-300 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Crop Label</label>
                <input
                  type="text"
                  value={newCrop}
                  onChange={(e) => setNewCrop(e.target.value)}
                  placeholder="e.g. rice"
                  className="w-full px-2 py-1.5 rounded border border-slate-300 text-xs"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs"
              >
                Insert into Active Dataset
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search values or crops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Crop:</span>
              <select
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
                className="px-2 py-1 rounded-lg border border-slate-300 text-xs focus:outline-none"
              >
                <option value="All">All Crops ({uniqueCrops.length})</option>
                {uniqueCrops.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <span className="text-xs text-slate-500">
            Showing <strong>{filteredDataset.length}</strong> of <strong>{dataset.length}</strong> records
          </span>
        </div>

        <div className="overflow-x-auto max-h-[480px] border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Crop Label</th>
                <th className="py-2.5 px-3">N (kg/ha)</th>
                <th className="py-2.5 px-3">P (kg/ha)</th>
                <th className="py-2.5 px-3">K (kg/ha)</th>
                <th className="py-2.5 px-3">Temp (°C)</th>
                <th className="py-2.5 px-3">Humidity (%)</th>
                <th className="py-2.5 px-3">Soil pH</th>
                <th className="py-2.5 px-3">Rainfall (mm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredDataset.slice(0, 100).map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                  <td className="py-2 px-3 font-bold font-sans capitalize text-slate-900">{r.label}</td>
                  <td className="py-2 px-3 text-slate-700">{r.N}</td>
                  <td className="py-2 px-3 text-slate-700">{r.P}</td>
                  <td className="py-2 px-3 text-slate-700">{r.K}</td>
                  <td className="py-2 px-3 text-slate-700">{r.temperature.toFixed(2)}</td>
                  <td className="py-2 px-3 text-slate-700">{r.humidity.toFixed(2)}</td>
                  <td className="py-2 px-3 text-slate-700">{r.ph.toFixed(2)}</td>
                  <td className="py-2 px-3 text-slate-700">{r.rainfall.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
