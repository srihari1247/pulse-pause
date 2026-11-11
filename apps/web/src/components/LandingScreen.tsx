import React from 'react';
import { ArrowRight, Eye, ShieldCheck, Heart, Wind, Sparkles, CheckCircle2, ChevronRight, Laptop, Smartphone } from 'lucide-react';
import { ScreenId } from './Navigation';

interface LandingScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-24 py-6 sm:py-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-slate-900/60 via-[#0a0f1d]/90 to-[#070b14] p-8 sm:p-16 lg:p-20 shadow-2xl">
        {/* Ambient atmospheric backdrop glows */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[480px] w-[480px] rounded-full bg-violet-600/15 blur-[140px]" />

        <div className="relative mx-auto max-w-4xl text-center space-y-8">
          {/* Eyebrow kicker */}
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-950/30 px-4 py-1.5 text-xs font-medium text-sky-300">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>Presage SmartSpectra Optical Sensing Engine</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.18] font-display">
            Breathe with your pulse. <br />
            <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
              Master your cognitive flow.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            PulsePause transforms standard camera feeds into clinical-grade physiological biofeedback. 
            Calibrate stress, restore autonomic balance, and sustain effortless deep focus without wearables.
          </p>

          {/* Primary & Secondary Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('breathing')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-violet-600 hover:from-sky-400 hover:to-violet-500 text-white px-8 py-4 text-sm font-semibold shadow-xl shadow-violet-950/50 transition-all hover:shadow-sky-500/20 active:scale-[0.98]"
            >
              <span>Start Your Session</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-slate-200 px-6 py-4 text-sm font-medium transition-all"
            >
              <span>Explore Dashboard</span>
            </button>
          </div>

          {/* Trust points */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-sky-400" /> No wearable device required
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> 100% on-device optical processing
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-violet-400" /> Presage rPPG precision
            </span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-sky-400">Three-Step Closed-Loop Flow</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Designed for subtle, non-intrusive recovery
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            From optical microvascular measurement to resonant breathing pacing and cognitive focus tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="group relative rounded-3xl border border-white/[0.06] bg-slate-900/40 p-8 backdrop-blur-md transition-all hover:border-sky-500/30 hover:bg-slate-900/60">
            <div className="h-12 w-12 rounded-2xl bg-sky-950/60 border border-sky-800/40 flex items-center justify-center text-sky-400 mb-6 group-hover:scale-105 transition-transform">
              <Eye className="h-6 w-6" />
            </div>
            <span className="text-xs font-mono text-slate-500">01 / DETECTION</span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">Remote Photoplethysmography</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard camera pixels capture subtle sub-dermal color shifts caused by cardiac pulsatile blood flow across your forehead and malar regions.
            </p>
          </div>

          {/* Step 2 */}
          <div className="group relative rounded-3xl border border-white/[0.06] bg-slate-900/40 p-8 backdrop-blur-md transition-all hover:border-violet-500/30 hover:bg-slate-900/60">
            <div className="h-12 w-12 rounded-2xl bg-violet-950/60 border border-violet-800/40 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-105 transition-transform">
              <Heart className="h-6 w-6" />
            </div>
            <span className="text-xs font-mono text-slate-500">02 / INTERPRETATION</span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">Autonomic Stress & HRV</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time calculation of Heart Rate Variability (RMSSD) and respiratory cadence provides an accurate index of sympathetic arousal and cognitive fatigue.
            </p>
          </div>

          {/* Step 3 */}
          <div className="group relative rounded-3xl border border-white/[0.06] bg-slate-900/40 p-8 backdrop-blur-md transition-all hover:border-emerald-500/30 hover:bg-slate-900/60">
            <div className="h-12 w-12 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-105 transition-transform">
              <Wind className="h-6 w-6" />
            </div>
            <span className="text-xs font-mono text-slate-500">03 / REGULATION</span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">Resonant Biofeedback</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Targeted 60s–300s coherent breathing sessions guide you to 5.5 breaths per minute, stimulating vagal tone and resetting executive focus.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Guarantee Card */}
      <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 via-slate-900/40 to-[#070b14] p-8 sm:p-12 backdrop-blur-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Architectural Privacy Guarantee</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Your video stream never leaves your device memory
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              PulsePause processes camera frames strictly in ephemeral RAM buffers. Raw video frames are discarded immediately after optical signal extraction. We do not store, record, transmit, or train machine learning models on your video feed.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-slate-950/60 p-5 space-y-3 w-full lg:w-80 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Video Storage:</span>
              <span className="font-mono text-emerald-400 font-semibold">0 BYTES</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Processing Location:</span>
              <span className="font-mono text-sky-400 font-semibold">100% LOCAL DEVICE</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Telemetry Storage:</span>
              <span className="font-mono text-indigo-400 font-semibold">INDEXEDDB / ROOM</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
