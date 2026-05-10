const CACHE_NAME = "mynote-cache-v5";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/cadastro.html",
  "/dashboard.html",
  "/configuracoes.html",
  "/css/style.css",
  "/css/pages/dashboard.css",
  "/css/pages/configuracoes.css",
  "/css/pages/auth.css",
  "/css/responsive/mobile.css",
  "/js/api.js",
  "/js/app-preferences.js",
  "/js/dashboard.js",
  "/js/configuracoes.js",
  "/js/login.js",
  "/js/cadastro.js",
  "/assets/icon-192.png",
  "/assets/notificacao.wav"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
      ),
      self.clients.claim(),
    ])
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const dashboardClient = clientList.find((client) =>
          client.url.includes("/dashboard.html"),
        );

        if (dashboardClient) {
          return dashboardClient.focus();
        }

        return clients.openWindow(event.notification.data?.url || "/dashboard.html");
      }),
  );
});

self.addEventListener("push", (event) => {
  let dados = {};

  try {
    dados = event.data ? event.data.json() : {};
  } catch {
    dados = { title: "MyNote", body: event.data?.text() || "" };
  }

  const title = dados.title || "MyNote";
  const options = {
    body: dados.body || "Voce tem um aviso no MyNote.",
    icon: "/assets/icon-192.png",
    badge: "/assets/icon-192.png",
    requireInteraction: !!dados.alarme,
    vibrate: dados.alarme ? [420, 140, 420, 140, 420] : [180, 80, 180],
    data: {
      url: dados.url || "/dashboard.html",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
