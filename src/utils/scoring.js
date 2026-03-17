import { TOLERANCE } from '../data/exercises';

export function makeCurvePoints(curve, n = 200) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n; pts.push({ t, v: curve(t) }); }
  return pts;
}

export function calcScore(targetPts, userPts) {
  if (userPts.length < 10) return 0;
  let total = 0;
  for (const u of userPts) {
    const closest = targetPts.reduce((c, p) => Math.abs(p.t - u.t) < Math.abs(c.t - u.t) ? p : c);
    total += Math.max(0, 1 - Math.abs(u.v - closest.v) / TOLERANCE);
  }
  return Math.round((total / userPts.length) * 100);
}

/**
 * Detailed segment-by-segment analysis for feedback.
 * Splits the exercise into segments and analyzes each.
 */
export function analyzePerformance(targetPts, userPts, exerciseName) {
  if (userPts.length < 10) return null;

  const SEGMENTS = [
    { key: 'attack', label: 'Ataque', range: [0, 0.25], desc: 'Início da pressão' },
    { key: 'peak', label: 'Pico', range: [0.25, 0.5], desc: 'Região de máxima pressão' },
    { key: 'modulation', label: 'Modulação', range: [0.5, 0.75], desc: 'Controle de pressão' },
    { key: 'release', label: 'Liberação', range: [0.75, 1.0], desc: 'Soltar o pedal' },
  ];

  const segments = SEGMENTS.map(seg => {
    const segUser = userPts.filter(p => p.t >= seg.range[0] && p.t < seg.range[1]);
    const segTarget = targetPts.filter(p => p.t >= seg.range[0] && p.t < seg.range[1]);
    if (segUser.length < 3 || segTarget.length < 3) return { ...seg, score: 0, avgError: 0, bias: 0 };

    let totalErr = 0, totalBias = 0, count = 0;
    for (const u of segUser) {
      const tv = segTarget.reduce((c, p) => Math.abs(p.t - u.t) < Math.abs(c.t - u.t) ? p : c).v;
      totalErr += Math.abs(u.v - tv);
      totalBias += u.v - tv; // positive = pressing too hard
      count++;
    }
    const avgError = count > 0 ? totalErr / count : 0;
    const bias = count > 0 ? totalBias / count : 0;
    const score = Math.round(Math.max(0, 1 - avgError / TOLERANCE) * 100);
    return { ...seg, score, avgError, bias };
  });

  // Timing analysis
  const targetPeakIdx = targetPts.reduce((best, p, i) => p.v > targetPts[best].v ? i : best, 0);
  const targetPeakT = targetPts[targetPeakIdx].t;
  const userPeakIdx = userPts.reduce((best, p, i) => p.v > userPts[best].v ? i : best, 0);
  const userPeakT = userPts[userPeakIdx].t;
  const peakTimingDelta = userPeakT - targetPeakT;

  // Overall consistency (std deviation of error)
  const errors = userPts.map(u => {
    const tv = targetPts.reduce((c, p) => Math.abs(p.t - u.t) < Math.abs(c.t - u.t) ? p : c).v;
    return u.v - tv;
  });
  const avgErr = errors.reduce((s, e) => s + e, 0) / errors.length;
  const variance = errors.reduce((s, e) => s + Math.pow(e - avgErr, 2), 0) / errors.length;
  const consistency = Math.max(0, Math.round((1 - Math.sqrt(variance) * 3) * 100));

  // Peak pressure accuracy
  const targetPeak = targetPts[targetPeakIdx].v;
  const userPeak = userPts[userPeakIdx].v;
  const peakAccuracy = Math.round(Math.max(0, 1 - Math.abs(userPeak - targetPeak) / 0.2) * 100);

  // Generate tips
  const tips = [];
  const worst = segments.reduce((w, s) => s.score < w.score ? s : w, segments[0]);

  if (worst.score < 60) {
    if (worst.bias > 0.05) tips.push({ type: 'warning', text: `${worst.label}: pressão excessiva — tente ser mais leve nesta fase.` });
    else if (worst.bias < -0.05) tips.push({ type: 'warning', text: `${worst.label}: pressão insuficiente — pise com mais firmeza.` });
    else tips.push({ type: 'warning', text: `${worst.label}: precisa de mais precisão nesta fase.` });
  }

  if (Math.abs(peakTimingDelta) > 0.08) {
    tips.push({
      type: 'info',
      text: peakTimingDelta > 0
        ? `Pico atrasado em ${Math.round(peakTimingDelta * 100)}% — tente atingir a pressão máxima mais cedo.`
        : `Pico adiantado em ${Math.round(Math.abs(peakTimingDelta) * 100)}% — segure um pouco mais antes do pico.`,
    });
  }

  if (consistency < 60) {
    tips.push({ type: 'info', text: 'Consistência baixa — tente manter um movimento mais fluido e previsível.' });
  }

  if (peakAccuracy < 70) {
    tips.push({
      type: 'info',
      text: userPeak > targetPeak
        ? `Pressão máxima ${Math.round((userPeak - targetPeak) * 100)}% acima do alvo — reduza a força de pico.`
        : `Pressão máxima ${Math.round((targetPeak - userPeak) * 100)}% abaixo do alvo — pise com mais força.`,
    });
  }

  if (tips.length === 0) {
    tips.push({ type: 'success', text: 'Excelente execução! Continue praticando para manter a consistência.' });
  }

  const overall = calcScore(targetPts, userPts);

  // Letter grade
  const grade = overall >= 95 ? 'S' : overall >= 85 ? 'A' : overall >= 70 ? 'B' : overall >= 50 ? 'C' : 'D';

  return {
    overall, grade, segments, tips,
    stats: { consistency, peakAccuracy, peakTimingDelta, targetPeak, userPeak },
  };
}

/**
 * Analyzes the full session history and generates coaching insights.
 * @param {Array} sessionHistory - Array of { exId, exName, pedal, score, analysis, timestamp }
 * @returns {object} Session insights with trends, weak points, and coaching tips
 */
export function analyzeSession(sessionHistory) {
  if (sessionHistory.length === 0) return null;

  // ── Per-exercise trends ──
  const byExercise = {};
  for (const entry of sessionHistory) {
    if (!byExercise[entry.exId]) byExercise[entry.exId] = [];
    byExercise[entry.exId].push(entry);
  }

  const exerciseTrends = Object.entries(byExercise).map(([exId, entries]) => {
    const scores = entries.map(e => e.score);
    const first = scores[scores.length - 1];
    const last = scores[0];
    const best = Math.max(...scores);
    const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    const trend = scores.length >= 2 ? last - first : 0;
    return { exId, name: entries[0].exName, pedal: entries[0].pedal, attempts: scores.length, first, last, best, avg, trend, scores };
  });

  // ── Per-pedal stats ──
  const byPedal = {};
  for (const entry of sessionHistory) {
    const p = entry.pedal || 'brake';
    if (!byPedal[p]) byPedal[p] = [];
    byPedal[p].push(entry);
  }
  const pedalStats = Object.entries(byPedal).map(([pedal, entries]) => {
    const scores = entries.map(e => e.score);
    const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    const best = Math.max(...scores);
    return { pedal, attempts: scores.length, avg, best };
  });

  // ── Recurring weak segments ──
  const segmentScores = { attack: [], peak: [], modulation: [], release: [] };
  for (const entry of sessionHistory) {
    const segs = entry.segments || entry.analysis?.segments;
    if (!segs) continue;
    for (const seg of segs) {
      if (segmentScores[seg.key]) segmentScores[seg.key].push(seg.score);
    }
  }
  const weakSegments = Object.entries(segmentScores)
    .map(([key, scores]) => {
      if (scores.length === 0) return null;
      const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
      const labels = { attack: 'Ataque', peak: 'Pico', modulation: 'Modulação', release: 'Liberação' };
      return { key, label: labels[key], avg, count: scores.length };
    })
    .filter(Boolean)
    .sort((a, b) => a.avg - b.avg);

  // ── Overall session stats ──
  const allScores = sessionHistory.map(e => e.score);
  const sessionAvg = Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length);
  const sessionBest = Math.max(...allScores);
  const recentScores = allScores.slice(0, Math.min(5, allScores.length));
  const earlyScores = allScores.slice(-Math.min(5, allScores.length));
  const recentAvg = Math.round(recentScores.reduce((s, v) => s + v, 0) / recentScores.length);
  const earlyAvg = Math.round(earlyScores.reduce((s, v) => s + v, 0) / earlyScores.length);
  const overallTrend = recentAvg - earlyAvg;

  // ── Generate coaching tips ──
  const tips = [];

  // Trend-based
  if (sessionHistory.length >= 3) {
    if (overallTrend > 5) {
      tips.push({ type: 'success', text: `Evolução positiva! Sua média subiu ${overallTrend} pontos entre as primeiras e últimas tentativas.`, priority: 1 });
    } else if (overallTrend < -5) {
      tips.push({ type: 'warning', text: `Sua performance caiu ${Math.abs(overallTrend)} pontos. Pode ser fadiga — faça uma pausa curta e volte.`, priority: 1 });
    }
  }

  // Weak segment coaching
  if (weakSegments.length > 0 && weakSegments[0].avg < 65) {
    const ws = weakSegments[0];
    const coaching = {
      attack: 'Trabalhe a velocidade de reação — pise no pedal com mais decisão no início do exercício.',
      peak: 'Foque em manter a pressão estável na zona de pico. Evite variações bruscas.',
      modulation: 'Pratique transições suaves. O segredo está em controlar a taxa de liberação do pedal.',
      release: 'A fase final é crucial para a saída de curva. Solte o pedal de forma mais gradual e controlada.',
    };
    tips.push({ type: 'info', text: `Ponto fraco recorrente: ${ws.label} (média ${ws.avg}%). ${coaching[ws.key]}`, priority: 2 });
  }

  // Exercise-specific
  const improving = exerciseTrends.filter(t => t.trend > 10 && t.attempts >= 2);
  const struggling = exerciseTrends.filter(t => t.avg < 50 && t.attempts >= 2);
  const mastered = exerciseTrends.filter(t => t.best >= 90);

  if (struggling.length > 0) {
    tips.push({ type: 'warning', text: `"${struggling[0].name}" precisa de mais prática (média ${struggling[0].avg}%). Tente reduzir a velocidade mental e focar na curva-alvo.`, priority: 3 });
  }

  if (improving.length > 0) {
    tips.push({ type: 'success', text: `Ótima evolução em "${improving[0].name}" — subiu ${improving[0].trend} pontos! Continue praticando para consolidar.`, priority: 3 });
  }

  // Pedal balance
  if (pedalStats.length >= 2) {
    const sorted = [...pedalStats].sort((a, b) => a.avg - b.avg);
    if (sorted[sorted.length - 1].avg - sorted[0].avg > 20) {
      const labels = { brake: 'freio', throttle: 'acelerador', clutch: 'embreagem' };
      tips.push({ type: 'info', text: `Desequilíbrio entre pedais: ${labels[sorted[0].pedal]} está mais fraco (${sorted[0].avg}%) que ${labels[sorted[sorted.length - 1].pedal]} (${sorted[sorted.length - 1].avg}%). Dedique mais tempo ao pedal mais fraco.`, priority: 4 });
    }
  }

  // Next steps
  if (mastered.length > 0 && mastered.length < exerciseTrends.length) {
    const notMastered = exerciseTrends.filter(t => t.best < 90);
    if (notMastered.length > 0) {
      tips.push({ type: 'info', text: `Você já domina ${mastered.length} exercício(s). Próximo desafio: "${notMastered[0].name}" (melhor: ${notMastered[0].best}%).`, priority: 5 });
    }
  }

  if (sessionHistory.length >= 10 && sessionAvg > 70) {
    tips.push({ type: 'success', text: 'Sessão produtiva! Você completou muitas tentativas com boa média. Considere importar telemetria real para treinar zonas de frenagem específicas.', priority: 6 });
  }

  tips.sort((a, b) => a.priority - b.priority);

  return {
    totalAttempts: sessionHistory.length,
    sessionAvg, sessionBest, overallTrend,
    exerciseTrends, pedalStats, weakSegments,
    tips: tips.slice(0, 5),
    mastered: mastered.length,
    allScores,
  };
}
