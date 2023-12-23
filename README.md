# CMS Cache
This Cloudflare Worker caches CMS responses at the edge.

By default, Cloudflare only caches HTTP responses with certain file extensions. This Worker lets us cache responses without these specified headers. It also lets us keep a specific Max-Age given by the CMS, instead of having Cloudflare override it with the domain-wide default as it would do if you added a Cache Everything page rule.

Instead of supplying a `Cache-Control` header (which may be manipulated by Cloudflare at the edge), the CMS puts a max age in a `Cache-Max-Age` header. This Worker takes that `Cache-Max-Age` and fills it into a `Cache-Control` header.