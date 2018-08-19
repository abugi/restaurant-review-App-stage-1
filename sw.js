/*
TO DO:
- Create cache
- Add all response items to cache
- Remove old cached items

*/

//Create cache
const cacheName = 'restReviewCache-v3';

//Call the Service worker Install event
self.addEventListener('install', (e) => {
});

//Call the service worker activate event
self.addEventListener('activate', (e) => {
    //Remove old caches
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if(cache !== cacheName){
                        return caches.delete(cache);
                    }
                })
            )
        })
    )
})

// call Fecth Event
self.addEventListener('fetch', e => {
    e.respondWith(
        fetch(e.request)
        .then(res => {
            //Clone the resposne
            const resClone = res.clone();
            //Open Cache
            caches.open(cacheName)
            .then(cache => {
                //Add response to cache
                cache.put(e.request, resClone);
            });
            return res;
        })
        .catch(err => caches.match(e.request).then(res => res))
    );
});