import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const portIndex = process.argv.indexOf('--port');
const port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : process.env.PORT || 4174);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Please provide a port from 1 to 65535.');
const types = {'.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.pdf':'application/pdf', '.ico':'image/x-icon'};

const server = http.createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, {Allow: 'GET, HEAD'}).end('Method not allowed');
      return;
    }
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const path = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!path.startsWith(root + sep) || !(pathname === '/' || pathname === '/index.html' || pathname.startsWith('/assets/'))) {
      response.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}).end('Not found');
      return;
    }
    const info = await stat(path);
    if (!info.isFile()) throw new Error('Not a file');
    const data = request.method === 'HEAD' ? null : await readFile(path);
    response.writeHead(200, {'Content-Type':types[extname(path)] || 'application/octet-stream', 'Content-Length':info.size, 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'});
    response.end(data);
  } catch (error) {
    const status = error instanceof URIError ? 400 : 404;
    response.writeHead(status, {'Content-Type':'text/plain; charset=utf-8'}).end(status === 400 ? 'Bad request' : 'Not found');
  }
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} is in use. Run: npm run dev -- --port ${port + 1}` : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  console.log(`\n  Xinchang Wang · Academic Homepage\n  Local: http://localhost:${port}/\n  No installation or build required. Refresh the browser after editing.\n`);
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
