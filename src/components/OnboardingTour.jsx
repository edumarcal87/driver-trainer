import React, { useState, useEffect, useRef } from 'react';

/**
 * OnboardingTour — 5-step interactive walkthrough for first-time users.
 * Highlights areas of the UI with a spotlight overlay.
 * Shows only once per user (stored in localStorage).
 */

const STEPS = [
  {
    target: null, // No highlight — welcome modal
    title: 'Bem-vindo ao Driver Trainer! 🏎️',
    desc: 'Vamos fazer um tour rápido para você conhecer a plataforma e começar a treinar como profissional.',
    icon: '👋',
    position: 'center',
  },
  {
    target: '[data-tour="treino-livre"]',
    title: 'Treino Livre — Gratuito',
    desc: 'Aqui ficam todas as categorias de exercícios: freio, acelerador, volante, câmbio e mais. Clique em uma categoria para ver os exercícios disponíveis.',
    icon: '🏎️',
    position: 'bottom',
  },
  {
    target: '[data-tour="programas"]',
    title: 'Programas de Treino — Premium ⭐',
    desc: 'Programas guiados com sessões progressivas. Ideal para evoluir de forma estruturada. Disponível no plano Premium.',
    icon: '🎯',
    position: 'bottom',
  },
  {
    target: '[data-tour="ranking"]',
    title: 'Ranking e Desafios 🏆',
    desc: 'Veja sua posição no ranking global, compare com outros pilotos e participe dos desafios semanais.',
    icon: '🏆',
    position: 'left',
  },
  {
    target: '[data-tour="header-right"]',
    title: 'Conecte seu Volante 🎮',
    desc: 'Conecte seu volante USB (G29, T300, Fanatec, etc.) e o app detecta automaticamente. Use o ícone ⚙ para calibrar ou 🔧 para diagnóstico.',
    icon: '🔧',
    position: 'bottom',
  },
];

const STORAGE_KEY = 'bt_onboarding_done';

export default function OnboardingTour({ show, onComplete }) {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [visible, setVisible] = useState(show);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!visible) return;
    const s = STEPS[step];
    if (!s.target) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(s.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setTargetRect(null);
    }
  }, [step, visible]);

  // Reposition on scroll/resize
  useEffect(() => {
    if (!visible) return;
    const update = () => {
      const s = STEPS[step];
      if (!s?.target) return;
      const el = document.querySelector(s.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
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

  const next = () => {
    if (step >= STEPS.length - 1) { finish(); return; }
    setStep(step + 1);
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const skip = () => finish();

  if (!visible) return null;

  const s = STEPS[step];
  const isCenter = s.position === 'center' || !targetRect;

  // Tooltip position
  let tooltipStyle = {};
  if (isCenter) {
    tooltipStyle = {
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      zIndex: 10002,
    };
  } else {
    const pad = 12;
    const tw = Math.min(340, window.innerWidth - 32);
    if (s.position === 'bottom') {
      tooltipStyle = {
        position: 'absolute',
        top: targetRect.top + targetRect.height + pad,
        left: Math.max(16, Math.min(targetRect.left, window.innerWidth - tw - 16)),
        zIndex: 10002,
      };
    } else if (s.position === 'left') {
      tooltipStyle = {
        position: 'absolute',
        top: targetRect.top,
        left: Math.max(16, targetRect.left - tw - pad),
        zIndex: 10002,
      };
    } else if (s.position === 'top') {
      tooltipStyle = {
        position: 'absolute',
        top: targetRect.top - pad - 200,
        left: Math.max(16, Math.min(targetRect.left, window.innerWidth - tw - 16)),
        zIndex: 10002,
      };
    }
  }

  return (
    <>
      {/* Overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.55)', transition: 'opacity .3s',
      }} onClick={skip} />

      {/* Spotlight cutout */}
      {targetRect && (
        <div style={{
          position: 'absolute',
          top: targetRect.top - 6,
          left: targetRect.left - 6,
          width: targetRect.width + 12,
          height: targetRect.height + 12,
          borderRadius: 14,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
          zIndex: 10001,
          pointerEvents: 'none',
          transition: 'all .4s cubic-bezier(.4,0,.2,1)',
        }}>
          {/* Pulse ring */}
          <div style={{
            position: 'absolute', inset: -4, borderRadius: 18,
            border: '2px solid #e74c3c', opacity: 0.6,
            animation: 'onboarding-pulse 2s ease-in-out infinite',
          }} />
        </div>
      )}

      {/* Tooltip */}
      <div ref={tooltipRef} style={{
        ...tooltipStyle,
        width: Math.min(340, window.innerWidth - 32),
        background: '#fff', borderRadius: 16,
        boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
        border: '1.5px solid #e0dfd8',
        overflow: 'hidden',
      }}>
        {/* Progress bar */}
        <div style={{ height: 3, background: '#f0efe8' }}>
          <div style={{ height: '100%', width: `${((step + 1) / STEPS.length) * 100}%`, background: '#e74c3c', borderRadius: 2, transition: 'width .3s' }} />
        </div>

        <div style={{ padding: '20px 22px' }}>
          {/* Icon + step count */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 28 }}>{s.icon}</span>
            <span style={{ fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", color: '#9a9a90', letterSpacing: '.5px' }}>
              {step + 1} DE {STEPS.length}
            </span>
          </div>

          {/* Content */}
          <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Oxanium', sans-serif", color: '#1a1a1a', marginBottom: 8 }}>
            {s.title}
          </h3>
          <p style={{ fontSize: 13, color: '#5a5a5a', lineHeight: 1.5, marginBottom: 18, fontFamily: "'Barlow', sans-serif" }}>
            {s.desc}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={skip} style={{
              background: 'none', border: 'none', fontSize: 12, color: '#9a9a90',
              cursor: 'pointer', fontFamily: "'Barlow', sans-serif", padding: '4px 0',
            }}>
              Pular tour
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              {step > 0 && (
                <button onClick={prev} style={{
                  padding: '8px 16px', fontSize: 12, borderRadius: 10, fontWeight: 600,
                  fontFamily: "'Oxanium', sans-serif",
                  border: '1.5px solid #e0dfd8', background: '#fff', color: '#5a5a5a',
                  cursor: 'pointer',
                }}>
                  ← VOLTAR
                </button>
              )}
              <button onClick={next} style={{
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

      {/* Pulse animation */}
      <style>{`
        @keyframes onboarding-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.06); opacity: 0.3; }
        }
      `}</style>
    </>
  );
}

/** Check if onboarding was completed */
export function isOnboardingDone() {
  try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
}

/** Reset onboarding (for testing) */
export function resetOnboarding() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}
