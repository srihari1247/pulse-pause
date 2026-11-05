/**
 * PulsePause Design System: Wellness Themes
 */

import { PALETTE } from './tokens';

export interface WellnessThemeConfig {
  id: string;
  name: string;
  accentColor: string;
  glowColor: string;
  bgGradient: string;
  targetBrpm: number;
  description: string;
}

export const WELLNESS_THEMES: Record<string, WellnessThemeConfig> = {
  CALM: {
    id: 'CALM',
    name: 'Coherent Calm',
    accentColor: PALETTE.bioEmerald[400],
    glowColor: 'rgba(16, 185, 129, 0.25)',
    bgGradient: 'from-emerald-950/30 via-slate-900 to-slate-950',
    targetBrpm: 5.5,
    description: 'Resonant autonomic regulation at 5.5 breaths per minute to boost vagal tone and HRV.'
  },
  FOCUS: {
    id: 'FOCUS',
    name: 'Deep Focus',
    accentColor: PALETTE.electricBlue[500],
    glowColor: PALETTE.electricBlue.glow,
    bgGradient: 'from-sky-950/30 via-slate-900 to-slate-950',
    targetBrpm: 8.0,
    description: 'Sustained cognitive clarity with ambient optical strain monitoring.'
  },
  RECOVER: {
    id: 'RECOVER',
    name: 'Vagal Recovery',
    accentColor: PALETTE.violet[500],
    glowColor: PALETTE.violet.glow,
    bgGradient: 'from-violet-950/30 via-slate-900 to-slate-950',
    targetBrpm: 6.0,
    description: 'Extended exhalation (4s inhale, 7s hold, 8s exhale) for rapid parasympathetic activation.'
  },
  ENERGIZE: {
    id: 'ENERGIZE',
    name: 'Alert Reset',
    accentColor: PALETTE.softCyan[500],
    glowColor: PALETTE.softCyan.glow,
    bgGradient: 'from-cyan-950/30 via-slate-900 to-slate-950',
    targetBrpm: 12.0,
    description: 'Active energizing rhythm to dispel afternoon fatigue and mental lethargy.'
  }
};
