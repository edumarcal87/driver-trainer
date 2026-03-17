/**
 * Generates a session report as a printable HTML document
 * and opens the browser print dialog (Save as PDF).
 */

const PEDAL_LABELS = { brake: 'Freio', throttle: 'Acelerador', clutch: 'Embreagem', steering: 'Volante', combined: 'Combinado' };
const PEDAL_HEX = { brake: '#ff4757', throttle: '#2ed573', clutch: '#ffa502', steering: '#3b82f6', combined: '#a855f7' };

function gradeColor(score) {
  if (score >= 80) return '#2ed573';
  if (score >= 50) return '#ffa502';
  return '#ff4757';
}

function gradeLabel(avg) {
  if (avg >= 95) return 'S';
  if (avg >= 85) return 'A';
  if (avg >= 70) return 'B';
  if (avg >= 50) return 'C';
  return 'D';
}

export function exportSessionPDF(sessionHistory, insights) {
  if (!sessionHistory || sessionHistory.length === 0) return;

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Group by pedal
  const byPedal = {};
  for (const e of sessionHistory) {
    const p = e.pedal || 'brake';
    if (!byPedal[p]) byPedal[p] = [];
    byPedal[p].push(e);
  }

  // Group by exercise
  const byExercise = {};
  for (const e of sessionHistory) {
    if (!byExercise[e.exId]) byExercise[e.exId] = [];
    byExercise[e.exId].push(e);
  }

  const allScores = sessionHistory.map(e => e.score);
  const avg = Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length);
  const best = Math.max(...allScores);
  const grade = gradeLabel(avg);

  // Build SVG sparkline for scores
  function miniSpark(scores, color, w = 200, h = 40) {
    if (scores.length < 2) return '';
    const pts = scores.map((s, i) => `${(i / (scores.length - 1)) * w},${h - (s / 100) * h}`).join(' ');
    return `<svg width="${w}" height="${h}" style="display:block;margin:8px 0;"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/></svg>`;
  }

  // Exercise table rows
  const exRows = Object.entries(byExercise).map(([id, entries]) => {
    const sc = entries.map(e => e.score);
    const exAvg = Math.round(sc.reduce((s, v) => s + v, 0) / sc.length);
    const exBest = Math.max(...sc);
    const trend = sc.length >= 2 ? sc[0] - sc[sc.length - 1] : 0;
    const trendStr = trend > 0 ? `+${trend}` : `${trend}`;
    const pedal = entries[0].pedal || 'brake';
    return `<tr>
      <td style="padding:6px 10px;border-bottom:1px solid #2a2a2a;"><span style="color:${PEDAL_HEX[pedal] || '#888'};font-size:10px;">●</span> ${entries[0].exName}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #2a2a2a;text-align:center;">${entries.length}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #2a2a2a;text-align:center;color:${gradeColor(exAvg)}">${exAvg}%</td>
      <td style="padding:6px 10px;border-bottom:1px solid #2a2a2a;text-align:center;color:${gradeColor(exBest)}">${exBest}%</td>
      <td style="padding:6px 10px;border-bottom:1px solid #2a2a2a;text-align:center;color:${trend >= 0 ? '#2ed573' : '#ff4757'}">${trendStr}</td>
    </tr>`;
  }).join('');

  // Per-pedal summary
  const pedalCards = Object.entries(byPedal).map(([pedal, entries]) => {
    const sc = entries.map(e => e.score);
    const pAvg = Math.round(sc.reduce((s, v) => s + v, 0) / sc.length);
    const pBest = Math.max(...sc);
    return `<div style="flex:1;min-width:130px;background:#1a1a1a;border-radius:10px;padding:14px;border:1px solid ${PEDAL_HEX[pedal]}30;">
      <div style="font-size:10px;color:${PEDAL_HEX[pedal]};letter-spacing:1px;margin-bottom:6px;">${(PEDAL_LABELS[pedal] || pedal).toUpperCase()}</div>
      <div style="font-size:24px;font-weight:700;color:${PEDAL_HEX[pedal]}">${pAvg}%</div>
      <div style="font-size:10px;color:#666;margin-top:4px;">${entries.length} tentativas · melhor ${pBest}%</div>
      <div style="height:3px;background:#0d0d0d;border-radius:2px;margin-top:8px;overflow:hidden;">
        <div style="width:${pAvg}%;height:100%;background:${PEDAL_HEX[pedal]};border-radius:2px;"></div>
      </div>
    </div>`;
  }).join('');

  // Coaching tips
  const tipsHtml = (insights?.tips || []).map(tip => {
    const icons = { warning: '⚠️', info: '💡', success: '✓' };
    const colors = { warning: '#ffa502', info: '#3b82f6', success: '#2ed573' };
    return `<div style="display:flex;gap:10px;align-items:flex-start;padding:10px 14px;background:${colors[tip.type]}10;border-radius:8px;border:1px solid ${colors[tip.type]}20;margin-bottom:6px;">
      <span style="font-size:14px;">${icons[tip.type] || '💡'}</span>
      <span style="font-size:12px;color:#ccc;line-height:1.5;">${tip.text}</span>
    </div>`;
  }).join('');

  // Score history sparkline
  const scoresReversed = [...allScores].reverse();
  const sparkHtml = miniSpark(scoresReversed, '#3b82f6', 600, 60);

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Brake Trainer — Relatório de Sessão</title>
<link href="https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700&family=Barlow:wght@400;500&family=Barlow+Condensed:wght@400;500&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Barlow', sans-serif; background: #0a0c10; color: #e8eaf0; padding: 40px; max-width: 800px; margin: 0 auto; }
  h1 { font-family: 'Oxanium', monospace; font-size: 28px; font-weight: 700; margin-bottom: 4px; }
  h2 { font-family: 'Oxanium', monospace; font-size: 16px; font-weight: 600; color: #7a8194; margin: 28px 0 12px; letter-spacing: 1px; }
  .subtitle { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; color: #4a5068; letter-spacing: 1px; }
  .grade-circle { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Oxanium', monospace; font-size: 30px; font-weight: 700; }
  .stat-box { background: #12151c; border: 1px solid #252a38; border-radius: 10px; padding: 14px; flex: 1; min-width: 120px; }
  .stat-label { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; color: #4a5068; letter-spacing: 1px; margin-bottom: 4px; }
  .stat-value { font-family: 'Oxanium', monospace; font-size: 22px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; color: #4a5068; letter-spacing: 1px; text-align: left; padding: 8px 10px; border-bottom: 1px solid #252a38; }
  @media print {
    body { background: #0a0c10 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style></head><body>

<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
  <div>
    <h1>BRAKE <span style="color:#ff4757;font-weight:300;">TRAINER</span></h1>
    <div class="subtitle">RELATÓRIO DE SESSÃO · ${dateStr} · ${timeStr}</div>
  </div>
  <div class="grade-circle" style="border:2px solid ${gradeColor(avg)};color:${gradeColor(avg)};box-shadow:0 0 20px ${gradeColor(avg)}30;">${grade}</div>
</div>

<div style="display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap;">
  <div class="stat-box"><div class="stat-label">MÉDIA GERAL</div><div class="stat-value" style="color:${gradeColor(avg)}">${avg}%</div></div>
  <div class="stat-box"><div class="stat-label">MELHOR SCORE</div><div class="stat-value" style="color:#2ed573">${best}%</div></div>
  <div class="stat-box"><div class="stat-label">TOTAL TENTATIVAS</div><div class="stat-value" style="color:#3b82f6">${sessionHistory.length}</div></div>
  <div class="stat-box"><div class="stat-label">EXERCÍCIOS</div><div class="stat-value" style="color:#a855f7">${Object.keys(byExercise).length}</div></div>
</div>

<h2>EVOLUÇÃO</h2>
<div style="background:#12151c;border:1px solid #252a38;border-radius:10px;padding:16px;">
  ${sparkHtml}
</div>

<h2>DESEMPENHO POR TIPO</h2>
<div style="display:flex;gap:10px;flex-wrap:wrap;">
  ${pedalCards}
</div>

<h2>DETALHAMENTO POR EXERCÍCIO</h2>
<div style="background:#12151c;border:1px solid #252a38;border-radius:10px;overflow:hidden;">
  <table>
    <thead><tr><th>EXERCÍCIO</th><th style="text-align:center;">TENTATIVAS</th><th style="text-align:center;">MÉDIA</th><th style="text-align:center;">MELHOR</th><th style="text-align:center;">TENDÊNCIA</th></tr></thead>
    <tbody>${exRows}</tbody>
  </table>
</div>

${tipsHtml ? `<h2>COACHING</h2><div>${tipsHtml}</div>` : ''}

<div style="margin-top:32px;padding-top:16px;border-top:1px solid #252a38;font-size:10px;color:#4a5068;text-align:center;letter-spacing:1px;">
  BRAKE TRAINER · GERADO EM ${dateStr} ÀS ${timeStr}
</div>

</body></html>`;

  // Open in new window and trigger print
  const printWindow = window.open('', '_blank', 'width=850,height=1100');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
}
