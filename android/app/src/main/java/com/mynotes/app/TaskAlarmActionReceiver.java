package com.mynotes.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class TaskAlarmActionReceiver extends BroadcastReceiver {
    public static final String ACTION_OPEN = "com.mynotes.app.ALARM_OPEN";
    public static final String ACTION_COMPLETE = "com.mynotes.app.ALARM_COMPLETE";

    @Override
    public void onReceive(Context context, Intent intent) {
        TaskAlarmSoundService.handleAction(
            context,
            ACTION_COMPLETE.equals(intent.getAction())
        );
    }

    public static Intent createIntent(
        Context context,
        String action,
        String payload
    ) {
        Intent intent = new Intent(context, TaskAlarmActionReceiver.class);
        intent.setAction(action);
        intent.putExtra(TaskAlarmScheduler.EXTRA_PAYLOAD, payload);
        return intent;
    }
}
