package com.mynotes.app;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.WindowManager;
import android.widget.ImageButton;
import android.widget.TextView;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import org.json.JSONObject;

public class AlarmActivity extends Activity {
    private static final long MAX_RING_DURATION_MS = 10 * 60 * 1000L;
    public static final String ACTION_DISMISS_ALARM =
        "com.mynotes.app.DISMISS_ALARM";
    public static final String ACTION_SHOW_ALARM_TASK =
        "com.mynotes.app.SHOW_ALARM_TASK";

    private JSONObject alarmPayload;
    private BroadcastReceiver dismissReceiver;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable autoDismiss = () -> dismissAlarm(false);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prepareLockScreen();
        setContentView(R.layout.activity_alarm);

        alarmPayload = readPayload(getIntent());
        bindAlarmContent();
        registerDismissReceiver();

        ImageButton doTaskButton = findViewById(R.id.alarmDoTaskButton);
        ImageButton doneButton = findViewById(R.id.alarmDoneButton);

        doTaskButton.setSoundEffectsEnabled(false);
        doneButton.setSoundEffectsEnabled(false);
        doTaskButton.setOnClickListener((view) -> answerAlarm(false));
        doneButton.setOnClickListener((view) -> answerAlarm(true));
        handler.postDelayed(autoDismiss, MAX_RING_DURATION_MS);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        alarmPayload = readPayload(intent);
        bindAlarmContent();
    }

    private void prepareLockScreen() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
            KeyguardManager keyguardManager =
                (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
            if (keyguardManager != null) {
                keyguardManager.requestDismissKeyguard(this, null);
            }
        } else {
            getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            );
        }

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }

    private JSONObject readPayload(Intent intent) {
        try {
            return new JSONObject(intent.getStringExtra(TaskAlarmScheduler.EXTRA_PAYLOAD));
        } catch (Exception ignored) {
            return new JSONObject();
        }
    }

    private void bindAlarmContent() {
        TextView routine = findViewById(R.id.alarmRoutineLabel);
        TextView task = findViewById(R.id.alarmTaskTitle);
        TextView time = findViewById(R.id.alarmTime);

        String routineName = alarmPayload.optString("routineName", "Rotina");
        String taskTitle = alarmPayload.optString("taskTitle", "Tarefa");
        String scheduledTime = alarmPayload.optString("time", "");

        if (scheduledTime.isEmpty()) {
            scheduledTime = new SimpleDateFormat("HH:mm", Locale.getDefault())
                .format(new Date());
        }

        routine.setText(routineName.toUpperCase(Locale.getDefault()));
        task.setText(taskTitle);
        time.setText(scheduledTime);
    }

    private void registerDismissReceiver() {
        dismissReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (ACTION_SHOW_ALARM_TASK.equals(intent.getAction())) {
                    alarmPayload = readPayload(intent);
                    bindAlarmContent();
                    return;
                }
                finishAlarmScreen();
            }
        };

        IntentFilter filter = new IntentFilter();
        filter.addAction(ACTION_DISMISS_ALARM);
        filter.addAction(ACTION_SHOW_ALARM_TASK);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(
                dismissReceiver,
                filter,
                Context.RECEIVER_NOT_EXPORTED
            );
        } else {
            registerReceiver(dismissReceiver, filter);
        }
    }

    private void answerAlarm(boolean completeTask) {
        handler.removeCallbacks(autoDismiss);
        TaskAlarmSoundService.handleAction(this, completeTask);
    }

    private void finishAlarmScreen() {
        handler.removeCallbacks(autoDismiss);
        finish();
    }

    private void dismissAlarm(boolean completeTask) {
        TaskAlarmSoundService.stop(this);
        finishAlarmScreen();
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacks(autoDismiss);
        if (dismissReceiver != null) {
            try {
                unregisterReceiver(dismissReceiver);
            } catch (IllegalArgumentException ignored) {
                // Receiver was already unregistered by the system.
            }
            dismissReceiver = null;
        }
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        // The alarm must be answered with one of the two explicit actions.
    }
}
