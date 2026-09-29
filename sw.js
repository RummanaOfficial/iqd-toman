/* Service Worker — يجعل التطبيق يعمل بدون إنترنت */

const CACHE_NAME = "iqd-toman-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg"
];

/* التثبيت: خزّن الملفات الأساسية */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* التنشيط: احذف النسخ القديمة */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* الجلب: أعطِ من الكاش أولاً، وإن لم يوجد اجلب من الشبكة */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, copy);
          });
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});