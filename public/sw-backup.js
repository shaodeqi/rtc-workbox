const promiseResolves = {};
const generateID = (len = 16) =>
  Array.from(new Array(len), () => Math.floor(Math.random() * 256)).join();

self.addEventListener('message', ({ data }) => {
  const { id, headers, response } = data;

  promiseResolves?.[id](
    new Response(response, {
      statusText: 'OK(from RTC)',
      headers: { ...headers, 'X-Response-From': 'webRTC' },
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    Promise.race([
      new Promise((resolve) => {
        self.clients.get(event.clientId).then((client) => {
          const id = generateID();
          client?.postMessage({
            id,
            url: event.request.url,
            destination: event.request.destination,
            method: event.request.method,
          });
          promiseResolves[id] = resolve;
        });
      }),
      new Promise((resolve) => {
        fetch(event.request.url).then((res) => {
          setTimeout(() => {
            resolve(res);
          }, 100);
        });
      }),
    ])
  );
});

self.addEventListener('install', () => {
  console.log('install');
});

self.addEventListener('activate', (event) => {
  console.log('activate', self.__WB_MANIFEST);
  event.waitUntil(self.clients.claim());
});

self.skipWaiting();
