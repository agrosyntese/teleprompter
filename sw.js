// Guarda o app no aparelho para funcionar sem internet.
// Página e roteiros: tenta a internet primeiro (para pegar o que é novo) e cai no guardado se não houver sinal.
// Motor e modelo de voz: usa o guardado (não mudam; versão nova = nome de arquivo novo).
const CACHE = 'tp-app-v2';
const BASE = ['./', 'index.html', 'vosk-0.0.8.js', 'manifest.webmanifest', 'icone-192.png', 'icone-512.png', 'roteiros.dat'];
const SEMPRE_NOVO = /(\/|index\.html|roteiros\.dat|manifest\.webmanifest)$/;
const ESPERA_REDE = 4000; // sinal fraco na roça: depois de 4 s usa o guardado

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function comPrazo(p, ms) {
  return new Promise((ok, falha) => {
    const t = setTimeout(() => falha(new Error('demorou')), ms);
    p.then((r) => { clearTimeout(t); ok(r); }, (e) => { clearTimeout(t); falha(e); });
  });
}

async function redePrimeiro(req) {
  const c = await caches.open(CACHE);
  try {
    const r = await comPrazo(fetch(req, { cache: 'no-store' }), ESPERA_REDE);
    if (r.ok) c.put(req.mode === 'navigate' ? 'index.html' : req, r.clone());
    return r;
  } catch (_) {
    const guardado = await c.match(req.mode === 'navigate' ? 'index.html' : req, { ignoreSearch: true });
    if (guardado) return guardado;
    throw _;
  }
}

async function guardadoPrimeiro(req) {
  const c = await caches.open(CACHE);
  const guardado = await c.match(req, { ignoreSearch: true });
  if (guardado) return guardado;
  const r = await fetch(req);
  if (r.ok) c.put(req, r.clone());
  return r;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/modelo/')) return; // o motor de voz guarda o modelo sozinho; aqui seria cópia dobrada
  if (req.mode === 'navigate' || SEMPRE_NOVO.test(url.pathname)) e.respondWith(redePrimeiro(req));
  else e.respondWith(guardadoPrimeiro(req));
});
