// Minimal stand-in for Supabase's API gateway (Kong): one origin that routes
//   /rest/v1      -> PostgREST
//   /auth/v1      -> GoTrue (Supabase Auth)
//   /storage/v1   -> Storage API
//   /functions/v1 -> Deno edge function(s)
// and answers CORS preflight requests. Local development and CI only.
import http from 'node:http';

const PORT = Number(process.env.GATEWAY_PORT ?? 54321);
const routes = [
  { prefix: '/rest/v1', target: process.env.REST_URL ?? 'http://127.0.0.1:3000' },
  { prefix: '/auth/v1', target: process.env.AUTH_URL ?? 'http://127.0.0.1:9999' },
  { prefix: '/storage/v1', target: process.env.STORAGE_URL ?? 'http://127.0.0.1:5000' },
  { prefix: '/functions/v1/document-access', target: process.env.FN_DOCUMENT_ACCESS_URL ?? 'http://127.0.0.1:8000', strip: true },
];

const cors = (origin) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, prefer, range, accept-profile, content-profile, x-upsert, cache-control, x-supabase-api-version',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD',
  'Access-Control-Expose-Headers': 'content-range, x-total-count, content-location, content-profile',
  'Access-Control-Max-Age': '600',
  Vary: 'Origin',
});

const server = http.createServer((req, res) => {
  const origin = req.headers.origin;
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors(origin));
    res.end();
    return;
  }
  const route = routes.find((r) => req.url.startsWith(r.prefix));
  if (!route) {
    res.writeHead(404, { 'Content-Type': 'application/json', ...cors(origin) });
    res.end(JSON.stringify({ error: 'No route' }));
    return;
  }
  const rest = req.url.slice(route.prefix.length) || '/';
  const target = new URL(route.target);
  const headers = { ...req.headers, host: target.host };
  // Kong turns a bare apikey into a bearer token; mimic that.
  if (!headers.authorization && headers.apikey) headers.authorization = `Bearer ${headers.apikey}`;
  if (route.prefix === '/storage/v1') headers['x-forwarded-prefix'] = '/storage/v1';
  const upstream = http.request(
    { hostname: target.hostname, port: target.port, path: rest.startsWith('/') ? rest : `/${rest}`, method: req.method, headers },
    (up) => {
      const out = { ...up.headers };
      for (const key of Object.keys(out)) if (key.toLowerCase().startsWith('access-control-')) delete out[key];
      res.writeHead(up.statusCode ?? 502, { ...out, ...cors(origin) });
      up.pipe(res);
    },
  );
  upstream.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json', ...cors(origin) });
    res.end(JSON.stringify({ error: `Upstream unavailable: ${err.message}` }));
  });
  req.pipe(upstream);
});

server.listen(PORT, '0.0.0.0', () => console.log(`gateway listening on :${PORT}`));
