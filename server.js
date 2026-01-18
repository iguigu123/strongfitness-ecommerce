const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT) || 5173;
const root = path.resolve(__dirname);

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.webp': 'image/webp'
};

function safeJoin(base, target) {
  const resolved = path.resolve(base, target);
  if (!resolved.startsWith(base)) return null;
  return resolved;
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${port}`);
    let pathname = decodeURI(url.pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const fsPath = safeJoin(root, pathname.slice(1));
    if (!fsPath) {
      res.statusCode = 400;
      res.end('Bad Request');
      return;
    }
    fs.stat(fsPath, (err, stat) => {
      if (err) {
        res.statusCode = 404;
        res.end('Not Found');
        return;
      }
      let filePath = fsPath;
      if (stat.isDirectory()) filePath = path.join(fsPath, 'index.html');
      fs.readFile(filePath, (readErr, data) => {
        if (readErr) {
          res.statusCode = 404;
          res.end('Not Found');
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const type = mime[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', type);
        res.statusCode = 200;
        res.end(data);
      });
    });
  } catch {
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

server.listen(port, () => {
  console.log(`Preview disponível em http://localhost:${port}/`);
});
