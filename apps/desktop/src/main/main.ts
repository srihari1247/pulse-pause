/**
 * PulsePause Desktop: Electron Main Entrypoint
 * Wires official SmartSpectra SDK IPC channels across boundaries
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
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
      sandbox: false
    }
  });

  sensorEngine = new SmartSpectraNodeEngine(mainWindow);

  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
  const localDistPath = path.resolve(__dirname, '../../../dist/index.html');

  let retryCount = 0;
  const maxRetries = 10;
  let isLoaded = false;

  const tryLoadDevServer = () => {
    if (isLoaded) return;
    mainWindow?.loadURL(devUrl).then(() => {
      isLoaded = true;
    }).catch(() => {
      handleLoadFailure();
    });
  };

  const handleLoadFailure = () => {
    if (isLoaded) return;
    if (fs.existsSync(localDistPath)) {
      console.log(`[PulsePause Desktop] Loading local built web app from ${localDistPath}`);
      mainWindow?.loadFile(localDistPath);
      isLoaded = true;
    } else if (retryCount < maxRetries) {
      retryCount++;
      console.log(`[PulsePause Desktop] Waiting for web dev server on ${devUrl}... Retry ${retryCount}/${maxRetries}`);
      setTimeout(tryLoadDevServer, 1500);
    } else {
      const fallbackHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>PulsePause Desktop</title>
          <style>
            body { background: #070b14; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; display: flex; height: 100vh; margin: 0; align-items: center; justify-content: center; text-align: center; }
            .card { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 16px; padding: 2.5rem; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
            h1 { color: #38bdf8; font-size: 1.5rem; margin-top: 0; }
            p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
            code { background: #1e293b; color: #38bdf8; padding: 4px 8px; border-radius: 6px; font-family: monospace; font-size: 0.9em; }
            .btn { background: #0284c7; color: white; border: none; padding: 10px 22px; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1.25rem; transition: background 0.2s; }
            .btn:hover { background: #0369a1; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>PulsePause Desktop</h1>
            <p>Connecting to PulsePause Web UI (<code>http://localhost:3000</code>)...</p>
            <p>To run in development mode, start the Web app in another terminal:</p>
            <p><code>npm run dev</code></p>
            <p>Or build static web files with:</p>
            <p><code>npm run build</code></p>
            <button class="btn" onclick="location.reload()">Retry Connection</button>
          </div>
        </body>
        </html>
      `;
      mainWindow?.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fallbackHtml)}`);
    }
  };

  mainWindow.webContents.on('did-fail-load', (_event, errorCode) => {
    if (!isLoaded && (errorCode === -102 || errorCode === -105 || errorCode === -100)) {
      handleLoadFailure();
    }
  });

  tryLoadDevServer();

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
