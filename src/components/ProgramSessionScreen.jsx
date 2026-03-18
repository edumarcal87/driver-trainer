import React, { useState, useCallback, useRef } from 'react';
import { ALL_EXERCISES } from '../data/exercises';
import ExerciseScreen from './ExerciseScreen';
import { ScoreRing } from './UI';

const btn = { padding: '7px 16px', fontSize: 12, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' };

export default function ProgramSessionScreen({ program, weekIdx, sessionIdx, onBack, onResult, inputMode, pedalConfigs, carProfile, sessionLog }) {
  const week = program.weeks[weekIdx];
  const session = week.sessions[sessionIdx];
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [results, setResults] = useState([]); // [{ exId, score, passed }]
  const [phase, setPhase] = useState('intro'); // intro | exercise | result | complete
  const exerciseCompletedRef = useRef(false); // prevent double-fire

  const exercises = session.exercises.map(id => ALL_EXERCISES.find(e => e.id === id)).filter(Boolean);
  const currentEx = exercises[currentExIdx];

  const handleExResult = useCallback((exId, score, analysis) => {
    if (exerciseCompletedRef.current) return; // prevent duplicate
    exerciseCompletedRef.current = true;
    onResult(exId, score, analysis);
    const passed = score >= session.minScore;
    setResults(prev => [...prev, { exId, score, passed }]);
    setPhase('result');
  }, [session.minScore, onResult]);

  const handleNext = useCallback(() => {
    exerciseCompletedRef.current = false;
    if (currentExIdx < exercises.length - 1) {
      setCurrentExIdx(prev => prev + 1);
      setPhase('exercise');
    } else {
      setPhase('complete');
    }
  }, [currentExIdx, exercises.length]);

  const handleRetry = useCallback(() => {
    exerciseCompletedRef.current = false;
    // Remove last result and go back to exercise
    setResults(prev => prev.slice(0, -1));
    setPhase('exercise');
  }, []);

  const startExercise = useCallback(() => {
    exerciseCompletedRef.current = false;
    setPhase('exercise');
  }, []);

  // ── Exercise phase ──
  if (phase === 'exercise' && currentEx) {
    return (
      <ExerciseScreen
        exercise={currentEx}
        onBack={() => {
          // Back from exercise WITHOUT result → go to intro if no results yet, otherwise show last result or intro
          if (results.length > 0) {
            setPhase('result');
          } else {
            setPhase('intro');
          }
        }}
        inputMode={inputMode}
        pedalConfigs={pedalConfigs}
        onResult={handleExResult}
        carProfile={carProfile}
        sessionLog={sessionLog}
      />
    );
  }

  // ── Intro ──
  if (phase === 'intro') {
    return (
      <div style={{ maxWidth: 520, width: '100%', margin: '0 auto' }}>
        <div className="animate-in" style={{ textAlign: 'center', marginTop: 40, marginBottom: 24 }}>
          <span style={{ fontSize: 32 }}>{program.icon}</span>
          <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: program.color, marginTop: 8 }}>
            {program.name}
          </h2>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-condensed)', letterSpacing: '1px', marginTop: 4 }}>
            {week.title.toUpperCase()}
          </p>
        </div>

        <div className="animate-in animate-in-delay-1" style={{
          background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)', padding: '24px', textAlign: 'center',
        }}>
          <h3 style={{ fontSize: 17, fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: 6 }}>{session.title}</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>{session.desc}</p>

          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            {exercises.map((ex, i) => (
              <div key={i} style={{
                padding: '6px 12px', background: 'var(--bg-inset)', borderRadius: 8, border: '1px solid var(--border)',
                fontSize: 11, fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', fontWeight: 500,
              }}>
                {i + 1}. {ex?.name || 'Exercício'}
              </div>
            ))}
          </div>

          {exercises.length === 0 && (
            <p style={{ fontSize: 12, color: '#e74c3c', marginBottom: 16 }}>Exercícios não encontrados para esta sessão.</p>
          )}

          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
            Nota mínima: <strong style={{ color: program.color }}>{session.minScore}%</strong> em cada exercício
          </p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {exercises.length > 0 && (
              <button onClick={startExercise} style={{
                padding: '10px 32px', fontSize: 14, borderRadius: 12, fontWeight: 700, fontFamily: 'var(--font-display)',
                border: `1.5px solid ${program.color}`, background: program.color + '12', color: program.color, cursor: 'pointer',
                boxShadow: `0 2px 8px ${program.color}20`,
              }}>
                COMEÇAR
              </button>
            )}
            <button onClick={onBack} style={btn}>VOLTAR</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Result after each exercise ──
  if (phase === 'result') {
    const lastResult = results[results.length - 1];
    // Safety: if no results, go back to intro
    if (!lastResult) {
      setPhase('intro');
      return null;
    }
    const isLast = currentExIdx >= exercises.length - 1;
    return (
      <div style={{ maxWidth: 520, width: '100%', margin: '0 auto' }}>
        <div className="animate-in" style={{ textAlign: 'center', marginTop: 40, marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '1px' }}>
            EXERCÍCIO {currentExIdx + 1} DE {exercises.length}
          </p>
        </div>

        <div className="animate-in animate-in-delay-1" style={{
          background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)', padding: '28px', textAlign: 'center',
        }}>
          <ScoreRing score={lastResult.score} size={80} />
          <p style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: 12 }}>
            {currentEx?.name || 'Exercício'}
          </p>
          <p style={{
            fontSize: 14, fontWeight: 600, marginTop: 8,
            color: lastResult.passed ? '#27ae60' : '#e74c3c',
          }}>
            {lastResult.passed ? '✓ Aprovado!' : `✗ Mínimo: ${session.minScore}%`}
          </p>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', margin: '16px 0' }}>
            {exercises.map((_, i) => {
              const r = results[i];
              return (
                <div key={i} style={{
                  width: 32, height: 6, borderRadius: 3,
                  background: r ? (r.passed ? '#27ae60' : '#e74c3c') : i === currentExIdx + 1 ? program.color + '40' : 'var(--bg-inset)',
                  border: `1px solid ${r ? (r.passed ? '#27ae6030' : '#e74c3c30') : 'var(--border)'}`,
                }} />
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
            {!lastResult.passed && (
              <button onClick={handleRetry} style={{
                padding: '10px 24px', fontSize: 13, borderRadius: 12, fontWeight: 700, fontFamily: 'var(--font-display)',
                border: '1.5px solid #e74c3c', background: '#fde8e6', color: '#e74c3c', cursor: 'pointer',
              }}>
                TENTAR DE NOVO
              </button>
            )}
            {lastResult.passed && !isLast && (
              <button onClick={handleNext} style={{
                padding: '10px 28px', fontSize: 13, borderRadius: 12, fontWeight: 700, fontFamily: 'var(--font-display)',
                border: `1.5px solid ${program.color}`, background: program.color + '12', color: program.color, cursor: 'pointer',
              }}>
                PRÓXIMO EXERCÍCIO →
              </button>
            )}
            {lastResult.passed && isLast && (
              <button onClick={() => setPhase('complete')} style={{
                padding: '10px 28px', fontSize: 13, borderRadius: 12, fontWeight: 700, fontFamily: 'var(--font-display)',
                border: '1.5px solid #27ae60', background: '#e6f5ec', color: '#27ae60', cursor: 'pointer',
              }}>
                VER RESULTADO
              </button>
            )}
            <button onClick={onBack} style={btn}>SAIR DA SESSÃO</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Complete ──
  const allPassed = results.length >= exercises.length && results.every(r => r.passed);
  const avgScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0;
  return (
    <div style={{ maxWidth: 520, width: '100%', margin: '0 auto' }}>
      <div className="animate-in" style={{
        background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)', padding: '32px', textAlign: 'center', marginTop: 40,
      }}>
        <span style={{ fontSize: 40 }}>{allPassed ? '🏆' : '📋'}</span>
        <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: 12, color: allPassed ? '#27ae60' : program.color }}>
          {allPassed ? 'Sessão Completa!' : 'Sessão Finalizada'}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
          {session.title} — {week.title}
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', margin: '20px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <ScoreRing score={avgScore} size={64} />
            <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-condensed)', marginTop: 4, letterSpacing: '.5px' }}>MÉDIA</p>
          </div>
        </div>

        {/* Per-exercise results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, textAlign: 'left' }}>
          {results.map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
              background: r.passed ? '#e6f5ec' : '#fde8e6', borderRadius: 8, border: `1px solid ${r.passed ? '#27ae6020' : '#e74c3c20'}`,
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: r.passed ? '#27ae60' : '#e74c3c' }}>{r.passed ? '✓' : '✗'}</span>
              <span style={{ fontSize: 12, flex: 1 }}>{exercises[i]?.name || 'Exercício'}</span>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: r.passed ? '#27ae60' : '#e74c3c' }}>{r.score}%</span>
            </div>
          ))}
        </div>

        {allPassed && (
          <p style={{ fontSize: 12, color: '#27ae60', fontWeight: 600, marginBottom: 16 }}>
            Todos os exercícios aprovados! Próxima sessão desbloqueada.
          </p>
        )}
        {!allPassed && (
          <p style={{ fontSize: 12, color: '#e74c3c', marginBottom: 16 }}>
            Alguns exercícios não atingiram a nota mínima de {session.minScore}%. Tente novamente!
          </p>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button onClick={onBack} style={{
            padding: '10px 28px', fontSize: 14, borderRadius: 12, fontWeight: 700, fontFamily: 'var(--font-display)',
            border: `1.5px solid ${program.color}`, background: program.color + '12', color: program.color, cursor: 'pointer',
          }}>
            VOLTAR AO PROGRAMA
          </button>
        </div>
      </div>
    </div>
  );
}
