const express = require('express');
const multer  = require('multer');
const path    = require('path');

const { generateReportId, initReport, setStatus } = require('../utils/store');
const { requireGroqKey, rateLimiter }              = require('../middleware/validate');

const router = express.Router();

// ── Multer config ─────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename:    (req,  _file, cb) => {
    req.reportId = generateReportId();
    cb(null, `${req.reportId}.pdf`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    file.mimetype === 'application/pdf'
      ? cb(null, true)
      : cb(new Error('PDF_ONLY'));
  },
});

// ── POST /api/upload ──────────────────────────────────────────────────────────

router.post(
  '/upload',
  rateLimiter(5, 60_000),   // max 5 uploads per minute per IP
  requireGroqKey,
  upload.single('file'),    // ← field name matches the frontend FormData key
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier reçu' });
      }

      const reportId = req.reportId;
      const pdfPath  = req.file.path;

      console.log(`📤  Reçu : ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`);
      console.log(`📝  reportId : ${reportId}`);

      initReport(reportId);

      // Respond immediately — analysis runs in background
      res.json({
        success:  true,
        id:       reportId,    // ← frontend expects "id"
        reportId,
        filename: req.file.originalname,
        message:  'Upload réussi. Pollez GET /api/results/:reportId pour suivre la progression.',
      });

      // Fire-and-forget
      const { analyserRapport } = require('../services/analyseService');
      analyserRapport(reportId, pdfPath).catch(err => {
        console.error(`❌  Analyse échouée [${reportId}]:`, err.message);
        setStatus(reportId, 'error', err.message);
      });

    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
