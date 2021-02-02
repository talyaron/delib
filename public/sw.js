const SITE_STATIC = 'site-static';
const assets = [
    '/',
    '/js/velocity.js',
    '/settings.js',
    '/img/new.svg',
    '/img/hamburger.svg',
    '/img/add_alert.svg',
    '/img/home-24px.svg',
    '/img/feed.svg',
    '/img/messages.svg',
    '/img/addToHome.svg',
    '/manifest.webmanifest',
    'https://fonts.googleapis.com/css?family=Varela+Round',
    'https://fonts.gstatic.com/s/varelaround/v13/w8gdH283Tvk__Lua32TysjIfp8uPLdshZg.woff2',
    'https://fonts.gstatic.com/s/varelaround/v13/w8gdH283Tvk__Lua32TysjIfpcuPLdshZhVB.woff2'

]

self.addEventListener('install', installEvn => {
    console.log('sw has been installed', installEvn)
    const preCache = async () => {
        const cache = await caches.open(SITE_STATIC);
        console.log('cached')
        return cache.addAll(assets);
      };
      installEvn.waitUntil(preCache());

})

self.addEventListener('activate', activationEvt => {
    console.log('.........sw was activated', activationEvt);
})

self.addEventListener('fetch', ev => {
    console.log('fetch event', ev.request.url);

    ev.respondWith(
        caches.match(ev.request)
        .then(cacheRes=>{
            return cacheRes || fetch(ev.request)
        })
    )
})

// self.addEventListener('fetch', event => {
//     console.log('fetch event')
//     console.log(event)
//     // Let the browser do its default thing
//     // for non-GET requests.
//     if (event.request.method != 'GET') return;

//     // Prevent the default, and handle the request ourselves.
//     event.respondWith(async function() {
//       // Try to get the response from a cache.
//       const cache = await caches.open('dynamic-v1');
//       const cachedResponse = await cache.match(event.request);

//       if (cachedResponse) {
//         // If we found a match in the cache, return it, but also
//         // update the entry in the cache in the background.
//         event.waitUntil(cache.add(event.request));
//         return cachedResponse;
//       }

//       // If we didn't find a match in the cache, use the network.
//       return fetch(event.request);
//     }());
//   });