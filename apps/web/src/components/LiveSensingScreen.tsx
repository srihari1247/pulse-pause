import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  CameraOff,
  Heart,
  Wind,
  Activity,
  ShieldCheck,
  Sun,
  UserCheck,
  AlertTriangle,
  Play,
  Pause,
  Square,
  Sparkles,
  AlertCircle,
  Laptop,
  CheckCircle2
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ScreenId } from './Navigation';
import {
  HumanSignal,
  WaveformPoint,
  BridgeConnectionState,
  CameraDevice,
  ValidationReport,
  PipelineProcessingStatus,
  PreviewFrame
} from '@pulsepause/domain-models';
import { signalProvider } from '../bridge/bridgeClient';

interface LiveSensingScreenProps {
  onNavigate: (screen: ScreenId) => void;
  bridgeState: BridgeConnectionState;
  cameras: CameraDevice[];
  latestSample: unknown;
  waveformHistory: WaveformPoint[];
}

export const LiveSensingScreen: React.FC<LiveSensingScreenProps> = ({
  onNavigate,
  bridgeState,
  cameras: initialCameras,
  waveformHistory
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Live SmartSpectra Signal Provider state
  const [pipelineStatus, setPipelineStatus] = useState<PipelineProcessingStatus>(signalProvider.getStatus());
  const [currentSignal, setCurrentSignal] = useState<HumanSignal | null>(null);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [sdkPreviewFrame, setSdkPreviewFrame] = useState<PreviewFrame | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>(initialCameras);

  useEffect(() => {
    signalProvider.getAvailableCameras().then((cams) => {
      setDevices(cams);
      if (cams.length > 0 && !selectedCameraId) {
        setSelectedCameraId(cams[0].id);
      }
    });

    const unsubSignal = signalProvider.onSignal((sig) => {
      setCurrentSignal(sig);
    });

    const unsubValidation = signalProvider.onValidation((rep) => {
      setValidationReport(rep);
    });

    const unsubStatus = signalProvider.onStatusChange((st) => {
      setPipelineStatus(st);
    });

    const unsubPreview = signalProvider.onPreviewFrame((frame) => {
      setSdkPreviewFrame(frame);
    });

    return () => {
      unsubSignal();
      unsubValidation();
      unsubStatus();
      unsubPreview();
    };
  }, [selectedCameraId]);

  const handleStartSensing = async () => {
    try {
      setCameraError(null);
      // Explicitly request browser camera stream
      await startBrowserCamera(selectedCameraId);
      await signalProvider.start({
        camera: { type: 'byId', id: selectedCameraId, width: 1280, height: 720, fps: 30 }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCameraError(msg);
      // Fallback: alert or log browser permission block
      console.warn('Camera permission request error:', msg);
    }
  };

  const handlePauseSensing = async () => {
    await signalProvider.pause();
  };

  const handleResumeSensing = async () => {
    await signalProvider.resume();
  };

  const handleStopSensing = async () => {
    await signalProvider.stop();
    stopBrowserCamera();
  };

  const startBrowserCamera = async (deviceId?: string) => {
    try {
      setCameraError(null);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
      
      // Use clean constraints that work across all desktop and mobile webcams
      const videoConstraints: MediaTrackConstraints = deviceId && !deviceId.startsWith('webcam-')
        ? { deviceId: { ideal: deviceId } }
        : { facingMode: 'user' };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Auto-play issue, playing muted:', playErr);
        }
        setStreamActive(true);
        signalProvider.attachVideoElement(videoRef.current);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Camera stream error:', err);
      setCameraError(`Camera access: ${msg}. Please check browser camera permissions.`);
      setStreamActive(false);
    }
  };

  const stopBrowserCamera = () => {
    signalProvider.attachVideoElement(null);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  useEffect(() => {
    return () => {
      stopBrowserCamera();
    };
  }, []);

  const isRunning = pipelineStatus === 'RUNNING';
  const isPaused = pipelineStatus === 'PAUSED';

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-semibold">
            Presage SmartSpectra SDK
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Live Sensing & Diagnostics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time optical rPPG extraction, respiratory tracking, and continuous signal validation.
          </p>
        </div>

        {/* Start / Pause / Stop Controls */}
        <div className="flex items-center gap-2">
          {pipelineStatus === 'IDLE' || pipelineStatus === 'ERROR' ? (
            <button
              onClick={handleStartSensing}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-5 py-2.5 text-xs font-semibold shadow-lg shadow-sky-950/40 transition-all active:scale-[0.98]"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Start Sensing</span>
            </button>
          ) : (
            <>
              {isRunning && (
                <button
                  onClick={handlePauseSensing}
                  className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 text-xs font-semibold transition-all"
                >
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </button>
              )}
              {isPaused && (
                <button
                  onClick={handleResumeSensing}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-semibold transition-all"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>Resume</span>
                </button>
              )}
              <button
                onClick={handleStopSensing}
                className="flex items-center gap-2 rounded-xl border border-rose-800/60 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 px-4 py-2 text-xs font-semibold transition-all"
              >
                <Square className="h-4 w-4" />
                <span>Stop</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Validation Warning Callout (If lighting, motion or positioning is impaired) */}
      {validationReport && validationReport.status !== 'VALID' && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 text-amber-200 animate-fadeIn">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Validation Advisory: {validationReport.status.replace(/_/g, ' ')}
              </h4>
              <ul className="text-xs text-amber-200/90 list-disc list-inside space-y-0.5">
                {validationReport.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
              {validationReport.recommendations.length > 0 && (
                <p className="text-[11px] text-amber-400 mt-1 font-medium">
                  Recommendation: {validationReport.recommendations[0]}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {cameraError && (
        <div className="rounded-2xl border border-rose-900/60 bg-rose-950/40 p-4 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Platform Architecture & Native Sensing Notice */}
      <div className="rounded-2xl border border-sky-500/25 bg-sky-950/20 p-4 text-xs text-sky-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Laptop className="h-4 w-4 text-sky-400 shrink-0" />
          <span>
            <strong>Native Sensing Architecture:</strong> Hardware camera rPPG runs natively via the <strong>PulsePause Android App</strong> (Kotlin + CameraX) and <strong>Desktop App</strong> (Electron + Node.js SDK). The Web PWA operates in companion dashboard mode.
          </span>
        </div>
      </div>

      {/* Main Grid: Camera Viewport + Live Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Camera Viewport with Optical Reticle (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-white/[0.08] bg-slate-900/60 p-4 sm:p-6 backdrop-blur-xl space-y-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-[#050811] flex items-center justify-center">
            {/* Always mounted video element so videoRef.current is ready immediately */}
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className={`h-full w-full object-cover transform -scale-x-100 ${
                streamActive && !sdkPreviewFrame?.dataUrl ? 'block' : 'hidden'
              }`}
            />

            {sdkPreviewFrame?.dataUrl ? (
              <img
                src={sdkPreviewFrame.dataUrl}
                alt="SmartSpectra Native Camera Preview"
                className="h-full w-full object-cover transform -scale-x-100"
              />
            ) : !streamActive ? (
              <div className="text-center p-8 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-sky-400 mx-auto">
                  <Camera className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Camera Viewport Standby</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Grant camera permission to stream your front camera for optical framing and rPPG telemetry preview.
                  </p>
                </div>
                <button
                  onClick={handleStartSensing}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-5 py-2.5 text-xs font-semibold shadow-lg shadow-sky-950/40 transition-all active:scale-95 cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  <span>Request Camera Permission & Start</span>
                </button>
              </div>
            ) : null}

            {/* Optical Alignment Reticle Overlay */}
            {(streamActive || sdkPreviewFrame) && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-[78%] w-[52%] rounded-[48%] border-2 border-dashed border-sky-400/60 shadow-[0_0_30px_rgba(56,189,248,0.2)] flex flex-col items-center justify-between p-4">
                  {/* Forehead rPPG Target Zone */}
                  <div className="w-[74%] h-14 rounded-xl border border-rose-400/80 bg-rose-500/10 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300 font-semibold">
                      Forehead rPPG ROI
                    </span>
                  </div>

                  {/* Malar / Cheek Microvascular Zone */}
                  <div className="w-full flex justify-between px-3">
                    <span className="text-[9px] font-mono text-sky-300/80 bg-slate-950/70 px-1.5 py-0.5 rounded">
                      Malar L
                    </span>
                    <span className="text-[9px] font-mono text-sky-300/80 bg-slate-950/70 px-1.5 py-0.5 rounded">
                      Malar R
                    </span>
                  </div>

                  <div className="w-16 h-1 border-b-2 border-sky-400/80 mb-2" />
                </div>
              </div>
            )}

            <div className="absolute top-4 left-4 rounded-full bg-slate-950/80 border border-white/[0.08] px-3 py-1 text-[11px] font-mono flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span className="text-white">STATUS: {pipelineStatus}</span>
            </div>
          </div>

          {/* Camera Selector Dropdown */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 shrink-0">Optical Device:</span>
            <select
              value={selectedCameraId}
              onChange={(e) => {
                setSelectedCameraId(e.target.value);
                signalProvider.selectCamera({ type: 'byId', id: e.target.value });
              }}
              className="w-full rounded-xl border border-white/[0.08] bg-slate-950 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
            >
              {devices.map((cam) => (
                <option key={cam.id} value={cam.id}>
                  {cam.name} ({cam.facing})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Metrics & Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Card 1: Pulse Rate */}
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Pulse Rate (rPPG)
              </span>
              <Heart className="h-5 w-5 text-rose-500 animate-pulse" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-4xl sm:text-5xl font-extrabold text-white">
                {currentSignal?.pulse && currentSignal.pulse.isReliable
                  ? Math.round(currentSignal.pulse.bpm)
                  : '--'}
              </span>
              <span className="font-mono text-sm text-rose-400">BPM</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {currentSignal?.pulse
                ? currentSignal.pulse.isReliable
                  ? `Reliable measurement (Confidence: ${Math.round(currentSignal.pulse.confidence * 100)}%)`
                  : 'Measurement calibrating / unreliable'
                : 'Measurement unavailable (no simulated data)'}
            </p>
          </div>

          {/* Card 2: Respiration Rate & HRV */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-5 backdrop-blur-xl">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Respiration
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-mono text-3xl font-extrabold text-white">
                  {currentSignal?.breathing && currentSignal.breathing.isReliable
                    ? currentSignal.breathing.brpm.toFixed(1)
                    : '--'}
                </span>
                <span className="text-xs font-mono text-emerald-400">BrPM</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {currentSignal?.breathing?.isReliable ? 'Thoracic synchrony' : 'Calibrating'}
              </p>
            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-5 backdrop-blur-xl">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                HRV (RMSSD)
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-mono text-3xl font-extrabold text-white">
                  {currentSignal?.hrv && currentSignal.hrv.isReliable
                    ? Math.round(currentSignal.hrv.rmssd)
                    : '--'}
                </span>
                <span className="text-xs font-mono text-sky-400">ms</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Vagal recovery index</p>
            </div>
          </div>

          {/* Card 3: Signal Quality & Engine Status */}
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-5 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Signal Quality</span>
              <span
                className={`font-mono font-semibold ${
                  currentSignal?.quality === 'OPTIMAL'
                    ? 'text-emerald-400'
                    : currentSignal?.quality === 'DEGRADED'
                    ? 'text-amber-400'
                    : 'text-slate-500'
                }`}
              >
                {currentSignal?.quality || 'UNAVAILABLE'}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  currentSignal?.quality === 'OPTIMAL'
                    ? 'bg-emerald-400 w-full'
                    : currentSignal?.quality === 'DEGRADED'
                    ? 'bg-amber-400 w-2/3'
                    : 'bg-slate-700 w-1/4'
                }`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Source: {currentSignal?.source || 'STANDALONE_WEB'}</span>
              <span className={isRunning ? 'text-emerald-400' : 'text-slate-500'}>
                {isRunning ? 'PIPELINE RUNNING' : 'STANDBY'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Animated rPPG Pulse Waveform Chart */}
      <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Real-Time rPPG Microvascular Waveform
            </h3>
            <p className="text-xs text-slate-400">
              Sub-dermal capillary chromatic reflection extracted directly by SmartSpectra.
            </p>
          </div>
          <span className="rounded-full bg-sky-950/60 border border-sky-800/40 px-3 py-1 text-xs font-mono text-sky-300">
            30 FPS CAPTURE
          </span>
        </div>

        <div className="h-60 w-full pt-2">
          {waveformHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={waveformHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeOffsetMs" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[-1, 1]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                />
                <Line
                  type="monotone"
                  dataKey="ppg"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 bg-slate-950/30 rounded-2xl border border-dashed border-white/[0.06]">
              <Sparkles className="h-6 w-6 text-sky-400/80" />
              <p className="text-xs font-semibold text-white">Live Waveform Standby</p>
              <p className="text-[11px] text-slate-400 max-w-sm">
                Optical rPPG requires uncompressed camera buffers via PulsePause Desktop (Electron) or Android companion.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
