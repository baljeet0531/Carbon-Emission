// try edit the cached files and/or the `cachedFiles` list
const cachedFiles = [
    './index.html',
    './manifest.json',
    './src/1st.png',
    './src/2nd.png',
    './src/3rd.png',
    './src/4th.png',
    './src/5th.png',
    './src/6th.png',
    './src/7th.png',
    './src/8th.png',
    './src/app.js',
    './src/check.png',
    './src/co2_icon.jpg',
    './src/menu.png',
    './src/style.css',

]

// edit this to force re-cache
const cacheKey = 'demo-sw-v9';

// install, a good time to preload cache
self.addEventListener('install', event => {
    console.log(`${cacheKey} is installed`)
    event.waitUntil((async () => {
        const cache = await caches.open(cacheKey)
        return cache.addAll(cachedFiles)
    })())
})

self.addEventListener('activate', event => {
    console.log(`${cacheKey} is activated`)
    event.waitUntil((async () => {
        const keys = await caches.keys()
        return Promise.all(keys.filter(key => key != cacheKey).map(key => caches.delete(key)))
    })())
})

self.addEventListener('fetch', event => {
    event.respondWith((async () => {

        if (event.request.mode === "navigate" &&
            event.request.method === "GET" &&
            registration.waiting &&
            (await clients.matchAll()).length < 2
        ) {
            registration.waiting.postMessage('skipWaiting');
            return new Response("", { headers: { "Refresh": "0" } });
        }

        const response = await caches.match(event.request)
        if (response) {
            console.log(`Cache fetch: ${event.request.url}`)
            return response
        }
        console.log(`Network fetch: ${event.request.url}`)
        return fetch(event.request)
    })())
})

addEventListener('message', messageEvent => {
    if (messageEvent.data === 'skipWaiting') return skipWaiting();
});