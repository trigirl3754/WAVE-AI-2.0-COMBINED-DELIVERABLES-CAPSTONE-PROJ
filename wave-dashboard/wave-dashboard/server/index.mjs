/**
 * WAVE dashboard backend.
 *
 * Runs on Node's built-in http module — no npm install needed to start the API.
 * In development Vite proxies /api here. In production this process also serves
 * the built client from client/dist.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRouter } from './routes.mjs';
import { json, HttpError } from './lib/router.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'client', 'dist');
const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || '127.0.0.1';

const router = buildRouter();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
};

function serveStatic(req, res, pathname) {
  if (!fs.existsSync(DIST)) {
    res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(
      `<!doctype html><meta charset="utf-8"><title>WAVE — client not built</title>
       <body style="font:15px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;background:#06080F;color:#E2E8F0;padding:48px;max-width:60ch">
       <h1 style="color:#00E5C8;font-size:16px;letter-spacing:.18em;text-transform:uppercase">API is running · client not built</h1>
       <p>The API is live on port ${PORT}. The frontend bundle hasn't been built yet.</p>
       <p>For development, run <code style="color:#FACC15">npm run dev</code> and open the Vite URL instead.<br>
       For a production build, run <code style="color:#FACC15">npm run build</code> then <code style="color:#FACC15">npm start</code>.</p>
       <p><a href="/api/health" style="color:#A78BFA">Check /api/health</a></p></body>`
    );
    return;
  }

  const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const target = path.resolve(DIST, rel);

  // Block path traversal outside dist.
  if (!target.startsWith(DIST)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  const file = fs.existsSync(target) && fs.statSync(target).isFile()
    ? target
    : path.join(DIST, 'index.html'); // SPA fallback

  const ext = path.extname(file).toLowerCase();
  const body = fs.readFileSync(file);
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': body.length,
    'Cache-Control': file.includes(`${path.sep}assets${path.sep}`)
      ? 'public, max-age=31536000, immutable'
      : 'no-cache',
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // Permissive CORS so the Vite dev server (or any local port) can call the API.
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.writeHead(204).end();
    return;
  }

  if (!pathname.startsWith('/api/')) {
    try {
      serveStatic(req, res, pathname);
    } catch (err) {
      console.error('[static]', err);
      res.writeHead(500).end('Internal error');
    }
    return;
  }

  const matched = router.match(req.method, pathname);
  if (!matched) {
    json(res, 404, { error: 'Not found', message: `No route for ${req.method} ${pathname}` });
    return;
  }
  if (matched.methodMismatch) {
    json(res, 405, { error: 'Method not allowed', message: `${req.method} is not allowed here` });
    return;
  }

  const query = Object.fromEntries(url.searchParams.entries());

  try {
    await matched.handler(req, res, { params: matched.params, query });
  } catch (err) {
    if (err instanceof HttpError) {
      json(res, err.status, { error: err.message, fields: err.details || null });
    } else {
      console.error('[api]', err);
      json(res, 500, { error: 'Internal error', message: err.message });
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`  WAVE API      http://${HOST}:${PORT}/api/health`);
  if (fs.existsSync(DIST)) console.log(`  WAVE frontend http://${HOST}:${PORT}/`);
});
