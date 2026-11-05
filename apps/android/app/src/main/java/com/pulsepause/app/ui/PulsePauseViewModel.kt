package com.pulsepause.app.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.pulsepause.app.data.db.AppDatabase
import com.pulsepause.app.data.model.SessionEntity
import com.pulsepause.app.sensor.AndroidSignalData
import com.pulsepause.app.sensor.AndroidValidationStatus
import com.pulsepause.app.sensor.LiveVitalsState
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

enum class AndroidNavTab {
    FOCUS,
    SENSING,
    BREATHING,
    SUMMARY
}

data class AndroidBreathingPattern(
    val id: String,
    val name: String,
    val description: String,
    val inhaleSec: Float,
    val holdSec: Float,
    val exhaleSec: Float,
    val restSec: Float = 0f
)

val ANDROID_BREATHING_PATTERNS = listOf(
    AndroidBreathingPattern("446", "4-4-6 Breathing", "Balanced pacing with extended exhalation", 4f, 4f, 6f, 0f),
    AndroidBreathingPattern("box", "Square (4-4-4-4)", "Equal quad-cadence for steady attention", 4f, 4f, 4f, 4f),
    AndroidBreathingPattern("resonance", "Resonance (5.5s)", "5.5 BrPM coherent vagal synchrony", 5.5f, 0f, 5.5f, 0f),
    AndroidBreathingPattern("478", "Long Exhale (4-7-8)", "Parasympathetic recovery rhythm", 4f, 7f, 8f, 0f)
)

data class FocusSessionUiState(
    val targetMinutes: Int = 25,
    val elapsedSeconds: Int = 0,
    val isSessionRunning: Boolean = false,
    val isSessionPaused: Boolean = false,
    val validSignalSeconds: Int = 0,
    val signalAvailabilityPercent: Int = 100,
    val currentPattern: AndroidBreathingPattern = ANDROID_BREATHING_PATTERNS[0],
    val currentPhase: String = "Inhale",
    val phaseRemainingSec: Float = 4f,
    val phaseProgress: Float = 0f,
    val completedCycles: Int = 0
)

class PulsePauseViewModel(
    private val database: AppDatabase? = null
) : ViewModel() {

    private val _currentTab = MutableStateFlow(AndroidNavTab.FOCUS)
    val currentTab: StateFlow<AndroidNavTab> = _currentTab.asStateFlow()

    private val _focusState = MutableStateFlow(FocusSessionUiState())
    val focusState: StateFlow<FocusSessionUiState> = _focusState.asStateFlow()

    private val _vitals = MutableStateFlow(LiveVitalsState())
    val vitals: StateFlow<LiveVitalsState> = _vitals.asStateFlow()

    private var timerJob: Job? = null
    private var breathingJob: Job? = null

    fun selectTab(tab: AndroidNavTab) {
        _currentTab.value = tab
    }

    fun updateSignalData(signal: AndroidSignalData) {
        val isRunning = signal.processingStatus.name == "RUNNING"
        val isReliable = signal.validationStatus == AndroidValidationStatus.VALID

        _vitals.value = LiveVitalsState(
            pulseBpm = signal.pulseBpm ?: 0f,
            isPulseReliable = signal.isPulseReliable,
            hrvRmssd = signal.hrvRmssd ?: 0f,
            respiratoryBrpm = signal.respiratoryBrpm ?: 0f,
            isBreathingReliable = signal.isBreathingReliable,
            confidence = signal.pulseConfidence,
            signalAvailabilityPercent = _focusState.value.signalAvailabilityPercent,
            isFaceDetected = signal.isFaceDetected,
            rppgWaveformPoint = signal.ppgSample,
            respirationWaveformPoint = signal.respirationSample,
            isRunning = isRunning,
            validationStatus = signal.validationStatus,
            validationReasons = signal.validationReasons,
            errorMessage = signal.errorMessage
        )

        // Increment valid signal accumulator when active
        if (_focusState.value.isSessionRunning && !_focusState.value.isSessionPaused && isReliable) {
            val nextValid = _focusState.value.validSignalSeconds + 1
            val elapsed = _focusState.value.elapsedSeconds
            val availability = if (elapsed > 0) (nextValid * 100) / elapsed else 100
            _focusState.value = _focusState.value.copy(
                validSignalSeconds = nextValid,
                signalAvailabilityPercent = availability.coerceIn(0, 100)
            )
        }
    }

    fun setTargetMinutes(mins: Int) {
        if (!_focusState.value.isSessionRunning) {
            _focusState.value = _focusState.value.copy(
                targetMinutes = mins,
                elapsedSeconds = 0
            )
        }
    }

    fun selectBreathingPattern(pattern: AndroidBreathingPattern) {
        _focusState.value = _focusState.value.copy(
            currentPattern = pattern,
            phaseRemainingSec = pattern.inhaleSec,
            currentPhase = "Inhale"
        )
    }

    fun startSession(onStartCamera: () -> Unit) {
        _focusState.value = _focusState.value.copy(
            isSessionRunning = true,
            isSessionPaused = false
        )
        onStartCamera()
        startTimerLoop()
        startBreathingLoop()
    }

    fun pauseSession(onPauseCamera: () -> Unit) {
        _focusState.value = _focusState.value.copy(isSessionPaused = true)
        onPauseCamera()
    }

    fun resumeSession(onResumeCamera: () -> Unit) {
        _focusState.value = _focusState.value.copy(isSessionPaused = false)
        onResumeCamera()
    }

    fun stopSession(onStopCamera: () -> Unit) {
        _focusState.value = _focusState.value.copy(
            isSessionRunning = false,
            isSessionPaused = false
        )
        timerJob?.cancel()
        breathingJob?.cancel()
        onStopCamera()
        saveSessionRecord()
    }

    private fun startTimerLoop() {
        timerJob?.cancel()
        timerJob = viewModelScope.launch {
            while (_focusState.value.isSessionRunning) {
                delay(1000L)
                if (!_focusState.value.isSessionPaused) {
                    val nextElapsed = _focusState.value.elapsedSeconds + 1
                    val targetSecs = _focusState.value.targetMinutes * 60
                    _focusState.value = _focusState.value.copy(elapsedSeconds = nextElapsed)

                    if (nextElapsed >= targetSecs) {
                        stopSession {}
                        break
                    }
                }
            }
        }
    }

    private fun startBreathingLoop() {
        breathingJob?.cancel()
        breathingJob = viewModelScope.launch {
            var phase = "Inhale"
            var phaseDuration = _focusState.value.currentPattern.inhaleSec
            var phaseElapsed = 0f

            while (_focusState.value.isSessionRunning) {
                delay(100L)
                if (!_focusState.value.isSessionPaused) {
                    phaseElapsed += 0.1f
                    if (phaseElapsed >= phaseDuration) {
                        phaseElapsed = 0f
                        val pattern = _focusState.value.currentPattern
                        when (phase) {
                            "Inhale" -> {
                                if (pattern.holdSec > 0) {
                                    phase = "Hold"
                                    phaseDuration = pattern.holdSec
                                } else {
                                    phase = "Exhale"
                                    phaseDuration = pattern.exhaleSec
                                }
                            }
                            "Hold" -> {
                                phase = "Exhale"
                                phaseDuration = pattern.exhaleSec
                            }
                            "Exhale" -> {
                                if (pattern.restSec > 0) {
                                    phase = "Rest"
                                    phaseDuration = pattern.restSec
                                } else {
                                    phase = "Inhale"
                                    phaseDuration = pattern.inhaleSec
                                    _focusState.value = _focusState.value.copy(
                                        completedCycles = _focusState.value.completedCycles + 1
                                    )
                                }
                            }
                            "Rest" -> {
                                phase = "Inhale"
                                phaseDuration = pattern.inhaleSec
                                _focusState.value = _focusState.value.copy(
                                    completedCycles = _focusState.value.completedCycles + 1
                                )
                            }
                        }
                    }

                    val remaining = (phaseDuration - phaseElapsed).coerceAtLeast(0f)
                    val progress = (phaseElapsed / phaseDuration).coerceIn(0f, 1f)
                    _focusState.value = _focusState.value.copy(
                        currentPhase = phase,
                        phaseRemainingSec = remaining,
                        phaseProgress = progress
                    )
                }
            }
        }
    }

    private fun saveSessionRecord() {
        viewModelScope.launch {
            try {
                val state = _focusState.value
                val vitalsState = _vitals.value
                val session = SessionEntity(
                    id = "session_${System.currentTimeMillis()}",
                    type = "FOCUS_SESSION",
                    status = "COMPLETED",
                    startedAt = System.currentTimeMillis() - (state.elapsedSeconds * 1000L),
                    endedAt = System.currentTimeMillis(),
                    targetDurationSeconds = state.targetMinutes * 60,
                    elapsedSeconds = state.elapsedSeconds,
                    signalAvailabilityPercent = state.signalAvailabilityPercent.toFloat(),
                    validSampleCount = state.validSignalSeconds,
                    totalSampleCount = state.elapsedSeconds,
                    averagePulseBpm = if (vitalsState.pulseBpm > 0) vitalsState.pulseBpm else null,
                    minPulseBpm = null,
                    maxPulseBpm = null,
                    averageRespiratoryRate = if (vitalsState.respiratoryBrpm > 0) vitalsState.respiratoryBrpm else null,
                    minRespiratoryRate = null,
                    maxRespiratoryRate = null,
                    averageHrvRmssd = if (vitalsState.hrvRmssd > 0) vitalsState.hrvRmssd else null,
                    guidedBreathingEngaged = true,
                    guidedBreathingCyclesCompleted = state.completedCycles,
                    guidedBreathingDurationSeconds = state.elapsedSeconds,
                    overallQuality = if (state.signalAvailabilityPercent > 70) "OPTIMAL" else "DEGRADED",
                    sourcePlatform = "android",
                    notes = "Android native SmartSpectra session"
                )
                database?.sessionDao()?.insertSession(session)
            } catch (e: Exception) {
                // Room persistence graceful logging
            }
        }
    }
}
