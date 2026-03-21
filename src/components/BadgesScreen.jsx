import React, { useState, useMemo } from 'react';
import { BADGES, BADGE_CATEGORIES, RARITY, evaluateBadges } from '../data/badges';

const btn = { padding: '5px 12px', fontSize: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-condensed)', fontWeight: 600 };

export default function BadgesScreen({ onBack, sessionLog }) {
  const [filter, setFilter] = useState('all'); // all | unlocked | locked | category key
  const [showLocked, setShowLocked] = useState(true);

  const { unlocked, locked } = useMemo(() => evaluateBadges(sessionLog || []), [sessionLog]);
  const unlockedIds = new Set(unlocked.map(b => b.id));

  const filteredBadges = useMemo(() => {
    let badges = BADGES;
    if (filter === 'unlocked') badges = badges.filter(b => unlockedIds.has(b.id));
    else if (filter === 'locked') badges = badges.filter(b => !unlockedIds.has(b.id));
    else if (BADGE_CATEGORIES[filter]) badges = badges.filter(b => b.category === filter);
    return badges;
  }, [filter, unlockedIds]);

  const pct = BADGES.length > 0 ? Math.round((unlocked.length / BADGES.length) * 100) : 0;

  return (
    <div style={{ maxWidth: 1100, width: '100%' }}>
      {/* Header */}
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
        <button onClick={onBack} style={btn}>← VOLTAR</button>
        <h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)', flex: 1 }}>Conquistas</h2>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          {unlocked.length}/{BADGES.length}
        </span>
      </div>

      {/* Progress card */}
      <div className="animate-in" style={{ padding: '16px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: 56, height: 56 }}>
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="24" fill="none" stroke="var(--bg-inset)" strokeWidth="4" />
            <circle cx="28" cy="28" r="24" fill="none" stroke="#f1c40f" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 150.8} 150.8`} transform="rotate(-90 28 28)" />
          </svg>
          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#b7950b' }}>{pct}%</span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{unlocked.length} conquistas desbloqueadas</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>de {BADGES.length} disponíveis · {locked.length} para desbloquear</p>
          <div style={{ height: 4, background: 'var(--bg-inset)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: '#f1c40f', borderRadius: 2, transition: 'width .4s' }} />
          </div>
        </div>
        {/* Rarity summary */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {Object.entries(RARITY).map(([key, r]) => {
            const count = unlocked.filter(b => b.rarity === key).length;
            if (count === 0) return null;
            return (
              <span key={key} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 6, background: r.bg, color: r.color, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {count} {r.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="animate-in animate-in-delay-1" style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'Todas' },
          { key: 'unlocked', label: `Desbloqueadas (${unlocked.length})` },
          { key: 'locked', label: `Bloqueadas (${locked.length})` },
          ...Object.entries(BADGE_CATEGORIES).map(([key, cat]) => ({ key, label: cat.label })),
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            ...btn, fontSize: 9, padding: '4px 10px',
            borderColor: filter === f.key ? (BADGE_CATEGORIES[f.key]?.color || '#2980b9') : 'var(--border)',
            background: filter === f.key ? (BADGE_CATEGORIES[f.key]?.color || '#2980b9') + '10' : 'transparent',
            color: filter === f.key ? (BADGE_CATEGORIES[f.key]?.color || '#2980b9') : 'var(--text-muted)',
          }}>{f.label}</button>
        ))}
      </div>

      {/* Badge grid */}
      <div className="animate-in animate-in-delay-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
        {filteredBadges.map(badge => {
          const isUnlocked = unlockedIds.has(badge.id);
          const rarity = RARITY[badge.rarity] || RARITY.common;
          const catConfig = BADGE_CATEGORIES[badge.category];
          return (
            <div key={badge.id} style={{
              padding: '12px 14px',
              background: isUnlocked ? 'var(--bg-card)' : '#f0efe8',
              border: `1.5px solid ${isUnlocked ? rarity.color + '40' : '#e0dfd8'}`,
              borderRadius: 'var(--radius-lg)',
              boxShadow: isUnlocked ? `0 2px 10px ${rarity.color}15` : 'none',
              filter: isUnlocked ? 'none' : 'grayscale(1)',
              opacity: isUnlocked ? 1 : 0.5,
              transition: 'all .2s',
              position: 'relative',
            }}>
              {/* Unlocked glow accent */}
              {isUnlocked && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: rarity.color, borderRadius: '12px 12px 0 0' }} />
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 26, lineHeight: 1 }}>{badge.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', color: isUnlocked ? 'var(--text-primary)' : '#b0afa8' }}>
                    {badge.name}
                  </p>
                  <p style={{ fontSize: 10, color: isUnlocked ? 'var(--text-muted)' : '#c0bfb8', lineHeight: 1.3, marginTop: 2 }}>{badge.desc}</p>
                  <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                    <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 4, background: isUnlocked ? rarity.bg : '#eae9e3', color: isUnlocked ? rarity.color : '#b0afa8', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {rarity.label.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 4, background: isUnlocked ? (catConfig?.color + '10') : '#eae9e3', color: isUnlocked ? catConfig?.color : '#b0afa8', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      {catConfig?.label}
                    </span>
                  </div>
                </div>
                {isUnlocked && (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#27ae6015', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: '#27ae60' }}>✓</span>
                  </div>
                )}
                {!isUnlocked && (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#e8e7e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: '#c0bfb8' }}>🔒</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>🏆</p>
          <p style={{ fontSize: 13 }}>Nenhuma conquista nesta categoria ainda.</p>
        </div>
      )}
    </div>
  );
}
