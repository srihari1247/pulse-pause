import React, { useState, useEffect } from 'react';
import { X, Key, Sliders, Database, Check, Shield } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [fps, setFps] = useState<number>(30);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(75);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('pulsepause_smartspectra_key') || '';
      const savedFps = Number(localStorage.getItem('pulsepause_target_fps')) || 30;
      setApiKey(savedKey);
      setFps(savedFps);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('pulsepause_smartspectra_key', apiKey);
    localStorage.setItem('pulsepause_target_fps', fps.toString());
    localStorage.setItem('pulsepause_min_confidence', confidenceThreshold.toString());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              SmartSpectra Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* API Key */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Presage SmartSpectra API Key</label>
            <input
              type="password"
              placeholder="psg_live_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">
              Obtain credentials from the Presage Technologies Developer Portal.
            </p>
          </div>

          {/* FPS Target */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Optical Frame Acquisition Rate</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFps(30)}
                className={`py-2 px-3 rounded-lg border font-mono text-xs font-semibold ${
                  fps === 30
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                30 FPS (Standard)
              </button>
              <button
                type="button"
                onClick={() => setFps(60)}
                className={`py-2 px-3 rounded-lg border font-mono text-xs font-semibold ${
                  fps === 60
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                60 FPS (High-Precision)
              </button>
            </div>
          </div>

          {/* Confidence Threshold */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="text-slate-300 font-semibold">Quality Confidence Floor</label>
              <span className="font-mono text-cyan-400">{confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          {/* Privacy Note */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-[11px] text-slate-400 flex items-start gap-2">
            <Shield className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              All credentials and biometric telemetry remain stored locally on your device in IndexedDB.
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-950 transition-colors"
          >
            {savedSuccess ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
