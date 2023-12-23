async function handleRequest(request) {
    const cache = caches.default;

    // Check whether the value is already available in the cache
    let response = await cache.match(request.url)

    if (!response) {
        // If not in cache, get it from origin and cache it for next time
        response = await fetch(request);
        if (response.ok) {
            await cache.put(request.url, response.clone());
        }
    } 
    
    if (response.headers.get("Cache-Max-Age")) {
        response = new Response(response.body, response); // Rebuild response object so headers are mutable.
        response.headers.set("Cache-Control", "public, must-revalidate, max-age=" + (parseInt(response.headers.get("Cache-Max-Age")) || 0));
    }

    return response;
}

addEventListener("fetch", event => {
    return event.respondWith(handleRequest(event.request))
})