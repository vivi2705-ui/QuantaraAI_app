require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs-extra');

const uploadRoutes   = require('./routes/upload');
const resultsRoutes  = require('./routes/results');
const downloadRoutes = require('./routes/download');
const healthRoutes   = require('./routes/health');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Startup validation ────────────────────────────────────────────────────────

if (!process.env.GROQ_API_KEY) {
  console.error('❌  GROQ_API_KEY manquante dans .env — les analyses échoueront');
} else {
  console.log(`🔑  Groq API key: ${process.env.GROQ_API_KEY.slice(0, 8)}...`);
}

// ── Directories ───────────────────────────────────────────────────────────────

fs.ensureDir(path.join(__dirname, 'uploads'));
fs.ensureDir(path.join(__dirname, 'outputs'));

// ── Middlewares ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: ['*', 
    "https://project_llm.vercel.app"
   ],          // allow any origin — restrict in production via env
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,   // must be false when origin is '*'
}));

app.options('*', cors()); // preflight for all routes

app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api', healthRoutes);
app.use('/api', uploadRoutes);
app.use('/api', resultsRoutes);
app.use('/api', downloadRoutes);

app.get('/', (_req, res) => res.json({
  name: 'Quantara API',
  version: '1.0.0',
  status: process.env.GROQ_API_KEY ? 'ready' : 'missing_api_key',
  endpoints: {
    health:   'GET  /api/health',
    upload:   'POST /api/upload',
    results:  'GET  /api/results/:reportId',
    download: 'GET  /api/download/:reportId',
    stats:    'GET  /api/stats',
  },
}));

// ── 404 ───────────────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route introuvable : ${req.method} ${req.path}` });
});

// ── Global error handler ──────────────────────────────────────────────────────

app.use((err, _req, res, _next) => {
  console.error('❌  Erreur non gérée:', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Fichier trop volumineux (max 20 MB)' });
  }
  if (err.message === 'PDF_ONLY') {
    return res.status(415).json({ error: 'Seuls les fichiers PDF sont acceptés' });
  }
  res.status(500).json({
    error: 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { detail: err.message }),
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀  Quantara backend démarré sur http://localhost:${PORT}`);
  console.log(`📦  Environnement : ${process.env.NODE_ENV || 'development'}\n`);
});
