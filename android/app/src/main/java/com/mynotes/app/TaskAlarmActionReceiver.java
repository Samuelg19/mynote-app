package com.mynotes.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import org.json.JSONObject;

public class TaskAlarmActionReceiver extends BroadcastReceiver {
    public static final String ACTION_OPEN = "com.mynotes.app.ALARM_OPEN";
    public static final String ACTION_COMPLETE = "com.mynotes.app.ALARM_COMPLETE";
    private static final String TAG = "MyNoteAlarmAction";

    @Override
    public void onReceive(Context context, Intent intent) {
        boolean complete = ACTION_COMPLETE.equals(intent.getAction());
        try {
            TaskAlarmSoundService.handleAction(context, complete);
        } catch (RuntimeException error) {
            Log.w(TAG, "Alarm action service was blocked; handling action directly.", error);
            if (complete) {
                TaskCompletionService.completeInBackground(
                    context,
                    readPayload(intent)
                );
            }
            TaskAlarmSoundService.stop(context);
        }
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

    private JSONObject readPayload(Intent intent) {
        try {
            return new JSONObject(
                intent == null
                    ? "{}"
                    : intent.getStringExtra(TaskAlarmScheduler.EXTRA_PAYLOAD)
            );
        } catch (Exception ignored) {
            return new JSONObject();
        }
    }
}
