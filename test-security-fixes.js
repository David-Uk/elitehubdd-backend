// Test script to verify security fixes
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Test static file serving with MIME types
app.use(express.static(path.join(__dirname, 'frontend'), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath);
    if (ext === '.css') {
      res.setHeader('Content-Type', 'text/css');
    } else if (ext === '.js') {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Test CSP headers
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' blob: https://www.google-analytics.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob:; " +
    "connect-src 'self' https://www.google-analytics.com https://overbridgenet.com; " +
    "font-src 'self'; " +
    "object-src 'none'; " +
    "frame-ancestors 'none';"
  );
  next();
});

app.get('/test', (req, res) => {
  res.json({ 
    message: 'Security fixes test',
    csp: res.getHeader('Content-Security-Policy'),
    timestamp: new Date().toISOString()
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
  console.log(`Static files: http://localhost:${PORT}/assets/index-CuN64XXa.css`);
});
