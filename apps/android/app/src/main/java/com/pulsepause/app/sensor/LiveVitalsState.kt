package com.pulsepause.app.sensor

/**
 * Objective Live Vitals UI State for Jetpack Compose
 * Strictly presents physiological observations without stress or emotional inference.
 */
data class LiveVitalsState(
    val pulseBpm: Float = 0f,
    val isPulseReliable: Boolean = false,
    val hrvRmssd: Float = 0f,
    val respiratoryBrpm: Float = 0f,
    val isBreathingReliable: Boolean = false,
    val confidence: Float = 0f,
    val signalAvailabilityPercent: Int = 100,
    val isFaceDetected: Boolean = false,
    val rppgWaveformPoint: Float = 0f,
    val respirationWaveformPoint: Float = 0f,
    val isRunning: Boolean = false,
    val validationStatus: AndroidValidationStatus = AndroidValidationStatus.CALIBRATING,
    val validationReasons: List<String> = emptyList(),
    val errorMessage: String? = null
)
