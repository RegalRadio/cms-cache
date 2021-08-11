# CMS Cache
This Cloudflare Worker is used to customise the Edge Cache behaviour for some API responses. It:
1. Caches responses at Cloudflare's edge, where appropriate.
2. [Updates the Cache-Control max-age](#max-age-adjustment) which is sent to the client, to take into account the age of the item cached at Cloudflare's edge.

The Worker is deployed by a GitHub Action on push to `main` of this repo.

## Caching levels
API responses have various levels of caching.

* The admin interface has no special caching -- take care when adjusting cache settings to not accidentally cache something from the admin panel.
* Uploads to the CMS are served with a long `Cache-Control` header and needs no adjustment here.
* [Schedule responses](https://github.com/RegalRadio/regalradio.net-cms/blob/main/plugins/schedule/controllers/schedule.js) set a `Cache-Control` header with a max age of either 2 hours, or the number of seconds til the next schedule event (i.e. the next show start or end time), whichever is shorter.
* [Date responses](https://github.com/RegalRadio/regalradio.net-cms/blob/main/plugins/date/controllers/date.js) sets a `Cache-Control` header with a max age of the number of seconds til midnight.
* [Other responses](https://github.com/RegalRadio/regalradio.net-cms/blob/main/middlewares/cache_control/index.js) set a `Cache-Control` header with a max age of 2 hours.

## `max-age` adjustment
For CMS media uploads, we don't need to do anything special -- we can just use a fixed time for the cache `max-age`, since it doesn't really matter when that item is considered stale as long as it's a good while away. For things like the schedule, the `max-age` from the origin is specially calculated to into account when that  response becomes stale: for example when the next schedule event is or when the next day starts.

Let's say the CMS says item can be cached for 2 hours. This response is cached at the edge. 30 mins later, another request comes in for the same URL. The response sent to the client should have a max-age of 1hr 30mins, since the original CMS response had an age of 2 hours and it's been sitting on the edge for 30 mins.

In addition to the `Cache-Control` header, the origin also serves a `Cache-Max-Age` header. This age of the cached item is subtracted from the `Cache-Max-Age` to find the `max-age` which should be sent to the client.
