const CACHE_NAME = 'palavra-de-deus-v2';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './verses.json',
  './manifest.json'
];

// Instalação: Salva os arquivos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Arquivos em cache!');
      return cache.addAll(ASSETS);
    })
  );
});

// Fetch: Se estiver offline, busca do cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});