/**
 * Parses a CSV telemetry file and returns { data, columns, sim }.
 * Supports: iRacing (Mu CSV), MoTeC exports (ACC, AMS2, rFactor2, LMU),
 * AC Telemetrick, SRT exports, and any generic CSV.
 */
export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 3) return null;

  // Detect delimiter
  const firstLine = lines[0];
  const delim = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';

  const headers = firstLine.split(delim).map(h => h.trim().replace(/"/g, '').toLowerCase());

  const COL_NAMES = {
    brake: ['brake', 'brake%', 'brakeinput', 'brake_input', 'brake (%)', 'brakepedal', 'brake_pct', 'brake_raw'],
    throttle: ['throttle', 'throttle%', 'throttleinput', 'throttle_input', 'throttle (%)', 'gas', 'throttle_pct'],
    steering: ['steering', 'steer', 'steeringangle', 'steering_angle', 'steer_angle', 'steerwheelangle'],
    gear: ['gear', 'gear_number', 'gears', 'n_gear'],
    speed: ['speed', 'speed (km/h)', 'speed (mph)', 'vcar', 'groundspeed', 'velocity'],
    dist: ['distance', 'dist', 'lapdist', 'lap_dist', 'lapdistpct', 'trackposition', 'lap distance', 'distfromstart', 'normalizedtrackpos', 'normalised_car_position', 'lap_distance'],
    time: ['time', 'laptime', 'elapsed', 'timestamp', 'sessiontime', 'lap_time', 'sampledist'],
    lap: ['lap', 'lap_number', 'lapcount', 'lapnumber', 'current_lap'],
    rpm: ['rpm', 'rpms', 'engine_rpm', 'enginerpm'],
  };

  const findCol = (names) => headers.findIndex(h => names.some(n => h === n || h.includes(n)));

  const cols = {};
  for (const [key, names] of Object.entries(COL_NAMES)) cols[key] = findCol(names);

  if (cols.brake === -1) return null;

  // Detect sim from header patterns
  let sim = 'Desconhecido';
  const headerStr = headers.join(' ');
  if (headerStr.includes('lapdistpct') || headerStr.includes('sessiontime')) sim = 'iRacing';
  else if (headerStr.includes('normalised_car_position') || headerStr.includes('packet_id')) sim = 'ACC';
  else if (headerStr.includes('normalizedtrackpos')) sim = 'Assetto Corsa';
  else if (headerStr.includes('vcar') || headerStr.includes('steerwheelangle')) sim = 'rFactor2 / LMU / AMS2';
  else if (headerStr.includes('lap_distance')) sim = 'Sim Racing Telemetry';
  else if (headerStr.includes('n_gear') || headerStr.includes('drs')) sim = 'F1 25 / EA Sports';

  // Detect if row 1 is a units row (non-numeric)
  let dataStart = 1;
  const testVal = lines[1].split(delim)[cols.brake];
  if (testVal && isNaN(parseFloat(testVal.replace(/"/g, '')))) dataStart = 2;

  const data = [];
  for (let i = dataStart; i < lines.length; i++) {
    const parts = lines[i].split(delim).map(c => parseFloat(c.replace(/"/g, '')));
    const brake = parts[cols.brake];
    if (isNaN(brake)) continue;

    const row = { brake: brake > 1 ? brake / 100 : brake };
    if (cols.throttle >= 0 && !isNaN(parts[cols.throttle])) row.throttle = parts[cols.throttle] > 1 ? parts[cols.throttle] / 100 : parts[cols.throttle];
    if (cols.steering >= 0 && !isNaN(parts[cols.steering])) row.steering = parts[cols.steering];
    if (cols.gear >= 0 && !isNaN(parts[cols.gear])) row.gear = parts[cols.gear];
    if (cols.speed >= 0 && !isNaN(parts[cols.speed])) row.speed = parts[cols.speed];
    if (cols.dist >= 0 && !isNaN(parts[cols.dist])) row.dist = parts[cols.dist];
    if (cols.time >= 0 && !isNaN(parts[cols.time])) row.time = parts[cols.time];
    if (cols.lap >= 0 && !isNaN(parts[cols.lap])) row.lap = parts[cols.lap];
    if (cols.rpm >= 0 && !isNaN(parts[cols.rpm])) row.rpm = parts[cols.rpm];
    data.push(row);
  }

  if (data.length < 10) return null;

  const detected = Object.entries(cols).filter(([, v]) => v >= 0).map(([k]) => k);
  return { data, columns: detected, sim, rowCount: data.length };
}

/**
 * Splits data into laps using the lap column.
 */
export function splitByLap(data) {
  if (!data[0]?.lap && data[0]?.lap !== 0) return { 0: data };
  const laps = {};
  for (const row of data) {
    const lap = row.lap ?? 0;
    if (!laps[lap]) laps[lap] = [];
    laps[lap].push(row);
  }
  return laps;
}

/**
 * Generates a lap summary for the UI.
 */
export function getLapSummary(laps) {
  return Object.entries(laps).map(([lap, rows]) => {
    const avgBrake = rows.reduce((s, r) => s + (r.brake || 0), 0) / rows.length;
    const avgThrottle = rows.reduce((s, r) => s + (r.throttle || 0), 0) / rows.length;
    const maxSpeed = Math.max(...rows.filter(r => r.speed != null).map(r => r.speed), 0);
    const brakeZones = detectBrakeZones(rows).length;
    return { lap: Number(lap), samples: rows.length, avgBrake: Math.round(avgBrake * 100), avgThrottle: Math.round(avgThrottle * 100), maxSpeed: Math.round(maxSpeed), brakeZones };
  });
}

/**
 * Detects braking zones from parsed telemetry data.
 * Returns array of { startIdx, endIdx, points, peak, label }.
 */
export function detectBrakeZones(data) {
  const zones = [];
  let inZone = false;
  let start = 0;
  const threshold = 0.05;

  for (let i = 0; i < data.length; i++) {
    if (!inZone && data[i].brake > threshold) {
      inZone = true;
      start = i;
    } else if (inZone && data[i].brake <= threshold) {
      inZone = false;
      const len = i - start;
      if (len > 8) {
        const zone = data.slice(start, i);
        const peak = Math.max(...zone.map((d) => d.brake));
        if (peak > 0.15) {
          zones.push({
            startIdx: start,
            endIdx: i,
            points: zone,
            peak,
            label:
              data[start].dist !== undefined
                ? `${Math.round(data[start].dist)}m`
                : `@${((start / data.length) * 100).toFixed(0)}%`,
          });
        }
      }
    }
  }
  return zones;
}

/**
 * Converts a detected brake zone into an exercise object.
 */
export function zoneToExercise(zone, idx) {
  const p = zone.points;
  const maxBrake = zone.peak;
  const normalized = p.map((d, i) => ({
    t: i / (p.length - 1),
    v: d.brake / maxBrake,
  }));

  return {
    id: `telem_${idx}`,
    name: `Zona ${idx + 1} — ${zone.label}`,
    desc: `Pico: ${Math.round(zone.peak * 100)}% | ${p.length} amostras`,
    icon: '📊',
    curve: (t) => {
      if (normalized.length < 2) return 0;
      const x = t * (normalized.length - 1);
      const lo = Math.floor(x);
      const hi = Math.min(lo + 1, normalized.length - 1);
      const frac = x - lo;
      return normalized[lo].v * (1 - frac) + normalized[hi].v * frac;
    },
    duration: Math.max(2000, Math.min(6000, p.length * 25)),
    diff: 2,
    pedal: 'brake',
    fromTelemetry: true,
  };
}

/**
 * Detects throttle application zones from parsed telemetry data.
 */
export function detectThrottleZones(data) {
  if (!data[0]?.throttle && data[0]?.throttle !== 0) return [];
  const zones = [];
  let inZone = false, start = 0;
  const threshold = 0.1;

  for (let i = 0; i < data.length; i++) {
    if (!inZone && (data[i].throttle || 0) > threshold) { inZone = true; start = i; }
    else if (inZone && (data[i].throttle || 0) <= threshold) {
      inZone = false;
      const len = i - start;
      if (len > 8) {
        const zone = data.slice(start, i);
        const peak = Math.max(...zone.map(d => d.throttle || 0));
        if (peak > 0.2) {
          zones.push({ startIdx: start, endIdx: i, points: zone, peak, type: 'throttle',
            label: data[start].dist !== undefined ? `${Math.round(data[start].dist)}m` : `@${((start / data.length) * 100).toFixed(0)}%` });
        }
      }
    }
  }
  return zones;
}

/**
 * Converts a throttle zone into an exercise.
 */
export function throttleZoneToExercise(zone, idx) {
  const p = zone.points;
  const maxThrottle = zone.peak;
  const normalized = p.map((d, i) => ({ t: i / (p.length - 1), v: (d.throttle || 0) / maxThrottle }));
  return {
    id: `telem_throttle_${idx}`,
    name: `Aceleração ${idx + 1} — ${zone.label}`,
    desc: `Pico: ${Math.round(zone.peak * 100)}% | ${p.length} amostras`,
    icon: '📊',
    curve: (t) => {
      if (normalized.length < 2) return 0;
      const x = t * (normalized.length - 1);
      const lo = Math.floor(x); const hi = Math.min(lo + 1, normalized.length - 1);
      return normalized[lo].v * (1 - (x - lo)) + normalized[hi].v * (x - lo);
    },
    duration: Math.max(2000, Math.min(6000, p.length * 25)),
    diff: 2,
    pedal: 'throttle',
    fromTelemetry: true,
  };
}

/**
 * Detects combined brake+throttle zones (overlap or sequential within a corner).
 */
export function detectCombinedZones(data) {
  const brakeZones = detectBrakeZones(data);
  const combined = [];

  for (const bz of brakeZones) {
    // Extend search window 50% after brake release for throttle application
    const extEnd = Math.min(data.length, bz.endIdx + Math.round((bz.endIdx - bz.startIdx) * 0.5));
    const segment = data.slice(bz.startIdx, extEnd);
    const hasThrottle = segment.some(d => (d.throttle || 0) > 0.1);

    if (hasThrottle) {
      combined.push({
        startIdx: bz.startIdx, endIdx: extEnd,
        points: segment,
        brakePeak: bz.peak,
        throttlePeak: Math.max(...segment.map(d => d.throttle || 0)),
        label: bz.label,
      });
    }
  }
  return combined;
}

/**
 * Converts a combined zone into a combined exercise.
 */
export function combinedZoneToExercise(zone, idx) {
  const p = zone.points;
  const len = p.length - 1;

  const interpFn = (pts) => (t) => {
    if (pts.length < 2) return 0;
    const x = t * (pts.length - 1);
    const lo = Math.floor(x); const hi = Math.min(lo + 1, pts.length - 1);
    return pts[lo] * (1 - (x - lo)) + pts[hi] * (x - lo);
  };

  return {
    id: `telem_combined_${idx}`,
    name: `Curva ${idx + 1} — ${zone.label}`,
    desc: `Freio ${Math.round(zone.brakePeak * 100)}% + Acel ${Math.round(zone.throttlePeak * 100)}%`,
    icon: '📊',
    curves: {
      brake: interpFn(p.map(d => d.brake / zone.brakePeak)),
      throttle: interpFn(p.map(d => (d.throttle || 0) / Math.max(zone.throttlePeak, 0.01))),
    },
    duration: Math.max(2500, Math.min(8000, p.length * 25)),
    diff: 3,
    pedal: 'combined',
    fromTelemetry: true,
  };
}
