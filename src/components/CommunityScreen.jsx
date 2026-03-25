import React, { useState, useEffect, useMemo } from 'react';
import { ALL_EXERCISES } from '../data/exercises';
import { CAR_PROFILES } from '../data/carProfiles';
import { useAuth } from '../lib/AuthContext';
import { getLeaderboard, getUserRank, getActiveChallenges, getChallengeLeaderboard } from '../lib/community';
import { isSupabaseConfigured } from '../lib/supabase';
import { PremiumLockButton } from './PremiumGate';
import ActivityFeed from './ActivityFeed';

const btn = { padding: '6px 14px', fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)' };
const card = { padding: '16px 18px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', marginBottom: 12 };

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };
const DIFF_CONFIG = {
  iniciante: { label: 'Iniciante', color: '#27ae60', icon: '🟢' },
  intermediario: { label: 'Intermediário', color: '#f39c12', icon: '🟡' },
  dificil: { label: 'Difícil', color: '#e74c3c', icon: '🔴' },
};

function RankRow({ entry, isCurrentUser }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
      background: isCurrentUser ? '#2980b908' : 'transparent',
      border: isCurrentUser ? '1.5px solid #2980b920' : '1px solid transparent',
      borderRadius: 10,
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
        {entry.attempts > 1 && (
          <span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 6, fontFamily: 'var(--font-mono)' }}>{entry.attempts}x</span>
        )}
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

export default function CommunityScreen({ onBack, onStartExercise, onLogin }) {
  const { user, profile, isPremiumUser } = useAuth();
  const [tab, setTab] = useState('feed');
  const [selectedExercise, setSelectedExercise] = useState('b_trail');
  const [selectedCarProfile, setSelectedCarProfile] = useState('all');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('iniciante');
  const [challengeCarFilter, setChallengeCarFilter] = useState('all');
  const [challengeBoard, setChallengeBoard] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Load challenges
  useEffect(() => {
    if (tab !== 'challenge') return;
    setLoading(true);
    getActiveChallenges().then(data => {
      setChallenges(data);
      setLoading(false);
    });
  }, [tab]);

  // Load challenge leaderboard when selecting a challenge
  const activeChallenge = challenges.find(c => c.difficulty === selectedDifficulty);
  useEffect(() => {
    if (!activeChallenge) { setChallengeBoard([]); return; }
    getChallengeLeaderboard(activeChallenge.id, challengeCarFilter).then(setChallengeBoard);
  }, [activeChallenge?.id, challengeCarFilter]);

  const exerciseInfo = ALL_EXERCISES.find(e => e.id === selectedExercise);

  if (!isSupabaseConfigured()) {
    return (
      <div style={{ maxWidth: 1100, width: '100%' }}>
        <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
          <button onClick={onBack} style={btn}>← VOLTAR</button>
          <h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)' }}>Comunidade</h2>
        </div>
        <div style={{ ...card, textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🏆</p>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Configure o Supabase para acessar a comunidade.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, width: '100%' }}>
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
        <button onClick={onBack} style={btn}>← VOLTAR</button>
        <h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)', flex: 1 }}>Comunidade</h2>
      </div>

      {/* Tabs */}
      <div className="animate-in" style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
        {[
          { key: 'feed', label: '📡 Feed' },
          { key: 'leaderboard', label: '🏆 Ranking Global' },
          { key: 'challenge', label: '⚡ Desafio Semanal' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            ...btn, flex: 1, textAlign: 'center', padding: '10px', fontWeight: tab === t.key ? 700 : 500,
            borderColor: tab === t.key ? '#2980b930' : 'var(--border)',
            background: tab === t.key ? '#2980b908' : 'transparent',
            color: tab === t.key ? '#2980b9' : 'var(--text-muted)',
            fontFamily: 'var(--font-display)', fontSize: 13,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ FEED TAB ═══ */}
      {tab === 'feed' && (
        <div className="animate-in" style={{ ...card }}>
          <ActivityFeed limit={30} />
        </div>
      )}

      {/* ═══ LEADERBOARD TAB ═══ */}
      {tab === 'leaderboard' && (
        <div className="animate-in">
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
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <button onClick={() => setSelectedCarProfile('all')} style={{ ...btn, fontSize: 9, padding: '4px 8px', borderColor: selectedCarProfile === 'all' ? '#8e44ad' : 'var(--border)', color: selectedCarProfile === 'all' ? '#8e44ad' : 'var(--text-muted)' }}>Todos</button>
              {CAR_PROFILES.map(p => (
                <button key={p.id} onClick={() => setSelectedCarProfile(p.id)} style={{ ...btn, fontSize: 9, padding: '4px 8px', borderColor: selectedCarProfile === p.id ? p.color : 'var(--border)', color: selectedCarProfile === p.id ? p.color : 'var(--text-muted)' }}>
                  {p.icon} {p.name}
                </button>
              ))}
            </div>
          </div>

          {userRank && (
            <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 14, background: '#2980b906', borderColor: '#2980b920' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#2980b9' }}>{MEDAL[userRank.rank] || `${userRank.rank}º`}</span>
                <p style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-condensed)' }}>SUA POSIÇÃO</p>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{profile?.display_name || 'Você'}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>em {exerciseInfo?.name}</span>
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#2980b9' }}>{userRank.score}%</span>
            </div>
          )}

          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px' }}>
                RANKING — {exerciseInfo?.name?.toUpperCase() || 'EXERCÍCIO'}
              </p>
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{leaderboardData.length} pilotos</span>
            </div>
            {loading ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>Carregando...</p>
            ) : leaderboardData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ fontSize: 28, marginBottom: 8 }}>🏁</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>Nenhuma pontuação ainda</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Seja o primeiro!</p>
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

      {/* ═══ CHALLENGE TAB ═══ */}
      {tab === 'challenge' && (
        <div className="animate-in">
          {/* Premium banner for free users */}
          {!isPremiumUser && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', marginBottom: 12,
              background: 'linear-gradient(135deg, #f1c40f08, #f39c1208)', borderRadius: 'var(--radius-lg)',
              border: '1.5px solid #f1c40f25',
            }}>
              <span style={{ fontSize: 18 }}>⭐</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#b7950b' }}>Exclusivo Premium</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Você pode ver os desafios e rankings, mas precisa de Premium para participar.</p>
              </div>
              <button onClick={onLogin} style={{ ...btn, borderColor: '#f1c40f', color: '#b7950b', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>⭐ UPGRADE</button>
            </div>
          )}

          {/* Difficulty tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {Object.entries(DIFF_CONFIG).map(([key, cfg]) => {
              const ch = challenges.find(c => c.difficulty === key);
              return (
                <button key={key} onClick={() => setSelectedDifficulty(key)} style={{
                  ...btn, flex: 1, textAlign: 'center', padding: '10px 8px',
                  borderColor: selectedDifficulty === key ? cfg.color + '40' : 'var(--border)',
                  background: selectedDifficulty === key ? cfg.color + '10' : 'transparent',
                  color: selectedDifficulty === key ? cfg.color : 'var(--text-muted)',
                  fontWeight: selectedDifficulty === key ? 700 : 500, fontSize: 12,
                }}>
                  {cfg.icon} {cfg.label}
                  {!ch && <span style={{ fontSize: 8, display: 'block', marginTop: 2, opacity: 0.6 }}>—</span>}
                </button>
              );
            })}
          </div>

          {!activeChallenge ? (
            <div style={{ ...card, textAlign: 'center', padding: '2.5rem' }}>
              <p style={{ fontSize: 36, marginBottom: 12 }}>⏳</p>
              <p style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-display)' }}>Nenhum desafio {DIFF_CONFIG[selectedDifficulty]?.label.toLowerCase()} ativo</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Os desafios são renovados toda semana automaticamente.</p>
            </div>
          ) : (
            <>
              {/* Challenge info card */}
              <div style={{
                ...card, padding: '24px', textAlign: 'center',
                background: `linear-gradient(135deg, ${DIFF_CONFIG[selectedDifficulty].color}06, ${DIFF_CONFIG[selectedDifficulty].color}03)`,
                borderColor: DIFF_CONFIG[selectedDifficulty].color + '20',
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-condensed)', color: DIFF_CONFIG[selectedDifficulty].color, letterSpacing: '1px', fontWeight: 600 }}>
                    ⚡ DESAFIO {DIFF_CONFIG[selectedDifficulty].label.toUpperCase()}
                  </span>
                  {activeChallenge.car_profile_id && activeChallenge.car_profile_id !== 'default' && (() => {
                    const cp = CAR_PROFILES.find(p => p.id === activeChallenge.car_profile_id);
                    return cp ? (
                      <span style={{ fontSize: 10, fontFamily: 'var(--font-condensed)', padding: '2px 8px', borderRadius: 8, background: cp.color + '12', color: cp.color, fontWeight: 600 }}>
                        {cp.icon} {cp.name}
                      </span>
                    ) : null;
                  })()}
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: 4 }}>{activeChallenge.exercise_name}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, maxWidth: 420, margin: '6px auto 0' }}>{activeChallenge.description}</p>

                {/* Countdown */}
                <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 16 }}>
                  {(() => {
                    const diff = Math.max(0, new Date(activeChallenge.ends_at) - new Date());
                    const d = Math.floor(diff / 864e5), h = Math.floor((diff % 864e5) / 36e5);
                    return [{ v: d, l: 'DIAS' }, { v: h, l: 'HORAS' }].map(t => (
                      <div key={t.l} style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: DIFF_CONFIG[selectedDifficulty].color }}>{t.v}</span>
                        <p style={{ fontSize: 8, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px' }}>{t.l}</p>
                      </div>
                    ));
                  })()}
                </div>

                {/* Action button — premium gated */}
                <div style={{ marginTop: 16 }}>
                  <PremiumLockButton
                    onClick={() => {
                      const ex = ALL_EXERCISES.find(e => e.id === activeChallenge.exercise_id);
                      if (ex) onStartExercise(ex);
                    }}
                    onLogin={onLogin}
                    style={{
                      padding: '10px 28px', fontSize: 13, borderRadius: 10, fontWeight: 700,
                      fontFamily: 'var(--font-display)', letterSpacing: '.3px',
                      border: `2px solid ${DIFF_CONFIG[selectedDifficulty].color}`,
                      background: DIFF_CONFIG[selectedDifficulty].color, color: '#fff',
                      cursor: 'pointer', boxShadow: `0 2px 8px ${DIFF_CONFIG[selectedDifficulty].color}30`,
                    }}
                  >
                    PARTICIPAR DO DESAFIO
                  </PremiumLockButton>
                </div>
              </div>

              {/* Car profile filter for challenge ranking */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                <button onClick={() => setChallengeCarFilter('all')} style={{ ...btn, fontSize: 9, padding: '4px 8px', borderColor: challengeCarFilter === 'all' ? '#8e44ad' : 'var(--border)', color: challengeCarFilter === 'all' ? '#8e44ad' : 'var(--text-muted)' }}>Todos</button>
                {CAR_PROFILES.map(p => (
                  <button key={p.id} onClick={() => setChallengeCarFilter(p.id)} style={{ ...btn, fontSize: 9, padding: '4px 8px', borderColor: challengeCarFilter === p.id ? p.color : 'var(--border)', color: challengeCarFilter === p.id ? p.color : 'var(--text-muted)' }}>
                    {p.icon} {p.name}
                  </button>
                ))}
              </div>

              {/* Challenge ranking */}
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px' }}>
                    RANKING — {DIFF_CONFIG[selectedDifficulty].label.toUpperCase()}
                  </p>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{challengeBoard.length} participantes</span>
                </div>
                {challengeBoard.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>Nenhum participante ainda. Seja o primeiro!</p>
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
