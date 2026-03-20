import React, { useState, useMemo } from 'react';
import { PROGRAMS } from '../data/programs';
import { CAR_PROFILES } from '../data/carProfiles';
import { PremiumLockButton } from './PremiumGate';
import { ScoreRing, DifficultyDots } from './UI';

const btn = { padding: '7px 16px', fontSize: 12, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' };
const card = { background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '18px 20px', marginBottom: 12, transition: 'box-shadow 0.2s, border-color 0.2s' };

function getProgress(program, sessionLog) {
  let totalSessions = 0, completedSessions = 0;
  for (const week of program.weeks) {
    for (const session of week.sessions) {
      totalSessions++;
      const allPassed = session.exercises.every(exId => {
        const best = sessionLog.filter(s => s.exId === exId).reduce((max, s) => Math.max(max, s.score), 0);
        return best >= session.minScore;
      });
      if (allPassed) completedSessions++;
    }
  }
  return { totalSessions, completedSessions, pct: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0 };
}

function findCurrentSession(program, sessionLog) {
  for (let wi = 0; wi < program.weeks.length; wi++) {
    const week = program.weeks[wi];
    for (let si = 0; si < week.sessions.length; si++) {
      const session = week.sessions[si];
      const allPassed = session.exercises.every(exId => {
        const best = sessionLog.filter(s => s.exId === exId).reduce((max, s) => Math.max(max, s.score), 0);
        return best >= session.minScore;
      });
      if (!allPassed) return { weekIdx: wi, sessionIdx: si, week, session };
    }
  }
  return null; // All complete
}

export default function ProgramsScreen({ onBack, onStartSession, sessionLog, initialProgram, carProfile, setCarProfile, onLogin }) {
  const [selectedProgram, setSelectedProgram] = useState(initialProgram || null);
  const [programFilter, setProgramFilter] = useState('all'); // all | pedals | pedals_steering | pedals_steering_gear

  // ── Program list ──
  if (!selectedProgram) {
    return (
      <div style={{ maxWidth: 720, width: '100%' }}>
        <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
          <button onClick={onBack} style={btn}>← VOLTAR</button>
          <h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)', flex: 1 }}>Programas de Treino</h2>
        </div>

        <p className="animate-in animate-in-delay-1" style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Siga um programa estruturado com progressão. Complete cada sessão com a nota mínima para avançar.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 12 }}>
          {PROGRAMS.map((prog, i) => {
            const progress = getProgress(prog, sessionLog);
            const current = findCurrentSession(prog, sessionLog);
            const isComplete = !current;
            return (
              <div key={prog.id}
                className={`animate-in animate-in-delay-${Math.min(i, 4)}`}
                onClick={() => setSelectedProgram(prog)}
                style={{
                  ...card, cursor: 'pointer', borderLeft: `4px solid ${prog.color}30`,
                  ...(isComplete ? { borderColor: prog.color + '40' } : {}),
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 26, lineHeight: 1 }}>{prog.icon}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', color: prog.color }}>{prog.name}</span>
                    </div>
                    <span style={{
                      fontSize: 9, fontFamily: 'var(--font-mono)', padding: '3px 10px', borderRadius: 10,
                      background: prog.color + '12', color: prog.color, border: `1px solid ${prog.color}25`, letterSpacing: '.5px', fontWeight: 600,
                    }}>{prog.level.toUpperCase()}</span>
                  </div>
                  {progress.pct > 0 && <ScoreRing score={progress.pct} size={48} />}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 10 }}>{prog.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {prog.weeks.length} semanas · {progress.completedSessions}/{progress.totalSessions} sessões
                  </span>
                  {isComplete && (
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: prog.color, fontWeight: 600 }}>✓ COMPLETO</span>
                  )}
                  {current && progress.pct > 0 && (
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: prog.color, fontWeight: 500 }}>EM ANDAMENTO</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Program detail ──
  const prog = selectedProgram;
  const progress = getProgress(prog, sessionLog);
  const current = findCurrentSession(prog, sessionLog);

  return (
    <div style={{ maxWidth: 720, width: '100%' }}>
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
        <button onClick={() => setSelectedProgram(null)} style={btn}>← PROGRAMAS</button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: prog.color }}>
            {prog.icon} {prog.name}
          </h2>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{prog.desc}</p>
        </div>
        {progress.pct > 0 && <ScoreRing score={progress.pct} size={52} />}
      </div>

      {/* Progress bar */}
      <div className="animate-in animate-in-delay-1" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px' }}>PROGRESSO GERAL</span>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: prog.color, fontWeight: 600 }}>{progress.completedSessions}/{progress.totalSessions}</span>
        </div>
        <div style={{ height: 6, background: 'var(--bg-inset)', borderRadius: 3, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{ width: `${progress.pct}%`, height: '100%', background: prog.color, borderRadius: 3, transition: 'width .4s' }} />
        </div>
      </div>

      {/* Car profile selector */}
      {carProfile && setCarProfile && (
        <div className="animate-in animate-in-delay-1" style={{
          ...card, padding: '12px 16px', marginBottom: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 13 }}>🏎️</span>
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '.3px', color: 'var(--text-secondary)' }}>PERFIL DO CARRO</span>
            {carProfile.id !== 'default' && (
              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 8, background: carProfile.color + '15', color: carProfile.color, fontWeight: 600 }}>
                {carProfile.icon} {carProfile.name.toUpperCase()}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CAR_PROFILES.map(p => {
              const active = carProfile.id === p.id;
              return (
                <button key={p.id} onClick={() => setCarProfile(p)}
                  style={{
                    padding: '7px 12px', fontSize: 10, borderRadius: 10, fontWeight: active ? 700 : 500,
                    fontFamily: 'var(--font-condensed)', letterSpacing: '.3px', cursor: 'pointer',
                    border: `1.5px solid ${active ? p.color : 'var(--border)'}`,
                    background: active ? p.color + '15' : 'var(--bg-card)',
                    color: active ? p.color : 'var(--text-muted)',
                    boxShadow: active ? `0 2px 8px ${p.color}20` : '0 1px 2px rgba(0,0,0,0.03)',
                    transition: 'all .15s',
                  }}>
                  {p.icon} {p.name}{active ? ' ✓' : ''}
                </button>
              );
            })}
          </div>
          {carProfile.id !== 'default' && (
            <p style={{ fontSize: 10, color: carProfile.color, marginTop: 6, fontFamily: 'var(--font-condensed)', letterSpacing: '.3px' }}>
              {carProfile.desc}
            </p>
          )}
        </div>
      )}

      {/* Input filter (only for programs that support it) */}
      {prog.filterEnabled && (
        <div className="animate-in animate-in-delay-1" style={{ display: 'flex', gap: 5, marginBottom: '1rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'TODOS', icon: '🎮' },
            { key: 'pedals', label: 'FREIO + ACEL', icon: '🦶' },
            { key: 'pedals_steering', label: '+ VOLANTE', icon: '🎡' },
            { key: 'pedals_steering_gear', label: '+ CÂMBIO', icon: '⚙️' },
          ].map(f => (
            <button key={f.key} onClick={() => setProgramFilter(f.key)}
              style={{
                padding: '5px 12px', fontSize: 10, borderRadius: 16, fontWeight: 600,
                fontFamily: 'var(--font-condensed)', letterSpacing: '.5px', cursor: 'pointer',
                border: `1.5px solid ${programFilter === f.key ? prog.color : 'var(--border)'}`,
                background: programFilter === f.key ? prog.color + '12' : 'var(--bg-card)',
                color: programFilter === f.key ? prog.color : 'var(--text-muted)',
                boxShadow: programFilter === f.key ? `0 1px 4px ${prog.color}15` : '0 1px 2px rgba(0,0,0,0.03)',
              }}>
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Weeks & sessions */}
      {prog.weeks.map((week, wi) => {
        // Filter sessions based on selected input filter
        const filteredSessions = prog.filterEnabled && programFilter !== 'all'
          ? week.sessions.filter(s => {
              if (!s.inputs) return true; // no inputs tag = always show
              const has = (type) => s.inputs.includes(type);
              if (programFilter === 'pedals') return !has('steering') && !has('gear');
              if (programFilter === 'pedals_steering') return !has('gear');
              return true; // pedals_steering_gear = all
            })
          : week.sessions;

        if (filteredSessions.length === 0) return null;

        return (
          <div key={wi} className="animate-in" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, background: prog.color + '12', border: `1.5px solid ${prog.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', color: prog.color,
              }}>
                {wi + 1}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                {week.title}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 36 }}>
              {filteredSessions.map((session, fsi) => {
                // Find original index in week.sessions for correct routing
                const origSi = week.sessions.indexOf(session);
                const si = origSi >= 0 ? origSi : fsi;
                // Check if this specific session is the "current" one
                const isCurrent = current && current.weekIdx === wi && current.sessionIdx === si;
                const allPassed = session.exercises.every(exId => {
                  const best = sessionLog.filter(e => e.exId === exId).reduce((max, e) => Math.max(max, e.score), 0);
                  return best >= session.minScore;
                });
                // Session is unlocked if previous session in same week is done (or it's the first)
                const isUnlocked = true;

                // Get per-exercise scores
                const exScores = session.exercises.map(exId => {
                  const best = sessionLog.filter(e => e.exId === exId).reduce((max, e) => Math.max(max, e.score), 0);
                  return { exId, best, passed: best >= session.minScore };
                });

                return (
                  <div key={si} style={{
                    ...card, padding: '14px 16px', marginBottom: 0,
                    borderLeft: `3px solid ${allPassed ? '#27ae6040' : isCurrent ? prog.color + '60' : 'var(--border)'}`,
                    opacity: isUnlocked ? 1 : 0.5,
                    background: isCurrent ? prog.color + '04' : 'var(--bg-card)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)' }}>
                          {allPassed ? '✓ ' : ''}{session.title}
                        </span>
                        {isCurrent && !allPassed && (
                          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 8, background: prog.color + '15', color: prog.color, marginLeft: 8, fontWeight: 600 }}>PRÓXIMO</span>
                        )}
                      </div>
                      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        mín. {session.minScore}%
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{session.desc}</p>

                    {/* Exercise progress dots */}
                    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                      {exScores.map((ex, ei) => (
                        <div key={ei} style={{
                          flex: 1, height: 4, borderRadius: 2,
                          background: ex.passed ? '#27ae60' : ex.best > 0 ? '#f39c12' : 'var(--bg-inset)',
                          border: `1px solid ${ex.passed ? '#27ae6030' : 'var(--border)'}`,
                        }} />
                      ))}
                    </div>

                    {isUnlocked && !allPassed && (
                      <PremiumLockButton onClick={() => onStartSession(prog, wi, si)} onLogin={onLogin} style={{
                        padding: '8px 20px', fontSize: 12, borderRadius: 10, fontWeight: 700, fontFamily: 'var(--font-display)',
                        border: `1.5px solid ${prog.color}`, background: prog.color + '12', color: prog.color, cursor: 'pointer',
                        boxShadow: `0 1px 4px ${prog.color}15`, width: '100%',
                      }}>
                        INICIAR SESSÃO
                      </PremiumLockButton>
                    )}
                    {allPassed && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#27ae60', fontWeight: 600 }}>✓ COMPLETA</span>
                        <PremiumLockButton onClick={() => onStartSession(prog, wi, si)} onLogin={onLogin} style={{
                          padding: '7px 18px', fontSize: 11, borderRadius: 10, fontWeight: 700, fontFamily: 'var(--font-display)',
                          border: `1.5px solid ${prog.color}40`, background: prog.color + '08', color: prog.color, cursor: 'pointer',
                          marginLeft: 'auto', boxShadow: `0 1px 3px ${prog.color}10`,
                        }}>🔄 REPETIR SESSÃO</PremiumLockButton>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
