const { v4: uuidv4 } = require('uuid');
const fs   = require('fs-extra');
const path = require('path');

// ── ID generation ─────────────────────────────────────────────────────────────

function generateReportId() {
  return `report_${Date.now()}_${uuidv4().split('-')[0]}`;
}

// ── In-memory store ───────────────────────────────────────────────────────────
// Keys: reportId  |  Values: { reportId, status, createdAt, ...results }
// Note: data is lost on restart. Use Redis/DB for production.

const store = new Map();

// ── CRUD ──────────────────────────────────────────────────────────────────────

function initReport(reportId) {
  store.set(reportId, {
    reportId,
    status: 'uploaded',
    createdAt: new Date().toISOString(),
  });
}

function setStatus(reportId, status, errorMsg = null) {
  const entry = store.get(reportId);
  if (!entry) return;
  entry.status    = status;
  entry.updatedAt = new Date().toISOString();
  if (errorMsg) entry.error = errorMsg;
}

function saveResults(reportId, results) {
  const entry = store.get(reportId);
  if (!entry) return;
  Object.assign(entry, results, {
    status:      'completed',
    completedAt: new Date().toISOString(),
  });
}

function getReport(reportId) {
  return store.get(reportId) || null;
}

function listReports() {
  return Array.from(store.values()).map(r => ({
    reportId:        r.reportId,
    status:          r.status,
    createdAt:       r.createdAt,
    completedAt:     r.completedAt || null,
    credit_score:    r.scoreCredit?.score    ?? null,
    alignment_score: r.comparaison?.score_alignement ?? null,
    verdict:         r.comparaison?.verdict  ?? null,
  }));
}

// ── Auto-cleanup (24 h) ───────────────────────────────────────────────────────

const TTL_MS = 24 * 60 * 60 * 1000;

async function cleanup() {
  const now  = Date.now();
  const dirs = ['uploads', 'outputs'].map(d => path.join(__dirname, '..', d));

  for (const [id, data] of store) {
    if (now - new Date(data.createdAt).getTime() > TTL_MS) {
      for (const dir of dirs) {
        await fs.remove(path.join(dir, `${id}.pdf`)).catch(() => {});
        await fs.remove(path.join(dir, `${id}.json`)).catch(() => {});
      }
      store.delete(id);
      console.log(`🗑️  Rapport expiré supprimé : ${id}`);
    }
  }
}

setInterval(cleanup, 60 * 60 * 1000); // Runs every hour

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  generateReportId,
  initReport,
  setStatus,
  saveResults,
  getReport,
  listReports,
  store, // exposed for health stats
};
