importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js');

if (workbox)
    console.log(`Workbox berhasil dimuat`);
else
    console.log(`Workbox gagal dimuat`);

workbox.precaching.precacheAndRoute([
    {url: "/manifest.json", revision: '1'},
    {url: "/index.html", revision: '1'},
    {url: "/service-worker.js", revision: '1'},
    {url: "/assets/css/material-icons.css", revision: '1'},
    {url: "/assets/css/materialize.min.css", revision: '1'},
    {url: "/assets/css/style.css", revision: '1'},
    {url: "/assets/fonts/MaterialIcons-Regular.ttf", revision: '1'},
    {url: "/assets/fonts/MaterialIcons-Regular.woff", revision: '1'},
    {url: "/assets/fonts/MaterialIcons-Regular.woff2", revision: '1'},
    {url: "/assets/images/icon-128.png", revision: '1'},
    {url: "/assets/images/icon-192.png", revision: '1'},
    {url: "/assets/images/icon-256.png", revision: '1'},
    {url: "/assets/images/icon-512.png", revision: '1'},
    {url: "/assets/images/no-club-logo.png", revision: '1'},
    {url: "/assets/js/api.js", revision: '1'},
    {url: "/assets/js/components.js", revision: '1'},
    {url: "/assets/js/db-helper.js", revision: '1'},
    {url: "/assets/js/idb.js", revision: '1'},
    {url: "/assets/js/materialize.min.js", revision: '1'},
    {url: "/assets/js/nav.js", revision: '1'},
    {url: "/assets/js/notification.js", revision: '1'},
    {url: "/assets/js/register-service-worker.js", revision: '1'},
]);

workbox.routing.registerRoute(
    new RegExp('/pages/'),
    workbox.strategies.staleWhileRevalidate({
        cacheName: 'pages'
    })
);

workbox.routing.registerRoute(
    new RegExp('https://api.football-data.org/'),
    workbox.strategies.staleWhileRevalidate({
        cacheName: 'football-data'
    })
);

workbox.routing.registerRoute(
    new RegExp('https://upload.wikimedia.org/'),
    workbox.strategies.staleWhileRevalidate({
        cacheName: 'team-crest',
        plugins: [
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            }),
            new workbox.expiration.Plugin({
                maxAgeSeconds: 60 * 60 * 24 * 365,
                maxEntries: 30
            })
        ]
    })
);

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
