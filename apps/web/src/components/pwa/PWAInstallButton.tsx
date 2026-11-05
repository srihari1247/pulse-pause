import React, { useState } from 'react';
import { Download, Smartphone, X, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // If already installed, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop PWA flow
  if (isInstallable) {
    return (
      <>
        <button
          onClick={install}
          className={`flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-950/40 hover:bg-sky-900/50 text-sky-300 font-semibold transition-all active:scale-95 shadow-sm ${
            compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-xs'
          }`}
          title="Install PulsePause as a progressive web app"
        >
          <Smartphone className="h-3.5 w-3.5 text-sky-400" />
          <span>Install App</span>
        </button>
      </>
    );
  }

  // iOS Safari flow or informative install modal
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 font-medium transition-all ${
            compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-1.5 text-xs'
          }`}
        >
          <Download className="h-3.5 w-3.5 text-slate-400" />
          <span>Add to Home Screen</span>
        </button>

        {showGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl border border-white/[0.1] bg-[#0c1222] p-6 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Install on iOS / Safari
                  </h3>
                </div>
                <button
                  onClick={() => setShowGuide(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  1. Tap the <strong>Share</strong> button in the Safari toolbar.
                </p>
                <p>
                  2. Scroll down and tap <strong>Add to Home Screen</strong>.
                </p>
                <p>
                  3. Launch PulsePause directly from your iOS home screen as a standalone companion.
                </p>
              </div>

              {/* Platform limitation notice */}
              <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-semibold">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                  <span>Platform Sensing Disclosure</span>
                </div>
                <p className="text-[10px] text-amber-200/80 leading-normal">
                  The PWA operates in standalone companion mode (timer, audio, analytics). Camera-based SmartSpectra rPPG requires the native Android APK or Desktop app.
                </p>
              </div>

              <button
                onClick={() => setShowGuide(false)}
                className="w-full py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback info modal for Android Chrome or desktop when browser hides default prompt
  return (
    <>
      <button
        onClick={() => setShowGuide(true)}
        className={`flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 font-medium transition-all ${
          compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-1.5 text-xs'
        }`}
        title="PWA Install Info"
      >
        <Smartphone className="h-3.5 w-3.5 text-sky-400" />
        <span>Install PWA</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/[0.1] bg-[#0c1222] p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  PulsePause PWA Companion
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              PulsePause can be installed as a Progressive Web App on Android Chrome and desktop browsers. In Chrome, tap the <strong>three dots menu</strong> and select <strong>Install App</strong> or <strong>Add to Home screen</strong>.
            </p>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-950/20 p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-sky-300 text-xs font-semibold">
                <Sparkles className="h-4 w-4 text-sky-400" />
                <span>PWA Capabilities</span>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                <li>Standalone fullscreen focus companion & countdown timer</li>
                <li>Offline-first storage with local IndexedDB</li>
                <li>Full guided breathing suite with synthesized Web Audio soundscapes</li>
              </ul>
            </div>

            {/* Platform Limitation Notice */}
            <div className="rounded-2xl border border-amber-500/25 bg-amber-950/25 p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>Camera Sensing Platform Boundary</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                SmartSpectra requires native camera stream processing. To capture live pulse and breathing from video, install the official native Android APK or Electron Desktop client.
              </p>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
