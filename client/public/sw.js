// Service Worker para App Síndico - Modo Offline + Push Notifications
// Plataforma Digital para Condomínios

const CACHE_NAME = 'app-sindico-v2';
const OFFLINE_URL = '/offline.html';

// Recursos para cache estático
const STATIC_CACHE = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/logo.png',
];

// Padrões de URLs que devem ser cacheadas para uso offline
const CACHEABLE_PATTERNS = [
  /\/api\/trpc\/timeline\./,
  /\/api\/trpc\/ordemServico\./,
  /\/api\/trpc\/manutencao\./,
  /\/api\/trpc\/condominio\./,
];

// ==================== INSTALAÇÃO ====================
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker instalado');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cache aberto');
      return cache.addAll(STATIC_CACHE).catch(err => {
        console.log('[SW] Alguns recursos não puderam ser cacheados:', err);
      });
    })
  );
  self.skipWaiting();
});

// ==================== ATIVAÇÃO ====================
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker ativado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('app-sindico-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Removendo cache antigo:', name);
            return caches.delete(name);
          })
      );
    }).then(() => clients.claim())
  );
});

// ==================== FETCH (CACHE STRATEGIES) ====================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar requisições de extensões do Chrome e outros protocolos
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Para requisições de API (tRPC) - Network First com cache
  if (url.pathname.startsWith('/api/trpc/')) {
    // Verificar se é uma rota cacheável
    const isCacheable = CACHEABLE_PATTERNS.some(pattern => pattern.test(url.pathname));
    
    if (isCacheable) {
      event.respondWith(networkFirstWithCache(request));
    } else {
      event.respondWith(networkOnly(request));
    }
    return;
  }

  // Para assets estáticos - Cache First
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Para navegação (páginas HTML) - Network First com fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Padrão: Network First
  event.respondWith(networkFirstWithCache(request));
});

// Estratégia: Network Only (sem cache)
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'offline', 
        message: 'Você está offline.' 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Estratégia: Network First com cache
async function networkFirstWithCache(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cachear resposta bem-sucedida
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback para cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Adicionar header indicando que é do cache
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-From-Cache', 'true');
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers
      });
    }
    
    // Retornar resposta de erro offline para APIs
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({ 
          error: 'offline', 
          message: 'Você está offline. Os dados serão sincronizados quando a conexão retornar.',
          fromCache: false
        }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
  }
}

// Estratégia: Cache First
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Falha ao buscar recurso:', request.url);
    throw error;
  }
}

// Estratégia: Network First com fallback para página offline
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cachear página
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Tentar cache primeiro
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para página offline
    const offlineResponse = await caches.match(OFFLINE_URL);
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Retornar página offline inline
    return new Response(
      `<!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - App Síndico</title>
        <style>
          body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .container { text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); max-width: 400px; margin: 1rem; }
          .icon { font-size: 4rem; margin-bottom: 1rem; }
          h1 { color: #1f2937; margin-bottom: 0.5rem; font-size: 1.5rem; }
          p { color: #6b7280; margin-bottom: 1.5rem; line-height: 1.6; }
          .info { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; }
          .info p { margin: 0; font-size: 0.875rem; }
          button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-size: 1rem; font-weight: 500; transition: transform 0.2s, box-shadow 0.2s; }
          button:hover { transform: translateY(-2px); box-shadow: 0 10px 20px -10px rgba(102,126,234,0.5); }
          .features { text-align: left; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb; }
          .features h3 { font-size: 0.875rem; color: #374151; margin-bottom: 0.75rem; }
          .features ul { margin: 0; padding-left: 1.25rem; }
          .features li { color: #6b7280; font-size: 0.875rem; margin-bottom: 0.5rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">📡</div>
          <h1>Você está offline</h1>
          <p>Não foi possível conectar ao servidor. Verifique sua conexão com a internet.</p>
          <div class="info">
            <p>💡 Seus dados salvos localmente estão seguros e serão sincronizados automaticamente.</p>
          </div>
          <button onclick="window.location.reload()">Tentar novamente</button>
          <div class="features">
            <h3>Disponível offline:</h3>
            <ul>
              <li>Visualizar timelines salvas</li>
              <li>Ver ordens de serviço</li>
              <li>Consultar manutenções</li>
              <li>Criar rascunhos (sincroniza depois)</li>
            </ul>
          </div>
        </div>
      </body>
      </html>`,
      { 
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// ==================== BACKGROUND SYNC ====================
self.addEventListener('sync', (event) => {
  console.log('[SW] Evento de sync:', event.tag);
  
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
  
  if (event.tag === 'sync-timelines') {
    event.waitUntil(notifyClientsToSync('timelines'));
  }
  
  if (event.tag === 'sync-ordens-servico') {
    event.waitUntil(notifyClientsToSync('ordensServico'));
  }
  
  if (event.tag === 'sync-manutencoes') {
    event.waitUntil(notifyClientsToSync('manutencoes'));
  }
});

// Função de sincronização de dados offline
async function syncOfflineData() {
  console.log('[SW] Iniciando sincronização de dados offline...');
  
  const allClients = await self.clients.matchAll();
  allClients.forEach(client => {
    client.postMessage({
      type: 'SYNC_STARTED',
      message: 'Sincronizando dados offline...'
    });
  });
}

// Notificar clientes para sincronizar tipo específico
async function notifyClientsToSync(dataType) {
  const allClients = await self.clients.matchAll();
  allClients.forEach(client => {
    client.postMessage({
      type: 'SYNC_DATA_TYPE',
      dataType: dataType,
      message: `Sincronizando ${dataType}...`
    });
  });
}

// ==================== MENSAGENS DO CLIENTE ====================
self.addEventListener('message', (event) => {
  console.log('[SW] Mensagem recebida:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls;
    caches.open(CACHE_NAME).then(cache => {
      cache.addAll(urls).catch(err => {
        console.log('[SW] Erro ao cachear URLs:', err);
      });
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('[SW] Cache limpo');
    });
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    getCacheSize().then(size => {
      event.source.postMessage({
        type: 'CACHE_SIZE',
        size: size
      });
    });
  }
});

// Calcular tamanho do cache
async function getCacheSize() {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  let totalSize = 0;
  
  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const blob = await response.blob();
      totalSize += blob.size;
    }
  }
  
  return totalSize;
}

// ==================== PUSH NOTIFICATIONS ====================
self.addEventListener('push', (event) => {
  console.log('[SW] Push recebido:', event);
  
  let data = {
    title: 'App Síndico',
    body: 'Você tem uma nova notificação',
    icon: '/logo.png',
    badge: '/badge.png',
    tag: 'default',
    data: {}
  };
  
  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        tag: payload.tag || data.tag,
        data: payload.data || {}
      };
    } catch (e) {
      console.error('[SW] Erro ao parsear dados do push:', e);
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data,
    vibrate: [100, 50, 100],
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Fechar' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Evento de clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Clique na notificação:', event);
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data || {};
  
  if (action === 'close') {
    return;
  }
  
  const urlToOpen = data.url || '/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Evento de fechamento da notificação
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notificação fechada:', event);
});
