/**
 * Generates a session report as a printable HTML page (light theme).
 */

const PEDAL_LABELS = { brake: 'Freio', throttle: 'Acelerador', clutch: 'Embreagem', steering: 'Volante', combined: 'Combinado' };
const PEDAL_HEX = { brake: '#e74c3c', throttle: '#27ae60', clutch: '#f39c12', steering: '#2980b9', combined: '#8e44ad' };

function gradeColor(s) { return s >= 80 ? '#27ae60' : s >= 50 ? '#f39c12' : '#e74c3c'; }
function gradeLabel(a) { return a >= 95 ? 'S' : a >= 85 ? 'A' : a >= 70 ? 'B' : a >= 50 ? 'C' : 'D'; }

function miniSpark(scores, color, w = 600, h = 50) {
  if (scores.length < 2) return '';
  const pts = scores.map((s, i) => `${(i / (scores.length - 1)) * w},${h - (s / 100) * h}`).join(' ');
  return `<svg width="${w}" height="${h}" style="display:block;margin:8px 0;"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/></svg>`;
}

export function exportSessionPDF(sessionHistory, insights) {
  if (!sessionHistory || sessionHistory.length === 0) return;

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const byPedal = {};
  for (const e of sessionHistory) { const p = e.pedal || 'brake'; if (!byPedal[p]) byPedal[p] = []; byPedal[p].push(e); }

  const byExercise = {};
  for (const e of sessionHistory) { if (!byExercise[e.exId]) byExercise[e.exId] = []; byExercise[e.exId].push(e); }

  const allScores = sessionHistory.map(e => e.score);
  const avg = Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length);
  const best = Math.max(...allScores);
  const grade = gradeLabel(avg);

  const exRows = Object.entries(byExercise).map(([id, entries]) => {
    const sc = entries.map(e => e.score);
    const exAvg = Math.round(sc.reduce((s, v) => s + v, 0) / sc.length);
    const exBest = Math.max(...sc);
    const trend = sc.length >= 2 ? sc[0] - sc[sc.length - 1] : 0;
    const pedal = entries[0].pedal || 'brake';
    return `<tr>
      <td style="padding:8px 10px;border-bottom:1px solid #e0dfd8;"><span style="color:${PEDAL_HEX[pedal]};font-size:10px;">●</span> ${entries[0].exName}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e0dfd8;text-align:center;">${entries.length}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e0dfd8;text-align:center;color:${gradeColor(exAvg)};font-weight:600;">${exAvg}%</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e0dfd8;text-align:center;color:${gradeColor(exBest)};font-weight:600;">${exBest}%</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e0dfd8;text-align:center;color:${trend >= 0 ? '#27ae60' : '#e74c3c'};font-weight:600;">${trend > 0 ? '+' : ''}${trend}</td>
    </tr>`;
  }).join('');

  const pedalCards = Object.entries(byPedal).map(([pedal, entries]) => {
    const sc = entries.map(e => e.score);
    const pAvg = Math.round(sc.reduce((s, v) => s + v, 0) / sc.length);
    const pBest = Math.max(...sc);
    return `<div style="flex:1;min-width:130px;background:#fff;border-radius:12px;padding:16px;border:1.5px solid ${PEDAL_HEX[pedal]}25;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
      <div style="font-size:10px;color:${PEDAL_HEX[pedal]};letter-spacing:1px;margin-bottom:6px;font-weight:600;">${(PEDAL_LABELS[pedal] || pedal).toUpperCase()}</div>
      <div style="font-size:26px;font-weight:700;color:${PEDAL_HEX[pedal]}">${pAvg}%</div>
      <div style="font-size:10px;color:#999;margin-top:4px;">${entries.length} tentativas · melhor ${pBest}%</div>
      <div style="height:4px;background:#f0efe8;border-radius:2px;margin-top:8px;overflow:hidden;">
        <div style="width:${pAvg}%;height:100%;background:${PEDAL_HEX[pedal]};border-radius:2px;"></div>
      </div>
    </div>`;
  }).join('');

  const tipsHtml = (insights?.tips || []).map(tip => {
    const icons = { warning: '⚠️', info: '💡', success: '✓' };
    const bg = { warning: '#fef5e1', info: '#e4f0f9', success: '#e6f5ec' };
    const tc = { warning: '#b7791f', info: '#1e6a9e', success: '#1e7a47' };
    return `<div style="display:flex;gap:10px;align-items:flex-start;padding:12px 16px;background:${bg[tip.type] || bg.info};border-radius:10px;border:1px solid ${tc[tip.type] || tc.info}15;margin-bottom:6px;">
      <span style="font-size:14px;">${icons[tip.type] || '💡'}</span>
      <span style="font-size:12px;color:${tc[tip.type] || tc.info};line-height:1.5;">${tip.text}</span>
    </div>`;
  }).join('');

  const sparkHtml = miniSpark([...allScores].reverse(), '#2980b9', 600, 50);

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Driver Trainer — Relatório de Sessão</title>
<link href="https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700&family=Barlow:wght@400;500&family=Barlow+Condensed:wght@400;500&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Barlow', sans-serif; background: #f0efe8; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; }
  h1 { font-family: 'Oxanium', monospace; font-size: 28px; font-weight: 700; margin-bottom: 4px; }
  h2 { font-family: 'Oxanium', monospace; font-size: 14px; font-weight: 600; color: #5a5a5a; margin: 28px 0 12px; letter-spacing: 1.5px; }
  .subtitle { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; color: #9a9a90; letter-spacing: 1px; }
  .grade { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Oxanium', monospace; font-size: 30px; font-weight: 700; }
  .stat { background: #fff; border: 1.5px solid #e0dfd8; border-radius: 12px; padding: 14px 16px; flex: 1; min-width: 120px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
  .stat-label { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; color: #9a9a90; letter-spacing: 1px; margin-bottom: 4px; }
  .stat-val { font-family: 'Oxanium', monospace; font-size: 22px; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; color: #9a9a90; letter-spacing: 1px; text-align: left; padding: 10px; border-bottom: 1.5px solid #e0dfd8; }
  @media print { body { background: #f0efe8 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body>

<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;">
  <div>
    <h1>DRIVER <span style="color:#e74c3c;font-weight:300;">TRAINER</span></h1>
    <div class="subtitle">RELATÓRIO DE SESSÃO · ${dateStr} · ${timeStr}</div>
  </div>
  <div class="grade" style="border:3px solid ${gradeColor(avg)};color:${gradeColor(avg)};box-shadow:0 2px 12px ${gradeColor(avg)}20;">${grade}</div>
</div>

<div style="display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap;">
  <div class="stat"><div class="stat-label">MÉDIA GERAL</div><div class="stat-val" style="color:${gradeColor(avg)}">${avg}%</div></div>
  <div class="stat"><div class="stat-label">MELHOR SCORE</div><div class="stat-val" style="color:#27ae60">${best}%</div></div>
  <div class="stat"><div class="stat-label">TENTATIVAS</div><div class="stat-val" style="color:#2980b9">${sessionHistory.length}</div></div>
  <div class="stat"><div class="stat-label">EXERCÍCIOS</div><div class="stat-val" style="color:#8e44ad">${Object.keys(byExercise).length}</div></div>
</div>

<h2>EVOLUÇÃO</h2>
<div style="background:#fff;border:1.5px solid #e0dfd8;border-radius:12px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.03);">
  ${sparkHtml}
</div>

<h2>DESEMPENHO POR TIPO</h2>
<div style="display:flex;gap:10px;flex-wrap:wrap;">
  ${pedalCards}
</div>

<h2>DETALHAMENTO POR EXERCÍCIO</h2>
<div style="background:#fff;border:1.5px solid #e0dfd8;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.03);">
  <table>
    <thead><tr><th>EXERCÍCIO</th><th style="text-align:center;">TENTATIVAS</th><th style="text-align:center;">MÉDIA</th><th style="text-align:center;">MELHOR</th><th style="text-align:center;">TENDÊNCIA</th></tr></thead>
    <tbody>${exRows}</tbody>
  </table>
</div>

${tipsHtml ? `<h2>COACHING</h2><div>${tipsHtml}</div>` : ''}

<div style="margin-top:32px;padding-top:16px;border-top:1.5px solid #e0dfd8;font-size:10px;color:#9a9a90;text-align:center;letter-spacing:1px;">
  DRIVER TRAINER · DO PEDAL AO PÓDIO · GERADO EM ${dateStr} ÀS ${timeStr}
</div>

</body></html>`;

  const w = window.open('', '_blank', 'width=850,height=1100');
  if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
}
