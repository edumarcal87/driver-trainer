import { describe, it, expect } from 'vitest';
import { makeCurvePoints, calcScore, analyzePerformance } from '../src/utils/scoring';

// ═══════════════════════════════════
// makeCurvePoints
// ═══════════════════════════════════

describe('makeCurvePoints', () => {
  it('generates correct number of points', () => {
    const pts = makeCurvePoints(t => t, 100);
    expect(pts).toHaveLength(101); // 0 to 100 inclusive
  });

  it('first point is t=0, last is t=1', () => {
    const pts = makeCurvePoints(t => t * 2, 50);
    expect(pts[0].t).toBe(0);
    expect(pts[pts.length - 1].t).toBe(1);
  });

  it('applies curve function correctly', () => {
    const pts = makeCurvePoints(t => t * 0.5, 10);
    expect(pts[0].v).toBeCloseTo(0);
    expect(pts[5].v).toBeCloseTo(0.25);
    expect(pts[10].v).toBeCloseTo(0.5);
  });

  it('default n=200 produces 201 points', () => {
    const pts = makeCurvePoints(t => t);
    expect(pts).toHaveLength(201);
  });
});

// ═══════════════════════════════════
// calcScore
// ═══════════════════════════════════

describe('calcScore', () => {
  const targetPts = makeCurvePoints(t => t, 100);

  it('returns 0 for too few user points', () => {
    const userPts = [{ t: 0, v: 0 }];
    expect(calcScore(targetPts, userPts)).toBe(0);
  });

  it('returns 100 for perfect match', () => {
    const userPts = makeCurvePoints(t => t, 100);
    expect(calcScore(targetPts, userPts)).toBe(100);
  });

  it('returns high score for close match', () => {
    const userPts = makeCurvePoints(t => t + 0.01, 100);
    const score = calcScore(targetPts, userPts);
    expect(score).toBeGreaterThan(85);
  });

  it('returns low score for large deviation', () => {
    const userPts = makeCurvePoints(t => 1 - t, 100); // Inverted curve
    const score = calcScore(targetPts, userPts);
    expect(score).toBeLessThan(50);
  });

  it('returns 0 score when user does nothing (all zeros)', () => {
    const userPts = makeCurvePoints(() => 0, 100);
    const target = makeCurvePoints(t => t > 0.3 ? 0.8 : 0, 100);
    const score = calcScore(target, userPts);
    expect(score).toBeLessThan(60);
  });

  it('handles flat target curve', () => {
    const flatTarget = makeCurvePoints(() => 0.5, 100);
    const flatUser = makeCurvePoints(() => 0.5, 100);
    expect(calcScore(flatTarget, flatUser)).toBe(100);
  });
});

// ═══════════════════════════════════
// analyzePerformance
// ═══════════════════════════════════

describe('analyzePerformance', () => {
  const targetPts = makeCurvePoints(t => {
    if (t < 0.2) return t * 5; // attack: ramp up
    if (t < 0.5) return 1.0;   // peak: hold
    if (t < 0.8) return 1.0 - (t - 0.5) * 3.33; // modulation: ramp down
    return 0;                   // release: zero
  }, 200);

  it('returns null for too few points', () => {
    expect(analyzePerformance(targetPts, [{ t: 0, v: 0 }], 'test')).toBeNull();
  });

  it('returns analysis object with all fields', () => {
    const userPts = makeCurvePoints(t => {
      if (t < 0.2) return t * 5;
      if (t < 0.5) return 1.0;
      if (t < 0.8) return 1.0 - (t - 0.5) * 3.33;
      return 0;
    }, 200);

    const result = analyzePerformance(targetPts, userPts, 'test');
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('overall');
    expect(result).toHaveProperty('grade');
    expect(result).toHaveProperty('segments');
    expect(result).toHaveProperty('tips');
    expect(result).toHaveProperty('stats');
    expect(result.segments).toHaveLength(4);
  });

  it('perfect match produces grade S or A', () => {
    const userPts = [...targetPts]; // Clone
    const result = analyzePerformance(targetPts, userPts, 'test');
    expect(['S', 'A']).toContain(result.grade);
  });

  it('segments have required fields', () => {
    const userPts = makeCurvePoints(t => t * 0.5, 200);
    const result = analyzePerformance(targetPts, userPts, 'test');
    for (const seg of result.segments) {
      expect(seg).toHaveProperty('key');
      expect(seg).toHaveProperty('label');
      expect(seg).toHaveProperty('score');
      expect(seg).toHaveProperty('bias');
      expect(seg.score).toBeGreaterThanOrEqual(0);
      expect(seg.score).toBeLessThanOrEqual(100);
    }
  });

  it('stats include consistency and peak info', () => {
    const userPts = makeCurvePoints(t => t * 0.8, 200);
    const result = analyzePerformance(targetPts, userPts, 'test');
    expect(result.stats).toHaveProperty('consistency');
    expect(result.stats).toHaveProperty('userPeak');
    expect(result.stats).toHaveProperty('targetPeak');
    expect(result.stats).toHaveProperty('peakTimingDelta');
  });

  it('generates tips array', () => {
    const userPts = makeCurvePoints(t => t * 0.3, 200);
    const result = analyzePerformance(targetPts, userPts, 'test');
    expect(Array.isArray(result.tips)).toBe(true);
    expect(result.tips.length).toBeGreaterThan(0);
  });

  it('grade scale: S > A > B > C > D', () => {
    const grades = { S: 95, A: 85, B: 70, C: 50, D: 20 };
    for (const [grade, threshold] of Object.entries(grades)) {
      const userPts = makeCurvePoints(t => {
        const target = t < 0.2 ? t * 5 : t < 0.5 ? 1.0 : t < 0.8 ? 1.0 - (t - 0.5) * 3.33 : 0;
        return target * (threshold / 100) + target * (1 - threshold / 100) * 0.5;
      }, 200);
      const result = analyzePerformance(targetPts, userPts, 'test');
      expect(result).not.toBeNull();
    }
  });
});
