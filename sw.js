const STATIC_CACHE_NAME = 'restaurant-static-v6';
const IMG_CACHE_NAME = 'restaurant-img-v2';
const allCaches = [STATIC_CACHE_NAME/*, IMG_CACHE_NAME*/];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(STATIC_CACHE_NAME).then(cache => {
            return cache.addAll([
                'index.html',
                'restaurant.html',
                'dist/js/main.js',
                'dist/js/dbhelper.js',
                'dist/js/restaurant_info.js',
                'dist/css/styles.css'
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
    const { request } = e;
    let { url } = request;

    if (url.indexOf('/restaurant.html?id=') !== -1) {
        url = 'restaurant.html';
    }

    if (new URL(url).pathname === '/')
        url = 'index.html';

    if (url.startsWith('https://maps')) {
        request.mode = 'cors';
        request.headers = new Headers({
            'Access-Control-Allow-Origin':'*'
        });
    }

    e.respondWith(
        caches.open(STATIC_CACHE_NAME).then(cache => {
            return cache.match(url)
                .then(res => {
                    if (res) return res;

                    return fetch(request.url).then(networkResponse => {
                        cache.put(url, networkResponse.clone());
                        return networkResponse;
                    })
                        .catch(err => console.error(err, url))
                })
        }))
});