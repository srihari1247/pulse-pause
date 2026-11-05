package com.pulsepause.app.ui.presentation

import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.Notifications
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
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pulsepause.app.sensor.LiveVitalsState
import com.pulsepause.app.ui.ANDROID_BREATHING_PATTERNS
import com.pulsepause.app.ui.AndroidBreathingPattern
import com.pulsepause.app.ui.FocusSessionUiState
import java.util.Calendar

// PulsePause Apple-Grade Dark-First Color Palette
private val DarkBg = Color(0xFF070B14)
private val CardBg = Color(0xFF0C1324)
private val CardBorder = Color(0x1AFFFFFF)
private val ElectricCyan = Color(0xFF22D3EE)
private val ElectricBlue = Color(0xFF38BDF8)
private val DeepIndigo = Color(0xFF6366F1)
private val VagusViolet = Color(0xFFA855F7)

@Composable
fun AndroidFocusScreen(
    focusState: FocusSessionUiState,
    vitalsState: LiveVitalsState,
    onStartSession: () -> Unit,
    onPauseSession: () -> Unit,
    onResumeSession: () -> Unit,
    onStopSession: () -> Unit,
    onSelectPattern: (AndroidBreathingPattern) -> Unit,
    onSelectDuration: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    val haptic = LocalHapticFeedback.current
    var showPatternDialog by remember { mutableStateOf(false) }

    val greeting = remember {
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        when {
            hour < 12 -> "Good morning"
            hour < 18 -> "Good afternoon"
            else -> "Good evening"
        }
    }

    val totalTargetSecs = focusState.targetMinutes * 60
    val remainingSecs = (totalTargetSecs - focusState.elapsedSeconds).coerceAtLeast(0)
    val remainingClock = remember(remainingSecs) {
        val m = remainingSecs / 60
        val s = remainingSecs % 60
        "%d:%02d".format(m, s)
    }

    val progressRatio = remember(focusState.elapsedSeconds, totalTargetSecs) {
        if (totalTargetSecs > 0) {
            (focusState.elapsedSeconds.toFloat() / totalTargetSecs.toFloat()).coerceIn(0f, 1f)
        } else 0f
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBg)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Top App Bar: Hamburger + Notification Bell (Matching image_9421ca45.png)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 8.dp, bottom = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = { haptic.performHapticFeedback(HapticFeedbackType.LongPress) },
                modifier = Modifier.size(44.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Menu,
                    contentDescription = "Menu",
                    tint = Color.White
                )
            }

            IconButton(
                onClick = { haptic.performHapticFeedback(HapticFeedbackType.LongPress) },
                modifier = Modifier.size(44.dp)
            ) {
                Icon(
                    imageVector = Icons.Outlined.Notifications,
                    contentDescription = "Notifications",
                    tint = Color.White
                )
            }
        }

        // Greeting Section (Matching image_9421ca45.png)
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 4.dp, vertical = 6.dp)
        ) {
            Text(
                text = greeting,
                color = Color.White,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = (-0.5).sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Take a deep breath. You're doing great.",
                color = Color(0xFF94A3B8),
                fontSize = 13.sp,
                fontWeight = FontWeight.Normal
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Centerpiece: Glowing Circular Timer with Cyan Progress Arc (Matching image_9421ca45.png)
        Box(
            modifier = Modifier
                .size(270.dp)
                .padding(8.dp),
            contentAlignment = Alignment.Center
        ) {
            // Subtle ambient cyan backlight
            Box(
                modifier = Modifier
                    .size(240.dp)
                    .clip(CircleShape)
                    .background(
                        Brush.radialGradient(
                            listOf(
                                ElectricCyan.copy(alpha = 0.12f),
                                Color.Transparent
                            )
                        )
                    )
            )

            // Canvas drawing background track + luminous progress arc
            Canvas(modifier = Modifier.size(240.dp)) {
                val strokeWidth = 5.dp.toPx()
                val radius = (size.minDimension - strokeWidth) / 2f
                val centerOffset = Offset(size.width / 2f, size.height / 2f)

                // Background track
                drawCircle(
                    color = Color(0xFF1E293B).copy(alpha = 0.7f),
                    radius = radius,
                    center = centerOffset,
                    style = Stroke(width = strokeWidth)
                )

                // Glowing Cyan Arc
                val sweepAngle = progressRatio * 360f
                drawArc(
                    brush = Brush.sweepGradient(
                        listOf(ElectricCyan, ElectricBlue, DeepIndigo, ElectricCyan)
                    ),
                    startAngle = -90f,
                    sweepAngle = sweepAngle,
                    useCenter = false,
                    style = Stroke(width = strokeWidth + 2.dp.toPx(), cap = androidx.compose.ui.graphics.StrokeCap.Round)
                )
            }

            // Central Information: "Breathe In" / "4:32" / "Mindful Breathing"
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = if (focusState.isSessionRunning) focusState.currentPhase else "Ready",
                    color = ElectricCyan,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 0.5.sp
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = remainingClock,
                    color = Color.White,
                    fontSize = 46.sp,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = (-1.0).sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Mindful Breathing",
                    color = Color(0xFF94A3B8),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Flowing Sine Waveform Canvas (Dual Respiration & rPPG Paths from image_9421ca45.png)
        DualFlowingSineWaves(
            isRunning = focusState.isSessionRunning && !focusState.isSessionPaused,
            modifier = Modifier
                .fillMaxWidth()
                .height(44.dp)
                .padding(horizontal = 24.dp)
        )

        Spacer(modifier = Modifier.height(18.dp))

        // Breathing Pattern Selector Pill: "4-4-6 Breathing >"
        Surface(
            onClick = {
                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                showPatternDialog = true
            },
            shape = RoundedCornerShape(20.dp),
            color = Color.White.copy(alpha = 0.04f),
            border = BorderStroke(1.dp, CardBorder)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = focusState.currentPattern.name,
                    color = Color.White,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.width(4.dp))
                Icon(
                    imageVector = Icons.Default.ChevronRight,
                    contentDescription = null,
                    tint = Color(0xFF94A3B8),
                    modifier = Modifier.size(16.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(22.dp))

        // Large Glowing Rounded Pill Action Button: "|| Pause" / "▶ Begin Session" (Matching image_9421ca45.png)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
        ) {
            Button(
                onClick = {
                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                    when {
                        !focusState.isSessionRunning -> onStartSession()
                        focusState.isSessionPaused -> onResumeSession()
                        else -> onPauseSession()
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(58.dp),
                shape = RoundedCornerShape(28.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.Transparent
                ),
                contentPadding = PaddingValues(0.dp)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.horizontalGradient(
                                listOf(
                                    Color(0xFF0E7490),
                                    Color(0xFF0284C7),
                                    Color(0xFF2563EB)
                                )
                            )
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = when {
                                !focusState.isSessionRunning -> Icons.Default.PlayArrow
                                focusState.isSessionPaused -> Icons.Default.PlayArrow
                                else -> Icons.Default.Pause
                            },
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = when {
                                !focusState.isSessionRunning -> "Begin Session"
                                focusState.isSessionPaused -> "Resume"
                                else -> "Pause"
                            },
                            color = Color.White,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(28.dp))

        // "How It Works" + "Today's Progress" Card (Side/Stack from image_9421ca45.png)
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = CardBg),
            border = BorderStroke(1.dp, CardBorder)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                // Section: How it works
                Text(
                    text = "How it works",
                    color = Color.White,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(14.dp))

                // Phase nodes
                PhaseNodeRow(title = "Inhale", duration = "${focusState.currentPattern.inhaleSec.toInt()} sec")
                VerticalConnectorLine()
                PhaseNodeRow(title = "Hold", duration = "${focusState.currentPattern.holdSec.toInt()} sec")
                VerticalConnectorLine()
                PhaseNodeRow(title = "Exhale", duration = "${focusState.currentPattern.exhaleSec.toInt()} sec")

                Spacer(modifier = Modifier.height(20.dp))
                HorizontalDivider(color = Color.White.copy(alpha = 0.06f))
                Spacer(modifier = Modifier.height(16.dp))

                // Today's Progress Section
                Text(
                    text = "Today's Progress",
                    color = Color.White,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    // Progress Mini Donut Ring
                    Box(
                        modifier = Modifier.size(64.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Canvas(modifier = Modifier.fillMaxSize()) {
                            val stroke = 5.dp.toPx()
                            drawCircle(
                                color = Color(0xFF1E293B),
                                style = Stroke(stroke)
                            )
                            drawArc(
                                brush = Brush.sweepGradient(listOf(ElectricCyan, ElectricBlue)),
                                startAngle = -90f,
                                sweepAngle = 216f, // 12 of 20 mins = 60%
                                useCenter = false,
                                style = Stroke(stroke, cap = androidx.compose.ui.graphics.StrokeCap.Round)
                            )
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(text = "12", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                            Text(text = "min", color = Color(0xFF94A3B8), fontSize = 9.sp)
                        }
                    }

                    Column(modifier = Modifier.padding(start = 16.dp)) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(text = "Goal", color = Color(0xFF94A3B8), fontSize = 11.sp)
                            Text(text = "20 min", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(text = "Sessions", color = Color(0xFF94A3B8), fontSize = 11.sp)
                            Text(text = "2 / 4", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(text = "Optical Signal", color = Color(0xFF94A3B8), fontSize = 11.sp)
                            Text(
                                text = "${focusState.signalAvailabilityPercent}%",
                                color = ElectricCyan,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Mindful Quote Card (Bottom of right card in image_9421ca45.png)
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color.White.copy(alpha = 0.02f),
                    border = BorderStroke(1.dp, Color.White.copy(alpha = 0.04f))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(
                            text = "\"Breathe. Let go. And remind yourself that this very moment is the only one you know you have.\"",
                            color = Color(0xFF94A3B8),
                            fontSize = 11.sp,
                            lineHeight = 16.sp,
                            fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(28.dp))
    }

    // Pattern Picker Modal
    if (showPatternDialog) {
        AlertDialog(
            onDismissRequest = { showPatternDialog = false },
            title = {
                Text(text = "Select Breathing Cadence", color = Color.White, fontWeight = FontWeight.Bold)
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    ANDROID_BREATHING_PATTERNS.forEach { pattern ->
                        Surface(
                            onClick = {
                                onSelectPattern(pattern)
                                showPatternDialog = false
                            },
                            shape = RoundedCornerShape(12.dp),
                            color = if (focusState.currentPattern.id == pattern.id) ElectricBlue.copy(alpha = 0.15f) else Color.White.copy(alpha = 0.03f),
                            border = BorderStroke(1.dp, if (focusState.currentPattern.id == pattern.id) ElectricBlue else CardBorder),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(text = pattern.name, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                Text(text = pattern.description, color = Color(0xFF94A3B8), fontSize = 11.sp)
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showPatternDialog = false }) {
                    Text(text = "Done", color = ElectricCyan)
                }
            },
            containerColor = CardBg,
            shape = RoundedCornerShape(20.dp)
        )
    }
}

@Composable
private fun PhaseNodeRow(title: String, duration: String) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF0E7490).copy(alpha = 0.3f))
                    .border(1.dp, ElectricCyan.copy(alpha = 0.4f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Air,
                    contentDescription = null,
                    tint = ElectricCyan,
                    modifier = Modifier.size(16.dp)
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Text(text = title, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
        }
        Text(text = duration, color = Color(0xFF94A3B8), fontSize = 12.sp, fontWeight = FontWeight.Medium)
    }
}

@Composable
private fun VerticalConnectorLine() {
    Box(
        modifier = Modifier
            .padding(start = 15.dp)
            .width(2.dp)
            .height(14.dp)
            .background(Color.White.copy(alpha = 0.1f))
    )
}

@Composable
private fun DualFlowingSineWaves(isRunning: Boolean, modifier: Modifier = Modifier) {
    val infiniteTransition = rememberInfiniteTransition(label = "sineWaves")
    val phase by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 6.28f,
        animationSpec = infiniteRepeatable(
            animation = tween(2200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "sinePhase"
    )

    Canvas(modifier = modifier) {
        val width = size.width
        val height = size.height
        val centerY = height / 2f

        val path1 = Path()
        val path2 = Path()

        val points = 80
        for (i in 0 until points) {
            val x = (i.toFloat() / points) * width
            val y1 = if (isRunning) {
                centerY + kotlin.math.sin(phase + i * 0.18f).toFloat() * (height * 0.35f)
            } else centerY

            val y2 = if (isRunning) {
                centerY + kotlin.math.sin(phase * 0.8f + i * 0.22f + 1.5f).toFloat() * (height * 0.25f)
            } else centerY

            if (i == 0) {
                path1.moveTo(x, y1)
                path2.moveTo(x, y2)
            } else {
                path1.lineTo(x, y1)
                path2.lineTo(x, y2)
            }
        }

        // Draw primary cyan sine path
        drawPath(
            path = path1,
            color = if (isRunning) ElectricCyan.copy(alpha = 0.85f) else Color(0xFF1E293B),
            style = Stroke(width = 2.dp.toPx())
        )

        // Draw secondary subtle blue sine path
        drawPath(
            path = path2,
            color = if (isRunning) DeepIndigo.copy(alpha = 0.45f) else Color(0xFF1E293B).copy(alpha = 0.5f),
            style = Stroke(width = 1.5.dp.toPx())
        )
    }
}
