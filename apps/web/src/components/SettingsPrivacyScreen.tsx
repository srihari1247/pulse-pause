import React, { useState, useEffect } from 'react';
import { ShieldCheck, Camera, Database, Trash2, Key, Check, Info, Lock, EyeOff, Laptop, Smartphone } from 'lucide-react';
import { ScreenId } from './Navigation';
import { CameraDevice, BridgeConnectionState } from '@pulsepause/domain-models';
import { storage } from '../storage/indexedDb';

interface SettingsPrivacyScreenProps {
  onNavigate: (screen: ScreenId) => void;
  cameras: CameraDevice[];
  bridgeState: BridgeConnectionState;
  onHistoryCleared: () => void;
}

export const SettingsPrivacyScreen: React.FC<SettingsPrivacyScreenProps> = ({
  onNavigate,
  cameras,
  bridgeState,
  onHistoryCleared
}) => {
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [retentionPeriod, setRetentionPeriod] = useState<string>('90');
  const [apiKey, setApiKey] = useState<string>('');
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [sessionCount, setSessionCount] = useState<number>(0);

  useEffect(() => {
    if (cameras.length > 0) {
      setSelectedCamera(cameras[0].id);
    }
    const savedKey = localStorage.getItem('pulsepause_smartspectra_key') || '';
    const savedRet = localStorage.getItem('pulsepause_retention_days') || '90';
    setApiKey(savedKey);
    setRetentionPeriod(savedRet);

    storage.getAllSessions().then((s) => setSessionCount(s.length));
  }, [cameras]);

  const handleSaveSettings = () => {
    localStorage.setItem('pulsepause_smartspectra_key', apiKey);
    localStorage.setItem('pulsepause_retention_days', retentionPeriod);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 1500);
  };

  const handleClearHistory = async () => {
    try {
      const allSessions = await storage.getAllSessions();
      for (const s of allSessions) {
        await storage.deleteSession(s.id);
      }
      setSessionCount(0);
      setDeleteModalOpen(false);
      onHistoryCleared();
    } catch (err) {
      console.error('Error clearing history:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      {/* Header */}
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-semibold">
          Governance & Device Controls
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Settings & Privacy
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your camera permissions, local storage retention, and Presage SmartSpectra SDK configuration.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Camera Hardware & Optical Permissions */}
        <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-sky-950/60 border border-sky-800/40 flex items-center justify-center text-sky-400 shrink-0">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Camera Hardware & Optical Framing</h3>
              <p className="text-xs text-slate-400">
                PulsePause requires camera access solely for on-device optical microvascular analysis.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Selected Video Device</label>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="w-full rounded-2xl border border-white/[0.08] bg-slate-950 px-4 py-3 text-xs text-white focus:border-sky-500 focus:outline-none"
              >
                {cameras.length > 0 ? (
                  cameras.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.name || 'Default Camera'}
                    </option>
                  ))
                ) : (
                  <option value="">FaceTime HD / Standard Webcam</option>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Presage SmartSpectra API Key</label>
              <input
                type="password"
                placeholder="psg_live_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full rounded-2xl border border-white/[0.08] bg-slate-950 px-4 py-3 font-mono text-xs text-white placeholder-slate-600 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Data Retention & Local Storage */}
        <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400 shrink-0">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Local Storage & Session History</h3>
              <p className="text-xs text-slate-400">
                All session recordings, pulse trends, and coherence scores remain stored exclusively in your browser's IndexedDB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">History Retention Period</label>
              <select
                value={retentionPeriod}
                onChange={(e) => setRetentionPeriod(e.target.value)}
                className="w-full rounded-2xl border border-white/[0.08] bg-slate-950 px-4 py-3 text-xs text-white focus:border-sky-500 focus:outline-none"
              >
                <option value="30">30 Days (Automatic Pruning)</option>
                <option value="90">90 Days (Quarterly Audit)</option>
                <option value="365">1 Year (Longitudinal Analysis)</option>
                <option value="forever">Forever (Keep All Local History)</option>
              </select>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total Stored Sessions</span>
                <span className="font-mono text-xl font-bold text-white">{sessionCount} Records</span>
              </div>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-900/60 bg-rose-950/30 text-rose-300 text-xs font-medium hover:bg-rose-900/50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete History</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: SDK Telemetry & Privacy Disclosure */}
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 via-slate-900/40 to-[#070b14] p-6 sm:p-8 backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-white">SmartSpectra Telemetry Disclosure</h3>
              <p className="text-xs text-emerald-300/80">Zero-Simulation Integrity & Privacy Architecture</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <p>
              • <strong>Ephemeral Memory:</strong> Frame byte buffers are decoded in volatile heap memory and discarded immediately after rPPG signal decomposition.
            </p>
            <p>
              • <strong>No Cloud Streaming:</strong> Video frames never leave your computer or mobile device. No central servers ever receive optical data.
            </p>
            <p>
              • <strong>Native Runtime Decoupling:</strong> PulsePause uses the official <code className="font-mono text-sky-300">@smartspectra/node-sdk</code> on Desktop (Electron) and <code className="font-mono text-emerald-300">com.presagetech:smartspectra</code> on Android. The browser web shell provides UI visualization and session coordination without fabricating synthetic vitals.
            </p>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-8 py-3.5 text-xs font-bold shadow-lg shadow-sky-950/40 transition-all active:scale-[0.98]"
          >
            {saveSuccess ? (
              <>
                <Check className="h-4 w-4" />
                <span>Preferences Saved!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Clearing History */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-rose-900/60 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Delete All Session History?</h3>
              <p className="text-xs text-slate-400">
                This will permanently remove all {sessionCount} session records and biometric samples from your local IndexedDB storage. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-white/[0.08] text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950"
              >
                Permanently Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
