async function handleRequest(request) {
    const cache = caches.default;

    // Check whether the value is already available in the cache
    let response = await cache.match(request.url)

    if (!response) {
        // If not in cache, get it from origin
        response = await fetch(request);

        // If request is cacheable, cache it for next time
        if (request.method === "GET" && isUrlCachable(request.url))
            await cache.put(request.url, response.clone());
    } else if (response.headers.get("Cache-Max-Age")) {
        // If serving a response from the cache, we need to update the Cache-Control headers, since Cloudflare
        // will have overridden them with the domain-level default.  We can calculate the correct browser cache
        // max age using the Cache-Max-Age provided by the Regal Radio CMS (which Cloudflare won't fiddle with
        // since it's not a standard cache header) and the age of the cached item. If there's no Cache-Max-Age
        // header, we skip this and assume the Cloudflare override is okay.

        response = new Response(response.body, response); // Rebuild response object so headers are mutable.
        let newMaxAge = parseInt(response.headers.get("Cache-Max-Age")) - parseInt(response.headers.get("age"))
        response.headers.set("Cache-Control", "public, must-revalidate, max-age=" + newMaxAge);
    }

    return response;
}

async function isUrlCachable(url) {
    const urlObj = new URL(url);
    return     url.pathname.startsWith("/api/shows")
            || url.pathname.startsWith("/api/date")
            || url.pathname.startsWith("/api/persons")
            || url.pathname.startsWith("/api/schedule")
            || url.pathname.startsWith("/api/sponsors")
}

addEventListener("fetch", event => {
    return event.respondWith(handleRequest(event.request))
})