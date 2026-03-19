/**
 * Share Card Generator — matches Driver Trainer's light theme exactly.
 * Colors from index.css: bg #f0efe8, card #ffffff, border #e0dfd8, etc.
 * Fonts: Oxanium (display), Barlow (body), Barlow Condensed (labels)
 */

// ── Shared helpers ──
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const THEME = {
  bgPage: '#f0efe8', bgCard: '#ffffff', bgInset: '#f5f4ef',
  text: '#1a1a1a', textSec: '#5a5a5a', textMuted: '#9a9a90',
  border: '#e0dfd8', brake: '#e74c3c', throttle: '#27ae60', clutch: '#f39c12', steering: '#2980b9',
  gradeColors: { S: '#f1c40f', A: '#27ae60', B: '#2980b9', C: '#f39c12', D: '#e74c3c' },
};

function drawLogo(ctx, x, y) {
  ctx.save();
  // Telemetry curve icon
  ctx.strokeStyle = THEME.brake; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y + 14); ctx.quadraticCurveTo(x + 4, y, x + 10, y + 4);
  ctx.quadraticCurveTo(x + 15, y + 8, x + 18, y + 3); ctx.quadraticCurveTo(x + 21, y - 1, x + 24, y - 4);
  ctx.stroke();
  ctx.fillStyle = THEME.brake; ctx.beginPath(); ctx.arc(x, y + 14, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = THEME.throttle; ctx.beginPath(); ctx.arc(x + 15, y + 5, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = THEME.clutch; ctx.beginPath(); ctx.arc(x + 24, y - 4, 1.8, 0, Math.PI * 2); ctx.fill();
  // Text
  ctx.fillStyle = THEME.text; ctx.font = '700 15px Oxanium, sans-serif';
  ctx.fillText('DRIVER', x + 34, y + 6);
  const dw = ctx.measureText('DRIVER').width;
  ctx.fillStyle = THEME.brake; ctx.font = '300 15px Oxanium, sans-serif';
  ctx.fillText('TRAINER', x + 34 + dw + 4, y + 6);
  ctx.fillStyle = THEME.textMuted; ctx.font = '500 7px "Barlow Condensed", sans-serif';
  ctx.fillText('DO PEDAL AO PÓDIO', x + 34, y + 17);
  ctx.restore();
}

function drawScoreRing(ctx, x, y, r, score, accent) {
  ctx.strokeStyle = THEME.bgInset; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = accent; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * score / 100)); ctx.stroke();
  ctx.textAlign = 'center'; ctx.fillStyle = THEME.text;
  ctx.font = '700 28px Oxanium, sans-serif'; ctx.fillText(`${score}%`, x, y + 7);
  ctx.textAlign = 'left';
}

function drawGrade(ctx, x, y, grade) {
  const gc = THEME.gradeColors[grade] || THEME.textMuted;
  ctx.fillStyle = gc + '15'; rr(ctx, x, y, 42, 42, 10); ctx.fill();
  ctx.strokeStyle = gc + '30'; ctx.lineWidth = 1.5; rr(ctx, x, y, 42, 42, 10); ctx.stroke();
  ctx.fillStyle = gc; ctx.font = '700 24px Oxanium, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText(grade, x + 21, y + 29); ctx.textAlign = 'left';
}

function drawFooter(ctx, W, H) {
  ctx.strokeStyle = THEME.border; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(28, H - 42); ctx.lineTo(W - 28, H - 42); ctx.stroke();
  ctx.fillStyle = THEME.textMuted; ctx.font = '400 9px Barlow, sans-serif';
  ctx.fillText('drivertrainer.com.br', 28, H - 22);
  ctx.textAlign = 'right';
  const now = new Date();
  ctx.fillText(`${now.toLocaleDateString('pt-BR')} · ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, W - 28, H - 22);
  ctx.textAlign = 'left';
}

function drawProfileBadge(ctx, W, carProfile) {
  if (!carProfile || carProfile.id === 'default') return;
  const label = `${carProfile.icon} ${carProfile.name}`;
  ctx.font = '600 10px "Barlow Condensed", sans-serif';
  const bw = ctx.measureText(label).width + 16;
  const bx = W - 28 - bw;
  ctx.fillStyle = carProfile.color + '12'; rr(ctx, bx, 24, bw, 22, 10); ctx.fill();
  ctx.strokeStyle = carProfile.color + '30'; ctx.lineWidth = 1; rr(ctx, bx, 24, bw, 22, 10); ctx.stroke();
  ctx.fillStyle = carProfile.color; ctx.fillText(label, bx + 8, 39);
}

function drawStat(ctx, x, y, w, label, value, color) {
  ctx.fillStyle = THEME.bgInset; rr(ctx, x, y, w, 32, 8); ctx.fill();
  ctx.strokeStyle = THEME.border; ctx.lineWidth = 1; rr(ctx, x, y, w, 32, 8); ctx.stroke();
  ctx.fillStyle = THEME.textMuted; ctx.font = '600 7px "Barlow Condensed", sans-serif'; ctx.fillText(label, x + 10, y + 13);
  ctx.fillStyle = color; ctx.font = '700 13px Oxanium, sans-serif'; ctx.fillText(value, x + 10, y + 27);
}

// ════════════════════════════════════
// EXERCISE RESULT CARD
// ════════════════════════════════════
export async function generateShareCard({ exerciseName, score, grade, best, attempts, segments, carProfile, trend, isNewBest }) {
  const W = 560, H = 320;
  const canvas = document.createElement('canvas');
  canvas.width = W * 2; canvas.height = H * 2;
  const ctx = canvas.getContext('2d'); ctx.scale(2, 2);

  const accent = score >= 80 ? THEME.throttle : score >= 50 ? THEME.clutch : THEME.brake;

  // Background + card
  ctx.fillStyle = THEME.bgPage; rr(ctx, 0, 0, W, H, 16); ctx.fill();
  ctx.fillStyle = THEME.bgCard;
  ctx.shadowColor = 'rgba(0,0,0,0.06)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 2;
  rr(ctx, 14, 14, W - 28, H - 28, 14); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = THEME.border; ctx.lineWidth = 1.5; rr(ctx, 14, 14, W - 28, H - 28, 14); ctx.stroke();
  ctx.fillStyle = accent; ctx.fillRect(14, 14, W - 28, 3);

  // Logo + profile badge
  drawLogo(ctx, 34, 38);
  drawProfileBadge(ctx, W, carProfile);

  // Divider
  ctx.strokeStyle = THEME.border; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(28, 62); ctx.lineTo(W - 28, 62); ctx.stroke();

  // Exercise name
  ctx.fillStyle = THEME.text; ctx.font = '600 13px Oxanium, sans-serif';
  ctx.fillText(exerciseName.length > 42 ? exerciseName.substring(0, 42) + '…' : exerciseName, 28, 82);

  // Score ring + grade
  drawScoreRing(ctx, 78, 155, 42, score, accent);
  ctx.fillStyle = THEME.textMuted; ctx.font = '500 8px "Barlow Condensed", sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('PONTUAÇÃO', 78, 172); ctx.textAlign = 'left';
  drawGrade(ctx, 138, 134, grade);

  // Stats
  const sx = 200;
  drawStat(ctx, sx, 96, 135, 'MELHOR', `${best}%`, THEME.throttle);
  drawStat(ctx, sx, 134, 135, 'TENTATIVAS', `${attempts}`, THEME.text);
  if (trend && trend !== 0) {
    drawStat(ctx, sx, 172, 135, 'TENDÊNCIA', `${trend > 0 ? '+' : ''}${trend}%`, trend > 0 ? THEME.throttle : THEME.brake);
  }

  // New best badge
  if (isNewBest) {
    const ny = trend ? 212 : 172;
    ctx.fillStyle = '#f1c40f12'; rr(ctx, sx, ny, 135, 22, 8); ctx.fill();
    ctx.fillStyle = '#b7950b'; ctx.font = '700 8px "Barlow Condensed", sans-serif';
    ctx.textAlign = 'center'; ctx.fillText('🏆 NOVO RECORDE!', sx + 67, ny + 15); ctx.textAlign = 'left';
  }

  // Segments
  if (segments && segments.length > 0) {
    const segX = 360, segW = 165;
    ctx.fillStyle = THEME.textMuted; ctx.font = '600 8px "Barlow Condensed", sans-serif';
    ctx.fillText('SEGMENTOS', segX, 108);
    segments.forEach((seg, i) => {
      const sy = 116 + i * 34;
      ctx.fillStyle = THEME.textSec; ctx.font = '500 10px Barlow, sans-serif'; ctx.fillText(seg.label, segX, sy + 10);
      const sc = seg.score >= 80 ? THEME.throttle : seg.score >= 50 ? THEME.clutch : THEME.brake;
      ctx.fillStyle = sc; ctx.font = '700 10px Oxanium, sans-serif';
      ctx.textAlign = 'right'; ctx.fillText(`${seg.score}%`, segX + segW, sy + 10); ctx.textAlign = 'left';
      ctx.fillStyle = THEME.bgInset; rr(ctx, segX, sy + 15, segW, 5, 2.5); ctx.fill();
      ctx.fillStyle = sc; rr(ctx, segX, sy + 15, Math.max(3, segW * seg.score / 100), 5, 2.5); ctx.fill();
    });
  }

  drawFooter(ctx, W, H);
  return new Promise(resolve => canvas.toBlob(blob => resolve(blob), 'image/png'));
}

// ════════════════════════════════════
// SESSION EVOLUTION CARD
// ════════════════════════════════════
export async function generateSessionCard({ avg, best, grade, totalAttempts, totalExercises, topExercises, carProfile }) {
  const W = 560, H = 340;
  const canvas = document.createElement('canvas');
  canvas.width = W * 2; canvas.height = H * 2;
  const ctx = canvas.getContext('2d'); ctx.scale(2, 2);

  const accent = avg >= 80 ? THEME.throttle : avg >= 50 ? THEME.clutch : THEME.brake;

  // Background + card
  ctx.fillStyle = THEME.bgPage; rr(ctx, 0, 0, W, H, 16); ctx.fill();
  ctx.fillStyle = THEME.bgCard;
  ctx.shadowColor = 'rgba(0,0,0,0.06)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 2;
  rr(ctx, 14, 14, W - 28, H - 28, 14); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = THEME.border; ctx.lineWidth = 1.5; rr(ctx, 14, 14, W - 28, H - 28, 14); ctx.stroke();
  ctx.fillStyle = accent; ctx.fillRect(14, 14, W - 28, 3);

  drawLogo(ctx, 34, 38);
  drawProfileBadge(ctx, W, carProfile);

  ctx.strokeStyle = THEME.border; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(28, 62); ctx.lineTo(W - 28, 62); ctx.stroke();

  // Title
  ctx.fillStyle = THEME.textMuted; ctx.font = '600 9px "Barlow Condensed", sans-serif';
  ctx.fillText('RESUMO DE EVOLUÇÃO', 28, 80);

  // Score ring + grade
  drawScoreRing(ctx, 78, 148, 40, avg, accent);
  ctx.fillStyle = THEME.textMuted; ctx.font = '500 8px "Barlow Condensed", sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('MÉDIA GERAL', 78, 164); ctx.textAlign = 'left';
  drawGrade(ctx, 136, 128, grade);

  // Stats
  const sx = 196;
  drawStat(ctx, sx, 92, 130, 'MELHOR SCORE', `${best}%`, THEME.throttle);
  drawStat(ctx, sx, 128, 130, 'TREINOS', `${totalAttempts}`, THEME.text);
  drawStat(ctx, sx, 164, 130, 'EXERCÍCIOS', `${totalExercises}`, THEME.text);

  // Top exercises
  if (topExercises && topExercises.length > 0) {
    const tx = 350, tw = 180;
    ctx.fillStyle = THEME.textMuted; ctx.font = '600 8px "Barlow Condensed", sans-serif';
    ctx.fillText('TOP EXERCÍCIOS', tx, 104);
    topExercises.slice(0, 5).forEach((ex, i) => {
      const ey = 112 + i * 30;
      const ec = ex.avg >= 80 ? THEME.throttle : ex.avg >= 50 ? THEME.clutch : THEME.brake;
      ctx.fillStyle = THEME.textSec; ctx.font = '500 10px Barlow, sans-serif';
      ctx.fillText(ex.name.length > 20 ? ex.name.substring(0, 20) + '…' : ex.name, tx, ey + 10);
      ctx.fillStyle = ec; ctx.font = '700 10px Oxanium, sans-serif';
      ctx.textAlign = 'right'; ctx.fillText(`${ex.avg}%`, tx + tw, ey + 10); ctx.textAlign = 'left';
      ctx.fillStyle = THEME.bgInset; rr(ctx, tx, ey + 14, tw, 4, 2); ctx.fill();
      ctx.fillStyle = ec; rr(ctx, tx, ey + 14, Math.max(3, tw * ex.avg / 100), 4, 2); ctx.fill();
    });
  }

  drawFooter(ctx, W, H);
  return new Promise(resolve => canvas.toBlob(blob => resolve(blob), 'image/png'));
}

// ════════════════════════════════════
// SHARE / DOWNLOAD FUNCTIONS
// ════════════════════════════════════
export async function downloadShareCard(data) {
  const blob = await generateShareCard(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `driver-trainer-${data.score}pct-${Date.now()}.png`;
  a.click(); URL.revokeObjectURL(url);
}

export async function shareResult(data) {
  const blob = await generateShareCard(data);
  const file = new File([blob], `driver-trainer-${data.score}pct.png`, { type: 'image/png' });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ title: 'Driver Trainer', text: `Fiz ${data.score}% no ${data.exerciseName}! 🏎️ #DriverTrainer`, files: [file] });
      return true;
    } catch { /* cancelled */ }
  }
  await downloadShareCard(data);
  return false;
}

export async function shareSessionResult(data) {
  const blob = await generateSessionCard(data);
  const file = new File([blob], `driver-trainer-evolucao-${Date.now()}.png`, { type: 'image/png' });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ title: 'Driver Trainer — Evolução', text: `Minha evolução: média ${data.avg}%, nota ${data.grade}! 🏎️ #DriverTrainer`, files: [file] });
      return true;
    } catch { /* cancelled */ }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `driver-trainer-evolucao-${Date.now()}.png`;
  a.click(); URL.revokeObjectURL(url);
  return false;
}
