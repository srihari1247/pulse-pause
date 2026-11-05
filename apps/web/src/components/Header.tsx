import React from 'react';
import { Activity, ShieldCheck, Laptop, Smartphone, Settings, BarChart2, BookOpen, Clock, Heart } from 'lucide-react';
import { BridgeConnectionState } from '@pulsepause/domain-models';

interface HeaderProps {
  activeTab: 'session' | 'vitals' | 'pacer' | 'history' | 'architecture';
  setActiveTab: (tab: 'session' | 'vitals' | 'pacer' | 'history' | 'architecture') => void;
  bridgeState: BridgeConnectionState;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  bridgeState,
  onOpenSettings
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 via-rose-600 to-cyan-500 p-[1px] shadow-lg shadow-rose-950/50">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-slate-950">
              <Heart className="h-5 w-5 text-rose-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white font-sans">PulsePause</span>
              <span className="rounded-md bg-cyan-950/70 border border-cyan-800/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                Presage SmartSpectra
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Optical Human-Sensing Wellness & Focus</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800/80 text-xs font-medium">
          <button
            onClick={() => setActiveTab('session')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'session'
                ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Session Runner</span>
          </button>

          <button
            onClick={() => setActiveTab('pacer')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'pacer'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Coherent Pacer</span>
          </button>

          <button
            onClick={() => setActiveTab('vitals')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'vitals'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>Vitals Waveforms</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>History (IndexedDB)</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'architecture'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Architecture & SDK</span>
          </button>
        </nav>

        {/* Status Chip & Settings */}
        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-mono transition-colors ${
              bridgeState.isConnected
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                : 'border-slate-800 bg-slate-900/60 text-slate-400'
            }`}
            title={bridgeState.deviceLabel}
          >
            {bridgeState.isConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Laptop className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline font-sans text-xs">Node SDK Bridge</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500/80"></span>
                <span className="hidden sm:inline font-sans text-xs">Web Companion Mode</span>
              </>
            )}
          </div>

          <button
            onClick={onOpenSettings}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
            title="Settings & SDK Configuration"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="flex md:hidden border-t border-slate-800/60 bg-slate-950 px-2 py-1.5 overflow-x-auto gap-1 text-xs">
        <button
          onClick={() => setActiveTab('session')}
          className={`px-3 py-1 rounded-md shrink-0 ${activeTab === 'session' ? 'bg-rose-600 text-white font-medium' : 'text-slate-400'}`}
        >
          Session
        </button>
        <button
          onClick={() => setActiveTab('pacer')}
          className={`px-3 py-1 rounded-md shrink-0 ${activeTab === 'pacer' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400'}`}
        >
          Pacer
        </button>
        <button
          onClick={() => setActiveTab('vitals')}
          className={`px-3 py-1 rounded-md shrink-0 ${activeTab === 'vitals' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400'}`}
        >
          Vitals
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-1 rounded-md shrink-0 ${activeTab === 'history' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'}`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-3 py-1 rounded-md shrink-0 ${activeTab === 'architecture' ? 'bg-amber-600 text-white font-medium' : 'text-slate-400'}`}
        >
          Architecture
        </button>
      </div>
    </header>
  );
};
