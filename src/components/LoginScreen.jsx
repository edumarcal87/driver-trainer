import React, { useState } from 'react';
import { signInWithGoogle, signInWithDiscord, signInWithEmail, signUpWithEmail, resetPassword } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';

const btn = { padding: '7px 16px', fontSize: 12, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' };

export default function LoginScreen({ onSkip }) {
  const [mode, setMode] = useState('login'); // login | signup | reset
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <div style={{ maxWidth: 420, width: '100%', margin: '0 auto', textAlign: 'center', padding: '2rem' }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>🔧</p>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Supabase não configurado.</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env</p>
        <button onClick={onSkip} style={{ ...btn, marginTop: 20 }}>Continuar sem login</button>
      </div>
    );
  }

  const handleSocial = async (provider) => {
    setError('');
    setLoading(true);
    const fn = provider === 'google' ? signInWithGoogle : signInWithDiscord;
    const { error } = await fn();
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'reset') {
      const { error } = await resetPassword(email);
      if (error) setError(error.message);
      else setSuccess('Email de recuperação enviado! Verifique sua caixa.');
      setLoading(false);
      return;
    }

    const fn = mode === 'signup' ? signUpWithEmail : signInWithEmail;
    const { error } = mode === 'signup' ? await fn(email, password, name) : await fn(email, password);

    if (error) {
      if (error.message.includes('Invalid login')) setError('Email ou senha incorretos.');
      else if (error.message.includes('already registered')) setError('Este email já está cadastrado.');
      else setError(error.message);
    } else if (mode === 'signup') {
      setSuccess('Conta criada! Verifique seu email para confirmar.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
      {/* Logo */}
      <div className="animate-in" style={{ textAlign: 'center', marginBottom: 32, marginTop: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, border: '2px solid var(--accent-brake)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <svg width="34" height="34" viewBox="0 0 56 56"><path d="M8 44 Q10 20, 18 14 Q24 10, 30 22 Q34 30, 38 28 Q42 26, 44 14" fill="none" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round"/><circle cx="8" cy="44" r="3.5" fill="#e74c3c"/><circle cx="30" cy="22" r="3" fill="#27ae60"/><circle cx="44" cy="14" r="2.5" fill="#f39c12"/></svg>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>
          DRIVER <span style={{ color: 'var(--accent-brake)', fontWeight: 300 }}>TRAINER</span>
        </h1>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '2px', marginTop: 4 }}>DO PEDAL AO PÓDIO</p>
      </div>

      {/* Card */}
      <div className="card animate-in animate-in-delay-1" style={{ padding: '28px 24px' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-display)', textAlign: 'center', marginBottom: 20 }}>
          {mode === 'login' ? 'Entrar na sua conta' : mode === 'signup' ? 'Criar nova conta' : 'Recuperar senha'}
        </h2>

        {/* Social buttons */}
        {mode !== 'reset' && (
          <>
            <button onClick={() => handleSocial('google')} disabled={loading}
              style={{
                width: '100%', padding: '11px', fontSize: 13, borderRadius: 10, fontWeight: 600,
                border: '1.5px solid #4285f430', background: '#4285f408', color: '#4285f4',
                cursor: 'pointer', fontFamily: 'var(--font-body)', marginBottom: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Entrar com Google
            </button>

            <button onClick={() => handleSocial('discord')} disabled={loading}
              style={{
                width: '100%', padding: '11px', fontSize: 13, borderRadius: 10, fontWeight: 600,
                border: '1.5px solid #5865F230', background: '#5865F208', color: '#5865F2',
                cursor: 'pointer', fontFamily: 'var(--font-body)', marginBottom: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}>
              <svg width="18" height="14" viewBox="0 0 71 55" fill="#5865F2"><path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.4 37.4 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.6 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.6 38.6 0 01-5.5-2.6.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 41.8 41.8 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .3 36.3 36.3 0 01-5.5 2.7.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1 58.5 58.5 0 0017.7-9v-.1c1.4-15-2.3-28.4-9.8-40.1a.2.2 0 00-.1-.1zM23.7 37.3c-3.5 0-6.3-3.2-6.3-7.1s2.8-7.1 6.3-7.1 6.4 3.2 6.3 7.1c0 3.9-2.8 7.1-6.3 7.1zm23.3 0c-3.5 0-6.3-3.2-6.3-7.1s2.8-7.1 6.3-7.1 6.4 3.2 6.3 7.1c0 3.9-2.7 7.1-6.3 7.1z"/></svg>
              Entrar com Discord
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-condensed)', letterSpacing: '.5px' }}>OU</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
          </>
        )}

        {/* Email form */}
        <form onSubmit={handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mode === 'signup' && (
            <input type="text" placeholder="Nome de piloto" value={name} onChange={e => setName(e.target.value)} required
              style={{ padding: '10px 14px', fontSize: 13, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-inset)', fontFamily: 'var(--font-body)', outline: 'none' }}
            />
          )}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
            style={{ padding: '10px 14px', fontSize: 13, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-inset)', fontFamily: 'var(--font-body)', outline: 'none' }}
          />
          {mode !== 'reset' && (
            <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              style={{ padding: '10px 14px', fontSize: 13, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-inset)', fontFamily: 'var(--font-body)', outline: 'none' }}
            />
          )}

          {error && <p style={{ fontSize: 11, color: '#e74c3c', fontWeight: 500, textAlign: 'center' }}>{error}</p>}
          {success && <p style={{ fontSize: 11, color: '#27ae60', fontWeight: 500, textAlign: 'center' }}>{success}</p>}

          <button type="submit" disabled={loading} style={{
            padding: '11px', fontSize: 13, borderRadius: 10, fontWeight: 700, fontFamily: 'var(--font-display)',
            border: '1.5px solid var(--accent-brake)', background: 'var(--accent-brake-light)', color: 'var(--accent-brake)',
            cursor: 'pointer', letterSpacing: '.3px',
          }}>
            {loading ? '...' : mode === 'login' ? 'ENTRAR' : mode === 'signup' ? 'CRIAR CONTA' : 'ENVIAR EMAIL'}
          </button>
        </form>

        {/* Switch mode links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
          {mode === 'login' && (
            <>
              <button onClick={() => { setMode('signup'); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: '#2980b9', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Criar conta</button>
              <button onClick={() => { setMode('reset'); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Esqueci a senha</button>
            </>
          )}
          {mode !== 'login' && (
            <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: '#2980b9', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>← Voltar ao login</button>
          )}
        </div>
      </div>

      {/* Skip button */}
      <div className="animate-in animate-in-delay-2" style={{ textAlign: 'center', marginTop: 20 }}>
        <button onClick={onSkip} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          Continuar sem conta →
        </button>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>
          Treino livre funciona sem login. Crie uma conta para salvar progresso e acessar conteúdo premium.
        </p>
      </div>
    </div>
  );
}
