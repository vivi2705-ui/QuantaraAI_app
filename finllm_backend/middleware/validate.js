// ── Report ID format guard ────────────────────────────────────────────────────

const REPORT_ID_RE = /^report_[a-zA-Z0-9_-]+$/;

function validateReportId(req, res, next) {
  const { reportId } = req.params;
  if (!reportId || !REPORT_ID_RE.test(reportId)) {
    return res.status(400).json({
      error: 'Format de reportId invalide',
      expected: 'report_<timestamp>_<uuid>',
    });
  }
  next();
}

// ── Groq API key guard ────────────────────────────────────────────────────────

function requireGroqKey(req, res, next) {
  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({
      error: 'Service IA indisponible',
      message: 'GROQ_API_KEY non configurée — vérifiez votre fichier .env',
    });
  }
  next();
}

// ── Simple in-memory rate limiter ─────────────────────────────────────────────

const requests = new Map();

function rateLimiter(max = 10, windowMs = 60_000) {
  return (req, res, next) => {
    const ip  = req.ip || req.socket.remoteAddress;
    const now = Date.now();

    const timestamps = (requests.get(ip) || []).filter(t => now - t < windowMs);

    if (timestamps.length >= max) {
      const retryAfter = Math.ceil((timestamps[0] + windowMs - now) / 1000);
      return res.status(429).json({
        error:       'Trop de requêtes',
        retryAfter,
        message:     `Maximum ${max} requêtes par ${windowMs / 1000}s`,
      });
    }

    timestamps.push(now);
    requests.set(ip, timestamps);
    next();
  };
}

// Periodic cleanup to avoid memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, ts] of requests) {
    if (ts.every(t => now - t > 60_000)) requests.delete(ip);
  }
}, 10 * 60_000);

module.exports = { validateReportId, requireGroqKey, rateLimiter };
