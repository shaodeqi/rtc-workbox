console.log(self.__WB_MANIFEST);
self.addEventListener('message', ({data}) => {
    console.log('message111', data);
    // console.log('randomString', randomString)
    
})
// const messageCache = {}

self.addEventListener('fetch', (event) => {
    if (!event.request.url.includes('text.json')) {
        return;
    } else {
        event.respondWith(new Promise(() => {
            self.clients.get(event.clientId).then(client => {
                client.postMessage({
                    url: event.request.url,
                    destination: event.request.destination,
                    method: event.request.method,
                });
            })
        }))
    }
})

self.addEventListener('install', () => {
    console.log('install');
    console.log(self.clients);
})

self.addEventListener('activate', (event) => {
    console.log('activate', self.RTCPeerConnection);
    event.waitUntil(self.clients.claim())
})

self.skipWaiting();