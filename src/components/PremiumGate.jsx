import React from 'react';
import { useAuth } from '../lib/AuthContext';

/**
 * Wraps content that requires premium access.
 * Shows a lock overlay for free users.
 * 
 * Usage:
 *   <PremiumGate feature="Cenários Reais">
 *     <ProgramsScreen ... />
 *   </PremiumGate>
 */
export default function PremiumGate({ children, feature, onLogin }) {
  const { isLoggedIn, isPremiumUser } = useAuth();

  // Premium users or admins → show content
  if (isPremiumUser) return children;

  // Free content or not logged in → show upgrade prompt
  return (
    <div style={{ position: 'relative' }}>
      {/* Blurred preview */}
      <div style={{ filter: 'blur(3px)', opacity: 0.4, pointerEvents: 'none', userSelect: 'none' }}>
        {children}
      </div>

      {/* Lock overlay */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(240, 239, 232, 0.85)', borderRadius: 'var(--radius-lg)',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 320, padding: '2rem' }}>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>🔒</span>
          <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 8 }}>
            Conteúdo Premium
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
            {feature ? `"${feature}" é` : 'Este conteúdo é'} exclusivo para assinantes Premium.
            Faça upgrade para desbloquear todos os programas de treino e cenários reais.
          </p>

          {!isLoggedIn ? (
            <button onClick={onLogin} style={{
              padding: '10px 28px', fontSize: 13, borderRadius: 10, fontWeight: 700,
              fontFamily: 'var(--font-display)', letterSpacing: '.3px',
              border: '1.5px solid var(--accent-brake)', background: 'var(--accent-brake-light)', color: 'var(--accent-brake)',
              cursor: 'pointer',
            }}>
              ENTRAR / CRIAR CONTA
            </button>
          ) : (
            <button style={{
              padding: '10px 28px', fontSize: 13, borderRadius: 10, fontWeight: 700,
              fontFamily: 'var(--font-display)', letterSpacing: '.3px',
              border: '1.5px solid #f1c40f', background: '#f1c40f12', color: '#b7950b',
              cursor: 'pointer',
            }}>
              ⭐ UPGRADE PARA PREMIUM
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Simple hook-based check (for conditional rendering without overlay).
 */
export function usePremiumCheck() {
  const { isPremiumUser, isLoggedIn } = useAuth();
  return { canAccessPremium: isPremiumUser, isLoggedIn };
}
