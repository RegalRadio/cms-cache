# CMS Cache
This Cloudflare Worker is used to customise the Edge Cache behaviour for some API responses. It:
1. Caches responses at Cloudflare's edge, where appropriate.
2. [Updates the Cache-Control max-age](#max-age-adjustment) which is sent to the client, to take into account the age of the item cached at Cloudflare's edge.

The Worker is deployed by a GitHub Action on push to `main` of this repo.