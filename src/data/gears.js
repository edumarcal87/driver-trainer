/**
 * Gear Shifting Exercises
 * 
 * These exercises train gear change timing and coordination.
 * The "gear" curve represents the TARGET gear at each point in time.
 * Value mapping: 0 = neutral, 0.17 = 1st, 0.33 = 2nd, 0.5 = 3rd, 0.67 = 4th, 0.83 = 5th, 1.0 = 6th
 * 
 * For scoring, we track:
 * - Whether the user is in the correct gear at each sample point
 * - Combined with throttle/brake timing for realistic scenarios
 * 
 * Two modes:
 * - Sequential (paddles): upshift/downshift via paddle buttons
 * - H-Pattern (manual): gear selection via H-shifter + clutch coordination
 */

// Gear value normalization: gear number (1-6) to 0-1 range
export const gearToValue = g => Math.max(0, Math.min(1, g / 6));
export const valueToGear = v => Math.round(v * 6);

// ═══════════════════════════════════════════
// SEQUENTIAL (PADDLE) EXERCISES
// ═══════════════════════════════════════════

export const SEQUENTIAL_EXERCISES = [
  {
    id: 'seq_upshift_basic',
    name: 'Subida de marchas',
    desc: 'Troque de 1ª até 6ª marcha no momento certo, acompanhando o acelerador.',
    icon: '⬆️',
    pedal: 'sequential',
    diff: 1,
    curves: {
      gear: t => {
        // 1st → 2nd → 3rd → 4th → 5th → 6th
        if (t < 0.12) return gearToValue(1);
        if (t < 0.28) return gearToValue(2);
        if (t < 0.44) return gearToValue(3);
        if (t < 0.60) return gearToValue(4);
        if (t < 0.78) return gearToValue(5);
        return gearToValue(6);
      },
      throttle: t => {
        // Lift-and-shift pattern: throttle dips briefly at each shift point
        const shifts = [0.12, 0.28, 0.44, 0.60, 0.78];
        for (const s of shifts) {
          if (t > s - 0.02 && t < s) return 1 - (t - (s - 0.02)) / 0.02 * 0.7; // lift
          if (t >= s && t < s + 0.02) return 0.3 + (t - s) / 0.02 * 0.7; // reapply
        }
        return t < 0.05 ? t / 0.05 : 1; // normal acceleration
      },
    },
    duration: 6000,
  },

  {
    id: 'seq_downshift_basic',
    name: 'Descida de marchas',
    desc: 'Reduza de 6ª até 2ª com freio — timing de redução na frenagem.',
    icon: '⬇️',
    pedal: 'sequential',
    diff: 1,
    curves: {
      gear: t => {
        if (t < 0.05) return gearToValue(6);
        if (t < 0.22) return gearToValue(5);
        if (t < 0.40) return gearToValue(4);
        if (t < 0.58) return gearToValue(3);
        if (t < 0.80) return gearToValue(2);
        return gearToValue(2);
      },
      brake: t => {
        if (t < 0.05) return 0;
        if (t < 0.10) return (t - 0.05) / 0.05;
        if (t < 0.75) return 1 - (t - 0.10) / 0.65 * 0.3; // trail while downshifting
        if (t < 0.90) return 0.7 - (t - 0.75) / 0.15 * 0.7;
        return 0;
      },
    },
    duration: 5000,
  },

  {
    id: 'seq_quick_shifts',
    name: 'Trocas rápidas',
    desc: 'Suba e desça marchas rapidamente — teste de reflexo com as borboletas.',
    icon: '⚡',
    pedal: 'sequential',
    diff: 2,
    curves: {
      gear: t => {
        // Quick up-down-up pattern
        if (t < 0.08) return gearToValue(2);
        if (t < 0.16) return gearToValue(3);
        if (t < 0.24) return gearToValue(4);
        if (t < 0.32) return gearToValue(5);
        if (t < 0.42) return gearToValue(4); // downshift
        if (t < 0.50) return gearToValue(3); // downshift
        if (t < 0.58) return gearToValue(4); // upshift again
        if (t < 0.66) return gearToValue(5);
        if (t < 0.76) return gearToValue(6);
        if (t < 0.86) return gearToValue(5);
        return gearToValue(4);
      },
      throttle: t => {
        const shifts = [0.08, 0.16, 0.24, 0.32, 0.42, 0.50, 0.58, 0.66, 0.76, 0.86];
        for (const s of shifts) {
          if (t > s - 0.015 && t < s + 0.015) return 0.4;
        }
        return 0.9;
      },
    },
    duration: 5000,
  },

  {
    id: 'seq_race_start',
    name: 'Largada — sequencial',
    desc: 'Largada de corrida: 1ª até 4ª marcha com aceleração máxima entre trocas.',
    icon: '🏁',
    pedal: 'sequential',
    diff: 2,
    curves: {
      gear: t => {
        if (t < 0.15) return gearToValue(1);
        if (t < 0.32) return gearToValue(2);
        if (t < 0.55) return gearToValue(3);
        if (t < 0.80) return gearToValue(4);
        return gearToValue(5);
      },
      throttle: t => {
        // Aggressive acceleration with brief lifts
        if (t < 0.03) return 0;
        const shifts = [0.15, 0.32, 0.55, 0.80];
        for (const s of shifts) {
          if (t > s - 0.02 && t < s + 0.02) return 0.3;
        }
        return 1;
      },
    },
    duration: 5000,
  },

  {
    id: 'seq_braking_downshift',
    name: 'Frenagem com reduções',
    desc: 'Freie de 6ª até 2ª na zona de frenagem — timing perfeito de cada redução.',
    icon: '🔻',
    pedal: 'sequential',
    diff: 3,
    curves: {
      gear: t => {
        if (t < 0.08) return gearToValue(6);
        if (t < 0.20) return gearToValue(5);
        if (t < 0.35) return gearToValue(4);
        if (t < 0.52) return gearToValue(3);
        if (t < 0.70) return gearToValue(2);
        return gearToValue(2);
      },
      brake: t => {
        if (t < 0.05) return 0;
        if (t < 0.10) return (t - 0.05) / 0.05;
        if (t < 0.65) return 1 - (t - 0.10) / 0.55 * 0.4; // trail
        if (t < 0.80) return 0.6 - (t - 0.65) / 0.15 * 0.6;
        return 0;
      },
      throttle: t => {
        // Brief blips during downshifts (rev matching)
        const shifts = [0.20, 0.35, 0.52, 0.70];
        for (const s of shifts) {
          if (t > s - 0.02 && t < s + 0.01) return 0.4; // blip
        }
        if (t < 0.75) return 0;
        return (t - 0.75) / 0.25; // accelerate out
      },
    },
    duration: 6000,
  },
];

// ═══════════════════════════════════════════
// H-PATTERN (MANUAL) EXERCISES
// ═══════════════════════════════════════════

export const HPATTERN_EXERCISES = [
  {
    id: 'hpat_upshift_basic',
    name: 'Subida H-Pattern',
    desc: 'Suba de 1ª a 6ª no H-shifter com embreagem. Precisão no engate.',
    icon: '🔧',
    pedal: 'hpattern',
    diff: 2,
    curves: {
      gear: t => {
        if (t < 0.12) return gearToValue(1);
        if (t < 0.28) return gearToValue(2);
        if (t < 0.44) return gearToValue(3);
        if (t < 0.60) return gearToValue(4);
        if (t < 0.78) return gearToValue(5);
        return gearToValue(6);
      },
      clutch: t => {
        // Clutch kicks at each shift point
        const shifts = [0.12, 0.28, 0.44, 0.60, 0.78];
        for (const s of shifts) {
          if (t > s - 0.03 && t < s - 0.01) return (t - (s - 0.03)) / 0.02; // press clutch
          if (t >= s - 0.01 && t < s + 0.01) return 1; // hold
          if (t >= s + 0.01 && t < s + 0.03) return 1 - (t - (s + 0.01)) / 0.02; // release
        }
        return 0;
      },
      throttle: t => {
        const shifts = [0.12, 0.28, 0.44, 0.60, 0.78];
        for (const s of shifts) {
          if (t > s - 0.02 && t < s + 0.02) return 0.2;
        }
        return t < 0.05 ? t / 0.05 : 1;
      },
    },
    duration: 7000,
  },

  {
    id: 'hpat_downshift_heel_toe',
    name: 'Redução com Heel-Toe',
    desc: 'Reduza com H-shifter usando heel-toe: freio + embreagem + blip de acelerador.',
    icon: '👟',
    pedal: 'hpattern',
    diff: 3,
    curves: {
      gear: t => {
        if (t < 0.10) return gearToValue(5);
        if (t < 0.30) return gearToValue(4);
        if (t < 0.52) return gearToValue(3);
        if (t < 0.75) return gearToValue(2);
        return gearToValue(2);
      },
      brake: t => {
        if (t < 0.07) return 0;
        if (t < 0.12) return (t - 0.07) / 0.05;
        if (t < 0.70) return 1 - (t - 0.12) / 0.58 * 0.4;
        if (t < 0.85) return 0.6 - (t - 0.70) / 0.15 * 0.6;
        return 0;
      },
      clutch: t => {
        const shifts = [0.30, 0.52, 0.75];
        for (const s of shifts) {
          if (t > s - 0.03 && t < s - 0.01) return (t - (s - 0.03)) / 0.02;
          if (t >= s - 0.01 && t < s + 0.01) return 1;
          if (t >= s + 0.01 && t < s + 0.03) return 1 - (t - (s + 0.01)) / 0.02;
        }
        return 0;
      },
      throttle: t => {
        // Heel-toe blips during downshift
        const shifts = [0.30, 0.52, 0.75];
        for (const s of shifts) {
          if (t > s - 0.02 && t < s + 0.01) return 0.5; // blip
        }
        if (t < 0.80) return 0;
        return (t - 0.80) / 0.20; // accelerate out
      },
    },
    duration: 7000,
  },

  {
    id: 'hpat_race_start',
    name: 'Largada — H-Pattern',
    desc: 'Largada com embreagem e câmbio H. Solte a embreagem + troque 1ª→2ª→3ª.',
    icon: '🏁',
    pedal: 'hpattern',
    diff: 2,
    curves: {
      gear: t => {
        if (t < 0.25) return gearToValue(1);
        if (t < 0.50) return gearToValue(2);
        if (t < 0.78) return gearToValue(3);
        return gearToValue(4);
      },
      clutch: t => {
        // Initial launch: full clutch then release
        if (t < 0.02) return 1;
        if (t < 0.15) return 1 - (t - 0.02) / 0.13;
        // Shift clutch kicks
        const shifts = [0.25, 0.50, 0.78];
        for (const s of shifts) {
          if (t > s - 0.03 && t < s - 0.01) return (t - (s - 0.03)) / 0.02;
          if (t >= s - 0.01 && t < s + 0.01) return 1;
          if (t >= s + 0.01 && t < s + 0.04) return 1 - (t - (s + 0.01)) / 0.03;
        }
        return 0;
      },
      throttle: t => {
        if (t < 0.02) return 0;
        if (t < 0.10) return (t - 0.02) / 0.08 * 0.7;
        const shifts = [0.25, 0.50, 0.78];
        for (const s of shifts) {
          if (t > s - 0.02 && t < s + 0.02) return 0.3;
        }
        return Math.min(1, 0.7 + t * 0.4);
      },
    },
    duration: 6000,
  },
];

export const ALL_GEAR_EXERCISES = [...SEQUENTIAL_EXERCISES, ...HPATTERN_EXERCISES];
