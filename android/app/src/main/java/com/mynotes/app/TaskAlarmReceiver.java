package com.mynotes.app;

import android.app.KeyguardManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.PowerManager;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import org.json.JSONArray;
import org.json.JSONObject;

public class TaskAlarmReceiver extends BroadcastReceiver {
    private static final String TAG = "MyNoteTaskAlarmReceiver";
    private static final String FALLBACK_CHANNEL_ID = "mynote_alarm_fallback_v1";

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
        try {
            ContextCompat.startForegroundService(context, serviceIntent);
        } catch (RuntimeException error) {
            Log.w(TAG, "Alarm foreground service was blocked; using fallback notification.", error);
            showFallbackNotification(context, payload == null ? "{}" : payload);
        }
    }

    private void showFallbackNotification(Context context, String payloadText) {
        JSONObject payload = parsePayload(payloadText);
        JSONObject current = currentTask(payload);
        String currentPayload = current.toString();
        int notificationId = TaskAlarmScheduler.notificationId(payload);

        Intent alarmIntent = new Intent(context, AlarmActivity.class);
        alarmIntent.putExtra(TaskAlarmScheduler.EXTRA_PAYLOAD, currentPayload);
        alarmIntent.addFlags(
            Intent.FLAG_ACTIVITY_NEW_TASK |
            Intent.FLAG_ACTIVITY_CLEAR_TOP |
            Intent.FLAG_ACTIVITY_SINGLE_TOP
        );

        PendingIntent openScreenIntent = PendingIntent.getActivity(
            context,
            notificationId,
            alarmIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        PendingIntent openIntent = PendingIntent.getBroadcast(
            context,
            notificationId + 1,
            TaskAlarmActionReceiver.createIntent(
                context,
                TaskAlarmActionReceiver.ACTION_OPEN,
                currentPayload
            ),
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        PendingIntent completeIntent = PendingIntent.getBroadcast(
            context,
            notificationId + 2,
            TaskAlarmActionReceiver.createIntent(
                context,
                TaskAlarmActionReceiver.ACTION_COMPLETE,
                currentPayload
            ),
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        int count = taskCount(payload);
        String title = count > 1
            ? count + " tarefas acontecendo agora"
            : current.optString("taskTitle", "Tarefa");
        String text = count > 1
            ? "Abra o MyNote para responder uma por vez."
            : current.optString("routineName", "Rotina");

        createFallbackChannel(context);
        NotificationCompat.Builder builder = new NotificationCompat.Builder(
            context,
            FALLBACK_CHANNEL_ID
        )
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle(title)
            .setContentText(text)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(true)
            .setAutoCancel(false)
            .setContentIntent(openScreenIntent)
            .addAction(0, "Vou fazer", openIntent)
            .addAction(0, "Ja fiz", completeIntent);

        if (shouldUseFullScreenAlarm(context)) {
            builder.setFullScreenIntent(openScreenIntent, true);
        }

        Notification notification = builder.build();
        NotificationManager manager =
            (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.notify(notificationId, notification);
        }
    }

    private JSONObject parsePayload(String payloadText) {
        try {
            return new JSONObject(payloadText);
        } catch (Exception ignored) {
            return new JSONObject();
        }
    }

    private JSONObject currentTask(JSONObject payload) {
        JSONArray tasks = payload.optJSONArray("tasks");
        JSONObject current = tasks == null ? null : tasks.optJSONObject(0);
        return current == null ? payload : current;
    }

    private int taskCount(JSONObject payload) {
        JSONArray tasks = payload.optJSONArray("tasks");
        return tasks == null ? 1 : Math.max(tasks.length(), 1);
    }

    private void createFallbackChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager =
            (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager == null || manager.getNotificationChannel(FALLBACK_CHANNEL_ID) != null) {
            return;
        }

        NotificationChannel channel = new NotificationChannel(
            FALLBACK_CHANNEL_ID,
            "Alarmes de tarefas",
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("Fallback dos alarmes das tarefas do MyNotes");
        channel.setSound(null, null);
        channel.enableVibration(false);
        channel.enableLights(true);
        channel.setLightColor(Color.rgb(255, 192, 157));
        channel.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);
        manager.createNotificationChannel(channel);
    }

    private boolean shouldUseFullScreenAlarm(Context context) {
        KeyguardManager keyguardManager =
            (KeyguardManager) context.getSystemService(Context.KEYGUARD_SERVICE);
        boolean locked = keyguardManager != null &&
            (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                ? keyguardManager.isDeviceLocked()
                : keyguardManager.inKeyguardRestrictedInputMode());

        PowerManager powerManager =
            (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        boolean interactive = powerManager != null &&
            (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT_WATCH
                ? powerManager.isInteractive()
                : powerManager.isScreenOn());

        return locked || !interactive;
    }
}
