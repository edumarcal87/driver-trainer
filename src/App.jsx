import React, { useState, useEffect, useCallback } from 'react';
import { ALL_EXERCISES, EXERCISE_CATEGORIES, BRAKE_EXERCISES } from './data/exercises';
import { PROGRAMS } from './data/programs';
import { parseCSV, detectBrakeZones, zoneToExercise } from './utils/telemetry';
import { getDefaultPedalConfig } from './utils/gamepad';
import ExerciseScreen from './components/ExerciseScreen';
import ConfigScreen from './components/ConfigScreen';
import ProgressScreen from './components/ProgressScreen';
import ProgramsScreen from './components/ProgramsScreen';
import ProgramSessionScreen from './components/ProgramSessionScreen';
import SetupWizard from './components/SetupWizard';
import { BrakeIcon, ThrottleIcon, ClutchIcon, SteeringIcon } from './components/SetupWizard';
import { DifficultyDots, StatusBadge, CategoryBadge, LevelBadge, ScoreRing } from './components/UI';

const btn = { padding: '7px 16px', fontSize: 12, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' };
const CAT_HEX = { brake: '#e74c3c', throttle: '#27ae60', clutch: '#f39c12', steering: '#2980b9', combined: '#8e44ad' };

const PEDAL_ICONS = {
  brake: (s) => <BrakeIcon size={s} color="#e74c3c" />,
  throttle: (s) => <ThrottleIcon size={s} color="#27ae60" />,
  clutch: (s) => <ClutchIcon size={s} color="#f39c12" />,
  steering: (s) => <SteeringIcon size={s} color="#2980b9" />,
  combined: (s) => <svg width={s} height={s} viewBox="0 0 32 32" fill="none"><circle cx="10" cy="16" r="8" stroke="#8e44ad" strokeWidth="1.5"/><circle cx="22" cy="16" r="8" stroke="#8e44ad" strokeWidth="1.5"/><circle cx="16" cy="16" r="3" fill="#8e44ad" opacity=".4"/></svg>,
};

const SECTION_ICONS = {
  brake: (s) => <BrakeIcon size={s} color="#e74c3c" />,
  throttle: (s) => <ThrottleIcon size={s} color="#27ae60" />,
  clutch: (s) => <ClutchIcon size={s} color="#f39c12" />,
  steering: (s) => <SteeringIcon size={s} color="#2980b9" />,
  combined: PEDAL_ICONS.combined,
};

function ExerciseCard({ ex, best, attempts, onOpen }) {
  const pedal = ex.pedal || 'brake';
  const catHex = CAT_HEX[pedal] || '#8e44ad';
  const catLabel = { brake: 'FREIO', throttle: 'ACEL', clutch: 'EMBR', steering: 'VOLANTE', combined: 'COMBO', telemetry: 'TELEM' }[pedal] || '';
  return (
    <div className="card card-interactive" onClick={onOpen}
      style={{ position: 'relative', overflow: 'hidden', borderLeft: `3px solid ${catHex}30` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: catHex + '10', border: `1px solid ${catHex}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {PEDAL_ICONS[pedal] ? PEDAL_ICONS[pedal](16) : <span style={{ fontSize: 13 }}>{ex.icon}</span>}
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name.toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginLeft: 38 }}>
            {best !== undefined && <LevelBadge score={best} attempts={attempts} />}
            {!best && ex.diff && <DifficultyDots level={ex.diff} />}
          </div>
        </div>
        {best !== undefined && <ScoreRing score={best} size={50} />}
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, marginLeft: 38 }}>{ex.desc}</p>
      {best !== undefined && (
        <div style={{ marginLeft: 38, marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 80, height: 4, background: 'var(--bg-inset)', borderRadius: 2, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div style={{ width: `${best}%`, height: '100%', background: best >= 70 ? 'linear-gradient(90deg, #27ae60, #2ecc71)' : 'linear-gradient(90deg, #f39c12, #e67e22)', borderRadius: 2 }} />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: best >= 70 ? 'var(--accent-throttle)' : 'var(--accent-clutch)', fontSize: 11 }}>{best}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ category, exerciseCount }) {
  const c = CAT_HEX[category.key] || '#5a5a5a';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, marginTop: 24 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: c + '12', border: `1.5px solid ${c}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {SECTION_ICONS[category.key] ? SECTION_ICONS[category.key](20) : null}
      </div>
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', color: c, letterSpacing: '.3px' }}>{category.label.toUpperCase()}</h2>
      </div>
      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: 'var(--bg-inset)', padding: '3px 10px', borderRadius: 10, border: '1px solid var(--border)' }}>
        {exerciseCount} exercícios
      </span>
    </div>
  );
}

export default function App() {
  const loadStored = (key, fallback) => {
    try { const v = localStorage.getItem(`bt_${key}`); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  };

  const storedConfigs = loadStored('pedalConfigs', null);
  const needsRecalibration = storedConfigs && storedConfigs.brake?.axisIndex === 2 && storedConfigs.throttle?.axisIndex === 1;
  const wizardDone = !needsRecalibration && (loadStored('wizardDone', false) || !!localStorage.getItem('bt_wizardDone'));
  const [screen, setScreen] = useState(wizardDone ? 'menu' : 'wizard');

  const initialConfigs = needsRecalibration ? getDefaultPedalConfig() : (storedConfigs || getDefaultPedalConfig());
  const [pedalConfigs, setPedalConfigs] = useState(initialConfigs);
  const [exercises, setExercises] = useState(ALL_EXERCISES);
  const [selectedEx, setSelectedEx] = useState(BRAKE_EXERCISES[0]);
  const [bests, setBests] = useState(() => loadStored('bests', {}));
  const [history, setHistory] = useState(() => loadStored('history', []));
  const [gpConnected, setGpConnected] = useState(false);
  const [gpName, setGpName] = useState('');
  const [inputMode, setInputMode] = useState(() => loadStored('inputMode', 'keyboard'));
  const [telemZones, setTelemZones] = useState([]);
  const [telemFile, setTelemFile] = useState('');
  const [sessionLog, setSessionLog] = useState(() => loadStored('sessionLog', []));

  useEffect(() => { try { localStorage.setItem('bt_pedalConfigs', JSON.stringify(pedalConfigs)); } catch {} }, [pedalConfigs]);
  useEffect(() => { try { localStorage.setItem('bt_bests', JSON.stringify(bests)); } catch {} }, [bests]);
  useEffect(() => { try { localStorage.setItem('bt_history', JSON.stringify(history)); } catch {} }, [history]);
  useEffect(() => { try { localStorage.setItem('bt_inputMode', JSON.stringify(inputMode)); } catch {} }, [inputMode]);
  useEffect(() => { try { localStorage.setItem('bt_sessionLog', JSON.stringify(sessionLog)); } catch {} }, [sessionLog]);

  useEffect(() => {
    const onC = e => { setGpConnected(true); setGpName(e.gamepad.id); setInputMode('gamepad'); };
    const onD = () => { setGpConnected(false); setGpName(''); };
    window.addEventListener('gamepadconnected', onC); window.addEventListener('gamepaddisconnected', onD);
    const gps = navigator.getGamepads();
    for (const gp of gps) { if (gp) { setGpConnected(true); setGpName(gp.id); setInputMode('gamepad'); break; } }
    return () => { window.removeEventListener('gamepadconnected', onC); window.removeEventListener('gamepaddisconnected', onD); };
  }, []);

  const handleResult = useCallback((exId, sc, analysis) => {
    setBests(p => ({ ...p, [exId]: Math.max(p[exId] || 0, sc) }));
    const ex = exercises.find(e => e.id === exId);
    setHistory(p => [{ name: ex?.name || exId, score: sc }, ...p.slice(0, 29)]);
    setSessionLog(prev => [...prev, {
      exId, exName: ex?.name || exId, pedal: ex?.pedal || 'brake', diff: ex?.diff,
      score: sc, grade: analysis?.grade, consistency: analysis?.stats?.consistency,
      peakAccuracy: analysis?.stats?.peakAccuracy, peakTimingDelta: analysis?.stats?.peakTimingDelta,
      segments: analysis?.segments, timestamp: Date.now(),
    }]);
  }, [exercises]);

  const handleFile = useCallback(file => {
    const r = new FileReader();
    r.onload = e => {
      const data = parseCSV(e.target.result);
      if (!data) { alert('CSV não reconhecido. Precisa de coluna "Brake" ou "Brake%".'); return; }
      const zones = detectBrakeZones(data);
      if (zones.length === 0) { alert('Nenhuma zona de frenagem detectada.'); return; }
      const newEx = zones.map((z, i) => zoneToExercise(z, i));
      setTelemZones(newEx); setTelemFile(file.name);
      setExercises([...ALL_EXERCISES, ...newEx]);
      setScreen('telemetry');
    };
    r.readAsText(file);
  }, []);

  const openExercise = ex => { setSelectedEx(ex); setScreen('exercise'); };

  // Program session state
  const [activeProgram, setActiveProgram] = useState(null);
  const [activeWeekIdx, setActiveWeekIdx] = useState(0);
  const [activeSessionIdx, setActiveSessionIdx] = useState(0);
  const [initialProgramForScreen, setInitialProgramForScreen] = useState(null);

  const startProgramSession = (program, weekIdx, sessionIdx) => {
    setActiveProgram(program);
    setActiveWeekIdx(weekIdx);
    setActiveSessionIdx(sessionIdx);
    setScreen('program_session');
  };

  const openPrograms = (program) => {
    setInitialProgramForScreen(program || null);
    setScreen('programs');
  };

  // ── Screen routing ──
  if (screen === 'wizard') return <SetupWizard onComplete={() => setScreen('menu')} gpConnected={gpConnected} gpName={gpName} pedalConfigs={pedalConfigs} setPedalConfigs={setPedalConfigs} />;
  if (screen === 'config') return <ConfigScreen onBack={() => setScreen('menu')} gpConnected={gpConnected} gpName={gpName} pedalConfigs={pedalConfigs} setPedalConfigs={setPedalConfigs} />;
  if (screen === 'exercise') return <ExerciseScreen exercise={selectedEx} onBack={() => setScreen('menu')} inputMode={inputMode} pedalConfigs={pedalConfigs} onResult={handleResult} />;
  if (screen === 'progress') return <ProgressScreen sessionHistory={sessionLog} onBack={() => setScreen('menu')} />;
  if (screen === 'programs') return <ProgramsScreen onBack={() => setScreen('menu')} onStartSession={startProgramSession} sessionLog={sessionLog} initialProgram={initialProgramForScreen} />;
  if (screen === 'program_session' && activeProgram) return (
    <ProgramSessionScreen
      program={activeProgram} weekIdx={activeWeekIdx} sessionIdx={activeSessionIdx}
      onBack={() => { setInitialProgramForScreen(activeProgram); setScreen('programs'); }} onResult={handleResult}
      inputMode={inputMode} pedalConfigs={pedalConfigs}
    />
  );

  // ── Main Menu ──
  const totalAttempts = sessionLog.length;
  const sessionAvg = totalAttempts > 0 ? Math.round(sessionLog.reduce((s, e) => s + e.score, 0) / totalAttempts) : 0;

  // Program progress helper
  const getProgramProgress = (prog) => {
    let total = 0, done = 0;
    for (const w of prog.weeks) for (const s of w.sessions) {
      total++;
      if (s.exercises.every(exId => sessionLog.filter(e => e.exId === exId).reduce((mx, e) => Math.max(mx, e.score), 0) >= s.minScore)) done++;
    }
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  };

  // Find next session for a program
  const getNextSession = (prog) => {
    for (const w of prog.weeks) for (const s of w.sessions) {
      if (!s.exercises.every(exId => sessionLog.filter(e => e.exId === exId).reduce((mx, e) => Math.max(mx, e.score), 0) >= s.minScore)) return s;
    }
    return null;
  };

  return (
    <div style={{ maxWidth: 780, width: '100%' }}>
      {/* ── Header ── */}
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, border: '2px solid var(--accent-brake)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="30" height="30" viewBox="0 0 56 56"><path d="M8 44 Q10 20, 18 14 Q24 10, 30 22 Q34 30, 38 28 Q42 26, 44 14" fill="none" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round"/><circle cx="8" cy="44" r="3.5" fill="#e74c3c"/><circle cx="30" cy="22" r="3" fill="#27ae60"/><circle cx="44" cy="14" r="2.5" fill="#f39c12"/></svg>
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
              DRIVER <span style={{ color: 'var(--accent-brake)', fontWeight: 300 }}>TRAINER</span>
            </h1>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '2px', marginTop: 2 }}>DO PEDAL AO PÓDIO</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <StatusBadge connected={gpConnected} />
          <button onClick={() => setScreen('config')} style={{ ...btn, padding: '7px 10px', fontSize: 16, lineHeight: 1, borderRadius: '50%', width: 36, height: 36 }}>⚙</button>
        </div>
      </div>

      {/* ── Programs section ── */}
      <div className="animate-in animate-in-delay-1" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🎯</span>
            <h2 style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '.3px' }}>PROGRAMAS DE TREINO</h2>
          </div>
          <button onClick={() => openPrograms()} style={{ ...btn, fontSize: 10, padding: '5px 14px', color: '#2980b9', borderColor: '#2980b930' }}>VER TODOS →</button>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, scrollSnapType: 'x mandatory' }}>
          {PROGRAMS.map((prog) => {
            const pr = getProgramProgress(prog);
            const next = getNextSession(prog);
            const isComplete = !next;
            return (
              <div key={prog.id} onClick={() => openPrograms(prog)}
                style={{
                  minWidth: 200, maxWidth: 220, flex: '0 0 auto', scrollSnapAlign: 'start',
                  background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-card)', padding: '14px 16px', cursor: 'pointer',
                  borderTop: `3px solid ${prog.color}40`,
                  transition: 'box-shadow .2s, border-color .2s',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {prog.level === 'Pista Real' ? (
                      <svg width="20" height="20" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
                        <circle cx="16" cy="16" r="14" fill={prog.color} opacity=".12" stroke={prog.color} strokeWidth="1"/>
                        <path d="M13 13 Q16 10 19 13 Q22 16 19 19 Q16 22 13 19 Q10 16 13 13" fill="none" stroke={prog.color} strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <span style={{ fontSize: 18 }}>{prog.icon}</span>
                    )}
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', color: prog.color }}>{prog.name}</span>
                  </div>
                </div>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3, marginBottom: 8, minHeight: 26 }}>{prog.desc.substring(0, 60)}...</p>
                {/* Progress bar */}
                <div style={{ marginBottom: 6 }}>
                  <div style={{ height: 4, background: 'var(--bg-inset)', borderRadius: 2, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div style={{ width: `${pr.pct}%`, height: '100%', background: prog.color, borderRadius: 2, transition: 'width .4s' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {pr.done}/{pr.total} sessões
                  </span>
                  {isComplete ? (
                    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#27ae60', fontWeight: 600 }}>✓ COMPLETO</span>
                  ) : pr.pct > 0 ? (
                    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: prog.color, fontWeight: 600 }}>{pr.pct}%</span>
                  ) : (
                    <span style={{
                      fontSize: 8, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 8,
                      background: prog.color + '12', color: prog.color, fontWeight: 600, letterSpacing: '.3px',
                    }}>{prog.level.toUpperCase()}</span>
                  )}
                </div>
                {/* Next session hint */}
                {next && (
                  <div style={{
                    marginTop: 8, padding: '6px 10px', background: prog.color + '08', borderRadius: 8,
                    border: `1px solid ${prog.color}15`, fontSize: 10, color: prog.color, fontWeight: 500,
                  }}>
                    Próximo: {next.title}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Session summary ── */}
      {totalAttempts > 0 && (
        <div className="card animate-in animate-in-delay-2" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '1px' }}>SESSÃO:</span>
            <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', color: sessionAvg >= 70 ? 'var(--accent-throttle)' : 'var(--accent-clutch)' }}>{sessionAvg}%</span>
            <div style={{ flex: 1, maxWidth: 160, height: 5, background: 'var(--bg-inset)', borderRadius: 3, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div style={{ width: `${sessionAvg}%`, height: '100%', background: sessionAvg >= 70 ? 'linear-gradient(90deg, #27ae60, #2ecc71)' : 'linear-gradient(90deg, #f39c12, #e67e22)', borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{totalAttempts} treinos</span>
          </div>
          <button onClick={() => setScreen('progress')} style={{ ...btn, borderColor: '#8e44ad30', color: '#8e44ad', background: '#f3e8f9', fontWeight: 600, fontSize: 11 }}>EVOLUÇÃO</button>
        </div>
      )}

      {/* ── Controls row ── */}
      <div className="animate-in animate-in-delay-1" style={{ display: 'flex', gap: 6, marginBottom: '0.5rem', marginTop: totalAttempts > 0 ? 0 : '0.5rem', flexWrap: 'wrap' }}>
        {['keyboard', 'gamepad'].map(m => (
          <button key={m} onClick={() => { if (m === 'gamepad' && !gpConnected) return; setInputMode(m); }}
            disabled={m === 'gamepad' && !gpConnected}
            style={{
              padding: '6px 16px', fontSize: 11, borderRadius: 20, fontWeight: 600, fontFamily: 'var(--font-condensed)', letterSpacing: '.5px',
              border: `1.5px solid ${inputMode === m ? 'var(--accent-steering)' : 'var(--border)'}`,
              background: inputMode === m ? 'var(--accent-steering-light)' : 'var(--bg-card)',
              color: inputMode === m ? 'var(--accent-steering)' : 'var(--text-muted)',
              opacity: m === 'gamepad' && !gpConnected ? .4 : 1,
              cursor: m === 'gamepad' && !gpConnected ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}>
            {m === 'keyboard' ? 'TECLADO ↑↓' : 'PEDAL / G29'}
          </button>
        ))}
      </div>

      {/* ── Interlagos section ── */}
      <div className="animate-in" style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#00973912', border: '1.5px solid #00973925', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <path d="M16 2 L14 6 L10 5 L9 9 L5 10 L6 14 L2 16 L6 18 L5 22 L9 23 L10 27 L14 26 L16 30 L18 26 L22 27 L23 23 L27 22 L26 18 L30 16 L26 14 L27 10 L23 9 L22 5 L18 6 Z" fill="#009739" opacity=".15" stroke="#009739" strokeWidth="1"/>
              <circle cx="16" cy="16" r="6" fill="none" stroke="#009739" strokeWidth="1.5"/>
              <path d="M13 13 Q16 10 19 13 Q22 16 19 19 Q16 22 13 19 Q10 16 13 13" fill="none" stroke="#009739" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#009739', letterSpacing: '.3px' }}>INTERLAGOS — VOLTA COMPLETA</h2>
          </div>
          <button onClick={() => openPrograms(PROGRAMS.find(p => p.id === 'prog_interlagos'))} style={{ ...btn, fontSize: 10, padding: '5px 12px', color: '#009739', borderColor: '#00973930' }}>VER PROGRAMA →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 }}>
          {exercises.filter(ex => ex.track === 'interlagos').map(ex => (
            <ExerciseCard key={ex.id} ex={ex} best={bests[ex.id]}
              attempts={sessionLog.filter(s => s.exId === ex.id).length}
              onOpen={() => openExercise(ex)} />
          ))}
        </div>
      </div>

      {/* ── Free practice header ── */}
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, marginTop: 8 }}>
        <span style={{ fontSize: 14 }}>🏎️</span>
        <h2 style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '.3px', color: 'var(--text-secondary)' }}>TREINO LIVRE</h2>
        <div style={{ flex: 1, height: 1, background: 'var(--border)', marginLeft: 8 }} />
      </div>

      {/* ── Exercise sections by category ── */}
      {EXERCISE_CATEGORIES.map(cat => {
        const catExercises = exercises.filter(ex => {
          if (ex.track) return false; // Hide track-specific exercises from free practice
          const p = ex.pedal || 'brake';
          return p === cat.key;
        });
        if (catExercises.length === 0) return null;
        return (
          <div key={cat.key} className="animate-in">
            <SectionHeader category={cat} exerciseCount={catExercises.length} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 }}>
              {catExercises.map(ex => (
                <ExerciseCard key={ex.id} ex={ex} best={bests[ex.id]}
                  attempts={sessionLog.filter(s => s.exId === ex.id).length}
                  onOpen={() => openExercise(ex)} />
              ))}
            </div>
          </div>
        );
      })}

      {/* ── History ── */}
      {history.length > 0 && (
        <div className="animate-in" style={{ marginTop: '1.5rem' }}>
          <p style={{ fontSize: 10, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: 8, fontWeight: 500 }}>HISTÓRICO RECENTE</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {history.slice(0, 12).map((h, i) => (
              <span key={i} style={{
                fontSize: 10, fontFamily: 'var(--font-mono)', padding: '3px 10px', borderRadius: 10, fontWeight: 500,
                background: h.score >= 80 ? '#e6f5ec' : h.score >= 50 ? '#fef5e1' : '#fde8e6',
                color: h.score >= 80 ? '#1e7a47' : h.score >= 50 ? '#b7791f' : '#c0392b',
                border: `1px solid ${h.score >= 80 ? '#27ae6020' : h.score >= 50 ? '#f39c1220' : '#e74c3c20'}`,
              }}>
                {h.name.split(' ')[0]} {h.score}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{ marginTop: '2rem', padding: '12px 0', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="20" height="20" viewBox="0 0 56 56"><path d="M8 44 Q10 20, 18 14 Q24 10, 30 22 Q34 30, 38 28 Q42 26, 44 14" fill="none" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round"/><circle cx="8" cy="44" r="3" fill="#e74c3c"/><circle cx="30" cy="22" r="2.5" fill="#27ae60"/><circle cx="44" cy="14" r="2" fill="#f39c12"/></svg>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-display)', color: 'var(--text-muted)', fontWeight: 500 }}>DRIVER TRAINER</span>
        </div>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>v1.0 · Do pedal ao pódio</span>
      </div>
    </div>
  );
}
