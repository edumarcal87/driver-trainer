import React from 'react';
import { TOLERANCE } from '../data/exercises';

const CURVE_COLORS = {
  brake:    { target: '#e74c3c90', user: '#e74c3c', label: 'FREIO' },
  throttle: { target: '#27ae6090', user: '#27ae60', label: 'ACEL' },
  clutch:   { target: '#f39c1290', user: '#f39c12', label: 'EMBR' },
  steering: { target: '#2980b990', user: '#2980b9', label: 'VOLANTE' },
  gear:     { target: '#00bcd490', user: '#00bcd4', label: 'MARCHA' },
};

export default function CombinedChart({ curves, targetPtsMap: externalPtsMap, userDataMap, currentInputs, progress, running, scores }) {
  const W = 700, H = 280;
  const P = { t: 12, r: 12, b: 28, l: 40 };
  const cw = W - P.l - P.r, ch = H - P.t - P.b;
  const tx = t => P.l + t * cw;
  const ty = v => P.t + (1 - v) * ch;

  const inputKeys = Object.keys(curves);

  // Use pre-built target points (with lead-in) if provided, otherwise generate raw
  const targetPtsMap = externalPtsMap || (() => {
    const m = {};
    for (const key of inputKeys) {
      const pts = [];
      for (let i = 0; i <= 200; i++) { const t = i / 200; pts.push({ t, v: curves[key](t) }); }
      m[key] = pts;
    }
    return m;
  })();

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
      {/* Grid */}
      {[0, .25, .5, .75, 1].map(v => (
        <g key={v}>
          <line x1={P.l} y1={ty(v)} x2={W - P.r} y2={ty(v)} stroke="#e0dfd8" strokeWidth=".5" />
          <text x={P.l - 6} y={ty(v) + 3.5} textAnchor="end" fill="#9a9a90" fontSize="9" fontFamily="Oxanium, monospace">{Math.round(v * 100)}</text>
        </g>
      ))}

      {/* For each input: tolerance band + target + user curve */}
      {inputKeys.map((key, idx) => {
        const cc = CURVE_COLORS[key] || CURVE_COLORS.brake;
        const tPts = targetPtsMap[key] || [];
        const uPts = userDataMap?.[key] || [];

        const tPath = tPts.map((p, i) => `${i ? 'L' : 'M'}${tx(p.t).toFixed(1)},${ty(p.v).toFixed(1)}`).join('');

        // Tolerance band for first input only
        const tolU = idx === 0 ? tPts.map((p, i) => `${i ? 'L' : 'M'}${tx(p.t).toFixed(1)},${ty(Math.min(1, p.v + TOLERANCE)).toFixed(1)}`).join('') : '';
        const tolL = idx === 0 ? [...tPts].reverse().map((p, i) => `${i ? 'L' : 'M'}${tx(p.t).toFixed(1)},${ty(Math.max(0, p.v - TOLERANCE)).toFixed(1)}`).join('') : '';

        const uPath = uPts.length > 1 ? uPts.map((p, i) => `${i ? 'L' : 'M'}${tx(p.t).toFixed(1)},${ty(p.v).toFixed(1)}`).join('') : '';

        return (
          <g key={key}>
            {tolU && <path d={`${tolU} ${tolL} Z`} fill={cc.user} opacity=".06" />}
            {/* Target — dashed, colored by input type */}
            <path d={tPath} fill="none" stroke={cc.target} strokeWidth="2" strokeLinecap="round" strokeDasharray="6,4" />
            {/* User curve */}
            {uPath && (
              <path d={uPath} fill="none" stroke={cc.user} strokeWidth="1.5" strokeLinecap="round" />
            )}
          </g>
        );
      })}

      {/* Playhead */}
      {running && <>
        <line x1={tx(progress)} y1={P.t} x2={tx(progress)} y2={H - P.b} stroke="#9a9a90" strokeWidth=".5" strokeDasharray="3,4" />
        {inputKeys.map(key => {
          const cc = CURVE_COLORS[key] || CURVE_COLORS.brake;
          const val = currentInputs?.[key] ?? 0;
          return (
            <circle key={key} cx={tx(progress)} cy={ty(val)} r="3.5" fill={cc.user} stroke="#fff" strokeWidth="1.5" />
          );
        })}
      </>}

      {/* Legend */}
      {inputKeys.map((key, idx) => {
        const cc = CURVE_COLORS[key] || CURVE_COLORS.brake;
        const x = P.l + 8 + idx * 80;
        return (
          <g key={`leg-${key}`}>
            <line x1={x} y1={P.t + 6} x2={x + 14} y2={P.t + 6} stroke={cc.user} strokeWidth="2" strokeLinecap="round" />
            <text x={x + 18} y={P.t + 9} fill={cc.user} fontSize="9" fontFamily="Oxanium, monospace" fontWeight="500">{cc.label}</text>
          </g>
        );
      })}

      <text x={W / 2} y={H - 3} textAnchor="middle" fill="#9a9a90" fontSize="9" fontFamily="Oxanium, monospace">TEMPO →</text>
    </svg>
  );
}
