/**
 * PulsePause Design System: Design Tokens
 * Apple-Grade Wellness & Modern SaaS aesthetic
 * Deep navy & charcoal canvas with electric blue, violet, and soft cyan accents
 */

export const PALETTE = {
  // Deep Navy & Charcoal Canvas
  canvas: {
    base: '#070b14',
    subtle: '#0a0f1d',
    surface: '#0f172a',
    elevated: '#141d33',
    card: 'rgba(15, 23, 42, 0.65)',
    border: 'rgba(255, 255, 255, 0.08)'
  },
  // Accents
  electricBlue: {
    500: '#38bdf8',
    400: '#60a5fa',
    glow: 'rgba(56, 189, 248, 0.25)'
  },
  violet: {
    500: '#a855f7',
    400: '#c084fc',
    glow: 'rgba(168, 85, 247, 0.25)'
  },
  softCyan: {
    500: '#22d3ee',
    400: '#67e8f9',
    glow: 'rgba(34, 211, 238, 0.25)'
  },
  // Cardiac / Bio
  cardiacRose: {
    500: '#f43f5e',
    400: '#fb7185'
  },
  bioEmerald: {
    500: '#10b981',
    400: '#34d399'
  }
} as const;

export const TYPOGRAPHY = {
  fontSans: 'Plus Jakarta Sans, system-ui, -apple-system, sans-serif',
  fontMono: 'JetBrains Mono, monospace'
};

export const MOTION = {
  smoothEase: 'cubic-bezier(0.16, 1, 0.3, 1)',
  breathingEase: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
};
