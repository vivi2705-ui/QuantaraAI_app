// ─────────────────────────────────────────────────────────────────────────────
//  FinLLM — Groq Prompts
//  All prompts use explicit XML-style delimiters so the model never confuses
//  injected data with instructions. Each prompt ends with a concrete JSON
//  schema example so the model rarely deviates from the expected structure.
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Sentiment analysis ─────────────────────────────────────────────────────
// Goal : Characterise the TONE of management discourse, independently of
//        financial figures. We want to detect overconfidence or pessimism
//        BEFORE comparing against numbers.

const PROMPT_SENTIMENT = `
You are a senior behavioural-finance analyst specialising in detecting management bias in corporate annual reports.

<MANAGEMENT_NARRATIVE>
{texte_narratif}
</MANAGEMENT_NARRATIVE>

Your task is to analyse the tone and sentiment of the management narrative above.
Base your analysis SOLELY on the text provided — do not invent financial metrics.

SCORING SCALE (score_sentiment):
  1 = Highly pessimistic / distress signals (cuts, warnings, uncertainty)
  2 = Cautious / conservative (qualifications, hedging language)
  3 = Neutral / balanced (factual, measured)
  4 = Optimistic / confident (forward-looking, growth narrative)
  5 = Euphoric / overconfident (superlatives, unrealistic promises, spin)

INSTRUCTIONS:
1. Assign a score_sentiment (integer 1-5) and a label (one of: "Très pessimiste", "Prudent", "Neutre", "Optimiste", "Euphorique").
2. Extract the 3 most telling verbatim claims or phrases that justify your score.
   — If fewer than 3 exist, only list those present.
   — Preserve the original language of the document.
3. List ALL quantified or qualified projections announced (e.g. "15% revenue growth targeted for 2025", "planned expansion into West Africa").
   — Return an empty array [] if none are found.
4. Write a two-sentence factual summary of the overall tone in French.
5. Estimate discourse_optimism as a percentage (0-100) reflecting how positive the language is relative to a neutral baseline.

CONSTRAINTS:
— Reply ONLY with a single valid JSON object. No markdown, no explanation, no text outside the JSON.
— If a field cannot be determined from the text, use null.

Expected JSON schema:
{
  "score_sentiment": 4,
  "label_sentiment": "Optimiste",
  "discourse_optimism": 72,
  "affirmations_cles": [
    "Verbatim claim 1 from the text",
    "Verbatim claim 2 from the text",
    "Verbatim claim 3 from the text"
  ],
  "projections_annoncees": [
    "Projection or target announced in the report"
  ],
  "ton_general": "Phrase 1 describing tone. Phrase 2 providing context."
}
`.trim();


// ── 2. Discourse vs. reality comparison ──────────────────────────────────────
// Goal : Cross-reference sentiment findings against hard financial metrics.
//        We want concrete, citable contradictions — not vague statements.

const PROMPT_COMPARAISON = `
You are a forensic financial analyst tasked with detecting misalignment between
management communication and actual financial performance.

<SENTIMENT_ANALYSIS>
{resume_sentiment}
</SENTIMENT_ANALYSIS>

<FINANCIAL_KPIS>
{kpis_json}
</KPIS>

ALGORITHMIC CREDIT SCORE: {score_credit}/100

CRITICAL RULE: If a KPI value is null, that data was unavailable in the document.
Do NOT infer a contradiction from a null value — simply note the absence.

YOUR TASK:

1. ALIGNMENT SCORE (0-100)
   Measure how closely management communication reflects the actual financial data.
   0-25  : Major misalignment — discourse is misleading or detached from reality
   26-50 : Excessive optimism — reality is materially worse than presented
   51-75 : Broadly aligned — minor embellishments or omissions
   76-100: High fidelity — discourse is honest and well-supported by numbers

2. CONTRADICTIONS (0 to 5 items, ordered by severity)
   Format strictly: "Management claims [X], but data shows [Y — cite the specific figure]."
   Only list a contradiction when you can quote a specific number for Y.
   Prioritise the most investor-relevant discrepancies.

3. CONFIRMED POINTS (0 to 5 items)
   Format strictly: "The claim [X] is supported by [Y — cite the specific figure]."

4. VERDICT — choose exactly one:
   "ALIGNÉ"              — discourse faithfully reflects the financials
   "PRUDENT"             — slight positive framing but broadly accurate
   "OPTIMISTE_EXCESSIF"  — materially over-optimistic vs. the numbers
   "ALARMANT"            — seriously misleading or concealing critical risks

5. RISK LEVEL — choose exactly one:
   "FAIBLE" | "MODÉRÉ" | "ÉLEVÉ" | "CRITIQUE"

6. KEY QUOTE — identify the single most revealing sentence from the management
   narrative that best illustrates the gap (or alignment). Include the source
   section if identifiable (e.g. "Mot du Président").

7. EXPLANATION — two precise sentences in French justifying your verdict.

8. SENTIMENT BARS (for the UI)
   — real_performance: 0-100 reflecting actual financial health from the KPIs
   — gap: abs(discourse_optimism - real_performance)

CONSTRAINTS:
— Reply ONLY with a valid JSON object. No markdown, no surrounding text.

Expected JSON schema:
{
  "score_alignement": 38,
  "verdict": "OPTIMISTE_EXCESSIF",
  "niveau_risque": "ÉLEVÉ",
  "contradictions": [
    "Management claims strong revenue growth, but data shows CA declined by 8% vs. prior year."
  ],
  "points_confirmes": [
    "The claim of improved cost discipline is supported by a net margin of 14.2%."
  ],
  "key_quote": {
    "text": "The verbatim quote from the management narrative",
    "source": "Mot du Président, p. 4"
  },
  "sentiment_summary": {
    "discourse_optimism": 75,
    "real_performance": 38,
    "gap": 37
  },
  "explication": "Sentence 1 in French. Sentence 2 in French."
}
`.trim();


// ── 3. Narrative report ───────────────────────────────────────────────────────
// Goal : A professional, citation-dense report written for a credit committee
//        or investment fund. Structured in clear sections. Plain text, not JSON.

const PROMPT_RAPPORT = `
You are a senior financial analyst at a Tier-1 investment bank, writing a credit
committee memorandum in French for a client whose annual report has just been
analysed by our AI platform.

ANALYSIS INPUTS:

<KPIS>
{kpis}
</KPIS>

Credit score (algorithmic): {score_credit}/100
Alignment score (AI):       {score_alignement}/100
Overall verdict:            {verdict}
Risk level:                 {niveau_risque}

<SENTIMENT>
{sentiment}
</SENTIMENT>

<CONTRADICTIONS>
{contradictions}
</CONTRADICTIONS>

WRITING INSTRUCTIONS:
— Target length: 650–850 words.
— Always cite specific numbers from the inputs. Never use vague qualifiers like "significantly" without a figure.
— If a data field is null or unavailable, write "donnée non disponible" — do not invent values.
— Use formal but accessible French. Avoid jargon without explanation.
— Every section must add analytical value — no filler sentences.

MANDATORY STRUCTURE — use exactly these Markdown headings:

# SYNTHÈSE EXÉCUTIVE
[2-3 sentences: overall verdict, credit score, alignment score, and the single most important finding for a decision-maker.]

# ANALYSE FINANCIÈRE QUANTITATIVE
[Analyse each available KPI: what it means, how it compares to industry norms, and what it signals about financial health. Comment the credit score breakdown.]

# ANALYSE DU DISCOURS DIRIGEANT
[Tone score, label, key claims made by management, projections announced, and what they reveal about executive outlook.]

# COHÉRENCE DISCOURS-RÉALITÉ
[Alignment score with commentary. List and explain each contradiction. Note confirmed points. Reference the key quote if available.]

# DRAPEAUX ROUGES
[Bullet list of actionable red flags for an investor or lender. Be specific. Write "Aucun drapeau rouge identifié." if none.]

# RECOMMANDATION FINALE
Start with one of: **FAVORABLE** | **À SURVEILLER** | **DÉFAVORABLE**
[2-3 sentences justifying the recommendation with reference to the most critical data points.]

IMPORTANT:
— Begin your response directly with "# SYNTHÈSE EXÉCUTIVE". No preamble.
— Output is plain Markdown text — do NOT wrap it in JSON.
`.trim();


module.exports = { PROMPT_SENTIMENT, PROMPT_COMPARAISON, PROMPT_RAPPORT };