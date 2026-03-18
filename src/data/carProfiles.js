/**
 * Car Profiles — modify exercise curves based on vehicle characteristics.
 * 
 * Instead of duplicating exercises, profiles apply transformations:
 * - Brake: attack speed, trail length, max pressure
 * - Throttle: application rate, max partial, exit aggression
 * - Steering: input speed, max angle, smoothness
 * - Clutch: engagement speed
 * - Gear: shift timing
 * 
 * Each profile has modifiers per input type that wrap the original curve function.
 */

export const CAR_PROFILES = [
  {
    id: 'default',
    name: 'Padrão',
    desc: 'Curvas originais sem modificação. Ideal para aprender os fundamentos.',
    icon: '🏁',
    color: '#5a5a5a',
    modifiers: {
      // No modifications — identity
      brake: (fn) => fn,
      throttle: (fn) => fn,
      steering: (fn) => fn,
      clutch: (fn) => fn,
      gear: (fn) => fn,
    },
    durationScale: 1.0,
  },
  {
    id: 'gt3',
    name: 'GT3',
    desc: 'Carro pesado com muito downforce. Frenagem mais longa, trail gradual, aceleração progressiva.',
    icon: '🏎️',
    color: '#e74c3c',
    modifiers: {
      // GT3: longer braking zones, more gradual trail, softer attack
      brake: (fn) => (t) => {
        const v = fn(t);
        // Stretch the braking zone: compress time so it takes longer
        // Also soften the peak slightly (heavy car = more gradual)
        const stretched = fn(Math.pow(t, 0.85));
        return stretched * 0.95; // slightly less peak (ABS helps)
      },
      // GT3: more progressive throttle application (traction control helps but still careful)
      throttle: (fn) => (t) => {
        const v = fn(t);
        return Math.pow(v, 1.15); // slightly more progressive curve
      },
      // GT3: slightly slower steering (heavier car, more grip = less steering needed)
      steering: (fn) => (t) => {
        const v = fn(t);
        const center = 0.5;
        const deviation = v - center;
        return center + deviation * 0.9; // 10% less steering angle needed
      },
      clutch: (fn) => fn, // GT3 typically no clutch (paddle only)
      gear: (fn) => (t) => {
        // GT3: slightly later shifts (higher rev range)
        return fn(Math.max(0, t - 0.02));
      },
    },
    durationScale: 1.15, // 15% longer exercises (longer braking zones)
  },
  {
    id: 'formula',
    name: 'Fórmula / Open Wheel',
    desc: 'Carro leve com grip extremo. Frenagem curta e agressiva, reações rápidas, pouco trail.',
    icon: '🏆',
    color: '#f1c40f',
    modifiers: {
      // Formula: shorter, more aggressive braking
      brake: (fn) => (t) => {
        const v = fn(Math.pow(t, 1.2)); // compress time = faster everything
        return Math.min(1, v * 1.05); // slightly higher peak
      },
      // Formula: more aggressive throttle (lots of downforce at speed)
      throttle: (fn) => (t) => {
        const v = fn(t);
        return Math.pow(v, 0.85); // more aggressive curve (earlier application)
      },
      // Formula: quicker, more precise steering (lighter car, more responsive)
      steering: (fn) => (t) => {
        const v = fn(t);
        const center = 0.5;
        const deviation = v - center;
        return center + deviation * 1.1; // 10% more steering angle (less grip in slow corners)
      },
      clutch: (fn) => fn, // Formula has no clutch (paddle only)
      gear: (fn) => (t) => {
        // Formula: earlier shifts (lower rev range, quick gearbox)
        return fn(Math.min(1, t + 0.015));
      },
    },
    durationScale: 0.85, // 15% shorter exercises (quicker everything)
  },
  {
    id: 'touring',
    name: 'Turismo / Street',
    desc: 'Carro de rua com menos grip. Frenagem mais cedo, inputs suaves, margens maiores de segurança.',
    icon: '🚗',
    color: '#3498db',
    modifiers: {
      // Touring: earlier, softer braking (less grip = more careful)
      brake: (fn) => (t) => {
        const v = fn(Math.pow(t, 0.8)); // stretch time = start earlier
        return v * 0.85; // less peak pressure (less grip)
      },
      // Touring: much more progressive throttle (easy to spin without TC)
      throttle: (fn) => (t) => {
        const v = fn(t);
        return Math.pow(v, 1.3); // very progressive
      },
      // Touring: smoother, less aggressive steering
      steering: (fn) => (t) => {
        const v = fn(t);
        const center = 0.5;
        const deviation = v - center;
        return center + deviation * 0.85; // less steering needed (understeer-prone)
      },
      // Touring: slower clutch engagement (road car gearbox)
      clutch: (fn) => (t) => {
        const v = fn(t);
        return Math.pow(v, 0.9); // slightly slower engagement
      },
      gear: (fn) => (t) => {
        // Touring: earlier shifts (protect engine, comfort)
        return fn(Math.min(1, t + 0.01));
      },
    },
    durationScale: 1.2, // 20% longer exercises (more time needed)
  },
];

/**
 * Apply a car profile to a single curve function.
 * @param {Function} curveFn - original curve function (t => value)
 * @param {string} inputType - 'brake', 'throttle', 'steering', 'clutch', 'gear'
 * @param {object} profile - car profile from CAR_PROFILES
 * @returns {Function} modified curve function
 */
export function applyProfile(curveFn, inputType, profile) {
  if (!profile || profile.id === 'default') return curveFn;
  const modifier = profile.modifiers?.[inputType];
  if (!modifier) return curveFn;
  return modifier(curveFn);
}

/**
 * Apply profile to all curves of a combined exercise.
 * @param {object} curves - { brake: fn, throttle: fn, ... }
 * @param {object} profile - car profile
 * @returns {object} modified curves
 */
export function applyProfileToCurves(curves, profile) {
  if (!profile || profile.id === 'default') return curves;
  const modified = {};
  for (const [key, fn] of Object.entries(curves)) {
    modified[key] = applyProfile(fn, key, profile);
  }
  return modified;
}

/**
 * Get exercise duration scaled by car profile.
 */
export function getProfileDuration(baseDuration, profile) {
  if (!profile || profile.id === 'default') return baseDuration;
  return Math.round(baseDuration * (profile.durationScale || 1));
}
