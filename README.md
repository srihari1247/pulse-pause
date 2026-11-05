# PulsePause 🫀🧘‍♂️

> Camera-Based Human-Sensing Wellness and Focus Companion powered by the **Presage SmartSpectra SDK**.

PulsePause is a multi-platform biofeedback and cognitive focus guardian. Utilizing remote photoplethysmography (rPPG) and respiratory movement analysis from ordinary optical video feeds, PulsePause measures cardiac pulse rate, heart rate variability (HRV), respiratory rate, and facial autonomic indicators without wearable sensors.

---

## 🏛 Architecture & Monorepo Layout

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
│   └── smartspectra-integration.md # Presage SDK technical integration guide
├── README.md                 # Project guide (this file)
└── package.json              # Monorepo workspaces & build orchestration
```

---

## ⚡️ Technology Stack

| Component | Web Companion | Desktop Companion | Android Native App |
| :--- | :--- | :--- | :--- |
| **Framework** | React 19, Vite, Tailwind CSS | Electron 34, React UI | Jetpack Compose, Kotlin 2.2+ |
| **Sensing Engine** | Remote IPC / Pair Client | `@smartspectra/node-sdk` | `com.presagetech:smartspectra:3.4.0` |
| **Storage** | IndexedDB | IndexedDB / Electron Store | Room Database (SQLite) |
| **Visualizers** | Recharts & SVG Canvases | Recharts & SVG Canvases | Jetpack Compose `Canvas` |
| **Zero-Sim Rule**| Strictly enforced | Strictly enforced | Strictly enforced |

---

## 🔑 Presage SmartSpectra SDK Credentials

PulsePause requires an active SmartSpectra API key from the [Presage Developer Portal](https://physiology.presagetech.com/).

### Desktop Environment (Electron)
```bash
export SMARTSPECTRA_API_KEY="your-presage-api-key"
```

### Android Environment
Add to your `local.properties` or environment:
```properties
SMARTSPECTRA_API_KEY=your-presage-api-key
```
This is mapped into `BuildConfig.SMARTSPECTRA_API_KEY` via `app/build.gradle.kts`.

---

## 🚀 Quickstart & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Web Application Shell
```bash
npm run dev
# Starts Vite dev server on http://localhost:3000
```

### 3. Run Desktop Electron App
```bash
npm run desktop:dev
# Launches Electron with hot-reloading Web renderer and native Node SDK bridge
```

### 4. Build Android Application
```bash
cd apps/android
./gradlew assembleDebug
# Installs debug APK onto connected Android device or emulator (minSdk 28, Android 9+)
```

---

## 🔒 Privacy & On-Device Processing
- **No Video Recording:** PulsePause and the SmartSpectra SDK process frames ephemerally in RAM. Raw frames are immediately discarded.
- **Local Storage:** All session vitals and HRV trends are stored locally on your device (IndexedDB on Web, Room on Android).
