const express = require('express');
const path    = require('path');
const fs      = require('fs-extra');
const { validateReportId } = require('../middleware/validate');
 
const router = express.Router();

router.get('/download/:reportId', validateReportId, async (req, res) => {
  try {
    const { reportId } = req.params;
    const pdfPath = path.join(__dirname, '../outputs', `${reportId}.pdf`);

    if (!await fs.pathExists(pdfPath)) {
      return res.status(404).json({
        error:   'PDF non disponible',
        message: 'L\'analyse n\'est peut-être pas encore terminée, ou le rapport a expiré (24h).',
      });
    }

    // Use res.download for proper Content-Disposition header
    res.download(pdfPath, `quantara-rapport-${reportId}.pdf`, err => {
      if (err && !res.headersSent) {
        console.error('❌  Erreur envoi PDF:', err.message);
        res.status(500).json({ error: 'Erreur lors du téléchargement' });
      }
    });

  } catch (err) {
    console.error('❌  /download:', err.message);
    res.status(500).json({ error: 'Erreur interne', detail: err.message });
  }
});

module.exports = router;
