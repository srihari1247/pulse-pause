import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Volume2,
  VolumeX,
  Wind,
  Music,
  CheckCircle,
  Eye,
  Sliders,
  Layers
} from 'lucide-react';
import { ScreenId } from './Navigation';
import { ambientAudio, AmbientSoundType } from '../audio/ambientAudio';
import { WellnessSession, BreathingPattern } from '@pulsepause/domain-models';
import { storage } from '../storage/indexedDb';

interface BreathingScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onSessionComplete: (session: WellnessSession) => void;
}

export type VisualizerTheme = 'orbital' | 'luminous' | 'resonant';

export interface ExtendedPattern extends BreathingPattern {
  tagline: string;
}

export const BREATHING_PRESETS: ExtendedPattern[] = [
  {
    id: 'box',
    name: 'Square Breathing',
    tagline: '4 - 4 - 4 - 4 Cadence',
    description: 'Equal four-phase cadence to cultivate balanced attention and calm steady presence.',
    inhaleSec: 4.0,
    holdInSec: 4.0,
    exhaleSec: 4.0,
    holdOutSec: 4.0,
    targetCadenceBrpm: 3.75
  },
  {
    id: 'resonance',
    name: 'Coherent Resonance',
    tagline: '5.5s RSA Rhythm',
    description: '5.5 breaths per minute cadence synchronizing pulmonary ventilation with cardiac rhythm.',
    inhaleSec: 5.5,
    holdInSec: 0,
    exhaleSec: 5.5,
    holdOutSec: 0,
    targetCadenceBrpm: 5.45
  },
  {
    id: 'relax_478',
    name: 'Long Exhale (4-7-8)',
    tagline: 'Vagal Recovery',
    description: 'Extended exhalation pacing to encourage parasympathetic cardiac deceleration.',
    inhaleSec: 4.0,
    holdInSec: 7.0,
    exhaleSec: 8.0,
    holdOutSec: 0,
    targetCadenceBrpm: 3.15
  },
  {
    id: 'gentle_46',
    name: 'Gentle Flow (4-6)',
    tagline: 'Smooth Transition',
    description: 'Effortless 4s inhalation and 6s exhalation cadence for gentle mindful pauses.',
    inhaleSec: 4.0,
    holdInSec: 0,
    exhaleSec: 6.0,
    holdOutSec: 0,
    targetCadenceBrpm: 6.0
  }
];

type BreathingPhase = 'Inhale' | 'Hold' | 'Exhale' | 'Rest';

export const BreathingScreen: React.FC<BreathingScreenProps> = ({ onNavigate, onSessionComplete }) => {
  const [selectedPattern, setSelectedPattern] = useState<ExtendedPattern>(BREATHING_PRESETS[0]);
  const [visualTheme, setVisualTheme] = useState<VisualizerTheme>('orbital');
  const [targetMinutes, setTargetMinutes] = useState<number>(5);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Phase animation state
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('Inhale');
  const [phaseInstruction, setPhaseInstruction] = useState<string>('Breathe in gently through the nose');
  const [phaseProgress, setPhaseProgress] = useState<number>(0); // 0.0 - 1.0
  const [phaseRemainingSec, setPhaseRemainingSec] = useState<number>(4);
  const [totalElapsedSec, setTotalElapsedSec] = useState<number>(0);
  const [completedCycles, setCompletedCycles] = useState<number>(0);

  // Audio state
  const [currentSound, setCurrentSound] = useState<AmbientSoundType>('bowls');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playChimes, setPlayChimes] = useState<boolean>(true);

  const targetTotalSeconds = targetMinutes * 60;

  // Soundscape handler
  const handleSelectSound = (sound: AmbientSoundType) => {
    setCurrentSound(sound);
    if (!isMuted) {
      ambientAudio.playSoundscape(sound);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    ambientAudio.setMuted(nextMuted);
  };

  useEffect(() => {
    return () => {
      ambientAudio.stopSoundscape();
    };
  }, []);

  // Main Breathing Loop Animation
  useEffect(() => {
    let animFrame: number;
    let lastTime = performance.now();
    let currentPhaseDuration = selectedPattern.inhaleSec;
    let phaseElapsed = 0;
    let phase: BreathingPhase = 'Inhale';

    if (isActive && !isPaused) {
      // Start ambient audio if not playing
      if (currentSound !== 'none' && !isMuted) {
        ambientAudio.playSoundscape(currentSound);
      }
      if (playChimes) ambientAudio.playTransitionChime(432); // Inhale chime

      const tick = (now: number) => {
        const delta = (now - lastTime) / 1000;
        lastTime = now;
        phaseElapsed += delta;

        setTotalElapsedSec((prev) => {
          const next = prev + delta;
          if (next >= targetTotalSeconds) {
            handleCompleteSession(next);
            return targetTotalSeconds;
          }
          return next;
        });

        if (phaseElapsed >= currentPhaseDuration) {
          phaseElapsed = 0;
          // State Machine
          if (phase === 'Inhale') {
            if (selectedPattern.holdInSec > 0) {
              phase = 'Hold';
              currentPhaseDuration = selectedPattern.holdInSec;
              setPhaseInstruction('Hold gently with stillness');
              if (playChimes) ambientAudio.playTransitionChime(528);
            } else {
              phase = 'Exhale';
              currentPhaseDuration = selectedPattern.exhaleSec;
              setPhaseInstruction('Slow, smooth exhalation');
              if (playChimes) ambientAudio.playTransitionChime(396);
            }
          } else if (phase === 'Hold') {
            phase = 'Exhale';
            currentPhaseDuration = selectedPattern.exhaleSec;
            setPhaseInstruction('Slow, smooth exhalation');
            if (playChimes) ambientAudio.playTransitionChime(396);
          } else if (phase === 'Exhale') {
            if (selectedPattern.holdOutSec > 0) {
              phase = 'Rest';
              currentPhaseDuration = selectedPattern.holdOutSec;
              setPhaseInstruction('Pause in quiet ease');
              if (playChimes) ambientAudio.playTransitionChime(330);
            } else {
              phase = 'Inhale';
              currentPhaseDuration = selectedPattern.inhaleSec;
              setPhaseInstruction('Breathe in gently through the nose');
              setCompletedCycles((c) => c + 1);
              if (playChimes) ambientAudio.playTransitionChime(432);
            }
          } else if (phase === 'Rest') {
            phase = 'Inhale';
            currentPhaseDuration = selectedPattern.inhaleSec;
            setPhaseInstruction('Breathe in gently through the nose');
            setCompletedCycles((c) => c + 1);
            if (playChimes) ambientAudio.playTransitionChime(432);
          }
          setCurrentPhase(phase);
        }

        const rem = Math.max(0, currentPhaseDuration - phaseElapsed);
        setPhaseRemainingSec(rem);
        setPhaseProgress(Math.min(1, phaseElapsed / currentPhaseDuration));

        animFrame = requestAnimationFrame(tick);
      };

      animFrame = requestAnimationFrame(tick);
    } else {
      if (!isActive) {
        ambientAudio.stopSoundscape();
        setCurrentPhase('Inhale');
        setPhaseProgress(0);
        setPhaseRemainingSec(selectedPattern.inhaleSec);
        setPhaseInstruction('Breathe in gently through the nose');
      }
    }

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [isActive, isPaused, selectedPattern, targetTotalSeconds, playChimes]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
    ambientAudio.stopSoundscape();
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = () => {
    setIsActive(false);
    setIsPaused(false);
    ambientAudio.stopSoundscape();
    setTotalElapsedSec(0);
    setCompletedCycles(0);
  };

  const handleCompleteSession = async (finalElapsed = totalElapsedSec) => {
    setIsActive(false);
    setIsPaused(false);
    ambientAudio.stopSoundscape();

    const elapsed = Math.round(finalElapsed) || 60;
    const session: WellnessSession = {
      id: `breath_${Date.now()}`,
      type: 'RESONANCE_BREATHING',
      status: 'COMPLETED',
      startedAt: Date.now() - elapsed * 1000,
      endedAt: Date.now(),
      targetDurationSeconds: targetTotalSeconds,
      elapsedSeconds: elapsed,
      signalAvailabilityPercent: 100, // Guided breathing without mandatory camera operates at full session fidelity
      validSampleCount: elapsed,
      totalSampleCount: elapsed,
      guidedBreathingEngaged: true,
      guidedBreathingPattern: selectedPattern,
      guidedBreathingCyclesCompleted: completedCycles,
      guidedBreathingDurationSeconds: elapsed,
      overallQuality: 'OPTIMAL',
      sourcePlatform: 'web',
      notes: `${selectedPattern.name} breathing session: ${completedCycles} cycles completed.`
    };

    try {
      await storage.saveSession(session);
      onSessionComplete(session);
      onNavigate('summary');
    } catch {
      onNavigate('summary');
    }
  };

  // Orb scale computation (0.60 to 1.0)
  const getScale = () => {
    if (!isActive) return 0.72;
    if (currentPhase === 'Inhale') {
      return 0.62 + phaseProgress * 0.38; // 0.62 -> 1.0
    }
    if (currentPhase === 'Hold') {
      return 1.0;
    }
    if (currentPhase === 'Exhale') {
      return 1.0 - phaseProgress * 0.38; // 1.0 -> 0.62
    }
    return 0.62;
  };

  const remainingTotalSeconds = Math.max(0, targetTotalSeconds - totalElapsedSec);
  const formatClock = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const scale = getScale();

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col justify-between py-4 space-y-6">
      {/* Background Atmosphere */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[750px] w-[750px] rounded-full bg-gradient-to-tr from-violet-950/30 via-sky-950/20 to-transparent blur-[160px]" />
      </div>

      {/* Top Header Bar: Pattern Title, Visual Style Switcher, Duration Pills */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-wide font-sans">
              {selectedPattern.name}
            </h2>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400 font-mono">{selectedPattern.tagline}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {selectedPattern.description}
          </p>
        </div>

        {/* Visualizer Theme Selector & Duration Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Visual Theme Pills (Inspired by prompt reference screenshot) */}
          <div className="flex items-center gap-1 rounded-2xl bg-white/[0.03] border border-white/[0.08] p-1 text-xs">
            <span className="text-[10px] font-mono uppercase text-slate-500 px-2 flex items-center gap-1">
              <Layers className="h-3 w-3 text-sky-400" />
              <span>Style</span>
            </span>
            <button
              onClick={() => setVisualTheme('orbital')}
              className={`px-2.5 py-1 rounded-xl transition-all text-xs font-mono ${
                visualTheme === 'orbital'
                  ? 'bg-violet-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Orbital
            </button>
            <button
              onClick={() => setVisualTheme('luminous')}
              className={`px-2.5 py-1 rounded-xl transition-all text-xs font-mono ${
                visualTheme === 'luminous'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Luminous
            </button>
            <button
              onClick={() => setVisualTheme('resonant')}
              className={`px-2.5 py-1 rounded-xl transition-all text-xs font-mono ${
                visualTheme === 'resonant'
                  ? 'bg-fuchsia-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Resonant
            </button>
          </div>

          {/* Duration Selector Pills */}
          <div className="flex items-center gap-1 rounded-full bg-white/[0.03] border border-white/[0.08] p-1 text-xs">
            {[1, 3, 5, 10].map((mins) => (
              <button
                key={mins}
                disabled={isActive}
                onClick={() => {
                  setTargetMinutes(mins);
                  handleStop();
                }}
                className={`px-3 py-1 rounded-full transition-all text-xs font-mono ${
                  targetMinutes === mins
                    ? 'bg-white text-slate-900 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                } ${isActive ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Experience Layout: Left Technique Details + Center Visualizer + Right Ambient Sounds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Card: Technique Cadence Details (3 cols, Desktop) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col justify-between space-y-6 rounded-3xl border border-white/[0.06] bg-slate-900/30 p-6 backdrop-blur-xl">
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              PATTERN SELECTION
            </span>
            <div className="space-y-1.5">
              {BREATHING_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPattern(p);
                    handleStop();
                  }}
                  className={`w-full text-left p-3 rounded-2xl border text-xs transition-all ${
                    selectedPattern.id === p.id
                      ? 'border-violet-500/50 bg-violet-950/30 text-white font-semibold shadow-sm'
                      : 'border-white/[0.04] bg-white/[0.01] text-slate-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-[10px] font-mono text-sky-400">{p.targetCadenceBrpm} BrPM</span>
                  </div>
                  <span className="block text-[10px] font-mono text-slate-500 mt-1">{p.tagline}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cadence Times Breakdown */}
          <div className="space-y-2 border-t border-white/[0.06] pt-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
              PHASE BREAKDOWN
            </span>
            <div className="space-y-1 text-xs text-slate-300 font-mono">
              <div className="flex justify-between">
                <span>Inhale</span>
                <span className="text-sky-400 font-bold">{selectedPattern.inhaleSec}s</span>
              </div>
              {selectedPattern.holdInSec > 0 && (
                <div className="flex justify-between">
                  <span>Hold</span>
                  <span className="text-violet-400 font-bold">{selectedPattern.holdInSec}s</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Exhale</span>
                <span className="text-emerald-400 font-bold">{selectedPattern.exhaleSec}s</span>
              </div>
              {selectedPattern.holdOutSec > 0 && (
                <div className="flex justify-between">
                  <span>Rest</span>
                  <span className="text-indigo-400 font-bold">{selectedPattern.holdOutSec}s</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-3 text-xs text-slate-400 font-mono flex items-center justify-between">
            <span>Completed Cycles:</span>
            <strong className="text-white text-sm font-mono">{completedCycles}</strong>
          </div>
        </div>

        {/* Center Visualizer: 3 Switchable Visual Treatments from Prompt Reference (6 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center text-center space-y-6 relative">
          {/* Phase Title & Sub-Instruction */}
          <div className="space-y-1 min-h-[4.5rem]">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans transition-all duration-300">
              {isActive
                ? currentPhase === 'Inhale'
                  ? 'breathe in'
                  : currentPhase === 'Hold'
                  ? 'hold'
                  : currentPhase === 'Exhale'
                  ? 'breathe out'
                  : 'rest'
                : 'Ready'}
            </h1>
            <p className="text-xs font-mono uppercase tracking-widest text-slate-400 transition-all duration-300">
              {isActive ? phaseInstruction : 'Press Begin to start guided breathing'}
            </p>
          </div>

          {/* Visualizer Container (300px x 300px) */}
          <div className="relative flex items-center justify-center h-72 sm:h-80 w-72 sm:w-80 my-2 select-none">
            {/* STYLE 1: Orbital Satellite Visualizer (matches Prompt 4 left image) */}
            {visualTheme === 'orbital' && (
              <>
                {/* Thin Orbital Outer Guide Circle */}
                <div
                  className="absolute rounded-full border border-sky-400/25 transition-all duration-500 ease-out pointer-events-none"
                  style={{
                    width: `${300 * scale}px`,
                    height: `${300 * scale}px`
                  }}
                />

                {/* 3 Orbiting Satellites on the perimeter */}
                <div
                  className="absolute rounded-full pointer-events-none transition-all duration-500 ease-out"
                  style={{
                    width: `${300 * scale}px`,
                    height: `${300 * scale}px`,
                    transform: `rotate(${phaseProgress * 360}deg)`
                  }}
                >
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
                  <span className="absolute top-1/2 -left-1.5 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-violet-300 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                </div>

                {/* Middle Soft Glow Ring */}
                <div
                  className="absolute rounded-full border border-violet-400/30 transition-all duration-500 ease-out pointer-events-none"
                  style={{
                    width: `${240 * scale}px`,
                    height: `${240 * scale}px`,
                    boxShadow: `0 0 60px rgba(129, 140, 248, ${0.2 * scale})`
                  }}
                />

                {/* Core Periwinkle Disc (Prompt 4 style) */}
                <div
                  className="relative rounded-full flex flex-col items-center justify-center transition-all duration-500 ease-out shadow-2xl overflow-hidden"
                  style={{
                    width: `${180 * scale}px`,
                    height: `${180 * scale}px`,
                    background: 'radial-gradient(circle at 35% 35%, #a5b4fc 0%, #818cf8 40%, #6366f1 80%, #4338ca 100%)',
                    boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.6), 0 0 50px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  <span className="font-mono text-3xl font-extrabold text-white drop-shadow">
                    {isActive ? Math.ceil(phaseRemainingSec) : targetMinutes + 'm'}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-100 font-semibold mt-0.5">
                    {isActive ? currentPhase : 'PAUSE'}
                  </span>
                </div>
              </>
            )}

            {/* STYLE 2: Luminous Azure Glow (matches Prompt 4 middle image) */}
            {visualTheme === 'luminous' && (
              <>
                {/* Outer Deep Cyan Aura Disk */}
                <div
                  className="absolute rounded-full transition-all duration-500 ease-out pointer-events-none"
                  style={{
                    width: `${300 * scale}px`,
                    height: `${300 * scale}px`,
                    background: 'radial-gradient(circle, rgba(14, 116, 144, 0.25) 0%, rgba(8, 47, 73, 0.15) 60%, transparent 80%)',
                    boxShadow: `0 0 80px rgba(6, 182, 212, ${0.25 * scale})`
                  }}
                />

                {/* Secondary Cyan Ring */}
                <div
                  className="absolute rounded-full border border-cyan-400/30 transition-all duration-500 ease-out pointer-events-none"
                  style={{
                    width: `${240 * scale}px`,
                    height: `${240 * scale}px`
                  }}
                />

                {/* Core Cyan/Sky Luminous Disc */}
                <div
                  className="relative rounded-full flex flex-col items-center justify-center transition-all duration-500 ease-out shadow-2xl overflow-hidden"
                  style={{
                    width: `${175 * scale}px`,
                    height: `${175 * scale}px`,
                    background: 'radial-gradient(circle at 35% 35%, #67e8f9 0%, #06b6d4 40%, #0284c7 80%, #0369a1 100%)',
                    boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.7), 0 0 60px rgba(6, 182, 212, 0.45)'
                  }}
                >
                  <span className="font-mono text-3xl font-black text-slate-950 drop-shadow-sm">
                    {isActive ? Math.ceil(phaseRemainingSec) : targetMinutes + 'm'}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-900 font-bold mt-0.5">
                    {isActive ? currentPhase : 'CYAN PACE'}
                  </span>
                </div>
              </>
            )}

            {/* STYLE 3: Resonant Harmonic Rings (matches Prompt 4 right mobile view) */}
            {visualTheme === 'resonant' && (
              <>
                {/* Concentric Nesting Purple Rings (Calmaria style) */}
                <div
                  className="absolute rounded-full border border-fuchsia-500/20 transition-all duration-700 ease-out pointer-events-none"
                  style={{
                    width: `${300 * scale}px`,
                    height: `${300 * scale}px`
                  }}
                />
                <div
                  className="absolute rounded-full border-2 border-violet-500/35 transition-all duration-500 ease-out pointer-events-none"
                  style={{
                    width: `${240 * scale}px`,
                    height: `${240 * scale}px`
                  }}
                />
                <div
                  className="absolute rounded-full border-2 border-purple-400/50 transition-all duration-400 ease-out pointer-events-none"
                  style={{
                    width: `${190 * scale}px`,
                    height: `${190 * scale}px`,
                    boxShadow: `0 0 50px rgba(192, 38, 211, ${0.3 * scale})`
                  }}
                />

                {/* Core Deep Violet Disc */}
                <div
                  className="relative rounded-full flex flex-col items-center justify-center transition-all duration-500 ease-out shadow-2xl overflow-hidden"
                  style={{
                    width: `${145 * scale}px`,
                    height: `${145 * scale}px`,
                    background: 'radial-gradient(circle at 35% 35%, #d946ef 0%, #a855f7 40%, #7e22ce 80%, #581c87 100%)',
                    boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.6), 0 0 45px rgba(168, 85, 247, 0.4)'
                  }}
                >
                  <span className="font-mono text-2xl font-black text-white drop-shadow">
                    {isActive ? Math.ceil(phaseRemainingSec) : targetMinutes + 'm'}
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-fuchsia-200 font-semibold mt-0.5">
                    {isActive ? currentPhase : 'RESONANT'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Time Remaining Badge */}
          <div className="rounded-full bg-white/[0.04] border border-white/[0.08] px-4 py-1 text-xs font-mono text-slate-300">
            Remaining: <strong className="text-white font-mono">{formatClock(remainingTotalSeconds)}</strong>
            <span className="mx-2 text-slate-600">|</span>
            Elapsed: <span className="text-sky-400 font-mono">{formatClock(totalElapsedSec)}</span>
          </div>

          {/* Action Control Buttons: Start, Pause, Resume, Stop, Complete */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {!isActive && (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-violet-600 hover:from-sky-400 hover:to-violet-500 text-white px-8 py-3.5 text-sm font-semibold shadow-xl shadow-violet-950/50 transition-all active:scale-[0.98]"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Begin Breathing</span>
              </button>
            )}

            {isActive && !isPaused && (
              <button
                onClick={handlePause}
                className="flex items-center gap-2 rounded-2xl bg-white text-slate-900 hover:bg-slate-200 px-7 py-3 text-sm font-bold shadow-xl transition-all active:scale-[0.98]"
              >
                <Pause className="h-4 w-4" />
                <span>Pause</span>
              </button>
            )}

            {isActive && isPaused && (
              <button
                onClick={handleResume}
                className="flex items-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white px-7 py-3 text-sm font-bold shadow-xl transition-all active:scale-[0.98]"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Resume</span>
              </button>
            )}

            {/* Instant Stop Control */}
            {isActive && (
              <button
                onClick={handleStop}
                className="flex items-center gap-1.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 hover:text-white px-5 py-3 text-sm font-medium transition-colors"
                title="Stop at any time"
              >
                <Square className="h-3.5 w-3.5" />
                <span>Stop</span>
              </button>
            )}

            {/* Complete & Save */}
            {totalElapsedSec > 10 && (
              <button
                onClick={() => handleCompleteSession()}
                className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 text-sm font-semibold shadow-lg shadow-emerald-950/40 transition-all active:scale-[0.98]"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Save Session</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Card: Ambient Soundscape Generator (3 cols, Desktop) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col justify-between space-y-6 rounded-3xl border border-white/[0.06] bg-slate-900/30 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Music className="h-3.5 w-3.5 text-sky-400" />
              <span>SOUNDSCAPE</span>
            </span>
            <button
              onClick={handleToggleMute}
              className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-400" />}
              <span>{isMuted ? 'UNMUTE' : 'MUTE'}</span>
            </button>
          </div>

          <div className="space-y-2">
            {[
              { id: 'bowls', label: 'Tibetan Singing Bowls' },
              { id: 'air', label: 'Gentle Flowing Air' },
              { id: 'ocean', label: 'Pacific Ocean Waves' },
              { id: 'forest', label: 'Nocturnal Pine Forest' },
              { id: 'none', label: 'Silent Focus' }
            ].map((sound) => {
              const isSelected = currentSound === sound.id;
              return (
                <button
                  key={sound.id}
                  onClick={() => handleSelectSound(sound.id as AmbientSoundType)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs transition-all ${
                    isSelected
                      ? 'border-violet-500/50 bg-violet-950/30 text-white font-semibold shadow-sm'
                      : 'border-white/[0.04] bg-white/[0.01] text-slate-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <span>{sound.label}</span>
                  {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />}
                </button>
              );
            })}
          </div>

          <div className="space-y-2 border-t border-white/[0.06] pt-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Phase Chimes:</span>
              <button
                onClick={() => setPlayChimes(!playChimes)}
                className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-lg border ${
                  playChimes ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20' : 'text-slate-500 border-white/[0.06]'
                }`}
              >
                {playChimes ? 'ENABLED' : 'OFF'}
              </button>
            </div>
            <div className="text-[10px] text-slate-500 font-mono text-center">
              Synthesized natively via Web Audio API
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
