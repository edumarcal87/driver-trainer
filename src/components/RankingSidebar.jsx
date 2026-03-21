import React, { useState, useEffect } from 'react';
import { ALL_EXERCISES } from '../data/exercises';
import { getLeaderboard, getUserRank, getActiveChallenges } from '../lib/community';

const SIDEBAR_EXERCISES = ['b_trail', 'x_heel_toe', 'b_threshold', 'x_full_corner', 'ilg_t12_juncao'];

export default function RankingSidebar({ userId, sessionLogLength, onNavigate }) {
  const [board, setBoard] = useState([]);
  const [exId, setExId] = useState('b_trail');
  const [rank, setRank] = useState(null);
  const [challenge, setChallenge] = useState(null);

  useEffect(() => {
    getLeaderboard(exId, 'all', 5).then(setBoard);
    if (userId) getUserRank(userId, exId, 'default').then(setRank);
  }, [exId, userId, sessionLogLength]);

  useEffect(() => {
    getActiveChallenges().then(chs => setChallenge(chs?.[0] || null));
  }, []);

  const exInfo = ALL_EXERCISES.find(e => e.id === exId);

  return (
    <div className="layout-sidebar" data-tour="ranking">
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 14 }}>🏆</span>
        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#b7950b', letterSpacing: '.3px' }}>RANKING</span>
      </div>

      {rank && (
        <div className="animate-in" style={{ padding: '10px', background: 'var(--bg-card)', border: '1.5px solid #f1c40f25', borderRadius: 10, marginBottom: 10 }}>
          <p style={{ fontSize: 9, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.3px', marginBottom: 6 }}>SUA POSIÇÃO</p>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#b7950b' }}>
              {rank.rank <= 3 ? ['🥇','🥈','🥉'][rank.rank-1] : `${rank.rank}º`}
            </span>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{exInfo?.name || ''}</p>
            <p style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#27ae60', marginTop: 2 }}>{rank.score}%</p>
          </div>
        </div>
      )}

      <div className="animate-in animate-in-delay-1" style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 8 }}>
        {SIDEBAR_EXERCISES.map(id => {
          const ex = ALL_EXERCISES.find(e => e.id === id);
          if (!ex) return null;
          return (
            <button key={id} onClick={() => setExId(id)} style={{
              padding: '3px 7px', fontSize: 8, borderRadius: 6, fontFamily: 'var(--font-condensed)', cursor: 'pointer',
              border: `1px solid ${exId === id ? '#2980b9' : 'var(--border)'}`,
              background: exId === id ? '#2980b910' : 'transparent',
              color: exId === id ? '#2980b9' : 'var(--text-muted)',
              fontWeight: exId === id ? 700 : 400,
            }}>{ex.name.length > 12 ? ex.name.substring(0, 12) + '…' : ex.name}</button>
          );
        })}
      </div>

      <div className="animate-in animate-in-delay-1" style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 9, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', marginBottom: 4 }}>TOP 5 — {(exInfo?.name || '').toUpperCase()}</p>
        {board.length === 0 ? (
          <p style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>Nenhum score ainda</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {board.map((entry, i) => {
              const isMe = entry.user_id === userId;
              return (
                <div key={entry.user_id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', borderRadius: 6, background: isMe ? '#2980b908' : 'var(--bg-card)', border: isMe ? '1px solid #2980b920' : '1px solid transparent' }}>
                  <span style={{ width: 16, textAlign: 'center', fontSize: i < 3 ? 13 : 10, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{['🥇','🥈','🥉'][i] || `${i+1}º`}</span>
                  <span style={{ flex: 1, fontSize: 11, fontWeight: isMe ? 700 : 400, color: isMe ? '#2980b9' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.display_name || 'Piloto'}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', color: entry.score >= 90 ? '#f1c40f' : entry.score >= 70 ? '#27ae60' : '#f39c12' }}>{entry.score}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {challenge && (
        <div className="animate-in animate-in-delay-2" style={{ padding: '10px', background: '#e74c3c05', border: '1.5px solid #e74c3c18', borderRadius: 10, marginBottom: 10 }}>
          <p style={{ fontSize: 9, fontFamily: 'var(--font-condensed)', color: '#e74c3c', fontWeight: 600 }}>⚡ DESAFIO DA SEMANA</p>
          <p style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: 4 }}>{challenge.exercise_name}</p>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{(challenge.description || '').substring(0, 50)}...</p>
          <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
            <span style={{ fontSize: 8, padding: '2px 5px', borderRadius: 4, background: '#27ae6010', color: '#27ae60' }}>🟢</span>
            <span style={{ fontSize: 8, padding: '2px 5px', borderRadius: 4, background: '#f39c1210', color: '#f39c12' }}>🟡</span>
            <span style={{ fontSize: 8, padding: '2px 5px', borderRadius: 4, background: '#e74c3c10', color: '#e74c3c' }}>🔴</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{Math.max(0, Math.floor((new Date(challenge.ends_at) - new Date()) / 864e5))}d restantes</span>
            <button onClick={() => onNavigate('community')} style={{ fontSize: 9, padding: '4px 10px', borderRadius: 6, background: '#e74c3c', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-display)' }}>PARTICIPAR</button>
          </div>
        </div>
      )}

      <button onClick={() => onNavigate('community')} style={{ width: '100%', fontSize: 10, padding: '8px', borderRadius: 8, border: '1.5px solid #f1c40f30', background: '#f1c40f08', color: '#b7950b', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-display)', textAlign: 'center' }}>VER RANKING COMPLETO →</button>
    </div>
  );
}
