const CACHE_NAME = 'moult-ai-v3';
const urlsToCache = [
    './',
    './index.html',
    './css/style.css',
    './js/script.js',
    './manifest.json',
    './images/logo.png',
    './images/logo16.png',
    './images/logo48.png',
    './images/logo128.png',
    './images/logo512.png',
    './images/logo500-white.png',
    './images/favicon/favicon.ico',
    './images/favicon/favicon-16x16.png',
    './images/favicon/favicon-32x32.png',
    './images/favicon/apple-touch-icon.png',
    './images/favicon/android-chrome-192x192.png',
    './images/favicon/android-chrome-512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache).catch(() => {}))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) return response;
                return fetch(event.request).then(fetchRes => {
                    // Cache new successful requests
                    if (fetchRes && fetchRes.status === 200 && fetchRes.type === 'basic') {
                        const resClone = fetchRes.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
                    }
                    return fetchRes;
                });
            })
            .catch(() => {
                // Offline fallback — return cached page for navigation
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                // Return a simple offline response
                return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
            })
    );
});

// Notify clients about online/offline status changes
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
