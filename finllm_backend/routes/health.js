const express = require('express');
const os   = require('os');
const fs   = require('fs-extra');
const path = require('path');
const { store } = require('../utils/store');

const router = express.Router();

// ── GET /api/health ───────────────────────────────────────────────────────────

router.get('/health', (_req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status:    'ok',
    timestamp: new Date().toISOString(),
    uptime:    Math.round(process.uptime()),
    memory: {
      heapUsedMB:  +(mem.heapUsed  / 1024 / 1024).toFixed(1),
      heapTotalMB: +(mem.heapTotal / 1024 / 1024).toFixed(1),
    },
    config: {
      groqConfigured: !!process.env.GROQ_API_KEY,
      model:          process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      env:            process.env.NODE_ENV || 'development',
      reportsInMemory: store.size,
    },
    system: {
      node:     process.version,
      platform: os.platform(),
      cpus:     os.cpus().length,
    },
  });
});

// ── GET /api/stats ────────────────────────────────────────────────────────────

router.get('/stats', async (_req, res) => {
  try {
    const dirs = {
      uploads: path.join(__dirname, '../uploads'),
      outputs: path.join(__dirname, '../outputs'),
    };

    async function dirStats(dirPath) {
      const files = await fs.readdir(dirPath);
      let size = 0;
      for (const f of files) {
        const s = await fs.stat(path.join(dirPath, f));
        size += s.size;
      }
      return { count: files.length, sizeMB: +(size / 1024 / 1024).toFixed(2) };
    }

    const byStatus = { completed: 0, error: 0, processing: 0 };
    for (const [, d] of store) {
      const bucket = ['completed', 'error'].includes(d.status) ? d.status : 'processing';
      byStatus[bucket]++;
    }

    res.json({
      reports: { total: store.size, byStatus },
      storage: {
        uploads: await dirStats(dirs.uploads),
        outputs: await dirStats(dirs.outputs),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    res.status(500).json({ error: 'Erreur stats', detail: err.message });
  }
});

module.exports = router;
