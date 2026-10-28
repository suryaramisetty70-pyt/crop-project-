import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Download,
  RotateCcw,
  CheckCircle2,
  FileCode2,
  Film,
  Sparkles,
  ArrowRight,
  Layers,
  Cpu,
  RefreshCw,
  BarChart3,
  Database
} from 'lucide-react';

interface VideoPlayerProps {
  onDownloadZip: () => void;
  isDownloadingZip: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  onDownloadZip,
  isDownloadingZip,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(50);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { title: 'Project Title & Team', time: 0, desc: 'CSE Minor Project-I: ANN Crop Rotation & Productivity Optimizer by Surya Ramisetty.' },
    { title: 'Problem Statement', time: 6, desc: 'Continuous mono-cropping causes topsoil N depletion, Fusarium fungal buildup, and yield decay.' },
    { title: 'ANN Architecture', time: 12, desc: '3-layer MLP: 7 inputs -> 64 ReLU -> 32 ReLU -> 22 Softmax with Adam & He-Normal weights.' },
    { title: 'Authentic Dataset', time: 18, desc: '2,200 real ICAR/FAO experimental records across 22 crops. Zero fake or simulated data.' },
    { title: 'Measured Evaluation', time: 24, desc: '98.18% Test Accuracy & 98.18% Macro F1 on 330 unseen held-out test samples.' },
    { title: 'Crop Recommendation', time: 30, desc: 'Real-time soil input: N=90, P=42, K=43 -> Rice (82.4% confidence) & parameter radar fit.' },
    { title: 'Rotation Optimizer', time: 36, desc: '4-Season sequence: Rice -> Chickpea (+42kg N) -> Watermelon -> Maize (captures fixed N).' },
    { title: 'Reproducibility & Code', time: 44, desc: 'React 19 web app + Python Streamlit package with 9 of 9 automated unit tests passing.' },
  ];

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const jumpToTime = (time: number, index: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    setActiveStep(index);
    if (!isPlaying) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);
    if (videoRef.current.duration) setDuration(videoRef.current.duration);

    // Determine current step
    for (let i = steps.length - 1; i >= 0; i--) {
      if (curr >= steps[i].time) {
        setActiveStep(i);
        break;
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
            <Film className="w-4 h-4 text-emerald-700" />
            Complete Project Demonstration Video & Walkthrough
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Project Demonstration & Code Walkthrough Video
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Complete high-definition video walkthrough illustrating the ANN architecture, authentic dataset, 
            98.18% test accuracy, live recommendation workflow, and multi-season rotation planner.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/project_demonstration_video.mp4"
            download="crop_rotation_optimizer_demo_video.mp4"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all text-xs"
          >
            <Download className="w-4 h-4" />
            Download Video (.MP4)
          </a>

          <button
            onClick={onDownloadZip}
            disabled={isDownloadingZip}
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-4 py-2.5 rounded-xl shadow-md transition-all text-xs"
          >
            <FileCode2 className="w-4 h-4" />
            {isDownloadingZip ? 'Downloading...' : 'Download Code (.ZIP)'}
          </button>
        </div>
      </div>

      {/* Video Player Card */}
      <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src="/project_demonstration_video.mp4"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            className="w-full h-full object-contain"
            controls
          />
        </div>

        {/* Video Scrubber & Controls */}
        <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center font-bold shadow transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <span className="font-mono text-emerald-300">
              {Math.floor(currentTime)}s / {Math.floor(duration)}s
            </span>
          </div>

          <div className="flex-1 max-w-md hidden sm:block">
            <div className="text-[11px] font-semibold text-slate-300 truncate">
              Stage {activeStep + 1}: {steps[activeStep].title}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {steps[activeStep].desc}
            </div>
          </div>

          <button
            onClick={() => jumpToTime(0, 0)}
            className="text-slate-400 hover:text-white flex items-center gap-1 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart
          </button>
        </div>
      </div>

      {/* Timeline Chapter Markers */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Jump to Specific Chapter in Video
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step, idx) => {
            const isCurrent = activeStep === idx;
            return (
              <button
                key={step.title}
                onClick={() => jumpToTime(step.time, idx)}
                className={`p-3 rounded-xl border text-left transition-all text-xs ${
                  isCurrent
                    ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-slate-500">
                    Chapter {idx + 1} ({step.time}s)
                  </span>
                  {isCurrent && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
                </div>
                <div className="font-bold text-slate-900">{step.title}</div>
                <p className="text-slate-500 text-[11px] mt-1 line-clamp-2">
                  {step.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
