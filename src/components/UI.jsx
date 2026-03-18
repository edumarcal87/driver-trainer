import React from 'react';

const ACCENTS = {
  brake: { main: 'var(--accent-brake)', light: 'var(--accent-brake-light)', gradient: 'linear-gradient(90deg, #e74c3c, #c0392b)' },
  throttle: { main: 'var(--accent-throttle)', light: 'var(--accent-throttle-light)', gradient: 'linear-gradient(90deg, #27ae60, #2ecc71)' },
  clutch: { main: 'var(--accent-clutch)', light: 'var(--accent-clutch-light)', gradient: 'linear-gradient(90deg, #f39c12, #e67e22)' },
  steering: { main: 'var(--accent-steering)', light: 'var(--accent-steering-light)', gradient: 'linear-gradient(90deg, #2980b9, #3498db)' },
  combined: { main: 'var(--accent-combined)', light: 'var(--accent-combined-light)', gradient: 'linear-gradient(90deg, #8e44ad, #9b59b6)' },
};

export function PedalBar({ value, label = 'FREIO', type = 'brake', showGlow = false }) {
  const pct = Math.round(value * 100);
  const a = ACCENTS[type] || ACCENTS.brake;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: 52, textAlign: 'right', letterSpacing: '.5px', fontWeight: 500 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 10, background: 'var(--bg-inset)', borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: a.gradient, borderRadius: 5,
          transition: 'width .04s linear',
        }} />
      </div>
      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: a.main, minWidth: 34, fontWeight: 600 }}>
        {pct}%
      </span>
    </div>
  );
}

export function DifficultyDots({ level }) {
  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
      {[1, 2, 3].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: i <= level ? 'var(--accent-brake)' : 'var(--border)',
          border: i <= level ? 'none' : '1px solid var(--border)',
        }} />
      ))}
    </span>
  );
}

export function Legend({ pedalType = 'brake' }) {
  const a = ACCENTS[pedalType] || ACCENTS.brake;
  return (
    <div style={{ display: 'flex', gap: 18, marginTop: '.75rem', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-condensed)', letterSpacing: '.3px' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 16, height: 3, background: 'var(--accent-throttle)', borderRadius: 2, display: 'inline-block' }} />ALVO
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 16, height: 3, background: a.main, borderRadius: 2, display: 'inline-block' }} />SEU INPUT
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 16, height: 8, background: '#27ae60', opacity: .12, borderRadius: 2, display: 'inline-block' }} />TOLERÂNCIA
      </span>
    </div>
  );
}

export function StatusBadge({ connected, wheelName }) {
  return (
    <span style={{
      fontSize: 11, fontFamily: 'var(--font-mono)', padding: '5px 14px', borderRadius: 20, fontWeight: 500,
      background: connected ? 'var(--accent-throttle-light)' : 'var(--bg-inset)',
      color: connected ? 'var(--accent-throttle)' : 'var(--text-muted)',
      border: `1.5px solid ${connected ? '#27ae6030' : 'var(--border)'}`,
    }}>
      {connected ? `● ${wheelName || 'CONECTADO'}` : '○ SEM PEDAL'}
    </span>
  );
}

export function CategoryBadge({ label, color }) {
  return (
    <span style={{
      fontSize: 9, fontFamily: 'var(--font-mono)', padding: '3px 10px', borderRadius: 12,
      background: color + '15', color, border: `1px solid ${color}25`, letterSpacing: '.8px', fontWeight: 600,
    }}>
      {label}
    </span>
  );
}

export function LevelBadge({ score, attempts }) {
  let label, bg;
  if (score >= 85) { label = 'QUALIFYING'; bg = 'var(--badge-qualifying)'; }
  else if (score >= 65) { label = 'PUSH LAP'; bg = 'var(--badge-push)'; }
  else { label = 'WARMUP'; bg = 'var(--badge-warmup)'; }
  return (
    <span style={{
      fontSize: 9, fontFamily: 'var(--font-mono)', padding: '3px 10px', borderRadius: 10,
      background: bg, color: '#fff', letterSpacing: '.8px', fontWeight: 600,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      {label}
    </span>
  );
}

export function ScoreRing({ score, size = 64 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 80 ? 'var(--accent-throttle)' : score >= 50 ? 'var(--accent-clutch)' : 'var(--accent-brake)';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-inset)" strokeWidth="5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * .3, fontWeight: 700, fontFamily: 'var(--font-display)', color }}>{score}%</span>
      </div>
    </div>
  );
}

export function GradeDisplay({ grade, size = 'large' }) {
  const colors = { S: '#f1c40f', A: '#27ae60', B: '#2ecc71', C: '#f39c12', D: '#e74c3c' };
  const c = colors[grade] || colors.C;
  const sz = size === 'large' ? 68 : 36;
  return (
    <div style={{
      width: sz, height: sz, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: `3px solid ${c}`, background: `${c}10`,
      boxShadow: `0 2px 12px ${c}25`,
      animation: size === 'large' ? 'score-reveal .5s cubic-bezier(.4,0,.2,1) both' : 'none',
    }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: sz * .45, fontWeight: 700, color: c }}>{grade}</span>
    </div>
  );
}

export function StatCard({ label, value, unit = '', color = 'var(--text-primary)' }) {
  return (
    <div style={{
      padding: '12px 16px', background: 'var(--bg-inset)', borderRadius: 'var(--radius)',
      border: '1.5px solid var(--border)', flex: 1, minWidth: 100,
    }}>
      <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-condensed)', letterSpacing: '.8px', marginBottom: 4, fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color }}>
        {value}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>{unit}</span>
      </p>
    </div>
  );
}

export function SegmentBar({ label, score, bias }) {
  const color = score >= 80 ? 'var(--accent-throttle)' : score >= 50 ? 'var(--accent-clutch)' : 'var(--accent-brake)';
  const biasLabel = bias > 0.05 ? 'forte demais' : bias < -0.05 ? 'fraco demais' : 'ok';
  const biasColor = Math.abs(bias) > 0.05 ? 'var(--accent-clutch)' : 'var(--text-muted)';
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: biasColor }}>{biasLabel}</span>
          <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700, color }}>{score}%</span>
        </div>
      </div>
      <div style={{ height: 6, background: 'var(--bg-inset)', borderRadius: 3, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 3, animation: 'bar-fill .6s cubic-bezier(.4,0,.2,1) both' }} />
      </div>
    </div>
  );
}

export function TipCard({ type, text }) {
  const config = {
    warning: { icon: '⚠', bg: '#fef5e1', border: '#f39c1225', color: '#b7791f' },
    info: { icon: '💡', bg: '#e4f0f9', border: '#2980b925', color: '#1e6a9e' },
    success: { icon: '✓', bg: '#e6f5ec', border: '#27ae6025', color: '#1e7a47' },
  };
  const c = config[type] || config.info;
  return (
    <div style={{
      display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 16px',
      background: c.bg, borderRadius: 'var(--radius)', border: `1.5px solid ${c.border}`,
    }}>
      <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{c.icon}</span>
      <p style={{ fontSize: 13, color: c.color, lineHeight: 1.5, fontWeight: 400 }}>{text}</p>
    </div>
  );
}
