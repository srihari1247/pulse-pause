/**
 * PulsePause Shared Domain Models: Device & Engine
 * Platform identification, sensor capabilities, and bridge states
 */

export type PlatformKind = 'web' | 'desktop' | 'android' | 'ios';

export type SensorEngineStatus = 
  | 'UNINITIALIZED'
  | 'ACQUIRING_CAMERA'
  | 'SMARTSPECTRA_READY'
  | 'ANALYZING_STREAM'
  | 'BRIDGE_DISCONNECTED'
  | 'HARDWARE_ERROR';

export interface CameraDeviceInfo {
  deviceId: string;
  label: string;
  facingMode?: 'user' | 'environment';
  supportedFps?: number[];
  maxWidth?: number;
  maxHeight?: number;
}

export interface EngineCapability {
  platform: PlatformKind;
  isNativeSmartSpectra: boolean;
  supportsHardwareIsoControl: boolean;
  supportsRealtimeRppg: boolean;
  supportsRespiratoryTracking: boolean;
  supportsFaceMeshAnalysis: boolean;
  engineVersion: string;
}

export interface BridgeConnectionState {
  isConnected: boolean;
  bridgeType: 'ELECTRON_IPC' | 'WEBSOCKET_LOCAL' | 'PAIRING_RELAY' | 'NONE';
  engineStatus: SensorEngineStatus;
  latencyMs: number;
  lastHeartbeat: number;
  deviceLabel: string;
}
