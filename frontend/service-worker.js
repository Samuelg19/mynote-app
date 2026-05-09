const CACHE_NAME = "mynote-cache-v1";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/login.html",
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
  "/js/cadastro.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});