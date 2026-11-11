import React, { useState } from 'react';
import {
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  Clock,
  Wind,
  Camera,
  BarChart3,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { PWAInstallButton } from './pwa/PWAInstallButton';

export type ScreenId = 'landing' | 'dashboard' | 'sensing' | 'focus' | 'breathing' | 'summary' | 'settings' | 'help';

interface NavigationProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  isNativeConnected?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  onNavigate,
  isNativeConnected = false
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { id: ScreenId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'focus', label: 'Focus', icon: Clock },
    { id: 'breathing', label: 'Breathing', icon: Wind },
    { id: 'sensing', label: 'Live Sensing', icon: Camera },
    { id: 'summary', label: 'Summary', icon: BarChart3 },
    { id: 'help', label: 'Help Guide', icon: HelpCircle }
  ];

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Safe vibration fallback
      }
    }
  };

  const handleLinkClick = (id: ScreenId) => {
    triggerHaptic();
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top App Bar (Desktop + Tablet + Mobile Header) */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#070b14]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-3.5">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleLinkClick('landing')}
              className="flex items-center gap-2.5 text-left group transition-transform active:scale-[0.98]"
            >
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-violet-500 p-[1px] shadow-lg shadow-sky-500/20">
                <div className="h-full w-full rounded-[11px] bg-[#070b14] flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-gradient-to-br from-sky-400 to-violet-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white font-sans whitespace-nowrap">
                  PulsePause
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-400">
            {navLinks.map((link) => {
              const isActive = currentScreen === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`relative py-1 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
                    isActive ? 'text-white font-semibold' : 'text-slate-400'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-400 to-violet-400 rounded-full" />
                  )}
                </button>
              );
            })}
            <button
              onClick={() => handleLinkClick('settings')}
              className={`relative py-1 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
                currentScreen === 'settings' ? 'text-white font-semibold' : 'text-slate-400'
              }`}
            >
              Settings
            </button>
          </nav>

          {/* Top Right Action & PWA Install Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <PWAInstallButton compact />

            <button
              onClick={() => handleLinkClick('focus')}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-3.5 py-1.5 text-xs font-semibold shadow-lg shadow-sky-950/40 transition-all active:scale-[0.98] whitespace-nowrap shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Start Focus</span>
            </button>

            {/* Mobile menu toggle for settings/landing access */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-slate-300 hover:text-white transition-colors"
              aria-label="Toggle Extra Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown for Secondary Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.06] bg-[#070b14]/98 backdrop-blur-2xl px-5 py-4 space-y-3 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleLinkClick('landing')}
                className={`p-3 text-left rounded-xl border font-medium ${
                  currentScreen === 'landing' ? 'border-sky-500/50 bg-sky-950/30 text-white' : 'border-white/[0.04] bg-white/[0.02] text-slate-300'
                }`}
              >
                About & Overview
              </button>
              <button
                onClick={() => handleLinkClick('settings')}
                className={`p-3 text-left rounded-xl border font-medium ${
                  currentScreen === 'settings' ? 'border-sky-500/50 bg-sky-950/30 text-white' : 'border-white/[0.04] bg-white/[0.02] text-slate-300'
                }`}
              >
                Settings & Privacy
              </button>
            </div>
            <div className="text-[11px] text-slate-500 font-mono text-center pt-1">
              Presage SmartSpectra Wellness Companion
            </div>
          </div>
        )}
      </header>

      {/* MOBILE-FIRST BOTTOM NAVIGATION BAR (Strict Mobile UX Requirement) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#070b14]/95 backdrop-blur-2xl px-2 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.7)]"
        aria-label="Mobile Bottom Navigation"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navLinks.map((item) => {
            const isActive = currentScreen === item.id;
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleLinkClick(item.id)}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl transition-all active:scale-90 ${
                  isActive ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-sky-500/15' : 'bg-transparent'}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <span className={`text-[10px] tracking-tight font-medium mt-0.5 ${isActive ? 'text-white font-bold' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
