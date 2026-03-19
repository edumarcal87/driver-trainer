import React, { useState } from 'react';
import { signOut } from '../lib/auth';
import { useAuth } from '../lib/AuthContext';
import { getPlanLabel, isPremium } from '../lib/auth';

export default function UserMenu({ onLogin }) {
  const { user, profile, isLoggedIn, isPremiumUser } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isLoggedIn) {
    return (
      <button onClick={onLogin} style={{
        padding: '8px 18px', fontSize: 12, borderRadius: 20, fontWeight: 700,
        fontFamily: 'var(--font-display)', letterSpacing: '.5px',
        border: '2px solid var(--accent-brake)', background: 'var(--accent-brake)',
        color: '#fff', cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(231,76,60,0.25)',
        transition: 'all .15s',
      }}>
        ENTRAR
      </button>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Piloto';
  const avatar = profile?.avatar_url;
  const planLabel = getPlanLabel(profile);
  const planColor = isPremiumUser ? '#f1c40f' : '#2980b9';

  return (
    <div style={{ position: 'relative', zIndex: 1000 }}>
      <button onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px 4px 4px',
        borderRadius: 20, border: '1.5px solid var(--border)', background: 'var(--bg-card)',
        cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        {avatar ? (
          <img src={avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-brake-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--accent-brake)' }}>
            {displayName[0]?.toUpperCase()}
          </div>
        )}
        <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-condensed)', color: 'var(--text-primary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayName}
        </span>
        <span style={{ fontSize: 8, padding: '2px 6px', borderRadius: 6, background: planColor + '15', color: planColor, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '.3px' }}>
          {planLabel.toUpperCase()}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 6, minWidth: 220,
            background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 1000, overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{displayName}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{user?.email}</p>
              <span style={{
                display: 'inline-block', marginTop: 6, fontSize: 9, padding: '3px 8px', borderRadius: 6,
                background: planColor + '15', color: planColor, fontWeight: 700, fontFamily: 'var(--font-mono)',
              }}>
                PLANO {planLabel.toUpperCase()}
              </span>
            </div>

            {!isPremiumUser && (
              <button style={{
                width: '100%', padding: '10px 16px', border: 'none', background: '#f1c40f08',
                fontSize: 12, fontWeight: 600, color: '#b7950b', cursor: 'pointer', fontFamily: 'var(--font-body)',
                textAlign: 'left', borderBottom: '1px solid var(--border)',
              }}>
                ⭐ Upgrade para Premium
              </button>
            )}

            <button onClick={async () => { await signOut(); setOpen(false); }} style={{
              width: '100%', padding: '10px 16px', border: 'none', background: 'transparent',
              fontSize: 12, color: '#e74c3c', cursor: 'pointer', fontFamily: 'var(--font-body)',
              textAlign: 'left',
            }}>
              Sair da conta
            </button>
          </div>
        </>
      )}
    </div>
  );
}
