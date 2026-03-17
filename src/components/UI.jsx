import React from 'react';

const PEDAL_ACCENTS = {
  brake: 'var(--accent-brake)',
  throttle: 'var(--accent-throttle)',
  clutch: 'var(--accent-clutch)',
  steering: 'var(--accent-blue)',
};

export function PedalBar({ value, label = 'FREIO', type = 'brake', showGlow = false }) {
  const pct = Math.round(value * 100);
  const accent = PEDAL_ACCENTS[type] || PEDAL_ACCENTS.brake;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: 42, textAlign: 'right', letterSpacing: '.5px' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 8, background: 'var(--bg-inset)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: accent, borderRadius: 4,
          transition: 'width .04s linear',
          boxShadow: showGlow && pct > 20 ? `0 0 12px ${accent}50` : 'none',
        }} />
      </div>
      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: accent, minWidth: 32, fontWeight: 500 }}>
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
          width: 5, height: 5, borderRadius: '50%',
          background: i <= level ? 'var(--accent-brake)' : 'var(--border)',
          boxShadow: i <= level ? '0 0 4px var(--accent-brake-glow)' : 'none',
        }} />
      ))}
    </span>
  );
}

export function Legend({ pedalType = 'brake' }) {
  const accent = PEDAL_ACCENTS[pedalType] || 'var(--accent-brake)';
  return (
    <div style={{ display: 'flex', gap: 16, marginTop: '.75rem', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-condensed)', letterSpacing: '.3px' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 16, height: 2, background: 'var(--accent-target)', borderRadius: 1, display: 'inline-block' }} />ALVO
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 16, height: 2, background: accent, borderRadius: 1, display: 'inline-block' }} />SEU INPUT
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 16, height: 8, background: 'var(--accent-target)', opacity: .12, borderRadius: 2, display: 'inline-block' }} />TOLERÂNCIA
      </span>
    </div>
  );
}

export function StatusBadge({ connected }) {
  return (
    <span style={{
      fontSize: 10, fontFamily: 'var(--font-mono)', padding: '4px 10px', borderRadius: 20, letterSpacing: '.3px',
      background: connected ? '#2ed57315' : 'var(--bg-card)',
      color: connected ? 'var(--accent-throttle)' : 'var(--text-muted)',
      border: `1px solid ${connected ? '#2ed57330' : 'var(--border)'}`,
    }}>
      {connected ? '● CONECTADO' : '○ SEM PEDAL'}
    </span>
  );
}

export function CategoryBadge({ label, color }) {
  return (
    <span style={{
      fontSize: 9, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 10,
      background: color + '18', color, border: `1px solid ${color}25`, letterSpacing: '.5px',
    }}>
      {label}
    </span>
  );
}

export function GradeDisplay({ grade, size = 'large' }) {
  const colors = { S: '#ffd700', A: '#2ed573', B: '#45e6b0', C: '#ffa502', D: '#ff4757' };
  const c = colors[grade] || colors.C;
  const sz = size === 'large' ? 64 : 32;
  return (
    <div style={{
      width: sz, height: sz, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: `2px solid ${c}`, background: `${c}10`,
      boxShadow: `0 0 20px ${c}30, inset 0 0 20px ${c}08`,
      animation: size === 'large' ? 'score-reveal .5s cubic-bezier(.4,0,.2,1) both' : 'none',
    }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: sz * .5, fontWeight: 700, color: c }}>{grade}</span>
    </div>
  );
}

export function StatCard({ label, value, unit = '', color = 'var(--text-primary)' }) {
  return (
    <div style={{
      padding: '10px 14px', background: 'var(--bg-inset)', borderRadius: 'var(--radius)',
      border: '1px solid var(--border)', flex: 1, minWidth: 100,
    }}>
      <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-condensed)', letterSpacing: '.5px', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 600, fontFamily: 'var(--font-display)', color }}>
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
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-secondary)', letterSpacing: '.3px' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: biasColor }}>{biasLabel}</span>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600, color }}>{score}%</span>
        </div>
      </div>
      <div style={{ height: 4, background: 'var(--bg-inset)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 2, animation: 'bar-fill .6s cubic-bezier(.4,0,.2,1) both' }} />
      </div>
    </div>
  );
}

export function TipCard({ type, text }) {
  const icons = { warning: '⚠', info: '💡', success: '✓' };
  const colors = { warning: 'var(--accent-clutch)', info: 'var(--accent-blue)', success: 'var(--accent-throttle)' };
  const c = colors[type] || colors.info;
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 14px',
      background: `${c}08`, borderRadius: 'var(--radius)', border: `1px solid ${c}20`,
    }}>
      <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{icons[type]}</span>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}
