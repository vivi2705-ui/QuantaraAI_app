const { callJSON, callText }                   = require('./groq');
const { PROMPT_SENTIMENT, PROMPT_COMPARAISON, PROMPT_RAPPORT } = require('../prompts');

const SYSTEM_JSON = 'You are a financial analysis AI. Reply ONLY with valid JSON — no markdown, no text outside the JSON object.';
const SYSTEM_TEXT = 'Tu es un analyste financier senior. Rédige des rapports professionnels en français, structurés et factuels.';

// ── 1. Sentiment ──────────────────────────────────────────────────────────────

async function analyserSentiment(texteNarratif) {
  console.log(`🔍  Analyse sentiment (${texteNarratif.length} chars)...`);

  const prompt = PROMPT_SENTIMENT.replace('{texte_narratif}', texteNarratif);
  const result = await callJSON(SYSTEM_JSON, prompt);

  if (typeof result.score_sentiment !== 'number') {
    throw new Error('Groq: score_sentiment manquant ou non numérique');
  }

  console.log(`✅  Sentiment : ${result.label_sentiment} (${result.score_sentiment}/5)`);
  return result;
}

// ── 2. Comparison ─────────────────────────────────────────────────────────────

async function comparerSentimentKPIs(sentiment, kpis, scoreCredit) {
  console.log('⚖️   Comparaison discours/réalité...');

  const prompt = PROMPT_COMPARAISON
    .replace('{resume_sentiment}', JSON.stringify(sentiment, null, 2))
    .replace('{kpis_json}',        JSON.stringify(kpis, null, 2))
    .replace('{score_credit}',     scoreCredit.score);

  const result = await callJSON(SYSTEM_JSON, prompt);

  if (typeof result.score_alignement !== 'number') {
    throw new Error('Groq: score_alignement manquant ou non numérique');
  }

  console.log(`✅  Alignement : ${result.score_alignement}/100 — ${result.verdict}`);
  return result;
}

// ── 3. Narrative report ───────────────────────────────────────────────────────

async function genererRapportNarratif({ kpis, scoreCredit, sentiment, comparaison }) {
  console.log('📝  Génération du rapport narratif...');

  const contradictions = comparaison.contradictions?.length
    ? comparaison.contradictions.map(c => `- ${c}`).join('\n')
    : '- Aucune contradiction majeure détectée.';

  const prompt = PROMPT_RAPPORT
    .replace('{kpis}',              JSON.stringify(kpis, null, 2))
    .replace('{score_credit}',      scoreCredit.score)
    .replace('{score_alignement}',  comparaison.score_alignement)
    .replace('{verdict}',           comparaison.verdict)
    .replace('{niveau_risque}',     comparaison.niveau_risque)
    .replace('{sentiment}',         JSON.stringify(sentiment, null, 2))
    .replace('{contradictions}',    contradictions);

  const text = await callText(SYSTEM_TEXT, prompt);
  console.log(`✅  Rapport généré (${text.length} chars)`);
  return text;
}

module.exports = { analyserSentiment, comparerSentimentKPIs, genererRapportNarratif };
