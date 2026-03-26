import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Subscription confirmation page — /confirmacao-assinatura
 * 
 * The user lands here after completing payment on Mercado Pago.
 * MP adds query params like: ?preapproval_id=xxx&status=authorized
 * 
 * Flow:
 * 1. Parse URL params
 * 2. Show success/pending/error state
 * 3. Call Edge Function to verify subscription with MP API
 * 4. Update user profile to premium
 * 5. Redirect to app
 */

const STATUS_CONFIG = {
  authorized: {
    icon: '✅',
    title: 'Assinatura confirmada!',
    subtitle: 'Bem-vindo ao Driver Trainer Premium',
    color: '#27ae60',
    message: 'Seu pagamento foi aprovado e sua conta já está ativa como Premium. Aproveite todos os recursos exclusivos!',
  },
  pending: {
    icon: '⏳',
    title: 'Pagamento em processamento',
    subtitle: 'Quase lá!',
    color: '#f39c12',
    message: 'Seu pagamento está sendo processado. Assim que for confirmado, sua conta será atualizada automaticamente. Isso pode levar alguns minutos.',
  },
  cancelled: {
    icon: '❌',
    title: 'Pagamento não concluído',
    subtitle: 'Algo deu errado',
    color: '#e74c3c',
    message: 'O pagamento não foi concluído. Você pode tentar novamente a qualquer momento.',
  },
  unknown: {
    icon: '🔄',
    title: 'Verificando pagamento...',
    subtitle: 'Aguarde um momento',
    color: '#2980b9',
    message: 'Estamos verificando o status do seu pagamento com o Mercado Pago.',
  },
};

export default function SubscriptionConfirmation({ onGoToApp }) {
  const { user, profile } = useAuth();
  const [status, setStatus] = useState('unknown');
  const [verifying, setVerifying] = useState(true);
  const [preapprovalId, setPreapprovalId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mpStatus = params.get('status');
    const mpPreapprovalId = params.get('preapproval_id');

    setPreapprovalId(mpPreapprovalId);

    if (mpStatus === 'authorized' || mpStatus === 'approved') {
      setStatus('authorized');
      // Verify and activate premium
      if (mpPreapprovalId && user?.id) {
        verifyAndActivate(mpPreapprovalId, user.id);
      } else {
        setVerifying(false);
      }
    } else if (mpStatus === 'pending') {
      setStatus('pending');
      setVerifying(false);
    } else if (mpStatus === 'cancelled' || mpStatus === 'rejected') {
      setStatus('cancelled');
      setVerifying(false);
    } else {
      // No status param — try to verify via preapproval_id
      if (mpPreapprovalId && user?.id) {
        verifyAndActivate(mpPreapprovalId, user.id);
      } else {
        setStatus('cancelled');
        setVerifying(false);
      }
    }
  }, [user?.id]);

  async function verifyAndActivate(preapprovalId, userId) {
    try {
      setVerifying(true);

      // Call Edge Function to verify with MP API
      if (isSupabaseConfigured()) {
        const { data, error: fnError } = await supabase.functions.invoke('verify-subscription', {
          body: { preapproval_id: preapprovalId, user_id: userId },
        });

        if (fnError) {
          console.error('Edge Function error:', fnError);
          // Fallback: trust the URL status param
        } else if (data?.verified) {
          setStatus('authorized');
          setVerifying(false);
          return;
        }
      }

      // Fallback: update profile directly if Edge Function not available
      if (isSupabaseConfigured()) {
        await supabase.from('profiles').update({
          plan: 'premium',
          mp_preapproval_id: preapprovalId,
          premium_since: new Date().toISOString(),
        }).eq('id', userId);
      }

      setStatus('authorized');
    } catch (err) {
      console.error('Verification error:', err);
      setError('Não foi possível verificar o pagamento automaticamente. Entre em contato com o suporte.');
      setStatus('pending');
    } finally {
      setVerifying(false);
    }
  }

  const config = STATUS_CONFIG[status];
  const isPremiumNow = status === 'authorized';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, border: '2px solid var(--accent-brake)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="26" height="26" viewBox="0 0 56 56"><path d="M8 44 Q10 20, 18 14 Q24 10, 30 22 Q34 30, 38 28 Q42 26, 44 14" fill="none" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round"/><circle cx="8" cy="44" r="3.5" fill="#e74c3c"/><circle cx="30" cy="22" r="3" fill="#27ae60"/><circle cx="44" cy="14" r="2.5" fill="#f39c12"/></svg>
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                DRIVER <span style={{ color: 'var(--accent-brake)', fontWeight: 300 }}>TRAINER</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Status card */}
        <div className="animate-in" style={{
          background: 'var(--bg-card)', border: `2px solid ${config.color}20`,
          borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)',
          padding: '40px 32px', textAlign: 'center',
        }}>
          {/* Icon */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%', background: config.color + '12',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', border: `2px solid ${config.color}25`,
          }}>
            <span style={{ fontSize: 36 }}>{verifying ? '🔄' : config.icon}</span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: config.color, marginBottom: 6 }}>
            {verifying ? 'Verificando pagamento...' : config.title}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            {verifying ? 'Consultando o Mercado Pago' : config.subtitle}
          </p>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 24 }}>
            {verifying ? 'Aguarde enquanto confirmamos seu pagamento...' : config.message}
          </p>

          {error && (
            <div style={{ padding: '10px 14px', background: '#fde8e6', borderRadius: 10, marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: '#e74c3c' }}>{error}</p>
            </div>
          )}

          {/* Premium benefits (shown on success) */}
          {isPremiumNow && !verifying && (
            <div style={{ textAlign: 'left', padding: '16px', background: 'var(--bg-inset)', borderRadius: 'var(--radius-lg)', marginBottom: 20, border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 10, fontFamily: 'var(--font-condensed)', color: '#27ae60', fontWeight: 600, marginBottom: 8, letterSpacing: '.3px' }}>AGORA VOCÊ TEM ACESSO A:</p>
              {[
                '📋 Programas de treino estruturados',
                '🏁 Cenários reais (Interlagos, Spa, Monza, Silverstone)',
                '📊 Importação de telemetria real',
                '🧠 Exercícios adaptativos com IA',
                '🎬 Vídeo tutoriais por curva',
                '⚡ Desafios semanais da comunidade',
              ].map((item, i) => (
                <p key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '3px 0' }}>{item}</p>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {isPremiumNow && !verifying && (
              <button onClick={onGoToApp} style={{
                padding: '12px 32px', fontSize: 14, borderRadius: 12, fontWeight: 700,
                fontFamily: 'var(--font-display)', border: '1.5px solid #27ae60',
                background: '#27ae60', color: '#fff', cursor: 'pointer',
                boxShadow: '0 2px 12px #27ae6030',
              }}>
                COMEÇAR A TREINAR →
              </button>
            )}
            {status === 'pending' && !verifying && (
              <button onClick={onGoToApp} style={{
                padding: '12px 32px', fontSize: 14, borderRadius: 12, fontWeight: 700,
                fontFamily: 'var(--font-display)', border: '1.5px solid var(--border)',
                background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer',
              }}>
                IR PARA O APP
              </button>
            )}
            {status === 'cancelled' && !verifying && (
              <>
                <button onClick={() => window.history.back()} style={{
                  padding: '12px 28px', fontSize: 14, borderRadius: 12, fontWeight: 700,
                  fontFamily: 'var(--font-display)', border: '1.5px solid #e74c3c',
                  background: '#e74c3c', color: '#fff', cursor: 'pointer',
                }}>
                  TENTAR NOVAMENTE
                </button>
                <button onClick={onGoToApp} style={{
                  padding: '12px 24px', fontSize: 13, borderRadius: 12, fontWeight: 600,
                  fontFamily: 'var(--font-condensed)', border: '1.5px solid var(--border)',
                  background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                }}>
                  Voltar ao app
                </button>
              </>
            )}
          </div>

          {/* Subscription ID */}
          {preapprovalId && !verifying && (
            <p style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 16 }}>
              ID: {preapprovalId}
            </p>
          )}
        </div>

        {/* Support */}
        <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', marginTop: 16 }}>
          Problemas com o pagamento? Entre em contato pelo e-mail suporte@drivertrainer.com.br
        </p>
      </div>
    </div>
  );
}
