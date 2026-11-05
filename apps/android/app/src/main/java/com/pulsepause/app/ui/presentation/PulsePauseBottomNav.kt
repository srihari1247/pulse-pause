package com.pulsepause.app.ui.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Air
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Equalizer
import androidx.compose.material.icons.filled.HourglassEmpty
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pulsepause.app.ui.AndroidNavTab

private val NavBackground = Color(0xFF070B14)
private val ElectricCyan = Color(0xFF22D3EE)
private val InactiveColor = Color(0xFF64748B)

data class NavItem(
    val tab: AndroidNavTab,
    val title: String,
    val icon: ImageVector
)

val ANDROID_NAV_ITEMS = listOf(
    NavItem(AndroidNavTab.FOCUS, "Focus", Icons.Default.HourglassEmpty),
    NavItem(AndroidNavTab.SENSING, "Sensing", Icons.Default.CameraAlt),
    NavItem(AndroidNavTab.BREATHING, "Breathing", Icons.Default.Air),
    NavItem(AndroidNavTab.SUMMARY, "Summary", Icons.Default.Equalizer)
)

@Composable
fun PulsePauseBottomNav(
    selectedTab: AndroidNavTab,
    onTabSelected: (AndroidNavTab) -> Unit,
    modifier: Modifier = Modifier
) {
    val haptic = LocalHapticFeedback.current

    Surface(
        modifier = modifier
            .fillMaxWidth()
            .navigationBarsPadding(),
        color = NavBackground,
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x1AFFFFFF))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(64.dp)
                .padding(horizontal = 8.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            ANDROID_NAV_ITEMS.forEach { item ->
                val isSelected = selectedTab == item.tab

                Surface(
                    onClick = {
                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                        onTabSelected(item.tab)
                    },
                    color = Color.Transparent,
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .weight(1f)
                        .height(54.dp)
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center,
                        modifier = Modifier.fillMaxSize()
                    ) {
                        Box(
                            modifier = Modifier
                                .padding(horizontal = 12.dp, vertical = 2.dp)
                                .background(
                                    color = if (isSelected) ElectricCyan.copy(alpha = 0.12f) else Color.Transparent,
                                    shape = RoundedCornerShape(12.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = item.icon,
                                contentDescription = item.title,
                                tint = if (isSelected) ElectricCyan else InactiveColor,
                                modifier = Modifier
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                                    .size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = item.title,
                            color = if (isSelected) Color.White else InactiveColor,
                            fontSize = 10.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                        )
                    }
                }
            }
        }
    }
}
