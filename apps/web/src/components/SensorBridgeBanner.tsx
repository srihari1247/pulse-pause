import React from 'react';
import { Laptop, Smartphone, AlertCircle, CheckCircle2, Terminal, ExternalLink } from 'lucide-react';
import { BridgeConnectionState } from '@pulsepause/domain-models';

interface SensorBridgeBannerProps {
  bridgeState: BridgeConnectionState;
  onOpenSettings: () => void;
}

export const SensorBridgeBanner: React.FC<SensorBridgeBannerProps> = ({
  bridgeState,
  onOpenSettings
}) => {
  if (bridgeState.isConnected) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-emerald-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                Native Sensing Engine Connected
              </p>
              <p className="text-xs text-emerald-400/90">
                Streaming uncompressed camera frames via {bridgeState.deviceLabel} (Latency: {bridgeState.latencyMs}ms)
              </p>
            </div>
          </div>
          <span className="rounded-md bg-emerald-900/50 border border-emerald-700/50 px-2 py-0.5 text-[11px] font-mono text-emerald-300">
            rPPG ACTIVE
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-cyan-900/40 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-cyan-950/30 p-4 sm:p-5 shadow-xl shadow-cyan-950/10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400"></span>
            <h3 className="text-sm font-semibold tracking-wide text-cyan-200 uppercase">
              Native Sensor Engine Specification
            </h3>
            <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-mono text-slate-300">
              Zero-Simulation Production Mode
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            <strong className="text-white">Presage SmartSpectra SDK</strong> runs exclusively on native runtimes (
            <span className="text-cyan-300 font-medium">PulsePause Desktop Electron</span> with official <code className="text-[11px] font-mono bg-slate-950/60 px-1 py-0.5 rounded text-cyan-200">@smartspectra/node-sdk</code> or <span className="text-emerald-300 font-medium">PulsePause Android</span> with <code className="text-[11px] font-mono bg-slate-950/60 px-1 py-0.5 rounded text-emerald-200">com.presagetech:smartspectra</code>). 
            Optical rPPG requires hardware-direct, uncompressed frame processing. In standalone web mode, PulsePause operates as a session controller, pacer, camera framing check, and analytics viewer without fabricating fake biometric telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-300">
            <Laptop className="h-4 w-4 text-cyan-400" />
            <span>Desktop: <code className="font-mono text-cyan-300">npm run dev:desktop</code></span>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-300">
            <Smartphone className="h-4 w-4 text-emerald-400" />
            <span>Android: <code className="font-mono text-emerald-300">./gradlew assembleDebug</code></span>
          </div>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 text-xs font-semibold shadow-md shadow-cyan-950 transition-colors"
          >
            <span>Bridge Config</span>
          </button>
        </div>
      </div>
    </div>
  );
};
