package com.mynotes.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.KeyguardManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.util.Log;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import java.util.HashSet;
import java.util.Set;
import org.json.JSONArray;
import org.json.JSONObject;

public class TaskAlarmSoundService extends Service {
    private static final String TAG = "MyNoteAlarmSound";
    private static final String CHANNEL_ID = "mynote_active_alarm_v3";
    private static final String ACTION_ANSWER =
        "com.mynotes.app.ANSWER_ACTIVE_ALARM";
    private static final String EXTRA_COMPLETE = "complete";
    private static final int ACTIVE_NOTIFICATION_ID = 77001;
    private static final long MAX_RING_DURATION_MS = 10 * 60 * 1000L;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable timeout = this::finishBatch;
    private final JSONArray tasks = new JSONArray();
    private final Set<String> taskKeys = new HashSet<>();
    private MediaPlayer mediaPlayer;
    private Vibrator vibrator;
    private JSONObject batchPayload = new JSONObject();
    private boolean started;

    public static Intent createIntent(Context context, String payload) {
        Intent intent = new Intent(context, TaskAlarmSoundService.class);
        intent.putExtra(TaskAlarmScheduler.EXTRA_PAYLOAD, payload);
        return intent;
    }

    public static void handleAction(Context context, boolean complete) {
        Intent intent = new Intent(context, TaskAlarmSoundService.class);
        intent.setAction(ACTION_ANSWER);
        intent.putExtra(EXTRA_COMPLETE, complete);
        ContextCompat.startForegroundService(context, intent);
    }

    public static void stop(Context context) {
        context.stopService(new Intent(context, TaskAlarmSoundService.class));
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_ANSWER.equals(intent.getAction())) {
            answerCurrentTask(intent.getBooleanExtra(EXTRA_COMPLETE, false));
            return START_NOT_STICKY;
        }

        JSONObject incoming = parsePayload(intent);
        mergeTasks(incoming);
        if (tasks.length() == 0) {
            stopSelf();
            return START_NOT_STICKY;
        }

        if (!started) {
            started = true;
            batchPayload = incoming;
            createSilentChannel();
            startForeground(ACTIVE_NOTIFICATION_ID, buildNotification());
            TaskAudioCoordinator.beginAlarm();
            startFeedback(currentTask());
            handler.postDelayed(timeout, MAX_RING_DURATION_MS);
            showCurrentTask();
            Log.i(TAG, "Alarm batch started with " + tasks.length() + " task(s).");
        } else {
            updateNotification();
            Log.i(TAG, "Alarm batch merged; " + tasks.length() + " task(s) pending.");
        }
        return START_NOT_STICKY;
    }

    private JSONObject parsePayload(Intent intent) {
        try {
            String value = intent == null
                ? "{}"
                : intent.getStringExtra(TaskAlarmScheduler.EXTRA_PAYLOAD);
            return new JSONObject(value == null ? "{}" : value);
        } catch (Exception ignored) {
            return new JSONObject();
        }
    }

    private void mergeTasks(JSONObject payload) {
        JSONArray incomingTasks = payload.optJSONArray("tasks");
        if (incomingTasks == null) {
            incomingTasks = new JSONArray();
            incomingTasks.put(payload);
        }

        for (int index = 0; index < incomingTasks.length(); index++) {
            JSONObject task = incomingTasks.optJSONObject(index);
            if (task == null) continue;
            String key = task.optString("id", "") + ":" +
                task.optString("taskId", "");
            if (taskKeys.add(key)) {
                tasks.put(task);
            }
        }
    }

    private JSONObject currentTask() {
        JSONObject task = tasks.optJSONObject(0);
        return task == null ? new JSONObject() : task;
    }

    private void answerCurrentTask(boolean complete) {
        if (tasks.length() == 0) {
            finishBatch();
            return;
        }

        JSONObject answered = currentTask();
        if (complete) {
            TaskCompletionService.completeInBackground(this, answered);
        }
        removeFirstTask();

        if (tasks.length() == 0) {
            finishBatch();
            return;
        }

        updateNotification();
        showCurrentTask();
        Log.i(TAG, "Advanced alarm batch; " + tasks.length() + " task(s) pending.");
    }

    private void removeFirstTask() {
        if (tasks.length() == 0) return;
        JSONObject removed = tasks.optJSONObject(0);
        if (removed != null) {
            taskKeys.remove(
                removed.optString("id", "") + ":" +
                removed.optString("taskId", "")
            );
        }
        tasks.remove(0);
    }

    private Notification buildNotification() {
        JSONObject current = currentTask();
        String currentPayload = current.toString();
        Intent alarmIntent = new Intent(this, AlarmActivity.class);
        alarmIntent.putExtra(TaskAlarmScheduler.EXTRA_PAYLOAD, currentPayload);
        alarmIntent.addFlags(
            Intent.FLAG_ACTIVITY_NEW_TASK |
            Intent.FLAG_ACTIVITY_CLEAR_TOP |
            Intent.FLAG_ACTIVITY_SINGLE_TOP
        );

        PendingIntent fullScreenIntent = PendingIntent.getActivity(
            this,
            ACTIVE_NOTIFICATION_ID,
            alarmIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        PendingIntent openIntent = PendingIntent.getBroadcast(
            this,
            ACTIVE_NOTIFICATION_ID + 1,
            TaskAlarmActionReceiver.createIntent(
                this,
                TaskAlarmActionReceiver.ACTION_OPEN,
                currentPayload
            ),
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        PendingIntent completeIntent = PendingIntent.getBroadcast(
            this,
            ACTIVE_NOTIFICATION_ID + 2,
            TaskAlarmActionReceiver.createIntent(
                this,
                TaskAlarmActionReceiver.ACTION_COMPLETE,
                currentPayload
            ),
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        int count = tasks.length();
        String title = count > 1
            ? count + " tarefas acontecendo agora"
            : current.optString("taskTitle", "Tarefa");
        String text = count > 1
            ? "Responda uma por vez. Atual: " +
                current.optString("taskTitle", "Tarefa")
            : current.optString("routineName", "Rotina");

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

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle(title)
            .setContentText(text)
            .setStyle(style)
            .setNumber(count)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(true)
            .setAutoCancel(false)
            .setSilent(true)
            .setOnlyAlertOnce(true)
            .setContentIntent(fullScreenIntent)
            .addAction(0, "Vou fazer", openIntent)
            .addAction(0, "Ja fiz", completeIntent);

        if (shouldUseFullScreenAlarm()) {
            builder.setFullScreenIntent(fullScreenIntent, true);
        }

        return builder.build();
    }

    private boolean shouldUseFullScreenAlarm() {
        KeyguardManager keyguardManager =
            (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
        boolean locked = keyguardManager != null &&
            (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                ? keyguardManager.isDeviceLocked()
                : keyguardManager.inKeyguardRestrictedInputMode());

        PowerManager powerManager =
            (PowerManager) getSystemService(Context.POWER_SERVICE);
        boolean interactive = powerManager != null &&
            (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT_WATCH
                ? powerManager.isInteractive()
                : powerManager.isScreenOn());

        return locked || !interactive;
    }

    private void updateNotification() {
        NotificationManager manager =
            (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.notify(ACTIVE_NOTIFICATION_ID, buildNotification());
        }
    }

    private void showCurrentTask() {
        Intent intent = new Intent(AlarmActivity.ACTION_SHOW_ALARM_TASK);
        intent.setPackage(getPackageName());
        intent.putExtra(
            TaskAlarmScheduler.EXTRA_PAYLOAD,
            currentTask().toString()
        );
        sendBroadcast(intent);
    }

    private void finishBatch() {
        Intent dismiss = new Intent(AlarmActivity.ACTION_DISMISS_ALARM);
        dismiss.setPackage(getPackageName());
        sendBroadcast(dismiss);
        stopSelf();
    }

    private void createSilentChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager =
            (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager == null || manager.getNotificationChannel(CHANNEL_ID) != null) {
            return;
        }
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Alarmes de tarefas",
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("Alarmes das tarefas e rotinas do MyNotes");
        channel.setSound(null, null);
        channel.enableVibration(false);
        channel.enableLights(true);
        channel.setLightColor(Color.rgb(255, 192, 157));
        channel.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);
        manager.createNotificationChannel(channel);
    }

    private void startFeedback(JSONObject payload) {
        Uri soundUri = resolveSoundUri(payload);
        try {
            mediaPlayer = new MediaPlayer();
            mediaPlayer.setAudioAttributes(
                new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
            );
            mediaPlayer.setDataSource(this, soundUri);
            mediaPlayer.setLooping(true);
            mediaPlayer.prepare();
            mediaPlayer.start();
        } catch (Exception error) {
            Log.w(TAG, "Could not start alarm audio.", error);
            releaseMediaPlayer();
        }

        long[] pattern = new long[] { 0, 520, 160, 520, 160, 720, 650 };
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            VibratorManager manager =
                (VibratorManager) getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            vibrator = manager == null ? null : manager.getDefaultVibrator();
        } else {
            vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        }
        if (vibrator != null && vibrator.hasVibrator()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0));
            } else {
                vibrator.vibrate(pattern, 0);
            }
        }
    }

    private Uri resolveSoundUri(JSONObject payload) {
        String soundMode = payload.optString(
            "soundMode",
            batchPayload.optString("soundMode", "device-default")
        );
        String selectedUri = payload.optString(
            "soundUri",
            batchPayload.optString("soundUri", "")
        );
        if ("mynotes".equals(soundMode)) {
            return Uri.parse(
                "android.resource://" + getPackageName() + "/" +
                R.raw.alarme_mynote
            );
        }
        if ("device-picked".equals(soundMode) && !selectedUri.isEmpty()) {
            return Uri.parse(selectedUri);
        }
        Uri defaultUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
        return defaultUri == null
            ? RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
            : defaultUri;
    }

    private void releaseMediaPlayer() {
        if (mediaPlayer == null) return;
        try {
            if (mediaPlayer.isPlaying()) mediaPlayer.stop();
        } catch (Exception ignored) {
            // The player may already have stopped.
        }
        mediaPlayer.release();
        mediaPlayer = null;
    }

    @Override
    public void onDestroy() {
        handler.removeCallbacks(timeout);
        releaseMediaPlayer();
        if (vibrator != null) {
            vibrator.cancel();
            vibrator = null;
        }
        TaskAudioCoordinator.endAlarm();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE);
        } else {
            stopForeground(true);
        }
        Log.i(TAG, "Alarm batch stopped.");
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
