async function handleRequest(request) {
    const cache = caches.default;

    // Check whether the value is already available in the cache
    let response = await cache.match(request.url)

    if (!response) {
        // If not in cache, get it from origin and cache it for next time
        response = await fetch(request);
        await cache.put(request.url, response.clone());
    } 
    
    /*  
    When pulling from an edge cache, the Cache-Control header is overridden by Cloudflare and set to the domain-wide default. So, instead of using Cache-Control, the CMS gives a max-age number in the Cache-Max-Age header. Since this is a non-standard header, Cloudflare leaves it alone. In the next statement, we change the Cache-Max-Age number into a proper Cache-Control header the browser can understand.
    
    We also subtract the age of the cached item from the original max-age before we give a number to the browser. This is because some CMS items are served with a very precise max-age (for example, the date endpoint give a max age time-til-next-midnight, since that's the next time the date will change). We need to adjust these values before we pass them to the browser cache so they expire from the browser cache at the same time they expire from the edge cache. For some items which just have a default standard cache time, this means browser cache expiration might be shorter than it could be, but it's not a major concern.
    */
    if (response.headers.get("Cache-Max-Age")) {
        response = new Response(response.body, response); // Rebuild response object so headers are mutable.
        let newMaxAge = parseInt(response.headers.get("Cache-Max-Age")) - (parseInt(response.headers.get("Age") || 0)
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