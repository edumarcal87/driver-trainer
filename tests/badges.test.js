import { describe, it, expect } from 'vitest';
import { BADGES, BADGE_CATEGORIES, RARITY, evaluateBadges } from '../src/data/badges';

// ═══════════════════════════════════
// Helper
// ═══════════════════════════════════

function mockLog(entries) {
  return entries.map((e, i) => ({
    exId: e.exId || 'b_trail',
    exName: e.exName || 'Trail Braking',
    pedal: e.pedal || 'brake',
    score: e.score || 50,
    timestamp: e.timestamp || (1000 + i * 100),
    ...e,
  }));
}

// ═══════════════════════════════════
// Badge data integrity
// ═══════════════════════════════════

describe('Badge definitions', () => {
  it('all badges have required fields', () => {
    for (const b of BADGES) {
      expect(b).toHaveProperty('id');
      expect(b).toHaveProperty('name');
      expect(b).toHaveProperty('icon');
      expect(b).toHaveProperty('desc');
      expect(b).toHaveProperty('category');
      expect(b).toHaveProperty('rarity');
      expect(b).toHaveProperty('check');
      expect(typeof b.check).toBe('function');
    }
  });

  it('all badge IDs are unique', () => {
    const ids = BADGES.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all badges reference valid categories', () => {
    for (const b of BADGES) {
      expect(BADGE_CATEGORIES).toHaveProperty(b.category);
    }
  });

  it('all badges reference valid rarities', () => {
    for (const b of BADGES) {
      expect(RARITY).toHaveProperty(b.rarity);
    }
  });

  it('has at least 30 badges', () => {
    expect(BADGES.length).toBeGreaterThanOrEqual(30);
  });
});

// ═══════════════════════════════════
// evaluateBadges
// ═══════════════════════════════════

describe('evaluateBadges', () => {
  it('returns empty unlocked for empty log', () => {
    const { unlocked, locked } = evaluateBadges([]);
    expect(unlocked).toHaveLength(0);
    expect(locked.length).toBe(BADGES.length);
  });

  it('unlocks first_exercise with 1 entry', () => {
    const log = mockLog([{ score: 40 }]);
    const { unlocked } = evaluateBadges(log);
    expect(unlocked.some(b => b.id === 'first_exercise')).toBe(true);
  });

  it('unlocks first_70 when score >= 70', () => {
    const log = mockLog([{ score: 72 }]);
    const { unlocked } = evaluateBadges(log);
    expect(unlocked.some(b => b.id === 'first_70')).toBe(true);
  });

  it('does NOT unlock first_90 with score 85', () => {
    const log = mockLog([{ score: 85 }]);
    const { unlocked } = evaluateBadges(log);
    expect(unlocked.some(b => b.id === 'first_90')).toBe(false);
  });

  it('unlocks first_90 with score 92', () => {
    const log = mockLog([{ score: 92 }]);
    const { unlocked } = evaluateBadges(log);
    expect(unlocked.some(b => b.id === 'first_90')).toBe(true);
  });

  it('unlocks ten_exercises with 10 entries', () => {
    const log = mockLog(Array.from({ length: 10 }, (_, i) => ({ score: 50 + i })));
    const { unlocked } = evaluateBadges(log);
    expect(unlocked.some(b => b.id === 'ten_exercises')).toBe(true);
  });

  it('tracks newlyUnlocked correctly', () => {
    const log = mockLog([{ score: 75 }]);
    const prev = ['first_exercise']; // Already had this
    const { newlyUnlocked } = evaluateBadges(log, prev);
    expect(newlyUnlocked.some(b => b.id === 'first_exercise')).toBe(false);
    expect(newlyUnlocked.some(b => b.id === 'first_70')).toBe(true);
  });
});

// ═══════════════════════════════════
// Streak badges
// ═══════════════════════════════════

describe('Streak badges', () => {
  it('unlocks streak_3 with 3 consecutive 70+ scores', () => {
    const log = mockLog([
      { score: 75, timestamp: 1000 },
      { score: 80, timestamp: 2000 },
      { score: 72, timestamp: 3000 },
    ]);
    const { unlocked } = evaluateBadges(log);
    expect(unlocked.some(b => b.id === 'streak_3')).toBe(true);
  });

  it('does NOT unlock streak_3 when streak is broken', () => {
    const log = mockLog([
      { score: 75, timestamp: 1000 },
      { score: 40, timestamp: 2000 }, // breaks streak
      { score: 80, timestamp: 3000 },
    ]);
    const { unlocked } = evaluateBadges(log);
    expect(unlocked.some(b => b.id === 'streak_3')).toBe(false);
  });

  it('unlocks streak_5 with 5 consecutive 70+ scores', () => {
    const log = mockLog(Array.from({ length: 5 }, (_, i) => ({ score: 75, timestamp: 1000 + i * 100 })));
    const { unlocked } = evaluateBadges(log);
    expect(unlocked.some(b => b.id === 'streak_5')).toBe(true);
  });
});

// ═══════════════════════════════════
// Track badges
// ═══════════════════════════════════

describe('Track badges', () => {
  it('unlocks all_tracks when all prefixes present', () => {
    const log = mockLog([
      { exId: 'ilg_t1_senna_s', score: 50 },
      { exId: 'spa_t1_la_source', score: 50 },
      { exId: 'mza_t1_rettifilo', score: 50 },
      { exId: 'slv_t1_copse', score: 50 },
    ]);
    const { unlocked } = evaluateBadges(log);
    expect(unlocked.some(b => b.id === 'all_tracks')).toBe(true);
  });

  it('does NOT unlock all_tracks with only 3 track prefixes', () => {
    const log = mockLog([
      { exId: 'ilg_t1_senna_s', score: 50 },
      { exId: 'spa_t1_la_source', score: 50 },
      { exId: 'mza_t1_rettifilo', score: 50 },
    ]);
    const { unlocked } = evaluateBadges(log);
    expect(unlocked.some(b => b.id === 'all_tracks')).toBe(false);
  });
});

// ═══════════════════════════════════
// Special badges
// ═══════════════════════════════════

describe('Special badges', () => {
  it('unlocks night_owl for exercise at 2am', () => {
    const date = new Date();
    date.setHours(2, 30, 0);
    const log = mockLog([{ score: 50, timestamp: date.getTime() }]);
    const { unlocked } = evaluateBadges(log);
    expect(unlocked.some(b => b.id === 'night_owl')).toBe(true);
  });

  it('unlocks weekend_warrior for 10+ exercises in one day', () => {
    const base = new Date('2024-06-15T10:00:00').getTime();
    const log = mockLog(Array.from({ length: 10 }, (_, i) => ({
      score: 50, timestamp: base + i * 60000, // 1 min apart
    })));
    const { unlocked } = evaluateBadges(log);
    expect(unlocked.some(b => b.id === 'weekend_warrior')).toBe(true);
  });

  it('does NOT unlock weekend_warrior for 9 exercises', () => {
    const base = new Date('2024-06-15T10:00:00').getTime();
    const log = mockLog(Array.from({ length: 9 }, (_, i) => ({
      score: 50, timestamp: base + i * 60000,
    })));
    const { unlocked } = evaluateBadges(log);
    expect(unlocked.some(b => b.id === 'weekend_warrior')).toBe(false);
  });
});

// ═══════════════════════════════════
// Mastery badges
// ═══════════════════════════════════

describe('Mastery badges', () => {
  it('unlocks trail_master with 90+ on b_trail', () => {
    const log = mockLog([{ exId: 'b_trail', score: 93 }]);
    const { unlocked } = evaluateBadges(log);
    expect(unlocked.some(b => b.id === 'trail_master')).toBe(true);
  });

  it('unlocks five_90s with 5 different exercises at 90+', () => {
    const log = mockLog([
      { exId: 'b_trail', score: 92 },
      { exId: 'b_threshold', score: 91 },
      { exId: 't_smooth_exit', score: 93 },
      { exId: 'x_heel_toe', score: 90 },
      { exId: 'x_full_corner', score: 95 },
    ]);
    const { unlocked } = evaluateBadges(log);
    expect(unlocked.some(b => b.id === 'five_90s')).toBe(true);
  });

  it('does NOT unlock five_90s with 4 different exercises at 90+', () => {
    const log = mockLog([
      { exId: 'b_trail', score: 92 },
      { exId: 'b_threshold', score: 91 },
      { exId: 't_smooth_exit', score: 93 },
      { exId: 'x_heel_toe', score: 90 },
    ]);
    const { unlocked } = evaluateBadges(log);
    expect(unlocked.some(b => b.id === 'five_90s')).toBe(false);
  });

  it('perfect badge requires exactly 100', () => {
    const log99 = mockLog([{ score: 99 }]);
    expect(evaluateBadges(log99).unlocked.some(b => b.id === 'perfect')).toBe(false);

    const log100 = mockLog([{ score: 100 }]);
    expect(evaluateBadges(log100).unlocked.some(b => b.id === 'perfect')).toBe(true);
  });
});
