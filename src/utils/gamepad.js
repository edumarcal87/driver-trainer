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
 * Checks if a paddle shifter button is pressed (button index 4 or 5 on G29).
 */
export function readShifterButtons() {
  const gamepads = navigator.getGamepads();
  for (const gp of gamepads) {
    if (!gp) continue;
    return {
      upshift: gp.buttons[5]?.pressed || gp.buttons[4]?.pressed || false,
      downshift: gp.buttons[4]?.pressed || gp.buttons[5]?.pressed || false,
    };
  }
  return { upshift: false, downshift: false };
}

export function isG29(gamepadId) {
  const id = (gamepadId || '').toLowerCase();
  return id.includes('g29') || id.includes('g920') || id.includes('driving force');
}

/**
 * Default pedal configs (will be overridden by wizard).
 */
export function getDefaultPedalConfig() {
  return {
    brake:    { axisIndex: 2, calibMin: 1, calibMax: -1, invert: false },
    throttle: { axisIndex: 1, calibMin: 1, calibMax: -1, invert: false },
    clutch:   { axisIndex: 3, calibMin: 1, calibMax: -1, invert: false },
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
