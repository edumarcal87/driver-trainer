/**
 * Generate a shareable result card as PNG matching the app's light theme.
 * Cream bg (#f0efe8), white cards, Oxanium/Barlow fonts, colored accents.
 */

export async function generateShareCard({
  exerciseName,
  score,
  grade,
  best,
  attempts,
  segments,
  carProfile,
  trend,
  isNewBest,
}) {
  const W = 600, H = 360;
  const canvas = document.createElement('canvas');
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  // Theme colors
  const bgPage = '#f0efe8';
  const bgCard = '#ffffff';
  const bgInset = '#f5f4ef';
  const textPrimary = '#1a1a1a';
  const textSecondary = '#5a5a5a';
  const textMuted = '#9a9a90';
  const border = '#e0dfd8';
  const accent = score >= 80 ? '#27ae60' : score >= 50 ? '#f39c12' : '#e74c3c';
  const gradeColors = { S: '#f1c40f', A: '#27ae60', B: '#2980b9', C: '#f39c12', D: '#e74c3c' };
  const gradeColor = gradeColors[grade] || textMuted;

  // Background
  ctx.fillStyle = bgPage;
  rr(ctx, 0, 0, W, H, 20); ctx.fill();

  // White card
  ctx.fillStyle = bgCard;
  ctx.shadowColor = 'rgba(0,0,0,0.06)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 2;
  rr(ctx, 16, 16, W - 32, H - 32, 16); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = border;
  ctx.lineWidth = 1.5;
  rr(ctx, 16, 16, W - 32, H - 32, 16); ctx.stroke();

  // Top accent
  ctx.fillStyle = accent;
  rr(ctx, 16, 16, W - 32, 4, 0); ctx.fill();

  // ── Logo ──
  ctx.strokeStyle = '#e74c3c';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(38, 52);
  ctx.quadraticCurveTo(42, 35, 48, 38);
  ctx.quadraticCurveTo(53, 42, 56, 37);
  ctx.quadraticCurveTo(59, 33, 62, 30);
  ctx.stroke();
  ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.arc(38, 52, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#27ae60'; ctx.beginPath(); ctx.arc(53, 39, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f39c12'; ctx.beginPath(); ctx.arc(62, 30, 1.8, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = textPrimary;
  ctx.font = '700 16px Oxanium, sans-serif';
  ctx.fillText('DRIVER', 72, 40);
  const dw = ctx.measureText('DRIVER').width;
  ctx.fillStyle = '#e74c3c';
  ctx.font = '300 16px Oxanium, sans-serif';
  ctx.fillText('TRAINER', 72 + dw + 5, 40);
  ctx.fillStyle = textMuted;
  ctx.font = '500 8px "Barlow Condensed", sans-serif';
  ctx.fillText('DO PEDAL AO PÓDIO', 72, 52);

  // ── Car profile (top right) ──
  if (carProfile && carProfile.id !== 'default') {
    const label = `${carProfile.icon} ${carProfile.name}`;
    ctx.font = '600 11px "Barlow Condensed", sans-serif';
    const bw = ctx.measureText(label).width + 18;
    const bx = W - 32 - bw;
    ctx.fillStyle = carProfile.color + '12';
    rr(ctx, bx, 28, bw, 24, 10); ctx.fill();
    ctx.strokeStyle = carProfile.color + '30';
    ctx.lineWidth = 1;
    rr(ctx, bx, 28, bw, 24, 10); ctx.stroke();
    ctx.fillStyle = carProfile.color;
    ctx.fillText(label, bx + 9, 44);
  }

  // Divider
  ctx.strokeStyle = border; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(32, 66); ctx.lineTo(W - 32, 66); ctx.stroke();

  // ── Exercise name ──
  ctx.fillStyle = textPrimary;
  ctx.font = '600 14px Oxanium, sans-serif';
  const name = exerciseName.length > 45 ? exerciseName.substring(0, 45) + '...' : exerciseName;
  ctx.fillText(name, 32, 88);

  // ── Score ring ──
  const rx = 85, ry = 175, rR = 48;
  ctx.strokeStyle = bgInset; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(rx, ry, rR, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = accent; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(rx, ry, rR, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * score / 100));
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = textPrimary;
  ctx.font = '700 30px Oxanium, sans-serif';
  ctx.fillText(`${score}%`, rx, ry + 8);
  ctx.fillStyle = textMuted;
  ctx.font = '500 9px "Barlow Condensed", sans-serif';
  ctx.fillText('PONTUAÇÃO', rx, ry + 22);
  ctx.textAlign = 'left';

  // ── Grade badge ──
  const gx = rx + 68, gy = ry - 24;
  ctx.fillStyle = gradeColor + '15';
  rr(ctx, gx, gy, 44, 44, 12); ctx.fill();
  ctx.strokeStyle = gradeColor + '30'; ctx.lineWidth = 1.5;
  rr(ctx, gx, gy, 44, 44, 12); ctx.stroke();
  ctx.fillStyle = gradeColor;
  ctx.font = '700 26px Oxanium, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(grade, gx + 22, gy + 31);
  ctx.textAlign = 'left';

  // ── Stats ──
  const sx = 210;
  const stats = [
    { label: 'MELHOR', value: `${best}%`, color: '#27ae60' },
    { label: 'TENTATIVAS', value: `${attempts}`, color: textPrimary },
  ];
  if (trend && trend !== 0) {
    stats.push({ label: 'TENDÊNCIA', value: `${trend > 0 ? '+' : ''}${trend}%`, color: trend > 0 ? '#27ae60' : '#e74c3c' });
  }
  stats.forEach((stat, i) => {
    const sy = 108 + i * 42;
    ctx.fillStyle = bgInset;
    rr(ctx, sx, sy, 150, 34, 10); ctx.fill();
    ctx.strokeStyle = border; ctx.lineWidth = 1;
    rr(ctx, sx, sy, 150, 34, 10); ctx.stroke();
    ctx.fillStyle = textMuted;
    ctx.font = '600 8px "Barlow Condensed", sans-serif';
    ctx.fillText(stat.label, sx + 12, sy + 14);
    ctx.fillStyle = stat.color;
    ctx.font = '700 14px Oxanium, sans-serif';
    ctx.fillText(stat.value, sx + 12, sy + 28);
  });
  if (isNewBest) {
    const ny = 108 + stats.length * 42 + 6;
    ctx.fillStyle = '#f1c40f12';
    rr(ctx, sx, ny, 150, 24, 8); ctx.fill();
    ctx.strokeStyle = '#f1c40f30'; ctx.lineWidth = 1;
    rr(ctx, sx, ny, 150, 24, 8); ctx.stroke();
    ctx.fillStyle = '#b7950b';
    ctx.font = '700 9px "Barlow Condensed", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 NOVO RECORDE PESSOAL!', sx + 75, ny + 16);
    ctx.textAlign = 'left';
  }

  // ── Segments ──
  if (segments && segments.length > 0) {
    const segX = 390, segW = 170;
    ctx.fillStyle = textMuted;
    ctx.font = '600 9px "Barlow Condensed", sans-serif';
    ctx.fillText('SEGMENTOS', segX, 118);
    segments.forEach((seg, i) => {
      const sy = 128 + i * 38;
      ctx.fillStyle = textSecondary;
      ctx.font = '500 11px Barlow, sans-serif';
      ctx.fillText(seg.label, segX, sy + 12);
      const sc = seg.score >= 80 ? '#27ae60' : seg.score >= 50 ? '#f39c12' : '#e74c3c';
      ctx.fillStyle = sc;
      ctx.font = '700 11px Oxanium, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${seg.score}%`, segX + segW, sy + 12);
      ctx.textAlign = 'left';
      ctx.fillStyle = bgInset;
      rr(ctx, segX, sy + 18, segW, 6, 3); ctx.fill();
      ctx.fillStyle = sc;
      rr(ctx, segX, sy + 18, Math.max(4, segW * seg.score / 100), 6, 3); ctx.fill();
    });
  }

  // ── Footer ──
  ctx.strokeStyle = border; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(32, H - 48); ctx.lineTo(W - 32, H - 48); ctx.stroke();
  ctx.fillStyle = textMuted;
  ctx.font = '400 9px Barlow, sans-serif';
  ctx.fillText('edumarcal87.github.io/driver-trainer', 32, H - 28);
  ctx.textAlign = 'right';
  const now = new Date();
  ctx.fillText(`${now.toLocaleDateString('pt-BR')} · ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, W - 32, H - 28);
  ctx.textAlign = 'left';

  return new Promise(resolve => { canvas.toBlob(blob => resolve(blob), 'image/png'); });
}

export async function downloadShareCard(data) {
  const blob = await generateShareCard(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `driver-trainer-${data.score}pct-${Date.now()}.png`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function shareResult(data) {
  const blob = await generateShareCard(data);
  const file = new File([blob], `driver-trainer-${data.score}pct.png`, { type: 'image/png' });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: 'Driver Trainer',
        text: `Fiz ${data.score}% no ${data.exerciseName}! 🏎️ #DriverTrainer`,
        files: [file],
      });
      return true;
    } catch { /* cancelled */ }
  }
  await downloadShareCard(data);
  return false;
}

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
