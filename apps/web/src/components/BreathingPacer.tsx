import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Wind, Sparkles } from 'lucide-react';
import { BreathingProtocol } from '@pulsepause/domain-models';

export const BREATHING_PROTOCOLS: BreathingProtocol[] = [
  {
    id: 'resonance_55',
    name: '5.5s Coherent Resonance',
    description: 'Optimal 5.5 breaths/min rhythm aligning heart rate variability (HRV) with respiratory sinus arrhythmia.',
    inhaleSec: 5.5,
    holdInSec: 0,
    exhaleSec: 5.5,
    holdOutSec: 0,
    targetCadenceBrpm: 5.5
  },
  {
    id: 'box_breathing',
    name: 'Box Breathing (4-4-4-4)',
    description: 'Equal quad-cadence used to calm the autonomic nervous system and restore acute cognitive focus.',
    inhaleSec: 4.0,
    holdInSec: 4.0,
    exhaleSec: 4.0,
    holdOutSec: 4.0,
    targetCadenceBrpm: 3.75
  },
  {
    id: 'relax_478',
    name: '4-7-8 Vagal Recovery',
    description: 'Dr. Weil parasympathetic activation with extended exhalation to lower systemic blood pressure.',
    inhaleSec: 4.0,
    holdInSec: 7.0,
    exhaleSec: 8.0,
    holdOutSec: 0,
    targetCadenceBrpm: 3.15
  },
  {
    id: 'energize_awake',
    name: 'Alert Reset (3-0-2-0)',
    description: 'Quick invigorating cadence to dispel afternoon fog and increase cerebral oxygenation.',
    inhaleSec: 3.0,
    holdInSec: 0,
    exhaleSec: 2.0,
    holdOutSec: 0,
    targetCadenceBrpm: 12.0
  }
];

export type BreathingPhase = 'INHALE' | 'HOLD_IN' | 'EXHALE' | 'HOLD_OUT';

export const BreathingPacer: React.FC = () => {
  const [selectedProtocol, setSelectedProtocol] = useState<BreathingProtocol>(BREATHING_PROTOCOLS[0]);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('INHALE');
  const [phaseProgress, setPhaseProgress] = useState<number>(0); // 0.0 - 1.0
  const [secondsRemainingInPhase, setSecondsRemainingInPhase] = useState<number>(5.5);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Web Audio Synth Chime for Breathing Transitions
  const playChime = (freq: number) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  useEffect(() => {
    let animFrame: number;
    let lastTime = performance.now();
    let currentPhaseDuration = selectedProtocol.inhaleSec;
    let phaseElapsed = 0;
    let phase: BreathingPhase = 'INHALE';

    if (isActive) {
      playChime(392.0); // G4 chime for inhale start

      const tick = (now: number) => {
        const delta = (now - lastTime) / 1000;
        lastTime = now;
        phaseElapsed += delta;

        if (phaseElapsed >= currentPhaseDuration) {
          phaseElapsed = 0;
          // Transition to next phase
          if (phase === 'INHALE') {
            if (selectedProtocol.holdInSec > 0) {
              phase = 'HOLD_IN';
              currentPhaseDuration = selectedProtocol.holdInSec;
              playChime(440.0);
            } else {
              phase = 'EXHALE';
              currentPhaseDuration = selectedProtocol.exhaleSec;
              playChime(329.63); // E4
            }
          } else if (phase === 'HOLD_IN') {
            phase = 'EXHALE';
            currentPhaseDuration = selectedProtocol.exhaleSec;
            playChime(329.63);
          } else if (phase === 'EXHALE') {
            if (selectedProtocol.holdOutSec > 0) {
              phase = 'HOLD_OUT';
              currentPhaseDuration = selectedProtocol.holdOutSec;
              playChime(293.66); // D4
            } else {
              phase = 'INHALE';
              currentPhaseDuration = selectedProtocol.inhaleSec;
              setCompletedCycles((c) => c + 1);
              playChime(392.0);
            }
          } else if (phase === 'HOLD_OUT') {
            phase = 'INHALE';
            currentPhaseDuration = selectedProtocol.inhaleSec;
            setCompletedCycles((c) => c + 1);
            playChime(392.0);
          }
          setCurrentPhase(phase);
        }

        const remaining = Math.max(0, currentPhaseDuration - phaseElapsed);
        setSecondsRemainingInPhase(remaining);
        setPhaseProgress(phaseElapsed / currentPhaseDuration);

        animFrame = requestAnimationFrame(tick);
      };

      animFrame = requestAnimationFrame(tick);
    } else {
      setCurrentPhase('INHALE');
      setPhaseProgress(0);
      setSecondsRemainingInPhase(selectedProtocol.inhaleSec);
    }

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [isActive, selectedProtocol]);

  const getPhaseTitle = (phase: BreathingPhase) => {
    switch (phase) {
      case 'INHALE':
        return 'Inhale Deeply (Diaphragmatic)';
      case 'HOLD_IN':
        return 'Hold with Stillness';
      case 'EXHALE':
        return 'Slow Smooth Exhalation';
      case 'HOLD_OUT':
        return 'Empty Pause';
    }
  };

  const getCircleScale = () => {
    if (!isActive) return 0.7;
    if (currentPhase === 'INHALE') {
      return 0.6 + phaseProgress * 0.4; // 0.6 -> 1.0
    }
    if (currentPhase === 'HOLD_IN') {
      return 1.0;
    }
    if (currentPhase === 'EXHALE') {
      return 1.0 - phaseProgress * 0.4; // 1.0 -> 0.6
    }
    return 0.6;
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'INHALE':
        return {
          glow: 'rgba(16, 185, 129, 0.35)',
          circle: 'from-emerald-500 to-teal-400',
          text: 'text-emerald-300'
        };
      case 'HOLD_IN':
        return {
          glow: 'rgba(6, 182, 212, 0.35)',
          circle: 'from-cyan-500 to-sky-400',
          text: 'text-cyan-300'
        };
      case 'EXHALE':
        return {
          glow: 'rgba(244, 63, 94, 0.35)',
          circle: 'from-rose-500 to-pink-400',
          text: 'text-rose-300'
        };
      case 'HOLD_OUT':
        return {
          glow: 'rgba(99, 102, 241, 0.35)',
          circle: 'from-indigo-500 to-violet-400',
          text: 'text-indigo-300'
        };
    }
  };

  const colors = getPhaseColor();

  return (
    <div className="space-y-6">
      {/* Protocol Selection Carousel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {BREATHING_PROTOCOLS.map((protocol) => {
          const isSelected = selectedProtocol.id === protocol.id;
          return (
            <button
              key={protocol.id}
              onClick={() => {
                setSelectedProtocol(protocol);
                setIsActive(false);
              }}
              className={`text-left rounded-xl p-3.5 border transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-950/30 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-emerald-300' : 'text-slate-300'}`}>
                  {protocol.name}
                </span>
                <span className="rounded bg-slate-950 border border-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400">
                  {protocol.targetCadenceBrpm} BrPM
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                {protocol.description}
              </p>
              <div className="mt-2.5 flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <span>In: {protocol.inhaleSec}s</span>
                {protocol.holdInSec > 0 && <span>• Hold: {protocol.holdInSec}s</span>}
                <span>• Out: {protocol.exhaleSec}s</span>
                {protocol.holdOutSec > 0 && <span>• Hold: {protocol.holdOutSec}s</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Breathing Visualizer Canvas Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950 p-6 sm:p-10 flex flex-col items-center justify-center min-h-[420px] shadow-2xl">
        {/* Subtle Ambient Background Gradients */}
        <div
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full blur-[100px] pointer-events-none transition-all duration-1000"
          style={{ background: colors.glow }}
        />

        {/* Top Controls in Card */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              soundEnabled
                ? 'border-emerald-700/60 bg-emerald-950/40 text-emerald-300'
                : 'border-slate-800 bg-slate-900 text-slate-500'
            }`}
            title={soundEnabled ? 'Mute Chimes' : 'Unmute Chimes'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>

        {/* Top Protocol Tag */}
        <div className="mb-6 text-center space-y-1">
          <span className="rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-xs font-medium text-slate-300 inline-flex items-center gap-1.5">
            <Wind className="h-3.5 w-3.5 text-emerald-400" />
            <span>{selectedProtocol.name}</span>
          </span>
          <h2 className={`text-xl sm:text-2xl font-bold tracking-tight transition-colors duration-300 ${colors.text}`}>
            {isActive ? getPhaseTitle(currentPhase) : 'Ready to Begin'}
          </h2>
          <p className="text-xs text-slate-400">
            {isActive
              ? `${secondsRemainingInPhase.toFixed(1)}s remaining in phase`
              : 'Click start to align respiration with autonomic recovery'}
          </p>
        </div>

        {/* Expanding / Contracting Breathing Ring */}
        <div className="relative my-4 flex items-center justify-center">
          {/* External Pulse Halo */}
          <div
            className="absolute rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${260 * getCircleScale()}px`,
              height: `${260 * getCircleScale()}px`,
              boxShadow: `0 0 60px ${colors.glow}`,
              border: '1.5px dashed rgba(255, 255, 255, 0.15)'
            }}
          />

          {/* Central Breathing Orb */}
          <div
            className={`relative flex items-center justify-center rounded-full bg-gradient-to-br ${colors.circle} text-white shadow-2xl transition-all duration-300 ease-out`}
            style={{
              width: `${180 * getCircleScale()}px`,
              height: `${180 * getCircleScale()}px`
            }}
          >
            <div className="text-center">
              <span className="font-mono text-3xl font-extrabold tracking-tight drop-shadow-md">
                {isActive ? Math.ceil(secondsRemainingInPhase) : 'START'}
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/90 drop-shadow">
                {isActive ? currentPhase.replace('_', ' ') : selectedProtocol.targetCadenceBrpm + ' BrPM'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Pacer Controls */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsActive(!isActive)}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-transform active:scale-95 ${
                isActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pause Pacer</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Start Coherent Pacer</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsActive(false);
                setCompletedCycles(0);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
              title="Reset cycle counter"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>Completed Cycles: <strong className="text-emerald-400">{completedCycles}</strong></span>
            <span>•</span>
            <span>Target Cadence: <strong className="text-cyan-400">{selectedProtocol.targetCadenceBrpm} BrPM</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
