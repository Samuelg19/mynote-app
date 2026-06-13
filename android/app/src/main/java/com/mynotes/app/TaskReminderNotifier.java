package com.mynotes.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.graphics.Color;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import org.json.JSONArray;
import org.json.JSONObject;

public final class TaskReminderNotifier {
    private static final String TAG = "MyNoteTaskReminder";
    private static final String CHANNEL_ID = "mynote_task_reminders_v2";

    private TaskReminderNotifier() {}

    public static void show(
        Context context,
        String payloadText,
        BroadcastReceiver.PendingResult pendingResult
    ) {
        JSONObject payload;
        try {
            payload = new JSONObject(payloadText);
        } catch (Exception ignored) {
            payload = new JSONObject();
        }

        JSONArray tasks = payload.optJSONArray("tasks");
        if (tasks == null) tasks = new JSONArray();
        int count = tasks.length();
        int minutes = payload.optInt("reminderMinutes", 15);
        String title = count > 1
            ? count + " tarefas comecam em " + minutes + " minutos"
            : "Tarefa comeca em " + minutes + " minutos";

        NotificationCompat.InboxStyle style = new NotificationCompat.InboxStyle()
            .setBigContentTitle(title);
        for (int index = 0; index < count; index++) {
            JSONObject task = tasks.optJSONObject(index);
            if (task == null) continue;
            style.addLine(
                task.optString("taskTitle", "Tarefa") + " - " +
                task.optString("routineName", "Rotina")
            );
        }

        createChannel(context);
        NotificationManager manager =
            (NotificationManager) context.getSystemService(
                Context.NOTIFICATION_SERVICE
            );
        if (manager != null) {
            manager.notify(
                TaskAlarmScheduler.notificationId(payload),
                new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(android.R.drawable.ic_dialog_info)
                    .setContentTitle(title)
                    .setContentText(
                        count == 1
                            ? tasks.optJSONObject(0).optString("taskTitle", "Tarefa")
                            : "Confira as tarefas programadas."
                    )
                    .setStyle(style)
                    .setNumber(count)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                    .setAutoCancel(true)
                    .setSilent(true)
                    .build()
            );
        }
        Log.i(
            TAG,
            "Reminder shown; driftMs=" +
                (System.currentTimeMillis() - payload.optLong("triggerAt", 0)) +
                "; tasks=" + count
        );

        if (TaskAudioCoordinator.isAlarmActive()) {
            pendingResult.finish();
            return;
        }

        TaskAudioCoordinator.playReminder(
            context,
            resolveSoundUri(context, payload),
            pendingResult::finish
        );
    }

    private static void createChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager =
            (NotificationManager) context.getSystemService(
                Context.NOTIFICATION_SERVICE
            );
        if (manager == null || manager.getNotificationChannel(CHANNEL_ID) != null) {
            return;
        }
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Avisos antecipados de tarefas",
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setSound(null, null);
        channel.enableVibration(false);
        channel.enableLights(true);
        channel.setLightColor(Color.rgb(255, 192, 157));
        manager.createNotificationChannel(channel);
    }

    private static Uri resolveSoundUri(Context context, JSONObject payload) {
        String mode = payload.optString("soundMode", "device-default");
        String selectedUri = payload.optString("soundUri", "");
        if ("mynotes".equals(mode)) {
            return Uri.parse(
                "android.resource://" + context.getPackageName() + "/" +
                R.raw.notificacao_mynote
            );
        }
        if ("device-picked".equals(mode) && !selectedUri.isEmpty()) {
            return Uri.parse(selectedUri);
        }
        return RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
    }
}
