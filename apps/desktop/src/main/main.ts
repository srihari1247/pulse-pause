/**
 * PulsePause Desktop: Electron Main Entrypoint
 * Wires official SmartSpectra SDK IPC channels across boundaries
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { IPC_CHANNELS, EngineStartRequest } from '@pulsepause/shared-contracts';
import { SmartSpectraNodeEngine } from './engine';
import { CameraSelectionConfig } from '@pulsepause/domain-models';

let mainWindow: BrowserWindow | null = null;
let sensorEngine: SmartSpectraNodeEngine | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 880,
    minWidth: 960,
    minHeight: 680,
    backgroundColor: '#070b14',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  sensorEngine = new SmartSpectraNodeEngine(mainWindow);

  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
  mainWindow.loadURL(devUrl);

  mainWindow.on('closed', () => {
    sensorEngine?.destroy();
    sensorEngine = null;
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle(IPC_CHANNELS.ENGINE_GET_STATUS, async () => {
  return sensorEngine ? sensorEngine.getStatus() : 'IDLE';
});

ipcMain.handle(IPC_CHANNELS.CAMERA_LIST, async () => {
  return sensorEngine ? await sensorEngine.getAvailableCameras() : [];
});

ipcMain.handle(IPC_CHANNELS.CAMERA_SELECT, async (_event, config: CameraSelectionConfig) => {
  if (sensorEngine) {
    await sensorEngine.selectCamera(config);
  }
  return { success: true };
});

ipcMain.handle(IPC_CHANNELS.ENGINE_START, async (_event, req?: EngineStartRequest) => {
  try {
    if (!sensorEngine) {
      return { success: false, status: 'ERROR', error: 'Engine not initialized' };
    }
    await sensorEngine.start(req);
    return { success: true, status: sensorEngine.getStatus() };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, status: 'ERROR', error: msg };
  }
});

ipcMain.handle(IPC_CHANNELS.ENGINE_PAUSE, async () => {
  if (sensorEngine) await sensorEngine.pause();
  return { success: true, status: sensorEngine?.getStatus() || 'IDLE' };
});

ipcMain.handle(IPC_CHANNELS.ENGINE_RESUME, async () => {
  if (sensorEngine) await sensorEngine.resume();
  return { success: true, status: sensorEngine?.getStatus() || 'IDLE' };
});

ipcMain.handle(IPC_CHANNELS.ENGINE_STOP, async () => {
  if (sensorEngine) await sensorEngine.stop();
  return { success: true, status: sensorEngine?.getStatus() || 'IDLE' };
});

ipcMain.handle(IPC_CHANNELS.ENGINE_DESTROY, async () => {
  if (sensorEngine) await sensorEngine.destroy();
  return { success: true, status: 'IDLE' };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
