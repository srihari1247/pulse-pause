package com.pulsepause.app

import android.app.Application
import com.pulsepause.app.data.db.AppDatabase

class PulsePauseApp : Application() {
    val database: AppDatabase by lazy { AppDatabase.getDatabase(this) }

    override fun onCreate() {
        super.onCreate()
    }
}
