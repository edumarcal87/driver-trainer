/**
 * Badges & Achievements system for Driver Trainer.
 * Each badge has: id, name, icon, desc, category, rarity, check(sessionLog, bests) => boolean
 */

// ═══════════════════════════════════
// BADGE DEFINITIONS
// ═══════════════════════════════════

export const BADGE_CATEGORIES = {
  milestone: { label: 'Marcos', color: '#2980b9' },
  mastery: { label: 'Maestria', color: '#f1c40f' },
  track: { label: 'Circuitos', color: '#27ae60' },
  streak: { label: 'Sequências', color: '#e74c3c' },
  special: { label: 'Especiais', color: '#8e44ad' },
};

export const BADGES = [
  // ── Milestone badges (first times) ──
  { id: 'first_exercise', name: 'Primeiro Treino', icon: '🏁', desc: 'Completou seu primeiro exercício.', category: 'milestone', rarity: 'common',
    check: (log) => log.length >= 1 },
  { id: 'ten_exercises', name: '10 Treinos', icon: '🔟', desc: 'Completou 10 exercícios.', category: 'milestone', rarity: 'common',
    check: (log) => log.length >= 10 },
  { id: 'fifty_exercises', name: 'Meio Centenário', icon: '5️⃣', desc: 'Completou 50 exercícios.', category: 'milestone', rarity: 'uncommon',
    check: (log) => log.length >= 50 },
  { id: 'hundred_exercises', name: 'Centenário', icon: '💯', desc: 'Completou 100 exercícios.', category: 'milestone', rarity: 'rare',
    check: (log) => log.length >= 100 },
  { id: 'five_hundred', name: 'Maratonista', icon: '🏅', desc: 'Completou 500 exercícios.', category: 'milestone', rarity: 'epic',
    check: (log) => log.length >= 500 },

  // ── Score mastery badges ──
  { id: 'first_70', name: 'Boa Forma', icon: '👍', desc: 'Conseguiu 70% ou mais em um exercício.', category: 'mastery', rarity: 'common',
    check: (log) => log.some(e => e.score >= 70) },
  { id: 'first_80', name: 'Piloto Consistente', icon: '🎯', desc: 'Conseguiu 80% ou mais em um exercício.', category: 'mastery', rarity: 'common',
    check: (log) => log.some(e => e.score >= 80) },
  { id: 'first_90', name: 'Quase Perfeito', icon: '⭐', desc: 'Conseguiu 90% ou mais em um exercício.', category: 'mastery', rarity: 'uncommon',
    check: (log) => log.some(e => e.score >= 90) },
  { id: 'first_95', name: 'Alien', icon: '👽', desc: 'Conseguiu 95% ou mais em um exercício.', category: 'mastery', rarity: 'rare',
    check: (log) => log.some(e => e.score >= 95) },
  { id: 'perfect', name: 'Perfeição', icon: '💎', desc: 'Conseguiu 100% em um exercício.', category: 'mastery', rarity: 'legendary',
    check: (log) => log.some(e => e.score >= 100) },

  { id: 'five_90s', name: 'Consistência Elite', icon: '🏆', desc: 'Conseguiu 90%+ em 5 exercícios diferentes.', category: 'mastery', rarity: 'rare',
    check: (log) => {
      const unique = new Set(log.filter(e => e.score >= 90).map(e => e.exId));
      return unique.size >= 5;
    }},
  { id: 'ten_90s', name: 'Mestre dos Pedais', icon: '👑', desc: 'Conseguiu 90%+ em 10 exercícios diferentes.', category: 'mastery', rarity: 'epic',
    check: (log) => {
      const unique = new Set(log.filter(e => e.score >= 90).map(e => e.exId));
      return unique.size >= 10;
    }},

  // ── Technique-specific mastery ──
  { id: 'trail_master', name: 'Mestre do Trail', icon: '🦶', desc: '90%+ no exercício Trail Braking.', category: 'mastery', rarity: 'uncommon',
    check: (log) => log.some(e => e.exId === 'b_trail' && e.score >= 90) },
  { id: 'heel_toe_master', name: 'Mestre do Heel-Toe', icon: '🩰', desc: '90%+ no exercício Heel-Toe Completo.', category: 'mastery', rarity: 'rare',
    check: (log) => log.some(e => e.exId === 'x_heel_toe' && e.score >= 90) },
  { id: 'full_corner_master', name: 'Curva Perfeita', icon: '🔄', desc: '90%+ no exercício Curva Completa.', category: 'mastery', rarity: 'rare',
    check: (log) => log.some(e => e.exId === 'x_full_corner' && e.score >= 90) },

  // ── Category mastery ──
  { id: 'brake_all', name: 'Domínio do Freio', icon: '🔴', desc: '70%+ em todos os exercícios de freio.', category: 'mastery', rarity: 'uncommon',
    check: (log) => {
      const brakeIds = ['b_threshold', 'b_progressive', 'b_trail', 'b_late', 'b_cadence', 'b_release'];
      return brakeIds.every(id => log.some(e => e.exId === id && e.score >= 70));
    }},
  { id: 'throttle_all', name: 'Domínio do Acelerador', icon: '🟢', desc: '70%+ em todos os exercícios de acelerador.', category: 'mastery', rarity: 'uncommon',
    check: (log) => {
      const ids = ['t_smooth_exit', 't_feathering', 't_full_power', 't_partial'];
      return ids.every(id => log.some(e => e.exId === id && e.score >= 70));
    }},

  // ── Track badges ──
  { id: 'interlagos_complete', name: 'Volta de Interlagos', icon: '🇧🇷', desc: 'Completou todos os cenários de Interlagos.', category: 'track', rarity: 'uncommon',
    check: (log) => {
      const ids = log.filter(e => e.exId?.startsWith('ilg_')).map(e => e.exId);
      return new Set(ids).size >= 14;
    }},
  { id: 'interlagos_master', name: 'Rei de Interlagos', icon: '🏆🇧🇷', desc: '80%+ em todos os cenários de Interlagos.', category: 'track', rarity: 'epic',
    check: (log) => {
      const ids = ['ilg_t1_senna_s', 'ilg_t2_senna_s2', 'ilg_t3_curva_sol', 'ilg_t4_reta_oposta_entry', 'ilg_t5_descida', 'ilg_t6_ferradura', 'ilg_t7_laranjinha', 'ilg_t8_pinheirinho', 'ilg_t9_bico_pato', 'ilg_t10_mergulho', 'ilg_t11_bico_pato', 'ilg_t12_juncao', 'ilg_t13_subida_boxes'];
      return ids.every(id => log.some(e => e.exId === id && e.score >= 80));
    }},

  { id: 'spa_complete', name: 'Volta de Spa', icon: '🇧🇪', desc: 'Completou todos os cenários de Spa.', category: 'track', rarity: 'uncommon',
    check: (log) => {
      const ids = log.filter(e => e.exId?.startsWith('spa_')).map(e => e.exId);
      return new Set(ids).size >= 7;
    }},
  { id: 'eau_rouge_brave', name: 'Coragem em Eau Rouge', icon: '🌊', desc: '85%+ no cenário Eau Rouge / Raidillon.', category: 'track', rarity: 'rare',
    check: (log) => log.some(e => e.exId === 'spa_t3_eau_rouge' && e.score >= 85) },

  { id: 'monza_complete', name: 'Volta de Monza', icon: '🇮🇹', desc: 'Completou todos os cenários de Monza.', category: 'track', rarity: 'uncommon',
    check: (log) => {
      const ids = log.filter(e => e.exId?.startsWith('mza_')).map(e => e.exId);
      return new Set(ids).size >= 7;
    }},
  { id: 'parabolica_master', name: 'Rei da Parabolica', icon: '🏎️🇮🇹', desc: '85%+ no cenário Parabolica.', category: 'track', rarity: 'rare',
    check: (log) => log.some(e => e.exId === 'mza_t11_parabolica' && e.score >= 85) },

  { id: 'silverstone_complete', name: 'Volta de Silverstone', icon: '🇬🇧', desc: 'Completou todos os cenários de Silverstone.', category: 'track', rarity: 'uncommon',
    check: (log) => {
      const ids = log.filter(e => e.exId?.startsWith('slv_')).map(e => e.exId);
      return new Set(ids).size >= 6;
    }},
  { id: 'maggotts_flow', name: 'Fluidez em Maggotts', icon: '🔀🇬🇧', desc: '85%+ no cenário Maggotts-Becketts.', category: 'track', rarity: 'rare',
    check: (log) => log.some(e => e.exId === 'slv_t10_maggotts' && e.score >= 85) },

  { id: 'all_tracks', name: 'Globetrotter', icon: '🌍', desc: 'Completou pelo menos 1 cenário em cada circuito.', category: 'track', rarity: 'uncommon',
    check: (log) => {
      const has = p => log.some(e => e.exId?.startsWith(p));
      return has('ilg_') && has('spa_') && has('mza_') && has('slv_');
    }},

  // ── Streak badges ──
  { id: 'streak_3', name: 'Hat Trick', icon: '🔥', desc: '3 exercícios seguidos com 70%+.', category: 'streak', rarity: 'common',
    check: (log) => hasStreak(log, 70, 3) },
  { id: 'streak_5', name: 'Em Chamas', icon: '🔥🔥', desc: '5 exercícios seguidos com 70%+.', category: 'streak', rarity: 'uncommon',
    check: (log) => hasStreak(log, 70, 5) },
  { id: 'streak_10', name: 'Imbatível', icon: '💪', desc: '10 exercícios seguidos com 70%+.', category: 'streak', rarity: 'rare',
    check: (log) => hasStreak(log, 70, 10) },
  { id: 'streak_5_90', name: 'Sequência Alien', icon: '👽🔥', desc: '5 exercícios seguidos com 90%+.', category: 'streak', rarity: 'epic',
    check: (log) => hasStreak(log, 90, 5) },

  // ── Special badges ──
  { id: 'night_owl', name: 'Coruja Noturna', icon: '🦉', desc: 'Treinou entre meia-noite e 5h da manhã.', category: 'special', rarity: 'uncommon',
    check: (log) => log.some(e => { const h = new Date(e.timestamp).getHours(); return h >= 0 && h < 5; }) },
  { id: 'early_bird', name: 'Madrugador', icon: '🌅', desc: 'Treinou entre 5h e 7h da manhã.', category: 'special', rarity: 'uncommon',
    check: (log) => log.some(e => { const h = new Date(e.timestamp).getHours(); return h >= 5 && h < 7; }) },
  { id: 'weekend_warrior', name: 'Guerreiro de Fim de Semana', icon: '⚔️', desc: 'Treinou 10+ exercícios no mesmo dia.', category: 'special', rarity: 'uncommon',
    check: (log) => {
      const days = {};
      log.forEach(e => { const d = new Date(e.timestamp).toDateString(); days[d] = (days[d] || 0) + 1; });
      return Object.values(days).some(c => c >= 10);
    }},
  { id: 'all_categories', name: 'Piloto Completo', icon: '🎖️', desc: 'Completou pelo menos 1 exercício em cada categoria.', category: 'special', rarity: 'uncommon',
    check: (log) => {
      const pedals = new Set(log.map(e => e.pedal).filter(Boolean));
      return ['brake', 'throttle', 'clutch', 'steering', 'combined'].every(p => pedals.has(p) || log.some(e => (e.pedal || 'brake') === p));
    }},
  { id: 'improver', name: 'Evolução Constante', icon: '📈', desc: 'Melhorou o score em 5 exercícios diferentes.', category: 'special', rarity: 'common',
    check: (log) => {
      const byEx = {};
      log.forEach(e => { if (!byEx[e.exId]) byEx[e.exId] = []; byEx[e.exId].push(e.score); });
      let improved = 0;
      for (const scores of Object.values(byEx)) {
        if (scores.length >= 2 && scores[0] > scores[scores.length - 1]) improved++;
      }
      return improved >= 5;
    }},
];

// ═══════════════════════════════════
// RARITY CONFIG
// ═══════════════════════════════════

export const RARITY = {
  common:    { label: 'Comum', color: '#9a9a90', bg: '#f5f4ef' },
  uncommon:  { label: 'Incomum', color: '#2980b9', bg: '#e4f0f9' },
  rare:      { label: 'Raro', color: '#8e44ad', bg: '#f3e8f9' },
  epic:      { label: 'Épico', color: '#f39c12', bg: '#fef5e1' },
  legendary: { label: 'Lendário', color: '#e74c3c', bg: '#fde8e6' },
};

// ═══════════════════════════════════
// EVALUATION ENGINE
// ═══════════════════════════════════

function hasStreak(log, minScore, length) {
  if (log.length < length) return false;
  const sorted = [...log].sort((a, b) => a.timestamp - b.timestamp);
  let streak = 0;
  for (const e of sorted) {
    streak = e.score >= minScore ? streak + 1 : 0;
    if (streak >= length) return true;
  }
  return false;
}

/**
 * Evaluate all badges against session log.
 * Returns { unlocked: Badge[], locked: Badge[], newlyUnlocked: Badge[] }
 */
export function evaluateBadges(sessionLog, previouslyUnlocked = []) {
  const prevIds = new Set(previouslyUnlocked);
  const unlocked = [];
  const locked = [];
  const newlyUnlocked = [];

  for (const badge of BADGES) {
    try {
      if (badge.check(sessionLog)) {
        unlocked.push(badge);
        if (!prevIds.has(badge.id)) newlyUnlocked.push(badge);
      } else {
        locked.push(badge);
      }
    } catch {
      locked.push(badge);
    }
  }

  return { unlocked, locked, newlyUnlocked };
}

/**
 * Get unlocked badge IDs from localStorage.
 */
export function getStoredBadges() {
  try {
    const raw = localStorage.getItem('bt_badges');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

/**
 * Save unlocked badge IDs to localStorage.
 */
export function storeBadges(ids) {
  try { localStorage.setItem('bt_badges', JSON.stringify(ids)); } catch {}
}
