import React from 'react';
import { TOLERANCE } from '../data/exercises';

const CHART_COLORS = {
  brake:    { target: '#e74c3c', targetAlpha: '#e74c3c70', tolFill: '#e74c3c', user: '#c0392b' },
  throttle: { target: '#27ae60', targetAlpha: '#27ae6070', tolFill: '#27ae60', user: '#1e8449' },
  clutch:   { target: '#f39c12', targetAlpha: '#f39c1270', tolFill: '#f39c12', user: '#d68910' },
  steering: { target: '#2980b9', targetAlpha: '#2980b970', tolFill: '#2980b9', user: '#1f6da0' },
  combined: { target: '#8e44ad', targetAlpha: '#8e44ad70', tolFill: '#8e44ad', user: '#7d3c98' },
};

export default function Chart({ targetPts, userPts, currentInput, progress, running, score, pedalType = 'brake' }) {
  const W = 700, H = 240;
  const P = { t: 12, r: 12, b: 28, l: 40 };
  const cw = W - P.l - P.r, ch = H - P.t - P.b;
  const tx = t => P.l + t * cw;
  const ty = v => P.t + (1 - v) * ch;
  const cc = CHART_COLORS[pedalType] || CHART_COLORS.brake;

  const tPath = targetPts.map((p, i) => `${i ? 'L' : 'M'}${tx(p.t).toFixed(1)},${ty(p.v).toFixed(1)}`).join('');
  const tolU = targetPts.map((p, i) => `${i ? 'L' : 'M'}${tx(p.t).toFixed(1)},${ty(Math.min(1, p.v + TOLERANCE)).toFixed(1)}`).join('');
  const tolL = [...targetPts].reverse().map((p, i) => `${i ? 'L' : 'M'}${tx(p.t).toFixed(1)},${ty(Math.max(0, p.v - TOLERANCE)).toFixed(1)}`).join('');
  const uPath = userPts.length > 1 ? userPts.map((p, i) => `${i ? 'L' : 'M'}${tx(p.t).toFixed(1)},${ty(p.v).toFixed(1)}`).join('') : '';

  const gradId = `tolFill_${pedalType}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cc.tolFill} stopOpacity=".1" />
          <stop offset="100%" stopColor={cc.tolFill} stopOpacity=".03" />
        </linearGradient>
      </defs>

      {[0, .25, .5, .75, 1].map(v => (
        <g key={v}>
          <line x1={P.l} y1={ty(v)} x2={W - P.r} y2={ty(v)} stroke="#e0dfd8" strokeWidth=".5" />
          <text x={P.l - 6} y={ty(v) + 3.5} textAnchor="end" fill="#9a9a90" fontSize="9" fontFamily="Oxanium, monospace">{Math.round(v * 100)}</text>
        </g>
      ))}

      {/* Tolerance band — colored by pedal type */}
      <path d={`${tolU} ${tolL} Z`} fill={`url(#${gradId})`} />

      {/* Target curve — colored by pedal type */}
      <path d={tPath} fill="none" stroke={cc.target} strokeWidth="2.5" strokeLinecap="round" opacity=".75" />

      {/* User curve — slightly darker shade */}
      {uPath && (
        <path d={uPath} fill="none" stroke={cc.user} strokeWidth="2" strokeLinecap="round" />
      )}

      {running && <>
        <line x1={tx(progress)} y1={P.t} x2={tx(progress)} y2={H - P.b} stroke="#9a9a90" strokeWidth=".5" strokeDasharray="3,4" />
        <circle cx={tx(progress)} cy={ty(currentInput)} r="5" fill={cc.user} stroke="#fff" strokeWidth="2" />
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
