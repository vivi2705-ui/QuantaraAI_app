// services/groq.js
// Single Groq API client used by all analysis functions.
// Exposes two methods: callJSON (structured output) and callText (narrative).

const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

function getModel() {
  return process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
}

// ── Internal fetch with exponential backoff ───────────────────────────────────

async function _fetch(body, attempt = 0) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY manquante');

  const res = await fetch(API_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err  = await res.json().catch(() => ({}));
    const msg  = err?.error?.message || 'Erreur inconnue';
    const retry = (res.status === 429 || res.status === 503) && attempt < 4;

    if (retry) {
      const wait = 2 ** attempt * 1500; // 1.5s, 3s, 6s, 12s
      console.log(`⏳  Groq ${res.status} — retry ${attempt + 1}/4 dans ${wait / 1000}s`);
      await new Promise(r => setTimeout(r, wait));
      return _fetch(body, attempt + 1);
    }

    throw new Error(`Groq [${res.status}]: ${msg}`);
  }

  const data    = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Réponse Groq vide');

  return content;
}

// ── Public: JSON mode ─────────────────────────────────────────────────────────

async function callJSON(systemPrompt, userPrompt) {
  const raw = await _fetch({
    model:           getModel(),
    temperature:     0.1,
    max_tokens:      2048,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt   },
    ],
  });

  // Defensive JSON parse — strip stray markdown fences if any
  const clean = raw.replace(/^```json\s*/i, '').replace(/^```/, '').replace(/```\s*$/, '').trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    console.error('❌  JSON parse failed:', clean.slice(0, 300));
    throw new Error(`Groq a retourné un JSON invalide : ${e.message}`);
  }
}

// ── Public: text mode ─────────────────────────────────────────────────────────

async function callText(systemPrompt, userPrompt) {
  return _fetch({
    model:       getModel(),
    temperature: 0.25,
    max_tokens:  3000,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt   },
    ],
  });
}

module.exports = { callJSON, callText };
