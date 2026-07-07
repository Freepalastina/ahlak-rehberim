const CACHE_VERSION="20260707-v42-android-apple-pwa";
const CACHE_NAME="ahlak-rehberim-"+CACHE_VERSION;
const ASSETS=[
  "./",
  "index.html",
  "style.css",
  "app.js",
  "manifest.json",
  "data/data.json",
  "assets/product-placeholder.svg",
  "icon-180.png",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png"
];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  event.respondWith(
    fetch(event.request).then(res=>{
      const copy=res.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy)).catch(()=>{});
      return res;
    }).catch(()=>caches.match(event.request).then(r=>r||caches.match("index.html")))
  );
});
