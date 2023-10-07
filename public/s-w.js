import { PrecacheController } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
console.log(CacheFirst)

const prefix = 'rtc';
const precacheName = `${prefix}_precache`;
const precacheManifest = self.__WB_MANIFEST;
const pluginFetchWithCredentials = {
  requestWillFetch: async ({ request }) => {
    return new Request(request.url, { credentials: 'include' });
  },
};

const precacheController = new PrecacheController({
  cacheName: precacheName,
  plugins: [pluginFetchWithCredentials],
});
precacheController.addToCacheList(precacheManifest);

/**
 * Install [Event]
 */
self.addEventListener('install', (event) => {
  // Install precacher
  console.log('install', precacheManifest)
  event.waitUntil(precacheController.install(event));
});

// /**
//  * Activate [Event]
//  */
self.addEventListener('activate', (event) => {
  console.log('active')

  // Activate precacher
  event.waitUntil(precacheController.activate(event));
});

registerRoute(
  // Use whatever matching callback you need.
  ({ url }) => !!precacheController.getCacheKeyForURL(url),
  new CacheFirst({
    cacheName: precacheName,
  }),
);
