self.addEventListener('message', ({data}) => {
    console.log('【service worker】message', data);
    
})

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
})

self.addEventListener('activate', (event) => {
    console.log('activate', self.__WB_MANIFEST);
    event.waitUntil(self.clients.claim())
})

self.skipWaiting();