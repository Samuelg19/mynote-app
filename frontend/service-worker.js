const CACHE_NAME = "mynote-cache-v9";

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
  "/assets/alarme-suave.wav",
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
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      if (event.request.mode === "navigate") {
        const fallback = await caches.match("/dashboard.html");
        if (fallback) return fallback;
      }

      return new Response(JSON.stringify({ msg: "Recurso indisponivel offline." }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const dados = event.notification.data || {};
  const destino =
    event.action === "ja-fiz" && dados.tarefaId
      ? `/dashboard.html?acao=concluir-tarefa&tarefaId=${encodeURIComponent(dados.tarefaId)}&rotinaId=${encodeURIComponent(dados.rotinaId || "")}`
      : "/dashboard.html";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const dashboardClient = clientList.find((client) =>
          client.url.includes("/dashboard.html"),
        );

        if (dashboardClient) {
          if ("navigate" in dashboardClient) {
            return dashboardClient.navigate(destino).then((client) => client.focus());
          }

          return dashboardClient.focus();
        }

        return clients.openWindow(destino);
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
  const actions =
    dados.tipo === "tarefa"
      ? [
          { action: "vou-fazer", title: "Vou fazer" },
          { action: "ja-fiz", title: "Ja fiz" },
        ]
      : [];
  const tag =
    dados.tipo === "tarefa" && dados.tarefaId
      ? `mynote-tarefa-${dados.tarefaId}`
      : dados.tipo === "lembrete" && dados.lembreteId
        ? `mynote-lembrete-${dados.lembreteId}`
        : dados.alarme
          ? "mynote-alarme"
          : undefined;
  const options = {
    body: dados.body || "Voce tem um aviso no MyNote.",
    icon: "/assets/icon-192.png",
    badge: "/assets/icon-192.png",
    actions,
    tag,
    renotify: false,
    requireInteraction: !!dados.alarme || dados.tipo === "tarefa",
    vibrate: dados.alarme ? [420, 140, 420, 140, 420] : [180, 80, 180],
    data: {
      url: dados.url || "/dashboard.html",
      tipo: dados.tipo || "",
      tarefaId: dados.tarefaId || "",
      rotinaId: dados.rotinaId || "",
      horario: dados.horario || "",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
