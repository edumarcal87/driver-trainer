import React from 'react';
import { TOLERANCE } from '../data/exercises';

const USER_COLORS = { brake: '#e74c3c', throttle: '#27ae60', clutch: '#f39c12', steering: '#2980b9', combined: '#8e44ad' };

export default function Chart({ targetPts, userPts, currentInput, progress, running, score, pedalType = 'brake' }) {
  const W = 700, H = 240;
  const P = { t: 12, r: 12, b: 28, l: 40 };
  const cw = W - P.l - P.r, ch = H - P.t - P.b;
  const tx = t => P.l + t * cw;
  const ty = v => P.t + (1 - v) * ch;
  const userColor = USER_COLORS[pedalType] || USER_COLORS.brake;

  const tPath = targetPts.map((p, i) => `${i ? 'L' : 'M'}${tx(p.t).toFixed(1)},${ty(p.v).toFixed(1)}`).join('');
  const tolU = targetPts.map((p, i) => `${i ? 'L' : 'M'}${tx(p.t).toFixed(1)},${ty(Math.min(1, p.v + TOLERANCE)).toFixed(1)}`).join('');
  const tolL = [...targetPts].reverse().map((p, i) => `${i ? 'L' : 'M'}${tx(p.t).toFixed(1)},${ty(Math.max(0, p.v - TOLERANCE)).toFixed(1)}`).join('');
  const uPath = userPts.length > 1 ? userPts.map((p, i) => `${i ? 'L' : 'M'}${tx(p.t).toFixed(1)},${ty(p.v).toFixed(1)}`).join('') : '';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="tolFillL" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#27ae60" stopOpacity=".1" />
          <stop offset="100%" stopColor="#27ae60" stopOpacity=".03" />
        </linearGradient>
      </defs>

      {[0, .25, .5, .75, 1].map(v => (
        <g key={v}>
          <line x1={P.l} y1={ty(v)} x2={W - P.r} y2={ty(v)} stroke="#e0dfd8" strokeWidth=".5" />
          <text x={P.l - 6} y={ty(v) + 3.5} textAnchor="end" fill="#9a9a90" fontSize="9" fontFamily="Oxanium, monospace">{Math.round(v * 100)}</text>
        </g>
      ))}

      <path d={`${tolU} ${tolL} Z`} fill="url(#tolFillL)" />
      <path d={tPath} fill="none" stroke="#27ae60" strokeWidth="2.5" strokeLinecap="round" opacity=".7" />

      {uPath && (
        <path d={uPath} fill="none" stroke={userColor} strokeWidth="2" strokeLinecap="round" />
      )}

      {running && <>
        <line x1={tx(progress)} y1={P.t} x2={tx(progress)} y2={H - P.b} stroke="#9a9a90" strokeWidth=".5" strokeDasharray="3,4" />
        <circle cx={tx(progress)} cy={ty(currentInput)} r="5" fill={userColor} stroke="#fff" strokeWidth="2" />
      </>}

      <text x={W / 2} y={H - 3} textAnchor="middle" fill="#9a9a90" fontSize="9" fontFamily="Oxanium, monospace">TEMPO →</text>

      {score !== null && !running && (
        <text x={W - P.r} y={P.t + 14} textAnchor="end"
          fill={score >= 80 ? '#27ae60' : score >= 50 ? '#f39c12' : '#e74c3c'}
          fontSize="18" fontWeight="700" fontFamily="Oxanium, monospace">{score}%</text>
      )}
    </svg>
  );
}
