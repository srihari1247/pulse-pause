import React from 'react';
import { Play, Wind, Clock, Flame, Activity, ArrowUpRight, ChevronRight, BarChart2, Calendar } from 'lucide-react';
import { ScreenId } from './Navigation';
import { WellnessSession } from '@pulsepause/domain-models';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DashboardScreenProps {
  onNavigate: (screen: ScreenId) => void;
  recentSessions: WellnessSession[];
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate, recentSessions }) => {
  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const latestSession = recentSessions.length > 0 ? recentSessions[0] : null;

  // Mock-aligned weekly activity data for Recharts (actual days of week)
  const weeklyData = [
    { day: 'Mon', minutes: 12, sessions: 2 },
    { day: 'Tue', minutes: 25, sessions: 3 },
    { day: 'Wed', minutes: 18, sessions: 2 },
    { day: 'Thu', minutes: 30, sessions: 4 },
    { day: 'Fri', minutes: 22, sessions: 3 },
    { day: 'Sat', minutes: 15, sessions: 2 },
    { day: 'Sun', minutes: 28, sessions: 3 }
  ];

  const totalWeeklyMinutes = weeklyData.reduce((acc, c) => acc + c.minutes, 0);

  return (
    <div className="space-y-8 py-4">
      {/* Top Greeting & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {getGreeting()}, Srihari
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Presage SmartSpectra optical sensors stand by. Ready for your 25-minute focus session?
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('focus')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-4 py-2.5 text-xs font-semibold shadow-lg shadow-sky-950/40 transition-all active:scale-[0.98]"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            <span>Start Focus Session</span>
          </button>

          <button
            onClick={() => onNavigate('breathing')}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-white px-4 py-2.5 text-xs font-semibold transition-all active:scale-[0.98]"
          >
            <Wind className="h-3.5 w-3.5 text-emerald-400" />
            <span>Quick Breathe</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Large Cards on Top */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Start Focus Session & Quick Calibrate (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-white/[0.08] bg-gradient-to-br from-slate-900/80 via-[#0a0f1d] to-[#070b14] p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between space-y-6">
          <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-sky-500/10 blur-[80px]" />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold">
                Autonomous Bio-Guardian
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Begin a 25-Minute Focused Flow
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
              PulsePause runs in the background or paired desktop bridge, gently alerting you to shallow breathing patterns or cognitive strain before fatigue compounds.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
              <span className="text-[11px] text-slate-400 block">Cadence Target</span>
              <span className="font-mono text-base font-bold text-white mt-0.5 block">5.5 BrPM</span>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
              <span className="text-[11px] text-slate-400 block">Rest Interval</span>
              <span className="font-mono text-base font-bold text-sky-400 mt-0.5 block">After 25m</span>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
              <span className="text-[11px] text-slate-400 block">rPPG Status</span>
              <span className="font-mono text-base font-bold text-emerald-400 mt-0.5 block">Standby</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => onNavigate('focus')}
              className="flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
            >
              <span>Launch Focus Protocol</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <span className="text-[11px] text-slate-500 font-mono">Presage SmartSpectra Ready</span>
          </div>
        </div>

        {/* Card 2: Latest Session Recap (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Latest Session
            </span>
            <button
              onClick={() => onNavigate('summary')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {latestSession ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {latestSession.type.replace('_', ' ')}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Completed on {new Date(latestSession.startedAt).toLocaleDateString()} at{' '}
                  {new Date(latestSession.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Duration</span>
                  <p className="font-mono text-xl font-bold text-white mt-1">
                    {Math.round(latestSession.elapsedSeconds / 60)}m {latestSession.elapsedSeconds % 60}s
                  </p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Signal Availability</span>
                  <p className="font-mono text-xl font-bold text-sky-400 mt-1">
                    {latestSession.signalAvailabilityPercent ?? 100}%
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 italic">
                "{latestSession.notes || 'Focus session completed with continuous optical telemetry.'}"
              </p>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <Clock className="h-8 w-8 text-slate-600 mx-auto" />
              <div>
                <p className="text-xs font-semibold text-slate-300">No session logged today</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Take a 2-minute pause to record your first biofeedback session.</p>
              </div>
              <button
                onClick={() => onNavigate('breathing')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 text-xs font-medium transition-colors"
              >
                <span>Take a 2-Min Pause</span>
              </button>
            </div>
          )}

          <div className="border-t border-white/[0.06] pt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Storage: Local IndexedDB</span>
            <span className="font-mono text-emerald-400">Synced</span>
          </div>
        </div>
      </div>

      {/* Row 2: Weekly Activity Statistics & Breathing Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Chart (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Weekly Session Mindfulness Activity
              </h3>
              <p className="text-xs text-slate-400">
                Total mindful focus & recovery time over the past 7 days.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">
                Weekly Total: <strong className="text-white text-sm">{totalWeeklyMinutes} min</strong>
              </span>
            </div>
          </div>

          {/* Recharts Bar Chart */}
          <div className="h-56 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="m" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                />
                <Bar dataKey="minutes" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breathing Activity Summary (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between space-y-5">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Breathing Cadence
              </span>
              <Wind className="h-4 w-4 text-emerald-400" />
            </div>
            <h4 className="text-base font-bold text-white">Vagal Coherence Ratio</h4>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-400">Resonance Score</span>
              <span className="font-mono text-2xl font-bold text-white">92<span className="text-xs text-slate-400 font-normal">/100</span></span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 w-[92%]" />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your 5.5s coherent breathing rhythm aligns with your natural cardiac respiratory sinus arrhythmia (RSA).
            </p>
          </div>

          <button
            onClick={() => onNavigate('breathing')}
            className="w-full py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-white transition-all text-center"
          >
            Open Breathing Experience
          </button>
        </div>
      </div>
    </div>
  );
};
