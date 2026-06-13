package com.mynotes.app;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.net.Uri;
import android.util.Log;

public final class TaskAudioCoordinator {
    private static final String TAG = "MyNoteTaskAudio";
    private static boolean alarmActive;
    private static MediaPlayer reminderPlayer;

    private TaskAudioCoordinator() {}

    public static synchronized void beginAlarm() {
        alarmActive = true;
        stopReminderLocked();
        Log.i(TAG, "Alarm audio has priority.");
    }

    public static synchronized void endAlarm() {
        alarmActive = false;
    }

    public static synchronized boolean isAlarmActive() {
        return alarmActive;
    }

    public static synchronized void playReminder(
        Context context,
        Uri soundUri,
        Runnable onFinished
    ) {
        if (alarmActive) {
            Log.i(TAG, "Reminder sound suppressed by active alarm.");
            runCallback(onFinished);
            return;
        }

        stopReminderLocked();
        try {
            reminderPlayer = new MediaPlayer();
            reminderPlayer.setAudioAttributes(
                new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
            );
            reminderPlayer.setDataSource(context, soundUri);
            reminderPlayer.setOnCompletionListener((player) -> {
                synchronized (TaskAudioCoordinator.class) {
                    stopReminderLocked();
                }
                runCallback(onFinished);
            });
            reminderPlayer.setOnErrorListener((player, what, extra) -> {
                synchronized (TaskAudioCoordinator.class) {
                    stopReminderLocked();
                }
                runCallback(onFinished);
                return true;
            });
            reminderPlayer.prepare();
            reminderPlayer.start();
            Log.i(TAG, "Reminder sound started.");
        } catch (Exception ignored) {
            stopReminderLocked();
            runCallback(onFinished);
        }
    }

    private static void stopReminderLocked() {
        if (reminderPlayer == null) return;
        try {
            if (reminderPlayer.isPlaying()) reminderPlayer.stop();
        } catch (Exception ignored) {
            // The short sound may have already completed.
        }
        reminderPlayer.release();
        reminderPlayer = null;
        Log.i(TAG, "Reminder sound stopped.");
    }

    private static void runCallback(Runnable callback) {
        if (callback != null) callback.run();
    }
}
