# PulsePause Implementation Plan

**Product:** PulsePause — Camera-based Human-Sensing Wellness & Focus Companion  
**Presage SmartSpectra SDK Integration**  
**Engineering Phase:** Phase 1 (Foundation, Contracts, Monorepo & Shells)  

---

## Architecture Validation & Guidelines Check
- [x] **SmartSpectra Native Separation:** Do not assume browser JS SDK; keep Electron Node.js SDK and Android Kotlin SDK decoupled.
- [x] **Zero Synthetic Biometrics:** Strictly prohibit fabricated vitals or spoofed waveforms in production flows.
- [x] **Shared Contracts & Domain Models:** Canonical types for biometrics, sessions, quality rules, and storage parity (IndexedDB <-> Room).
- [x] **Responsive Web Shell:** High-fidelity UI with Recharts, coherent breathing pacer, session manager, and real-time native bridge diagnostics.
- [x] **Android Shell:** Kotlin 2.2+, Jetpack Compose, Compose Canvas, Room database, CameraX + SmartSpectra lifecycle.

---

## Detailed Task Breakdown

### Phase 1: Shared Packages & Domain Models
- [x] **1.1 `@pulsepause/domain-models`**
  - Define `BiometricSample`, `PulseMetrics`, `RespiratoryMetrics`, `HRVMetrics`, `FaceQualityMetrics`.
  - Define `WellnessSession`, `SessionType` (MicroPause, FocusSustained, HRVCalibration, DeepRecovery), `SessionStatus`.
  - Define `BreathingCadence`, `PacerState`, `StressIndex`.
  - Define `PlatformKind`, `SensorEngineStatus`, `EngineCapability`.
- [x] **1.2 `@pulsepause/shared-contracts`**
  - Define `IPulsePauseBridge` interface for Electron preload and WebSocket pairing.
  - Define Electron IPC channel constants (`pulsepause:session:*`, `pulsepause:camera:*`, `pulsepause:metrics:*`).
  - Define Signal Quality & Posture validation rules (lighting threshold, motion artifact flags, SNR limits).
  - Define canonical persistence schema matching IndexedDB and Android Room.
- [x] **1.3 `@pulsepause/design-system`**
  - Design tokens: Palette (Obsidian slate, Bio Cyan `#06b6d4`, Heart Rose `#f43f5e`, Breath Emerald `#10b981`, Focus Amber `#f59e0b`).
  - Typography, border radiuses, dark-mode glassmorphic elevation tokens, and micro-interaction curves.

### Phase 2: Web Application Shell (`apps/web` & workspace root)
- [x] **2.1 Core Application State & Navigation**
  - Responsive multi-view navigation:
    1. **Live Monitor & Bridge Diagnostic:** Sensor status, hardware camera preview framing check, bridge pairing with Electron / Android, telemetry feed.
    2. **PulsePause Biofeedback Sessions:** Interactive coherent breathing pacer with configurable ratio (e.g. 4-7-8, 5.5s resonance, Box Breathing 4-4-4-4).
    3. **Focus Guardian:** Ambient work timer with ergonomic alerts and physiological recovery prompts.
    4. **Vitals & HRV Analytics:** Interactive Recharts visualizer for pulse history, HRV distribution, respiratory line length, and stress index.
    5. **Architecture & SDK Inspector:** Interactive technical diagram showing Presage SmartSpectra SDK integration across Web, Electron, and Android.
    6. **Session History:** Offline-first IndexedDB storage browser with session export (JSON/CSV).
- [x] **2.2 Storage Layer (IndexedDB)**
  - Robust IndexedDB database with object stores for `sessions` and `biometric_samples`.
- [x] **2.3 Native Bridge Adapter**
  - Automatic detection of `window.pulsePauseBridge` (when running in Electron).
  - Pairing protocol and clear guidance when running in standard browser.

### Phase 3: Desktop Companion Shell (`apps/desktop`)
- [x] **3.1 Electron Main Process**
  - `src/main/main.ts` with BrowserWindow management, secure context isolation, and hardware permission handling.
- [x] **3.2 Node.js SmartSpectra Engine**
  - Integration template for `@smartspectra/node-sdk` with custom frame input or native camera capture.
- [x] **3.3 Secure Preload Script**
  - `src/preload/preload.ts` implementing `IPulsePauseBridge` without exposing raw Node APIs.

### Phase 4: Android Companion Shell (`apps/android`)
- [x] **4.1 Gradle Build Configuration**
  - Root `build.gradle.kts` and `settings.gradle.kts` with Google, MavenCentral, and SmartSpectra Maven repositories.
  - `app/build.gradle.kts` with Compose BOM, Room Database, CameraX, and `com.presagetech:smartspectra:3.4.0`.
- [x] **4.2 Manifest & Permissions**
  - `AndroidManifest.xml` with `CAMERA` permission and hardware feature tags.
- [x] **4.3 Kotlin Domain & Room Database**
  - Entity `SessionEntity`, `BiometricSampleEntity`, DAO `SessionDao`, and Room `AppDatabase`.
- [x] **4.4 Native SmartSpectra Manager**
  - `SmartSpectraEngine.kt` managing SDK initialization, API key binding, and CameraX frame analysis.
- [x] **4.5 Jetpack Compose UI & Waveform Canvas**
  - `PulsePauseDashboard.kt` with live rPPG canvas graphing, coherent pacer circle, and session recording controls.

### Phase 5: Verification & Quality Assurance
- [x] Verify TypeScript compilation across packages and applications.
- [x] Test responsive viewport scaling from mobile (375px) to ultrawide (1440px+).
- [x] Validate zero-simulation integrity (all mock states clearly designated as disconnected or diagnostic test bench, never spoofing real physiological measurements).
