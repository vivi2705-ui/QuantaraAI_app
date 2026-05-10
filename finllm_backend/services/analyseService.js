const { extractText, extractNarrativeSections, extractFinancialData } = require('./pdfExtractor');
const { calculateKPIs, scoringCredit }                                 = require('./kpiCalculator');
const { analyserSentiment, comparerSentimentKPIs, genererRapportNarratif } = require('./llmService');
const { genererPDF }                                                    = require('./pdfGenerator');
const { setStatus, saveResults }                                        = require('../utils/store');

// ── Financial document guard ──────────────────────────────────────────────────
// Checks if the extracted text contains enough financial signals to analyse.
// Returns { valid: bool, reason: string }

function isFinancialDocument(fullText, financialData) {
  const text = fullText.toLowerCase();

  // Must have at least some financial vocabulary
  const FINANCIAL_KEYWORDS = [
    'chiffre d\'affaires', 'résultat', 'bilan', 'actif', 'passif',
    'bénéfice', 'perte', 'marge', 'revenus', 'dettes', 'capitaux',
    'trésorerie', 'exercice', 'fiscal', 'financier', 'comptable',
    'dividende', 'ebitda', 'turnover', 'revenue', 'profit', 'loss',
    'balance sheet', 'cash flow', 'earnings', 'annual report',
  ];

  const DISCOURSE_KEYWORDS = [
    'nous', 'notre', 'nos', 'stratégie', 'croissance', 'performance',
    'objectif', 'ambition', 'perspective', 'résultat', 'développement',
    'we ', 'our ', 'strategy', 'growth', 'outlook', 'management',
  ];

  const financialHits  = FINANCIAL_KEYWORDS.filter(k => text.includes(k)).length;
  const discourseHits  = DISCOURSE_KEYWORDS.filter(k => text.includes(k)).length;
  const extractedKPIs  = Object.values(financialData).filter(v => v !== null).length;

  console.log(`🔍  Guard: ${financialHits} mots financiers, ${discourseHits} mots discours, ${extractedKPIs} KPIs extraits`);

  if (financialHits < 3 && extractedKPIs === 0) {
    return {
      valid: false,
      reason: `Ce document ne semble pas être un rapport financier (${financialHits} indicateurs financiers détectés, 0 KPI extrait). Veuillez uploader un rapport annuel ou un document comptable.`,
    };
  }

  if (text.length < 500) {
    return {
      valid: false,
      reason: 'Le document est trop court pour être analysé (moins de 500 caractères de texte extractible).',
    };
  }

  return { valid: true };
}

// ── Main pipeline ─────────────────────────────────────────────────────────────

async function analyserRapport(reportId, pdfPath) {
  try {
    console.log(`\n🔄  Début analyse : ${reportId}`);

    // 1 — PDF extraction
    setStatus(reportId, 'extracting');
    console.log('📄  [1/6] Extraction du PDF...');
    const { fullText } = await extractText(pdfPath);
    const financialData = extractFinancialData(fullText);

    // 2 — Financial document guard (before spending Groq tokens)
    const guard = isFinancialDocument(fullText, financialData);
    if (!guard.valid) {
      setStatus(reportId, 'error', guard.reason);
      console.warn(`🚫  Document rejeté [${reportId}]: ${guard.reason}`);
      return;
    }

    const texteNarratif = extractNarrativeSections(fullText);

    // 3 — KPI computation (no AI)
    setStatus(reportId, 'calculating');
    console.log('🧮  [2/6] Calcul des KPIs...');
    const kpis        = calculateKPIs(financialData);
    const scoreCredit = scoringCredit(kpis);

    // 4 — Sentiment analysis (Groq)
    setStatus(reportId, 'analyzing_sentiment');
    console.log('🤖  [3/6] Analyse du sentiment (Groq)...');
    const sentiment = await analyserSentiment(texteNarratif);

    // 5 — Discourse vs. reality comparison (Groq)
    setStatus(reportId, 'comparing');
    console.log('⚖️   [4/6] Comparaison discours/réalité (Groq)...');
    const comparaison = await comparerSentimentKPIs(sentiment, kpis, scoreCredit);

    // 6 — Narrative report (Groq)
    setStatus(reportId, 'generating_report');
    console.log('📝  [5/6] Génération du rapport narratif (Groq)...');
    const rapportNarratif = await genererRapportNarratif({ kpis, scoreCredit, sentiment, comparaison });

    // 7 — PDF generation
    setStatus(reportId, 'generating_pdf');
    console.log('📄  [6/6] Génération du PDF...');
    const pdfPathOut = await genererPDF(reportId, { kpis, scoreCredit, sentiment, comparaison, rapportNarratif });

    saveResults(reportId, { kpis, scoreCredit, sentiment, comparaison, rapportNarratif, pdfPath: pdfPathOut });
    console.log(`✅  Analyse complète : ${reportId}\n`);

  } catch (err) {
    console.error(`❌  Erreur pipeline [${reportId}]:`, err.message);
    setStatus(reportId, 'error', err.message);
    throw err;
  }
}

module.exports = { analyserRapport };
