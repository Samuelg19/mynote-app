package com.mynotes.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import java.util.LinkedHashMap;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONObject;

public final class TaskAlarmScheduler {
    public static final String EXTRA_PAYLOAD = "mynote_alarm_payload";

    private TaskAlarmScheduler() {}

    public static synchronized void sync(Context context, JSONArray alarms) {
        cancelStored(context);
        JSONArray groupedAlarms = groupByTimeAndKind(alarms);
        TaskAlarmStore.saveAlarms(context, groupedAlarms);

        for (int index = 0; index < groupedAlarms.length(); index++) {
            JSONObject alarm = groupedAlarms.optJSONObject(index);
            if (alarm != null) schedule(context, alarm);
        }
    }

    private static JSONArray groupByTimeAndKind(JSONArray alarms) {
        Map<String, JSONObject> groups = new LinkedHashMap<>();

        for (int index = 0; index < alarms.length(); index++) {
            JSONObject event = alarms.optJSONObject(index);
            if (event == null) continue;

            String kind = event.optString("kind", "alarm");
            long triggerAt = event.optLong("triggerAt", 0);
            String key = kind + ":" + triggerAt;
            JSONObject group = groups.get(key);

            try {
                if (group == null) {
                    group = new JSONObject();
                    group.put("id", kind + "-batch-" + triggerAt);
                    group.put("kind", kind);
                    group.put("triggerAt", triggerAt);
                    group.put("time", event.optString("time", ""));
                    group.put(
                        "reminderMinutes",
                        event.optInt("reminderMinutes", 0)
                    );
                    group.put(
                        "soundMode",
                        event.optString("soundMode", "device-default")
                    );
                    group.put("soundUri", event.optString("soundUri", ""));
                    group.put("tasks", new JSONArray());
                    groups.put(key, group);
                }

                group.getJSONArray("tasks").put(
                    new JSONObject(event.toString())
                );
            } catch (Exception ignored) {
                // Ignore only the malformed event and continue scheduling others.
            }
        }

        JSONArray grouped = new JSONArray();
        for (JSONObject group : groups.values()) {
            grouped.put(group);
        }
        return grouped;
    }

    public static synchronized void cancelAll(Context context) {
        cancelStored(context);
        TaskAlarmStore.saveAlarms(context, new JSONArray());
    }

    public static synchronized void rescheduleStored(Context context) {
        JSONArray alarms = TaskAlarmStore.getAlarms(context);
        for (int index = 0; index < alarms.length(); index++) {
            JSONObject alarm = alarms.optJSONObject(index);
            if (alarm != null) schedule(context, alarm);
        }
    }

    private static void cancelStored(Context context) {
        JSONArray stored = TaskAlarmStore.getAlarms(context);
        AlarmManager manager =
            (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (manager == null) return;

        for (int index = 0; index < stored.length(); index++) {
            JSONObject alarm = stored.optJSONObject(index);
            if (alarm == null) continue;
            manager.cancel(createPendingIntent(context, alarm));
        }
    }

    private static void schedule(Context context, JSONObject alarm) {
        long triggerAt = alarm.optLong("triggerAt", 0);
        if (triggerAt <= System.currentTimeMillis()) return;

        AlarmManager manager =
            (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (manager == null) return;

        PendingIntent alarmIntent = createPendingIntent(context, alarm);

        if (
            Build.VERSION.SDK_INT < Build.VERSION_CODES.S ||
            manager.canScheduleExactAlarms()
        ) {
            Intent showIntent = new Intent(context, MainActivity.class);
            PendingIntent showPendingIntent = PendingIntent.getActivity(
                context,
                requestCode(alarm.optString("id", "")) + 3,
                showIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            manager.setAlarmClock(
                new AlarmManager.AlarmClockInfo(triggerAt, showPendingIntent),
                alarmIntent
            );
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            manager.setAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                triggerAt,
                alarmIntent
            );
        } else {
            manager.set(AlarmManager.RTC_WAKEUP, triggerAt, alarmIntent);
        }
    }

    private static PendingIntent createPendingIntent(
        Context context,
        JSONObject alarm
    ) {
        Intent intent = new Intent(context, TaskAlarmReceiver.class);
        intent.putExtra(EXTRA_PAYLOAD, alarm.toString());

        return PendingIntent.getBroadcast(
            context,
            requestCode(alarm.optString("id", "")),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private static int requestCode(String alarmId) {
        return ("mynote:" + alarmId).hashCode() & 0x7fffffff;
    }

    public static int notificationId(JSONObject payload) {
        return requestCode(payload.optString("id", "active-alarm"));
    }
}
