/**
 * Parses a CSV telemetry file and returns an array of data points.
 * Supports: Garage61 (iRacing), MoTeC exports (ACC, AMS2), SRT (F1 25),
 * and any generic CSV with a "Brake" or "Brake%" column.
 */
export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 3) return null;

  const headers = lines[0]
    .split(/[,;\t]/)
    .map((h) => h.trim().replace(/"/g, '').toLowerCase());

  const brakeNames = [
    'brake', 'brake%', 'brakeinput', 'brake_input',
    'brake (%)', 'brakepedal', 'brake_pct',
  ];
  const distNames = [
    'distance', 'dist', 'lapdist', 'lap_dist',
    'trackposition', 'lap distance', 'distfromstart',
  ];
  const timeNames = [
    'time', 'laptime', 'elapsed', 'timestamp',
    'sessiontime', 'lap_time', 'sampledist',
  ];
  const speedNames = [
    'speed', 'speed (km/h)', 'speed (mph)',
    'vcar', 'groundspeed',
  ];
  const throttleNames = [
    'throttle', 'throttle%', 'throttleinput',
    'throttle_input', 'throttle (%)', 'gas',
  ];

  const findCol = (names) =>
    headers.findIndex((h) => names.some((n) => h.includes(n)));

  const brakeCol = findCol(brakeNames);
  if (brakeCol === -1) return null;

  const distCol = findCol(distNames);
  const timeCol = findCol(timeNames);
  const speedCol = findCol(speedNames);
  const throttleCol = findCol(throttleNames);

  // Detect if row 1 is a units row (non-numeric)
  let dataStart = 1;
  const testVal = lines[1].split(/[,;\t]/)[brakeCol];
  if (testVal && isNaN(parseFloat(testVal.replace(/"/g, '')))) {
    dataStart = 2;
  }

  const data = [];
  for (let i = dataStart; i < lines.length; i++) {
    const cols = lines[i]
      .split(/[,;\t]/)
      .map((c) => parseFloat(c.replace(/"/g, '')));
    const brake = cols[brakeCol];
    if (isNaN(brake)) continue;

    const row = { brake: brake > 1 ? brake / 100 : brake };
    if (distCol >= 0 && !isNaN(cols[distCol])) row.dist = cols[distCol];
    if (timeCol >= 0 && !isNaN(cols[timeCol])) row.time = cols[timeCol];
    if (speedCol >= 0 && !isNaN(cols[speedCol])) row.speed = cols[speedCol];
    if (throttleCol >= 0 && !isNaN(cols[throttleCol])) {
      row.throttle = cols[throttleCol] > 1 ? cols[throttleCol] / 100 : cols[throttleCol];
    }
    data.push(row);
  }

  return data.length > 10 ? data : null;
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
    fromTelemetry: true,
  };
}
