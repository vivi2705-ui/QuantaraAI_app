// services/kpiCalculator.js
// Pure algorithmic KPI computation — no AI calls.

function calculateKPIs(data) {
  const kpis = {};

  // Helper — avoids "toFixed returns string" gotcha
  const pct = (num, den) => den ? +((num / den) * 100).toFixed(2) : null;
  const ratio = (a, b)   => b   ? +(a / b).toFixed(2)             : null;

  kpis.marge_nette       = pct(data.resultat_net,  data.chiffre_affaires);
  kpis.ratio_courant     = ratio(data.actif_courant, data.passif_courant);
  kpis.ratio_endettement = pct(data.dettes_totales, data.total_actif);
  kpis.croissance_ca     = data.chiffre_affaires && data.ca_n1
    ? +(((data.chiffre_affaires - data.ca_n1) / data.ca_n1) * 100).toFixed(2)
    : null;

  // Pass-through raw figures so Groq can reference absolute values
  kpis.chiffre_affaires  = data.chiffre_affaires  ?? null;
  kpis.ca_n1             = data.ca_n1             ?? null;
  kpis.resultat_net      = data.resultat_net       ?? null;
  kpis.ebitda            = data.ebitda             ?? null;
  kpis.actif_courant     = data.actif_courant      ?? null;
  kpis.passif_courant    = data.passif_courant     ?? null;
  kpis.dettes_totales    = data.dettes_totales     ?? null;
  kpis.total_actif       = data.total_actif        ?? null;
  kpis.capitaux_propres  = data.capitaux_propres   ?? null;

  return kpis;
}

function scoringCredit(kpis) {
  let score = 0;
  const details  = {};
  const drapeaux = [];

  // ── Rentabilité — 30 pts ──────────────────────────────────────────────────
  const marge = kpis.marge_nette ?? 0;
  if      (marge > 15) { score += 30; details.rentabilite = 'Excellente'; }
  else if (marge >  8) { score += 20; details.rentabilite = 'Bonne'; }
  else if (marge >  3) { score += 10; details.rentabilite = 'Correcte'; }
  else if (marge >  0) { score +=  5; details.rentabilite = 'Faible'; drapeaux.push('Marge nette très faible (< 3%)'); }
  else                 { score +=  0; details.rentabilite = 'Négative'; drapeaux.push('🔴 Résultat net négatif'); }

  // ── Liquidité — 25 pts ────────────────────────────────────────────────────
  const courant = kpis.ratio_courant ?? 0;
  if      (courant > 2.0) { score += 25; details.liquidite = 'Excellente'; }
  else if (courant > 1.5) { score += 18; details.liquidite = 'Bonne'; }
  else if (courant > 1.0) { score += 10; details.liquidite = 'Acceptable'; }
  else                    { score +=  0; details.liquidite = 'Critique'; drapeaux.push('🔴 Risque de liquidité (ratio courant ≤ 1)'); }

  // ── Endettement — 25 pts ──────────────────────────────────────────────────
  const dette = kpis.ratio_endettement ?? 0;
  if      (dette < 30) { score += 25; details.endettement = 'Faible'; }
  else if (dette < 50) { score += 18; details.endettement = 'Modéré'; }
  else if (dette < 70) { score += 10; details.endettement = 'Élevé'; drapeaux.push('Endettement important (50-70%)'); }
  else                 { score +=  0; details.endettement = 'Critique'; drapeaux.push('🔴 Endettement excessif (> 70%)'); }

  // ── Croissance — 20 pts ───────────────────────────────────────────────────
  const croissance = kpis.croissance_ca ?? 0;
  if      (croissance > 15) { score += 20; details.croissance = 'Forte'; }
  else if (croissance >  5) { score += 14; details.croissance = 'Bonne'; }
  else if (croissance >  0) { score +=  8; details.croissance = 'Faible'; }
  else                      { score +=  0; details.croissance = 'Négative'; drapeaux.push('Décroissance du chiffre d\'affaires'); }

  // ── Interpretation ────────────────────────────────────────────────────────
  const interpretation =
    score >= 80 ? 'Très solide — Risque faible' :
    score >= 60 ? 'Solide — Risque modéré' :
    score >= 40 ? 'Acceptable — Surveillance requise' :
                  'Fragile — Risque élevé';

  return { score, details, drapeaux, interpretation };
}

module.exports = { calculateKPIs, scoringCredit };
