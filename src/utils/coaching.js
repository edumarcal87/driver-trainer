/**
 * Session coaching engine.
 * Analyzes full history of attempts to generate evolution insights.
 */
export function generateSessionReport(history) {
  if (history.length === 0) return null;

  const exerciseMap = {};
  for (const h of history) {
    if (!exerciseMap[h.exId]) exerciseMap[h.exId] = [];
    exerciseMap[h.exId].push(h);
  }

  const exerciseEvolutions = Object.entries(exerciseMap).map(([exId, attempts]) => {
    const sorted = [...attempts].sort((a, b) => a.timestamp - b.timestamp);
    const first = sorted[0], last = sorted[sorted.length - 1];
    const best = sorted.reduce((b, a) => a.score > b.score ? a : b, sorted[0]);
    const avgScore = Math.round(sorted.reduce((s, a) => s + a.score, 0) / sorted.length);
    const trend = sorted.length >= 2 ? last.score - first.score : 0;

    const segmentScores = { attack: [], peak: [], modulation: [], release: [] };
    for (const a of sorted) {
      if (a.segments) for (const seg of a.segments) if (segmentScores[seg.key]) segmentScores[seg.key].push(seg.score);
    }
    const weakestSegment = Object.entries(segmentScores)
      .map(([key, scores]) => ({ key, avg: scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 100 }))
      .reduce((w, s) => s.avg < w.avg ? s : w, { key: 'none', avg: 100 });

    return {
      exId, exName: first.exName, pedal: first.pedal || 'brake',
      attempts: sorted.length, first: first.score, last: last.score, best: best.score,
      avgScore, trend, improving: trend > 5, declining: trend < -5,
      weakestSegment, scores: sorted.map(a => a.score),
    };
  });

  const pedalSummary = {};
  for (const h of history) {
    const p = h.pedal || 'brake';
    if (!pedalSummary[p]) pedalSummary[p] = { scores: [], count: 0 };
    pedalSummary[p].scores.push(h.score); pedalSummary[p].count++;
  }
  for (const data of Object.values(pedalSummary)) {
    data.avg = Math.round(data.scores.reduce((s, v) => s + v, 0) / data.scores.length);
    data.best = Math.max(...data.scores);
  }

  const allScores = history.map(h => h.score);
  const sessionAvg = Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length);
  const sessionBest = Math.max(...allScores);
  const totalAttempts = history.length;
  const uniqueExercises = new Set(history.map(h => h.exId)).size;
  const sessionStart = Math.min(...history.map(h => h.timestamp));
  const sessionEnd = Math.max(...history.map(h => h.timestamp));
  const sessionMinutes = Math.round((sessionEnd - sessionStart) / 60000);

  // ── Coaching tips ──
  const tips = [];
  const labels = { brake: 'freio', throttle: 'acelerador', clutch: 'embreagem' };

  const pedalEntries = Object.entries(pedalSummary);
  if (pedalEntries.length > 1) {
    const bestP = pedalEntries.reduce((b, [, d]) => d.avg > b[1].avg ? [arguments[0], d] : b, pedalEntries[0]);
    const worstP = pedalEntries.reduce((w, e) => e[1].avg < w[1].avg ? e : w, pedalEntries[0]);
    if (pedalEntries.reduce((b, e) => e[1].avg > b[1].avg ? e : b, pedalEntries[0])[1].avg - worstP[1].avg > 15) {
      tips.push({ type: 'focus', title: `Foco no ${labels[worstP[0]] || worstP[0]}`,
        text: `Seu ${labels[worstP[0]]} tem média ${worstP[1].avg}%. Dedique mais tempo a exercícios de ${labels[worstP[0]]}.` });
    }
  }

  const improvingEx = exerciseEvolutions.filter(e => e.improving && e.attempts >= 2);
  if (improvingEx.length > 0) {
    const b = improvingEx.reduce((b, e) => e.trend > b.trend ? e : b, improvingEx[0]);
    tips.push({ type: 'success', title: 'Evolução detectada',
      text: `Você melhorou +${b.trend}% em "${b.exName}" ao longo de ${b.attempts} tentativas.` });
  }

  const decliningEx = exerciseEvolutions.filter(e => e.declining && e.attempts >= 3);
  if (decliningEx.length > 0) {
    tips.push({ type: 'warning', title: 'Fadiga detectada',
      text: `Sua performance caiu em "${decliningEx[0].exName}". Considere uma pausa ou mude de exercício.` });
  }

  const allSegScores = { attack: [], peak: [], modulation: [], release: [] };
  for (const h of history) if (h.segments) for (const seg of h.segments) if (allSegScores[seg.key]) allSegScores[seg.key].push(seg.score);
  const segLabels = { attack: 'Ataque (início)', peak: 'Pico (pressão máxima)', modulation: 'Modulação (meio)', release: 'Liberação (final)' };
  const weakSegs = Object.entries(allSegScores).filter(([, s]) => s.length >= 3)
    .map(([key, scores]) => ({ key, avg: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) })).sort((a, b) => a.avg - b.avg);
  if (weakSegs.length > 0 && weakSegs[0].avg < 60) {
    const advice = { attack: 'como você inicia a pressão — tente ser mais rápido e decisivo', peak: 'manter a pressão estável no ponto máximo',
      modulation: 'controlar a transição de pressão — evite movimentos bruscos', release: 'soltar o pedal de forma gradual e controlada' };
    tips.push({ type: 'drill', title: `Treine: ${segLabels[weakSegs[0].key]}`,
      text: `Média de ${weakSegs[0].avg}% nesse segmento. Foque em ${advice[weakSegs[0].key]}.` });
  }

  if (uniqueExercises === 1 && totalAttempts >= 5) {
    tips.push({ type: 'variety', title: 'Diversifique o treino', text: 'Você praticou apenas um exercício. Tente outros tipos para desenvolver habilidades diferentes.' });
  }

  const consistencyScores = history.filter(h => h.consistency != null).map(h => h.consistency);
  if (consistencyScores.length >= 3) {
    const avgC = Math.round(consistencyScores.reduce((s, v) => s + v, 0) / consistencyScores.length);
    if (avgC < 50) tips.push({ type: 'technique', title: 'Trabalhe a consistência',
      text: `Consistência média de ${avgC}%. Foque em repetir o mesmo movimento. A memória muscular vem com a repetição.` });
  }

  const bestEx = exerciseEvolutions.reduce((b, e) => e.avgScore > b.avgScore ? e : b, exerciseEvolutions[0]);
  if (bestEx.avgScore >= 80 && bestEx.attempts >= 3) {
    tips.push({ type: 'next', title: 'Próximo desafio',
      text: `Você dominou "${bestEx.exName}" com média ${bestEx.avgScore}%. Tente um exercício mais difícil.` });
  }

  if (tips.length === 0 && totalAttempts >= 1) {
    tips.push({ type: 'success', title: 'Continue treinando', text: 'Ainda não há dados suficientes para dicas detalhadas. Complete mais exercícios!' });
  }

  return {
    sessionAvg, sessionBest, totalAttempts, uniqueExercises, sessionMinutes,
    exerciseEvolutions, pedalSummary, tips,
    allScores: history.map(h => ({ score: h.score, timestamp: h.timestamp })),
  };
}
