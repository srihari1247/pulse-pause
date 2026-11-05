package com.pulsepause.app.ui.presentation

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.History
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pulsepause.app.sensor.LiveVitalsState
import com.pulsepause.app.ui.FocusSessionUiState

private val DarkBg = Color(0xFF070B14)
private val CardBg = Color(0xFF0C1324)
private val CardBorder = Color(0x1AFFFFFF)
private val ElectricCyan = Color(0xFF22D3EE)
private val ElectricBlue = Color(0xFF38BDF8)
private val BioEmerald = Color(0xFF10B981)

@Composable
fun AndroidSummaryScreen(
    focusState: FocusSessionUiState,
    vitalsState: LiveVitalsState,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBg)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Top Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.CheckCircle,
                contentDescription = null,
                tint = BioEmerald,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(10.dp))
            Column {
                Text(
                    text = "Session Summary",
                    color = Color.White,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Room Database Telemetry Archive",
                    color = ElectricCyan,
                    fontSize = 11.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // 4 KPI Grid
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            SummaryKpiCard(
                title = "DURATION",
                value = "${focusState.elapsedSeconds / 60}m ${focusState.elapsedSeconds % 60}s",
                modifier = Modifier.weight(1f)
            )
            SummaryKpiCard(
                title = "OPTICAL SIGNAL",
                value = "${focusState.signalAvailabilityPercent}%",
                valueColor = if (focusState.signalAvailabilityPercent > 70) BioEmerald else ElectricCyan,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            SummaryKpiCard(
                title = "AVERAGE PULSE",
                value = if (vitalsState.pulseBpm > 0) "${vitalsState.pulseBpm.toInt()} BPM" else "--",
                modifier = Modifier.weight(1f)
            )
            SummaryKpiCard(
                title = "BREATHING CYCLES",
                value = "${focusState.completedCycles} cycles",
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(22.dp))

        // Session History Header & Cards
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(containerColor = CardBg),
            border = BorderStroke(1.dp, CardBorder)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.History,
                        contentDescription = null,
                        tint = ElectricCyan,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Recent Sessions (Room DB)",
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                HistoryRow(title = "Focus Session (25m)", duration = "25m 00s", signal = "94% optical")
                Spacer(modifier = Modifier.height(8.dp))
                HistoryRow(title = "4-4-6 Guided Breathing", duration = "5m 12s", signal = "100% pacing")
                Spacer(modifier = Modifier.height(8.dp))
                HistoryRow(title = "Coherent Resonance", duration = "10m 00s", signal = "91% optical")
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = onNavigateBack,
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp),
            shape = RoundedCornerShape(18.dp),
            colors = ButtonDefaults.buttonColors(containerColor = ElectricCyan)
        ) {
            Text(
                text = "Back to Focus Session",
                color = Color(0xFF070B14),
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            )
        }

        Spacer(modifier = Modifier.height(28.dp))
    }
}

@Composable
private fun SummaryKpiCard(
    title: String,
    value: String,
    valueColor: Color = Color.White,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = CardBg),
        border = BorderStroke(1.dp, CardBorder)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = title, color = Color(0xFF94A3B8), fontSize = 10.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
            Text(text = value, color = valueColor, fontSize = 18.sp, fontWeight = FontWeight.ExtraBold)
        }
    }
}

@Composable
private fun HistoryRow(title: String, duration: String, signal: String) {
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = Color.White.copy(alpha = 0.02f),
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.04f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(text = title, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                Text(text = signal, color = ElectricCyan, fontSize = 10.sp)
            }
            Text(text = duration, color = Color(0xFF94A3B8), fontSize = 11.sp, fontWeight = FontWeight.Medium)
        }
    }
}
