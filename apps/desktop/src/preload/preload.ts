/**
 * PulsePause Desktop: Electron Preload Bridge
 * Implements HumanSignalProvider & IPulsePauseBridge over contextBridge
 */

import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, IPulsePauseBridge, EngineActionResponse } from '@pulsepause/shared-contracts';
import {
  HumanSignal,
  ValidationReport,
  PipelineProcessingStatus,
  SmartSpectraError,
  CameraDevice,
  CameraSelectionConfig,
  ProviderStartOptions,
  PreviewFrame
} from '@pulsepause/domain-models';

let currentStatus: PipelineProcessingStatus = 'IDLE';

const bridgeApi: IPulsePauseBridge = {
  isAvailable: true,
  platform: 'desktop',

  getStatus(): PipelineProcessingStatus {
    return currentStatus;
  },

  async getAvailableCameras(): Promise<CameraDevice[]> {
    return ipcRenderer.invoke(IPC_CHANNELS.CAMERA_LIST);
  },

  async selectCamera(config: CameraSelectionConfig): Promise<void> {
    await ipcRenderer.invoke(IPC_CHANNELS.CAMERA_SELECT, config);
  },

  async start(options?: ProviderStartOptions): Promise<void> {
    const res: EngineActionResponse = await ipcRenderer.invoke(IPC_CHANNELS.ENGINE_START, options);
    currentStatus = res.status;
    if (!res.success) {
      throw new Error(res.error || 'Failed to start SmartSpectra engine');
    }
  },

  async pause(): Promise<void> {
    const res: EngineActionResponse = await ipcRenderer.invoke(IPC_CHANNELS.ENGINE_PAUSE);
    currentStatus = res.status;
  },

  async resume(): Promise<void> {
    const res: EngineActionResponse = await ipcRenderer.invoke(IPC_CHANNELS.ENGINE_RESUME);
    currentStatus = res.status;
  },

  async stop(): Promise<void> {
    const res: EngineActionResponse = await ipcRenderer.invoke(IPC_CHANNELS.ENGINE_STOP);
    currentStatus = res.status;
  },

  async destroy(): Promise<void> {
    await ipcRenderer.invoke(IPC_CHANNELS.ENGINE_DESTROY);
    currentStatus = 'IDLE';
  },

  onSignal(listener: (signal: HumanSignal) => void) {
    const sub = (_e: unknown, sig: HumanSignal) => listener(sig);
    ipcRenderer.on(IPC_CHANNELS.EVENT_SIGNAL, sub);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.EVENT_SIGNAL, sub);
  },

  onValidation(listener: (report: ValidationReport) => void) {
    const sub = (_e: unknown, rep: ValidationReport) => listener(rep);
    ipcRenderer.on(IPC_CHANNELS.EVENT_VALIDATION, sub);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.EVENT_VALIDATION, sub);
  },

  onStatusChange(listener: (status: PipelineProcessingStatus) => void) {
    const sub = (_e: unknown, st: PipelineProcessingStatus) => {
      currentStatus = st;
      listener(st);
    };
    ipcRenderer.on(IPC_CHANNELS.EVENT_STATUS, sub);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.EVENT_STATUS, sub);
  },

  onError(listener: (error: SmartSpectraError) => void) {
    const sub = (_e: unknown, err: SmartSpectraError) => listener(err);
    ipcRenderer.on(IPC_CHANNELS.EVENT_ERROR, sub);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.EVENT_ERROR, sub);
  },

  onPreviewFrame(listener: (frame: PreviewFrame) => void) {
    const sub = (_e: unknown, frame: PreviewFrame) => listener(frame);
    ipcRenderer.on(IPC_CHANNELS.EVENT_PREVIEW, sub);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.EVENT_PREVIEW, sub);
  }
};

contextBridge.exposeInMainWorld('pulsePauseBridge', bridgeApi);
