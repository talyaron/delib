console.log('hello form src sw....');

import {BackgroundSyncPlugin} from 'workbox-background-sync';
import {registerRoute} from 'workbox-routing';
import {NetworkOnly} from 'workbox-strategies';
import {precacheAndRoute} from 'workbox-precaching';
import {StaleWhileRevalidate} from 'workbox-strategies';

registerRoute(
  ({url}) => url.pathname.startsWith('/src'),
  new StaleWhileRevalidate()
);
const bgSyncPlugin = new BackgroundSyncPlugin('myQueueName', {
  maxRetentionTime: 24 * 60 // Retry for max of 24 Hours (specified in minutes)
});

registerRoute(
  /\/api\/.*\/*.json/,
  new NetworkOnly({
    plugins: [bgSyncPlugin]
  }),
  'POST'
);

precacheAndRoute([
    {url: '/index.html', revision: '1' },
    {url:'/dev.bundle.js', revision:'1'},
    {url:'/?/chatfeed', revision:'1'}
  ]);

