const CACHE_NAME="tower-battle-v13";
const GAME_FILES=[
  "./",
  "./index.html",
  "./style.css?v=20260720b",
  "./game.js?v=20260720k",
  "./web-app.js?v=20260719",
  "./manifest.webmanifest",
  "./assets/alien-battlefield.png",
  "./assets/blue-tower.png",
  "./assets/red-tower.png",
  "./assets/blue-giant.png",
  "./assets/red-megalodon.png",
  "./assets/world2-rift-background.png",
  "./assets/world2-shield-blue.png",
  "./assets/world2-shield-red.png",
  "./assets/world2-shield-destroyed.png",
  "./assets/world3-storm-reactor-background.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-512-maskable.png",
  "./assets/icons/apple-touch-icon.png"
];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(GAME_FILES)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response.ok&&new URL(event.request.url).origin===self.location.origin){
      const copy=response.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
    }
    return response;
  }).catch(()=>caches.match("./index.html"))));
});
