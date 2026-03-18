import React, { useState } from 'react';
import { TUTORIALS } from '../data/tutorials';

const DIAGRAMS = {
  threshold: (c) => <svg viewBox="0 0 200 80" style={{ width: '100%', display: 'block' }}>
    <line x1="10" y1="70" x2="190" y2="70" stroke="#e0dfd8" strokeWidth="1"/>
    <polyline points="10,70 25,10 160,10 190,70" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
    <text x="20" y="65" fontSize="8" fill="#9a9a90">Ataque</text>
    <text x="80" y="8" fontSize="8" fill={c} fontWeight="600">100% constante</text>
    <text x="165" y="65" fontSize="8" fill="#9a9a90">Soltar</text>
  </svg>,
  trail: (c) => <svg viewBox="0 0 200 80" style={{ width: '100%', display: 'block' }}>
    <line x1="10" y1="70" x2="190" y2="70" stroke="#e0dfd8" strokeWidth="1"/>
    <polyline points="10,70 25,10 190,70" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
    <text x="18" y="8" fontSize="8" fill={c} fontWeight="600">Pico</text>
    <text x="80" y="35" fontSize="8" fill="#9a9a90">Soltura gradual →</text>
    <path d="M30,10 L180,68" fill="none" stroke={c} strokeWidth="0.5" strokeDasharray="3,3" opacity=".4"/>
  </svg>,
  progressive: (c) => <svg viewBox="0 0 200 80" style={{ width: '100%', display: 'block' }}>
    <line x1="10" y1="70" x2="190" y2="70" stroke="#e0dfd8" strokeWidth="1"/>
    <path d="M10,70 C60,68 100,40 130,10 L155,10 L190,70" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
    <text x="50" y="55" fontSize="8" fill="#9a9a90">Subida gradual →</text>
    <text x="125" y="8" fontSize="8" fill={c} fontWeight="600">Pico</text>
  </svg>,
  stab: (c) => <svg viewBox="0 0 200 80" style={{ width: '100%', display: 'block' }}>
    <line x1="10" y1="70" x2="190" y2="70" stroke="#e0dfd8" strokeWidth="1"/>
    <polyline points="10,70 30,10 55,10 85,70 190,70" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
    <text x="30" y="8" fontSize="8" fill={c} fontWeight="600">Toque rápido</text>
    <text x="95" y="65" fontSize="8" fill="#9a9a90">Solta rápido</text>
  </svg>,
  smooth_exit: (c) => <svg viewBox="0 0 200 80" style={{ width: '100%', display: 'block' }}>
    <line x1="10" y1="70" x2="190" y2="70" stroke="#e0dfd8" strokeWidth="1"/>
    <path d="M10,70 C50,68 100,50 150,15 L190,10" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
    <text x="30" y="65" fontSize="8" fill="#9a9a90">0% início</text>
    <text x="150" y="8" fontSize="8" fill={c} fontWeight="600">100%</text>
  </svg>,
  feathering: (c) => <svg viewBox="0 0 200 80" style={{ width: '100%', display: 'block' }}>
    <line x1="10" y1="70" x2="190" y2="70" stroke="#e0dfd8" strokeWidth="1"/>
    <path d="M10,70 C20,68 25,45 40,42 C55,39 60,48 75,45 C90,42 95,38 110,40 C125,42 130,48 145,45 C160,42 170,20 190,10" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
    <text x="50" y="35" fontSize="8" fill="#9a9a90">~30-40%</text>
    <text x="50" y="55" fontSize="7" fill="#9a9a90">modulação oscilante</text>
  </svg>,
  smooth_turn: (c) => <svg viewBox="0 0 200 80" style={{ width: '100%', display: 'block' }}>
    <line x1="10" y1="40" x2="190" y2="40" stroke="#e0dfd8" strokeWidth="0.5" strokeDasharray="3,3"/>
    <text x="192" y="43" fontSize="7" fill="#9a9a90">centro</text>
    <path d="M10,40 C30,40 50,12 80,10 L120,10 C150,12 170,40 190,40" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
    <text x="80" y="8" fontSize="8" fill={c} fontWeight="600">Esterço</text>
    <text x="15" y="55" fontSize="7" fill="#9a9a90">entra</text>
    <text x="160" y="55" fontSize="7" fill="#9a9a90">sai</text>
  </svg>,
  chicane: (c) => <svg viewBox="0 0 200 80" style={{ width: '100%', display: 'block' }}>
    <line x1="10" y1="40" x2="190" y2="40" stroke="#e0dfd8" strokeWidth="0.5" strokeDasharray="3,3"/>
    <path d="M10,40 C20,40 30,70 50,70 L70,70 C85,70 90,40 100,10 L120,10 C135,10 140,40 150,40 L190,40" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
    <text x="45" y="68" fontSize="7" fill={c}>ESQ</text>
    <text x="100" y="8" fontSize="7" fill={c}>DIR</text>
  </svg>,
  trail_throttle: () => <svg viewBox="0 0 200 80" style={{ width: '100%', display: 'block' }}>
    <line x1="10" y1="70" x2="190" y2="70" stroke="#e0dfd8" strokeWidth="1"/>
    <polyline points="10,70 25,10 120,70" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round"/>
    <path d="M100,70 C130,68 160,30 190,10" fill="none" stroke="#27ae60" strokeWidth="2" strokeLinecap="round"/>
    <text x="30" y="8" fontSize="8" fill="#e74c3c" fontWeight="600">Freio</text>
    <text x="155" y="8" fontSize="8" fill="#27ae60" fontWeight="600">Gás</text>
    <text x="90" y="65" fontSize="7" fill="#9a9a90">transição</text>
  </svg>,
  heel_toe: () => <svg viewBox="0 0 200 80" style={{ width: '100%', display: 'block' }}>
    <line x1="10" y1="70" x2="190" y2="70" stroke="#e0dfd8" strokeWidth="1"/>
    <polyline points="10,70 20,10 140,10 170,70" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" opacity=".8"/>
    <polyline points="40,70 50,10 90,10 100,70" fill="none" stroke="#f39c12" strokeWidth="2" strokeLinecap="round" opacity=".8"/>
    <polyline points="55,70 65,35 75,70" fill="none" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" opacity=".8"/>
    <text x="70" y="8" fontSize="7" fill="#e74c3c">Freio constante</text>
    <text x="40" y="55" fontSize="6" fill="#f39c12">Embr</text>
    <text x="60" y="45" fontSize="6" fill="#27ae60">Blip</text>
  </svg>,
  full_corner: () => <svg viewBox="0 0 200 80" style={{ width: '100%', display: 'block' }}>
    <line x1="10" y1="70" x2="190" y2="70" stroke="#e0dfd8" strokeWidth="1"/>
    <polyline points="10,70 20,10 80,70" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round"/>
    <path d="M30,45 C50,44 60,12 90,10 L130,10 C150,12 165,45 185,45" fill="none" stroke="#2980b9" strokeWidth="2" strokeLinecap="round"/>
    <path d="M90,70 C120,68 150,30 190,10" fill="none" stroke="#27ae60" strokeWidth="2" strokeLinecap="round"/>
    <text x="15" y="8" fontSize="7" fill="#e74c3c">Freio</text>
    <text x="85" y="8" fontSize="7" fill="#2980b9">Volante</text>
    <text x="155" y="8" fontSize="7" fill="#27ae60">Gás</text>
  </svg>,
};

export default function TutorialOverlay({ exerciseId, onClose, onSlowMode }) {
  const [step, setStep] = useState(0);
  const tutorial = TUTORIALS[exerciseId];
  if (!tutorial) { onClose(); return null; }

  const color = exerciseId.startsWith('b_') ? '#e74c3c'
    : exerciseId.startsWith('t_') ? '#27ae60'
    : exerciseId.startsWith('s_') ? '#2980b9'
    : exerciseId.startsWith('c_') ? '#f39c12'
    : '#8e44ad';

  const diagram = DIAGRAMS[tutorial.diagram];
  const totalSteps = 2; // 0=explanation, 1=tips

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, backdropFilter: 'blur(6px)', padding: 16,
    }}>
      <div style={{
        maxWidth: 440, width: '100%', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
        border: '1.5px solid var(--border)', boxShadow: '0 8px 40px rgba(0,0,0,0.12)', overflow: 'hidden',
      }}>
        {/* Header bar */}
        <div style={{ background: color + '10', padding: '16px 20px', borderBottom: `2px solid ${color}20` }}>
          <p style={{ fontSize: 10, fontFamily: 'var(--font-condensed)', color: color, letterSpacing: '1px', marginBottom: 4, fontWeight: 600 }}>
            TUTORIAL · {step + 1}/{totalSteps}
          </p>
          <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            {tutorial.title}
          </h3>
        </div>

        <div style={{ padding: '20px' }}>
          {step === 0 && <>
            {/* Explanation + diagram */}
            {tutorial.paragraphs.map((p, i) => (
              <p key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>{p}</p>
            ))}
            {diagram && (
              <div style={{ padding: '16px 12px', background: 'var(--bg-inset)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginTop: 12 }}>
                {diagram(color)}
              </div>
            )}
          </>}

          {step === 1 && <>
            {/* Tips */}
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, fontFamily: 'var(--font-condensed)', letterSpacing: '.5px' }}>DICAS PARA ACERTAR:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tutorial.tips.map((tip, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, alignItems: 'center', padding: '10px 14px',
                  background: color + '08', borderRadius: 10, border: `1px solid ${color}15`,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: color, fontFamily: 'var(--font-display)', minWidth: 20, textAlign: 'center' }}>{i + 1}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{tip}</span>
                </div>
              ))}
            </div>
          </>}
        </div>

        {/* Footer buttons */}
        <div style={{ padding: '0 20px 20px', display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} style={{
                padding: '8px 16px', fontSize: 12, borderRadius: 10, fontWeight: 500,
                border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)', cursor: 'pointer',
              }}>← Anterior</button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {step < totalSteps - 1 ? (
              <button onClick={() => setStep(step + 1)} style={{
                padding: '8px 20px', fontSize: 12, borderRadius: 10, fontWeight: 700, fontFamily: 'var(--font-display)',
                border: `1.5px solid ${color}`, background: color + '12', color: color, cursor: 'pointer',
              }}>Próximo →</button>
            ) : (
              <>
                <button onClick={() => { onClose(); onSlowMode && onSlowMode(); }} style={{
                  padding: '8px 16px', fontSize: 11, borderRadius: 10, fontWeight: 600,
                  border: '1.5px solid #2980b9', background: '#e4f0f9', color: '#2980b9', cursor: 'pointer',
                }}>🐢 CÂMERA LENTA</button>
                <button onClick={onClose} style={{
                  padding: '8px 20px', fontSize: 12, borderRadius: 10, fontWeight: 700, fontFamily: 'var(--font-display)',
                  border: `1.5px solid ${color}`, background: color + '12', color: color, cursor: 'pointer',
                }}>ENTENDI — INICIAR</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
