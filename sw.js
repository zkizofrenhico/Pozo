// Guarda el juego en el teléfono para jugar sin internet.
// Al publicar una versión nueva, cambiar VERSION para que los teléfonos la actualicen.
const VERSION = "pozo-v3";
const CORE = ["./", "./index.html", "./juego.js", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))));
  self.clients.claim();
});

// Primero lo guardado (rápido y sin internet); en segundo plano trae lo nuevo.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.open(VERSION).then((cache) => cache.match(e.request, { ignoreSearch: true }).then((hit) => {
    const net = fetch(e.request).then((res) => {
      if (res && (res.ok || res.type === "opaque")) cache.put(e.request, res.clone());
      return res;
    }).catch(() => hit || (e.request.mode === "navigate" ? cache.match("./index.html") : undefined));
    return hit || net;
  })));
});
