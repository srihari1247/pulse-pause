/**
 * PulsePause Shared Contracts: Storage Specification
 * Canonical schema definitions maintained in parity between Web IndexedDB and Android Room
 */

import { WellnessSession, BiometricSample } from '@pulsepause/domain-models';

export interface StorageSchemaVersion {
  version: number;
  migrationDate: string;
}

export const CURRENT_SCHEMA_VERSION: StorageSchemaVersion = {
  version: 1,
  migrationDate: '2026-11-05'
};

export interface StoredSessionRecord extends WellnessSession {
  syncedAt?: number;
  isFavorite?: boolean;
}

export interface StoredSampleRecord extends BiometricSample {
  sessionId: string;
  id: string;
}

export interface SessionFilterQuery {
  startDate?: number;
  endDate?: number;
  sessionType?: string;
  limit?: number;
  offset?: number;
}
