import React, { useState, useEffect } from 'react';

const STEPS = [
  { target: null, title: 'Bem-vindo ao Driver Trainer! 🏎️', desc: 'Vamos fazer um tour rápido para você conhecer a plataforma e começar a treinar como profissional.', icon: '👋' },
  { target: '[data-tour="treino-livre"]', title: 'Treino Livre — Gratuito', desc: 'Todas as categorias de exercícios: freio, acelerador, volante, câmbio e mais. Clique em uma categoria para rolar até os exercícios.', icon: '🏎️' },
  { target: '[data-tour="programas"]', title: 'Programas de Treino ⭐', desc: 'Programas guiados com sessões progressivas para evoluir de forma estruturada. Disponível no plano Premium.', icon: '🎯' },
  { target: '[data-tour="ranking"]', title: 'Ranking e Desafios', desc: 'Sua posição no ranking global, top pilotos e desafios semanais. Compete com a comunidade!', icon: '🏆' },
  { target: '[data-tour="header-right"]', title: 'Conecte seu Volante', desc: 'Conecte um volante USB (G29, T300, Fanatec...) e o app detecta automaticamente. Use ⚙ para calibrar ou 🔧 para diagnóstico.', icon: '🎮' },
];

const STORAGE_KEY = 'bt_onboarding_done';

export default function OnboardingTour({ show, onComplete }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);
  const [visible, setVisible] = useState(show);

  // Find and scroll to target element
  useEffect(() => {
    if (!visible) return;
    const s = STEPS[step];
    if (!s.target) { setRect(null); return; }
    // Small delay to let scroll finish
    const findEl = () => {
      const el = document.querySelector(s.target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Wait for scroll to settle then measure
        setTimeout(() => {
          const r = el.getBoundingClientRect();
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        }, 400);
      } else {
        setRect(null);
      }
    };
    findEl();
  }, [step, visible]);

  // Update rect on scroll/resize
  useEffect(() => {
    if (!visible) return;
    const update = () => {
      const s = STEPS[step];
      if (!s?.target) return;
      const el = document.querySelector(s.target);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      }
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [step, visible]);

  const finish = () => {
    setVisible(false);
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
    onComplete?.();
  };

  if (!visible) return null;

  const s = STEPS[step];
  const isCenter = !s.target || !rect;
  const pad = 8;
  const tw = Math.min(340, window.innerWidth - 32);

  // Tooltip position (all fixed/viewport-relative)
  let tipTop, tipLeft;
  if (isCenter) {
    tipTop = '50%'; tipLeft = '50%';
  } else {
    // Try below the target
    const below = rect.top + rect.height + pad;
    const above = rect.top - pad - 220;
    const leftOfTarget = rect.left - tw - pad;

    if (below + 220 < window.innerHeight) {
      tipTop = below;
      tipLeft = Math.max(16, Math.min(rect.left, window.innerWidth - tw - 16));
    } else if (above > 0) {
      tipTop = above;
      tipLeft = Math.max(16, Math.min(rect.left, window.innerWidth - tw - 16));
    } else if (leftOfTarget > 0) {
      tipTop = Math.max(16, rect.top);
      tipLeft = leftOfTarget;
    } else {
      tipTop = Math.max(16, rect.top + rect.height + pad);
      tipLeft = 16;
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000 }}>
      {/* Dark overlay with SVG cutout for spotlight */}
      <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 10000 }}>
        <defs>
          <mask id="onboarding-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect x={rect.left - pad} y={rect.top - pad} width={rect.width + pad * 2} height={rect.height + pad * 2} rx="12" fill="black" />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#onboarding-mask)" />
      </svg>

      {/* Spotlight ring */}
      {rect && (
        <div style={{
          position: 'fixed',
          top: rect.top - pad - 2, left: rect.left - pad - 2,
          width: rect.width + pad * 2 + 4, height: rect.height + pad * 2 + 4,
          borderRadius: 14, border: '2px solid #e74c3c', opacity: 0.7,
          zIndex: 10001, pointerEvents: 'none',
          animation: 'onboarding-pulse 2s ease-in-out infinite',
        }} />
      )}

      {/* Tooltip */}
      <div style={{
        position: 'fixed',
        top: isCenter ? tipTop : tipTop, left: isCenter ? tipLeft : tipLeft,
        transform: isCenter ? 'translate(-50%, -50%)' : 'none',
        width: tw, zIndex: 10002,
        background: '#fff', borderRadius: 16,
        boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
        border: '1.5px solid #e0dfd8', overflow: 'hidden',
      }}>
        {/* Progress bar */}
        <div style={{ height: 3, background: '#f0efe8' }}>
          <div style={{ height: '100%', width: `${((step + 1) / STEPS.length) * 100}%`, background: '#e74c3c', borderRadius: 2, transition: 'width .3s' }} />
        </div>

        <div style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 28 }}>{s.icon}</span>
            <span style={{ fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", color: '#9a9a90', letterSpacing: '.5px' }}>
              {step + 1} DE {STEPS.length}
            </span>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Oxanium', sans-serif", color: '#1a1a1a', marginBottom: 8 }}>
            {s.title}
          </h3>
          <p style={{ fontSize: 13, color: '#5a5a5a', lineHeight: 1.5, marginBottom: 18, fontFamily: "'Barlow', sans-serif" }}>
            {s.desc}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={finish} style={{
              background: 'none', border: 'none', fontSize: 12, color: '#9a9a90',
              cursor: 'pointer', fontFamily: "'Barlow', sans-serif", padding: '4px 0',
            }}>
              Pular tour
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} style={{
                  padding: '8px 16px', fontSize: 12, borderRadius: 10, fontWeight: 600,
                  fontFamily: "'Oxanium', sans-serif",
                  border: '1.5px solid #e0dfd8', background: '#fff', color: '#5a5a5a', cursor: 'pointer',
                }}>← VOLTAR</button>
              )}
              <button onClick={() => step >= STEPS.length - 1 ? finish() : setStep(step + 1)} style={{
                padding: '8px 20px', fontSize: 12, borderRadius: 10, fontWeight: 700,
                fontFamily: "'Oxanium', sans-serif", letterSpacing: '.3px',
                border: '2px solid #e74c3c', background: '#e74c3c', color: '#fff',
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(231,76,60,0.2)',
              }}>
                {step >= STEPS.length - 1 ? 'COMEÇAR! 🏁' : 'PRÓXIMO →'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes onboarding-pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.04); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

export function isOnboardingDone() {
  try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
}

export function resetOnboarding() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}
