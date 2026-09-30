import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || process.env.FN_APP_PORT || '3000', 10);
const HOST = '0.0.0.0';

app.use(express.json());

// Health check endpoint for fnOS / Feiniu NAS Application Center
app.get(['/health', '/api/health'], (_req, res) => {
  res.json({
    status: 'ok',
    app: 'com.hexagrid.sudoku',
    name: 'HexaGrid 16x16 Sudoku',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Serve compiled static files
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath, {
  maxAge: '1d',
  index: 'index.html',
}));

// Fallback to index.html for SPA routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`[fnOS] HexaGrid 16x16 Sudoku server running at http://${HOST}:${PORT}`);
});
