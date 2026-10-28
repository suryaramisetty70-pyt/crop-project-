import React from 'react';
import { Sprout, Compass, RefreshCw, BarChart3, Database, History, BookOpen, CheckCircle2, Download, Film } from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'recommendation'
  | 'rotation'
  | 'training'
  | 'dataset'
  | 'history'
  | 'video'
  | 'about';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isModelTrained: boolean;
  totalRecords: number;
  onDownloadZip?: () => void;
  isDownloadingZip?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isModelTrained,
  totalRecords,
  onDownloadZip,
  isDownloadingZip,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Compass className="w-4 h-4" /> },
    { id: 'recommendation', label: 'Crop Recommendation', icon: <Sprout className="w-4 h-4" /> },
    { id: 'rotation', label: 'Rotation Planner', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'training', label: 'ANN Model & Metrics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'dataset', label: 'Dataset Management', icon: <Database className="w-4 h-4" /> },
    { id: 'history', label: 'History (SQLite)', icon: <History className="w-4 h-4" /> },
    { id: 'video', label: 'Demo Video (MP4)', icon: <Film className="w-4 h-4" /> },
    { id: 'about', label: 'Project Report', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-emerald-950 text-white shadow-md border-b border-emerald-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center shadow-inner">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
                Crop Rotation ANN
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-700">
                  Minor Project-I
                </span>
              </div>
              <p className="text-xs text-emerald-300 hidden sm:block">
                Neural Network Decision Support for Sustainable Agriculture
              </p>
            </div>
          </div>

          {/* Model Status Pill */}
          <div className="hidden lg:flex items-center gap-3 bg-emerald-900/70 border border-emerald-700/60 rounded-full px-3 py-1 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-200 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ANN Trained (98.18% Test Acc)
            </span>
            <span className="text-emerald-500">•</span>
            <span className="text-emerald-300">
              {totalRecords.toLocaleString()} ICAR Records
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 overflow-x-auto py-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-200 hover:bg-emerald-900/60 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}

            {/* Download Complete Project ZIP */}
            {onDownloadZip ? (
              <button
                onClick={onDownloadZip}
                disabled={isDownloadingZip}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-bold bg-amber-400 hover:bg-amber-300 text-amber-950 shadow transition-all whitespace-nowrap ml-1 disabled:opacity-75"
                title="Download Complete Project Source Code (.ZIP)"
              >
                <Download className="w-4 h-4" />
                {isDownloadingZip ? 'Downloading ZIP...' : 'Download .ZIP'}
              </button>
            ) : (
              <a
                href="/crop_rotation_optimizer_project.zip"
                download="crop_rotation_optimizer_project.zip"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-bold bg-amber-400 hover:bg-amber-300 text-amber-950 shadow transition-all whitespace-nowrap ml-1"
                title="Download Complete Project Source Code (.ZIP)"
              >
                <Download className="w-4 h-4" />
                Download .ZIP
              </a>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
