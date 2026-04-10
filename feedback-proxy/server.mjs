import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const UPSTREAM =
  process.env.UPSTREAM_FEEDBACK_URL ||
  'https://ap-experiment-zone.onrender.com/api/external/feedback';
const API_KEY = process.env.FEEDBACK_API_KEY;
const PORT = Number(process.env.PORT || 8787);

const allowedRaw = (process.env.ALLOWED_ORIGINS || '').trim();
const allowedList = allowedRaw
  ? allowedRaw.split(',').map((s) => s.trim()).filter(Boolean)
  : null;

const corsOptions = {
  origin(origin, callback) {
    if (!allowedList || allowedList.length === 0) {
      callback(null, true);
      return;
    }
    if (!origin || allowedList.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  maxAge: 86400,
};

const app = express();
app.use(cors(corsOptions));
app.options('/feedback', cors(corsOptions));
app.use(express.json({ limit: '64kb' }));

app.post('/feedback', async (req, res) => {
  if (!API_KEY) {
    res.status(500).json({ error: 'FEEDBACK_API_KEY is not set' });
    return;
  }
  const body = req.body;
  if (!body || typeof body !== 'object') {
    res.status(400).json({ error: 'Expected JSON body' });
    return;
  }
  try {
    const upstreamRes = await fetch(UPSTREAM, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(body),
    });
    const text = await upstreamRes.text();
    const ct = upstreamRes.headers.get('content-type') || 'application/json; charset=utf-8';
    res.status(upstreamRes.status).type(ct).send(text);
  } catch (e) {
    console.error('[feedback-proxy]', e);
    res.status(502).json({ error: 'Upstream request failed', detail: String(e.message || e) });
  }
});

// Статика родительской папки (index.html) с тем же origin, что и POST /feedback.
// HTML без долгого кэша — иначе в «старом» браузере остаётся устаревшая разметка (кнопки и т.д.).
app.use(
  express.static(rootDir, {
    index: ['index.html'],
    setHeaders(res, filePath) {
      if (path.extname(filePath).toLowerCase() === '.html') {
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      }
    },
  })
);

app.listen(PORT, () => {
  console.log(`Feedback proxy: http://127.0.0.1:${PORT}/`);
  console.log(`POST feedback → ${UPSTREAM}`);
  if (!API_KEY) console.warn('WARNING: FEEDBACK_API_KEY is empty');
});
