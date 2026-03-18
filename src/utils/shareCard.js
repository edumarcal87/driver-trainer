/**
 * Generate a shareable result card as a PNG image using Canvas API.
 * Returns a Blob that can be downloaded or shared via Web Share API.
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
  const W = 600, H = 340;
  const canvas = document.createElement('canvas');
  canvas.width = W * 2; // 2x for retina
  canvas.height = H * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  // Colors
  const bg = '#1a1a2e';
  const bgCard = '#16213e';
  const accent = score >= 80 ? '#27ae60' : score >= 50 ? '#f39c12' : '#e74c3c';
  const textWhite = '#eaeaea';
  const textMuted = '#8892a4';
  const textDim = '#5a6478';
  const border = '#2a3555';

  // Background
  ctx.fillStyle = bg;
  roundRect(ctx, 0, 0, W, H, 16);
  ctx.fill();

  // Subtle gradient overlay
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, accent + '08');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Top border accent
  ctx.fillStyle = accent;
  roundRect(ctx, 0, 0, W, 4, 0);
  ctx.fill();

  // ── Logo area (top left) ──
  ctx.fillStyle = textWhite;
  ctx.font = '700 18px "Oxanium", sans-serif';
  ctx.fillText('DRIVER', 24, 36);
  ctx.fillStyle = '#e74c3c';
  ctx.font = '300 18px "Oxanium", sans-serif';
  ctx.fillText('TRAINER', 24 + measureText(ctx, 'DRIVER', '700 18px "Oxanium", sans-serif') + 6, 36);

  ctx.fillStyle = textDim;
  ctx.font = '500 8px "Barlow Condensed", sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('DO PEDAL AO PÓDIO', 24, 50);

  // ── Car profile badge (top right) ──
  if (carProfile && carProfile.id !== 'default') {
    const badgeText = `${carProfile.icon} ${carProfile.name}`;
    ctx.font = '600 11px "Barlow Condensed", sans-serif';
    const bw = ctx.measureText(badgeText).width + 20;
    ctx.fillStyle = carProfile.color + '25';
    roundRect(ctx, W - bw - 24, 22, bw, 24, 12);
    ctx.fill();
    ctx.strokeStyle = carProfile.color + '40';
    ctx.lineWidth = 1;
    roundRect(ctx, W - bw - 24, 22, bw, 24, 12);
    ctx.stroke();
    ctx.fillStyle = carProfile.color;
    ctx.fillText(badgeText, W - bw - 14, 39);
  }

  // ── Divider ──
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, 64);
  ctx.lineTo(W - 24, 64);
  ctx.stroke();

  // ── Exercise name ──
  ctx.fillStyle = textWhite;
  ctx.font = '600 15px "Oxanium", sans-serif';
  const nameText = exerciseName.length > 40 ? exerciseName.substring(0, 40) + '...' : exerciseName;
  ctx.fillText(nameText, 24, 88);

  // ── Main score ──
  // Score ring
  const ringX = 80, ringY = 170, ringR = 50;
  ctx.strokeStyle = border;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(ringX, ringY, ringR, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = accent;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(ringX, ringY, ringR, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * score / 100));
  ctx.stroke();

  ctx.fillStyle = textWhite;
  ctx.font = '700 32px "Oxanium", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${score}%`, ringX, ringY + 8);
  ctx.font = '400 10px "Barlow Condensed", sans-serif';
  ctx.fillStyle = textMuted;
  ctx.fillText('SCORE', ringX, ringY + 24);
  ctx.textAlign = 'left';

  // ── Grade badge ──
  const gradeColors = { S: '#f1c40f', A: '#27ae60', B: '#2980b9', C: '#f39c12', D: '#e74c3c' };
  const gradeColor = gradeColors[grade] || textMuted;
  ctx.fillStyle = gradeColor + '20';
  roundRect(ctx, ringX + 75, ringY - 30, 50, 50, 12);
  ctx.fill();
  ctx.strokeStyle = gradeColor + '50';
  ctx.lineWidth = 1.5;
  roundRect(ctx, ringX + 75, ringY - 30, 50, 50, 12);
  ctx.stroke();
  ctx.fillStyle = gradeColor;
  ctx.font = '700 28px "Oxanium", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(grade, ringX + 100, ringY + 6);
  ctx.textAlign = 'left';

  // ── Stats column ──
  const statsX = 210;
  const statItems = [
    { label: 'MELHOR', value: `${best}%`, color: '#27ae60' },
    { label: 'TENTATIVAS', value: `${attempts}`, color: textWhite },
  ];

  if (trend && trend !== 0) {
    statItems.push({
      label: 'TENDÊNCIA',
      value: `${trend > 0 ? '+' : ''}${trend}%`,
      color: trend > 0 ? '#27ae60' : '#e74c3c',
    });
  }

  statItems.forEach((stat, i) => {
    const sy = 120 + i * 44;
    ctx.fillStyle = bgCard;
    roundRect(ctx, statsX, sy, 160, 36, 8);
    ctx.fill();
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    roundRect(ctx, statsX, sy, 160, 36, 8);
    ctx.stroke();

    ctx.fillStyle = textDim;
    ctx.font = '500 9px "Barlow Condensed", sans-serif';
    ctx.fillText(stat.label, statsX + 12, sy + 15);
    ctx.fillStyle = stat.color;
    ctx.font = '700 14px "Oxanium", sans-serif';
    ctx.fillText(stat.value, statsX + 12, sy + 30);
  });

  // ── New best badge ──
  if (isNewBest) {
    ctx.fillStyle = '#f1c40f15';
    roundRect(ctx, statsX, 120 + statItems.length * 44 + 4, 160, 26, 8);
    ctx.fill();
    ctx.fillStyle = '#f1c40f';
    ctx.font = '700 10px "Barlow Condensed", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 NOVO RECORDE PESSOAL!', statsX + 80, 120 + statItems.length * 44 + 21);
    ctx.textAlign = 'left';
  }

  // ── Segments bar (right side) ──
  if (segments && segments.length > 0) {
    const segX = 400, segW = 170;
    ctx.fillStyle = textDim;
    ctx.font = '600 9px "Barlow Condensed", sans-serif';
    ctx.fillText('SEGMENTOS', segX, 118);

    segments.forEach((seg, i) => {
      const sy = 128 + i * 34;
      // Label
      ctx.fillStyle = textMuted;
      ctx.font = '500 10px "Barlow", sans-serif';
      ctx.fillText(seg.label, segX, sy + 12);
      // Bar bg
      ctx.fillStyle = border;
      roundRect(ctx, segX, sy + 17, segW, 6, 3);
      ctx.fill();
      // Bar fill
      const segColor = seg.score >= 80 ? '#27ae60' : seg.score >= 50 ? '#f39c12' : '#e74c3c';
      ctx.fillStyle = segColor;
      roundRect(ctx, segX, sy + 17, segW * (seg.score / 100), 6, 3);
      ctx.fill();
      // Score
      ctx.fillStyle = segColor;
      ctx.font = '700 10px "Oxanium", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${seg.score}%`, segX + segW, sy + 12);
      ctx.textAlign = 'left';
    });
  }

  // ── Footer ──
  ctx.fillStyle = border;
  ctx.beginPath();
  ctx.moveTo(24, H - 44);
  ctx.lineTo(W - 24, H - 44);
  ctx.stroke();

  ctx.fillStyle = textDim;
  ctx.font = '400 9px "Barlow", sans-serif';
  ctx.fillText('edumarcal87.github.io/driver-trainer', 24, H - 20);

  ctx.textAlign = 'right';
  ctx.fillStyle = textDim;
  ctx.font = '400 9px "Barlow", sans-serif';
  const now = new Date();
  ctx.fillText(`${now.toLocaleDateString('pt-BR')} · ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, W - 24, H - 20);
  ctx.textAlign = 'left';

  // Convert to blob
  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), 'image/png');
  });
}

/**
 * Download the share card as PNG.
 */
export async function downloadShareCard(data) {
  const blob = await generateShareCard(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `driver-trainer-${data.score}pct-${Date.now()}.png`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Share via Web Share API (mobile) or fallback to download.
 */
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
    } catch {
      // User cancelled or error — fallback to download
    }
  }
  // Fallback: download
  await downloadShareCard(data);
  return false;
}

// ── Helpers ──
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function measureText(ctx, text, font) {
  const prev = ctx.font;
  ctx.font = font;
  const w = ctx.measureText(text).width;
  ctx.font = prev;
  return w;
}
