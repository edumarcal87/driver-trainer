/**
 * Adaptive Exercise Recommendation Engine
 * 
 * Analyzes the pilot's full session history to recommend the best next exercise.
 * Uses segment weakness detection, skill gap analysis, and progression logic.
 */
import { ALL_EXERCISES } from '../data/exercises';

// ═══════════════════════════════════
// SEGMENT → EXERCISE MAPPING
// ═══════════════════════════════════

const SEGMENT_EXERCISE_MAP = {
  attack: {
    label: 'Ataque',
    desc: 'Você está demorando ou excedendo na pressão inicial.',
    fix: 'Pratique exercícios com ataque rápido e preciso.',
    exercises: ['b_threshold', 'b_stab', 'b_emergency'],
  },
  peak: {
    label: 'Pico',
    desc: 'A pressão máxima está imprecisa — muito alta ou muito baixa.',
    fix: 'Treine manter a pressão estável no pico.',
    exercises: ['b_threshold', 'b_left_foot', 'b_progressive'],
  },
  modulation: {
    label: 'Modulação',
    desc: 'A transição de pressão média não está suave.',
    fix: 'Foque em trail braking e modulação progressiva.',
    exercises: ['b_trail', 'b_progressive', 'b_cadence'],
  },
  release: {
    label: 'Liberação',
    desc: 'Você solta o pedal rápido ou lento demais.',
    fix: 'Treine soltar o pedal de forma gradual e controlada.',
    exercises: ['b_trail', 'b_progressive', 't_smooth_exit'],
  },
};

// ═══════════════════════════════════
// ANALYSIS FUNCTIONS
// ═══════════════════════════════════

/**
 * Aggregates segment scores across all attempts.
 */
function getSegmentProfile(sessionLog) {
  const segments = { attack: [], peak: [], modulation: [], release: [] };
  for (const entry of sessionLog) {
    const segs = entry.segments || [];
    for (const seg of segs) {
      if (segments[seg.key]) segments[seg.key].push(seg.score);
    }
  }
  const result = {};
  for (const [key, scores] of Object.entries(segments)) {
    if (scores.length === 0) { result[key] = { avg: null, count: 0, trend: 0 }; continue; }
    const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    // Trend: compare last 5 vs first 5
    const recent = scores.slice(-5);
    const early = scores.slice(0, 5);
    const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;
    const earlyAvg = early.reduce((s, v) => s + v, 0) / early.length;
    result[key] = { avg, count: scores.length, trend: Math.round(recentAvg - earlyAvg) };
  }
  return result;
}

/**
 * Finds exercises the pilot hasn't tried or has low scores on.
 */
function getSkillGaps(sessionLog, exercises) {
  const attempted = {};
  for (const entry of sessionLog) {
    if (!attempted[entry.exId]) attempted[entry.exId] = { best: 0, count: 0 };
    attempted[entry.exId].best = Math.max(attempted[entry.exId].best, entry.score);
    attempted[entry.exId].count++;
  }

  const gaps = [];
  for (const ex of exercises) {
    if (ex.fromTelemetry || ex.track) continue;
    const data = attempted[ex.id];
    if (!data) {
      gaps.push({ exercise: ex, reason: 'never_tried', priority: 3, score: 0, attempts: 0 });
    } else if (data.best < 60) {
      gaps.push({ exercise: ex, reason: 'struggling', priority: 5, score: data.best, attempts: data.count });
    } else if (data.best < 75 && data.count < 5) {
      gaps.push({ exercise: ex, reason: 'needs_practice', priority: 2, score: data.best, attempts: data.count });
    }
  }
  return gaps.sort((a, b) => b.priority - a.priority);
}

/**
 * Detects which pedal type the pilot is weakest at.
 */
function getPedalWeakness(sessionLog) {
  const byPedal = {};
  for (const entry of sessionLog) {
    const p = entry.pedal || 'brake';
    if (!byPedal[p]) byPedal[p] = [];
    byPedal[p].push(entry.score);
  }
  let weakest = null, lowestAvg = 100;
  for (const [pedal, scores] of Object.entries(byPedal)) {
    if (scores.length < 3) continue;
    const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
    if (avg < lowestAvg) { lowestAvg = avg; weakest = pedal; }
  }
  return weakest ? { pedal: weakest, avg: Math.round(lowestAvg) } : null;
}

/**
 * Checks if the pilot is ready for harder exercises.
 */
function getProgressionReady(sessionLog) {
  const byDiff = { 1: [], 2: [], 3: [] };
  for (const entry of sessionLog) {
    const d = entry.diff || 1;
    if (byDiff[d]) byDiff[d].push(entry.score);
  }
  const ready = [];
  for (const [diff, scores] of Object.entries(byDiff)) {
    if (scores.length >= 5) {
      const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
      if (avg >= 80 && Number(diff) < 3) {
        ready.push({ fromDiff: Number(diff), toDiff: Number(diff) + 1, avg });
      }
    }
  }
  return ready;
}

// ═══════════════════════════════════
// MAIN RECOMMENDATION ENGINE
// ═══════════════════════════════════

/**
 * Generates adaptive exercise recommendations.
 * Returns { recommendations[], segmentProfile, pedalWeakness, progressionReady[] }
 */
export function getAdaptiveRecommendations(sessionLog, exercises = ALL_EXERCISES) {
  if (!sessionLog || sessionLog.length < 3) {
    return {
      recommendations: [{
        exercise: exercises.find(e => e.id === 'b_trail') || exercises[0],
        reason: 'Comece pelo exercício mais fundamental do sim racing.',
        category: 'start',
        icon: '🚀',
        priority: 10,
      }],
      segmentProfile: null,
      pedalWeakness: null,
      progressionReady: [],
    };
  }

  const segProfile = getSegmentProfile(sessionLog);
  const skillGaps = getSkillGaps(sessionLog, exercises);
  const pedalWeak = getPedalWeakness(sessionLog);
  const progression = getProgressionReady(sessionLog);
  const recommendations = [];

  // ── 1. Weakest segment recommendation ──
  const sortedSegments = Object.entries(segProfile)
    .filter(([, v]) => v.count >= 3 && v.avg !== null)
    .sort((a, b) => a[1].avg - b[1].avg);

  if (sortedSegments.length > 0) {
    const [weakKey, weakData] = sortedSegments[0];
    const mapping = SEGMENT_EXERCISE_MAP[weakKey];
    if (mapping && weakData.avg < 75) {
      const targetExIds = mapping.exercises;
      const targetEx = targetExIds.map(id => exercises.find(e => e.id === id)).filter(Boolean);
      // Pick the one with fewest attempts
      const attempted = {};
      for (const e of sessionLog) attempted[e.exId] = (attempted[e.exId] || 0) + 1;
      const best = targetEx.sort((a, b) => (attempted[a.id] || 0) - (attempted[b.id] || 0))[0];
      if (best) {
        recommendations.push({
          exercise: best,
          reason: `${mapping.label} é seu segmento mais fraco (${weakData.avg}%). ${mapping.fix}`,
          category: 'weakness',
          icon: '🎯',
          priority: 10,
          segmentKey: weakKey,
          segmentScore: weakData.avg,
          trend: weakData.trend,
        });
      }
    }
  }

  // ── 2. Declining segment (getting worse) ──
  for (const [key, data] of Object.entries(segProfile)) {
    if (data.count >= 5 && data.trend < -10) {
      const mapping = SEGMENT_EXERCISE_MAP[key];
      const targetEx = mapping?.exercises.map(id => exercises.find(e => e.id === id)).filter(Boolean)[0];
      if (targetEx && !recommendations.some(r => r.exercise.id === targetEx.id)) {
        recommendations.push({
          exercise: targetEx,
          reason: `${mapping.label} está caindo (${data.trend > 0 ? '+' : ''}${data.trend}pts). Reforce antes que vire hábito.`,
          category: 'declining',
          icon: '📉',
          priority: 8,
        });
      }
    }
  }

  // ── 3. Never tried exercises ──
  const neverTried = skillGaps.filter(g => g.reason === 'never_tried').slice(0, 2);
  for (const gap of neverTried) {
    if (!recommendations.some(r => r.exercise.id === gap.exercise.id)) {
      recommendations.push({
        exercise: gap.exercise,
        reason: `Você ainda não experimentou este exercício. Diversificar treino melhora a pilotagem geral.`,
        category: 'explore',
        icon: '🔍',
        priority: 4,
      });
    }
  }

  // ── 4. Struggling exercises ──
  const struggling = skillGaps.filter(g => g.reason === 'struggling').slice(0, 1);
  for (const gap of struggling) {
    if (!recommendations.some(r => r.exercise.id === gap.exercise.id)) {
      recommendations.push({
        exercise: gap.exercise,
        reason: `Melhor score: ${gap.score}% em ${gap.attempts} tentativa${gap.attempts > 1 ? 's' : ''}. Prática focada pode melhorar.`,
        category: 'improve',
        icon: '💪',
        priority: 7,
      });
    }
  }

  // ── 5. Progression: ready for harder ──
  if (progression.length > 0) {
    const p = progression[0];
    const harderExercises = exercises.filter(e => !e.fromTelemetry && !e.track && (e.diff || 1) === p.toDiff);
    const attempted = {};
    for (const e of sessionLog) attempted[e.exId] = (attempted[e.exId] || 0) + 1;
    const next = harderExercises.sort((a, b) => (attempted[a.id] || 0) - (attempted[b.id] || 0))[0];
    if (next && !recommendations.some(r => r.exercise.id === next.id)) {
      recommendations.push({
        exercise: next,
        reason: `Média ${p.avg}% em exercícios nível ${p.fromDiff}. Hora de subir para o nível ${p.toDiff}!`,
        category: 'progression',
        icon: '⬆️',
        priority: 6,
      });
    }
  }

  // ── 6. Pedal weakness ──
  if (pedalWeak) {
    const pedalExercises = exercises.filter(e => !e.fromTelemetry && !e.track && (e.pedal || 'brake') === pedalWeak.pedal);
    const attempted = {};
    for (const e of sessionLog) attempted[e.exId] = (attempted[e.exId] || 0) + 1;
    const least = pedalExercises.sort((a, b) => (attempted[a.id] || 0) - (attempted[b.id] || 0))[0];
    if (least && !recommendations.some(r => r.exercise.id === least.id)) {
      const pedalLabels = { brake: 'Freio', throttle: 'Acelerador', clutch: 'Embreagem', steering: 'Volante', combined: 'Combinado' };
      recommendations.push({
        exercise: least,
        reason: `${pedalLabels[pedalWeak.pedal] || pedalWeak.pedal} é seu pedal mais fraco (${pedalWeak.avg}% média). Treine mais nessa área.`,
        category: 'pedal_weakness',
        icon: '🦶',
        priority: 5,
      });
    }
  }

  // Sort by priority
  recommendations.sort((a, b) => b.priority - a.priority);

  return {
    recommendations: recommendations.slice(0, 4),
    segmentProfile: segProfile,
    pedalWeakness: pedalWeak,
    progressionReady: progression,
  };
}
