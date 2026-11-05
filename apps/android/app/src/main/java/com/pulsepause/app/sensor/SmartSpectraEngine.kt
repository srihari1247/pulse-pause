package com.pulsepause.app.sensor

import android.content.Context
import androidx.camera.view.PreviewView
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.Observer
import com.presagetech.smartspectra.SmartSpectraSdk
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class AndroidProcessingStatus {
    IDLE,
    STARTING,
    RUNNING,
    PAUSED,
    STOPPING,
    ERROR
}

enum class AndroidValidationStatus {
    VALID,
    INSUFFICIENT_LIGHTING,
    EXCESSIVE_MOTION,
    POOR_FACE_POSITIONING,
    NO_FACE_DETECTED,
    CALIBRATING
}

data class AndroidSignalData(
    val pulseBpm: Float? = null,
    val isPulseReliable: Boolean = false,
    val pulseConfidence: Float = 0f,
    val respiratoryBrpm: Float? = null,
    val isBreathingReliable: Boolean = false,
    val breathingConfidence: Float = 0f,
    val hrvRmssd: Float? = null,
    val ppgSample: Float = 0f,
    val respirationSample: Float = 0f,
    val validationStatus: AndroidValidationStatus = AndroidValidationStatus.CALIBRATING,
    val validationReasons: List<String> = emptyList(),
    val processingStatus: AndroidProcessingStatus = AndroidProcessingStatus.IDLE,
    val errorMessage: String? = null,
    val isFaceDetected: Boolean = false
)

/**
 * Official Presage SmartSpectra Kotlin SDK Integration
 * Implements Android HumanSignalProvider interface matching SmartSpectraSdk.shared architecture
 */
class SmartSpectraEngine(
    private val context: Context,
    private val lifecycleOwner: LifecycleOwner,
    private val apiKey: String
) {
    private val _signalFlow = MutableStateFlow(AndroidSignalData())
    val signalFlow: StateFlow<AndroidSignalData> = _signalFlow.asStateFlow()

    private val sdk = SmartSpectraSdk.shared

    init {
        configureSdk()
        observeSdkStreams()
    }

    private fun configureSdk() {
        if (apiKey.isNotBlank()) {
            sdk.config.apiKey = apiKey
        }
    }

    /**
     * Attaches CameraX PreviewView surface provider directly into SmartSpectraSdk configuration
     */
    fun attachPreview(previewView: PreviewView) {
        sdk.config.previewSurfaceProvider = previewView.surfaceProvider
        // Disable redundant bitmap generation when native Surface is attached
        sdk.config.imageOutputEnabled = false
    }

    private fun observeSdkStreams() {
        // 1. Observe Processing Lifecycle Status
        sdk.processingStatus.observe(lifecycleOwner, Observer { status ->
            val mappedStatus = when (status?.toString()?.uppercase()) {
                "STARTING" -> AndroidProcessingStatus.STARTING
                "RUNNING" -> AndroidProcessingStatus.RUNNING
                "PAUSED" -> AndroidProcessingStatus.PAUSED
                "STOPPING" -> AndroidProcessingStatus.STOPPING
                "ERROR" -> AndroidProcessingStatus.ERROR
                else -> AndroidProcessingStatus.IDLE
            }
            _signalFlow.value = _signalFlow.value.copy(processingStatus = mappedStatus)
        })

        // 2. Observe Validation Status (Lighting, Motion, Positioning)
        sdk.validationStatus.observe(lifecycleOwner, Observer { validation ->
            val reasons = mutableListOf<String>()
            var status = AndroidValidationStatus.VALID
            var faceDetected = true

            // Parse official SmartSpectra validation object
            if (validation != null) {
                // If the SDK indicates poor face positioning
                if (validation.toString().contains("NO_FACE", ignoreCase = true)) {
                    status = AndroidValidationStatus.NO_FACE_DETECTED
                    faceDetected = false
                    reasons.add("Face not detected in camera frame")
                } else if (validation.toString().contains("LIGHT", ignoreCase = true)) {
                    status = AndroidValidationStatus.INSUFFICIENT_LIGHTING
                    reasons.add("Lighting too dim or harsh glare detected")
                } else if (validation.toString().contains("MOTION", ignoreCase = true)) {
                    status = AndroidValidationStatus.EXCESSIVE_MOTION
                    reasons.add("Excessive motion disrupting optical baseline")
                } else if (validation.toString().contains("POSITION", ignoreCase = true)) {
                    status = AndroidValidationStatus.POOR_FACE_POSITIONING
                    reasons.add("Align face within the front camera target reticle")
                }
            }

            _signalFlow.value = _signalFlow.value.copy(
                validationStatus = status,
                validationReasons = reasons,
                isFaceDetected = faceDetected
            )
        })

        // 3. Observe Physiological Metrics (Pulse, Breathing, HRV)
        sdk.metrics.observe(lifecycleOwner, Observer { metrics ->
            if (metrics != null) {
                val currentValidation = _signalFlow.value.validationStatus
                val isReliable = currentValidation == AndroidValidationStatus.VALID

                // Never display fabricated readings: null when unreliable or absent
                val pulseVal = if (metrics.pulseRate > 0) metrics.pulseRate else null
                val respVal = if (metrics.respiratoryRate > 0) metrics.respiratoryRate else null

                _signalFlow.value = _signalFlow.value.copy(
                    pulseBpm = pulseVal,
                    isPulseReliable = isReliable && pulseVal != null,
                    pulseConfidence = metrics.confidence,
                    respiratoryBrpm = respVal,
                    isBreathingReliable = isReliable && respVal != null,
                    breathingConfidence = metrics.confidence,
                    hrvRmssd = if (metrics.hrv > 0) metrics.hrv else null,
                    ppgSample = metrics.ppgSample,
                    respirationSample = metrics.respiratorySample
                )
            }
        })

        // 4. Observe Errors
        sdk.errors.observe(lifecycleOwner, Observer { error ->
            if (error != null) {
                _signalFlow.value = _signalFlow.value.copy(
                    processingStatus = AndroidProcessingStatus.ERROR,
                    errorMessage = error.localizedMessage ?: "SmartSpectra pipeline error"
                )
            }
        })
    }

    /**
     * Starts sensing. Prevents duplicate camera sessions.
     */
    fun startSensing() {
        val current = _signalFlow.value.processingStatus
        if (current == AndroidProcessingStatus.STARTING || current == AndroidProcessingStatus.RUNNING) {
            // Prevent duplicate sessions
            return
        }

        try {
            sdk.start()
        } catch (e: Exception) {
            _signalFlow.value = _signalFlow.value.copy(
                processingStatus = AndroidProcessingStatus.ERROR,
                errorMessage = e.localizedMessage
            )
        }
    }

    fun pauseSensing() {
        if (_signalFlow.value.processingStatus == AndroidProcessingStatus.RUNNING) {
            sdk.pause()
        }
    }

    fun resumeSensing() {
        if (_signalFlow.value.processingStatus == AndroidProcessingStatus.PAUSED) {
            sdk.resume()
        }
    }

    fun stopSensing() {
        sdk.stop()
    }

    fun release() {
        sdk.stop()
        sdk.destroy()
    }
}
