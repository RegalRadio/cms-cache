# CMS Cache
This Cloudflare Worker is used to customise the Edge Cache behaviour for some API responses. It:
1. Caches responses at Cloudflare's edge, where appropriate.
2. Updates the Cache-Control max-age which is sent to the client, to take into account the age of the item cached at Cloudflare's edge. For example:
   1. CMS says item can be cached for 2 hours. This response is cached at the edge.
   2. 30 mins later, another request comes in for the same URL. The response sent to the client will have a max-age of 1hr 30mins, since the original CMS response had an age of 2 hours and it's been sitting on the edge for 30 mins.

See https://github.com/RegalRadio/regalradio.net-cms/wiki/Caching.

The Worker is deployed by a GitHub Action on push to `main` of this repo.
