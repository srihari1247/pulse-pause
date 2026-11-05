package com.pulsepause.app.ui.presentation

import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pulsepause.app.ui.FocusSessionUiState

private val DarkBg = Color(0xFF070B14)
private val CardBg = Color(0xFF0C1324)
private val CardBorder = Color(0x1AFFFFFF)
private val ElectricCyan = Color(0xFF22D3EE)
private val VagusViolet = Color(0xFFA855F7)

@Composable
fun AndroidBreathingScreen(
    focusState: FocusSessionUiState,
    onStartSession: () -> Unit,
    onPauseSession: () -> Unit,
    onResumeSession: () -> Unit,
    onStopSession: () -> Unit,
    modifier: Modifier = Modifier
) {
    val haptic = LocalHapticFeedback.current

    val infiniteTransition = rememberInfiniteTransition(label = "androidOrb")
    val scale by infiniteTransition.animateFloat(
        initialValue = 0.65f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(
                durationMillis = (focusState.currentPattern.inhaleSec * 1000).toInt(),
                easing = FastOutSlowInEasing
            ),
            repeatMode = RepeatMode.Reverse
        ),
        label = "orbScale"
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBg)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = focusState.currentPattern.name,
                color = Color.White,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = focusState.currentPattern.description,
                color = Color(0xFF94A3B8),
                fontSize = 12.sp
            )
        }

        // Luminous Breathing Orb Centerpiece
        Box(
            modifier = Modifier
                .size(280.dp)
                .padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            // Concentric Outer Ring
            Box(
                modifier = Modifier
                    .size(260.dp * if (focusState.isSessionRunning) scale else 0.8f)
                    .clip(CircleShape)
                    .border(1.dp, VagusViolet.copy(alpha = 0.25f), CircleShape)
            )

            // Middle Cyan Ring
            Box(
                modifier = Modifier
                    .size(200.dp * if (focusState.isSessionRunning) scale else 0.8f)
                    .clip(CircleShape)
                    .border(2.dp, ElectricCyan.copy(alpha = 0.4f), CircleShape)
            )

            // Core Luminous Ball
            Box(
                modifier = Modifier
                    .size(145.dp * if (focusState.isSessionRunning) scale else 0.8f)
                    .clip(CircleShape)
                    .background(
                        Brush.radialGradient(
                            listOf(
                                Color(0xFFE0E7FF),
                                Color(0xFF818CF8),
                                Color(0xFF4338CA),
                                Color(0xFF1E1B4B)
                            )
                        )
                    ),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = if (focusState.isSessionRunning) focusState.currentPhase else "Ready",
                        color = Color.White,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                    if (focusState.isSessionRunning) {
                        Text(
                            text = "%.0f".format(focusState.phaseRemainingSec),
                            color = Color(0xFFE0E7FF),
                            fontSize = 22.sp,
                            fontWeight = FontWeight.ExtraBold
                        )
                    }
                }
            }
        }

        // Cycles Completed Indicator
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = CardBg,
            border = BorderStroke(1.dp, CardBorder)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = "Completed Cycles: ", color = Color(0xFF94A3B8), fontSize = 12.sp)
                Text(
                    text = "${focusState.completedCycles}",
                    color = Color.White,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        // Action Buttons
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
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
                    .weight(1f)
                    .height(54.dp),
                shape = RoundedCornerShape(18.dp),
                colors = ButtonDefaults.buttonColors(containerColor = ElectricCyan)
            ) {
                Icon(
                    imageVector = if (!focusState.isSessionRunning || focusState.isSessionPaused) Icons.Default.PlayArrow else Icons.Default.Pause,
                    contentDescription = null,
                    tint = Color(0xFF070B14)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (!focusState.isSessionRunning) "Begin" else if (focusState.isSessionPaused) "Resume" else "Pause",
                    color = Color(0xFF070B14),
                    fontWeight = FontWeight.Bold
                )
            }

            if (focusState.isSessionRunning) {
                OutlinedButton(
                    onClick = {
                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                        onStopSession()
                    },
                    modifier = Modifier.height(54.dp),
                    shape = RoundedCornerShape(18.dp),
                    border = BorderStroke(1.dp, CardBorder)
                ) {
                    Icon(imageVector = Icons.Default.Stop, contentDescription = null, tint = Color.White)
                }
            }
        }
    }
}
