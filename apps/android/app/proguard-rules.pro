# SmartSpectra Kotlin Native SDK ProGuard / R8 Rules
-keep class com.presagetech.smartspectra.** { *; }
-keep interface com.presagetech.smartspectra.** { *; }
-dontwarn com.presagetech.smartspectra.**

# CameraX ProGuard Rules
-keep class androidx.camera.core.** { *; }
-keep class androidx.camera.camera2.** { *; }
-keep class androidx.camera.view.** { *; }
-dontwarn androidx.camera.**

# Room Database ProGuard Rules
-keep class androidx.room.** { *; }
-dontwarn androidx.room.**
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class * { *; }
-keep @androidx.room.Dao interface * { *; }

# Jetpack Compose ProGuard Rules
-keep class androidx.compose.runtime.** { *; }
-dontwarn androidx.compose.**

# PulsePause Domain & Biometric Entities
-keep class com.pulsepause.app.sensor.** { *; }
-keep class com.pulsepause.app.data.model.** { *; }
-keep class com.pulsepause.app.data.db.** { *; }
