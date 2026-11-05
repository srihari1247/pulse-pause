/**
 * PulsePause Shared Domain Models: Human Signal & Provider Specification
 * Canonical platform-independent contracts matching the official Presage SmartSpectra SDK
 */

export type SignalQualityState = 'OPTIMAL' | 'DEGRADED' | 'UNRELIABLE' | 'UNAVAILABLE';

export type PipelineProcessingStatus = 
  | 'IDLE' 
  | 'STARTING' 
  | 'RUNNING' 
  | 'PAUSED' 
  | 'STOPPING' 
  | 'ERROR';

export type ValidationStatusFlag =
  | 'VALID'
  | 'INSUFFICIENT_LIGHTING'
  | 'EXCESSIVE_MOTION'
  | 'POOR_FACE_POSITIONING'
  | 'NO_FACE_DETECTED'
  | 'CALIBRATING';

export interface PulseReading {
  bpm: number;
  confidence: number; // 0.0 - 1.0
  isReliable: boolean;
  minBpm?: number;
  maxBpm?: number;
}

export interface BreathingReading {
  brpm: number;
  confidence: number; // 0.0 - 1.0
  isReliable: boolean;
  respiratoryLineLength?: number;
  depthCategory?: 'DEEP' | 'NORMAL' | 'SHALLOW';
}

export interface HrvReading {
  rmssd: number;
  sdnn?: number;
  isReliable: boolean;
}

export interface SignalWaveforms {
  ppgSample: number; // Normalized rPPG point (-1.0 to 1.0)
  respirationSample: number; // Normalized thoracic/facial point (-1.0 to 1.0)
  timeOffsetMs: number;
}

export interface ValidationReport {
  status: ValidationStatusFlag;
  lighting: 'OPTIMAL' | 'UNDEREXPOSED' | 'OVEREXPOSED' | 'UNEVEN';
  motion: 'STABLE' | 'MODERATE_MOTION' | 'EXCESSIVE_MOTION';
  positioning: 'CENTERED' | 'TOO_CLOSE' | 'TOO_FAR' | 'OFF_CENTER';
  faceDetected: boolean;
  confidence: number;
  reasons: string[];
  recommendations: string[];
}

export interface HumanSignal {
  timestamp: number; // Milliseconds Unix epoch
  timestampUs: number; // Microseconds SDK timestamp
  pulse: PulseReading | null; // Null when unmeasured or invalid
  breathing: BreathingReading | null; // Null when unmeasured or invalid
  hrv: HrvReading | null;
  waveforms: SignalWaveforms;
  validation: ValidationReport;
  quality: SignalQualityState;
  source: 'SMARTSPECTRA_NODE_ELECTRON' | 'SMARTSPECTRA_ANDROID_KOTLIN' | 'STANDALONE_WEB_COMPANION';
}

export interface SmartSpectraError {
  code: number | string;
  message: string;
  retryable: boolean;
  timestamp: number;
}

export type CameraFacing = 'front' | 'back' | 'unknown';

export interface CameraDevice {
  id: string;
  name: string;
  facing: CameraFacing;
  lensType?: string;
  isDefault?: boolean;
}

export interface CameraSelectionConfig {
  type: 'default' | 'front' | 'back' | 'byId';
  id?: string;
  width?: number;
  height?: number;
  fps?: number;
}

export interface ProviderStartOptions {
  apiKey?: string;
  camera?: CameraSelectionConfig;
  targetFps?: number;
  metrics?: string[]; // e.g. ['pulse', 'breathing', 'hrv']
  testVideoFilePath?: string; // For CI / headless testing via useFile()
}

export interface PreviewFrame {
  width: number;
  height: number;
  format: 'rgba' | 'rgb' | 'jpeg';
  dataUrl?: string; // For web/Electron preview rendering
  timestampUs: number;
}

export type Unsubscribe = () => void;

/**
 * Universal HumanSignalProvider Contract
 * Implemented natively in Desktop (Electron Node SDK) and Android (Kotlin SmartSpectraSdk)
 */
export interface HumanSignalProvider {
  readonly platform: 'desktop' | 'android' | 'web';
  
  getStatus(): PipelineProcessingStatus;
  
  getAvailableCameras(): Promise<CameraDevice[]>;
  selectCamera(config: CameraSelectionConfig): Promise<void>;
  
  start(options?: ProviderStartOptions): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
  destroy(): Promise<void>;
  
  // Event Subscriptions
  onSignal(listener: (signal: HumanSignal) => void): Unsubscribe;
  onValidation(listener: (report: ValidationReport) => void): Unsubscribe;
  onStatusChange(listener: (status: PipelineProcessingStatus) => void): Unsubscribe;
  onError(listener: (error: SmartSpectraError) => void): Unsubscribe;
  onPreviewFrame?(listener: (frame: PreviewFrame) => void): Unsubscribe;
}
