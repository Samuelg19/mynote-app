package com.mynotes.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import androidx.core.content.ContextCompat;

public class TaskAlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String payload = intent.getStringExtra(TaskAlarmScheduler.EXTRA_PAYLOAD);
        if (payload != null && payload.contains("\"kind\":\"reminder\"")) {
            TaskReminderNotifier.show(context, payload, goAsync());
            return;
        }
        Intent serviceIntent = TaskAlarmSoundService.createIntent(
            context,
            payload == null ? "{}" : payload
        );
        ContextCompat.startForegroundService(context, serviceIntent);
    }
}
