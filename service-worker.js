const CACHE_NAME="tower-battle-v23";
const GAME_FILES=[
  "./",
  "./index.html",
  "./style.css?v=20260720b",
  "./game.js?v=20260721n",
  "./web-app.js?v=20260719",
  "./boss-prototype.css?v=20260721b",
  "./level4.html",
  "./level4.css?v=20260721f",
  "./level4.js?v=20260721f",
  "./boss-layout.html",
  "./boss-layout.css?v=20260721a",
  "./boss-layout.js?v=20260721b",
  "./manifest.webmanifest",
  "./assets/alien-battlefield.png",
  "./assets/blue-tower.png",
  "./assets/red-tower.png",
  "./assets/blue-giant.png",
  "./assets/boss/giant-slam.png",
  "./assets/boss/giant-right-arm-destroyed.png",
  "./assets/boss/boss-arena-background.png",
  "./assets/red-megalodon.png",
  "./assets/world2-rift-background.png",
  "./assets/world2-shield-blue.png",
  "./assets/world2-shield-red.png",
  "./assets/world2-shield-destroyed.png",
  "./assets/world3-storm-reactor-background.png",
  "./assets/icons/icon-192.png",
  "./assets/soldiers/blue-walk-away.png",
  "./assets/soldiers/blue-walk-away-2.png",
  "./assets/soldiers/blue-walk-away-3.png",
  "./assets/soldiers/blue-walk-side.png",
  "./assets/soldiers/blue-walk-side-2.png",
  "./assets/soldiers/blue-walk-side-3.png",
  "./assets/soldiers/blue-attack-fire.png",
  "./assets/soldiers/blue-attack-smash.png",
  "./assets/soldiers/red-walk-away.png",
  "./assets/soldiers/red-walk-away-2.png",
  "./assets/soldiers/red-walk-away-3.png",
  "./assets/soldiers/red-walk-side.png",
  "./assets/soldiers/red-walk-side-2.png",
  "./assets/soldiers/red-walk-side-3.png",
  "./assets/soldiers/red-attack-fire.png",
  "./assets/soldiers/red-attack-smash.png",
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
