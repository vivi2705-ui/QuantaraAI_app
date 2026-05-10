// const PDFDocument = require('pdfkit');
// const fs   = require('fs-extra');
// const path = require('path');

// const C = {
//   bg:        '#020817',
//   green:     '#10b981',
//   gold:      '#d97706',
//   red:       '#dc2626',
//   gray:      '#6b7280',
//   white:     '#ffffff',
//   textLight: '#d1d5db',
// };

// // ── Page header ───────────────────────────────────────────────────────────────

// function addPageHeader(doc) {
//   doc.rect(0, 0, doc.page.width, 80).fill(C.bg);

//   doc.fillColor(C.green).fontSize(18).font('Helvetica-Bold')
//     .text('Quantara', 44, 22);
//   doc.fillColor(C.white).fontSize(9).font('Helvetica')
//     .text('Intelligence Financière  ·  Discours vs Réalité', 44, 44);

//   const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
//   doc.fillColor(C.gray).fontSize(8)
//     .text(`Généré le ${date}`, 0, 30, { width: doc.page.width - 44, align: 'right' });

//   doc.rect(0, 80, doc.page.width, 3).fill(C.green);
//   doc.y = 100;
// }

// // ── Helpers ───────────────────────────────────────────────────────────────────

// function checkPageBreak(doc, needed = 60) {
//   if (doc.y + needed > doc.page.height - 60) {
//     doc.addPage();
//     addPageHeader(doc);
//   }
// }

// function sectionHeader(doc, title) {
//   checkPageBreak(doc, 44);
//   doc.moveDown(0.8);
//   const y = doc.y;
//   doc.rect(44, y, doc.page.width - 88, 26).fill('#0f172a');
//   doc.fillColor(C.green).fontSize(8).font('Helvetica-Bold')
//     .text(title.toUpperCase(), 52, y + 9, { width: doc.page.width - 110 });
//   doc.y = y + 32;
//   doc.fillColor(C.white).font('Helvetica').fontSize(10);
// }

// function bodyText(doc, text, opts = {}) {
//   if (!text) return;
//   checkPageBreak(doc, 30);
//   doc.fillColor(opts.color || C.textLight)
//     .fontSize(opts.size || 10)
//     .font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
//     .text(String(text), 44, doc.y, {
//       width:   doc.page.width - 88,
//       align:   opts.align || 'left',
//       lineGap: 3,
//     });
//   doc.moveDown(0.3);
// }

// function kpiRow(doc, label, value) {
//   checkPageBreak(doc, 22);
//   const y = doc.y;
//   // Label and value on the same line using two separate text calls with fixed X
//   doc.fillColor(C.gray).fontSize(9).font('Helvetica')
//     .text(String(label), 52, y, { width: 200 });
//   doc.fillColor(C.white).fontSize(9).font('Helvetica-Bold')
//     .text(value !== null && value !== undefined ? String(value) : '—', 260, y, { width: 200 });
//   doc.y = y + 18;
// }

// // Fixed flagRow — no continued:true, icon and text drawn separately with fixed coords
// function flagRow(doc, text, severity) {
//   if (!text) return;
//   checkPageBreak(doc, 36);

//   const color = severity === 'high' ? C.red : C.gold;
//   const icon  = severity === 'high' ? '!' : 'o'; // ASCII safe chars

//   const y = doc.y;

//   // Icon circle background
//   doc.circle(54, y + 7, 7)
//     .fill(severity === 'high' ? 'rgba(220,38,38,0.2)' : 'rgba(217,119,6,0.2)');

//   // Icon character centered in circle
//   doc.fillColor(color).fontSize(9).font('Helvetica-Bold')
//     .text(severity === 'high' ? '!' : '◆', 51, y + 3, { width: 8, align: 'left' });

//   // Text starts after icon, same Y
//   const textLines = doc.heightOfString(String(text), { width: doc.page.width - 122, fontSize: 9 });
//   doc.fillColor(C.textLight).font('Helvetica').fontSize(9)
//     .text(String(text), 68, y, { width: doc.page.width - 114, lineGap: 2 });

//   doc.y = Math.max(doc.y, y + textLines + 8);
//   doc.moveDown(0.3);
// }

// function verdictBox(doc, verdict, score) {
//   checkPageBreak(doc, 74);

//   const colors = {
//     ALIGNÉ:             { bg: '#064e3b', border: C.green, text: '#6ee7b7' },
//     PRUDENT:            { bg: '#451a03', border: C.gold,  text: '#fcd34d' },
//     OPTIMISTE_EXCESSIF: { bg: '#431407', border: C.gold,  text: '#fbbf24' },
//     ALARMANT:           { bg: '#450a0a', border: C.red,   text: '#fca5a5' },
//   };
//   const s = colors[verdict] ?? { bg: '#1e293b', border: C.gray, text: C.textLight };

//   const boxY = doc.y;
//   const boxH = 64;

//   doc.roundedRect(44, boxY, doc.page.width - 88, boxH, 6)
//     .fillAndStroke(s.bg, s.border);

//   const label = verdict?.replace(/_/g, ' ') ?? '—';
//   doc.fillColor(s.text).fontSize(15).font('Helvetica-Bold')
//     .text(label, 62, boxY + 14, { width: doc.page.width - 130 });

//   doc.fillColor(s.text).fontSize(9).font('Helvetica')
//     .text(`Score d'alignement : ${score ?? '—'}/100`, 62, boxY + 38);

//   doc.y = boxY + boxH + 14;
// }

// function scoreRow(doc, label, score, max = 100) {
//   checkPageBreak(doc, 28);
//   const pct   = Math.min((score ?? 0) / max, 1);
//   const color = pct >= 0.7 ? C.green : pct >= 0.5 ? C.gold : C.red;

//   const y   = doc.y;
//   const barX = 210;
//   const barW = doc.page.width - 88 - 170;
//   const barH = 10;

//   doc.fillColor(C.gray).fontSize(9).font('Helvetica')
//     .text(label, 52, y + 2, { width: 155 });

//   doc.roundedRect(barX, y + 1, barW, barH, 3).fill('#1e293b');
//   if (pct > 0) doc.roundedRect(barX, y + 1, barW * pct, barH, 3).fill(color);

//   doc.fillColor(color).fontSize(9).font('Helvetica-Bold')
//     .text(`${score ?? '—'}/${max}`, barX + barW + 8, y + 2, { width: 50 });

//   doc.y = y + 22;
// }

// function keyQuote(doc, text, source) {
//   if (!text) return;
//   checkPageBreak(doc, 70);

//   const startY = doc.y;

//   // Measure text height first so we can size the box
//   const textH = doc.heightOfString(`« ${text} »`, {
//     width: doc.page.width - 120,
//     fontSize: 9.5,
//   });
//   const boxH = textH + 28;

//   // Green left border bar
//   doc.rect(44, startY, 4, boxH).fill(C.green);

//   // Background
//   doc.rect(48, startY, doc.page.width - 94, boxH).fill('#0d1f2d');

//   // Quote text — starts after the bar with padding
//   doc.fillColor(C.textLight).fontSize(9.5).font('Helvetica-Oblique')
//     .text(`« ${text} »`, 62, startY + 12, { width: doc.page.width - 118, lineGap: 2 });

//   // Source below
//   if (source) {
//     doc.fillColor(C.gray).fontSize(8).font('Helvetica')
//       .text(`— ${source}`, 62, startY + boxH - 14, { width: doc.page.width - 118 });
//   }

//   doc.y = startY + boxH + 10;
// }

// // ── Main generator ────────────────────────────────────────────────────────────

// async function genererPDF(reportId, { kpis, scoreCredit, sentiment, comparaison, rapportNarratif }) {
//   return new Promise((resolve, reject) => {
//     try {
//       const outputPath = path.join(__dirname, '../outputs', `${reportId}.pdf`);
//       const doc    = new PDFDocument({ margin: 0, size: 'A4', bufferPages: true });
//       const stream = fs.createWriteStream(outputPath);
//       doc.pipe(stream);

//       // ══ PAGE 1 — Verdict, Scores, KPIs ═══════════════════════════════════════
//       addPageHeader(doc);

//       bodyText(doc, `Référence : ${reportId}`, { color: C.gray, size: 8 });
//       doc.moveDown(0.4);

//       sectionHeader(doc, 'Verdict & Scores');
//       verdictBox(doc, comparaison?.verdict, comparaison?.score_alignement);
//       doc.moveDown(0.2);
//       scoreRow(doc, 'Score de crédit',     scoreCredit?.score,            100);
//       scoreRow(doc, 'Score d\'alignement', comparaison?.score_alignement, 100);
//       doc.moveDown(0.3);

//       if (scoreCredit?.interpretation) {
//         bodyText(doc, scoreCredit.interpretation, { color: C.gray, size: 9 });
//       }

//       sectionHeader(doc, 'Détail du scoring crédit');
//       const dim = scoreCredit?.details ?? {};
//       if (dim.rentabilite) kpiRow(doc, 'Rentabilité',  dim.rentabilite);
//       if (dim.liquidite)   kpiRow(doc, 'Liquidité',    dim.liquidite);
//       if (dim.endettement) kpiRow(doc, 'Endettement',  dim.endettement);
//       if (dim.croissance)  kpiRow(doc, 'Croissance',   dim.croissance);

//       const kpiList = buildKPIRows(kpis);
//       if (kpiList.length > 0) {
//         sectionHeader(doc, 'Indicateurs financiers clés');
//         for (const k of kpiList) kpiRow(doc, k.label, k.value);
//       }

//       // ══ PAGE 2 — Sentiment, Quote, Contradictions ════════════════════════════
//       doc.addPage();
//       addPageHeader(doc);

//       sectionHeader(doc, 'Analyse du discours dirigeant');
//       bodyText(doc, `Sentiment : ${sentiment?.label_sentiment ?? '—'} (${sentiment?.score_sentiment ?? '—'}/5)`);
//       bodyText(doc, `Optimisme du discours : ${sentiment?.discourse_optimism ?? '—'}%`);
//       doc.moveDown(0.2);

//       if (sentiment?.ton_general) {
//         bodyText(doc, sentiment.ton_general, { color: C.gray, size: 9 });
//         doc.moveDown(0.2);
//       }

//       if (sentiment?.affirmations_cles?.length) {
//         bodyText(doc, 'Affirmations clés :', { bold: true });
//         for (const a of sentiment.affirmations_cles) {
//           checkPageBreak(doc, 28);
//           bodyText(doc, `· ${String(a)}`, { color: C.textLight, size: 9 });
//         }
//         doc.moveDown(0.2);
//       }

//       if (sentiment?.projections_annoncees?.length) {
//         bodyText(doc, 'Projections annoncées :', { bold: true });
//         for (const p of sentiment.projections_annoncees) {
//           checkPageBreak(doc, 28);
//           bodyText(doc, `· ${String(p)}`, { color: '#fcd34d', size: 9 });
//         }
//         doc.moveDown(0.2);
//       }

//       if (comparaison?.key_quote?.text) {
//         sectionHeader(doc, 'Citation clé');
//         keyQuote(doc, comparaison.key_quote.text, comparaison.key_quote.source);
//       }

//       if (comparaison?.contradictions?.length) {
//         sectionHeader(doc, 'Contradictions détectées');
//         for (const c of comparaison.contradictions) {
//           flagRow(doc, String(c), 'high');
//         }
//       }

//       if (comparaison?.points_confirmes?.length) {
//         sectionHeader(doc, 'Points confirmés par les données');
//         for (const p of comparaison.points_confirmes) {
//           flagRow(doc, String(p), 'low');
//         }
//       }

//       if (scoreCredit?.drapeaux?.length) {
//         sectionHeader(doc, 'Alertes scoring crédit');
//         for (const d of scoreCredit.drapeaux) {
//           flagRow(doc, String(d).replace('🔴 ', ''), d.startsWith('🔴') ? 'high' : 'medium');
//         }
//       }

//       if (comparaison?.explication) {
//         sectionHeader(doc, 'Explication du score d\'alignement');
//         bodyText(doc, comparaison.explication);
//       }

//       // ══ PAGE 3 — Narrative ═══════════════════════════════════════════════════
//       doc.addPage();
//       addPageHeader(doc);
//       sectionHeader(doc, 'Rapport Narratif — Synthèse générée par Quantara AI');

//       if (rapportNarratif) {
//         for (const line of rapportNarratif.split('\n')) {
//           const trimmed = line.trim();
//           if (!trimmed) { doc.moveDown(0.3); continue; }

//           if (trimmed.startsWith('# ')) {
//             checkPageBreak(doc, 44);
//             doc.moveDown(0.5);
//             bodyText(doc, trimmed.replace(/^# /, ''), { bold: true, size: 13, color: C.white });
//             doc.moveDown(0.2);
//           } else if (trimmed.startsWith('## ')) {
//             checkPageBreak(doc, 32);
//             bodyText(doc, trimmed.replace(/^## /, ''), { bold: true, size: 11, color: C.green });
//           } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
//             bodyText(doc, trimmed.replace(/\*\*/g, ''), { bold: true, color: C.white });
//           } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
//             checkPageBreak(doc, 24);
//             bodyText(doc, `· ${trimmed.slice(2)}`, { size: 9.5 });
//           } else {
//             checkPageBreak(doc, 24);
//             bodyText(doc, trimmed, { size: 10, align: 'justify' });
//           }
//         }
//       }

//       // ── Footer on every page ─────────────────────────────────────────────────
//       const range = doc.bufferedPageRange();
//       for (let i = 0; i < range.count; i++) {
//         doc.switchToPage(range.start + i);
//         doc.fillColor(C.gray).fontSize(7).font('Helvetica')
//           .text(
//             `Quantara AI  ·  Document généré automatiquement  ·  Ne remplace pas une analyse humaine  ·  Page ${i + 1}/${range.count}`,
//             44,
//             doc.page.height - 28,
//             { width: doc.page.width - 88, align: 'center' },
//           );
//       }

//       doc.end();
//       stream.on('finish', () => {
//         console.log(`✅  PDF généré : ${outputPath}`);
//         resolve(outputPath);
//       });
//       stream.on('error', reject);

//     } catch (err) {
//       reject(err);
//     }
//   });
// }

// function buildKPIRows(kpis) {
//   if (!kpis) return [];
//   const map = [
//     { label: 'Chiffre d\'affaires', key: 'chiffre_affaires', unit: '' },
//     { label: 'Résultat net',        key: 'resultat_net',      unit: '' },
//     { label: 'Marge nette',         key: 'marge_nette',       unit: '%' },
//     { label: 'Liquidité courante',  key: 'ratio_courant',     unit: '' },
//     { label: 'Taux d\'endettement', key: 'ratio_endettement', unit: '%' },
//     { label: 'Croissance CA',       key: 'croissance_ca',     unit: '%' },
//   ];
//   return map
//     .filter(m => kpis[m.key] !== null && kpis[m.key] !== undefined)
//     .map(m => ({ label: m.label, value: `${kpis[m.key]}${m.unit}` }));
// }

// module.exports = { genererPDF };
const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');

const C = {
  bg: '#020817',

  green: '#10b981',
  gold: '#d97706',
  red: '#dc2626',

  white: '#ffffff',

  text: '#111827',
  textLight: '#374151',
  gray: '#64748b',

  softBg: '#f8fafc',
  border: '#cbd5e1',
};

// ─────────────────────────────────────────────────────────────────────────────
// TEXT SANITIZER
// ─────────────────────────────────────────────────────────────────────────────

function cleanText(text = '') {
  return String(text)
    .replace(/[^\x20-\x7EÀ-ÿ€]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE HEADER
// ─────────────────────────────────────────────────────────────────────────────

function addPageHeader(doc) {
  doc.rect(0, 0, doc.page.width, 82).fill(C.bg);

  doc
    .fillColor(C.green)
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('Quantara', 44, 20);

  doc
    .fillColor(C.white)
    .fontSize(9)
    .font('Helvetica')
    .text('Intelligence Financière · Discours vs Réalité', 44, 46);

  const date = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  doc
    .fillColor('#94a3b8')
    .fontSize(8)
    .text(`Généré le ${date}`, 0, 28, {
      width: doc.page.width - 44,
      align: 'right',
    });

  doc.rect(0, 82, doc.page.width, 3).fill(C.green);

  doc.y = 104;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function checkPageBreak(doc, needed = 60) {
  if (doc.y + needed > doc.page.height - 60) {
    doc.addPage();
    addPageHeader(doc);
  }
}

function sectionHeader(doc, title) {
  doc.moveDown(0.8);

  checkPageBreak(doc, 50);

  const y = doc.y;

  doc
    .roundedRect(44, y, doc.page.width - 88, 24, 4)
    .fill('#e2e8f0');

  doc
    .fillColor('#0f172a')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text(cleanText(title.toUpperCase()), 56, y + 7);

  doc.y = y + 34;
}

function bodyText(doc, text, opts = {}) {
  if (!text) return;

  const cleaned = cleanText(text);

  const width = doc.page.width - 88;

  const height = doc.heightOfString(cleaned, {
    width,
    align: opts.align || 'left',
    lineGap: 3,
  });

  checkPageBreak(doc, height + 20);

  doc
    .fillColor(opts.color || C.text)
    .fontSize(opts.size || 10)
    .font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
    .text(cleaned, 44, doc.y, {
      width,
      align: opts.align || 'left',
      lineGap: 3,
    });

  doc.moveDown(0.5);
}

function kpiRow(doc, label, value) {
  checkPageBreak(doc, 22);

  const y = doc.y;

  doc
    .fillColor(C.gray)
    .fontSize(9)
    .font('Helvetica')
    .text(cleanText(label), 52, y, { width: 200 });

  doc
    .fillColor(C.text)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text(
      value !== null && value !== undefined
        ? cleanText(String(value))
        : '—',
      260,
      y,
      { width: 200 }
    );

  doc.y = y + 18;
}

function flagRow(doc, text, severity) {
  if (!text) return;

  const cleaned = cleanText(text);

  checkPageBreak(doc, 36);

  const color = severity === 'high' ? C.red : C.gold;

  const y = doc.y;

  doc.save();

  doc
    .fillOpacity(0.18)
    .circle(54, y + 7, 7)
    .fill(color);

  doc.restore();

  doc
    .fillColor(color)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text(severity === 'high' ? '!' : '◆', 51, y + 3);

  const textLines = doc.heightOfString(cleaned, {
    width: doc.page.width - 122,
    fontSize: 9,
  });

  doc
    .fillColor(C.textLight)
    .font('Helvetica')
    .fontSize(9)
    .text(cleaned, 68, y, {
      width: doc.page.width - 114,
      lineGap: 2,
    });

  doc.y = Math.max(doc.y, y + textLines + 8);

  doc.moveDown(0.2);
}

function verdictBox(doc, verdict, score) {
  checkPageBreak(doc, 80);

  const colors = {
    ALIGNÉ: {
      bg: '#dcfce7',
      border: C.green,
      text: '#166534',
    },

    PRUDENT: {
      bg: '#fef3c7',
      border: C.gold,
      text: '#92400e',
    },

    OPTIMISTE_EXCESSIF: {
      bg: '#ffedd5',
      border: '#ea580c',
      text: '#9a3412',
    },

    ALARMANT: {
      bg: '#fee2e2',
      border: C.red,
      text: '#991b1b',
    },
  };

  const s = colors[verdict] ?? {
    bg: '#e2e8f0',
    border: C.gray,
    text: '#334155',
  };

  const boxY = doc.y;
  const boxH = 70;

  doc
    .roundedRect(44, boxY, doc.page.width - 88, boxH, 8)
    .fillAndStroke(s.bg, s.border);

  doc
    .fillColor(s.text)
    .fontSize(16)
    .font('Helvetica-Bold')
    .text(
      cleanText(verdict?.replace(/_/g, ' ') ?? '—'),
      62,
      boxY + 16
    );

  doc.y = boxY + boxH + 14;
}

function scoreRow(doc, label, score, max = 100) {
  checkPageBreak(doc, 28);

  const pct = Math.min((score ?? 0) / max, 1);

  const color =
    pct >= 0.7
      ? C.green
      : pct >= 0.5
      ? C.gold
      : C.red;

  const y = doc.y;

  const barX = 210;
  const barW = doc.page.width - 88 - 170;
  const barH = 10;

  doc
    .fillColor(C.gray)
    .fontSize(9)
    .font('Helvetica')
    .text(cleanText(label), 52, y + 2, {
      width: 155,
    });

  doc
    .roundedRect(barX, y + 1, barW, barH, 3)
    .fill('#e5e7eb');

  if (pct > 0) {
    doc
      .roundedRect(barX, y + 1, barW * pct, barH, 3)
      .fill(color);
  }

  doc
    .fillColor(color)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text(`${score ?? '—'}/${max}`, barX + barW + 8, y + 1);

  doc.y = y + 22;
}

function keyQuote(doc, text, source) {
  if (!text) return;

  checkPageBreak(doc, 80);

  const quote = cleanText(text);

  const startY = doc.y;

  const textH = doc.heightOfString(`« ${quote} »`, {
    width: doc.page.width - 120,
    fontSize: 10,
  });

  const boxH = textH + 30;

  doc.rect(44, startY, 4, boxH).fill(C.green);

  doc
    .rect(48, startY, doc.page.width - 94, boxH)
    .fill('#f1f5f9');

  doc
    .fillColor(C.text)
    .fontSize(10)
    .font('Helvetica-Oblique')
    .text(`« ${quote} »`, 62, startY + 12, {
      width: doc.page.width - 118,
      lineGap: 2,
    });

  if (source) {
    doc
      .fillColor(C.gray)
      .fontSize(8)
      .font('Helvetica')
      .text(`— ${cleanText(source)}`, 62, startY + boxH - 14);
  }

  doc.y = startY + boxH + 10;
}

// ─────────────────────────────────────────────────────────────────────────────
// MINI SCORE CHART
// ─────────────────────────────────────────────────────────────────────────────

function drawMiniChart(doc, scores) {
  checkPageBreak(doc, 120);

  const startX = 60;

  let y = doc.y;

  for (const s of scores) {
    const pct = Math.max(
      0,
      Math.min((s.value ?? 0) / 100, 1)
    );

    doc
      .fillColor(C.text)
      .fontSize(9)
      .font('Helvetica')
      .text(cleanText(s.label), startX, y);

    doc
      .roundedRect(startX + 120, y + 2, 180, 8, 4)
      .fill('#e5e7eb');

    doc
      .roundedRect(startX + 120, y + 2, 180 * pct, 8, 4)
      .fill(
        pct > 0.7
          ? C.green
          : pct > 0.45
          ? C.gold
          : C.red
      );

    doc
      .fillColor(C.text)
      .font('Helvetica-Bold')
      .text(`${s.value ?? 0}/100`, startX + 310, y - 1);

    y += 22;
  }

  doc.y = y + 10;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

async function genererPDF(
  reportId,
  {
    kpis,
    scoreCredit,
    sentiment,
    comparaison,
    rapportNarratif,
  }
) {
  return new Promise((resolve, reject) => {
    try {
      const outputPath = path.join(
        __dirname,
        '../outputs',
        `${reportId}.pdf`
      );

      const doc = new PDFDocument({
        margin: 0,
        size: 'A4',
        bufferPages: true,
      });

      const stream = fs.createWriteStream(outputPath);

      doc.pipe(stream);

      // ───────────────── PAGE 1 ─────────────────

      addPageHeader(doc);

      bodyText(doc, `Référence : ${reportId}`, {
        color: C.gray,
        size: 8,
      });

      sectionHeader(doc, 'Verdict & Scores');

      verdictBox(
        doc,
        comparaison?.verdict,
        comparaison?.score_alignement
      );

      scoreRow(
        doc,
        'Score de crédit',
        scoreCredit?.score,
        100
      );

      scoreRow(
        doc,
        'Score d’alignement',
        comparaison?.score_alignement,
        100
      );

      if (scoreCredit?.interpretation) {
        bodyText(doc, scoreCredit.interpretation, {
          color: C.textLight,
          size: 9,
        });
      }

      sectionHeader(doc, 'Profil de risque IA');

      drawMiniChart(doc, [
        {
          label: 'Alignement',
          value: comparaison?.score_alignement ?? 0,
        },
        {
          label: 'Crédit',
          value: scoreCredit?.score ?? 0,
        },
        {
          label: 'Optimisme',
          value: sentiment?.discourse_optimism ?? 0,
        },
      ]);

      sectionHeader(doc, 'Détail du scoring crédit');

      const dim = scoreCredit?.details ?? {};

      if (dim.rentabilite)
        kpiRow(doc, 'Rentabilité', dim.rentabilite);

      if (dim.liquidite)
        kpiRow(doc, 'Liquidité', dim.liquidite);

      if (dim.endettement)
        kpiRow(doc, 'Endettement', dim.endettement);

      if (dim.croissance)
        kpiRow(doc, 'Croissance', dim.croissance);

      const kpiList = buildKPIRows(kpis);

      if (kpiList.length > 0) {
        sectionHeader(doc, 'Indicateurs financiers clés');

        for (const k of kpiList) {
          kpiRow(doc, k.label, k.value);
        }
      }

      // ───────────────── PAGE 2 ─────────────────

      doc.addPage();

      addPageHeader(doc);

      sectionHeader(doc, 'Analyse du discours dirigeant');

      bodyText(
        doc,
        `Sentiment : ${
          sentiment?.label_sentiment ?? '—'
        } (${sentiment?.score_sentiment ?? '—'}/5)`
      );

      bodyText(
        doc,
        `Optimisme du discours : ${
          sentiment?.discourse_optimism ?? '—'
        }%`
      );

      if (sentiment?.ton_general) {
        bodyText(doc, sentiment.ton_general, {
          color: C.textLight,
          size: 9,
        });
      }

      if (sentiment?.affirmations_cles?.length) {
        bodyText(doc, 'Affirmations clés :', {
          bold: true,
        });

        for (const a of sentiment.affirmations_cles) {
          bodyText(doc, `• ${a}`, {
            size: 9,
          });
        }
      }

      if (sentiment?.projections_annoncees?.length) {
        bodyText(doc, 'Projections annoncées :', {
          bold: true,
        });

        for (const p of sentiment.projections_annoncees) {
          bodyText(doc, `• ${p}`, {
            size: 9,
            color: '#92400e',
          });
        }
      }

      if (comparaison?.key_quote?.text) {
        sectionHeader(doc, 'Citation clé');

        keyQuote(
          doc,
          comparaison.key_quote.text,
          comparaison.key_quote.source
        );
      }

      if (comparaison?.contradictions?.length) {
        sectionHeader(doc, 'Contradictions détectées');

        for (const c of comparaison.contradictions) {
          flagRow(doc, c, 'high');
        }
      }

      if (comparaison?.points_confirmes?.length) {
        sectionHeader(doc, 'Points confirmés');

        for (const p of comparaison.points_confirmes) {
          flagRow(doc, p, 'medium');
        }
      }

      if (scoreCredit?.drapeaux?.length) {
        sectionHeader(doc, 'Alertes scoring crédit');

        for (const d of scoreCredit.drapeaux) {
          flagRow(
            doc,
            cleanText(d.replace('🔴 ', '')),
            d.startsWith('🔴')
              ? 'high'
              : 'medium'
          );
        }
      }

      if (comparaison?.explication) {
        sectionHeader(
          doc,
          'Explication du score d’alignement'
        );

        bodyText(doc, comparaison.explication, {
          align: 'justify',
        });
      }

      // ───────────────── PAGE 3 ─────────────────

      doc.addPage();

      addPageHeader(doc);

      sectionHeader(
        doc,
        'Rapport narratif — Synthèse Quantara AI'
      );

      if (rapportNarratif) {
        for (const line of rapportNarratif.split('\n')) {
          const trimmed = cleanText(line.trim());

          if (!trimmed) {
            doc.moveDown(0.3);
            continue;
          }

          if (trimmed.startsWith('# ')) {
            bodyText(doc, trimmed.replace(/^# /, ''), {
              bold: true,
              size: 13,
            });

          } else if (trimmed.startsWith('## ')) {
            bodyText(doc, trimmed.replace(/^## /, ''), {
              bold: true,
              size: 11,
              color: C.green,
            });

          } else if (
            trimmed.startsWith('* ') ||
            trimmed.startsWith('- ')
          ) {
            bodyText(doc, `• ${trimmed.slice(2)}`, {
              size: 9.5,
            });

          } else {
            bodyText(doc, trimmed, {
              size: 10,
              align: 'justify',
            });
          }
        }
      }

      // ───────────────── FOOTERS ─────────────────

      const range = doc.bufferedPageRange();

      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(range.start + i);

        doc
          .fillColor(C.gray)
          .fontSize(7)
          .font('Helvetica')
          .text(
            `Quantara AI · Document généré automatiquement · Ne remplace pas une analyse humaine · Page ${
              i + 1
            }/${range.count}`,
            44,
            doc.page.height - 28,
            {
              width: doc.page.width - 88,
              align: 'center',
            }
          );
      }

      doc.end();

      stream.on('finish', () => {
        console.log(`✅ PDF généré : ${outputPath}`);
        resolve(outputPath);
      });

      stream.on('error', reject);

    } catch (err) {
      reject(err);
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function buildKPIRows(kpis) {
  if (!kpis) return [];

  const map = [
    {
      label: 'Chiffre d’affaires',
      key: 'chiffre_affaires',
      unit: '',
    },

    {
      label: 'Résultat net',
      key: 'resultat_net',
      unit: '',
    },
 
    {
      label: 'Marge nette',
      key: 'marge_nette',
      unit: '%',
    },

    {
      label: 'Liquidité courante',
      key: 'ratio_courant',
      unit: '',
    },

    {
      label: 'Taux d’endettement',
      key: 'ratio_endettement',
      unit: '%',
    },

    {
      label: 'Croissance CA',
      key: 'croissance_ca',
      unit: '%',
    },
  ];

  return map
    .filter(
      (m) =>
        kpis[m.key] !== null &&
        kpis[m.key] !== undefined
    )
    .map((m) => ({
      label: m.label,
      value: `${kpis[m.key]}${m.unit}`,
    }));
}

module.exports = { genererPDF };