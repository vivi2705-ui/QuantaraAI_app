// lib/db.js
// Lightweight JSON file database.
// Stores reports and uploaded documents persistently across restarts.
// Drop-in replacement for a real DB — just swap the read/write functions.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), '.quantara-data')
const DB_PATH  = join(DATA_DIR, 'db.json')

function ensureDB() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, JSON.stringify({ reports: [], uploads: [] }, null, 2))
  }
}

function readDB() {
  ensureDB()
  try {
    return JSON.parse(readFileSync(DB_PATH, 'utf-8'))
  } catch {
    return { reports: [], uploads: [] }
  }
}

function writeDB(data) {
  ensureDB()
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

// ── Reports ───────────────────────────────────────────────────────────────────

export function saveReport(report) {
  const db = readDB()
  const existing = db.reports.findIndex(r => r.id === report.id)
  if (existing >= 0) {
    db.reports[existing] = report
  } else {
    db.reports.unshift(report) // newest first
  }
  writeDB(db)
  return report
}

export function getReport(id) {
  const db = readDB()
  return db.reports.find(r => r.id === id) ?? null
}

export function listReports({ limit = 20, search = '' } = {}) {
  const db = readDB()
  let results = db.reports
  if (search) {
    const q = search.toLowerCase()
    results = results.filter(r =>
      r.company_name?.toLowerCase().includes(q) ||
      r.fiscal_year?.toLowerCase().includes(q)
    )
  }
  return results.slice(0, limit)
}

// ── Library (uploaded docs not yet analysed) ──────────────────────────────────

export function saveUpload(doc) {
  const db = readDB()
  db.uploads.unshift(doc)
  writeDB(db)
  return doc
}

export function listUploads({ limit = 50 } = {}) {
  const db = readDB()
  return db.uploads.slice(0, limit)
}

export function getUpload(id) {
  const db = readDB()
  return db.uploads.find(u => u.id === id) ?? null
}
