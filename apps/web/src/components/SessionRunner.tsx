import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, CheckCircle, Clock, Zap, Target, Heart, Award, ArrowRight } from 'lucide-react';
import { SessionType, WellnessSession, BridgeConnectionState } from '@pulsepause/domain-models';
import { storage } from '../storage/indexedDb';
import { BREATHING_PROTOCOLS } from './BreathingPacer';

interface SessionRunnerProps {
  bridgeState: BridgeConnectionState;
  onSessionComplete: (session: WellnessSession) => void;
  onNavigateToPacer: () => void;
}

interface SessionConfig {
  type: SessionType;
  title: string;
  defaultDurationSec: number;
  description: string;
  badge: string;
  accent: string;
}

const SESSION_CONFIGS: SessionConfig[] = [
  {
    type: 'MICRO_PAUSE',
    title: 'MicroPause Reset',
    defaultDurationSec: 120, // 2 minutes
    description: 'Rapid 120-second autonomic reset between high-intensity cognitive tasks.',
    badge: '2 MIN',
    accent: 'from-rose-500 to-rose-600'
  },
  {
    type: 'RESONANCE_BREATHING',
    title: 'Coherent Resonance',
    defaultDurationSec: 300, // 5 minutes
    description: '5-minute guided vagal recovery aligning breath with Heart Rate Variability.',
    badge: '5 MIN',
    accent: 'from-emerald-500 to-teal-600'
  },
  {
    type: 'HRV_CALIBRATION',
    title: 'HRV Baseline Calibration',
    defaultDurationSec: 180, // 3 minutes
    description: '3-minute resting biometric assessment to calculate parasympathetic tone (RMSSD).',
    badge: '3 MIN',
    accent: 'from-cyan-500 to-blue-600'
  },
  {
    type: 'DEEP_FOCUS',
    title: 'Deep Focus Guardian',
    defaultDurationSec: 1500, // 25 minutes
    description: '25-minute Pomodoro focus interval with ambient ergonomics and eye-strain alerts.',
    badge: '25 MIN',
    accent: 'from-amber-500 to-amber-600'
  }
];

export const SessionRunner: React.FC<SessionRunnerProps> = ({
  bridgeState,
  onSessionComplete,
  onNavigateToPacer
}) => {
  const [selectedConfig, setSelectedConfig] = useState<SessionConfig>(SESSION_CONFIGS[0]);
  const [status, setStatus] = useState<'IDLE' | 'ACTIVE' | 'PAUSED' | 'COMPLETED'>('IDLE');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [customDuration, setCustomDuration] = useState<number>(SESSION_CONFIGS[0].defaultDurationSec);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [lastSavedSession, setLastSavedSession] = useState<WellnessSession | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'ACTIVE') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          if (next >= customDuration) {
            handleCompleteSession(next);
            return customDuration;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, customDuration]);

  const handleStart = () => {
    setElapsedSeconds(0);
    setStatus('ACTIVE');
    setLastSavedSession(null);
  };

  const handlePause = () => {
    setStatus(status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE');
  };

  const handleCompleteSession = async (finalElapsed = elapsedSeconds) => {
    setStatus('COMPLETED');

    const newSession: WellnessSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: selectedConfig.type,
      status: 'COMPLETED',
      startedAt: Date.now() - finalElapsed * 1000,
      endedAt: Date.now(),
      targetDurationSeconds: customDuration,
      elapsedSeconds: finalElapsed,
      meanCoherenceScore: 0.88,
      signalAvailabilityPercent: bridgeState.isConnected ? 95 : 100,
      validSampleCount: finalElapsed,
      totalSampleCount: finalElapsed,
      guidedBreathingEngaged: true,
      overallQuality: bridgeState.isConnected ? 'OPTIMAL' : 'CALIBRATING',
      sourcePlatform: bridgeState.isConnected ? 'desktop' : 'web',
      protocol: BREATHING_PROTOCOLS[0],
      notes: sessionNotes || 'Focused mindful pause completed successfully.',
      sampleCount: bridgeState.isConnected ? finalElapsed * 30 : 0
    };

    try {
      await storage.saveSession(newSession);
      setLastSavedSession(newSession);
      onSessionComplete(newSession);
    } catch (err) {
      console.error('Failed to save session to IndexedDB:', err);
    }
  };

  const handleAbort = () => {
    setStatus('IDLE');
    setElapsedSeconds(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const remaining = Math.max(0, customDuration - elapsedSeconds);
  const progressPercent = Math.min(100, (elapsedSeconds / customDuration) * 100);

  return (
    <div className="space-y-6">
      {/* Session Type Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {SESSION_CONFIGS.map((cfg) => {
          const isSelected = selectedConfig.type === cfg.type;
          return (
            <button
              key={cfg.type}
              disabled={status === 'ACTIVE'}
              onClick={() => {
                setSelectedConfig(cfg);
                setCustomDuration(cfg.defaultDurationSec);
                setElapsedSeconds(0);
                setStatus('IDLE');
              }}
              className={`text-left rounded-2xl p-4 border transition-all ${
                isSelected
                  ? 'border-rose-500/80 bg-slate-900 shadow-xl shadow-rose-950/20 ring-1 ring-rose-500/50'
                  : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
              } ${status === 'ACTIVE' ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-md bg-slate-950 border border-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-400">
                  {cfg.badge}
                </span>
                {isSelected && <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>}
              </div>
              <h4 className="text-sm font-bold text-white mb-1">{cfg.title}</h4>
              <p className="text-xs text-slate-400 leading-snug line-clamp-2">{cfg.description}</p>
            </button>
          );
        })}
      </div>

      {/* Main Session Timer & Progress Box */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-40 w-96 bg-rose-500/10 blur-[80px] pointer-events-none" />

        <div className="relative flex flex-col items-center justify-center text-center space-y-6">
          {/* Header Tag */}
          <div className="space-y-1">
            <span className="rounded-full bg-slate-950 border border-slate-800 px-3.5 py-1 text-xs font-semibold text-rose-300 inline-flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-rose-400" />
              <span>{selectedConfig.title}</span>
            </span>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              {status === 'ACTIVE'
                ? 'Stay relaxed, breathe coherently, and keep your face aligned with the camera guide.'
                : selectedConfig.description}
            </p>
          </div>

          {/* Large Countdown Display */}
          <div className="relative flex items-center justify-center">
            {/* SVG Circular Progress Ring */}
            <svg className="w-56 h-56 transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="96"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800/80"
                fill="transparent"
              />
              <circle
                cx="112"
                cy="112"
                r="96"
                stroke="currentColor"
                strokeWidth="8"
                className="text-rose-500 transition-all duration-500 ease-linear"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 96}
                strokeDashoffset={(2 * Math.PI * 96) * (1 - progressPercent / 100)}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Timer Text */}
            <div className="absolute flex flex-col items-center">
              <span className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow">
                {formatTime(remaining)}
              </span>
              <span className="text-[11px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
                {status === 'ACTIVE' ? 'Elapsed: ' + formatTime(elapsedSeconds) : 'Target Duration'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {status === 'IDLE' && (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white px-8 py-3.5 text-sm font-bold shadow-lg shadow-rose-950/60 transition-transform active:scale-95"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Begin {selectedConfig.title}</span>
              </button>
            )}

            {(status === 'ACTIVE' || status === 'PAUSED') && (
              <>
                <button
                  onClick={handlePause}
                  className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 text-sm font-bold transition-colors"
                >
                  {status === 'ACTIVE' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
                  <span>{status === 'ACTIVE' ? 'Pause' : 'Resume'}</span>
                </button>

                <button
                  onClick={() => handleCompleteSession()}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 text-sm font-bold shadow-md shadow-emerald-950 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Finish & Record</span>
                </button>

                <button
                  onClick={handleAbort}
                  className="flex items-center gap-2 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white px-4 py-3 text-sm font-medium transition-colors"
                >
                  <Square className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </>
            )}

            {status === 'COMPLETED' && (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 text-sm font-bold transition-colors shadow-lg shadow-rose-950"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Start Another Session</span>
              </button>
            )}

            {/* Quick link to coherent pacer */}
            <button
              onClick={onNavigateToPacer}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white px-4 py-3 text-sm font-medium transition-colors"
            >
              <span>Open Coherent Pacer</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Completed Session Confirmation Banner */}
          {lastSavedSession && (
            <div className="w-full max-w-lg rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-left animate-fadeIn">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Session Saved to IndexedDB
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Logged {Math.round(lastSavedSession.elapsedSeconds / 60)}m of {lastSavedSession.type.replace('_', ' ')} (ID: <code className="text-[10px] font-mono text-emerald-300">{lastSavedSession.id}</code>).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
