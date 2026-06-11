const CACHE_NAME = 'moult-ai-v4';
const VERSION = '4.0.0';
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

// Install event - cache assets
self.addEventListener('install', event => {
    console.log('[SW] Installing new version:', VERSION);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching app assets');
                return cache.addAll(urlsToCache).catch(err => {
                    console.error('[SW] Failed to cache:', err);
                });
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches and take control
self.addEventListener('activate', event => {
    console.log('[SW] Activating new version:', VERSION);
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => {
                        console.log('[SW] Deleting old cache:', key);
                        return caches.delete(key);
                    })
            );
        }).then(() => {
            console.log('[SW] Claiming clients');
            return self.clients.claim();
        })
    );
});

// Fetch event - network first with cache fallback (for updates)
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return event.respondWith(fetch(event.request));
    }

    // For HTML files - network first (to get latest version)
    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request)
                        .then(cached => cached || caches.match('./index.html'));
                })
        );
        return;
    }

    // For static assets - cache first, then network
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                const fetchPromise = fetch(event.request)
                    .then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        if (cachedResponse) return cachedResponse;
                        if (event.request.destination === 'image') {
                            return new Response('', { status: 404 });
                        }
                        return new Response('Offline', { status: 503 });
                    });

                return cachedResponse || fetchPromise;
            })
    );
});

// Check for updates
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'CHECK_UPDATE') {
        console.log('[SW] Checking for updates...');
        fetch('./index.html', { cache: 'reload' })
            .then(response => {
                if (response.ok) {
                    self.clients.matchAll().then(clients => {
                        clients.forEach(client => {
                            client.postMessage({ type: 'UPDATE_AVAILABLE', version: VERSION });
                        });
                    });
                }
            })
            .catch(err => console.error('[SW] Update check failed:', err));
    }
});
