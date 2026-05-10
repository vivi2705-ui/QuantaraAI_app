const express = require('express');
const { getReport, listReports } = require('../utils/store');
const { validateReportId }       = require('../middleware/validate');

const router = express.Router();

// ── GET /api/results — list all ───────────────────────────────────────────────

router.get('/results', (_req, res) => {
  res.json({ success: true, reports: listReports() });
});

// ── GET /api/results/:reportId ────────────────────────────────────────────────

router.get('/results/:reportId', validateReportId, (req, res) => {
  const report = getReport(req.params.reportId);

  if (!report) {
    return res.status(404).json({
      error:   'Rapport introuvable',
      message: 'Ce rapport n\'existe pas ou a expiré.',
    });
  }

  // Still processing — frontend polls every 3s
  if (report.status !== 'completed' && report.status !== 'error') {
    return res.json({
      id:       report.reportId,
      reportId: report.reportId,
      status:   report.status,
      error:    null,
    });
  }

  // Analysis failed (e.g. non-financial doc)
  if (report.status === 'error') {
    return res.status(422).json({
      id:       report.reportId,
      reportId: report.reportId,
      status:   'error',
      error:    report.error || 'Analyse échouée',
    });
  }

  // Completed — shape for frontend
  res.json({
    id:       report.reportId,
    reportId: report.reportId,
    status:   'completed',
    report: {
      company_name:    null,
      fiscal_year:     null,
      alignment_score: report.comparaison?.score_alignement ?? null,
      credit_score:    report.scoreCredit?.score            ?? null,
      confidence:      88,
      main_inconsistency: report.comparaison?.explication ?? null,
      explication:        report.comparaison?.explication ?? null,
      key_quote:          report.comparaison?.key_quote   ?? null,
      verdict:            report.comparaison?.verdict     ?? null,
      narrative:          report.rapportNarratif          ?? null,
      sentiment_summary:  buildSentimentSummary(report),
      kpis:               buildKPIList(report.kpis),      // empty [] if no data
      red_flags:          buildRedFlags(report.comparaison, report.scoreCredit),
    },
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildSentimentSummary(report) {
  if (report.comparaison?.sentiment_summary) return report.comparaison.sentiment_summary;
  if (report.sentiment?.discourse_optimism != null) {
    return {
      discourse_optimism: report.sentiment.discourse_optimism,
      real_performance:   report.scoreCredit?.score ?? 50,
      gap: Math.abs((report.sentiment.discourse_optimism ?? 50) - (report.scoreCredit?.score ?? 50)),
    };
  }
  return null;
}

function buildKPIList(kpis) {
  if (!kpis) return [];

  const map = [
    { name: 'Chiffre d\'affaires', key: 'chiffre_affaires', unit: '',  good: 'up'   },
    { name: 'Résultat net',        key: 'resultat_net',      unit: '',  good: 'up'   },
    { name: 'Marge nette',         key: 'marge_nette',       unit: '%', good: 'up'   },
    { name: 'Liquidité courante',  key: 'ratio_courant',     unit: '',  good: 'up'   },
    { name: 'Taux d\'endettement', key: 'ratio_endettement', unit: '%', good: 'down' },
    { name: 'Croissance CA',       key: 'croissance_ca',     unit: '%', good: 'up'   },
  ];

  // Only return KPIs where we actually have a value — never show N/A
  return map
    .filter(m => kpis[m.key] !== null && kpis[m.key] !== undefined)
    .map(m => {
      const val   = kpis[m.key];
      const num   = parseFloat(val);
      const trend = isNaN(num) ? 'neutral' : num > 0 ? 'up' : num < 0 ? 'down' : 'neutral';
      return {
        name:           m.name,
        value:          `${val}${m.unit}`,
        trend,
        good_direction: m.good,
      };
    });
}

function buildRedFlags(comparaison, scoreCredit) {
  const flags = [];
  (comparaison?.contradictions || []).forEach(c =>
    flags.push({ title: 'Incohérence détectée', description: c, severity: 'high' })
  );
  (scoreCredit?.drapeaux || []).forEach(d => {
    const severity = d.startsWith('🔴') ? 'high' : 'medium';
    flags.push({ title: 'Alerte scoring', description: d.replace('🔴 ', ''), severity });
  });
  return flags;
}

module.exports = router;
