import React, { useState } from 'react';
import {
  HelpCircle,
  Clock,
  Wind,
  Camera,
  Smartphone,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Laptop,
  CheckCircle2,
  Sparkles,
  Heart,
  Activity,
  AlertTriangle,
  Play
} from 'lucide-react';
import { ScreenId } from './Navigation';

interface HelpGuideScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const HelpGuideScreen: React.FC<HelpGuideScreenProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'focus' | 'sensing' | 'breathing' | 'mobile' | 'faq'>('quickstart');

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-semibold">
              Product Guide & Help Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            How to Use PulsePause
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Step-by-step instructions for optical human sensing, guided focus, respiration pacing, and mobile installation.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('focus')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-4 py-2 text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            <span>Start Focus Session</span>
          </button>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
        {[
          { id: 'quickstart', label: '1. Quick Start', icon: Sparkles },
          { id: 'focus', label: '2. Focus Sessions', icon: Clock },
          { id: 'sensing', label: '3. Camera & Sensing', icon: Camera },
          { id: 'breathing', label: '4. Guided Breathing', icon: Wind },
          { id: 'mobile', label: '5. Mobile Install', icon: Smartphone },
          { id: 'faq', label: '6. Privacy & FAQ', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-sky-500 text-white font-semibold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Quick Start */}
      {activeTab === 'quickstart' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sky-400" />
              <span>Welcome to PulsePause in 3 Steps</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/[0.06] bg-slate-950/40 p-5 space-y-3">
                <div className="h-9 w-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-mono font-bold text-sm">
                  1
                </div>
                <h4 className="text-sm font-bold text-white">Position Yourself</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sit facing your laptop or phone front camera in a naturally lit room. Keep your face centered at roughly arm's length (0.5m – 0.8m).
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-slate-950/40 p-5 space-y-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
                  2
                </div>
                <h4 className="text-sm font-bold text-white">Pick Your Goal</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Use <strong>Focus Session</strong> for deep work with posture & presence tracking, or tap <strong>Breathing</strong> for a 3-minute nervous system reset.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-slate-950/40 p-5 space-y-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono font-bold text-sm">
                  3
                </div>
                <h4 className="text-sm font-bold text-white">Review Your Analytics</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When you complete a session, see your <strong>Signal Availability %</strong>, Pulse BPM trends, and save session logs locally into IndexedDB.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Focus Sessions */}
      {activeTab === 'focus' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-sky-400" />
              <span>How Focus Sessions Work</span>
            </h3>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <p>
                Focus Sessions combine a countdown timer (15, 25, 45, or 60 minutes) with optical human sensing to objectively measure how much of the block you remained engaged at your workstation.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="rounded-2xl border border-white/[0.06] bg-slate-950/40 p-5 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    <span>Signal Availability %</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Calculated as <code>Valid Focused Seconds / Total Elapsed Seconds × 100</code>. If you look away, step out for coffee, or slouch out of frame, the app records a gap instead of fabricating data.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-slate-950/40 p-5 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Camera className="h-4 w-4 text-sky-400" />
                    <span>Picture-in-Picture Mini Cam</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    A small mini-viewport sits at the top right to verify your forehead ROI. You can tap <strong>"Hide Camera"</strong> anytime if you prefer a completely clean, zero-distraction screen!
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('focus')}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white px-5 py-2.5 text-xs font-semibold transition-all"
                >
                  <span>Go to Focus Sessions</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Camera & Sensing */}
      {activeTab === 'sensing' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Camera className="h-5 w-5 text-sky-400" />
              <span>Camera Positioning & Optical rPPG</span>
            </h3>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <p>
                PulsePause uses <strong>remote photoplethysmography (rPPG)</strong>. Every time your heart beats, blood pulses through the microvascular capillary bed of your forehead and facial tissues, creating subtle optical absorption variations invisible to the naked eye.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="rounded-2xl border border-white/[0.06] bg-slate-950/40 p-4 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-sky-400 font-bold">1. Forehead ROI</span>
                  <p className="text-xs text-slate-400">
                    Keep your upper face inside the red dashed box. The forehead has minimal hair and high capillary density, giving the cleanest pulse signal.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-slate-950/40 p-4 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">2. Frontal Lighting</span>
                  <p className="text-xs text-slate-400">
                    Face a window, desk lamp, or monitor light. Avoid strong backlights (e.g. sitting with your back to a bright window), which create glare.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-slate-950/40 p-4 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">3. Steady Posture</span>
                  <p className="text-xs text-slate-400">
                    Rest comfortably and minimize rapid head turns or chewing. Normal typing and reading will calibrate smoothly.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-sky-500/20 bg-sky-950/20 p-4 text-xs text-sky-200">
                <strong>Zero-Simulation Guarantee:</strong> If the camera is turned toward a wall, paper, or empty chair, the app immediately halts measurements and shows <code>--</code> with a <code>NO_FACE_DETECTED</code> advisory instead of generating fake numbers.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Guided Breathing */}
      {activeTab === 'breathing' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Wind className="h-5 w-5 text-emerald-400" />
              <span>Guided Breathing Patterns & Audio</span>
            </h3>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <p>
                Guided Breathing works <strong>with or without the camera</strong>. You can follow the glowing visual orb or close your eyes and breathe to harmonic audio chimes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="rounded-2xl border border-white/[0.06] bg-slate-950/40 p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Square / Box Breathing</span>
                    <span className="text-[10px] font-mono text-sky-400">4-4-4-4 Cadence</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    4s Inhale, 4s Hold, 4s Exhale, 4s Rest. Promotes mental clarity and composure before meetings or deep tasks.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-slate-950/40 p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Coherent Resonance</span>
                    <span className="text-[10px] font-mono text-emerald-400">5.5s Cadence</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    5.5s Inhale, 5.5s Exhale (5.5 breaths per min). Maximizes heart-rate variability (HRV) and cardiovascular synchrony.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-slate-950/40 p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Long Exhale (4-7-8)</span>
                    <span className="text-[10px] font-mono text-indigo-400">Vagal Stim</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    4s Inhale, 7s Hold, 8s Exhale. Activates the parasympathetic brake to slow a racing pulse.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-slate-950/40 p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Gentle Flow (4-6)</span>
                    <span className="text-[10px] font-mono text-purple-400">Smooth Pace</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    4s Inhale, 6s Exhale. Effortless, natural rhythm for a gentle mindfulness pause between calls.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('breathing')}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 text-xs font-semibold transition-all"
                >
                  <span>Open Guided Breathing Pacer</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Mobile Install */}
      {activeTab === 'mobile' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-sky-400" />
              <span>How to Install on Mobile (PWA)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Android */}
              <div className="rounded-2xl border border-white/[0.06] bg-slate-950/40 p-5 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <span>📱 Android (Google Chrome)</span>
                </div>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Open the shared web link in <strong>Chrome</strong>.</li>
                  <li>Tap the blue <strong>"Install App"</strong> button at the top, or tap the three dots (<code className="bg-slate-800 px-1 py-0.5 rounded">⋮</code>).</li>
                  <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>PulsePause will appear on your phone home screen with full offline capability!</li>
                </ol>
              </div>

              {/* iOS */}
              <div className="rounded-2xl border border-white/[0.06] bg-slate-950/40 p-5 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <span>🍏 iPhone (Apple Safari)</span>
                </div>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Open the shared web link in <strong>Safari</strong>.</li>
                  <li>Tap the <strong>Share</strong> button at the bottom (square with an up arrow).</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                  <li>Tap <strong>Add</strong> in the top right corner.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Privacy & FAQ */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span>Privacy Guarantee & Frequently Asked Questions</span>
            </h3>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/[0.06] bg-slate-950/40 p-4 space-y-1">
                <h4 className="text-sm font-bold text-white">Are my camera frames recorded or uploaded?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Never.</strong> Video frames are analyzed in transient device memory and discarded immediately. No video stream, screenshot, or biometric image is ever saved, logged to disk, or sent across the network.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-slate-950/40 p-4 space-y-1">
                <h4 className="text-sm font-bold text-white">Does PulsePause make stress or medical claims?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>No.</strong> Adhering strictly to scientific and competition guidelines, PulsePause presents only objective physiological observations (BPM, BrPM, HRV in ms, Signal Availability %). It does not diagnose medical conditions or infer subjective emotions.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-slate-950/40 p-4 space-y-1">
                <h4 className="text-sm font-bold text-white">How do I clear my session history?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Go to <strong>Settings & Privacy</strong> from the bottom footer. You can export all past sessions as JSON or click <strong>"Clear History"</strong> to wipe your local database instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
