// Service Worker for offline caching
const CACHE_NAME = 'metro-rail-v3';
const STATIC_CACHE_NAME = 'metro-rail-static-v3';
const DATA_CACHE_NAME = 'metro-rail-data-v3';

// Cache duration settings
const CACHE_DURATIONS = {
  STATIC: 7 * 24 * 60 * 60 * 1000, // 7 days for static files
  API_DATA: 30 * 60 * 1000,         // 30 minutes for API data
  SCHEDULES: 24 * 60 * 60 * 1000     // 24 hours for schedule data
};

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/favicon.svg'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/realtime/arrivals/',
  '/realtime/alerts',
  '/api/realtime-gtfs/arrivals/',
  '/api/realtime-gtfs/alerts'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      }),
      // Initialize data cache
      caches.open(DATA_CACHE_NAME).then((cache) => {
        console.log('[SW] Initialized data cache');
        return Promise.resolve();
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DATA_CACHE_NAME && 
              cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip Vite / Development internal requests
  // These should never be intercepted or cached by the Service Worker
  if (
    url.pathname.startsWith('/@vite/') ||
    url.pathname.startsWith('/@id/') ||
    url.pathname.startsWith('/@fs/') ||
    url.pathname.includes('node_modules') ||
    url.search.includes('vite-') ||
    url.search.includes('token=') || // Vite HMR tokens
    request.url.includes('hot-update')
  ) {
    return;
  }

  // 2. Skip WebSocket upgrade requests
  if (request.headers.get('upgrade') === 'websocket') {
    return;
  }
  
  // Handle API requests
  if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static files
  event.respondWith(handleStaticRequest(request));
});

// Check if request is for API data
function isApiRequest(url) {
  return url.pathname.includes('/api/') || 
         url.pathname.includes('/realtime/') ||
         url.pathname.includes('/auth/');
}

// Handle API requests with cache-first strategy for offline support
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first for fresh data
    console.log('[SW] Fetching from network:', url.pathname);
    
    const networkResponse = await fetch(request.clone());
    
    if (networkResponse.ok) {
      if (request.method === 'GET') {
        // Cache successful API responses
        const cache = await caches.open(DATA_CACHE_NAME);
        
        // Add timestamp to response for cache validation
        const responseToCache = networkResponse.clone();
        const responseData = await responseToCache.json();
        
        const cachedData = {
          data: responseData,
          timestamp: Date.now(),
          url: request.url
        };
        
        // Store with timestamp
        const responseWithTimestamp = new Response(JSON.stringify(cachedData), {
          status: networkResponse.status,
          statusText: networkResponse.statusText,
          headers: {
            'Content-Type': 'application/json',
            'X-Cached': 'false',
            'X-Cache-Time': new Date().toISOString()
          }
        });
        
        cache.put(request, responseWithTimestamp.clone());
        console.log('[SW] Cached API response:', url.pathname);
      }
      
      return networkResponse;
    }
    
    // For non-GET requests or auth endpoints, return the actual server response (e.g. 401, 400)
    // to prevent swallowing errors and incorrectly falling back to a 503 Offline block.
    if (request.method !== 'GET' || url.pathname.includes('/auth/')) {
      return networkResponse;
    }

    throw new Error(`Network response not ok: ${networkResponse.status}`);
    
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', url.pathname);
    
    if (request.method !== 'GET') {
      return createOfflineResponse(request);
    }
    
    // Network failed, try cache
    const cache = await caches.open(DATA_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      const cachedData = await cachedResponse.json();
      
      // Check if cached data is still valid
      const cacheAge = Date.now() - cachedData.timestamp;
      const isStale = cacheAge > CACHE_DURATIONS.API_DATA;
      
      console.log(`[SW] Serving from cache (age: ${Math.floor(cacheAge / 1000)}s):`, url.pathname);
      
      // Add offline indicators to response
      const offlineData = {
        ...cachedData.data,
        offline: true,
        cacheAge: cacheAge,
        lastUpdated: new Date(cachedData.timestamp).toISOString(),
        stale: isStale
      };
      
      return new Response(JSON.stringify(offlineData), {
        status: 200,
        statusText: 'OK (Cached)',
        headers: {
          'Content-Type': 'application/json',
          'X-Cached': 'true',
          'X-Cache-Age': cacheAge.toString(),
          'X-Cache-Time': new Date(cachedData.timestamp).toISOString()
        }
      });
    }
    
    // No cache available, return offline response
    console.log('[SW] No cache available for:', url.pathname);
    return createOfflineResponse(request);
  }
}

// Handle static file requests
async function handleStaticRequest(request) {
  const url = new URL(request.url);
  try {
    // Try cache first for static files
    const cache = await caches.open(STATIC_CACHE_NAME);
    
    if (request.method === 'GET') {
      // For development on localhost, we often want to bypass cache for the main index/assets
      // to allow Vite HMR to work correctly.
      const isLocalDev = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
      const isCriticalAsset = url.pathname === '/' || url.pathname === '/index.html' || url.pathname.endsWith('.tsx') || url.pathname.endsWith('.ts');

      if (!isLocalDev || !isCriticalAsset) {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          console.log('[SW] Serving static from cache:', request.url);
          return cachedResponse;
        }
      }
    }
    
    // Try network for uncached files
    const networkResponse = await fetch(request);
    
    // Opaque responses (e.g. non-CORS cross-origin requests like map tiles)
    if (networkResponse.type === 'opaque') {
      return networkResponse;
    }
    
    if (networkResponse.ok) {
      // Only cache GET requests that are from our origin or specifically requested
      if (request.method === 'GET') {
        cache.put(request, networkResponse.clone());
        console.log('[SW] Cached new static file:', request.url);
      }
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
    
  } catch (error) {
    console.log('[SW] Offline or fetch error - serving fallback for:', request.url);
    
    // Return fallback for HTML requests (only for our own origin)
    if (request.destination === 'document' && url.origin === self.location.origin) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      const fallback = await cache.match('/index.html');
      return fallback || createOfflineHtmlResponse();
    }
    
    // If it's an external resource (like Google Fonts) and it fails, 
    // don't return our custom 503 JSON; just let it fail or return a simple error.
    if (url.origin !== self.location.origin) {
      throw error; // Let the browser handle the fetch failure
    }
    
    // Return offline response for other internal requests
    return createOfflineResponse(request);
  }
}

// Create offline response for API requests
function createOfflineResponse(request) {
  const url = new URL(request.url);
  
  if (url.pathname.includes('/arrivals/')) {
    // Mock arrivals data for offline mode
    const stationId = url.pathname.split('/').pop();
    return new Response(JSON.stringify({
      stationId,
      arrivals: [],
      offline: true,
      message: 'No cached data available. Please connect to internet for live updates.',
      lastUpdated: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cached': 'offline-fallback' }
    });
  }
  
  if (url.pathname.includes('/alerts')) {
    return new Response(JSON.stringify({
      alerts: [{
        id: 'offline-alert',
        severity: 'medium',
        type: 'system',
        title: 'Offline Mode',
        message: 'You are currently offline. Data may be outdated.',
        timestamp: Date.now()
      }],
      offline: true,
      lastUpdated: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cached': 'offline-fallback' }
    });
  }
  
  // Generic offline response
  return new Response(JSON.stringify({
    error: 'Offline',
    message: 'This feature requires an internet connection',
    offline: true
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Create offline HTML response
function createOfflineHtmlResponse() {
  const offlineHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Metro Rail Scheduler - Offline</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 50px; 
          background: #f5f5f5; 
        }
        .offline-container {
          max-width: 400px;
          margin: 0 auto;
          padding: 40px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .offline-icon { font-size: 64px; margin-bottom: 20px; }
        h1 { color: #333; margin-bottom: 20px; }
        p { color: #666; line-height: 1.5; }
        .retry-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">📡</div>
        <h1>You're Offline</h1>
        <p>Metro Rail Scheduler is currently offline. Please check your internet connection and try again.</p>
        <p>Cached data may be available when you return to the app.</p>
        <button class="retry-btn" onclick="window.location.reload()">
          Try Again
        </button>
      </div>
    </body>
    </html>
  `;
  
  return new Response(offlineHtml, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
}

// Message handling for cache management
self.addEventListener('message', (event) => {
  const { action, data } = event.data;
  
  switch (action) {
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'GET_CACHE_INFO':
      getCacheInfo().then((info) => {
        event.ports[0].postMessage({ cacheInfo: info });
      });
      break;
      
    case 'CACHE_SCHEDULES':
      cacheScheduleData(data).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
  }
});

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('[SW] All caches cleared');
}

// Get cache information
async function getCacheInfo() {
  const cacheNames = await caches.keys();
  const info = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    info[cacheName] = keys.length;
  }
  
  return info;
}

// Cache schedule data for offline use
async function cacheScheduleData(scheduleData) {
  const cache = await caches.open(DATA_CACHE_NAME);
  
  const cachedData = {
    data: scheduleData,
    timestamp: Date.now(),
    type: 'schedules'
  };
  
  const response = new Response(JSON.stringify(cachedData), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  await cache.put('/schedules/cached', response);
  console.log('[SW] Schedule data cached for offline use');
}

console.log('[SW] Service Worker loaded');