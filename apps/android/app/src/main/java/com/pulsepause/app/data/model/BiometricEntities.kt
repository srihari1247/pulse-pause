package com.pulsepause.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Android Room Entity in 1:1 parity with @pulsepause/domain-models WellnessSession
 * Strictly objective: tracks duration, signal availability, pulse and respiration where valid.
 */
@Entity(tableName = "sessions")
data class SessionEntity(
    @PrimaryKey val id: String,
    val type: String, // FOCUS_SESSION, GUIDED_BREATHING, HRV_CALIBRATION
    val status: String,
    val startedAt: Long,
    val endedAt: Long?,
    val targetDurationSeconds: Int,
    val elapsedSeconds: Int,
    val signalAvailabilityPercent: Float,
    val validSampleCount: Int,
    val totalSampleCount: Int,
    val averagePulseBpm: Float?,
    val minPulseBpm: Float?,
    val maxPulseBpm: Float?,
    val averageRespiratoryRate: Float?,
    val minRespiratoryRate: Float?,
    val maxRespiratoryRate: Float?,
    val averageHrvRmssd: Float?,
    val guidedBreathingEngaged: Boolean = false,
    val guidedBreathingCyclesCompleted: Int = 0,
    val guidedBreathingDurationSeconds: Int = 0,
    val overallQuality: String,
    val sourcePlatform: String = "android",
    val notes: String? = null,
    val syncedAt: Long? = null
)

@Entity(tableName = "biometric_samples")
data class BiometricSampleEntity(
    @PrimaryKey val id: String,
    val sessionId: String,
    val timestamp: Long,
    val pulseRate: Float?,
    val hrvRmssd: Float?,
    val respiratoryRate: Float?,
    val respiratoryLineLength: Float?,
    val signalQuality: String,
    val confidence: Float,
    val rawPpgSample: Float?,
    val rawRespSample: Float?
)
