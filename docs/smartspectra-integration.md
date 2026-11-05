# Presage SmartSpectra SDK Integration Guide

This guide details the production integration of the official **Presage SmartSpectra SDK** across **PulsePause Desktop (Electron / Node.js)** and **PulsePause Android (Kotlin / Jetpack Compose)**, adhering strictly to the official SDK documentation and the `using-smartspectra` agent skill.

---

## 1. Platform-Independent Architecture: `HumanSignalProvider`

PulsePause decouples platform-specific camera engines from application logic using the `HumanSignalProvider` interface:

```typescript
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
```

### Common Signal Model
```typescript
export interface HumanSignal {
  timestamp: number;
  timestampUs: number;
  pulse: PulseReading | null;          // null if measurement is unreliable/unavailable
  breathing: BreathingReading | null;  // null if measurement is unreliable/unavailable
  hrv: HrvReading | null;
  waveforms: SignalWaveforms;
  validation: ValidationReport;
  quality: SignalQualityState;         // 'OPTIMAL' | 'DEGRADED' | 'UNRELIABLE' | 'UNAVAILABLE'
  source: 'SMARTSPECTRA_NODE_ELECTRON' | 'SMARTSPECTRA_ANDROID_KOTLIN' | 'STANDALONE_WEB_COMPANION';
}
```

---

## 2. Desktop Integration (@smartspectra/node-sdk)

### Package & Dependencies
Installed in `apps/desktop`:
```bash
npm install @smartspectra/node-sdk
```

The Node.js SDK loads the native SmartSpectra C ABI via `koffi` FFI without needing separate compilation tools.

### Camera Discovery & Front-Facing Selection
```typescript
import { SmartSpectraSDK, CameraSelection } from '@smartspectra/node-sdk';

// Discover all system cameras without permission prompts
const cameras = SmartSpectraSDK.availableCameras();

// Select front-facing camera with optimal rPPG resolution & frame rate
sdk.useCamera(CameraSelection.front, {
  width: 1280,
  height: 720,
  fps: 30
});
```

### Metrics & Decoding
```typescript
import { SmartSpectraSDK, breathingMetrics, cardioMetrics } from '@smartspectra/node-sdk';
import { decodeMetrics } from '@smartspectra/node-sdk/messages';

const sdk = new SmartSpectraSDK({
  apiKey: process.env.SMARTSPECTRA_API_KEY,
  requestedMetrics: [...breathingMetrics, ...cardioMetrics]
});

sdk.on('metrics', (buf: Buffer, tsUs: number) => {
  const decoded = decodeMetrics(buf);
  // Forward to renderer through contextBridge
});

sdk.on('validation', (val) => {
  // Capture lighting, motion, and face positioning flags
});

sdk.on('image', (imgBuf: Buffer, width: number, height: number, tsUs: number) => {
  // Emit camera preview frame as JPEG data URL for UI rendering
});

sdk.on('error', (code: number | string, message: string, retryable: boolean) => {
  // Handle native SDK pipeline errors
});
```

### Electron Boundary Isolation
- **Main Process (`main.ts`, `engine.ts`)**: Owns the native SDK instance, handles camera buffers, dispatches decoded metrics across IPC channels (`pulsepause:event:signal`, `pulsepause:event:preview`).
- **Preload (`preload.ts`)**: Implements `IPulsePauseBridge` over `contextBridge.exposeInMainWorld('pulsePauseBridge', bridgeApi)`.
- **Renderer (`App.tsx`, `LiveSensingScreen.tsx`)**: Consumes live signals without accessing native Node APIs.

---

## 3. Android Integration (Kotlin & Jetpack Compose)

### Gradle Configuration (`apps/android/app/build.gradle.kts`)
```kotlin
dependencies {
    implementation("com.presagetech:smartspectra:3.4.0")
    implementation("androidx.camera:camera-view:1.4.1")
    implementation("androidx.camera:camera-lifecycle:1.4.1")
    implementation("androidx.room:room-runtime:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
}
```

### CameraX PreviewView Surface Provider
As documented by Presage, connect Android CameraX `PreviewView.surfaceProvider` directly into `SmartSpectraSdk.shared.config.previewSurfaceProvider`:

```kotlin
class SmartSpectraEngine(
    private val context: Context,
    private val lifecycleOwner: LifecycleOwner,
    private val apiKey: String
) {
    private val sdk = SmartSpectraSdk.shared

    init {
        sdk.config.apiKey = apiKey
    }

    fun attachPreview(previewView: PreviewView) {
        sdk.config.previewSurfaceProvider = previewView.surfaceProvider
        sdk.config.imageOutputEnabled = false // Efficient native Surface rendering
    }
}
```

### Observables & Lifecycle
```kotlin
// Processing Status (Idle, Starting, Running, Paused, Stopping, Error)
sdk.processingStatus.observe(lifecycleOwner) { status ->
    // Update UI status chips
}

// Validation Status (Lighting, Motion, Positioning)
sdk.validationStatus.observe(lifecycleOwner) { validation ->
    // Handle lighting, motion stability, and face alignment warnings
}

// Physiological Metrics
sdk.metrics.observe(lifecycleOwner) { metrics ->
    // Extract pulseRate, respiratoryRate, hrv, and ppgSample
}

// Errors
sdk.errors.observe(lifecycleOwner) { error ->
    // Log and notify user
}
```

### Activity Lifecycle Management (`MainActivity.kt`)
- `onResume()`: Re-activates sensing if permission is granted (`sensorEngine.resumeSensing()`).
- `onPause()`: Suspends camera capture to release hardware (`sensorEngine.pauseSensing()`).
- `onDestroy()`: Fully tears down pipeline via `sdk.stop()` and `sdk.destroy()`.

---

## 4. Production Security & OAuth Architecture

1. **Local Development:**
   Configure `SMARTSPECTRA_API_KEY` in your environment or `.env` file (never committed to git).
2. **Production OAuth Workflow:**
   For multi-tenant or enterprise production deployments, use Presage's OAuth 2.0 flow:
   - User authenticates via Presage Developer Portal.
   - Temporary short-lived session tokens (`Bearer psg_tok_...`) are retrieved by your backend and passed to the SDK.
   - API keys are not exposed in client application binaries.
3. **Data Governance & Zero Raw Frame Transmission:**
   - Raw video frames are processed ephemerally in RAM buffers on the user's device.
   - No raw frames are transmitted across network sockets.
   - Only non-reversible computed physiological summaries (e.g. average BPM, RMSSD) are stored in local IndexedDB or Room.
