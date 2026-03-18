/**
 * Wheel Profiles — default axis/button mappings for known racing wheels.
 * 
 * The browser Gamepad API reports axes and buttons in different orders depending
 * on the wheel brand, model, and driver configuration. These profiles provide
 * sensible defaults so the wizard has a better starting point.
 * 
 * All wheels still go through the calibration wizard — these are just initial guesses.
 * 
 * Button mapping conventions:
 *   upshift/downshift = paddle shifter buttons
 *   hShifterBase = starting button index for H-shifter gears (1-6 = base+0 to base+5)
 *   hShifterReverse = button index for reverse gear
 */

export const WHEEL_PROFILES = [
  // ── Logitech ──
  {
    id: 'logitech_g29',
    brand: 'Logitech',
    model: 'G29 / G920 / Driving Force',
    icon: '🎮',
    detect: (id) => {
      const s = id.toLowerCase();
      return s.includes('g29') || s.includes('g920') || s.includes('driving force') || s.includes('046d:c24f') || s.includes('046d:c261') || s.includes('046d:c262');
    },
    defaultConfig: {
      brake:    { axisIndex: 5, calibMin: 1, calibMax: -1, invert: false },
      throttle: { axisIndex: 2, calibMin: 1, calibMax: -1, invert: false },
      clutch:   { axisIndex: 1, calibMin: 1, calibMax: -1, invert: false },
      steering: { axisIndex: 0, calibMin: -1, calibMax: 1, invert: false },
    },
    shifter: {
      upshift: 4,
      downshift: 5,
      hShifterBase: 12, // buttons 12-17 = gears 1-6
      hShifterReverse: 18,
    },
    notes: 'Eixos separados exigem "Use separate axes" no G HUB.',
  },
  {
    id: 'logitech_g923',
    brand: 'Logitech',
    model: 'G923 (TrueForce)',
    icon: '🎮',
    detect: (id) => {
      const s = id.toLowerCase();
      return s.includes('g923') || s.includes('046d:c266') || s.includes('046d:c267');
    },
    defaultConfig: {
      brake:    { axisIndex: 5, calibMin: 1, calibMax: -1, invert: false },
      throttle: { axisIndex: 2, calibMin: 1, calibMax: -1, invert: false },
      clutch:   { axisIndex: 1, calibMin: 1, calibMax: -1, invert: false },
      steering: { axisIndex: 0, calibMin: -1, calibMax: 1, invert: false },
    },
    shifter: {
      upshift: 4,
      downshift: 5,
      hShifterBase: 12,
      hShifterReverse: 18,
    },
    notes: 'Mapeamento semelhante ao G29. TrueForce requer driver Logitech.',
  },
  {
    id: 'logitech_g27',
    brand: 'Logitech',
    model: 'G27 / G25',
    icon: '🎮',
    detect: (id) => {
      const s = id.toLowerCase();
      return s.includes('g27') || s.includes('g25') || s.includes('046d:c29b') || s.includes('046d:c294');
    },
    defaultConfig: {
      brake:    { axisIndex: 2, calibMin: 1, calibMax: -1, invert: false },
      throttle: { axisIndex: 1, calibMin: 1, calibMax: -1, invert: false },
      clutch:   { axisIndex: 3, calibMin: 1, calibMax: -1, invert: false },
      steering: { axisIndex: 0, calibMin: -1, calibMax: 1, invert: false },
    },
    shifter: {
      upshift: 4,
      downshift: 5,
      hShifterBase: 12,
      hShifterReverse: 18,
    },
    notes: 'Modelo antigo — mapeamento de eixos pode variar.',
  },

  // ── Thrustmaster ──
  {
    id: 'thrustmaster_t300',
    brand: 'Thrustmaster',
    model: 'T300 RS / T300 GT',
    icon: '🔴',
    detect: (id) => {
      const s = id.toLowerCase();
      return s.includes('t300') || s.includes('044f:b66e') || s.includes('044f:b66f') || s.includes('044f:b66d');
    },
    defaultConfig: {
      brake:    { axisIndex: 2, calibMin: 1, calibMax: -1, invert: false },
      throttle: { axisIndex: 1, calibMin: 1, calibMax: -1, invert: false },
      clutch:   { axisIndex: 5, calibMin: 1, calibMax: -1, invert: false },
      steering: { axisIndex: 0, calibMin: -1, calibMax: 1, invert: false },
    },
    shifter: {
      upshift: 5,
      downshift: 4,
      hShifterBase: -1, // no H-shifter by default, needs TH8A add-on
      hShifterReverse: -1,
    },
    notes: 'Pedais T3PA: eixos podem variar. Paddles invertidos em relação ao G29.',
  },
  {
    id: 'thrustmaster_t248',
    brand: 'Thrustmaster',
    model: 'T248',
    icon: '🔴',
    detect: (id) => {
      const s = id.toLowerCase();
      return s.includes('t248') || s.includes('044f:b696');
    },
    defaultConfig: {
      brake:    { axisIndex: 2, calibMin: 1, calibMax: -1, invert: false },
      throttle: { axisIndex: 1, calibMin: 1, calibMax: -1, invert: false },
      clutch:   { axisIndex: -1, calibMin: 0, calibMax: 1, invert: false }, // T248 has no clutch pedal by default
      steering: { axisIndex: 0, calibMin: -1, calibMax: 1, invert: false },
    },
    shifter: {
      upshift: 5,
      downshift: 4,
      hShifterBase: -1,
      hShifterReverse: -1,
    },
    notes: 'Sem pedal de embreagem por padrão. Paddles no volante.',
  },
  {
    id: 'thrustmaster_tx',
    brand: 'Thrustmaster',
    model: 'TX / TMX / T150',
    icon: '🔴',
    detect: (id) => {
      const s = id.toLowerCase();
      return s.includes('tmx') || s.includes('t150') || s.includes('tx ') || s.includes('044f:b67f') || s.includes('044f:b677') || s.includes('044f:b669');
    },
    defaultConfig: {
      brake:    { axisIndex: 2, calibMin: 1, calibMax: -1, invert: false },
      throttle: { axisIndex: 1, calibMin: 1, calibMax: -1, invert: false },
      clutch:   { axisIndex: -1, calibMin: 0, calibMax: 1, invert: false },
      steering: { axisIndex: 0, calibMin: -1, calibMax: 1, invert: false },
    },
    shifter: {
      upshift: 5,
      downshift: 4,
      hShifterBase: -1,
      hShifterReverse: -1,
    },
    notes: 'Modelo entrada Thrustmaster. 2 pedais padrão.',
  },

  // ── Fanatec ──
  {
    id: 'fanatec_csl',
    brand: 'Fanatec',
    model: 'CSL DD / CSL Elite',
    icon: '🟢',
    detect: (id) => {
      const s = id.toLowerCase();
      return s.includes('fanatec') || s.includes('csl') || s.includes('0eb7:');
    },
    defaultConfig: {
      brake:    { axisIndex: 1, calibMin: 0, calibMax: 1, invert: false },
      throttle: { axisIndex: 2, calibMin: 0, calibMax: 1, invert: false },
      clutch:   { axisIndex: 3, calibMin: 0, calibMax: 1, invert: false },
      steering: { axisIndex: 0, calibMin: -1, calibMax: 1, invert: false },
    },
    shifter: {
      upshift: 4,
      downshift: 5,
      hShifterBase: -1, // needs Fanatec shifter add-on
      hShifterReverse: -1,
    },
    notes: 'Fanatec usa eixos 0-1 (não invertidos). Confirme no wizard.',
  },
  {
    id: 'fanatec_dd',
    brand: 'Fanatec',
    model: 'DD1 / DD2 / Podium',
    icon: '🟢',
    detect: (id) => {
      const s = id.toLowerCase();
      return (s.includes('fanatec') && (s.includes('dd') || s.includes('podium')));
    },
    defaultConfig: {
      brake:    { axisIndex: 1, calibMin: 0, calibMax: 1, invert: false },
      throttle: { axisIndex: 2, calibMin: 0, calibMax: 1, invert: false },
      clutch:   { axisIndex: 3, calibMin: 0, calibMax: 1, invert: false },
      steering: { axisIndex: 0, calibMin: -1, calibMax: 1, invert: false },
    },
    shifter: {
      upshift: 4,
      downshift: 5,
      hShifterBase: 12,
      hShifterReverse: 18,
    },
    notes: 'Base premium. Mapeamento de eixos pode depender do firmware.',
  },

  // ── Other / MOZA ──
  {
    id: 'moza_r',
    brand: 'MOZA',
    model: 'R5 / R9 / R12 / R16 / R21',
    icon: '🟡',
    detect: (id) => {
      const s = id.toLowerCase();
      return s.includes('moza') || s.includes('gudsen');
    },
    defaultConfig: {
      brake:    { axisIndex: 1, calibMin: 0, calibMax: 1, invert: false },
      throttle: { axisIndex: 2, calibMin: 0, calibMax: 1, invert: false },
      clutch:   { axisIndex: 3, calibMin: 0, calibMax: 1, invert: false },
      steering: { axisIndex: 0, calibMin: -1, calibMax: 1, invert: false },
    },
    shifter: {
      upshift: 4,
      downshift: 5,
      hShifterBase: -1,
      hShifterReverse: -1,
    },
    notes: 'MOZA Direct Drive — confirme eixos no wizard.',
  },

  // ── Simagic ──
  {
    id: 'simagic',
    brand: 'Simagic',
    model: 'Alpha / M10 / FX',
    icon: '🔵',
    detect: (id) => {
      const s = id.toLowerCase();
      return s.includes('simagic') || s.includes('alpha');
    },
    defaultConfig: {
      brake:    { axisIndex: 1, calibMin: 0, calibMax: 1, invert: false },
      throttle: { axisIndex: 2, calibMin: 0, calibMax: 1, invert: false },
      clutch:   { axisIndex: 3, calibMin: 0, calibMax: 1, invert: false },
      steering: { axisIndex: 0, calibMin: -1, calibMax: 1, invert: false },
    },
    shifter: {
      upshift: 4,
      downshift: 5,
      hShifterBase: -1,
      hShifterReverse: -1,
    },
    notes: 'Simagic DD — confirme eixos no wizard.',
  },
];

/**
 * Auto-detect wheel profile from gamepad ID string.
 * Returns the matching profile or null.
 */
export function detectWheelProfile(gamepadId) {
  if (!gamepadId) return null;
  for (const profile of WHEEL_PROFILES) {
    if (profile.detect(gamepadId)) return profile;
  }
  return null;
}

/**
 * Get default pedal config for a detected wheel.
 * Falls back to G29 defaults if unknown.
 */
export function getWheelDefaultConfig(gamepadId) {
  const profile = detectWheelProfile(gamepadId);
  if (profile) return { ...profile.defaultConfig };
  // Generic fallback (G29-like)
  return {
    brake:    { axisIndex: 5, calibMin: 1, calibMax: -1, invert: false },
    throttle: { axisIndex: 2, calibMin: 1, calibMax: -1, invert: false },
    clutch:   { axisIndex: 1, calibMin: 1, calibMax: -1, invert: false },
    steering: { axisIndex: 0, calibMin: -1, calibMax: 1, invert: false },
  };
}

/**
 * Get shifter button config for a detected wheel.
 */
export function getWheelShifterConfig(gamepadId) {
  const profile = detectWheelProfile(gamepadId);
  if (profile) return { ...profile.shifter };
  return { upshift: 4, downshift: 5, hShifterBase: 12, hShifterReverse: 18 };
}

/**
 * Save wheel calibration per gamepad ID to localStorage.
 */
export function saveWheelCalibration(gamepadId, pedalConfigs) {
  if (!gamepadId) return;
  try {
    const stored = JSON.parse(localStorage.getItem('bt_wheelCalibrations') || '{}');
    stored[gamepadId] = { pedalConfigs, savedAt: Date.now() };
    localStorage.setItem('bt_wheelCalibrations', JSON.stringify(stored));
  } catch {}
}

/**
 * Load saved calibration for a specific wheel.
 * Returns null if no saved calibration exists.
 */
export function loadWheelCalibration(gamepadId) {
  if (!gamepadId) return null;
  try {
    const stored = JSON.parse(localStorage.getItem('bt_wheelCalibrations') || '{}');
    return stored[gamepadId]?.pedalConfigs || null;
  } catch { return null; }
}

/**
 * List all saved wheel calibrations.
 */
export function listSavedWheels() {
  try {
    const stored = JSON.parse(localStorage.getItem('bt_wheelCalibrations') || '{}');
    return Object.entries(stored).map(([id, data]) => ({
      gamepadId: id,
      profile: detectWheelProfile(id),
      pedalConfigs: data.pedalConfigs,
      savedAt: data.savedAt,
    }));
  } catch { return []; }
}
