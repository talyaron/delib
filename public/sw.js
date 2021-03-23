const SITE_STATIC = 'site-static';
const SITE_DYNAMIC = 'site-dynamic-v1';


const assets = [
    'index.html',
    '/dev.bundle.js',
    '/js/velocity.js',
    '/settings.js',
    '/img/new.svg',
    '/img/hamburger.svg',
    '/img/add_alert.svg',
    '/img/home-24px.svg',
    '/img/feed.svg',
    '/img/back.svg',
    '/img/logo.png',
    '/img/favicon.ico',
    '/img/messages.svg',
    '/img/addToHome.svg',
    '/manifest.webmanifest',
    'https://fonts.googleapis.com/css?family=Varela+Round',
    'https://fonts.gstatic.com/s/varelaround/v13/w8gdH283Tvk__Lua32TysjIfp8uPLdshZg.woff2',
    'https://fonts.gstatic.com/s/varelaround/v13/w8gdH283Tvk__Lua32TysjIfpcuPLdshZhVB.woff2'

]

self.addEventListener('install', installEvn => {
    console.info('sw has been installed')
    const preCache = async () => {
        const cache = await caches.open(SITE_STATIC);
        console.info('cached')
        return cache.addAll(assets);
    };
    installEvn.waitUntil(preCache());

})

self.addEventListener('activate', activationEvt => {
    console.info('.........sw was activated', activationEvt);

})

self.addEventListener('fetch', ev => {

    try {
        console.log('fetch...')
        ev.respondWith(
            caches.match(ev.request)
                .then(cacheRes => {
                    return cacheRes || fetch(ev.request)
                        .then(async fetchRes => {
                            const cache = await caches.open(SITE_DYNAMIC);
                            cache.put(ev.request.url, fetchRes.clone());
                            return fetchRes;
                        })
                })
        )
    } catch (e) {
        console.log(e)
    }
})

