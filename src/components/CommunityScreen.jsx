import React, { useState, useEffect, useMemo } from 'react';
import { ALL_EXERCISES } from '../data/exercises';
import { CAR_PROFILES } from '../data/carProfiles';
import { useAuth } from '../lib/AuthContext';
import { getLeaderboard, getUserRank, getActiveChallenge, getChallengeLeaderboard } from '../lib/community';
import { isSupabaseConfigured } from '../lib/supabase';

const btn = { padding: '6px 14px', fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)' };
const card = { padding: '16px 18px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', marginBottom: 12 };

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

function RankRow({ entry, isCurrentUser }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
      background: isCurrentUser ? '#2980b908' : 'transparent',
      border: isCurrentUser ? '1.5px solid #2980b920' : '1px solid transparent',
      borderRadius: 10, transition: 'all .15s',
    }}>
      <span style={{ width: 28, textAlign: 'center', fontSize: entry.rank <= 3 ? 18 : 12, fontWeight: 700, fontFamily: 'var(--font-display)', color: entry.rank <= 3 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
        {MEDAL[entry.rank] || `${entry.rank}º`}
      </span>
      {entry.avatar_url ? (
        <img src={entry.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-brake-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--accent-brake)' }}>
          {(entry.display_name || '?')[0]?.toUpperCase()}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 12, fontWeight: isCurrentUser ? 700 : 500, color: isCurrentUser ? '#2980b9' : 'var(--text-primary)' }}>
          {entry.display_name || 'Piloto'} {isCurrentUser && '(você)'}
        </span>
      </div>
      <span style={{
        fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)',
        color: entry.score >= 90 ? '#f1c40f' : entry.score >= 70 ? '#27ae60' : entry.score >= 50 ? '#f39c12' : '#e74c3c',
      }}>
        {entry.score}%
      </span>
    </div>
  );
}

export default function CommunityScreen({ onBack, onStartExercise }) {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState('leaderboard'); // leaderboard | challenge
  const [selectedExercise, setSelectedExercise] = useState('b_trail');
  const [selectedCarProfile, setSelectedCarProfile] = useState('all');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [challengeBoard, setChallengeBoard] = useState([]);
  const [loading, setLoading] = useState(false);

  // Popular exercises for quick select
  const popularExercises = useMemo(() => [
    'b_trail', 'b_threshold', 'x_heel_toe', 'x_full_corner', 'seq_braking_downshift',
    'ilg_t1_senna_s', 'ilg_t12_juncao', 'spa_t3_eau_rouge', 'mza_t11_parabolica', 'slv_t10_maggotts',
  ].map(id => ALL_EXERCISES.find(e => e.id === id)).filter(Boolean), []);

  // Load leaderboard
  useEffect(() => {
    if (tab !== 'leaderboard') return;
    setLoading(true);
    getLeaderboard(selectedExercise, selectedCarProfile).then(data => {
      setLeaderboardData(data);
      setLoading(false);
    });
    if (user?.id) {
      getUserRank(user.id, selectedExercise, selectedCarProfile === 'all' ? 'default' : selectedCarProfile).then(setUserRank);
    }
  }, [selectedExercise, selectedCarProfile, tab, user?.id]);

  // Load active challenge
  useEffect(() => {
    if (tab !== 'challenge') return;
    setLoading(true);
    getActiveChallenge().then(ch => {
      setChallenge(ch);
      if (ch) {
        getChallengeLeaderboard(ch.id).then(data => {
          setChallengeBoard(data);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, [tab]);

  const exerciseInfo = ALL_EXERCISES.find(e => e.id === selectedExercise);

  if (!isSupabaseConfigured()) {
    return (
      <div style={{ maxWidth: 720, width: '100%' }}>
        <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
          <button onClick={onBack} style={btn}>← VOLTAR</button>
          <h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)' }}>Comunidade</h2>
        </div>
        <div style={{ ...card, textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🏆</p>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Configure o Supabase para acessar leaderboards e desafios.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, width: '100%' }}>
      {/* Header */}
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
        <button onClick={onBack} style={btn}>← VOLTAR</button>
        <h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)', flex: 1 }}>Comunidade</h2>
      </div>

      {/* Tabs */}
      <div className="animate-in" style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
        {[
          { key: 'leaderboard', label: '🏆 Ranking Global', color: '#f1c40f' },
          { key: 'challenge', label: '⚡ Desafio Semanal', color: '#e74c3c' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            ...btn, flex: 1, textAlign: 'center', padding: '10px', fontWeight: tab === t.key ? 700 : 500,
            borderColor: tab === t.key ? t.color + '40' : 'var(--border)',
            background: tab === t.key ? t.color + '10' : 'transparent',
            color: tab === t.key ? t.color === '#f1c40f' ? '#b7950b' : t.color : 'var(--text-muted)',
            fontFamily: 'var(--font-display)', fontSize: 13,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Leaderboard Tab ── */}
      {tab === 'leaderboard' && (
        <div className="animate-in">
          {/* Exercise selector */}
          <div style={card}>
            <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px', marginBottom: 8 }}>EXERCÍCIO</p>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
              {popularExercises.map(ex => (
                <button key={ex.id} onClick={() => setSelectedExercise(ex.id)} style={{
                  ...btn, fontSize: 10, padding: '5px 10px',
                  borderColor: selectedExercise === ex.id ? '#2980b9' : 'var(--border)',
                  background: selectedExercise === ex.id ? '#2980b912' : 'transparent',
                  color: selectedExercise === ex.id ? '#2980b9' : 'var(--text-muted)',
                  fontWeight: selectedExercise === ex.id ? 700 : 400,
                }}>
                  {ex.icon} {ex.name.length > 18 ? ex.name.substring(0, 18) + '…' : ex.name}
                </button>
              ))}
            </div>

            {/* Car profile filter */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <button onClick={() => setSelectedCarProfile('all')} style={{
                ...btn, fontSize: 9, padding: '4px 8px',
                borderColor: selectedCarProfile === 'all' ? '#8e44ad' : 'var(--border)',
                color: selectedCarProfile === 'all' ? '#8e44ad' : 'var(--text-muted)',
              }}>Todos</button>
              {CAR_PROFILES.map(p => (
                <button key={p.id} onClick={() => setSelectedCarProfile(p.id)} style={{
                  ...btn, fontSize: 9, padding: '4px 8px',
                  borderColor: selectedCarProfile === p.id ? p.color : 'var(--border)',
                  color: selectedCarProfile === p.id ? p.color : 'var(--text-muted)',
                }}>
                  {p.icon} {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* User rank card */}
          {userRank && (
            <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 14, background: '#2980b906', borderColor: '#2980b920' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#2980b9' }}>
                  {MEDAL[userRank.rank] || `${userRank.rank}º`}
                </span>
                <p style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-condensed)' }}>SUA POSIÇÃO</p>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{profile?.display_name || 'Você'}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>em {exerciseInfo?.name}</span>
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#2980b9' }}>{userRank.score}%</span>
            </div>
          )}

          {/* Ranking list */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px' }}>
                RANKING — {exerciseInfo?.name?.toUpperCase() || 'EXERCÍCIO'}
              </p>
              {leaderboardData.length > 0 && (
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {leaderboardData.length} pilotos
                </span>
              )}
            </div>

            {loading ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>Carregando...</p>
            ) : leaderboardData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ fontSize: 28, marginBottom: 8 }}>🏁</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>Nenhuma pontuação ainda</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Seja o primeiro a marcar score neste exercício!</p>
                {onStartExercise && exerciseInfo && (
                  <button onClick={() => onStartExercise(exerciseInfo)} style={{
                    ...btn, marginTop: 12, borderColor: '#27ae6040', color: '#27ae60', fontWeight: 600,
                  }}>
                    TREINAR AGORA →
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {leaderboardData.map(entry => (
                  <RankRow key={entry.user_id} entry={entry} isCurrentUser={entry.user_id === user?.id} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Challenge Tab ── */}
      {tab === 'challenge' && (
        <div className="animate-in">
          {!challenge ? (
            <div style={{ ...card, textAlign: 'center', padding: '2.5rem' }}>
              <p style={{ fontSize: 36, marginBottom: 12 }}>⏳</p>
              <p style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-display)' }}>Nenhum desafio ativo</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>O próximo desafio semanal começa em breve. Fique ligado!</p>
            </div>
          ) : (
            <>
              {/* Challenge card */}
              <div style={{
                ...card, padding: '24px', textAlign: 'center',
                background: 'linear-gradient(135deg, #e74c3c06, #f39c1206)',
                borderColor: '#e74c3c20',
              }}>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-condensed)', color: '#e74c3c', letterSpacing: '1px', fontWeight: 600 }}>⚡ DESAFIO DA SEMANA</span>
                <h3 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: 8 }}>
                  {challenge.exercise_name}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, maxWidth: 400, margin: '6px auto 0' }}>
                  {challenge.description}
                </p>

                {/* Timer */}
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 16 }}>
                  {(() => {
                    const end = new Date(challenge.ends_at);
                    const now = new Date();
                    const diff = Math.max(0, end - now);
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    return [
                      { val: days, label: 'DIAS' },
                      { val: hours, label: 'HORAS' },
                    ].map(t => (
                      <div key={t.label} style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#e74c3c' }}>{t.val}</span>
                        <p style={{ fontSize: 8, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px' }}>{t.label}</p>
                      </div>
                    ));
                  })()}
                </div>

                {onStartExercise && (
                  <button onClick={() => {
                    const ex = ALL_EXERCISES.find(e => e.id === challenge.exercise_id);
                    if (ex) onStartExercise(ex);
                  }} style={{
                    marginTop: 16, padding: '10px 28px', fontSize: 13, borderRadius: 10, fontWeight: 700,
                    fontFamily: 'var(--font-display)', letterSpacing: '.3px',
                    border: '2px solid #e74c3c', background: '#e74c3c', color: '#fff',
                    cursor: 'pointer', boxShadow: '0 2px 8px rgba(231,76,60,0.2)',
                  }}>
                    PARTICIPAR DO DESAFIO
                  </button>
                )}
              </div>

              {/* Challenge ranking */}
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px' }}>
                    RANKING DO DESAFIO
                  </p>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {challengeBoard.length} participantes
                  </span>
                </div>

                {loading ? (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>Carregando...</p>
                ) : challengeBoard.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
                    Nenhum participante ainda. Seja o primeiro!
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {challengeBoard.map(entry => (
                      <RankRow key={entry.user_id} entry={entry} isCurrentUser={entry.user_id === user?.id} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
