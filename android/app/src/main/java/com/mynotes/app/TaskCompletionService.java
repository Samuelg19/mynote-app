package com.mynotes.app;

import android.content.Context;
import android.util.Log;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONObject;

public final class TaskCompletionService {
    private static final String TAG = "MyNoteAlarmComplete";
    private static final int TIMEOUT_MS = 10_000;
    private static final ExecutorService EXECUTOR =
        Executors.newSingleThreadExecutor();

    private TaskCompletionService() {}

    public static void completeInBackground(
        Context context,
        JSONObject payload
    ) {
        completeInBackground(context, payload, null);
    }

    public static void completeInBackground(
        Context context,
        JSONObject payload,
        Runnable onFinished
    ) {
        Context appContext = context.getApplicationContext();
        JSONObject payloadCopy;
        try {
            payloadCopy = new JSONObject(payload.toString());
        } catch (Exception ignored) {
            runCallback(onFinished);
            return;
        }

        if (!hasRequiredData(payloadCopy)) {
            Log.w(TAG, "Alarm payload is missing task completion data.");
            runCallback(onFinished);
            return;
        }

        EXECUTOR.execute(() -> {
            if (!completeTask(payloadCopy)) {
                Log.w(
                    TAG,
                    "Task completion failed; saved for the next app session."
                );
                TaskAlarmStore.savePendingAction(
                    appContext,
                    payloadCopy,
                    "complete"
                );
            }
            runCallback(onFinished);
        });
    }

    private static boolean hasRequiredData(JSONObject payload) {
        return !payload.optString("apiUrl", "").isEmpty() &&
            !payload.optString("authToken", "").isEmpty() &&
            !payload.optString("taskId", "").isEmpty();
    }

    private static boolean completeTask(JSONObject payload) {
        HttpURLConnection connection = null;
        try {
            String apiUrl = payload.optString("apiUrl", "");
            while (apiUrl.endsWith("/")) {
                apiUrl = apiUrl.substring(0, apiUrl.length() - 1);
            }

            String taskId = URLEncoder.encode(
                payload.optString("taskId", ""),
                StandardCharsets.UTF_8.name()
            );
            URL endpoint = new URL(apiUrl + "/tarefas/" + taskId);
            connection = (HttpURLConnection) endpoint.openConnection();
            connection.setRequestMethod("PUT");
            connection.setConnectTimeout(TIMEOUT_MS);
            connection.setReadTimeout(TIMEOUT_MS);
            connection.setDoOutput(true);
            connection.setRequestProperty(
                "Content-Type",
                "application/json; charset=UTF-8"
            );
            connection.setRequestProperty(
                "Authorization",
                "Bearer " + payload.optString("authToken", "")
            );

            byte[] body =
                "{\"concluida\":true,\"status\":\"Concluida\"}"
                    .getBytes(StandardCharsets.UTF_8);
            connection.setFixedLengthStreamingMode(body.length);
            try (OutputStream output = connection.getOutputStream()) {
                output.write(body);
            }

            int statusCode = connection.getResponseCode();
            Log.i(
                TAG,
                "Task completion response: HTTP " + statusCode
            );
            return statusCode >= 200 && statusCode < 300;
        } catch (Exception error) {
            Log.w(TAG, "Task completion request failed.", error);
            return false;
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private static void runCallback(Runnable callback) {
        if (callback != null) {
            callback.run();
        }
    }
}
