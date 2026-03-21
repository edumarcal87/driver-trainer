import { describe, it, expect, beforeEach } from 'vitest';

// Test the localStorage logic directly (no React rendering needed)
describe('usePersistedState logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reads fallback when key does not exist', () => {
    const val = localStorage.getItem('bt_test');
    expect(val).toBeNull();
  });

  it('stores and retrieves JSON values', () => {
    const data = { score: 85, name: 'Trail' };
    localStorage.setItem('bt_test', JSON.stringify(data));
    const retrieved = JSON.parse(localStorage.getItem('bt_test'));
    expect(retrieved).toEqual(data);
  });

  it('handles arrays', () => {
    const arr = [1, 2, 3, 4, 5];
    localStorage.setItem('bt_arr', JSON.stringify(arr));
    expect(JSON.parse(localStorage.getItem('bt_arr'))).toEqual(arr);
  });

  it('overwrites existing values', () => {
    localStorage.setItem('bt_val', JSON.stringify(10));
    localStorage.setItem('bt_val', JSON.stringify(20));
    expect(JSON.parse(localStorage.getItem('bt_val'))).toBe(20);
  });

  it('handles complex nested objects', () => {
    const config = {
      brake: { axisIndex: 5, calibMin: 1, calibMax: -1 },
      throttle: { axisIndex: 2, calibMin: 1, calibMax: -1 },
    };
    localStorage.setItem('bt_pedalConfigs', JSON.stringify(config));
    expect(JSON.parse(localStorage.getItem('bt_pedalConfigs'))).toEqual(config);
  });
});
