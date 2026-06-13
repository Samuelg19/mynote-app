(function () {
  const isNative =
    !!window.Capacitor?.isNativePlatform?.() ||
    window.location.protocol === "capacitor:" ||
    window.location.origin === "https://localhost";
  const plugin = window.Capacitor?.Plugins?.TaskAlarm;

  async function call(method, options = {}) {
    if (!isNative || !plugin?.[method]) return null;
    return plugin[method](options);
  }

  window.MyNoteNativeAlarms = {
    isAvailable() {
      return !!(isNative && plugin);
    },

    async sync(alarms) {
      return call("sync", { alarms: Array.isArray(alarms) ? alarms : [] });
    },

    async cancelAll() {
      return call("cancelAll");
    },

    async getStatus() {
      return (
        (await call("getStatus")) || {
          notifications: false,
          exactAlarms: false,
          fullScreen: false,
        }
      );
    },

    async requestAccess() {
      return call("requestAccess");
    },

    async consumeAction() {
      return (await call("consumeAction")) || {};
    },
  };
})();
