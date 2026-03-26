import React, { useState } from 'react';
import { openCheckout, PLANS } from '../lib/payment';
import { useAuth } from '../lib/AuthContext';
import { trackClick } from '../lib/analytics';

const btn = { padding: '6px 14px', fontSize: 11, borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-condensed)', fontWeight: 600 };

const FEATURES = [
  { name: 'Treino livre (freio, acelerador, volante)', free: true, premium: true },
  { name: 'Exercícios básicos', free: true, premium: true },
  { name: 'Histórico de sessão', free: true, premium: true },
  { name: 'Ranking global', free: true, premium: true },
  { name: 'Badges e conquistas', free: true, premium: true },
  { name: 'Programas de treino estruturados', free: false, premium: true },
  { name: 'Cenários reais (Interlagos, Spa, Monza, Silverstone)', free: false, premium: true },
  { name: 'Importação de telemetria real', free: false, premium: true },
  { name: 'Exercícios adaptativos com IA', free: false, premium: true },
  { name: 'Vídeo tutoriais por curva', free: false, premium: true },
  { name: 'Desafios semanais', free: false, premium: true },
];

export default function UpgradeScreen({ onBack }) {
  const { user, isPremiumUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('annual');

  if (isPremiumUser) {
    return (
      <div style={{ maxWidth: 520, width: '100%', margin: '0 auto' }}>
        <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
          <button onClick={onBack} style={btn}>← VOLTAR</button>
        </div>
        <div className="animate-in" style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', border: '1.5px solid #27ae6030', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)' }}>
          <span style={{ fontSize: 48 }}>⭐</span>
          <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#27ae60', marginTop: 12 }}>Você já é Premium!</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Aproveite todos os recursos exclusivos do Driver Trainer.</p>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    trackClick('upgrade_checkout', 'payment', { plan: selectedPlan });
    openCheckout(selectedPlan, user?.email);
  };

  return (
    <div style={{ maxWidth: 720, width: '100%', margin: '0 auto' }}>
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
        <button onClick={onBack} style={btn}>← VOLTAR</button>
        <h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)', flex: 1 }}>Upgrade para Premium</h2>
      </div>

      {/* Hero */}
      <div className="animate-in" style={{ textAlign: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 36 }}>🏎️</span>
        <h3 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: 8 }}>
          Leve seu treino ao <span style={{ color: '#f1c40f' }}>próximo nível</span>
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Desbloqueie todos os recursos e treine como um profissional</p>
      </div>

      {/* Plan cards */}
      <div className="animate-in animate-in-delay-1" style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {Object.values(PLANS).map(plan => {
          const isSelected = selectedPlan === plan.id;
          return (
            <div key={plan.id} onClick={() => setSelectedPlan(plan.id)}
              style={{
                flex: '1 1 200px', padding: '20px', background: 'var(--bg-card)',
                border: `2px solid ${isSelected ? (plan.popular ? '#f1c40f' : '#2980b9') : 'var(--border)'}`,
                borderRadius: 'var(--radius-xl)', cursor: 'pointer', position: 'relative',
                boxShadow: isSelected ? `0 4px 20px ${plan.popular ? '#f1c40f' : '#2980b9'}15` : 'var(--shadow-card)',
                transition: 'all .2s',
              }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', padding: '3px 14px', background: '#f1c40f', borderRadius: 8, fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#1a1a1a', letterSpacing: '.5px' }}>
                  MAIS POPULAR
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isSelected ? (plan.popular ? '#f1c40f' : '#2980b9') : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isSelected && <div style={{ width: 10, height: 10, borderRadius: '50%', background: plan.popular ? '#f1c40f' : '#2980b9' }} />}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{plan.name}</span>
              </div>

              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: isSelected ? (plan.popular ? '#b7950b' : '#2980b9') : 'var(--text-primary)' }}>{plan.priceFormatted}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{plan.period}</span>
              </div>

              {plan.monthlyEquivalent && (
                <p style={{ fontSize: 11, color: '#27ae60', fontWeight: 600 }}>{plan.monthlyEquivalent}</p>
              )}
              {plan.savings && (
                <div style={{ marginTop: 6, padding: '4px 10px', background: '#27ae6010', borderRadius: 6, display: 'inline-block' }}>
                  <span style={{ fontSize: 10, color: '#27ae60', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{plan.savings}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA Button */}
      <div className="animate-in animate-in-delay-2" style={{ textAlign: 'center', marginBottom: 24 }}>
        <button onClick={handleCheckout} style={{
          padding: '14px 40px', fontSize: 16, borderRadius: 14, fontWeight: 700,
          fontFamily: 'var(--font-display)', letterSpacing: '.5px',
          border: '2px solid #f1c40f', background: '#f1c40f', color: '#1a1a1a',
          cursor: 'pointer', boxShadow: '0 4px 16px rgba(241,196,15,0.3)',
          transition: 'all .15s',
        }}>
          ASSINAR {selectedPlan === 'annual' ? 'PLANO ANUAL' : 'PLANO MENSAL'} →
        </button>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
          Pagamento seguro via Mercado Pago · Cancele quando quiser
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 6 }}>
          <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>💳 Cartão</span>
          <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>📱 Pix</span>
          <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>📄 Boleto</span>
        </div>
      </div>

      {/* Feature comparison */}
      <div className="animate-in animate-in-delay-3" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-inset)' }}>
          <span style={{ flex: 1, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)' }}>RECURSO</span>
          <span style={{ width: 70, textAlign: 'center', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)' }}>FREE</span>
          <span style={{ width: 70, textAlign: 'center', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-condensed)', color: '#f1c40f' }}>PREMIUM</span>
        </div>
        {FEATURES.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: i < FEATURES.length - 1 ? '1px solid var(--border)' : 'none', background: !f.free ? '#f1c40f03' : 'transparent' }}>
            <span style={{ flex: 1, fontSize: 11, color: 'var(--text-secondary)' }}>{f.name}</span>
            <span style={{ width: 70, textAlign: 'center', fontSize: 14 }}>{f.free ? '✓' : '—'}</span>
            <span style={{ width: 70, textAlign: 'center', fontSize: 14, color: '#27ae60' }}>✓</span>
          </div>
        ))}
      </div>

      {/* Guarantee */}
      <div className="animate-in animate-in-delay-4" style={{ textAlign: 'center', padding: '20px', marginTop: 16 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          🔒 Pagamento processado com segurança pelo Mercado Pago.
          Cancele sua assinatura a qualquer momento diretamente pela sua conta do Mercado Pago.
        </p>
      </div>
    </div>
  );
}
