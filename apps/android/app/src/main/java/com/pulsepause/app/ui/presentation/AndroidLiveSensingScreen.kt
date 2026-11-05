package com.pulsepause.app.ui.presentation

import androidx.camera.view.PreviewView
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.pulsepause.app.sensor.AndroidValidationStatus
import com.pulsepause.app.sensor.LiveVitalsState

private val DarkBg = Color(0xFF070B14)
private val CardBg = Color(0xFF0C1324)
private val CardBorder = Color(0x1AFFFFFF)
private val ElectricCyan = Color(0xFF22D3EE)
private val ElectricBlue = Color(0xFF38BDF8)
private val BioEmerald = Color(0xFF10B981)
private val AmberWarn = Color(0xFFF59E0B)
private val CardiacRose = Color(0xFFF43F5E)

@Composable
fun AndroidLiveSensingScreen(
    vitalsState: LiveVitalsState,
    hasCameraPermission: Boolean,
    onRequestPermission: () -> Unit,
    onStartSensing: () -> Unit,
    onStopSensing: () -> Unit,
    onPreviewCreated: (PreviewView) -> Unit,
    modifier: Modifier = Modifier
) {
    val haptic = LocalHapticFeedback.current

    val reticleColor = remember(vitalsState.validationStatus, vitalsState.isFaceDetected) {
        when {
            !vitalsState.isFaceDetected -> CardiacRose
            vitalsState.validationStatus == AndroidValidationStatus.VALID -> BioEmerald
            vitalsState.validationStatus == AndroidValidationStatus.EXCESSIVE_MOTION -> AmberWarn
            vitalsState.validationStatus == AndroidValidationStatus.INSUFFICIENT_LIGHTING -> AmberWarn
            else -> ElectricCyan
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBg)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Live Optical Sensing",
                    color = Color.White,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Presage SmartSpectra Front Camera rPPG",
                    color = ElectricCyan,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            // Status chip
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = if (vitalsState.isRunning) BioEmerald.copy(alpha = 0.15f) else Color.White.copy(alpha = 0.04f),
                border = BorderStroke(1.dp, if (vitalsState.isRunning) BioEmerald.copy(alpha = 0.4f) else CardBorder)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(7.dp)
                            .clip(CircleShape)
                            .background(if (vitalsState.isRunning) BioEmerald else Color(0xFF64748B))
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (vitalsState.isRunning) "TRACKING" else "STANDBY",
                        color = Color.White,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Camera Viewport Box with Face Positioning Guidance Reticle
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(310.dp)
                .clip(RoundedCornerShape(28.dp))
                .background(Color.Black)
                .border(1.dp, CardBorder, RoundedCornerShape(28.dp)),
            contentAlignment = Alignment.Center
        ) {
            if (hasCameraPermission) {
                // Native CameraX View
                AndroidView(
                    factory = { ctx ->
                        PreviewView(ctx).also { pv ->
                            onPreviewCreated(pv)
                        }
                    },
                    modifier = Modifier.fillMaxSize()
                )

                // Face Positioning Oval Reticle
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val ovalWidth = size.width * 0.58f
                    val ovalHeight = size.height * 0.76f
                    val left = (size.width - ovalWidth) / 2f
                    val top = (size.height - ovalHeight) / 2f

                    // Draw oval guidance outline
                    drawOval(
                        color = reticleColor.copy(alpha = 0.85f),
                        topLeft = Offset(left, top),
                        size = Size(ovalWidth, ovalHeight),
                        style = Stroke(width = 3.dp.toPx())
                    )

                    // Corner corner crosshairs
                    val crosshairLength = 18.dp.toPx()
                    val stroke = 3.dp.toPx()

                    // Top
                    drawLine(reticleColor, Offset(size.width / 2f, top - 8.dp.toPx()), Offset(size.width / 2f, top + crosshairLength), stroke)
                    // Bottom
                    drawLine(reticleColor, Offset(size.width / 2f, top + ovalHeight - crosshairLength), Offset(size.width / 2f, top + ovalHeight + 8.dp.toPx()), stroke)
                }

                // Overlay Status Badge
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color.Black.copy(alpha = 0.7f),
                    border = BorderStroke(1.dp, reticleColor.copy(alpha = 0.5f)),
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 14.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = if (vitalsState.isFaceDetected) Icons.Default.Face else Icons.Default.FaceRetouchingOff,
                            contentDescription = null,
                            tint = reticleColor,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (vitalsState.isFaceDetected) {
                                when (vitalsState.validationStatus) {
                                    AndroidValidationStatus.VALID -> "Position Centered & Stable"
                                    AndroidValidationStatus.INSUFFICIENT_LIGHTING -> "Lighting Underexposed"
                                    AndroidValidationStatus.EXCESSIVE_MOTION -> "Reduce Head Movement"
                                    else -> "Tracking Face"
                                }
                            } else "Align Face Inside Oval Reticle",
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            } else {
                // Permission Request Fallback
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.CameraAlt,
                        contentDescription = null,
                        tint = ElectricCyan,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Camera Permission Required",
                        color = Color.White,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "PulsePause processes video on-device to measure pulse and respiration without sending video to any server.",
                        color = Color(0xFF94A3B8),
                        fontSize = 12.sp,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = {
                            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                            onRequestPermission()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = ElectricCyan),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Text(text = "Grant Camera Access", color = Color(0xFF070B14), fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Live KPI Metrics: Pulse & Respiration
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Card(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = CardBg),
                border = BorderStroke(1.dp, CardBorder)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "PULSE (rPPG)", color = Color(0xFF94A3B8), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text(
                            text = if (vitalsState.isPulseReliable && vitalsState.pulseBpm > 0) "${vitalsState.pulseBpm.toInt()}" else "--",
                            color = CardiacRose,
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "BPM", color = Color(0xFF94A3B8), fontSize = 11.sp, modifier = Modifier.padding(bottom = 4.dp))
                    }
                }
            }

            Card(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = CardBg),
                border = BorderStroke(1.dp, CardBorder)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "RESPIRATION", color = Color(0xFF94A3B8), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text(
                            text = if (vitalsState.isBreathingReliable && vitalsState.respiratoryBrpm > 0) "%.1f".format(vitalsState.respiratoryBrpm) else "--",
                            color = BioEmerald,
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "BrPM", color = Color(0xFF94A3B8), fontSize = 11.sp, modifier = Modifier.padding(bottom = 4.dp))
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Real-Time Optical Pulse Waveform Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .height(140.dp),
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(containerColor = CardBg),
            border = BorderStroke(1.dp, CardBorder)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "OPTICAL WAVEFORM STREAM",
                    color = Color(0xFF94A3B8),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                RppgWaveformCanvas(
                    isRunning = vitalsState.isRunning,
                    modifier = Modifier.fillMaxSize()
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Start / Stop Sensing Action Button
        Button(
            onClick = {
                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                if (vitalsState.isRunning) onStopSensing() else onStartSensing()
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp),
            shape = RoundedCornerShape(20.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = if (vitalsState.isRunning) CardiacRose else ElectricCyan
            )
        ) {
            Icon(
                imageVector = if (vitalsState.isRunning) Icons.Default.Stop else Icons.Default.CameraAlt,
                contentDescription = null,
                tint = if (vitalsState.isRunning) Color.White else Color(0xFF070B14)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = if (vitalsState.isRunning) "Stop Camera Sensing" else "Start Front Camera Sensing",
                color = if (vitalsState.isRunning) Color.White else Color(0xFF070B14),
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            )
        }

        Spacer(modifier = Modifier.height(28.dp))
    }
}
