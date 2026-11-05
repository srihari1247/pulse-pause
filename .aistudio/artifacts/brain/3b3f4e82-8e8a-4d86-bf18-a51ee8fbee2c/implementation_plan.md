# PulsePause: Monorepo Architecture & Multi-Platform Implementation Plan

## Product Overview
**PulsePause** is an optical human-sensing wellness and cognitive focus companion powered by the **Presage SmartSpectra SDK**. It measures cardiac pulse waveforms (rPPG), heart rate variability (HRV), and respiratory line dynamics from standard optical video feeds on desktop and mobile platforms.

---

## Key Architectural Decisions

1. **Native Sensing Mandate (Zero Browser Fake Data):**
   - SmartSpectra does not provide a client-side JavaScript SDK due to browser video compression and non-deterministic event loops.
   - Sensing is delegated to **PulsePause Desktop (Electron + `@smartspectra/node-sdk`)** and **PulsePause Android (Kotlin + `com.presagetech:smartspectra:3.4.0`)**.
   - In standalone browser mode, PulsePause acts as an analytics viewer, pairing station, session controller, and guided coherent pacer with crystal-clear diagnostic reporting.
   - When optical signal is lost or unreliable, vitals are strictly reported as `null` / `Unavailable` without synthetic mock data.

2. **Zero-Stress & Objective Telemetry Mandate:**
   - In accordance with medical and wellness standards, PulsePause presents purely objective physiological measurements (Pulse BPM, Respiration BrPM, HRV ms, Signal Availability %).
   - No inference of stress, anxiety, emotional state, or productivity scores is performed.

3. **Optional Guided Breathing:**
   - Breathing guidance remains an optional, non-intrusive companion during focus sessions that can be collapsed or engaged at will.
   - Standalone breathing experience provides 3 visualizer styles (Orbital, Luminous, Resonant) with Web Audio soundscapes and phase chimes.

4. **Cross-Platform Shared Layer:**
   - `@pulsepause/domain-models`: Pure TypeScript definitions of vitals, waveforms, quality metrics, and session states.
   - `@pulsepause/shared-contracts`: Wire protocols, Electron IPC constants, validation thresholds, and IndexedDB/Room database schemas.
   - `@pulsepause/design-system`: Visual design tokens, Apple-grade dark palette, typography, and responsive component themes.

5. **Storage Parity:**
   - Web: IndexedDB (`pulsepause_web_db`) with indexed timestamps and session history.
   - Android: Room database (`pulsepause_android_db`) with reactive Kotlin Flow DAOs.

---

## Status of Deliverables

### Core Experience (Prompt 5)
- [x] **Feature 1: Focus Session**
  - 25-minute default focus interval with configurable duration pills (15m, 25m, 45m, 60m).
  - Elegant circular countdown timer with animated SVG stroke.
  - Live signal availability percentage indicator.
  - Pause, resume, and stop controls.
  - Local persistence to IndexedDB (`storage.saveSession`).
- [x] **Feature 2: Human Signal Experience**
  - Live pulse rate (BPM) and breathing rate (BrPM) from SmartSpectra.
  - Confidence percentage and quality classification (`OPTIMAL`, `DEGRADED`, `UNRELIABLE`, `UNAVAILABLE`).
  - Historical signal trends during session rendered via Recharts with clean null gap handling for occluded intervals.
  - Strict zero-stress and zero-emotion mandate verified across models and UI.
- [x] **Feature 3: Guided Breathing**
  - Configurable guided breathing visualizer with 3 switchable Apple-grade aesthetics (Orbital Satellite, Luminous Cyan, Resonant Rings).
  - Inhale, hold, exhale, and rest phase instructions with countdown numerals.
  - 4 selectable breathing patterns: Box (4-4-4-4), Coherent Resonance (5.5s), Long Exhale (4-7-8), and Gentle Flow (4-6).
  - Optional collapsible companion in focus session screen.
  - Instant stop control at any time.
- [x] **Feature 4: Session Summary**
  - Total focus duration.
  - Signal availability percentage (% of session with verified optical tracking).
  - Pulse and breathing trend chart with gap indicators for unverified intervals.
  - Guided breathing completion statistics (cycles completed, duration if engaged).
  - Session history list loaded from local IndexedDB.
- [x] **Automated Tests**
  - 42 automated tests in `test/smartspectra-provider.test.ts` covering provider lifecycle, duplicate session guard, validation report parsing, timer math, signal availability formulas, cadence durations, and zero-stress mandate assertions.
