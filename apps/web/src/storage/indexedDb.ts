/**
 * PulsePause Web Storage Engine (IndexedDB)
 * Offline-first repository for wellness sessions and biometric telemetry
 * Guaranteed schema parity with Android Room database
 */

import { WellnessSession, BiometricSample } from '@pulsepause/domain-models';

const DB_NAME = 'pulsepause_web_db';
const DB_VERSION = 1;
const SESSIONS_STORE = 'wellness_sessions';
const SAMPLES_STORE = 'biometric_samples';

export class IndexedDbStorage {
  private dbPromise: Promise<IDBDatabase | null>;
  private memorySessions: Map<string, WellnessSession> = new Map();
  private memorySamples: Map<string, BiometricSample[]> = new Map();

  constructor() {
    this.dbPromise = this.initDb();
  }

  private initDb(): Promise<IDBDatabase | null> {
    if (typeof indexedDB === 'undefined') {
      // In-memory fallback for Node.js test environments
      return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // Sessions table
          if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
            const sessionStore = db.createObjectStore(SESSIONS_STORE, { keyPath: 'id' });
            sessionStore.createIndex('startedAt', 'startedAt', { unique: false });
            sessionStore.createIndex('type', 'type', { unique: false });
            sessionStore.createIndex('status', 'status', { unique: false });
          }

          // Biometric telemetry samples table
          if (!db.objectStoreNames.contains(SAMPLES_STORE)) {
            const sampleStore = db.createObjectStore(SAMPLES_STORE, { keyPath: 'id' });
            sampleStore.createIndex('sessionId', 'sessionId', { unique: false });
            sampleStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  public async saveSession(session: WellnessSession): Promise<void> {
    const db = await this.dbPromise;
    if (!db) {
      this.memorySessions.set(session.id, session);
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(SESSIONS_STORE, 'readwrite');
      const store = tx.objectStore(SESSIONS_STORE);
      const req = store.put(session);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async getAllSessions(): Promise<WellnessSession[]> {
    const db = await this.dbPromise;
    if (!db) {
      return Array.from(this.memorySessions.values()).sort((a, b) => b.startedAt - a.startedAt);
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(SESSIONS_STORE, 'readonly');
      const store = tx.objectStore(SESSIONS_STORE);
      const index = store.index('startedAt');
      const req = index.openCursor(null, 'prev'); // Most recent first
      const results: WellnessSession[] = [];

      req.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async getRecentSessions(limit: number = 10): Promise<WellnessSession[]> {
    const all = await this.getAllSessions();
    return all.slice(0, limit);
  }

  public async getSessionById(id: string): Promise<WellnessSession | undefined> {
    const db = await this.dbPromise;
    if (!db) {
      return this.memorySessions.get(id);
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(SESSIONS_STORE, 'readonly');
      const store = tx.objectStore(SESSIONS_STORE);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  public async deleteSession(id: string): Promise<void> {
    const db = await this.dbPromise;
    if (!db) {
      this.memorySessions.delete(id);
      this.memorySamples.delete(id);
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction([SESSIONS_STORE, SAMPLES_STORE], 'readwrite');
      tx.objectStore(SESSIONS_STORE).delete(id);
      
      // Also delete related samples
      const sampleStore = tx.objectStore(SAMPLES_STORE);
      const sampleIndex = sampleStore.index('sessionId');
      const req = sampleIndex.openKeyCursor(IDBKeyRange.only(id));
      req.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursor>).result;
        if (cursor) {
          sampleStore.delete(cursor.primaryKey);
          cursor.continue();
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async saveSamples(sessionId: string, samples: BiometricSample[]): Promise<void> {
    if (samples.length === 0) return;
    const db = await this.dbPromise;
    if (!db) {
      const existing = this.memorySamples.get(sessionId) || [];
      this.memorySamples.set(sessionId, [...existing, ...samples]);
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(SAMPLES_STORE, 'readwrite');
      const store = tx.objectStore(SAMPLES_STORE);
      samples.forEach((sample, idx) => {
        store.put({
          ...sample,
          sessionId,
          id: `${sessionId}_${sample.timestamp}_${idx}`
        });
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async getSamplesForSession(sessionId: string): Promise<BiometricSample[]> {
    const db = await this.dbPromise;
    if (!db) {
      return this.memorySamples.get(sessionId) || [];
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(SAMPLES_STORE, 'readonly');
      const store = tx.objectStore(SAMPLES_STORE);
      const index = store.index('sessionId');
      const req = index.getAll(sessionId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }
}

export const storage = new IndexedDbStorage();
