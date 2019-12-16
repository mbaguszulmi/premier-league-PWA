const CACHE_NAME = "premiere-league";

var urlsToCache = [
    "/",
    "/manifest.json",
    "/index.html",
    "/service-worker.js",
    "/pages/general.html",
    "/pages/team.html",
    "/assets/css/material-icons.css",
    "/assets/css/materialize.min.css",
    "/assets/css/style.css",
    "/assets/fonts/MaterialIcons-Regular.ttf",
    "/assets/fonts/MaterialIcons-Regular.woff",
    "/assets/fonts/MaterialIcons-Regular.woff2",
    "/assets/images/icon-128.png",
    "/assets/images/icon-192.png",
    "/assets/images/icon-256.png",
    "/assets/images/icon-512.png",
    "/assets/images/no-club-logo.png",
    "/assets/js/api.js",
    "/assets/js/components.js",
    "/assets/js/db-helper.js",
    "/assets/js/idb.js",
    "/assets/js/materialize.min.js",
    "/assets/js/nav.js",
    "/assets/js/notification.js",
    "/assets/js/register-service-worker.js",
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("fetch", event => {
    const base_url = "https://api.football-data.org/";
    if (event.request.url.indexOf(base_url) > -1) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(response => {
                    var fetchPromise = fetch(event.request).then(function(networkResponse) {
                        cache.put(event.request.url, networkResponse.clone());
                        return networkResponse;
                    })
                    return response || fetchPromise;
                })
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request, {'ignoreSearch': true}).then(response => {
                return response || fetch (event.request);
            })
        );
    }
});

self.addEventListener("activate", event => {
    console.log("activate...");
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    console.log("Caches: ", cacheName);
                    if (cacheName != CACHE_NAME) {
                        console.log("ServiceWorker: cache " + cacheName + " dihapus");
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener("notificationclick", event => {
    if (!event.action) {
        // Penguna menyentuh area notifikasi diluar action
        console.log('Notification Click.');
        return;
    }

    switch (event.action) {
        case 'open_url':
            console.log('Pengguna memilih action open_url.');
            clients.openWindow('http://127.0.0.1:8887/');
            break;
        default:
            console.log(`Action yang dipilih tidak dikenal: '${event.action}'`);
            break;
    }
});

self.addEventListener("push", event => {
    let data;
    if (event.data) {
        data = event.data.json();
        console.log(event.data);
    } else {
        body = 'Push message no payload';
    }
    let options = {
        body: data.body,
        icon: '/assets/images/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
        },
        actions: [{action: "open_url", title: "Open"}],
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
