// Veydor service worker — maakt de app installeerbaar en houdt hem
// automatisch up-to-date. Bij elke keer openen wordt online gekeken of er
// een nieuwere versie is; zo niet (offline), dan valt hij terug op de cache.
// Check-data (blockchain/prijzen) gaat ALTIJD naar het netwerk, nooit uit cache.

// Verhoog dit versienummer bij grote wijzigingen om de cache zeker te vernieuwen.
const CACHE = "veydor-shell-v2";
const SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png"
];

// Bij installatie: de app-schil vast in de cache zetten en meteen doorschakelen.
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(SHELL);
    }).then(function () { return self.skipWaiting(); })
  );
});

// Bij activatie: oude caches opruimen en direct de controle overnemen,
// zodat de nieuwe versie meteen actief is (geen wachten op sluiten).
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
  if (req.method !== "GET") return;

  var url = new URL(req.url);

  // Nooit cachen: onze eigen API en externe data-bronnen. Altijd vers.
  if (url.pathname.startsWith("/api/") ||
      url.hostname.indexOf("dexscreener") !== -1 ||
      url.hostname.indexOf("frankfurter") !== -1) {
    return; // browser handelt het normaal af (netwerk)
  }

  // Voor de app-schil: NETWERK-EERST. Zo krijg je altijd de nieuwste versie
  // als je online bent; offline val je terug op de opgeslagen versie.
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req).then(function (res) {
        // Verse kopie in de cache leggen voor offline gebruik.
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
        }
        return res;
      }).catch(function () {
        // Geen internet: gebruik de opgeslagen versie.
        return caches.match(req).then(function (cached) {
          return cached || caches.match("/index.html");
        });
      })
    );
  }
});

// De pagina kan vragen om meteen te activeren (bij een gevonden update).
self.addEventListener("message", function (event) {
  if (event.data === "skipWaiting") self.skipWaiting();
});
