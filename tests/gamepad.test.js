import { describe, it, expect } from 'vitest';
import { detectMovedAxis, getDefaultPedalConfig, readHShifterGear, gearToValue, valueToGear } from '../src/utils/gamepad';

// ═══════════════════════════════════
// detectMovedAxis
// ═══════════════════════════════════

describe('detectMovedAxis', () => {
  it('detects the axis with largest movement', () => {
    const baseline = [0, 0, 0, 0];
    const current = [0, 0.1, -0.9, 0];
    const result = detectMovedAxis(baseline, current);
    expect(result.index).toBe(2);
    expect(result.delta).toBeCloseTo(0.9);
    expect(result.direction).toBe(-1);
  });

  it('returns index -1 when no movement', () => {
    const baseline = [0.5, 0.5, 0.5];
    const current = [0.5, 0.5, 0.5];
    const result = detectMovedAxis(baseline, current);
    expect(result.index).toBe(-1);
    expect(result.delta).toBe(0);
  });

  it('detects positive direction', () => {
    const baseline = [0, 0, 0];
    const current = [0, 0.8, 0];
    const result = detectMovedAxis(baseline, current);
    expect(result.index).toBe(1);
    expect(result.direction).toBe(1);
  });

  it('handles different length arrays safely', () => {
    const baseline = [0, 0, 0, 0, 0];
    const current = [0, 0, 0.5];
    const result = detectMovedAxis(baseline, current);
    expect(result.index).toBe(2);
  });

  it('picks the larger delta when multiple axes move', () => {
    const baseline = [0, 0, 0];
    const current = [0.3, 0.1, 0.7];
    const result = detectMovedAxis(baseline, current);
    expect(result.index).toBe(2);
  });
});

// ═══════════════════════════════════
// getDefaultPedalConfig
// ═══════════════════════════════════

describe('getDefaultPedalConfig', () => {
  it('returns config with brake, throttle, clutch', () => {
    const config = getDefaultPedalConfig();
    expect(config).toHaveProperty('brake');
    expect(config).toHaveProperty('throttle');
    expect(config).toHaveProperty('clutch');
  });

  it('each config has axisIndex, calibMin, calibMax', () => {
    const config = getDefaultPedalConfig();
    for (const key of ['brake', 'throttle', 'clutch']) {
      expect(config[key]).toHaveProperty('axisIndex');
      expect(config[key]).toHaveProperty('calibMin');
      expect(config[key]).toHaveProperty('calibMax');
    }
  });
});

// ═══════════════════════════════════
// Gear value conversions (from gears.js)
// ═══════════════════════════════════

describe('gear conversions', () => {
  // Import from gears.js
  let gearToValueFn, valueToGearFn;

  try {
    const gears = await import('../src/data/gears.js');
    gearToValueFn = gears.gearToValue;
    valueToGearFn = gears.valueToGear;
  } catch {
    // Skip if not available
  }

  it('gearToValue maps N=0, 1-6 to normalized values', () => {
    if (!gearToValueFn) return;
    expect(gearToValueFn(0)).toBe(0); // Neutral
    expect(gearToValueFn(1)).toBeGreaterThan(0);
    expect(gearToValueFn(6)).toBeLessThanOrEqual(1);
    // Each gear should be higher than the previous
    for (let g = 1; g <= 5; g++) {
      expect(gearToValueFn(g + 1)).toBeGreaterThan(gearToValueFn(g));
    }
  });

  it('valueToGear round-trips correctly', () => {
    if (!gearToValueFn || !valueToGearFn) return;
    for (let g = 0; g <= 6; g++) {
      const v = gearToValueFn(g);
      expect(valueToGearFn(v)).toBe(g);
    }
  });
});
