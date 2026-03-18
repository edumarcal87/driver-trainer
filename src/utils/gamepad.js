/**
 * G29 Gamepad API axis mapping.
 *
 * IMPORTANT: The G29 axis layout via the browser Gamepad API varies depending
 * on the Logitech G HUB / LGS driver configuration:
 *
 *   Combined mode (default G HUB):
 *     axes[0] = steering, axes[1] = combined throttle(-)/brake(+)
 *
 *   Separate mode (G HUB "Use separate axes" or spenibus mapping):
 *     axes[0] = steering
 *     axes[1] = throttle (1.0 = released, -1.0 = fully pressed)
 *     axes[2] = brake    (1.0 = released, -1.0 = fully pressed)
 *     axes[3] = clutch   (1.0 = released, -1.0 = fully pressed)
 *
 * Because this varies, we use a wizard-based detection approach where the
 * user physically presses each pedal so we map them correctly.
 */

/**
 * Reads a pedal value from a gamepad given axis config.
 * @param {object} config - { axisIndex, calibMin, calibMax, invert }
 * @returns {number} 0-1 normalized pedal value
 */
export function readPedal(config) {
  const gamepads = navigator.getGamepads();
  for (const gp of gamepads) {
    if (!gp) continue;
    const { axisIndex, calibMin, calibMax, invert } = config;
    if (axisIndex >= 0 && axisIndex < gp.axes.length) {
      const raw = gp.axes[axisIndex];
      const range = calibMax - calibMin;
      let val = range === 0 ? 0 : (raw - calibMin) / range;
      if (invert) val = 1 - val;
      return Math.max(0, Math.min(1, val));
    }
  }
  return 0;
}

/**
 * Returns all current axis values from the first connected gamepad.
 */
export function readAllAxes() {
  const gamepads = navigator.getGamepads();
  for (const gp of gamepads) {
    if (!gp) continue;
    return [...gp.axes];
  }
  return [];
}

/**
 * Returns all button values from the first connected gamepad.
 */
export function readAllButtons() {
  const gamepads = navigator.getGamepads();
  for (const gp of gamepads) {
    if (!gp) continue;
    return gp.buttons.map(b => ({ pressed: b.pressed, value: b.value }));
  }
  return [];
}

/**
 * Detects which axis moved the most from a baseline snapshot.
 * Used in the pedal wizard to auto-detect axis mapping.
 * @param {number[]} baseline - axis values when idle
 * @param {number[]} current - axis values when pedal is pressed
 * @returns {{ index: number, delta: number, direction: number }}
 */
export function detectMovedAxis(baseline, current) {
  let best = { index: -1, delta: 0, direction: 0 };
  for (let i = 0; i < Math.min(baseline.length, current.length); i++) {
    const delta = Math.abs(current[i] - baseline[i]);
    if (delta > best.delta) {
      best = { index: i, delta, direction: Math.sign(current[i] - baseline[i]) };
    }
  }
  return best;
}

/**
 * Reads paddle shifter buttons.
 * Default: Button 4 = upshift, Button 5 = downshift (G29).
 * Configurable via shifterConfig.
 */
export function readShifterButtons(shifterConfig) {
  const up = shifterConfig?.upshift ?? 4;
  const down = shifterConfig?.downshift ?? 5;
  const gamepads = navigator.getGamepads();
  for (const gp of gamepads) {
    if (!gp) continue;
    return {
      upshift: gp.buttons[up]?.pressed || false,
      downshift: gp.buttons[down]?.pressed || false,
    };
  }
  return { upshift: false, downshift: false };
}

/**
 * Reads H-shifter gear position.
 * Default: buttons 12-17 = gears 1-6, button 18 = reverse (G29).
 * Configurable via shifterConfig.
 * Returns 0 = neutral, 1-6 = gear, -1 = reverse
 */
export function readHShifterGear(shifterConfig) {
  const base = shifterConfig?.hShifterBase ?? 12;
  const rev = shifterConfig?.hShifterReverse ?? 18;
  if (base < 0) return 0; // no H-shifter
  const gamepads = navigator.getGamepads();
  for (const gp of gamepads) {
    if (!gp) continue;
    if (rev >= 0 && gp.buttons[rev]?.pressed) return -1;
    for (let g = 1; g <= 6; g++) {
      if (gp.buttons[base + g - 1]?.pressed) return g;
    }
    return 0;
  }
  return 0;
}

export function isG29(gamepadId) {
  const id = (gamepadId || '').toLowerCase();
  return id.includes('g29') || id.includes('g920') || id.includes('driving force');
}

/**
 * Default pedal configs for G29.
 * G29 c24f mapping: brake=axis5, throttle=axis2, clutch=axis1, steering=axis0
 * Pedals go from 1.0 (released) to -1.0 (fully pressed)
 * Steering goes from -1.0 (full left) to +1.0 (full right)
 */
export function getDefaultPedalConfig() {
  return {
    brake:    { axisIndex: 5, calibMin: 1, calibMax: -1, invert: false },
    throttle: { axisIndex: 2, calibMin: 1, calibMax: -1, invert: false },
    clutch:   { axisIndex: 1, calibMin: 1, calibMax: -1, invert: false },
    steering: { axisIndex: 0, calibMin: -1, calibMax: 1, invert: false },
  };
}

/**
 * Reads steering as 0..1 where 0.5 = center.
 * Raw axis is -1 (full left) to +1 (full right).
 */
export function readSteering(config) {
  const gamepads = navigator.getGamepads();
  for (const gp of gamepads) {
    if (!gp) continue;
    const { axisIndex, calibMin, calibMax, invert } = config;
    if (axisIndex >= 0 && axisIndex < gp.axes.length) {
      const raw = gp.axes[axisIndex];
      const range = calibMax - calibMin;
      let val = range === 0 ? 0.5 : (raw - calibMin) / range;
      if (invert) val = 1 - val;
      return Math.max(0, Math.min(1, val));
    }
  }
  return 0.5;
}
