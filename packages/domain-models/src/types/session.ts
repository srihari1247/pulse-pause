/**
 * PulsePause Shared Domain Models: Sessions
 * Standard session models, focus trackers, and objective physiological contracts
 * Strictly avoids inferring stress, anxiety, emotional state or productivity claims.
 */

import { SignalQualityLevel } from './biometrics';
import { PlatformKind } from './device';

export type SessionType = 
  | 'FOCUS_SESSION'       // Standard focus interval (configurable, e.g. 25 min default)
  | 'GUIDED_BREATHING'    // Standalone or optional guided breathing exercise
  | 'HRV_CALIBRATION'     // Resting optical baseline test
  | 'MICRO_PAUSE'         // Short mindful pause
  | 'RESONANCE_BREATHING' // Resonant coherent breathing
  | 'DEEP_FOCUS';         // Extended deep focus

export type SessionStatus = 
  | 'IDLE' 
  | 'ACTIVE' 
  | 'PAUSED' 
  | 'COMPLETED' 
  | 'ABORTED';

export interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  inhaleSec: number;
  holdInSec: number;
  exhaleSec: number;
  holdOutSec: number;
  holdInhaleSec?: number;
  holdExhaleSec?: number;
  targetCadenceBrpm: number;
}

export type BreathingProtocol = BreathingPattern;

export interface WellnessSession {
  id: string;
  type: SessionType;
  status: SessionStatus;
  startedAt: number; // Unix ms
  endedAt?: number;
  targetDurationSeconds: number;
  elapsedSeconds: number;
  meanCoherenceScore?: number;
  
  // Objective Signal Availability & Measurements (No emotional or stress inferences)
  signalAvailabilityPercent: number; // Percentage of session time with reliable signal (0-100)
  validSampleCount: number;
  totalSampleCount: number;

  averagePulseBpm?: number | null;
  minPulseBpm?: number | null;
  maxPulseBpm?: number | null;

  averageRespiratoryRate?: number | null;
  minRespiratoryRate?: number | null;
  maxRespiratoryRate?: number | null;

  averageHrvRmssd?: number | null;
  
  // Optional Guided Breathing Details
  guidedBreathingEngaged: boolean;
  guidedBreathingPattern?: BreathingPattern;
  guidedBreathingCyclesCompleted?: number;
  guidedBreathingDurationSeconds?: number;

  protocol?: BreathingPattern;
  sampleCount?: number;

  overallQuality: SignalQualityLevel;
  sourcePlatform: PlatformKind;
  notes?: string;
}
