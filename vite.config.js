import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function jsonStoragePlugin() {
  const dataDir = path.resolve(__dirname, 'data');
  const dataFile = path.resolve(dataDir, 'jobs.json');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  return {
    name: 'json-storage-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.url === '/api/jobs' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          if (fs.existsSync(dataFile)) {
            try {
              const content = fs.readFileSync(dataFile, 'utf-8');
              res.end(content || JSON.stringify({ jobs: null, updatedAt: 0 }));
              return;
            } catch (err) {
              res.end(JSON.stringify({ jobs: null, updatedAt: 0 }));
              return;
            }
          }
          res.end(JSON.stringify({ jobs: null, updatedAt: 0 }));
          return;
        }

        if (req.url === '/api/jobs' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              fs.writeFileSync(dataFile, JSON.stringify(parsed, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, count: parsed.jobs?.length || 0 }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), jsonStoragePlugin()],
  server: {
    host: true,
    port: 5173,
    watch: {
      ignored: ['**/data/**', '**/.data/**', '**/jobs.json'],
    },
  },
});
