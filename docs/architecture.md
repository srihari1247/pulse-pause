# PulsePause System Architecture

**Product:** PulsePause — Camera-Based Human-Sensing Wellness & Focus Companion  
**Engine:** Presage SmartSpectra SDK (Native rPPG, Heart Rate Variability, Respiratory & Myofacial Dynamics)  
**Author:** Principal Software Architect & Systems Engineering  
**Version:** 1.0.0-PROD  
**Status:** Approved Architecture Specification  

---

## 1. Executive Summary & Product Thesis

PulsePause is an ambient, camera-based wellness and cognitive focus companion designed to measure, interpret, and regulate human physiological state non-invasively through standard optical sensors (webcams and smartphone cameras). Powered by Presage Technologies' **SmartSpectra SDK**, PulsePause extracts:

1. **Pulse Plethysmography (rPPG):** Cardiac waveforms, instantaneous pulse rate (PR), and Heart Rate Variability (HRV - SDNN, RMSSD, LF/HF balance).
2. **Respiratory Dynamics:** Real-time respiratory waveforms, breathing rate (BR), inhale/exhale ratios, and respiratory line length (RLL).
3. **Facial & Autonomic Indicators:** Blink frequency, facial landmark stability, and autonomic stress/recovery index.

PulsePause operates across two key operational paradigms:
- **Active Rest & Calibration ("PulsePause"):** 60–180s targeted micro-breaks with coherent biofeedback pacing to restore autonomic balance.
- **Ambient Focus Guardian:** Background or companion monitoring during deep work, alerting users to physiological strain, shallow thoracic breathing, or prolonged sympathetic arousal.

---

## 2. Core Architectural Principles & Boundaries

### 2.1 The Native Sensing Mandate (Zero-Simulation Rule)
SmartSpectra's rPPG pipeline processes raw, uncompressed 30/60 fps video frames through proprietary spatial-temporal chromatic filtering, face-tracking ROI alignment, and signal decomposition. 
- **Browser Boundary:** SmartSpectra **does not** provide an in-browser pure JavaScript SDK. Browsers introduce WebRTC/MediaStream compression artifacts, frame-dropping, and non-deterministic event loops that degrade rPPG signal-to-noise ratio.
- **Desktop Strategy:** PulsePause Desktop runs on **Electron**, where the **Node.js Main Process / Native Worker** integrates the official `@smartspectra/node-sdk` directly with hardware camera feeds or memory-mapped buffers.
- **Mobile Strategy:** PulsePause Android runs natively using **Kotlin and Jetpack Compose**, utilizing `com.presagetech:smartspectra:3.4.0` integrated with CameraX / SurfaceView.
- **Zero-Simulation Policy:** PulsePause **strictly forbids** simulated/mock vitals in production flows. In pure browser mode without an active native bridge, the Web Shell operates as a companion dashboard, session coordinator, guided pacer, and analytics viewer, clearly identifying that the native sensor engine (Desktop or Android) must be paired or launched for live optical capture.

```
+-----------------------------------------------------------------------------------+
|                                  PULSEPAUSE ECOSYSTEM                             |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|   +--------------------------+                         +----------------------+   |
|   |   PulsePause Desktop     |                         |  PulsePause Android  |   |
|   |   (Electron + Node SDK)  |                         |  (Kotlin + Compose)  |   |
|   |                          |                         |                      |   |
|   |  - Native Camera Feed    |                         |  - CameraX Pipeline  |   |
|   |  - @smartspectra/node-sdk|                         |  - SmartSpectra SDK  |   |
|   |  - rPPG Signal Engine    |                         |  - Room Database     |   |
|   |  - Local IPC Bridge      |                         |  - Compose Canvas    |   |
|   +-------------+------------+                         +----------+-----------+   |
|                 |                                                 |               |
|                 | Electron Preload IPC / Secure Local Bridge      | Local Sync    |
|                 v                                                 v               |
|   +---------------------------------------------------------------------------+   |
|   |                           PulsePause Web Shell                            |   |
|   |               (Responsive React 19 + TypeScript + Tailwind)               |   |
|   |                                                                           |   |
|   |  - Shared Domain Models (@pulsepause/domain-models)                       |   |
|   |  - Shared Bridge Contracts (@pulsepause/shared-contracts)                 |   |
|   |  - Design System Tokens (@pulsepause/design-system)                       |   |
|   |  - IndexedDB Local Storage Engine                                         |   |
|   |  - Recharts Cardiac & Respiratory Visualizers                             |   |
|   |  - Coherent Respiratory Pacer & Focus Session Controller                  |   |
|   +---------------------------------------------------------------------------+   |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 3. Monorepo Structure

PulsePause is structured as a high-discipline monorepo separating shared cross-platform packages from target platform apps:

```
pulsepause/
├── apps/
│   ├── web/                    # React 19, Vite, Tailwind, Recharts, IndexedDB
│   │   ├── src/
│   │   │   ├── components/     # UI components, visualizers, pacer, session flows
│   │   │   ├── storage/        # IndexedDB repository & query engine
│   │   │   ├── bridge/         # IPC & WebSocket bridge adapters for native SDK
│   │   │   ├── hooks/          # useVitalsSession, useRespiratoryPacer, useStorage
│   │   │   └── App.tsx
│   │   ├── index.html
│   │   └── package.json
│   ├── desktop/                # Electron Main & Preload integration
│   │   ├── src/
│   │   │   ├── main/           # Node.js process, @smartspectra/node-sdk pipeline
│   │   │   ├── preload/        # Context-isolated window.pulsePauseBridge
│   │   │   └── engine/         # SmartSpectra camera worker & frame streamer
│   │   └── package.json
│   └── android/                # Native Android application
│       ├── app/
│       │   ├── src/main/
│       │   │   ├── java/com/pulsepause/app/
│       │   │   │   ├── data/       # Room database, entities, DAO, repositories
│       │   │   │   ├── domain/     # Kotlin domain models (parity with TS packages)
│       │   │   │   ├── sensor/     # SmartSpectraSdk lifecycle & CameraX bridge
│       │   │   │   └── ui/         # Jetpack Compose UI, Canvas rPPG visualizers
│       │   │   └── AndroidManifest.xml
│       │   └── build.gradle.kts
│       ├── build.gradle.kts
│       └── settings.gradle.kts
├── packages/
│   ├── domain-models/          # Platform-agnostic domain entities & enums
│   │   ├── src/
│   │   │   ├── biometrics.ts   # VitalsMetrics, Waveforms, QualityFlags
│   │   │   ├── session.ts      # WellnessSession, FocusState, BreathingProtocol
│   │   │   ├── device.ts       # SensorEngineStatus, CameraDevice, PlatformKind
│   │   │   └── index.ts
│   │   └── package.json
│   ├── shared-contracts/       # IPC, validation rules & wire protocols
│   │   ├── src/
│   │   │   ├── ipc.ts          # Electron IPC channel names and payload typings
│   │   │   ├── bridge.ts       # Unified IPulsePauseBridge interface
│   │   │   ├── validation.ts   # Signal confidence & posture quality thresholds
│   │   │   ├── storage.ts      # Canonical session storage schema (IndexedDB & Room)
│   │   │   └── index.ts
│   │   └── package.json
│   └── design-system/          # Design tokens, typography, mood themes
│       ├── src/
│       │   ├── tokens.ts       # Colors (Pulse Rose, Bio Cyan, Slate), timing curves
│       │   ├── themes.ts       # Focus, Calm, Energize, Recover themes
│       │   └── index.ts
│       └── package.json
├── docs/
│   ├── architecture.md         # This specification document
│   ├── implementation-plan.md  # Detailed phase-by-phase execution plan
│   └── smartspectra-integration.md # SmartSpectra Node & Android integration notes
├── README.md                   # Project overview & getting started guide
└── package.json                # Root workspace configuration
```

---

## 4. Platform Separation & Technology Matrix

| Concern | Web Shell (Browser) | Desktop Companion (Electron) | Android Native App |
| :--- | :--- | :--- | :--- |
| **Runtime** | Modern Evergreen Browsers | Electron 34+ (Chromium + Node 22) | Android 9.0+ (API 28+, Target API 35) |
| **Language / UI** | React 19, TypeScript, Tailwind | React UI loaded in BrowserWindow | Kotlin 2.2+, Jetpack Compose |
| **SmartSpectra SDK** | Remote Native Bridge Client | `@smartspectra/node-sdk` | `com.presagetech:smartspectra:3.4.0` |
| **Camera Access** | WebRTC for preview / framing check | Native OS media devices via Node/C++ | CameraX with ImageAnalysis analyzer |
| **Local Persistence** | IndexedDB (Dexie / IDB wrapper) | Electron Store / IndexedDB | Room Database (SQLite with Flow) |
| **Waveform Charts** | Recharts & SVG Micro-canvases | Recharts & SVG Micro-canvases | Jetpack Compose `Canvas` with Path drawing |
| **Background Run** | Web Worker / Tab audio anchor | System tray, background daemon | Android Foreground Service with Notification |

---

## 5. SmartSpectra Integration Details

### 5.1 Electron (Node.js SDK Pipeline)
1. In `apps/desktop/src/main/engine.ts`:
   ```typescript
   import { SmartSpectraSDK, PixelFormat, decodeMetrics } from '@smartspectra/node-sdk';
   
   export class SmartSpectraNodeEngine {
     private sdk: SmartSpectraSDK;
     
     constructor(apiKey: string) {
       this.sdk = new SmartSpectraSDK({ apiKey });
       this.sdk.on('metrics', (buffer: Buffer, timestampUs: number) => {
         const decoded = decodeMetrics(buffer);
         this.emitToRenderer('pulsepause:metrics', { decoded, timestampUs });
       });
     }
     
     public startCustomPipeline() {
       this.sdk.useCustomInput();
       this.sdk.start();
     }
     
     public pushFrame(buffer: Buffer, width: number, height: number, stride: number, ts: number) {
       this.sdk.sendFrame(buffer, width, height, stride, PixelFormat.kRGB, ts);
     }
   }
   ```
2. The Electron Preload script (`preload.ts`) exposes safe methods via `contextBridge.exposeInMainWorld('pulsePauseBridge', bridgeApi)`.

### 5.2 Android (Kotlin SmartSpectra SDK Pipeline)
1. Configured via Maven repository in `settings.gradle.kts`.
2. Initialized in `SmartSpectraEngine.kt`:
   ```kotlin
   val sdk = SmartSpectraSdk.getInstance().apply {
       setApiKey(BuildConfig.SMARTSPECTRA_API_KEY)
   }
   ```
3. Live frames from CameraX `ImageAnalysis.Analyzer` or `SmartSpectraView` stream into the local analyzer; physiological metrics (pulse, respiration, facial landmarks) are gathered into Kotlin `StateFlow<VitalsMeasurement>` for consumption by Compose composables and Room storage.

---

## 6. Privacy, Security & Data Governance

1. **Zero Raw Video Retention:** PulsePause does **not** record, stream, or store video frames. The camera feed is strictly processed in ephemeral memory buffers on the user's local device.
2. **Local-First Telemetry:** All biometric session recordings (pulse samples, HRV milestones, respiration rates) are stored locally in IndexedDB (Web) or Room (Android).
3. **Transparent Quality Diagnostics:** If lighting is insufficient, user head motion is excessive, or face coverage is below confidence thresholds, the system raises `QualityWarning` alerts without guessing or interpolating false signals.
