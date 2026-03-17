import React from 'react';
import { TOLERANCE } from '../data/exercises';

const CURVE_COLORS = {
  brake:    { target: '#ff475790', user: '#ff4757', label: 'FREIO' },
  throttle: { target: '#2ed57390', user: '#2ed573', label: 'ACEL' },
  clutch:   { target: '#ffa50290', user: '#ffa502', label: 'EMBR' },
  steering: { target: '#3b82f690', user: '#3b82f6', label: 'VOLANTE' },
};

export default function CombinedChart({ curves, userDataMap, currentInputs, progress, running, scores }) {
  const W = 700, H = 280;
  const P = { t: 12, r: 12, b: 28, l: 40 };
  const cw = W - P.l - P.r, ch = H - P.t - P.b;
  const tx = t => P.l + t * cw;
  const ty = v => P.t + (1 - v) * ch;

  const inputKeys = Object.keys(curves);

  // Generate 200 points for each target curve
  const targetPtsMap = {};
  for (const key of inputKeys) {
    const pts = [];
    for (let i = 0; i <= 200; i++) { const t = i / 200; pts.push({ t, v: curves[key](t) }); }
    targetPtsMap[key] = pts;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
      <defs>
        <filter id="glowC"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      {/* Grid */}
      {[0, .25, .5, .75, 1].map(v => (
        <g key={v}>
          <line x1={P.l} y1={ty(v)} x2={W - P.r} y2={ty(v)} stroke="#252a38" strokeWidth=".5" />
          <text x={P.l - 6} y={ty(v) + 3.5} textAnchor="end" fill="#4a5068" fontSize="9" fontFamily="Oxanium, monospace">{Math.round(v * 100)}</text>
        </g>
      ))}

      {/* For each input: tolerance band + target + user curve */}
      {inputKeys.map((key, idx) => {
        const cc = CURVE_COLORS[key] || CURVE_COLORS.brake;
        const tPts = targetPtsMap[key];
        const uPts = userDataMap?.[key] || [];

        // Target path
        const tPath = tPts.map((p, i) => `${i ? 'L' : 'M'}${tx(p.t).toFixed(1)},${ty(p.v).toFixed(1)}`).join('');

        // Tolerance band (subtle, only for first input to avoid clutter)
        const tolU = idx === 0 ? tPts.map((p, i) => `${i ? 'L' : 'M'}${tx(p.t).toFixed(1)},${ty(Math.min(1, p.v + TOLERANCE)).toFixed(1)}`).join('') : '';
        const tolL = idx === 0 ? [...tPts].reverse().map((p, i) => `${i ? 'L' : 'M'}${tx(p.t).toFixed(1)},${ty(Math.max(0, p.v - TOLERANCE)).toFixed(1)}`).join('') : '';

        // User path
        const uPath = uPts.length > 1 ? uPts.map((p, i) => `${i ? 'L' : 'M'}${tx(p.t).toFixed(1)},${ty(p.v).toFixed(1)}`).join('') : '';

        return (
          <g key={key}>
            {/* Tolerance (first only) */}
            {tolU && <path d={`${tolU} ${tolL} Z`} fill={cc.user} opacity=".04" />}

            {/* Target - dashed */}
            <path d={tPath} fill="none" stroke={cc.target} strokeWidth="2" strokeLinecap="round" strokeDasharray="6,4" />

            {/* User curve with glow */}
            {uPath && <>
              <path d={uPath} fill="none" stroke={cc.user} strokeWidth="3" strokeLinecap="round" opacity=".25" filter="url(#glowC)" />
              <path d={uPath} fill="none" stroke={cc.user} strokeWidth="1.5" strokeLinecap="round" />
            </>}
          </g>
        );
      })}

      {/* Playhead */}
      {running && <>
        <line x1={tx(progress)} y1={P.t} x2={tx(progress)} y2={H - P.b} stroke="#7a8194" strokeWidth=".5" strokeDasharray="3,4" />
        {inputKeys.map(key => {
          const cc = CURVE_COLORS[key] || CURVE_COLORS.brake;
          const val = currentInputs?.[key] ?? 0;
          return (
            <circle key={key} cx={tx(progress)} cy={ty(val)} r="3.5" fill={cc.user} stroke="#0a0c10" strokeWidth="1.5" />
          );
        })}
      </>}

      {/* Legend in chart */}
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

      {/* Axis */}
      <text x={W / 2} y={H - 3} textAnchor="middle" fill="#4a5068" fontSize="9" fontFamily="Oxanium, monospace">TEMPO →</text>
    </svg>
  );
}
