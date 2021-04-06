
const SITE_STATIC = 'site-static-v1';
const SITE_DYNAMIC = 'site-dynamic-v2';

const PREVIOUS_STATIC = 'site-static'
const PREVIOUS_DYNAMIC = 'site-dynamic-v1'


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
    try {

        console.info('sw has been installed')
        const preCache = async () => {
            const cache = await caches.open(SITE_STATIC);
            console.info('cached')
            return cache.addAll(assets);
        };
        installEvn.waitUntil(preCache());
    } catch (e) {
        console.error(e)
    }
})

self.addEventListener('activate', activationEvt => {
    try {
        console.info('.........sw was activated', activationEvt);
    } catch (e) {
        console.error(e)
    }

})

self.addEventListener('fetch', ev => {

    try {
        updateDynamicly(ev);
    } catch (e) {
        console.error(e)
    }
})

function updateDynamicly(ev) {
    try {

        const request = ev.request.url;
        const innerPageRegExp = /\?\//;

        // if (!request.match(innerPageRegExp)) {
        // if (true) {
        //     ev.respondWith(caches.match(ev.request)
        //         .then(function (response) {
        //             return response || fetch(ev.request);
        //         })
        //         .catch(e => console.error(e))
        //     );
        // }

        ev.respondWith(
            caches.open(SITE_DYNAMIC)
                .then(cache => cache.match(ev.request)
                    .then(response => {

                        return response || fetch(ev.request)
                            .then(response => {
                                cache.put(ev.request, response.clone()).catch(e=>{console.info(ev.request.url)});
                                return response;
                            }).catch(e => {
                                console.log(ev.request.url)
                                console.error(e)
                            })
                    }).catch(e => {
                        console.log(ev.request.url)
                        console.error(e)
                    })
                ).catch(e => {
                    console.log(ev.request.url)
                    console.error(e)
                })
        );
    } catch (e) {
        console.log(ev.request.url)
        console.error(e)
    }
}

deleteCache(PREVIOUS_DYNAMIC);
deleteCache(PREVIOUS_STATIC);

function deleteCache(cacheName) {
    caches.delete(cacheName)
        .then(wasDeleted => {
            if (wasDeleted) {
                console.info(`cache ${cacheName} was deteled`)
            } else {
                console.info(`cache ${cacheName} was not deteled`)
            }
        })
        .catch(e => console.error(e));
}

