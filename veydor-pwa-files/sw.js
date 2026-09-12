// Veydor service worker — maakt de app installeerbaar en laadt de schil snel.
// Belangrijk: check-data (blockchain/prijzen) gaat ALTIJD naar het netwerk,
// nooit uit de cache — anders zou je verouderde uitslagen kunnen zien.

const CACHE = "veydor-shell-v1";
const SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png"
];

// Bij installatie: de app-schil in de cache zetten.
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(SHELL);
    }).then(function () { return self.skipWaiting(); })
  );
});

// Bij activatie: oude caches opruimen.
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  // Alleen GET-verzoeken cachen.
  if (req.method !== "GET") return;

  var url = new URL(req.url);

  // Nooit cachen: onze eigen API (/api/rpc) en externe data-bronnen.
  // Die moeten altijd vers van het netwerk komen.
  if (url.pathname.startsWith("/api/") ||
      url.hostname.indexOf("dexscreener") !== -1 ||
      url.hostname.indexOf("frankfurter") !== -1) {
    return; // laat de browser het normaal afhandelen (netwerk)
  }

  // Voor de app-schil: eerst cache, anders netwerk (en dan in cache zetten).
  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        // alleen geldige, same-origin antwoorden bijcachen
        if (res && res.status === 200 && url.origin === self.location.origin) {
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
        }
        return res;
      }).catch(function () {
        // offline en niet in cache: laat het netwerk-falen zichtbaar zijn
        return cached;
      });
    })
  );
});
