import React from 'react';
import { TOLERANCE } from '../data/exercises';

const USER_COLORS = { brake: '#ff4757', throttle: '#2ed573', clutch: '#ffa502', steering: '#3b82f6' };

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
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <linearGradient id="tolFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#45e6b0" stopOpacity=".08" /><stop offset="100%" stopColor="#45e6b0" stopOpacity=".02" /></linearGradient>
      </defs>

      {/* Grid */}
      {[0, .25, .5, .75, 1].map(v => (
        <g key={v}>
          <line x1={P.l} y1={ty(v)} x2={W - P.r} y2={ty(v)} stroke="#252a38" strokeWidth=".5" />
          <text x={P.l - 6} y={ty(v) + 3.5} textAnchor="end" fill="#4a5068" fontSize="9" fontFamily="Oxanium, monospace">{Math.round(v * 100)}</text>
        </g>
      ))}

      {/* Tolerance band */}
      <path d={`${tolU} ${tolL} Z`} fill="url(#tolFill)" />

      {/* Target curve */}
      <path d={tPath} fill="none" stroke="#45e6b0" strokeWidth="2" strokeLinecap="round" opacity=".85" />

      {/* User curve with glow */}
      {uPath && <>
        <path d={uPath} fill="none" stroke={userColor} strokeWidth="3" strokeLinecap="round" opacity=".3" filter="url(#glow)" />
        <path d={uPath} fill="none" stroke={userColor} strokeWidth="1.5" strokeLinecap="round" />
      </>}

      {/* Playhead */}
      {running && <>
        <line x1={tx(progress)} y1={P.t} x2={tx(progress)} y2={H - P.b} stroke="#7a8194" strokeWidth=".5" strokeDasharray="3,4" />
        <circle cx={tx(progress)} cy={ty(currentInput)} r="4" fill={userColor} opacity=".3" filter="url(#glow)" />
        <circle cx={tx(progress)} cy={ty(currentInput)} r="3.5" fill={userColor} stroke="#0a0c10" strokeWidth="1.5" />
      </>}

      {/* Axis */}
      <text x={W / 2} y={H - 3} textAnchor="middle" fill="#4a5068" fontSize="9" fontFamily="Oxanium, monospace">TEMPO →</text>

      {/* Score */}
      {score !== null && !running && (
        <text x={W - P.r} y={P.t + 14} textAnchor="end"
          fill={score >= 80 ? '#2ed573' : score >= 50 ? '#ffa502' : '#ff4757'}
          fontSize="18" fontWeight="600" fontFamily="Oxanium, monospace">{score}%</text>
      )}
    </svg>
  );
}
