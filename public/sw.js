const promiseResolves = {};

self.addEventListener('message', ({data}) => {
    const {id, response } = data;
    promiseResolves?.[id](new Response(response));
})

self.addEventListener('fetch', (event) => {
    event.respondWith(
        Promise.race([
            new Promise((resolve) => {
                self.clients.get(event.clientId).then(client => {
                    client.postMessage({
                        url: event.request.url,
                        destination: event.request.destination,
                        method: event.request.method,
                    });
                    promiseResolves[event.request.url] = resolve;
                })
            }),
            new Promise((resolve) => {
                fetch(event.request.url).then(res => {
                    setTimeout(() => {
                        resolve(res);
                    }, 2000)
                })
            })
        ])
    )
})

self.addEventListener('install', () => {
    console.log('install');
})

self.addEventListener('activate', (event) => {
    console.log('activate', self.__WB_MANIFEST);
    event.waitUntil(self.clients.claim())
})

self.skipWaiting();