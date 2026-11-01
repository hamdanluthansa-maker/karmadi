import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function jsonStoragePlugin() {
  const dataDir = path.resolve(__dirname, 'data');
  const dataFile = path.resolve(dataDir, 'jobs.json');
  const publicDir = path.resolve(__dirname, 'public');
  const publicJobsFile = path.resolve(publicDir, 'jobs.json');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const writeJobsToDisk = (payload) => {
    const content = JSON.stringify(payload, null, 2);
    fs.writeFileSync(dataFile, content, 'utf-8');
    if (fs.existsSync(publicDir)) {
      fs.writeFileSync(publicJobsFile, content, 'utf-8');
    }
  };

  return {
    name: 'json-storage-plugin',
    configureServer(server) {
      const apiMiddleware = (req, res, next) => {
        const origin = req.headers.origin || '*';
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.setHeader('Access-Control-Allow-Private-Network', 'true');

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
              writeJobsToDisk(parsed);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, count: parsed.jobs?.length || 0 }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        if (req.url === '/api/publish-vercel' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = body ? JSON.parse(body) : null;
              if (parsed && Array.isArray(parsed.jobs)) {
                writeJobsToDisk({
                  jobs: parsed.jobs,
                  updatedAt: parsed.updatedAt || Date.now(),
                });
              }

              const gitCmd =
                'git add data/jobs.json public/jobs.json && ' +
                '(git diff --cached --quiet || git commit -m "chore: update katalog loker karmadi") && ' +
                'git push origin main';

              exec(gitCmd, { cwd: __dirname }, (err, stdout, stderr) => {
                res.setHeader('Content-Type', 'application/json');
                if (err) {
                  res.statusCode = 500;
                  res.end(
                    JSON.stringify({
                      success: false,
                      error: `Gagal push otomatis ke GitHub: ${stderr || err.message}`,
                    })
                  );
                  return;
                }
                res.end(
                  JSON.stringify({
                    success: true,
                    message: `Katalog (${parsed?.jobs?.length || 0} loker) berhasil disimpan ke jobs.json dan dikirim ke GitHub/Vercel! Website karmadi.vercel.app akan terupdate dalam ~30 detik.`,
                  })
                );
              });
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        next();
      };

      if (Array.isArray(server.middlewares.stack)) {
        server.middlewares.stack.unshift({ route: '', handle: apiMiddleware });
      } else {
        server.middlewares.use(apiMiddleware);
      }
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
      ignored: ['**/data/**', '**/.data/**', '**/jobs.json', '**/public/jobs.json'],
    },
  },
});
