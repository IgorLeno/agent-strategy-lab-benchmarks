// Servidor estático mínimo, só loopback. Nenhuma rede externa.
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.pdf': 'application/pdf',
};

async function resolveFile(root, urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const candidate = path.join(root, path.normalize(decoded).replace(/^(\.\.[/\\])+/, ''));
  if (!candidate.startsWith(root)) return null;
  try {
    const info = await stat(candidate);
    if (info.isDirectory()) return resolveFile(root, path.posix.join(decoded, 'index.html'));
    return candidate;
  } catch {
    return null;
  }
}

export async function serveStatic(root) {
  const absoluteRoot = path.resolve(root);
  const server = createServer((request, response) => {
    if ((request.url ?? '').startsWith('/favicon.ico')) {
      response.writeHead(204);
      response.end();
      return;
    }
    resolveFile(absoluteRoot, request.url ?? '/')
      .then((file) => {
        if (!file) {
          response.writeHead(404, { 'content-type': 'text/plain' });
          response.end('not found');
          return;
        }
        response.writeHead(200, {
          'content-type': MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
          'cache-control': 'no-store',
        });
        createReadStream(file).pipe(response);
      })
      .catch(() => {
        response.writeHead(500, { 'content-type': 'text/plain' });
        response.end('error');
      });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return {
    origin: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
