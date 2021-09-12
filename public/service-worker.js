const FILES_TO_CACHE = [ "/", "/index.html","/index.js", "/styles.css"]; //cache files 
//, "/db.js"
const STATIC_CACHE = "static-cache-haha";
const RUNTIME_CACHE = "runtime-cache-haha";

self.addEventListener("install", event => {
    event.waitUntil(
            caches.open(STATIC_CACHE).then(cache => {
              console.log("Your files were pre-cached successfully!");
              return cache.addAll(FILES_TO_CACHE);
            })
          );
        
          self.skipWaiting();
  });

  
  self.addEventListener("activate", function(event) {
      event.waitUntil(
        caches.keys().then(keyList => {
          return Promise.all(
            keyList.map(key => {
              if (key !== STATIC_CACHE && key !== RUNTIME_CACHE) {
                console.log("Removing old cache data", key);
                return caches.delete(key);
              }
            })
          );
        })
      );
    
      self.clients.claim();
    });
    
    // fetch
    self.addEventListener("fetch", event => {
        if(event.request.url.includes('/api/')) {
            console.log('[Service Worker] Fetch(data)', event.request.url);
        
    event.respondWith(
                    caches.open(RUNTIME_CACHE).then(cache => {
                    return fetch(event.request)
                    .then(response => {
                        if (response.status === 200){
                            cache.put(event.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(err => {
                        return cache.match(event.request);
                    });
                })
                );
                return;
            }
    
    event.respondWith(
        caches.open(STATIC_CACHE).then( cache => {
          return cache.match(event.request).then(response => {
            return response || fetch(event.request);
          });
        })
      );
    });
  