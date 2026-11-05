import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff, Sun, UserCheck, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';
import { CameraDeviceInfo } from '@pulsepause/domain-models';

interface CameraFramingGuideProps {
  cameras: CameraDeviceInfo[];
}

export const CameraFramingGuide: React.FC<CameraFramingGuideProps> = ({ cameras }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (cameras.length > 0 && !selectedCameraId) {
      setSelectedCameraId(cameras[0].deviceId);
    }
  }, [cameras, selectedCameraId]);

  const startPreview = async (deviceId?: string) => {
    try {
      setCameraError(null);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'user' },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to access camera hardware';
      setCameraError(msg);
      setStreamActive(false);
    }
  };

  const stopPreview = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  useEffect(() => {
    return () => {
      stopPreview();
    };
  }, []);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Camera className="h-4 w-4 text-cyan-400" />
            <span>Optical Framing & Positioning Diagnostic</span>
          </h3>
          <p className="text-xs text-slate-400">
            SmartSpectra rPPG requires stable face alignment and balanced illumination on forehead/malar regions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {streamActive ? (
            <button
              onClick={stopPreview}
              className="flex items-center gap-1.5 rounded-lg border border-rose-800 bg-rose-950/50 hover:bg-rose-900/50 text-rose-300 px-3 py-1.5 text-xs font-medium transition-colors"
            >
              <CameraOff className="h-3.5 w-3.5" />
              <span>Turn Off Preview</span>
            </button>
          ) : (
            <button
              onClick={() => startPreview(selectedCameraId)}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 text-xs font-semibold shadow-md transition-colors"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Test Camera Framing</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Viewport Frame */}
        <div className="lg:col-span-7">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center">
            {streamActive ? (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="h-full w-full object-cover transform -scale-x-100"
                />
                
                {/* Optical Alignment Reticle Overlay */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  {/* Face Oval Guide */}
                  <div className="relative h-[75%] w-[50%] rounded-[48%] border-2 border-dashed border-cyan-400/70 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex flex-col items-center justify-between p-4">
                    {/* Forehead rPPG Target Region */}
                    <div className="w-[70%] h-12 rounded-lg border border-rose-400/80 bg-rose-500/10 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300 font-semibold">
                        Forehead rPPG ROI
                      </span>
                    </div>

                    {/* Malar / Cheek Region */}
                    <div className="w-full flex justify-between px-2">
                      <span className="text-[9px] font-mono text-cyan-300/80 bg-slate-950/60 px-1 rounded">Malar L</span>
                      <span className="text-[9px] font-mono text-cyan-300/80 bg-slate-950/60 px-1 rounded">Malar R</span>
                    </div>

                    {/* Chin Rest Guide */}
                    <div className="w-16 h-1 border-b-2 border-cyan-400/80 mb-2"></div>
                  </div>
                </div>

                <div className="absolute top-3 left-3 rounded-md bg-slate-950/80 border border-slate-800 px-2 py-1 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>LIVE HARDWARE FEED</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <Camera className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">Camera Preview Standby</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                    Click 'Test Camera Framing' to inspect ambient lighting and face position before starting a PulsePause session.
                  </p>
                </div>
                {cameraError && (
                  <div className="rounded-lg border border-rose-900/60 bg-rose-950/40 p-2.5 text-xs text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quality Guidelines Card */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Presage Optical Quality Checklist
            </h4>

            <div className="space-y-2">
              <div className="flex items-start gap-2.5 rounded-lg border border-slate-800/80 bg-slate-950/50 p-2.5">
                <Sun className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-200">Balanced Frontal Light</p>
                  <p className="text-[11px] text-slate-400">
                    Avoid harsh backlights (e.g. windows behind you) which create shadow artifacts on facial capillaries.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-slate-800/80 bg-slate-950/50 p-2.5">
                <UserCheck className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-200">Optimal Head Distance (0.5m - 0.9m)</p>
                  <p className="text-[11px] text-slate-400">
                    Position yourself so your face covers ~40–50% of the frame. Forehead should be unobstructed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-slate-800/80 bg-slate-950/50 p-2.5">
                <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-200">Stillness & Postural Stability</p>
                  <p className="text-[11px] text-slate-400">
                    Excessive talking or abrupt head turns corrupt the microvascular chromatic signal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-cyan-950/60 bg-cyan-950/20 p-3 text-xs text-cyan-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>Camera frames remain completely local in device RAM</span>
            </div>
            <span className="font-mono text-[10px] text-cyan-400/80">100% PRIVATE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
