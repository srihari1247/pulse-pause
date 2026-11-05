/**
 * PulsePause Shared Domain Models: Biometrics
 * Objective typings for Presage SmartSpectra SDK rPPG & Respiratory extraction
 * Strictly avoids inferring stress, anxiety, emotional state or productivity claims.
 */

export interface BiometricSample {
  timestamp: number; // Unix timestamp in milliseconds
  timestampUs?: number; // Microseconds timestamp from SDK pipeline
  pulseRate: number; // Instantaneous heart rate in beats per minute (BPM)
  hrvRmssd: number; // Root Mean Square of Successive Differences (ms)
  hrvSdnn?: number; // Standard Deviation of NN intervals (ms)
  respiratoryRate: number; // Breaths per minute (BrPM)
  respiratoryLineLength?: number; // Respiratory line length metric
  inhaleExhaleRatio?: number; // Inhale to exhale duration ratio
  signalQuality: SignalQualityLevel;
  confidence: number; // Confidence score (0.0 - 1.0)
  rawPpgSample?: number; // Normalized rPPG waveform point (-1.0 to 1.0)
  rawRespSample?: number; // Normalized respiratory excursion point (-1.0 to 1.0)
}

export type SignalQualityLevel = 'OPTIMAL' | 'DEGRADED' | 'UNUSABLE' | 'CALIBRATING';

export interface PulseMetrics {
  currentBpm: number;
  restingBaselineBpm?: number;
  minBpm: number;
  maxBpm: number;
  trend: 'STABLE' | 'RISING' | 'FALLING';
}

export interface RespiratoryMetrics {
  currentBrpm: number;
  targetBrpm?: number;
  depthCategory: 'DEEP' | 'NORMAL' | 'SHALLOW';
}

export interface HRVMetrics {
  rmssd: number; // Root Mean Square of Successive Differences (ms)
  sdnn: number;
}

export interface FaceQualityMetrics {
  faceDetected: boolean;
  boxCoverageRatio: number; // Fraction of optimal target bounding box filled (0.0 - 1.0)
  lightingQuality: 'OPTIMAL' | 'UNDEREXPOSED' | 'OVEREXPOSED' | 'UNEVEN';
  motionStability: 'STABLE' | 'MODERATE_MOTION' | 'HIGH_ARTIFACTS';
  distanceQuality: 'TOO_CLOSE' | 'IDEAL' | 'TOO_FAR';
}

export interface WaveformPoint {
  timeOffsetMs: number;
  ppg: number;
  respiration: number;
}
