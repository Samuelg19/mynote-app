const CACHE_NAME = "mynote-cache-v19";

const FILES_TO_CACHE = [
  "/",
  "/manifest.json",
  "/apple-touch-icon.png",
  "/index.html",
  "/cadastro.html",
  "/dashboard.html",
  "/configuracoes.html",
  "/css/style.css",
  "/css/pages/dashboard.css",
  "/css/pages/configuracoes.css",
  "/css/pages/auth.css",
  "/css/features/anotacoes.css",
  "/vendor/quill/quill.snow.css",
  "/css/responsive/mobile.css",
  "/js/api.js",
  "/js/app-preferences.js",
  "/js/native-alarms.js",
  "/js/dashboard.js",
  "/js/anotacoes.js",
  "/vendor/quill/quill.js",
  "/vendor/dompurify/purify.min.js",
  "/js/configuracoes.js",
  "/js/login.js",
  "/js/cadastro.js",
  "/assets/icon-192.png",
  "/assets/icon-512.png",
  "/assets/favicon.png",
  "/assets/notificacao-mynote.mp3",
  "/assets/alarme-mynote-editado.mp3"
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
  const deveConcluirTarefa = event.action === "ja-fiz" && dados.tarefaId;
  const tarefasParaFila =
    Array.isArray(dados.tarefas) && event.action
      ? dados.tarefas.slice(1)
      : dados.tarefas;
  const destino =
    deveConcluirTarefa
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
          if (Array.isArray(tarefasParaFila) && tarefasParaFila.length) {
            dashboardClient.postMessage({
              type: "MYNOTE_ABRIR_FILA_ALARMES",
              tarefas: tarefasParaFila,
            });
          }

          if (deveConcluirTarefa) {
            dashboardClient.postMessage({
              type: "MYNOTE_CONCLUIR_TAREFA",
              tarefaId: dados.tarefaId,
              rotinaId: dados.rotinaId || "",
            });
          }

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
  const tarefas = Array.isArray(dados.tarefas) ? dados.tarefas : [];
  const tarefaPrincipal = tarefas[0] || dados;
  const actions =
    dados.tipo === "tarefa" && tarefaPrincipal.tarefaId
      ? [
          { action: "vou-fazer", title: "Vou fazer" },
          { action: "ja-fiz", title: "Ja fiz" },
        ]
      : [];
  const alarmeAtivo =
    dados.alarme === true || dados.alarme === 1 || dados.alarme === "true";
  const tag =
    dados.tipo === "tarefa" && tarefas.length > 1
      ? `mynote-tarefas-${dados.horario || "agora"}`
      : dados.tipo === "tarefa" && tarefaPrincipal.tarefaId
        ? `mynote-tarefa-${tarefaPrincipal.tarefaId}`
      : dados.tipo === "lembrete" && dados.lembreteId
        ? `mynote-lembrete-${dados.lembreteId}`
        : alarmeAtivo
          ? "mynote-alarme"
          : undefined;
  const options = {
    body: dados.body || "Voce tem um aviso no MyNote.",
    icon: "/assets/icon-192.png",
    badge: "/assets/icon-192.png",
    actions,
    tag,
    renotify: false,
    silent: false,
    requireInteraction: alarmeAtivo || dados.tipo === "tarefa",
    timestamp: Date.now(),
    vibrate: alarmeAtivo ? [520, 160, 520, 160, 720] : [180, 80, 180],
    data: {
      url: dados.url || "/dashboard.html",
      tipo: dados.tipo || "",
      tarefaId: tarefaPrincipal.tarefaId || "",
      lembreteId: dados.lembreteId || "",
      rotinaId: tarefaPrincipal.rotinaId || "",
      horario: dados.horario || "",
      alarme: alarmeAtivo,
      tarefas,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
