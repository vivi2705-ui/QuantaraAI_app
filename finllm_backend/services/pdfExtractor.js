const pdf  = require('pdf-parse');
const fs   = require('fs-extra');

// ── Full text extraction ──────────────────────────────────────────────────────

async function extractText(pdfPath) {
  if (!await fs.pathExists(pdfPath)) {
    throw new Error(`Fichier PDF introuvable : ${pdfPath}`);
  }

  const stats = await fs.stat(pdfPath);
  const mb    = stats.size / 1024 / 1024;
  if (mb > 20) throw new Error(`Fichier trop volumineux : ${mb.toFixed(1)} MB (max 20 MB)`);

  console.log(`📄  Lecture PDF (${mb.toFixed(2)} MB)...`);

  const buffer = await fs.readFile(pdfPath);
  const data   = await pdf(buffer);

  if (!data.text?.trim()) {
    throw new Error('PDF illisible : le document est scanné (image) ou protégé par mot de passe.');
  }

  console.log(`📄  PDF extrait — ${data.numpages} pages, ${data.text.length} caractères`);

  return {
    fullText: data.text,
    numPages: data.numpages,
    metadata: data.info,
  };
}

// ── Narrative section extraction ──────────────────────────────────────────────
// Targets management discourse sections: CEO letter, outlook, strategic review.
// Truncated to 10 000 chars to stay within Groq token limits.

function extractNarrativeSections(fullText) {
  const PATTERNS = [
    // CEO / Chairman letter
    /(?:mot|message|lettre|editorial)\s+(?:du|de\s+la)\s+(?:pr[ée]sident|directeur\s+g[ée]n[ée]ral|pdg|ceo|dg)\b[\s\S]{200,3000}?(?=\n{2,}[A-ZÉÀÈÊ]{3}|\n{2,}\d+\.|\n{2,}(?:chapitre|section|partie)\b|$)/gi,
    // Outlook / strategy
    /(?:perspectives?|orientations?\s+strat[ée]giques?|strat[ée]gie\s+(?:\d{4}[-–]\d{4}|groupe))\b[\s\S]{200,2500}?(?=\n{2,}[A-ZÉÀÈÊ]{3}|\n{2,}\d+\.|$)/gi,
    // Highlights of the year
    /faits?\s+marquants?\b[\s\S]{200,2000}?(?=\n{2,}[A-ZÉÀÈÊ]{3}|\n{2,}\d+\.|$)/gi,
    // Performance review
    /(?:analyse|revue|bilan)\s+(?:de\s+(?:la\s+)?)?(?:performance|l[''']exercice|l[''']activit[ée])\b[\s\S]{200,2000}?(?=\n{2,}[A-ZÉÀÈÊ]{3}|\n{2,}\d+\.|$)/gi,
    // Governance / risk
    /(?:gouvernance|risques?\s+principaux?)\b[\s\S]{200,1500}?(?=\n{2,}[A-ZÉÀÈÊ]{3}|\n{2,}\d+\.|$)/gi,
  ];

  const found = [];
  for (const re of PATTERNS) {
    const matches = fullText.match(re) || [];
    found.push(...matches);
    if (found.join('').length >= 6000) break; // stop early if we have enough
  }

  if (found.length === 0) {
    console.warn('⚠️  Aucune section narrative détectée — fallback sur le début du document');
    const afterTOC = fullText.split(/table\s+des\s+mati[èe]res/i)[1] || fullText;
    found.push(afterTOC.slice(0, 6000));
  }

  const narrative = found.join('\n\n');
  const truncated = narrative.length > 10_000
    ? narrative.slice(0, 10_000) + '\n[... tronqué]'
    : narrative;

  console.log(`📝  Texte narratif : ${truncated.length} caractères`);
  return truncated;
}

// ── Financial data extraction ─────────────────────────────────────────────────

function extractFinancialData(fullText) {
  const clean = str => {
    if (!str) return null;
    const n = parseFloat(str.replace(/\s/g, '').replace(',', '.'));
    return isNaN(n) ? null : n;
  };

  const fields = {
    chiffre_affaires: [
      /chiffre\s+d'affaires\s*[:\s]+([0-9][0-9\s,.]*)/i,
      /revenus?\s+(?:totaux?)?\s*[:\s]+([0-9][0-9\s,.]*)/i,
      /\bCA\b\s*[:\s]+([0-9][0-9\s,.]*)/i,
    ],
    ca_n1: [
      /chiffre\s+d'affaires.*?[Nn][–-]1\s*[:\s]+([0-9][0-9\s,.]*)/i,
      /revenus?.*?exercice\s+pr[ée]c[ée]dent\s*[:\s]+([0-9][0-9\s,.]*)/i,
    ],
    resultat_net: [
      /r[ée]sultat\s+net\s*[:\s]+([0-9][0-9\s,.]*)/i,
      /b[ée]n[ée]fice\s+net\s*[:\s]+([0-9][0-9\s,.]*)/i,
      /profit\s+net\s*[:\s]+([0-9][0-9\s,.]*)/i,
    ],
    resultat_net_n1: [
      /r[ée]sultat\s+net.*?[Nn][–-]1\s*[:\s]+([0-9][0-9\s,.]*)/i,
    ],
    actif_courant: [
      /actif\s+courant\s*[:\s]+([0-9][0-9\s,.]*)/i,
      /actifs?\s+circulants?\s*[:\s]+([0-9][0-9\s,.]*)/i,
    ],
    passif_courant: [
      /passif\s+courant\s*[:\s]+([0-9][0-9\s,.]*)/i,
      /dettes?\s+(?:à\s+)?court\s+terme\s*[:\s]+([0-9][0-9\s,.]*)/i,
    ],
    dettes_totales: [
      /dettes?\s+totales?\s*[:\s]+([0-9][0-9\s,.]*)/i,
      /endettement\s+(?:total|net)\s*[:\s]+([0-9][0-9\s,.]*)/i,
    ],
    total_actif: [
      /total\s+(?:de\s+l[''])?actif\s*[:\s]+([0-9][0-9\s,.]*)/i,
      /bilan\s+total\s*[:\s]+([0-9][0-9\s,.]*)/i,
    ],
    capitaux_propres: [
      /capitaux\s+propres\s*[:\s]+([0-9][0-9\s,.]*)/i,
      /fonds\s+propres\s*[:\s]+([0-9][0-9\s,.]*)/i,
    ],
    ebitda: [
      /EBITDA\s*[:\s]+([0-9][0-9\s,.]*)/i,
      /exc[ée]dent\s+brut\s+d['']exploitation\s*[:\s]+([0-9][0-9\s,.]*)/i,
      /\bEBE\b\s*[:\s]+([0-9][0-9\s,.]*)/i,
    ],
  };

  const result = Object.fromEntries(Object.keys(fields).map(k => [k, null]));

  for (const [field, patterns] of Object.entries(fields)) {
    for (const re of patterns) {
      const m = fullText.match(re);
      if (m?.[1]) {
        const val = clean(m[1]);
        if (val !== null) {
          result[field] = val;
          console.log(`💰  ${field}: ${val}`);
          break;
        }
      }
    }
  }

  const extracted = Object.values(result).filter(v => v !== null).length;
  console.log(`✅  ${extracted}/${Object.keys(fields).length} données financières extraites`);

  if (extracted === 0) {
    console.warn('⚠️  Aucune donnée financière trouvée — PDF non structuré ou scanné');
  }

  return result;
}

module.exports = { extractText, extractNarrativeSections, extractFinancialData };
