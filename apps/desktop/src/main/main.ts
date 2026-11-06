/**
 * PulsePause Desktop: Electron Main Entrypoint
 * Wires official SmartSpectra SDK IPC channels across boundaries
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
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

  const checkDevServer = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const req = http.get(url, (res) => {
        resolve((res.statusCode && res.statusCode >= 200 && res.statusCode < 400) ? true : false);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(800, () => {
        req.destroy();
        resolve(false);
      });
    });
  };

  const showFallbackScreen = () => {
    const fallbackHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>PulsePause Desktop</title>
        <style>
          body { background: #070b14; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; display: flex; height: 100vh; margin: 0; align-items: center; justify-content: center; text-align: center; }
          .card { background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 16px; padding: 2.5rem; max-width: 520px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
          h1 { color: #38bdf8; font-size: 1.5rem; margin-top: 0; margin-bottom: 1rem; }
          p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; margin: 0.5rem 0; }
          code { background: #1e293b; color: #38bdf8; padding: 4px 8px; border-radius: 6px; font-family: monospace; font-size: 0.9em; }
          .badge { display: inline-block; background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; margin-bottom: 1rem; }
          .btn { background: #0284c7; color: white; border: none; padding: 10px 22px; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1.25rem; transition: background 0.2s; }
          .btn:hover { background: #0369a1; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">Web Dev Server Inactive</div>
          <h1>PulsePause Desktop Companion</h1>
          <p>The desktop app connects to the PulsePause Web UI on <code>http://localhost:3000</code>.</p>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 1.25rem 0;" />
          <p><strong>To launch in Development Mode:</strong></p>
          <p>Run <code>npm run dev</code> in a terminal window.</p>
          <p><strong>To launch in Production Mode:</strong></p>
          <p>Run <code>npm run build</code> to create static web files.</p>
          <button class="btn" onclick="location.reload()">Retry Connection</button>
        </div>
      </body>
      </html>
    `;
    mainWindow?.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fallbackHtml)}`);
  };

  const initializeWindowContent = async () => {
    const isDevServerActive = await checkDevServer(devUrl);
    if (isDevServerActive) {
      console.log(`[PulsePause Desktop] Live dev server detected on ${devUrl}, loading...`);
      mainWindow?.loadURL(devUrl);
    } else if (fs.existsSync(localDistPath)) {
      console.log(`[PulsePause Desktop] Dev server inactive. Loading local static build from ${localDistPath}`);
      mainWindow?.loadFile(localDistPath);
    } else {
      console.log(`[PulsePause Desktop] Neither dev server nor built static assets found. Displaying fallback UI.`);
      showFallbackScreen();
    }
  };

  initializeWindowContent();

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
