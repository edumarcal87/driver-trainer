import React from 'react';
import { StatusBadge } from './UI';
import UserMenu from './UserMenu';

const btn = { padding: '6px 14px', fontSize: 11, borderRadius: 10, fontWeight: 500, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-condensed)', letterSpacing: '.3px' };

export default function GlobalHeader({ onNavigate, gpConnected, wheelProfile, onGoToLanding, isDark, onToggleTheme }) {
  return (
    <div className="global-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', position: 'relative', zIndex: 900 }}>
      <div onClick={() => onNavigate('menu')} style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, border: '2px solid var(--accent-brake)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="26" height="26" viewBox="0 0 56 56"><path d="M8 44 Q10 20, 18 14 Q24 10, 30 22 Q34 30, 38 28 Q42 26, 44 14" fill="none" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round"/><circle cx="8" cy="44" r="3.5" fill="#e74c3c"/><circle cx="30" cy="22" r="3" fill="#27ae60"/><circle cx="44" cy="14" r="2.5" fill="#f39c12"/></svg>
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
            DRIVER <span style={{ color: 'var(--accent-brake)', fontWeight: 300 }}>TRAINER</span>
          </h1>
          <p style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '2px', marginTop: 1 }}>DO PEDAL AO PÓDIO</p>
        </div>
      </div>
      <div className="global-header-right" data-tour="header-right" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <StatusBadge connected={gpConnected} wheelName={wheelProfile?.model?.split(' / ')[0] || (gpConnected ? 'CONECTADO' : '')} />
        <button onClick={onToggleTheme} title={isDark ? 'Modo claro' : 'Modo escuro'} style={{ ...btn, padding: '7px 10px', fontSize: 14, lineHeight: 1, borderRadius: '50%', width: 36, height: 36 }}>{isDark ? '☀️' : '🌙'}</button>
        <button onClick={() => onNavigate('diagnostics')} title="Diagnóstico de Gamepad" style={{ ...btn, padding: '7px 10px', fontSize: 14, lineHeight: 1, borderRadius: '50%', width: 36, height: 36 }}>🔧</button>
        <button onClick={() => onNavigate('config')} style={{ ...btn, padding: '7px 10px', fontSize: 16, lineHeight: 1, borderRadius: '50%', width: 36, height: 36 }}>⚙</button>
        <UserMenu onLogin={() => onNavigate('login')} onLogout={onGoToLanding} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
