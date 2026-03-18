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
const CAT_HEX = { brake: '#e74c3c', throttle: '#27ae60', clutch: '#f39c12', steering: '#2980b9', combined: '#8e44ad', sequential: '#00bcd4', hpattern: '#5c6bc0' };

const GearIcon = ({ size = 20, color = '#5c6bc0' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect x="4" y="6" width="24" height="20" rx="3" stroke={color} strokeWidth="1.5"/>
    <line x1="16" y1="8" x2="16" y2="24" stroke={color} strokeWidth="1" opacity=".3"/>
    <line x1="6" y1="16" x2="26" y2="16" stroke={color} strokeWidth="1" opacity=".3"/>
    <circle cx="10" cy="11" r="2" fill={color} opacity=".7"/><text x="10" y="13" textAnchor="middle" fontSize="4" fill="#fff" fontWeight="700">1</text>
    <circle cx="10" cy="21" r="2" fill={color} opacity=".7"/><text x="10" y="23" textAnchor="middle" fontSize="4" fill="#fff" fontWeight="700">2</text>
    <circle cx="16" cy="11" r="2" fill={color} opacity=".5"/><text x="16" y="13" textAnchor="middle" fontSize="4" fill="#fff" fontWeight="700">3</text>
    <circle cx="16" cy="21" r="2" fill={color} opacity=".5"/><text x="16" y="23" textAnchor="middle" fontSize="4" fill="#fff" fontWeight="700">4</text>
    <circle cx="22" cy="11" r="2" fill={color} opacity=".3"/><text x="22" y="13" textAnchor="middle" fontSize="4" fill="#fff" fontWeight="700">5</text>
    <circle cx="22" cy="21" r="2" fill={color} opacity=".3"/><text x="22" y="23" textAnchor="middle" fontSize="4" fill="#fff" fontWeight="700">6</text>
  </svg>
);

const PaddleIcon = ({ size = 20, color = '#00bcd4' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect x="6" y="4" width="8" height="24" rx="4" stroke={color} strokeWidth="1.5"/>
    <rect x="18" y="4" width="8" height="24" rx="4" stroke={color} strokeWidth="1.5"/>
    <path d="M10 10 L10 7" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M22 22 L22 25" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <text x="10" y="19" textAnchor="middle" fontSize="6" fill={color} fontWeight="700">+</text>
    <text x="22" y="13" textAnchor="middle" fontSize="6" fill={color} fontWeight="700">−</text>
  </svg>
);

const PEDAL_ICONS = {
  brake: (s) => <BrakeIcon size={s} color="#e74c3c" />,
  throttle: (s) => <ThrottleIcon size={s} color="#27ae60" />,
  clutch: (s) => <ClutchIcon size={s} color="#f39c12" />,
  steering: (s) => <SteeringIcon size={s} color="#2980b9" />,
  combined: (s) => <svg width={s} height={s} viewBox="0 0 32 32" fill="none"><circle cx="10" cy="16" r="8" stroke="#8e44ad" strokeWidth="1.5"/><circle cx="22" cy="16" r="8" stroke="#8e44ad" strokeWidth="1.5"/><circle cx="16" cy="16" r="3" fill="#8e44ad" opacity=".4"/></svg>,
  sequential: (s) => <PaddleIcon size={s} color="#00bcd4" />,
  hpattern: (s) => <GearIcon size={s} color="#5c6bc0" />,
};

const SECTION_ICONS = {
  brake: (s) => <BrakeIcon size={s} color="#e74c3c" />,
  throttle: (s) => <ThrottleIcon size={s} color="#27ae60" />,
  clutch: (s) => <ClutchIcon size={s} color="#f39c12" />,
  steering: (s) => <SteeringIcon size={s} color="#2980b9" />,
  combined: PEDAL_ICONS.combined,
  sequential: (s) => <PaddleIcon size={s} color="#00bcd4" />,
  hpattern: (s) => <GearIcon size={s} color="#5c6bc0" />,
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
  const [inputFilter, setInputFilter] = useState('all'); // all | pedals | pedals_steering | pedals_steering_gear
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

  // ── Global Header component ──
  const GlobalHeader = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
      <div onClick={() => setScreen('menu')} style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, border: '2px solid var(--accent-brake)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="26" height="26" viewBox="0 0 56 56"><path d="M8 44 Q10 20, 18 14 Q24 10, 30 22 Q34 30, 38 28 Q42 26, 44 14" fill="none" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round"/><circle cx="8" cy="44" r="3.5" fill="#e74c3c"/><circle cx="30" cy="22" r="3" fill="#27ae60"/><circle cx="44" cy="14" r="2.5" fill="#f39c12"/></svg>
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
            DRIVER <span style={{ color: 'var(--accent-brake)', fontWeight: 300 }}>TRAINER</span>
          </h1>
          <p style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '2px', marginTop: 1 }}>DO PEDAL AO PÓDIO</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <StatusBadge connected={gpConnected} />
        <button onClick={() => setScreen('config')} style={{ ...btn, padding: '7px 10px', fontSize: 16, lineHeight: 1, borderRadius: '50%', width: 36, height: 36 }}>⚙</button>
      </div>
    </div>
  );

  // ── Wizard (no header) ──
  if (screen === 'wizard') return <SetupWizard onComplete={() => setScreen('menu')} gpConnected={gpConnected} gpName={gpName} pedalConfigs={pedalConfigs} setPedalConfigs={setPedalConfigs} />;

  // ── All other screens with global header ──
  const renderScreen = () => {
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
    return null; // menu renders below
  };

  // Non-menu screens: header + screen
  if (screen !== 'menu') {
    return (
      <div style={{ maxWidth: 780, width: '100%' }}>
        <GlobalHeader />
        {renderScreen()}
      </div>
    );
  }

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
      <div className="animate-in">
        <GlobalHeader />
      </div>

      {/* ── Programs section ── */}
      <div className="animate-in animate-in-delay-1" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🎯</span>
            <h2 style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '.3px' }}>PROGRAMAS DE TREINO</h2>
          </div>
          <button onClick={() => openPrograms()} style={{ ...btn, fontSize: 10, padding: '5px 14px', color: '#2980b9', borderColor: '#2980b930' }}>VER TODOS →</button>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, scrollSnapType: 'x mandatory',
            scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent',
            WebkitOverflowScrolling: 'touch',
            maskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
          }}>
            {PROGRAMS.filter(p => p.level !== 'Pista Real').map((prog) => {
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>{prog.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', color: prog.color }}>{prog.name}</span>
                  </div>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3, marginBottom: 8, minHeight: 26 }}>{prog.desc.substring(0, 60)}...</p>
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ height: 4, background: 'var(--bg-inset)', borderRadius: 2, overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <div style={{ width: `${pr.pct}%`, height: '100%', background: prog.color, borderRadius: 2, transition: 'width .4s' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{pr.done}/{pr.total} sessões</span>
                    {isComplete ? (
                      <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#27ae60', fontWeight: 600 }}>✓ COMPLETO</span>
                    ) : pr.pct > 0 ? (
                      <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: prog.color, fontWeight: 600 }}>{pr.pct}%</span>
                    ) : (
                      <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 8, background: prog.color + '12', color: prog.color, fontWeight: 600, letterSpacing: '.3px' }}>{prog.level.toUpperCase()}</span>
                    )}
                  </div>
                  {next && (
                    <div style={{ marginTop: 8, padding: '6px 10px', background: prog.color + '08', borderRadius: 8, border: `1px solid ${prog.color}15`, fontSize: 10, color: prog.color, fontWeight: 500 }}>
                      Próximo: {next.title}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Track scenarios section ── */}
      <div className="animate-in animate-in-delay-2" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="#009739" opacity=".12" stroke="#009739" strokeWidth="1.5"/>
              <path d="M13 13 Q16 10 19 13 Q22 16 19 19 Q16 22 13 19 Q10 16 13 13" fill="none" stroke="#009739" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h2 style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '.3px' }}>VOLTAS COMPLETAS</h2>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, scrollSnapType: 'x mandatory',
            scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent',
            WebkitOverflowScrolling: 'touch',
            maskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
          }}>
            {PROGRAMS.filter(p => p.level === 'Pista Real').map((prog) => {
              const pr = getProgramProgress(prog);
              const next = getNextSession(prog);
              const isComplete = !next;
              return (
                <div key={prog.id} onClick={() => openPrograms(prog)}
                  style={{
                    minWidth: 240, maxWidth: 280, flex: '0 0 auto', scrollSnapAlign: 'start',
                    background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-card)', padding: '16px 18px', cursor: 'pointer',
                    borderTop: `3px solid ${prog.color}40`,
                    transition: 'box-shadow .2s, border-color .2s',
                    position: 'relative', overflow: 'hidden',
                  }}>
                  {/* Track silhouette background */}
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ position: 'absolute', right: -5, top: -5, opacity: 0.05 }}>
                    <path d="M30 20 Q50 10 60 25 Q70 40 55 55 Q40 70 25 60 Q10 50 20 35 Q25 25 30 20" fill={prog.color} stroke={prog.color} strokeWidth="3"/>
                  </svg>
                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
                        <circle cx="16" cy="16" r="14" fill={prog.color} opacity=".12" stroke={prog.color} strokeWidth="1.5"/>
                        <path d="M13 13 Q16 10 19 13 Q22 16 19 19 Q16 22 13 19 Q10 16 13 13" fill="none" stroke={prog.color} strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', color: prog.color, display: 'block' }}>{prog.name}</span>
                        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '.3px' }}>
                          {prog.weeks.reduce((s, w) => s + w.sessions.length, 0)} sessões · {prog.weeks.length} setores
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 10 }}>{prog.desc}</p>
                    <div style={{ marginBottom: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>PROGRESSO</span>
                        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: prog.color, fontWeight: 600 }}>{pr.pct}%</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--bg-inset)', borderRadius: 3, overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <div style={{ width: `${pr.pct}%`, height: '100%', background: prog.color, borderRadius: 3, transition: 'width .4s' }} />
                      </div>
                    </div>
                    {next ? (
                      <div style={{ padding: '6px 10px', background: prog.color + '08', borderRadius: 8, border: `1px solid ${prog.color}15`, fontSize: 10, color: prog.color, fontWeight: 500 }}>
                        Próximo: {next.title}
                      </div>
                    ) : (
                      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#27ae60', fontWeight: 600 }}>✓ VOLTA COMPLETA DOMINADA</span>
                    )}
                  </div>
                </div>
              );
            })}
            {/* Coming soon placeholder */}
            <div style={{
              minWidth: 200, flex: '0 0 auto', scrollSnapAlign: 'start',
              background: 'var(--bg-inset)', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)',
              padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', opacity: 0.6,
            }}>
              <span style={{ fontSize: 24, marginBottom: 8 }}>🏗️</span>
              <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>MAIS PISTAS</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Em breve...</span>
            </div>
          </div>
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

      {/* ── Free practice header ── */}
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, marginTop: 8 }}>
        <span style={{ fontSize: 14 }}>🏎️</span>
        <h2 style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '.3px', color: 'var(--text-secondary)' }}>TREINO LIVRE</h2>
        <div style={{ flex: 1, height: 1, background: 'var(--border)', marginLeft: 8 }} />
      </div>

      {/* ── Input complexity filter ── */}
      <div className="animate-in" style={{ display: 'flex', gap: 5, marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'TODOS', icon: '🎮' },
          { key: 'pedals', label: 'FREIO + ACEL', icon: '🦶' },
          { key: 'pedals_steering', label: '+ VOLANTE', icon: '🎡' },
          { key: 'pedals_steering_gear', label: '+ CÂMBIO', icon: '⚙️' },
        ].map(f => (
          <button key={f.key} onClick={() => setInputFilter(f.key)}
            style={{
              padding: '5px 12px', fontSize: 10, borderRadius: 16, fontWeight: 600,
              fontFamily: 'var(--font-condensed)', letterSpacing: '.5px', cursor: 'pointer',
              border: `1.5px solid ${inputFilter === f.key ? 'var(--accent-steering)' : 'var(--border)'}`,
              background: inputFilter === f.key ? 'var(--accent-steering-light)' : 'var(--bg-card)',
              color: inputFilter === f.key ? 'var(--accent-steering)' : 'var(--text-muted)',
              boxShadow: inputFilter === f.key ? '0 1px 4px rgba(41,128,185,0.1)' : '0 1px 2px rgba(0,0,0,0.03)',
            }}>
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* ── Exercise sections by category ── */}
      {EXERCISE_CATEGORIES.map(cat => {
        // Apply input filter
        const filterAllowed = {
          all: true,
          pedals: ['brake', 'throttle', 'combined'].includes(cat.key),
          pedals_steering: ['brake', 'throttle', 'clutch', 'steering', 'combined'].includes(cat.key),
          pedals_steering_gear: true,
        };
        if (!filterAllowed[inputFilter]) return null;

        const catExercises = exercises.filter(ex => {
          if (ex.track) return false;
          const p = ex.pedal || 'brake';
          if (p !== cat.key) return false;
          // For combined exercises, filter by which inputs they actually use
          if (p === 'combined' && ex.curves && inputFilter !== 'all') {
            const keys = Object.keys(ex.curves);
            const hasSteering = keys.includes('steering');
            const hasGear = keys.includes('gear');
            if (inputFilter === 'pedals' && (hasSteering || hasGear)) return false;
            if (inputFilter === 'pedals_steering' && hasGear) return false;
          }
          return true;
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
