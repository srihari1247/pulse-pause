# PulsePause 🫀🧘‍♂️

> **Camera-Based Human-Sensing Wellness and Focus Companion** powered by the **Presage SmartSpectra SDK**.

PulsePause is a multi-platform biofeedback and cognitive focus companion. Utilizing remote photoplethysmography (rPPG) and respiratory movement analysis from ordinary optical video feeds, PulsePause measures cardiac pulse rate, heart rate variability (HRV), respiratory rate, and facial autonomic indicators without wearable hardware.

---

## 📋 Table of Contents
- [🏛 Architecture & Monorepo Layout](#-architecture--monorepo-layout)
- [⚡️ Technology Stack](#️-technology-stack)
- [📦 Prerequisites](#-prerequisites)
- [🚀 Quickstart: Clone, Install & Run](#-quickstart-clone-install--run)
  - [1. Web Companion (Local Dev)](#1-web-companion-local-dev)
  - [2. Desktop Electron Companion](#2-desktop-electron-companion)
  - [3. Native Android App](#3-native-android-app)
- [🧪 Running Automated Tests](#-running-automated-tests)
- [📱 Installing on Mobile (Progressive Web App)](#-installing-on-mobile-progressive-web-app)
- [🔑 SmartSpectra SDK Credentials & Configuration](#-smartspectra-sdk-credentials--configuration)
- [🔒 Zero-Simulation & Zero-Stress Mandates](#-zero-simulation--zero-stress-mandates)
- [🛠 Troubleshooting & FAQ](#-troubleshooting--faq)
- [📄 Submission Details & License](#-submission-details--license)

---

## 🏛 Architecture & Monorepo Layout

PulsePause is structured as a unified monorepo providing platform parity across web, desktop, and mobile:

```text
pulsepause/
├── apps/
│   ├── web/                  # React 19 + TypeScript + Vite + Tailwind CSS + Recharts
│   │                         # Web Companion, IndexedDB storage, Pacer & Analytics
│   ├── desktop/              # Electron 34 + Node.js @smartspectra/node-sdk
│   │                         # Native desktop camera capture, rPPG pipeline & IPC bridge
│   └── android/              # Native Android (Kotlin 2.2+, Jetpack Compose, Room DB)
│                             # Official com.presagetech:smartspectra SDK integration
├── packages/
│   ├── domain-models/        # Shared TypeScript interfaces (Vitals, Sessions, Enums)
│   ├── shared-contracts/     # IPC schemas, validation rules, storage schemas
│   └── design-system/        # Color tokens, typography, mood palettes
├── docs/
│   ├── architecture.md       # Full architectural specification & boundaries
│   ├── implementation-plan.md# Multi-phase engineering roadmap
│   ├── smartspectra-integration.md # Presage SDK technical integration guide
│   └── dev-challenge-submission.md # DEV Challenge submission documentation
├── test/
│   └── smartspectra-provider.test.ts # 43 automated unit & contract tests
├── README.md                 # Project guide & setup instructions
└── package.json              # Monorepo workspaces & build orchestration
```

---

## ⚡️ Technology Stack

| Component | Web & PWA Companion | Desktop Companion | Android Native App |
| :--- | :--- | :--- | :--- |
| **Framework** | React 19, Vite, Tailwind CSS | Electron 34, React UI | Jetpack Compose, Kotlin 2.2+ |
| **Sensing Engine** | Client-Side Optical rPPG & Skin Chrominance | `@smartspectra/node-sdk` (Native C++/Node) | `com.presagetech:smartspectra:3.4.0` |
| **Storage** | Local IndexedDB (Zero Cloud Leak) | IndexedDB / Electron Store | Room Database (SQLite) |
| **Audio Synthesis** | Native Web Audio API (Singing bowls, rain, ocean) | Web Audio API | Android AudioTrack / ExoPlayer |
| **Testing** | TSX test harness (43 automated tests) | TSX test harness | JUnit & AndroidX Compose Test |
| **Zero-Sim Rule** | Strictly enforced (`null` on signal drop) | Strictly enforced | Strictly enforced |

---

## 📦 Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher (v20+ / v22+ recommended)
- **npm**: v9.0.0 or higher (or Bun / yarn)
- **Git**: Installed and configured
- *(Optional for Desktop native rPPG)*: C++ build tools if compiling native Node addons
- *(Optional for Android build)*: Android Studio Ladybug / Koala with Android SDK 35 and JDK 17+

---

---

## 🌐 Instant Access: Live Hosted Application (No Setup Needed!)

If you want to immediately evaluate and use PulsePause on your computer or mobile phone without setting up a local developer environment:

### Live Production Deployment:
👉 **[Launch PulsePause Live on Google Cloud](https://ais-pre-fhakexuhnxofqowhfcaw7g-876110028765.asia-east1.run.app)**  
*(URL: `https://ais-pre-fhakexuhnxofqowhfcaw7g-876110028765.asia-east1.run.app`)*

#### Using from Your Desktop Browser (Chrome / Edge / Safari):
1. Click the live URL above.
2. Click **"Allow"** when prompted for camera access.
3. Tap **"Live Sensing"** to test real-time face tracking and optical microvascular pulse extraction, or start a **25-min Focus Session**.

#### Using from Your Smartphone (Android / iPhone):
1. Open the URL on your mobile browser (**Google Chrome** on Android, or **Safari** on iOS).
2. **Install as a native full-screen App (PWA)**:
   - **Android**: Tap the **"Install App"** button at the top, or tap the three dots (`⋮`) $\rightarrow$ **"Install app"** / **"Add to Home screen"**.
   - **iPhone**: Tap the **Share** button ($\uparrow$) at the bottom of Safari $\rightarrow$ tap **"Add to Home Screen"** $\rightarrow$ tap **"Add"**.
3. Open **PulsePause** from your home screen. It runs in full-screen standalone mode with offline storage and camera tracking!

---

## 🚀 Local Development: Clone, Install & Run

Follow these instructions to run the codebase locally on your machine:

### 1. Clone the Repository
```bash
git clone https://github.com/srihari1247/pulse-pause.git
cd pulse-pause
```

### 2. Install Dependencies
```bash
npm install
```
*(If you encounter upstream peer dependency resolutions on certain Node versions, use `npm install --legacy-peer-deps`)*

---

### Option A: Web Companion (Local Dev)
The Web app runs the complete focus clock, guided breathing suite with synthesized soundscapes, real-time webcam optical tracking, and session analytics.

```bash
npm run dev
```

1. Open your browser to **`http://localhost:3000`**.
2. Navigate to **"Live Human Sensing"** or **"Focus Session"**.
3. Allow camera permissions when prompted.
4. Position your face inside the optical reticle with your forehead aligned to the ROI box.

---

### Option B: Desktop Electron Companion
The Desktop app bundles the native Node.js process with `@smartspectra/node-sdk` for direct camera-to-C++ hardware optical sensing.

#### Recommended Launch (Production Bundle):
```bash
npm run build
npm run dev:desktop
```
> **Note**: Electron automatically detects and loads the built static assets from `dist/index.html` directly from disk.

#### Live Development Mode (2 Terminals):
- **Terminal 1**: `npm run dev` *(starts live web dev server on port 3000)*
- **Terminal 2**: `npm run dev:desktop` *(launches Electron window connected to dev server)*

---

### Option C: Native Android App
The Android app is located in `apps/android` and targets `minSdk 28` (Android 9.0+):

1. Connect your Android phone via USB with **USB Debugging** enabled (or start an Android Emulator).
2. Build and install the debug APK:
   ```bash
   cd apps/android
   ./gradlew assembleDebug
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```
3. *Or simply open the `apps/android` folder in **Android Studio** and click **Run (▶)**.*

---

## 🧪 Running Automated Tests

PulsePause includes an extensive automated test suite covering 43 unit and integration test assertions (provider lifecycle, validation flags, zero-simulation integrity, zero-stress mandate, and cadence math).

To execute the test suite:

```bash
npx tsx test/smartspectra-provider.test.ts
```

### Expected Output:
```text
--- PulsePause SmartSpectra SDK & Core Experience Test Suite ---
1. Testing HumanSignalProvider Lifecycle & Duplicate Session Prevention:
  ✓ Initial status is IDLE
  ✓ start() transitions status to RUNNING
  ✓ Calling start() when already RUNNING throws duplicate session error
  ✓ pause() transitions status to PAUSED
  ✓ resume() transitions status back to RUNNING
  ✓ stop() transitions status to IDLE
  ✓ destroy() tears down pipeline to IDLE
2. Testing SmartSpectra Validation Status & Quality Rules:
  ✓ Detects NO_FACE_DETECTED when faceDetected is false
  ✓ Generates actionable positioning recommendation
  ✓ Quality is UNAVAILABLE when face is not detected
  ✓ Detects INSUFFICIENT_LIGHTING for underexposed frame
  ✓ Detects EXCESSIVE_MOTION during rapid head movements
  ✓ Optimal parameters produce VALID status & OPTIMAL signal quality
3. Testing Camera Device Discovery:
  ✓ Lists available optical cameras (Front-facing default)
4. Testing Feature 1: Focus Session (Duration & Countdown Math):
  ✓ 25-minute default focus duration equals 1500 seconds
  ✓ Remaining countdown time correctly computes to 900 seconds (15m)
5. Testing Feature 2: Human Signal Availability & Zero-Simulation Integrity:
  ✓ Signal availability calculates correctly to 92%
  ✓ Pulse reading is strictly null when signal is unavailable
  ✓ Breathing reading is strictly null when signal is unavailable
6. Testing Feature 3: Guided Breathing Cadence Configurations:
  ✓ Box Breathing cycle duration is exactly 16 seconds (4-4-4-4)
  ✓ Coherent Resonance cadence equals ~5.45 BrPM
7. Testing Feature 4: Session Summary Contract & Zero-Stress Mandate:
  ✓ ZERO-STRESS MANDATE: stressIndex is undefined in session data
  ✓ ZERO-STRESS MANDATE: stressRecoveryDelta is undefined in session data
8. Testing Android Smartphone Architecture & PWA Standards:
  ✓ Supports native Android platform origin & minSdk 28+

Test Run Completed: 43 passed, 0 failed.
```

---

## 📱 Installing on Mobile (Progressive Web App)

PulsePause is a fully certified Progressive Web App with service worker offline caching:

1. **Deploy or host with HTTPS** (e.g., via the live Google Cloud app URL or run `npm run dev -- --host` on your local Wi-Fi).
2. **On Android (Chrome)**:
   - Tap the **"Install App"** button in the top navigation, or tap Chrome's three dots ($\vdots$) $\rightarrow$ **"Install app"** / **"Add to Home screen"**.
3. **On iPhone (Safari)**:
   - Tap the **Share** button ($\uparrow$) at the bottom of Safari $\rightarrow$ tap **"Add to Home Screen"**.
4. Launch **PulsePause** directly from your phone's home screen in fullscreen mode without browser borders.

---

## 🔑 SmartSpectra SDK Credentials & Configuration

PulsePause supports official API keys from the [Presage Developer Portal](https://physiology.presagetech.com/):

### Desktop Environment (Electron)
```bash
# On Linux / macOS / Git Bash
export SMARTSPECTRA_API_KEY="your-presage-api-key"

# On Windows PowerShell
$env:SMARTSPECTRA_API_KEY="your-presage-api-key"
```

### Android Environment
Add to `apps/android/local.properties`:
```properties
SMARTSPECTRA_API_KEY=your-presage-api-key
```

> **Note**: Even if you do not have a Presage commercial API key, PulsePause runs in **Standby Evaluation Mode** with full client-side optical skin chrominance extraction, focus sessions, and guided breathing.

---

## 🔒 Zero-Simulation & Zero-Stress Mandates

PulsePause is engineered in strict compliance with the **Presage SmartSpectra DEV Challenge Constitution**:

1. **Zero-Simulation Policy**:
   - The app **never** produces fake heart rates or mock numbers.
   - If you cover the camera, look away, or turn it to a wall, readings immediately drop to `null` (`--`) and flag `NO_FACE_DETECTED`.
2. **Zero-Stress Mandate**:
   - The app strictly presents **objective physiological telemetry**:
     - Pulse in **BPM**
     - Respiration in **BrPM**
     - Heart Rate Variability (RMSSD) in **ms**
     - Signal Availability in **%**
   - It makes **no subjective claims** regarding emotional stress, anxiety, or cognitive strain.
3. **100% On-Device Privacy**:
   - Video frames are processed ephemerally in RAM and instantly discarded.
   - Session telemetry is stored purely inside your device's local **IndexedDB** / SQLite database.

---

## 🛠 Troubleshooting & FAQ

### Q: Why is my camera preview black or showing an error?
- Ensure your browser has camera permission granted (click the lock/tune icon in the address bar and set Camera to **"Allow"**).
- Ensure no other application (Zoom, Teams, Discord) is currently using the webcam.

### Q: Why did Electron show a blank screen when running `npm run dev:desktop`?
- Electron expects either the live dev server on port 3000 (`npm run dev`) or a static build (`npm run build`).
- Simply run `npm run build && npm run dev:desktop` to load the application from disk.

### Q: What is Signal Availability %?
- Signal availability calculates: `Valid Focused Seconds / Total Elapsed Seconds × 100`.
- If you stay centered in frame with adequate lighting, your availability reaches 95–100%. If you step away from your desk, it records a clean signal gap.

---

## 📄 Submission Details & License

- **Challenge**: Presage SmartSpectra DEV Challenge
- **Author**: Srihari Bandi ([@srihari1247](https://github.com/srihari1247))
- **Live Demo**: [Google Cloud Production Deployment](https://ais-pre-fhakexuhnxofqowhfcaw7g-876110028765.asia-east1.run.app)
- **License**: Apache 2.0
