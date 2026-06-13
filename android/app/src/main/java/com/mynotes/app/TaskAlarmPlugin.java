package com.mynotes.app;

import android.Manifest;
import android.app.AlarmManager;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.activity.result.ActivityResult;
import androidx.core.app.NotificationManagerCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import org.json.JSONArray;
import org.json.JSONObject;

@CapacitorPlugin(
    name = "TaskAlarm",
    permissions = {
        @Permission(
            alias = "notifications",
            strings = { Manifest.permission.POST_NOTIFICATIONS }
        )
    }
)
public class TaskAlarmPlugin extends Plugin {
    @PluginMethod
    public void sync(PluginCall call) {
        try {
            JSArray received = call.getArray("alarms", new JSArray());
            JSONArray alarms = new JSONArray(received.toString());
            TaskAlarmScheduler.sync(getContext(), alarms);

            JSObject result = new JSObject();
            result.put("scheduled", alarms.length());
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Nao foi possivel agendar os alarmes.", error);
        }
    }

    @PluginMethod
    public void cancelAll(PluginCall call) {
        TaskAlarmScheduler.cancelAll(getContext());
        call.resolve();
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        call.resolve(buildStatus());
    }

    @PluginMethod
    public void requestAccess(PluginCall call) {
        if (
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            getPermissionState("notifications") != PermissionState.GRANTED
        ) {
            requestPermissionForAlias(
                "notifications",
                call,
                "notificationPermissionCallback"
            );
            return;
        }

        continueSpecialAccess(call);
    }

    @PermissionCallback
    private void notificationPermissionCallback(PluginCall call) {
        if (call == null) return;
        continueSpecialAccess(call);
    }

    private void continueSpecialAccess(PluginCall call) {
        if (
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
            !canScheduleExactAlarms()
        ) {
            try {
                Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                intent.setData(Uri.parse("package:" + getContext().getPackageName()));
                startActivityForResult(call, intent, "exactAlarmSettingsResult");
                return;
            } catch (Exception ignored) {
                // Continue to the full-screen access check.
            }
        }

        continueFullScreenAccess(call);
    }

    @ActivityCallback
    private void exactAlarmSettingsResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        continueFullScreenAccess(call);
    }

    private void continueFullScreenAccess(PluginCall call) {
        if (
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE &&
            !canUseFullScreenIntent()
        ) {
            try {
                Intent intent = new Intent(
                    Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT
                );
                intent.setData(Uri.parse("package:" + getContext().getPackageName()));
                startActivityForResult(call, intent, "fullScreenSettingsResult");
                return;
            } catch (Exception ignored) {
                // Resolve with the current status if the settings page is unavailable.
            }
        }

        call.resolve(buildStatus());
    }

    @ActivityCallback
    private void fullScreenSettingsResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        call.resolve(buildStatus());
    }

    @PluginMethod
    public void consumeAction(PluginCall call) {
        JSONObject action = TaskAlarmStore.consumePendingAction(getContext());
        try {
            call.resolve(JSObject.fromJSONObject(action));
        } catch (Exception error) {
            call.resolve(new JSObject());
        }
    }

    private JSObject buildStatus() {
        JSObject status = new JSObject();
        status.put(
            "notifications",
            NotificationManagerCompat.from(getContext()).areNotificationsEnabled()
        );
        status.put("exactAlarms", canScheduleExactAlarms());
        status.put("fullScreen", canUseFullScreenIntent());
        return status;
    }

    private boolean canScheduleExactAlarms() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return true;

        AlarmManager alarmManager =
            (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
        return alarmManager != null && alarmManager.canScheduleExactAlarms();
    }

    private boolean canUseFullScreenIntent() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            return true;
        }

        NotificationManager manager =
            (NotificationManager) getContext().getSystemService(
                Context.NOTIFICATION_SERVICE
            );
        return manager != null && manager.canUseFullScreenIntent();
    }
}
