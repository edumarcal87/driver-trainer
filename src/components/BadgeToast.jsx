import React, { useState, useEffect } from 'react';
import { RARITY } from '../data/badges';

/**
 * Shows an animated toast when a new badge is unlocked.
 * Props: badge (object), onDismiss (function)
 */
export default function BadgeToast({ badge, onDismiss, onNavigate }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!badge) return;
    setTimeout(() => setVisible(true), 100);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss?.(), 400);
    }, 4000);
    return () => clearTimeout(timer);
  }, [badge]);

  const handleClick = () => {
    setVisible(false);
    setTimeout(() => {
      onDismiss?.();
      onNavigate?.();
    }, 300);
  };

  if (!badge) return null;
  const rarity = RARITY[badge.rarity] || RARITY.common;

  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9999,
      transform: visible ? 'translateX(0)' : 'translateX(120%)',
      opacity: visible ? 1 : 0,
      transition: 'all .4s cubic-bezier(.4,0,.2,1)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
        background: '#fff', border: `2px solid ${rarity.color}30`, borderRadius: 14,
        boxShadow: `0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px ${rarity.color}10`,
        maxWidth: 320, cursor: 'pointer',
      }} onClick={handleClick}>
        <span style={{ fontSize: 28, animation: 'badge-pop .5s cubic-bezier(.4,0,.2,1) both', animationDelay: '.2s' }}>{badge.icon}</span>
        <div>
          <p style={{ fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif", color: rarity.color, fontWeight: 600, letterSpacing: '.5px' }}>
            CONQUISTA DESBLOQUEADA!
          </p>
          <p style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Oxanium', sans-serif", color: '#1a1a1a', marginTop: 2 }}>
            {badge.name}
          </p>
          <p style={{ fontSize: 10, color: '#5a5a5a', marginTop: 1 }}>{badge.desc}</p>
          <p style={{ fontSize: 9, color: rarity.color, marginTop: 4, fontWeight: 600 }}>Ver conquistas →</p>
        </div>
      </div>

      <style>{`
        @keyframes badge-pop {
          0% { transform: scale(0) rotate(-15deg); }
          60% { transform: scale(1.3) rotate(5deg); }
          100% { transform: scale(1) rotate(0); }
        }
      `}</style>
    </div>
  );
}
