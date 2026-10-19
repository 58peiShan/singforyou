/* 離線快取（只在 http/https 網站上啟用）：有網路時抓最新版，沒網路時用上次的快取。 */
var CACHE = 'chaoyue-v1';
var CORE = ['./', 'index.html', 'css/base.css', 'css/stage.css', 'css/screens.css', 'data/script.js',
  'js/util.js', 'js/persist.js', 'js/art.js', 'js/audio.js', 'js/stage.js', 'js/engine.js', 'js/ui.js', 'js/main.js',
  'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'manifest.webmanifest'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE).catch(function () {}); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// 頁面載入後會把所有素材網址傳過來，背景下載一份，之後離線也看得到圖、聽得到音樂
self.addEventListener('message', function (e) {
  if (!e.data || e.data.type !== 'precache' || !Array.isArray(e.data.urls)) return;
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(e.data.urls.map(function (u) {
      return c.match(u).then(function (hit) { return hit || c.add(u).catch(function () {}); });
    }));
  }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.headers.has('range')) {
    // 音樂播放會分段讀取：有快取就從快取切出那一段，沒有就走網路
    e.respondWith(caches.match(req.url, { ignoreSearch: true }).then(function (hit) {
      if (!hit) return fetch(req);
      return hit.arrayBuffer().then(function (buf) {
        var m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || '') || [];
        var start = m[1] ? +m[1] : 0;
        var end = m[2] ? Math.min(+m[2], buf.byteLength - 1) : buf.byteLength - 1;
        return new Response(buf.slice(start, end + 1), {
          status: 206,
          headers: { 'Content-Range': 'bytes ' + start + '-' + end + '/' + buf.byteLength, 'Content-Length': String(end - start + 1), 'Content-Type': hit.headers.get('Content-Type') || 'audio/mpeg', 'Accept-Ranges': 'bytes' },
        });
      });
    }));
    return;
  }
  e.respondWith(fetch(req).then(function (res) {
    if (res && res.ok && res.type === 'basic') {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (hit) { return hit || caches.match('index.html'); });
  }));
});
