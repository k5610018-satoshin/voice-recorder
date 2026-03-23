// Service Worker - 振り返り録音 PWA v3
// オフラインキャッシュ最小構成

const CACHE_NAME = "voice-recorder-v3";
const ASSETS = [
  "./",
  "./index.html",
];

// インストール: アセットをキャッシュ
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// アクティベート: 古いキャッシュを削除
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// フェッチ: ネットワーク優先、失敗時キャッシュフォールバック
self.addEventListener("fetch", (event) => {
  // GAS APIへのPOSTリクエストはキャッシュしない
  if (event.request.method !== "GET") return;

  // GAS URLへのリクエストはネットワークのみ
  if (event.request.url.includes("script.google.com")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 成功したらキャッシュを更新
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // オフライン時はキャッシュから返す
        return caches.match(event.request);
      })
  );
});
