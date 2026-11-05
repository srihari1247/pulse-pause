package com.pulsepause.app

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import com.pulsepause.app.data.db.AppDatabase
import com.pulsepause.app.sensor.SmartSpectraEngine
import com.pulsepause.app.ui.AndroidNavTab
import com.pulsepause.app.ui.PulsePauseViewModel
import com.pulsepause.app.ui.presentation.*

class MainActivity : ComponentActivity() {
    private lateinit var sensorEngine: SmartSpectraEngine
    private var previewView: PreviewView? = null
    private var isCameraPermissionGranted by mutableStateOf(false)

    private val viewModel: PulsePauseViewModel by viewModels {
        object : androidx.lifecycle.ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
                val db = AppDatabase.getInstance(applicationContext)
                return PulsePauseViewModel(db) as T
            }
        }
    }

    private val cameraPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        isCameraPermissionGranted = isGranted
        if (isGranted) {
            sensorEngine.startSensing()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Check initial camera permission
        isCameraPermissionGranted = ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED

        // Initialize Official Native SmartSpectra Engine
        sensorEngine = SmartSpectraEngine(
            context = applicationContext,
            lifecycleOwner = this,
            apiKey = BuildConfig.SMARTSPECTRA_API_KEY
        )

        // Lifecycle Observer for Background/Foreground Transitions & Camera Resource Releasing
        lifecycle.addObserver(LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_PAUSE -> {
                    // Conserve battery and release active stream when backgrounded
                    sensorEngine.pauseSensing()
                }
                Lifecycle.Event.ON_RESUME -> {
                    if (isCameraPermissionGranted && viewModel.focusState.value.isSessionRunning && !viewModel.focusState.value.isSessionPaused) {
                        sensorEngine.resumeSensing()
                    }
                }
                Lifecycle.Event.ON_STOP -> {
                    // Fully halt sensing pipeline in background
                    sensorEngine.pauseSensing()
                }
                Lifecycle.Event.ON_DESTROY -> {
                    // Release all hardware camera resources
                    sensorEngine.release()
                }
                else -> {}
            }
        })

        setContent {
            val currentTab by viewModel.currentTab.collectAsState()
            val focusState by viewModel.focusState.collectAsState()
            val vitalsState by viewModel.vitals.collectAsState()
            val rawSignal by sensorEngine.signalFlow.collectAsState()

            // Synchronize SDK stream into ViewModel
            LaunchedEffect(rawSignal) {
                viewModel.updateSignalData(rawSignal)
            }

            Scaffold(
                containerColor = Color(0xFF070B14),
                bottomBar = {
                    PulsePauseBottomNav(
                        selectedTab = currentTab,
                        onTabSelected = { tab -> viewModel.selectTab(tab) }
                    )
                }
            ) { paddingValues ->
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                        .background(Color(0xFF070B14))
                ) {
                    when (currentTab) {
                        AndroidNavTab.FOCUS -> {
                            AndroidFocusScreen(
                                focusState = focusState,
                                vitalsState = vitalsState,
                                onStartSession = {
                                    checkPermissionAndExecute {
                                        viewModel.startSession { sensorEngine.startSensing() }
                                    }
                                },
                                onPauseSession = {
                                    viewModel.pauseSession { sensorEngine.pauseSensing() }
                                },
                                onResumeSession = {
                                    viewModel.resumeSession { sensorEngine.resumeSensing() }
                                },
                                onStopSession = {
                                    viewModel.stopSession { sensorEngine.stopSensing() }
                                },
                                onSelectPattern = { pattern ->
                                    viewModel.selectBreathingPattern(pattern)
                                },
                                onSelectDuration = { mins ->
                                    viewModel.setTargetMinutes(mins)
                                }
                            )
                        }

                        AndroidNavTab.SENSING -> {
                            AndroidLiveSensingScreen(
                                vitalsState = vitalsState,
                                hasCameraPermission = isCameraPermissionGranted,
                                onRequestPermission = { requestCameraPermission() },
                                onStartSensing = {
                                    checkPermissionAndExecute { sensorEngine.startSensing() }
                                },
                                onStopSensing = { sensorEngine.stopSensing() },
                                onPreviewCreated = { pv ->
                                    previewView = pv
                                    sensorEngine.attachPreview(pv)
                                }
                            )
                        }

                        AndroidNavTab.BREATHING -> {
                            AndroidBreathingScreen(
                                focusState = focusState,
                                onStartSession = {
                                    viewModel.startSession {
                                        if (isCameraPermissionGranted) sensorEngine.startSensing()
                                    }
                                },
                                onPauseSession = {
                                    viewModel.pauseSession { sensorEngine.pauseSensing() }
                                },
                                onResumeSession = {
                                    viewModel.resumeSession { sensorEngine.resumeSensing() }
                                },
                                onStopSession = {
                                    viewModel.stopSession { sensorEngine.stopSensing() }
                                }
                            )
                        }

                        AndroidNavTab.SUMMARY -> {
                            AndroidSummaryScreen(
                                focusState = focusState,
                                vitalsState = vitalsState,
                                onNavigateBack = { viewModel.selectTab(AndroidNavTab.FOCUS) }
                            )
                        }
                    }
                }
            }
        }
    }

    private fun checkPermissionAndExecute(action: () -> Unit) {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            isCameraPermissionGranted = true
            action()
        } else {
            cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    private fun requestCameraPermission() {
        cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
    }

    override fun onDestroy() {
        super.onDestroy()
        sensorEngine.release()
    }
}
