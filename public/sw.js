import { PrecacheController } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { generateID } from '@/utils/transfer';
import { precacheName } from '@/utils/constant';

const precacheManifest = self.__WB_MANIFEST;
console.log(precacheManifest);
const pluginFetchWithCredentials = {
  requestWillFetch: async ({ request }) => {
    return new Request(request.url, { credentials: 'include' });
  },
};

const precacheController = new PrecacheController({
  cacheName: precacheName,
  plugins: [pluginFetchWithCredentials],
});

// precacheController.addToCacheList(precacheManifest);
caches.open('rtc-precache').then((cache) => {
  if (cache) {
    cache.add('/text.js');
    cache.add('/img.png');
    cache.add('/js/src_components_HelloWorld_vue.js');
  }
});

/**
 * Install [Event]
 */
self.addEventListener('install', (event) => {
  // Install precacher
  // console.log('install', precacheManifest);
  event.waitUntil(precacheController.install(event));
});

/**
 * Activate [Event]
 */
self.addEventListener('activate', (event) => {
  // console.log('active');

  // Activate precacher
  event.waitUntil(precacheController.activate(event));
});

const promiseResolves = {};

self.addEventListener('message', ({ data }) => {
  const { id, body, headers } = data;

  promiseResolves?.[id](
    new Response(body, {
      headers: { ...headers, 'X-Response-From': 'webRTC' },
    })
  );
});

registerRoute(
  // Use whatever matching callback you need.
  () => {
    // return precacheController.getCacheKeyForURL(url);
    return true;
  },
  async ({ event }) => {
    let responseFromRTC = new Promise((resolve) => {
      self.clients.get(event.clientId).then((client) => {
        const id = generateID();
        client?.postMessage({
          id,
          url: event.request.url,
        });
        promiseResolves[id] = resolve;
      });
    });
    let response = await Promise.race([responseFromRTC, fetch(event.request)]);
    return response;
  }
);
