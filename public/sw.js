// Service Worker to serve .txt files as JavaScript
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // If it's a .txt file from _next directory, serve it with JS content-type
  if (url.pathname.includes('_next') && url.pathname.endsWith('.txt')) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.ok) {
          // Clone the response and add the correct content-type
          const headers = new Headers(response.headers);
          headers.set('Content-Type', 'application/javascript');
          
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: headers
          });
        }
        return response;
      }).catch(() => {
        // Fallback if fetch fails
        return new Response('', { status: 404 });
      })
    );
  }
}); 