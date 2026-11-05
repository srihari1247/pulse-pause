import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  CheckCircle,
  Clock,
  Wind,
  Heart,
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ScreenId } from './Navigation';
import {
  BridgeConnectionState,
  WellnessSession,
  HumanSignal,
  BreathingPattern,
  WaveformPoint
} from '@pulsepause/domain-models';
import { signalProvider } from '../bridge/bridgeClient';
import { storage } from '../storage/indexedDb';
import { ambientAudio } from '../audio/ambientAudio';

interface FocusSessionScreenProps {
  onNavigate: (screen: ScreenId) => void;
  bridgeState: BridgeConnectionState;
  onSessionComplete: (session: WellnessSession) => void;
}

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'box',
    name: 'Box Breathing (4-4-4-4)',
    description: 'Equal four-phase cadence for steady attention.',
    inhaleSec: 4.0,
    holdInSec: 4.0,
    exhaleSec: 4.0,
    holdOutSec: 4.0,
    targetCadenceBrpm: 3.75
  },
  {
    id: 'resonance',
    name: 'Coherent Resonance (5.5s - 5.5s)',
    description: '5.5 breaths per minute cadence aligning respiration with heart rate variability.',
    inhaleSec: 5.5,
    holdInSec: 0,
    exhaleSec: 5.5,
    holdOutSec: 0,
    targetCadenceBrpm: 5.45
  },
  {
    id: 'relax_478',
    name: 'Extended Exhale (4-7-8)',
    description: 'Prolonged exhalation cadence for gentle slowing of the respiratory cycle.',
    inhaleSec: 4.0,
    holdInSec: 7.0,
    exhaleSec: 8.0,
    holdOutSec: 0,
    targetCadenceBrpm: 3.15
  },
  {
    id: 'gentle_46',
    name: 'Gentle Flow (4s - 6s)',
    description: 'Gentle 4s inhale and 6s exhale cadence.',
    inhaleSec: 4.0,
    holdInSec: 0,
    exhaleSec: 6.0,
    holdOutSec: 0,
    targetCadenceBrpm: 6.0
  }
];

export interface TrendPoint {
  timeStr: string;
  seconds: number;
  pulse: number | null;
  breathing: number | null;
  isReliable: boolean;
}

export const FocusSessionScreen: React.FC<FocusSessionScreenProps> = ({
  onNavigate,
  bridgeState,
  onSessionComplete
}) => {
  // Configurable session duration (default: 25 minutes)
  const [targetMinutes, setTargetMinutes] = useState<number>(25);
  const [sessionStatus, setSessionStatus] = useState<'IDLE' | 'ACTIVE' | 'PAUSED'>('IDLE');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Live SmartSpectra Signal
  const [liveSignal, setLiveSignal] = useState<HumanSignal | null>(null);
  const [sessionTrends, setSessionTrends] = useState<TrendPoint[]>([]);

  // Signal availability tracking
  const [validSignalSeconds, setValidSignalSeconds] = useState<number>(0);

  // Optional Guided Breathing Companion
  const [breathingOpen, setBreathingOpen] = useState<boolean>(false);
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(BREATHING_PATTERNS[0]);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathingProgress, setBreathingProgress] = useState<number>(0);
  const [breathingPhaseSecLeft, setBreathingPhaseSecLeft] = useState<number>(4);
  const [breathingCyclesCompleted, setBreathingCyclesCompleted] = useState<number>(0);
  const [breathingActiveSeconds, setBreathingActiveSeconds] = useState<number>(0);
  const [audioChimes, setAudioChimes] = useState<boolean>(false);

  const totalTargetSeconds = targetMinutes * 60;
  const remainingSeconds = Math.max(0, totalTargetSeconds - elapsedSeconds);
  const progressPercent = Math.min(100, (elapsedSeconds / totalTargetSeconds) * 100);

  // Subscribe to Live SmartSpectra HumanSignalProvider
  useEffect(() => {
    const unsub = signalProvider.onSignal((signal) => {
      setLiveSignal(signal);
    });
    return () => unsub();
  }, []);

  // Main Focus Session Timer & Telemetry Logging Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sessionStatus === 'ACTIVE') {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => {
          const nextSec = prev + 1;

          // Check if current optical signal is reliable
          const isSignalReliable =
            liveSignal?.pulse?.isReliable === true ||
            liveSignal?.quality === 'OPTIMAL' ||
            liveSignal?.quality === 'DEGRADED';

          if (isSignalReliable) {
            setValidSignalSeconds((vs) => vs + 1);
          }

          // Record trend data point every 5 seconds
          if (nextSec % 5 === 0 || nextSec === 1) {
            const min = Math.floor(nextSec / 60);
            const sec = nextSec % 60;
            const timeLabel = `${min}:${sec.toString().padStart(2, '0')}`;

            setSessionTrends((prevTrends) => [
              ...prevTrends,
              {
                timeStr: timeLabel,
                seconds: nextSec,
                pulse: liveSignal?.pulse?.isReliable ? Math.round(liveSignal.pulse.bpm) : null,
                breathing: liveSignal?.breathing?.isReliable ? Number(liveSignal.breathing.brpm.toFixed(1)) : null,
                isReliable: isSignalReliable
              }
            ]);
          }

          if (nextSec >= totalTargetSeconds) {
            handleCompleteSession(nextSec);
            return totalTargetSeconds;
          }
          return nextSec;
        });

        // Track optional guided breathing seconds if expanded
        if (breathingOpen) {
          setBreathingActiveSeconds((s) => s + 1);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionStatus, totalTargetSeconds, liveSignal, breathingOpen]);

  // Optional Guided Breathing Animation Loop
  useEffect(() => {
    let animFrame: number;
    let lastTime = performance.now();
    let currentDuration = selectedPattern.inhaleSec;
    let phaseElapsed = 0;
    let currentPhase: 'Inhale' | 'Hold' | 'Exhale' | 'Rest' = 'Inhale';

    if (sessionStatus === 'ACTIVE' && breathingOpen) {
      if (audioChimes) ambientAudio.playTransitionChime(432);

      const tick = (now: number) => {
        const delta = (now - lastTime) / 1000;
        lastTime = now;
        phaseElapsed += delta;

        if (phaseElapsed >= currentDuration) {
          phaseElapsed = 0;
          if (currentPhase === 'Inhale') {
            if (selectedPattern.holdInSec > 0) {
              currentPhase = 'Hold';
              currentDuration = selectedPattern.holdInSec;
              if (audioChimes) ambientAudio.playTransitionChime(528);
            } else {
              currentPhase = 'Exhale';
              currentDuration = selectedPattern.exhaleSec;
              if (audioChimes) ambientAudio.playTransitionChime(396);
            }
          } else if (currentPhase === 'Hold') {
            currentPhase = 'Exhale';
            currentDuration = selectedPattern.exhaleSec;
            if (audioChimes) ambientAudio.playTransitionChime(396);
          } else if (currentPhase === 'Exhale') {
            if (selectedPattern.holdOutSec > 0) {
              currentPhase = 'Rest';
              currentDuration = selectedPattern.holdOutSec;
              if (audioChimes) ambientAudio.playTransitionChime(330);
            } else {
              currentPhase = 'Inhale';
              currentDuration = selectedPattern.inhaleSec;
              setBreathingCyclesCompleted((c) => c + 1);
              if (audioChimes) ambientAudio.playTransitionChime(432);
            }
          } else if (currentPhase === 'Rest') {
            currentPhase = 'Inhale';
            currentDuration = selectedPattern.inhaleSec;
            setBreathingCyclesCompleted((c) => c + 1);
            if (audioChimes) ambientAudio.playTransitionChime(432);
          }
          setBreathingPhase(currentPhase);
        }

        const remaining = Math.max(0, currentDuration - phaseElapsed);
        setBreathingPhaseSecLeft(remaining);
        setBreathingProgress(Math.min(1, phaseElapsed / currentDuration));

        animFrame = requestAnimationFrame(tick);
      };

      animFrame = requestAnimationFrame(tick);
    } else {
      setBreathingPhase('Inhale');
      setBreathingProgress(0);
      setBreathingPhaseSecLeft(selectedPattern.inhaleSec);
    }

    return () => cancelAnimationFrame(animFrame);
  }, [sessionStatus, breathingOpen, selectedPattern, audioChimes]);

  const handleStartSession = async () => {
    try {
      if (signalProvider.getStatus() === 'IDLE') {
        await signalProvider.start();
      }
    } catch {
      // Standalone web mode fallback
    }
    setSessionStatus('ACTIVE');
  };

  const handlePauseSession = async () => {
    setSessionStatus('PAUSED');
    await signalProvider.pause();
  };

  const handleResumeSession = async () => {
    setSessionStatus('ACTIVE');
    await signalProvider.resume();
  };

  const handleStopSession = async () => {
    await signalProvider.stop();
    setSessionStatus('IDLE');
    setElapsedSeconds(0);
    setSessionTrends([]);
  };

  const handleCompleteSession = async (finalElapsed = elapsedSeconds) => {
    setSessionStatus('IDLE');
    await signalProvider.stop();

    // Compute objective signal availability percentage
    const availabilityPercent = finalElapsed > 0
      ? Math.round((validSignalSeconds / finalElapsed) * 100)
      : 0;

    // Filter valid pulse readings
    const validPulseReadings = sessionTrends
      .map((t) => t.pulse)
      .filter((p): p is number => p !== null && p > 0);

    const avgPulse = validPulseReadings.length > 0
      ? Math.round(validPulseReadings.reduce((a, b) => a + b, 0) / validPulseReadings.length)
      : null;

    const minPulse = validPulseReadings.length > 0 ? Math.min(...validPulseReadings) : null;
    const maxPulse = validPulseReadings.length > 0 ? Math.max(...validPulseReadings) : null;

    // Filter valid breathing readings
    const validRespReadings = sessionTrends
      .map((t) => t.breathing)
      .filter((b): b is number => b !== null && b > 0);

    const avgResp = validRespReadings.length > 0
      ? Number((validRespReadings.reduce((a, b) => a + b, 0) / validRespReadings.length).toFixed(1))
      : null;

    const completedSession: WellnessSession = {
      id: `session_${Date.now()}`,
      type: 'FOCUS_SESSION',
      status: 'COMPLETED',
      startedAt: Date.now() - finalElapsed * 1000,
      endedAt: Date.now(),
      targetDurationSeconds: totalTargetSeconds,
      elapsedSeconds: finalElapsed,
      signalAvailabilityPercent: availabilityPercent,
      validSampleCount: validSignalSeconds,
      totalSampleCount: finalElapsed,
      averagePulseBpm: avgPulse,
      minPulseBpm: minPulse,
      maxPulseBpm: maxPulse,
      averageRespiratoryRate: avgResp,
      averageHrvRmssd: liveSignal?.hrv?.isReliable ? Math.round(liveSignal.hrv.rmssd) : null,
      guidedBreathingEngaged: breathingOpen,
      guidedBreathingPattern: breathingOpen ? selectedPattern : undefined,
      guidedBreathingCyclesCompleted: breathingOpen ? breathingCyclesCompleted : 0,
      guidedBreathingDurationSeconds: breathingOpen ? breathingActiveSeconds : 0,
      overallQuality: availabilityPercent > 70 ? 'OPTIMAL' : availabilityPercent > 30 ? 'DEGRADED' : 'UNUSABLE',
      sourcePlatform: bridgeState.isConnected ? 'desktop' : 'web',
      notes: `Focus session (${Math.round(finalElapsed / 60)}m). Signal availability: ${availabilityPercent}%.`
    };

    try {
      await storage.saveSession(completedSession);
      onSessionComplete(completedSession);
      onNavigate('summary');
    } catch (err) {
      console.error('Failed to save session:', err);
      onNavigate('summary');
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Breathing Visual Scale
  const getBreathingScale = () => {
    if (breathingPhase === 'Inhale') return 0.65 + breathingProgress * 0.35;
    if (breathingPhase === 'Hold') return 1.0;
    if (breathingPhase === 'Exhale') return 1.0 - breathingProgress * 0.35;
    return 0.65;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Top Header & Duration Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-semibold">
            Feature 1 & 2 · Ambient Focus & Optical Telemetry
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Focus Session
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Undistracted focus timed interval with continuous optical signal availability monitoring.
          </p>
        </div>

        {/* Configurable Session Duration Pills */}
        <div className="flex items-center gap-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] p-1 text-xs">
          {[15, 25, 45, 60].map((mins) => (
            <button
              key={mins}
              disabled={sessionStatus !== 'IDLE'}
              onClick={() => {
                setTargetMinutes(mins);
                setElapsedSeconds(0);
              }}
              className={`px-3 py-1.5 rounded-full transition-all text-xs font-mono ${
                targetMinutes === mins
                  ? 'bg-white text-slate-900 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              } ${sessionStatus !== 'IDLE' ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {mins}m
            </button>
          ))}
        </div>
      </div>

      {/* Main Focus Clock & Visual Experience */}
      <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-slate-900/60 via-[#0a0f1d] to-[#070b14] p-6 sm:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden space-y-8">
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-sky-500/10 blur-[100px]" />

        {/* Top Telemetry & Signal Availability Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
          {/* Signal Availability */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Signal Availability</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-mono text-2xl font-bold text-white">
                {elapsedSeconds > 0 ? Math.round((validSignalSeconds / elapsedSeconds) * 100) : 100}%
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {validSignalSeconds}s valid / {elapsedSeconds}s total
            </span>
          </div>

          {/* Live Pulse */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span>Pulse Rate</span>
              <Heart className="h-3 w-3 text-rose-500" />
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-mono text-2xl font-bold text-white">
                {liveSignal?.pulse?.isReliable ? Math.round(liveSignal.pulse.bpm) : '--'}
              </span>
              <span className="text-xs font-mono text-rose-400">BPM</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {liveSignal?.pulse?.isReliable ? 'Optical measurement valid' : 'Signal unavailable / calibrating'}
            </span>
          </div>

          {/* Live Breathing */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span>Respiration</span>
              <Wind className="h-3 w-3 text-emerald-400" />
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-mono text-2xl font-bold text-white">
                {liveSignal?.breathing?.isReliable ? liveSignal.breathing.brpm.toFixed(1) : '--'}
              </span>
              <span className="text-xs font-mono text-emerald-400">BrPM</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {liveSignal?.breathing?.isReliable ? 'Thoracic excursion valid' : 'Calibrating'}
            </span>
          </div>

          {/* Quality & Confidence */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span>Signal Quality</span>
              <Activity className="h-3 w-3 text-sky-400" />
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-mono text-2xl font-bold text-sky-400">
                {liveSignal?.quality || 'STANDBY'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
              Confidence: {liveSignal?.validation ? Math.round(liveSignal.validation.confidence * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Central Clock Area */}
        <div className="relative flex flex-col items-center justify-center py-4">
          {/* Progress Ring */}
          <div className="relative flex items-center justify-center">
            <svg className="w-64 h-64 sm:w-80 sm:h-80 transform -rotate-90">
              <circle
                cx="160"
                cy="160"
                r="135"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-900"
                fill="transparent"
              />
              <circle
                cx="160"
                cy="160"
                r="135"
                stroke="url(#focusGradient2)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 135}
                strokeDashoffset={(2 * Math.PI * 135) * (1 - progressPercent / 100)}
                strokeLinecap="round"
                className="transition-all duration-500 ease-linear"
              />
              <defs>
                <linearGradient id="focusGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Display */}
            <div className="absolute flex flex-col items-center text-center space-y-1 select-none">
              <span className="font-mono text-5xl sm:text-6xl font-black text-white tracking-tight tabular-nums drop-shadow-md">
                {formatTimer(remainingSeconds)}
              </span>
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                {sessionStatus === 'ACTIVE' ? 'Focused' : sessionStatus === 'PAUSED' ? 'Paused' : 'Target ' + targetMinutes + 'm'}
              </span>
              <span className="text-[11px] text-sky-400 font-medium font-mono">
                Elapsed: {formatTimer(elapsedSeconds)}
              </span>
            </div>
          </div>

          {/* Action Buttons: Start, Pause, Resume, Stop */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 relative z-10">
            {sessionStatus === 'IDLE' && (
              <button
                onClick={handleStartSession}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-8 py-3.5 text-sm font-semibold shadow-xl shadow-sky-950/50 transition-all active:scale-[0.98]"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Begin Focus Session</span>
              </button>
            )}

            {sessionStatus === 'ACTIVE' && (
              <button
                onClick={handlePauseSession}
                className="flex items-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white px-7 py-3 text-sm font-semibold transition-all active:scale-[0.98]"
              >
                <Pause className="h-4 w-4" />
                <span>Pause</span>
              </button>
            )}

            {sessionStatus === 'PAUSED' && (
              <button
                onClick={handleResumeSession}
                className="flex items-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white px-7 py-3 text-sm font-semibold transition-all active:scale-[0.98]"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Resume</span>
              </button>
            )}

            {elapsedSeconds > 0 && (
              <button
                onClick={() => handleCompleteSession()}
                className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 text-sm font-semibold shadow-lg shadow-emerald-950/40 transition-all active:scale-[0.98]"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Complete & Save</span>
              </button>
            )}

            {sessionStatus !== 'IDLE' && (
              <button
                onClick={handleStopSession}
                className="flex items-center gap-1.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 hover:text-white px-4 py-3 text-sm font-medium transition-colors"
              >
                <Square className="h-3.5 w-3.5" />
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>

        {/* Feature 2: Historical Signal Trends Chart (During Session) */}
        {sessionTrends.length > 1 && (
          <div className="rounded-2xl border border-white/[0.06] bg-slate-950/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Session Physiological Trends (Pulse & Respiration)
              </span>
              <span className="text-[11px] font-mono text-slate-500">Continuous SmartSpectra rPPG</span>
            </div>

            <div className="h-44 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sessionTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="timeStr" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#070b14', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pulse"
                    name="Pulse (BPM)"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="breathing"
                    name="Breathing (BrPM)"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-500 text-center font-mono">
              Note: Line gaps indicate moments where optical signal was unavailable or unverified.
            </p>
          </div>
        )}

        {/* Feature 3: Optional Guided Breathing Companion Section */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-violet-950/60 border border-violet-800/40 flex items-center justify-center text-violet-400 shrink-0">
                <Wind className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Optional Guided Breathing</h4>
                <p className="text-xs text-slate-400">
                  Engage rhythmic breathing cadence alongside your focus session whenever desired.
                </p>
              </div>
            </div>

            <button
              onClick={() => setBreathingOpen(!breathingOpen)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-xs font-semibold text-white transition-colors"
            >
              <span>{breathingOpen ? 'Hide Breathing Visual' : 'Open Guided Breathing'}</span>
              {breathingOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Expanded Breathing Visualizer */}
          {breathingOpen && (
            <div className="border-t border-white/[0.06] pt-5 space-y-6 animate-fadeIn">
              {/* Pattern Selection */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {BREATHING_PATTERNS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPattern(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        selectedPattern.id === p.id
                          ? 'bg-violet-600 text-white font-semibold shadow-md'
                          : 'bg-white/[0.02] border border-white/[0.04] text-slate-400 hover:text-white'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setAudioChimes(!audioChimes)}
                  className={`p-2 rounded-xl border text-xs transition-colors flex items-center gap-1.5 ${
                    audioChimes
                      ? 'border-violet-500 bg-violet-950/40 text-violet-300'
                      : 'border-white/[0.08] bg-white/[0.02] text-slate-400'
                  }`}
                  title={audioChimes ? 'Mute Phase Chimes' : 'Enable Phase Chimes'}
                >
                  {audioChimes ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                  <span className="text-[11px] font-mono">{audioChimes ? 'Chimes On' : 'Silent'}</span>
                </button>
              </div>

              {/* Animated Circular Breathing Visual (Inspired by prompt reference image) */}
              <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans transition-all duration-300">
                  {breathingPhase === 'Inhale' ? 'breathe in' : breathingPhase === 'Hold' ? 'hold' : 'breathe out'}
                </span>
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                  {Math.ceil(breathingPhaseSecLeft)}s remaining in phase · {breathingCyclesCompleted} cycles completed
                </span>

                {/* Circular Nested Luminous Ring Visualizer */}
                <div className="relative flex items-center justify-center h-56 w-56 my-2">
                  {/* Concentric ambient outer ring */}
                  <div
                    className="absolute rounded-full border border-violet-400/25 transition-all duration-500 ease-out pointer-events-none"
                    style={{
                      width: `${210 * getBreathingScale()}px`,
                      height: `${210 * getBreathingScale()}px`
                    }}
                  />

                  {/* Middle Cyan Ring */}
                  <div
                    className="absolute rounded-full border-2 border-sky-400/40 transition-all duration-500 ease-out pointer-events-none"
                    style={{
                      width: `${170 * getBreathingScale()}px`,
                      height: `${170 * getBreathingScale()}px`,
                      boxShadow: '0 0 40px rgba(56, 189, 248, 0.2)'
                    }}
                  />

                  {/* Inner Solid Luminous Disc (matching attached image) */}
                  <div
                    className="relative rounded-full flex items-center justify-center transition-all duration-500 ease-out shadow-2xl"
                    style={{
                      width: `${125 * getBreathingScale()}px`,
                      height: `${125 * getBreathingScale()}px`,
                      background: 'radial-gradient(circle at 35% 35%, #818cf8 0%, #6366f1 40%, #4338ca 85%, #312e81 100%)',
                      boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.4), 0 0 50px rgba(99, 102, 241, 0.35)'
                    }}
                  >
                    <span className="font-mono text-xl font-bold text-white drop-shadow select-none">
                      {Math.ceil(breathingPhaseSecLeft)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 max-w-sm">
                  {selectedPattern.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
