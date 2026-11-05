/**
 * PulsePause Shared Contracts: Bridge Interface
 * Unified contract implemented by Electron preload and remote pairing clients
 * Compliant with HumanSignalProvider
 */

import {
  HumanSignal,
  ValidationReport,
  PipelineProcessingStatus,
  SmartSpectraError,
  CameraDevice,
  CameraSelectionConfig,
  ProviderStartOptions,
  PreviewFrame,
  HumanSignalProvider,
  Unsubscribe
} from '@pulsepause/domain-models';

export interface IPulsePauseBridge extends HumanSignalProvider {
  readonly isAvailable: boolean;
}

// Global declaration for Window in Electron contexts
declare global {
  interface Window {
    pulsePauseBridge?: IPulsePauseBridge;
  }
}
