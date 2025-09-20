// Service Worker for offline support
const CACHE_NAME = 'forsyth-clubs-v1';
const STATIC_CACHE = 'forsyth-clubs-static-v1';
const DYNAMIC_CACHE = 'forsyth-clubs-dynamic-v1';

// Files to cache for offline use
const STATIC_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - try network first, fallback to cache
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request).then((response) => {
            if (response) {
              return response;
            }
            // Return offline page for API requests
            return new Response(
              JSON.stringify({ 
                error: 'Offline', 
                message: 'This feature requires an internet connection' 
              }),
              { 
                status: 503, 
                headers: { 'Content-Type': 'application/json' } 
              }
            );
          });
        })
    );
  } else {
    // Static files - cache first, fallback to network
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request).then((response) => {
            // Cache successful responses
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.destination === 'document') {
            return caches.match('/offline.html');
          }
          return new Response('Offline', { status: 503 });
        })
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'club-views') {
    event.waitUntil(syncClubViews());
  }
  
  if (event.tag === 'user-actions') {
    event.waitUntil(syncUserActions());
  }
});

// Sync club views when back online
async function syncClubViews() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    const clubViewRequests = requests.filter(req => 
      req.url.includes('/api/clubs/') && req.url.includes('/views')
    );
    
    for (const request of clubViewRequests) {
      try {
        await fetch(request);
        await cache.delete(request);
      } catch (error) {
        console.log('Failed to sync club view:', error);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Sync user actions when back online
async function syncUserActions() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    const userActionRequests = requests.filter(req => 
      req.url.includes('/api/users/') || req.url.includes('/api/actions/')
    );
    
    for (const request of userActionRequests) {
      try {
        await fetch(request);
        await cache.delete(request);
      } catch (error) {
        console.log('Failed to sync user action:', error);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}
