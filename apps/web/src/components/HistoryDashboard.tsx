import React, { useState, useEffect } from 'react';
import { Database, Trash2, Download, RefreshCw, Calendar, Clock, Heart, Zap, Award } from 'lucide-react';
import { WellnessSession } from '@pulsepause/domain-models';
import { storage } from '../storage/indexedDb';

export const HistoryDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<WellnessSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSession, setSelectedSession] = useState<WellnessSession | null>(null);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await storage.getAllSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions from IndexedDB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this session record from local IndexedDB?')) {
      await storage.deleteSession(id);
      await loadSessions();
      if (selectedSession?.id === id) {
        setSelectedSession(null);
      }
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pulsepause_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const totalMinutes = Math.round(
    sessions.reduce((acc, curr) => acc + (curr.elapsedSeconds || 0), 0) / 60
  );

  return (
    <div className="space-y-6">
      {/* Top Storage Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Database className="h-4 w-4 text-indigo-400" />
            <span>IndexedDB Local Session Store</span>
          </h3>
          <p className="text-xs text-slate-400">
            Offline-first client database maintained in parity with Android Room database schema.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSessions}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportJson}
            disabled={sessions.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-3 py-1.5 text-xs font-semibold shadow-md transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Aggregate Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[11px] font-mono uppercase text-slate-400">Total Mindful Time</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-white">{totalMinutes}</span>
            <span className="text-xs font-mono text-indigo-400">MINUTES</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[11px] font-mono uppercase text-slate-400">Recorded Sessions</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-white">{sessions.length}</span>
            <span className="text-xs font-mono text-emerald-400">SESSIONS</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[11px] font-mono uppercase text-slate-400">Database Engine</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-sm font-semibold text-white">IndexedDB v1</span>
            <span className="text-xs font-mono text-cyan-400">LOCAL ONLY</span>
          </div>
        </div>
      </div>

      {/* Sessions Table / List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading IndexedDB storage records...</div>
        ) : sessions.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Calendar className="h-8 w-8 text-slate-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-300">No session records found in IndexedDB</p>
            <p className="text-[11px] text-slate-500">
              Run a MicroPause, Coherent Resonance, or Focus session in the Session Runner to log your first record.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {sessions.map((session) => {
              const isSelected = selectedSession?.id === session.id;
              return (
                <div
                  key={session.id}
                  onClick={() => setSelectedSession(isSelected ? null : session)}
                  className={`p-4 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected ? 'bg-slate-800/60' : 'hover:bg-slate-900/50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{session.type.replace('_', ' ')}</span>
                      <span className="rounded bg-slate-950 border border-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-indigo-300 uppercase">
                        {session.sourcePlatform}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {new Date(session.startedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{session.notes}</p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-slate-200">
                        {Math.round(session.elapsedSeconds / 60)}m {session.elapsedSeconds % 60}s
                      </div>
                      <div className="text-[10px] text-slate-500">Duration</div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(session.id, e)}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-500 hover:border-rose-900 hover:text-rose-400 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
