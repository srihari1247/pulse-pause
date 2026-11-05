import React, { useState } from 'react';
import { Layers, Laptop, Smartphone, Globe, ShieldCheck, Terminal, FileCode, CheckCircle, Database } from 'lucide-react';

export const ArchitectureInspector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'boundaries' | 'monorepo' | 'contracts' | 'commands'>('boundaries');

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-800 pb-2 gap-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('boundaries')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'boundaries' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Integration Boundaries & Zero-Sim</span>
        </button>

        <button
          onClick={() => setActiveTab('monorepo')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'monorepo' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Monorepo Topology</span>
        </button>

        <button
          onClick={() => setActiveTab('contracts')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'contracts' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCode className="h-4 w-4" />
          <span>Shared Contracts & Schemas</span>
        </button>

        <button
          onClick={() => setActiveTab('commands')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'commands' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>Development & Build Scripts</span>
        </button>
      </div>

      {activeTab === 'boundaries' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Desktop Electron */}
          <div className="rounded-2xl border border-cyan-800/60 bg-gradient-to-b from-cyan-950/30 to-slate-900/90 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Laptop className="h-5 w-5 text-cyan-400" />
              <h4 className="font-bold text-sm text-white">Desktop (Electron)</h4>
            </div>
            <div className="text-xs space-y-2 text-slate-300">
              <p>
                <strong>Engine:</strong> Official <code className="text-cyan-300 font-mono">@smartspectra/node-sdk</code>.
              </p>
              <p>
                <strong>Camera:</strong> Hardware-direct via Node.js C++ bindings. Frames pushed via <code className="text-cyan-300 font-mono">sdk.sendFrame()</code> in <code className="text-cyan-300 font-mono">PixelFormat.kRGB</code> at 30fps.
              </p>
              <p>
                <strong>Bridge:</strong> Electron IPC Preload exposing <code className="text-cyan-300 font-mono">window.pulsePauseBridge</code> with context isolation.
              </p>
            </div>
          </div>

          {/* Android Kotlin */}
          <div className="rounded-2xl border border-emerald-800/60 bg-gradient-to-b from-emerald-950/30 to-slate-900/90 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-emerald-400" />
              <h4 className="font-bold text-sm text-white">Android Native (Compose)</h4>
            </div>
            <div className="text-xs space-y-2 text-slate-300">
              <p>
                <strong>Engine:</strong> Official Maven <code className="text-emerald-300 font-mono">com.presagetech:smartspectra:3.4.0</code>.
              </p>
              <p>
                <strong>Camera:</strong> CameraX front-facing camera with <code className="text-emerald-300 font-mono">ImageAnalysis</code> analyzer.
              </p>
              <p>
                <strong>UI & Storage:</strong> Jetpack Compose <code className="text-emerald-300 font-mono">Canvas</code> for live rPPG waveforms; Room Database for offline persistence.
              </p>
            </div>
          </div>

          {/* Web Browser */}
          <div className="rounded-2xl border border-indigo-800/60 bg-gradient-to-b from-indigo-950/30 to-slate-900/90 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-400" />
              <h4 className="font-bold text-sm text-white">Web Shell (Browser)</h4>
            </div>
            <div className="text-xs space-y-2 text-slate-300">
              <p>
                <strong>Role:</strong> Responsive companion, pairing station, session controller, and analytics dashboard.
              </p>
              <p>
                <strong>Zero-Sim Rule:</strong> Browser does not simulate fake rPPG waveforms; clearly indicates native engine requirement.
              </p>
              <p>
                <strong>Storage:</strong> IndexedDB repository maintaining strict schema parity with Android Room.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'monorepo' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-3">
            PulsePause Monorepo Topology
          </h4>
          <pre className="font-mono text-xs text-slate-300 bg-slate-900/80 p-4 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
{`pulsepause/
├── apps/
│   ├── web/                    # React 19 + TypeScript + Vite + Tailwind CSS + IndexedDB
│   │   ├── src/
│   │   │   ├── bridge/         # IPC & WebSocket bridge detection
│   │   │   ├── components/     # Pacer, Framing Guide, Recharts visualizer
│   │   │   └── storage/        # IndexedDB offline-first repository
│   │   └── package.json
│   ├── desktop/                # Electron 34 Main & Preload integration
│   │   ├── src/
│   │   │   ├── main/           # Node.js process + @smartspectra/node-sdk pipeline
│   │   │   └── preload/        # Secure contextBridge window.pulsePauseBridge
│   │   └── package.json
│   └── android/                # Native Android (Kotlin 2.2+, Jetpack Compose, Room)
│       ├── app/
│       │   ├── src/main/java/com/pulsepause/app/
│       │   │   ├── data/       # Room database (SessionDao, AppDatabase)
│       │   │   ├── sensor/     # SmartSpectraSdk + CameraX ImageAnalysis
│       │   │   └── ui/         # Jetpack Compose UI & Compose Canvas rPPG
│       │   └── build.gradle.kts
│       └── settings.gradle.kts
├── packages/
│   ├── domain-models/          # Platform-agnostic biometric & session types
│   ├── shared-contracts/       # IPC channels, validation rules & wire protocols
│   └── design-system/          # Design tokens, calm color palettes & themes
├── docs/
│   ├── architecture.md         # Full architecture specification
│   ├── implementation-plan.md  # Multi-phase execution roadmap
│   └── smartspectra-integration.md # SmartSpectra SDK integration guide
├── README.md                   # Project overview & developer guide
└── package.json                # Workspaces & build orchestrations`}
          </pre>
        </div>
      )}

      {activeTab === 'contracts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
            <h5 className="text-xs font-bold text-cyan-300 font-mono uppercase">
              TypeScript (@pulsepause/domain-models)
            </h5>
            <pre className="font-mono text-[11px] text-slate-300 bg-slate-900 p-3 rounded-lg overflow-x-auto">
{`export interface BiometricSample {
  timestamp: number;
  pulseRate: number;      // BPM
  hrvRmssd: number;       // ms
  respiratoryRate: number;// BrPM
  stressIndex: number;    // 0 - 100
  coherenceScore: number; // 0.0 - 1.0
  signalQuality: SignalQualityLevel;
  confidence: number;
  rawPpgSample?: number;
  rawRespSample?: number;
}`}
            </pre>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
            <h5 className="text-xs font-bold text-emerald-300 font-mono uppercase">
              Kotlin Room Entity (AppDatabase.kt)
            </h5>
            <pre className="font-mono text-[11px] text-slate-300 bg-slate-900 p-3 rounded-lg overflow-x-auto">
{`@Entity(tableName = "biometric_samples")
data class BiometricSampleEntity(
    @PrimaryKey val id: String,
    val sessionId: String,
    val timestamp: Long,
    val pulseRate: Float,
    val hrvRmssd: Float,
    val respiratoryRate: Float,
    val stressIndex: Float,
    val coherenceScore: Float,
    val signalQuality: String,
    val confidence: Float,
    val rawPpgSample: Float?,
    val rawRespSample: Float?
)`}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'commands' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
            Development & Build Orchestration
          </h4>

          <div className="space-y-3">
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-white">Start Web Application Shell</p>
                <p className="text-[11px] text-slate-400">Vite dev server on port 3000</p>
              </div>
              <code className="text-xs font-mono text-cyan-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                npm run dev
              </code>
            </div>

            <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-white">Launch Desktop Electron Companion</p>
                <p className="text-[11px] text-slate-400">Electron with native @smartspectra/node-sdk bridge</p>
              </div>
              <code className="text-xs font-mono text-cyan-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                npm run dev:desktop
              </code>
            </div>

            <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-white">Build Android APK</p>
                <p className="text-[11px] text-slate-400">Gradle build with CameraX & SmartSpectra SDK 3.4.0</p>
              </div>
              <code className="text-xs font-mono text-emerald-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                cd apps/android && ./gradlew assembleDebug
              </code>
            </div>

            <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-white">Compile Monorepo Packages & Shell</p>
                <p className="text-[11px] text-slate-400">TypeScript strict build validation</p>
              </div>
              <code className="text-xs font-mono text-amber-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                npm run build
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
