import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Activity, Heart, ShieldAlert, Cpu, Laptop, Terminal } from 'lucide-react';
import { BiometricSample, WaveformPoint, BridgeConnectionState } from '@pulsepause/domain-models';

interface VitalsVisualizerProps {
  bridgeState: BridgeConnectionState;
  latestSample: BiometricSample | null;
  waveformHistory: WaveformPoint[];
}

export const VitalsVisualizer: React.FC<VitalsVisualizerProps> = ({
  bridgeState,
  latestSample,
  waveformHistory
}) => {
  const [selectedView, setSelectedView] = useState<'rppg' | 'hrv' | 'respiration'>('rppg');

  return (
    <div className="space-y-6">
      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pulse Rate */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">PULSE RATE (rPPG)</span>
            <Heart className="h-4 w-4 text-rose-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-white">
              {latestSample && latestSample.pulseRate > 0 ? Math.round(latestSample.pulseRate) : '--'}
            </span>
            <span className="text-xs font-mono text-rose-400">BPM</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {bridgeState.isConnected ? 'Native SmartSpectra optical stream' : 'Awaiting native engine connection'}
          </p>
        </div>

        {/* HRV RMSSD */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">HRV (RMSSD)</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-white">
              {latestSample && latestSample.hrvRmssd > 0 ? Math.round(latestSample.hrvRmssd) : '--'}
            </span>
            <span className="text-xs font-mono text-cyan-400">ms</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Vagal autonomic marker</p>
        </div>

        {/* Respiration */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">RESPIRATION</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-white">
              {latestSample && latestSample.respiratoryRate > 0 ? latestSample.respiratoryRate.toFixed(1) : '--'}
            </span>
            <span className="text-xs font-mono text-emerald-400">BrPM</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Thoracic / facial excursion</p>
        </div>

        {/* Signal Quality */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">SIGNAL CONFIDENCE</span>
            <Cpu className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-white">
              {latestSample ? `${Math.round(latestSample.confidence * 100)}%` : '--'}
            </span>
            <span className="text-xs font-mono text-amber-400">
              {latestSample ? latestSample.signalQuality : 'STANDBY'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Zero-simulation integrity</p>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Real-Time Optical Telemetry (Recharts Engine)
            </h3>
            <p className="text-xs text-slate-400">
              {bridgeState.isConnected
                ? 'High-frequency telemetry received via Electron contextBridge IPC'
                : 'Native bridge disconnected: Live camera vitals require PulsePause Desktop or Android'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedView('rppg')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedView === 'rppg' ? 'bg-rose-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              rPPG Pulse Wave
            </button>
            <button
              onClick={() => setSelectedView('respiration')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedView === 'respiration' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Respiratory Line
            </button>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-72 w-full pt-2">
          {waveformHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {selectedView === 'rppg' ? (
                <LineChart data={waveformHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="timeOffsetMs" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis domain={[-1, 1]} stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ppg"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              ) : (
                <AreaChart data={waveformHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="timeOffsetMs" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis domain={[-1, 1]} stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="respiration"
                    stroke="#10b981"
                    fill="#10b98122"
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
              <ShieldAlert className="h-8 w-8 text-cyan-400/80" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  No Active Optical Sensor Feed
                </p>
                <p className="text-xs text-slate-400 max-w-md">
                  In compliance with our zero-simulation architectural principle, we do not spoof or simulate false heart waveforms.
                </p>
              </div>
              <div className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-cyan-300 font-mono flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5" />
                <span>Launch Desktop Companion: npm run dev:desktop</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
