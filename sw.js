importScripts('js/idb.js');
importScripts('js/indexDB.js');

/*
TO DO:
- Open a cache
- Add all items making up the to cache
- Remove old cached items

*/

//Create and add static files to cache
const static = 'restReviewStatic-v41';
const dynamic = 'restReviewDynamic-v3';
const appShell = [
    '/',
    '/index.html',
    '/fallback.html',
    '/restaurant.html',
    '/manifest.json',
    '/css/mobile.css',
    '/css/phablet.css',
    '/css/styles.css',
    '/css/tablet.css',
    '/js/idb.js',
    '/js/indexDB.js',
    '/js/zdbhelper.js',
    '/js/main.js',
    '/js/restaurant_info.js',
    '/img/1.jpg',
    '/img/2.jpg',
    '/img/3.jpg',
    '/img/4.jpg',
    '/img/5.jpg',
    '/img/6.jpg',
    '/img/7.jpg',
    '/img/8.jpg',
    '/img/9.jpg',
    '/img/10.jpg',
    '/img/icons/app-icon-48x48.png',
    '/img/icons/app-icon-96x96.png',
    '/img/icons/app-icon-144x144.png',
    '/img/icons/app-icon-192x192.png',
    '/img/icons/app-icon-256x256.png',
    '/img/icons/app-icon-384x384.png',
    '/img/icons/app-icon-512x512.png',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
    'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png',
];

//TODO: Trim dynamic cache to remove old items
const trimCache = (cacheName, maxItems) => {
    caches.open(cacheName)
        .then(cache => {
            return cache.keys()
                .then( keys => {
                    if (keys.length > maxItems) {
                        cache.delete(keys[0])
                            .then(trimCache(cacheName, maxItems));
                    }
                });
        })
}

//Helper function to loop through array of static files
const appShellFiles = (string, array) => {
    for (let i=0; i < array.length; i++){
        if (array[i] === string){
            return true;
        }
    }
    return false;
}

//Call the Service worker Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(static)
            .then( cache => {
                cache.addAll(appShell);
            })
    );
});

//Call the service worker activate event
self.addEventListener('activate', event => {
    // Remove old caches
    event.waitUntil(
        caches.keys().then( cacheNames => {
            return Promise.all(
                cacheNames.map( cache => {
                    if ( cache !== static && cache !== dynamic ){
                        return caches.delete( cache );
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    let url = 'http://localhost:1337/restaurants';
    if (event.request.url.indexOf(url) > - 1) {
        event.respondWith(fetch( event.request )
            .then( res => {
                const clonedRes = res.clone();
                    clonedRes.json()
                        .then( restaurants => {
                            restaurants.map( restaurants => {
                               writeData('restaurants', restaurants)
                            })
                        });
                return res;
            })
        );
    } else if (appShellFiles(event.request.url, appShell)){
        event.respondWith(
            caches.match(event.request)
        );
    }else{
        event.respondWith(
                   caches.match(event.request)
        .then( response => {
            if( response ){
                return response;
            }else{
                fetch( event.request )
                    .then( res => {
                        return caches.open( dynamic )
                            .then( cache => {
                                trimCache( dynamic, 99);
                                cache.put(event.request.url, res.clone());
                                return res;
                            })
                    })
                    .catch(err => {
                        return caches.open(static)
                                .then( cache => {
                                    if (event.request.headers.get('accept').includes('text/html, image/png, application/xhtml application/xml; image/webp')){
                                        return cache.match('fallback.html');
                                    }
                                });
                    });
            }
        })
        );
    }
});