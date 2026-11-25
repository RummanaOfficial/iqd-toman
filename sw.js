/* Service Worker — يجعل التطبيق يعمل بدون إنترنت */

// تم تغيير رقم الإصدار إلى v2 لمسح الكاش القديم
const CACHE_NAME = "iqd-toman-cache-v2"; 
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg"
];

/* التثبيت: خزّن الملفات الأساسية فقط */
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

/* الجلب: تعامل فقط مع ملفات التطبيق، ولا تتدخل في طلبات الإنترنت الخارجية */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  
  // ✅ سطر مهم جداً: إذا كان الطلب لموقع خارجي (مثل جلب الأسعار)، اتركه يمر للإنترنت مباشرة
  if (url.origin !== self.location.origin) {
    return;
  }

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