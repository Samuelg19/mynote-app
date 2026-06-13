package com.mynotes.app;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONObject;

public final class TaskAlarmStore {
    private static final String PREFERENCES = "mynote_task_alarms";
    private static final String KEY_ALARMS = "scheduled_alarms";
    private static final String KEY_PENDING_ACTION = "pending_action";

    private TaskAlarmStore() {}

    private static SharedPreferences preferences(Context context) {
        return context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE);
    }

    public static synchronized JSONArray getAlarms(Context context) {
        String value = preferences(context).getString(KEY_ALARMS, "[]");
        try {
            return new JSONArray(value);
        } catch (Exception ignored) {
            return new JSONArray();
        }
    }

    public static synchronized void saveAlarms(Context context, JSONArray alarms) {
        preferences(context)
            .edit()
            .putString(KEY_ALARMS, alarms == null ? "[]" : alarms.toString())
            .apply();
    }

    public static synchronized void savePendingAction(
        Context context,
        JSONObject payload,
        String action
    ) {
        JSONObject pending = new JSONObject();
        try {
            pending.put("action", action);
            pending.put("taskId", payload.optString("taskId", ""));
            pending.put("routineId", payload.optString("routineId", ""));
            pending.put("alarmId", payload.optString("id", ""));
        } catch (Exception ignored) {
            return;
        }

        preferences(context)
            .edit()
            .putString(KEY_PENDING_ACTION, pending.toString())
            .apply();
    }

    public static synchronized JSONObject consumePendingAction(Context context) {
        String value = preferences(context).getString(KEY_PENDING_ACTION, "");
        preferences(context).edit().remove(KEY_PENDING_ACTION).apply();

        if (value == null || value.isEmpty()) return new JSONObject();

        try {
            return new JSONObject(value);
        } catch (Exception ignored) {
            return new JSONObject();
        }
    }
}
