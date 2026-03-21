import { describe, it, expect } from 'vitest';
import { generateSessionReport } from '../src/utils/coaching';

// ═══════════════════════════════════
// Helper to create mock session entries
// ═══════════════════════════════════

function mockEntry(exId, score, opts = {}) {
  return {
    exId,
    exName: opts.exName || exId,
    pedal: opts.pedal || 'brake',
    score,
    grade: score >= 90 ? 'S' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 50 ? 'C' : 'D',
    timestamp: opts.timestamp || Date.now(),
    segments: opts.segments || [
      { key: 'attack', score: score + 5, label: 'Ataque' },
      { key: 'peak', score: score - 5, label: 'Pico' },
      { key: 'modulation', score: score, label: 'Modulação' },
      { key: 'release', score: score + 10, label: 'Liberação' },
    ],
  };
}

// ═══════════════════════════════════
// generateSessionReport
// ═══════════════════════════════════

describe('generateSessionReport', () => {
  it('returns null for empty history', () => {
    expect(generateSessionReport([])).toBeNull();
  });

  it('returns report for single entry', () => {
    const report = generateSessionReport([mockEntry('b_trail', 75)]);
    expect(report).not.toBeNull();
    expect(report).toHaveProperty('exerciseEvolutions');
    expect(report).toHaveProperty('overallStats');
    expect(report.exerciseEvolutions).toHaveLength(1);
  });

  it('tracks evolution across multiple attempts', () => {
    const history = [
      mockEntry('b_trail', 50, { timestamp: 1000 }),
      mockEntry('b_trail', 65, { timestamp: 2000 }),
      mockEntry('b_trail', 80, { timestamp: 3000 }),
    ];
    const report = generateSessionReport(history);
    const evo = report.exerciseEvolutions[0];
    expect(evo.trend).toBe(30); // 80 - 50
    expect(evo.best.score).toBe(80);
  });

  it('handles multiple exercises', () => {
    const history = [
      mockEntry('b_trail', 70, { timestamp: 1000 }),
      mockEntry('b_threshold', 85, { timestamp: 2000 }),
      mockEntry('b_trail', 75, { timestamp: 3000 }),
    ];
    const report = generateSessionReport(history);
    expect(report.exerciseEvolutions).toHaveLength(2);
  });

  it('overallStats computes average correctly', () => {
    const history = [
      mockEntry('b_trail', 60, { timestamp: 1000 }),
      mockEntry('b_trail', 80, { timestamp: 2000 }),
    ];
    const report = generateSessionReport(history);
    expect(report.overallStats.avgScore).toBe(70);
  });

  it('identifies weakest segment', () => {
    const history = [
      mockEntry('b_trail', 70, {
        timestamp: 1000,
        segments: [
          { key: 'attack', score: 90 },
          { key: 'peak', score: 40 },
          { key: 'modulation', score: 80 },
          { key: 'release', score: 85 },
        ],
      }),
    ];
    const report = generateSessionReport(history);
    const evo = report.exerciseEvolutions[0];
    expect(evo.weakestSegment.key).toBe('peak');
  });

  it('handles entries without segments gracefully', () => {
    const history = [
      { exId: 'b_trail', exName: 'Trail', pedal: 'brake', score: 70, timestamp: 1000 },
    ];
    const report = generateSessionReport(history);
    expect(report).not.toBeNull();
  });
});
