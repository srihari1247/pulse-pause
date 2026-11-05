package com.pulsepause.app.ui.presentation

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FiberManualRecord
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pulsepause.app.sensor.LiveVitalsState

// PulsePause Apple-Grade Wellness Color Palette
val NavyBackground = Color(0xFF070B14)
val SurfaceCard = Color(0xFF0E1424)
val SurfaceBorder = Color(0x1AFFFFFF)
val ElectricBlue = Color(0xFF38BDF8)
val VagusViolet = Color(0xFFA855F7)
val SoftCyan = Color(0xFF22D3EE)
val CardiacRose = Color(0xFFF43F5E)
val BioEmerald = Color(0xFF10B981)

@Composable
fun PulsePauseDashboard(
    vitalsState: LiveVitalsState,
    onStartSession: () -> Unit,
    onStopSession: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier.fillMaxSize(),
        color = NavyBackground
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Header with Brand & Status
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "PulsePause",
                        color = Color.White,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = (-0.5).sp
                    )
                    Text(
                        text = "Presage SmartSpectra rPPG",
                        color = ElectricBlue,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                }

                // Restrained Status Chip
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(SurfaceCard)
                        .border(1.dp, SurfaceBorder, RoundedCornerShape(12.dp))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.FiberManualRecord,
                        contentDescription = null,
                        tint = if (vitalsState.isRunning) BioEmerald else Color(0xFF64748B),
                        modifier = Modifier.size(8.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (vitalsState.isRunning) "STREAMING" else "STANDBY",
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            // Real-Time rPPG Waveform Card (Glass Surface)
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(170.dp),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceCard),
                border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "OPTICAL PULSE WAVEFORM (rPPG)",
                        color = Color(0xFF94A3B8),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    RppgWaveformCanvas(
                        isRunning = vitalsState.isRunning,
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }

            // 3 KPI Cards
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                MetricCard(
                    title = "PULSE RATE",
                    value = if (vitalsState.isRunning && vitalsState.pulseBpm > 0) "${vitalsState.pulseBpm.toInt()}" else "--",
                    unit = "BPM",
                    tint = ElectricBlue,
                    modifier = Modifier.weight(1f)
                )
                MetricCard(
                    title = "HRV RMSSD",
                    value = if (vitalsState.isRunning && vitalsState.hrvRmssd > 0) "${vitalsState.hrvRmssd.toInt()}" else "--",
                    unit = "ms",
                    tint = VagusViolet,
                    modifier = Modifier.weight(1f)
                )
                MetricCard(
                    title = "CADENCE",
                    value = if (vitalsState.isRunning && vitalsState.respiratoryBrpm > 0) "%.1f".format(vitalsState.respiratoryBrpm) else "--",
                    unit = "BrPM",
                    tint = SoftCyan,
                    modifier = Modifier.weight(1f)
                )
            }

            // Central Glowing Sphere Breathing Orb (Matching NY Design Award / Apple Aesthetic)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .clip(RoundedCornerShape(24.dp))
                    .background(SurfaceCard)
                    .border(1.dp, SurfaceBorder, RoundedCornerShape(24.dp)),
                contentAlignment = Alignment.Center
            ) {
                CosmicBreathingOrb(isRunning = vitalsState.isRunning)
            }

            // Primary Action Button
            Button(
                onClick = { if (vitalsState.isRunning) onStopSession() else onStartSession() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (vitalsState.isRunning) CardiacRose else ElectricBlue
                ),
                shape = RoundedCornerShape(16.dp)
            ) {
                Icon(
                    imageVector = if (vitalsState.isRunning) Icons.Default.Stop else Icons.Default.PlayArrow,
                    contentDescription = null
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (vitalsState.isRunning) "End Session" else "Begin Coherent Pause",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun RppgWaveformCanvas(isRunning: Boolean, modifier: Modifier = Modifier) {
    val infiniteTransition = rememberInfiniteTransition(label = "rppg")
    val phase by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 6.28f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "phase"
    )

    Canvas(modifier = modifier) {
        val width = size.width
        val height = size.height
        val centerY = height / 2f

        val path = Path()
        val points = 70
        for (i in 0 until points) {
            val x = (i.toFloat() / points) * width
            val y = if (isRunning) {
                centerY + kotlin.math.sin(phase + i * 0.35f).toFloat() * (height * 0.32f)
            } else {
                centerY
            }
            if (i == 0) path.moveTo(x, y) else path.lineTo(x, y)
        }

        drawPath(
            path = path,
            color = if (isRunning) ElectricBlue else Color(0xFF1E293B),
            style = Stroke(width = 2.5.dp.toPx())
        )
    }
}

@Composable
fun CosmicBreathingOrb(isRunning: Boolean) {
    val infiniteTransition = rememberInfiniteTransition(label = "orb")
    val scale by infiniteTransition.animateFloat(
        initialValue = 0.70f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "orbScale"
    )

    Box(contentAlignment = Alignment.Center) {
        // Outer concentric orbital ring
        Box(
            modifier = Modifier
                .size(230.dp * if (isRunning) scale else 0.8f)
                .clip(CircleShape)
                .border(1.dp, VagusViolet.copy(alpha = 0.25f), CircleShape)
        )

        // Middle soft glow ring
        Box(
            modifier = Modifier
                .size(175.dp * if (isRunning) scale else 0.8f)
                .clip(CircleShape)
                .border(1.5.dp, ElectricBlue.copy(alpha = 0.35f), CircleShape)
        )

        // Spherical pearl / cosmic core
        Box(
            modifier = Modifier
                .size(125.dp * if (isRunning) scale else 0.8f)
                .clip(CircleShape)
                .background(
                    Brush.radialGradient(
                        colors = listOf(
                            Color(0xFFE2E8F0),
                            Color(0xFF94A3B8),
                            Color(0xFF334155),
                            Color(0xFF0F172A)
                        )
                    )
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = if (isRunning) (if (scale > 0.85f) "Exhale" else "Inhale") else "Pause",
                color = Color(0xFF070B14),
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    unit: String,
    tint: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceCard),
        border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            horizontalAlignment = Alignment.Start
        ) {
            Text(text = title, color = Color(0xFF64748B), fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(4.dp))
            Row(verticalAlignment = Alignment.Bottom) {
                Text(text = value, color = tint, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.width(3.dp))
                Text(text = unit, color = Color(0xFF94A3B8), fontSize = 10.sp, modifier = Modifier.padding(bottom = 3.dp))
            }
        }
    }
}
