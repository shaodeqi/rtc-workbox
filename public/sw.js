import { PrecacheController } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { generateID, precacheName } from '@/utils';
console.log(CacheFirst, generateID, location);

const precacheManifest = self.__WB_MANIFEST;
const pluginFetchWithCredentials = {
  requestWillFetch: async ({ request }) => {
    console.log('request', request);
    return new Request(request.url, { credentials: 'include' });
  },
};

const precacheController = new PrecacheController({
  cacheName: precacheName,
  plugins: [pluginFetchWithCredentials],
});

// precacheController.addToCacheList(precacheManifest);
caches.open('rtc-precache').then((cache) => {
  cache.add('/text.js');
  cache.add('/logo2.png');
});

/**
 * Install [Event]
 */
self.addEventListener('install', (event) => {
  // Install precacher
  console.log('install', precacheManifest);
  event.waitUntil(precacheController.install(event));
});

// /**
//  * Activate [Event]
//  */
self.addEventListener('activate', (event) => {
  console.log('active');

  // Activate precacher
  event.waitUntil(precacheController.activate(event));
});

const promiseResolves = {};

self.addEventListener('message', ({ data }) => {
  const { id, headers, response } = data;

  promiseResolves?.[id](
    new Response(response, {
      statusText: 'OK(from RTC)',
      headers: { ...headers, 'X-Response-From': 'webRTC' },
    })
  );
});

registerRoute(
  // Use whatever matching callback you need.
  ({ url }) => {
    // return precacheController.getCacheKeyForURL(url);
    console.log(url);
    return true;
  },
  async ({ event }) => {
    let responseFromRTC = new Promise((resolve) => {
      console.log(event);
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
    });
    let response = await Promise.race([responseFromRTC, fetch(event.request)]);
    return response;
  }
);
