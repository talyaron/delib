const SITE_STATIC = 'site-static';
const SITE_DYNAMIC = 'site-dynamic-v1';


if( "setAppBadge" in navigator && "clearAppBadge" in navigator){

	//use the native badge API
    console.log('WE can start using badges');
    navigator.setAppBadge(12).catch(e=>{console.error(e)})

}  else {
    console.error('no badges in brwoser')
}

const assets = [
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

    //     activationEvt.waitUntil(
    //         caches.keys().then(keys=>{
    //             console.log(keys)
    //             return Promise.all(keys.filter(key=>key !== SITE_STATIC).map(key=>caches.delete(key)))
    //         })
    //     )
})

self.addEventListener('fetch', ev => {


    ev.respondWith(
        caches.match(ev.request)
            .then(cacheRes => {
                return cacheRes || fetch(ev.request)
                    // .then(fetchRes => {
                    //     return caches.open(SITE_DYNAMIC).then(cache => {
                    //         cache.put(ev.request.url, fetchRes.clone());
                    //         return fetchRes;
                    //     })
                    // })
            })
    )
})

