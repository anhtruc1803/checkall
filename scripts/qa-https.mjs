import https from 'node:https';
import http from 'node:http';
import { readFileSync } from 'node:fs';
const server = https.createServer(
  {
    key: readFileSync('artifacts/qa-tls/key.pem'),
    cert: readFileSync('artifacts/qa-tls/cert.pem'),
  },
  (request, response) => {
    const upstream = http.request(
      {
        hostname: '127.0.0.1',
        port: 3000,
        path: request.url,
        method: request.method,
        headers: { ...request.headers, 'x-forwarded-proto': 'https' },
      },
      (result) => {
        response.writeHead(result.statusCode ?? 502, result.headers);
        result.pipe(response);
      },
    );
    upstream.on('error', () => {
      response.writeHead(502);
      response.end('Local QA upstream unavailable');
    });
    request.pipe(upstream);
  },
);
server.listen(3443, '127.0.0.1', () => console.log('Local HTTPS QA: https://127.0.0.1:3443'));
process.on('SIGINT', () => server.close());
process.on('SIGTERM', () => server.close());
