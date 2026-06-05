package com.mynotes.app;

import android.app.Activity;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "DeviceSound")
public class DeviceSoundPlugin extends Plugin {
    private Ringtone activeRingtone;

    @PluginMethod
    public void play(PluginCall call) {
        String type = call.getString("type", "notification");
        String mode = call.getString("mode", "system");
        String uriValue = call.getString("uri", "");

        Uri soundUri;
        if ("selected".equals(mode) && uriValue != null && !uriValue.isEmpty()) {
            soundUri = Uri.parse(uriValue);
        } else {
            soundUri = RingtoneManager.getDefaultUri(getRingtoneType(type));
        }

        if (soundUri == null) {
            call.reject("Nenhum som do dispositivo foi encontrado.");
            return;
        }

        try {
            if (activeRingtone != null && activeRingtone.isPlaying()) {
                activeRingtone.stop();
            }

            Ringtone ringtone = RingtoneManager.getRingtone(getContext(), soundUri);
            if (ringtone == null) {
                call.reject("Nao foi possivel carregar o som do dispositivo.");
                return;
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                int usage = "alarm".equals(type)
                    ? AudioAttributes.USAGE_ALARM
                    : AudioAttributes.USAGE_NOTIFICATION;
                ringtone.setAudioAttributes(
                    new AudioAttributes.Builder()
                        .setUsage(usage)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                );
            }

            activeRingtone = ringtone;
            ringtone.play();

            JSObject result = new JSObject();
            result.put("ok", true);
            result.put("uri", soundUri.toString());
            result.put("name", getSoundTitle(soundUri));
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Nao foi possivel tocar o som do dispositivo.", error);
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (activeRingtone != null && activeRingtone.isPlaying()) {
            activeRingtone.stop();
        }
        call.resolve();
    }

    @PluginMethod
    public void pick(PluginCall call) {
        String type = call.getString("type", "alarm");
        String currentUri = call.getString("currentUri", "");
        int ringtoneType = getRingtoneType(type);

        Intent intent = new Intent(RingtoneManager.ACTION_RINGTONE_PICKER);
        intent.putExtra(RingtoneManager.EXTRA_RINGTONE_TYPE, ringtoneType);
        intent.putExtra(RingtoneManager.EXTRA_RINGTONE_TITLE, "Escolher som do dispositivo");
        intent.putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_DEFAULT, true);
        intent.putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_SILENT, false);

        Uri existingUri = null;
        if (currentUri != null && !currentUri.isEmpty()) {
            existingUri = Uri.parse(currentUri);
        }
        if (existingUri == null) {
            existingUri = RingtoneManager.getDefaultUri(ringtoneType);
        }
        intent.putExtra(RingtoneManager.EXTRA_RINGTONE_EXISTING_URI, existingUri);

        startActivityForResult(call, intent, "soundPicked");
    }

    @PluginMethod
    public void getDefaultInfo(PluginCall call) {
        String type = call.getString("type", "notification");
        Uri soundUri = RingtoneManager.getDefaultUri(getRingtoneType(type));
        JSObject result = new JSObject();
        result.put("uri", soundUri == null ? "" : soundUri.toString());
        result.put("name", getSoundTitle(soundUri));
        call.resolve(result);
    }

    @ActivityCallback
    private void soundPicked(PluginCall call, ActivityResult result) {
        if (call == null) return;

        if (result.getResultCode() != Activity.RESULT_OK) {
            JSObject cancelled = new JSObject();
            cancelled.put("cancelled", true);
            call.resolve(cancelled);
            return;
        }

        Intent data = result.getData();
        Uri pickedUri = null;
        if (data != null) {
            pickedUri = data.getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI);
        }

        JSObject response = new JSObject();
        response.put("cancelled", false);
        response.put("uri", pickedUri == null ? "" : pickedUri.toString());
        response.put("name", getSoundTitle(pickedUri));
        call.resolve(response);
    }

    private int getRingtoneType(String type) {
        return "alarm".equals(type)
            ? RingtoneManager.TYPE_ALARM
            : RingtoneManager.TYPE_NOTIFICATION;
    }

    private String getSoundTitle(Uri uri) {
        if (uri == null) return "";

        try {
            Ringtone ringtone = RingtoneManager.getRingtone(getContext(), uri);
            return ringtone == null ? "" : ringtone.getTitle(getContext());
        } catch (Exception error) {
            return "";
        }
    }
}
