import React, { useState, useEffect } from 'react';
import { Navigation, ScreenId } from './components/Navigation';
import { LandingScreen } from './components/LandingScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { LiveSensingScreen } from './components/LiveSensingScreen';
import { FocusSessionScreen } from './components/FocusSessionScreen';
import { BreathingScreen } from './components/BreathingScreen';
import { SessionSummaryScreen } from './components/SessionSummaryScreen';
import { SettingsPrivacyScreen } from './components/SettingsPrivacyScreen';
import { HelpGuideScreen } from './components/HelpGuideScreen';
import { bridgeClient } from './bridge/bridgeClient';
import { storage } from './storage/indexedDb';
import {
  BridgeConnectionState,
  BiometricSample,
  WaveformPoint,
  CameraDevice,
  WellnessSession,
  HumanSignal
} from '@pulsepause/domain-models';

import { OfflineIndicator } from './components/pwa/OfflineIndicator';

export function PulsePauseWebApp() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('landing');
  const [bridgeState, setBridgeState] = useState<BridgeConnectionState>(bridgeClient.getConnectionState());
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [latestSample, setLatestSample] = useState<HumanSignal | null>(null);
  const [waveformHistory, setWaveformHistory] = useState<WaveformPoint[]>([]);
  const [sessions, setSessions] = useState<WellnessSession[]>([]);
  const [activeCompletedSession, setActiveCompletedSession] = useState<WellnessSession | null>(null);

  const refreshSessions = async () => {
    try {
      const data = await storage.getAllSessions();
      setSessions(data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  useEffect(() => {
    // Detect bridge
    bridgeClient.detectEnvironment();
    setBridgeState(bridgeClient.getConnectionState());

    // List cameras
    bridgeClient.getAvailableCameras().then(setCameras);

    // Fetch initial sessions
    refreshSessions();

    // Subscribe to HumanSignalProvider events
    const unsubSignal = bridgeClient.onSignal((signal) => {
      setLatestSample(signal);
      if (signal.waveforms) {
        setWaveformHistory((prev) => {
          const next = [
            ...prev,
            {
              timeOffsetMs: signal.waveforms.timeOffsetMs,
              ppg: signal.waveforms.ppgSample,
              respiration: signal.waveforms.respirationSample
            }
          ];
          return next.length > 120 ? next.slice(-120) : next;
        });
      }
    });

    const unsubStatus = bridgeClient.onStatusChange(() => {
      setBridgeState(bridgeClient.getConnectionState());
    });

    return () => {
      unsubSignal();
      unsubStatus();
    };
  }, []);

  const handleSessionComplete = (session: WellnessSession) => {
    setActiveCompletedSession(session);
    refreshSessions();
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white antialiased">
      {/* 3-Zone Top Navigation Bar & Mobile Bottom Bar */}
      <Navigation
        currentScreen={currentScreen}
        onNavigate={(screen) => {
          setCurrentScreen(screen);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isNativeConnected={bridgeState.isConnected}
      />

      {/* Offline PWA Resilience Indicator */}
      <OfflineIndicator />

      {/* Main Content Viewport with mobile bottom bar clearance */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
        {currentScreen === 'landing' && (
          <LandingScreen onNavigate={(screen) => setCurrentScreen(screen)} />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            recentSessions={sessions}
          />
        )}

        {currentScreen === 'sensing' && (
          <LiveSensingScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            bridgeState={bridgeState}
            cameras={cameras}
            latestSample={latestSample}
            waveformHistory={waveformHistory}
          />
        )}

        {currentScreen === 'focus' && (
          <FocusSessionScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            bridgeState={bridgeState}
            onSessionComplete={handleSessionComplete}
          />
        )}

        {currentScreen === 'breathing' && (
          <BreathingScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            onSessionComplete={handleSessionComplete}
          />
        )}

        {currentScreen === 'summary' && (
          <SessionSummaryScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            session={activeCompletedSession || (sessions.length > 0 ? sessions[0] : null)}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsPrivacyScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            cameras={cameras}
            bridgeState={bridgeState}
            onHistoryCleared={() => refreshSessions()}
          />
        )}

        {currentScreen === 'help' && (
          <HelpGuideScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        )}
      </main>

      {/* Clean, Restrained Footer */}
      <footer className="border-t border-white/[0.04] bg-[#070b14]/80 py-8 px-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-slate-400">PulsePause</span>
            <span>·</span>
            <span>Camera-Based Human Sensing Companion</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentScreen('help')}
              className="text-sky-400 hover:text-sky-300 font-semibold transition-colors"
            >
              How to Use (Help)
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentScreen('settings')}
              className="hover:text-slate-300 transition-colors"
            >
              Privacy Architecture
            </button>
            <span>·</span>
            <span className="text-emerald-400">100% On-Device Processing</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PulsePauseWebApp;
