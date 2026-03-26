import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';

/**
 * PremiumGate v2 — shows content normally with a banner at the top.
 * Users can browse programs/sessions but starting exercises is blocked.
 * 
 * Usage in screens: call usePremiumCheck() to know if user can start.
 * Usage as wrapper: <PremiumGate> shows banner + children fully visible.
 */
export default function PremiumGate({ children, feature, onLogin, onUpgrade }) {
  const { isLoggedIn, isPremiumUser } = useAuth();

  if (isPremiumUser) return children;

  return (
    <div>
      {/* Premium banner at top */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', marginBottom: 16,
        background: 'linear-gradient(135deg, #f1c40f08, #f39c1208)', borderRadius: 'var(--radius-lg)',
        border: '1.5px solid #f1c40f25',
      }}>
        <span style={{ fontSize: 22 }}>⭐</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#b7950b' }}>
            Conteúdo Premium
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {feature ? `"${feature}" é exclusivo` : 'Este conteúdo é exclusivo'} para assinantes. Você pode explorar, mas precisa de Premium para treinar.
          </p>
        </div>
        {!isLoggedIn ? (
          <button onClick={onLogin} style={{
            padding: '8px 18px', fontSize: 11, borderRadius: 10, fontWeight: 700,
            fontFamily: 'var(--font-display)', letterSpacing: '.3px',
            border: '2px solid #e74c3c', background: '#e74c3c', color: '#fff',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(231,76,60,0.2)', flexShrink: 0,
          }}>
            ENTRAR
          </button>
        ) : (
          <button onClick={onUpgrade} style={{
            padding: '8px 18px', fontSize: 11, borderRadius: 10, fontWeight: 700,
            fontFamily: 'var(--font-display)', letterSpacing: '.3px',
            border: '1.5px solid #f1c40f', background: '#f1c40f', color: '#1a1a1a',
            cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 8px rgba(241,196,15,0.25)',
          }}>
            ⭐ UPGRADE
          </button>
        )}
      </div>

      {/* Content rendered normally */}
      {children}
    </div>
  );
}

/**
 * Hook for components to check premium access.
 * Use this in ProgramsScreen / ProgramSessionScreen to block "INICIAR".
 */
export function usePremiumCheck() {
  const { isPremiumUser, isLoggedIn } = useAuth();
  return { canAccessPremium: isPremiumUser, isLoggedIn };
}

/**
 * Small lock badge for session buttons.
 */
export function PremiumLockButton({ onClick, onLogin, onUpgrade, children, style }) {
  const { isPremiumUser, isLoggedIn } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);

  if (isPremiumUser) {
    return <button onClick={onClick} style={style}>{children}</button>;
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setShowTooltip(true)} style={{
        ...style, opacity: 0.7, position: 'relative',
      }}>
        🔒 {children}
      </button>
      {showTooltip && (
        <>
          <div onClick={() => setShowTooltip(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
          <div style={{
            position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
            marginBottom: 8, padding: '12px 16px', minWidth: 220, textAlign: 'center',
            background: 'var(--bg-card)', border: '1.5px solid #f1c40f30', borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 999,
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#b7950b', marginBottom: 8 }}>⭐ Conteúdo Premium</p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.4 }}>
              Faça upgrade para acessar programas de treino e cenários reais.
            </p>
            {!isLoggedIn ? (
              <button onClick={() => { setShowTooltip(false); onLogin?.(); }} style={{
                padding: '6px 16px', fontSize: 11, borderRadius: 8, fontWeight: 700,
                border: '1.5px solid #e74c3c', background: '#e74c3c', color: '#fff',
                cursor: 'pointer', fontFamily: 'var(--font-display)',
              }}>ENTRAR</button>
            ) : (
              <button onClick={() => { setShowTooltip(false); onUpgrade?.(); }} style={{
                padding: '6px 16px', fontSize: 11, borderRadius: 8, fontWeight: 700,
                border: '1.5px solid #f1c40f', background: '#f1c40f', color: '#1a1a1a',
                cursor: 'pointer', fontFamily: 'var(--font-display)',
              }}>⭐ UPGRADE</button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
