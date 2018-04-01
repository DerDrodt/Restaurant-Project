const STATIC_CACHE_NAME = 'restaurant-static-v3';
const IMG_CACHE_NAME = 'restaurant-img-v2';
const allCaches = [STATIC_CACHE_NAME/*, IMG_CACHE_NAME*/];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(STATIC_CACHE_NAME).then(cache => {
            return cache.addAll([
                'index.html',
                'restaurant.html',
                'js/main.js',
                'js/dbhelper.js',
                'js/restaurant_info.js',
                'data/restaurants.json',
                'css/styles.css'
            ]);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('activated');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName.startsWith('restaurant-') &&
                        !allCaches.includes(cacheName);
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('fetch', e => {
    if(e.request.url.indexOf('/restaurant.html?id=') !== -1) {
        e.respondWith(
            caches.open(STATIC_CACHE_NAME).then(cache => {
                return cache.match('restaurant.html').then(res => {
                    return res;
                });
            })
        )
        return;
    }

    e.respondWith(
        caches.open(STATIC_CACHE_NAME).then(cache => {
            return cache.match(e.request.url)
                .then(res => {
                    if (res) return res;

                    return fetch(e.request).then(networkResponse => {
                        cache.put(e.request.url, networkResponse.clone());
                        return networkResponse;
                    })
                })
        }))
});