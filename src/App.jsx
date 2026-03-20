import React, { useState, useEffect, useCallback } from 'react';
import { ALL_EXERCISES, EXERCISE_CATEGORIES, BRAKE_EXERCISES } from './data/exercises';
import { PROGRAMS } from './data/programs';
import { CAR_PROFILES } from './data/carProfiles';
import { parseCSV, detectBrakeZones, zoneToExercise } from './utils/telemetry';
import { getDefaultPedalConfig } from './utils/gamepad';
import { detectWheelProfile, getWheelDefaultConfig, getWheelShifterConfig, saveWheelCalibration, loadWheelCalibration } from './utils/wheelProfiles';
import { useAuth } from './lib/AuthContext';
import { isSupabaseConfigured } from './lib/supabase';
import { saveSessionResult, syncSessionLogs, savePreferences } from './lib/dataSync';
import ExerciseScreen from './components/ExerciseScreen';
import ConfigScreen from './components/ConfigScreen';
import ProgressScreen from './components/ProgressScreen';
import ProgramsScreen from './components/ProgramsScreen';
import ProgramSessionScreen from './components/ProgramSessionScreen';
import GamepadDiagnostics from './components/GamepadDiagnostics';
import CommunityScreen from './components/CommunityScreen';
import UserMenu from './components/UserMenu';
import PremiumGate from './components/PremiumGate';
import SetupWizard from './components/SetupWizard';
import { BrakeIcon, ThrottleIcon, ClutchIcon, SteeringIcon } from './components/SetupWizard';
import { DifficultyDots, StatusBadge, CategoryBadge, LevelBadge, ScoreRing } from './components/UI';
import { submitToLeaderboard, submitChallengeEntry, getActiveChallenges, getLeaderboard, getUserRank } from './lib/community';

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

export default function App({ onGoToLanding }) {
  const { user, profile, isLoggedIn, isPremiumUser, loading: authLoading } = useAuth();

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
  const [wheelProfile, setWheelProfile] = useState(null);
  const [shifterConfig, setShifterConfig] = useState({ upshift: 4, downshift: 5, hShifterBase: 12, hShifterReverse: 18 });
  const [inputMode, setInputMode] = useState(() => loadStored('inputMode', 'keyboard'));
  const [inputFilter, setInputFilter] = useState('all');
  const [carProfile, setCarProfile] = useState(CAR_PROFILES[0]);
  const [telemZones, setTelemZones] = useState([]);
  const [telemFile, setTelemFile] = useState('');
  const [sessionLog, setSessionLog] = useState(() => loadStored('sessionLog', []));

  useEffect(() => { try { localStorage.setItem('bt_pedalConfigs', JSON.stringify(pedalConfigs)); } catch {} }, [pedalConfigs]);
  useEffect(() => { try { localStorage.setItem('bt_bests', JSON.stringify(bests)); } catch {} }, [bests]);
  useEffect(() => { try { localStorage.setItem('bt_history', JSON.stringify(history)); } catch {} }, [history]);
  useEffect(() => { try { localStorage.setItem('bt_inputMode', JSON.stringify(inputMode)); } catch {} }, [inputMode]);
  useEffect(() => { try { localStorage.setItem('bt_sessionLog', JSON.stringify(sessionLog)); } catch {} }, [sessionLog]);

  // Cloud sync on login
  useEffect(() => {
    if (!user?.id || !isSupabaseConfigured()) return;
    syncSessionLogs(user.id, sessionLog).then(merged => {
      if (merged && merged.length !== sessionLog.length) {
        setSessionLog(merged);
      }
    });
  }, [user?.id]);

  // Ranking sidebar state (must be before any early returns)
  const [sidebarBoard, setSidebarBoard] = useState([]);
  const [sidebarExId, setSidebarExId] = useState('b_trail');
  const [sidebarRank, setSidebarRank] = useState(null);
  const [sidebarChallenge, setSidebarChallenge] = useState(null);

  useEffect(() => {
    getLeaderboard(sidebarExId, 'all', 5).then(setSidebarBoard);
    if (user?.id) getUserRank(user.id, sidebarExId, 'default').then(setSidebarRank);
  }, [sidebarExId, user?.id, sessionLog.length]);

  useEffect(() => {
    getActiveChallenges().then(chs => setSidebarChallenge(chs?.[0] || null));
  }, []);

  // Save wheel calibration when pedalConfigs change and a wheel is connected
  useEffect(() => {
    if (gpName && gpConnected) saveWheelCalibration(gpName, pedalConfigs);
  }, [pedalConfigs, gpName, gpConnected]);

  useEffect(() => {
    const handleConnect = (e) => {
      const id = e.gamepad.id;
      setGpConnected(true);
      setGpName(id);
      setInputMode('gamepad');

      // Auto-detect wheel profile
      const profile = detectWheelProfile(id);
      setWheelProfile(profile);

      // Load saved calibration or use wheel defaults
      const savedCalib = loadWheelCalibration(id);
      if (savedCalib) {
        setPedalConfigs(savedCalib);
      } else if (profile) {
        setPedalConfigs(profile.defaultConfig);
      }

      // Set shifter config
      if (profile) {
        setShifterConfig(profile.shifter);
      } else {
        setShifterConfig(getWheelShifterConfig(id));
      }
    };
    const handleDisconnect = () => { setGpConnected(false); setGpName(''); setWheelProfile(null); };

    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);

    // Check already connected
    const gps = navigator.getGamepads();
    for (const gp of gps) {
      if (gp) {
        handleConnect({ gamepad: gp });
        break;
      }
    }
    return () => {
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
    };
  }, []);

  const handleResult = useCallback((exId, sc, analysis) => {
    setBests(p => ({ ...p, [exId]: Math.max(p[exId] || 0, sc) }));
    const ex = exercises.find(e => e.id === exId);
    setHistory(p => [{ name: ex?.name || exId, score: sc }, ...p.slice(0, 29)]);
    const logEntry = {
      exId, exName: ex?.name || exId, pedal: ex?.pedal || 'brake', diff: ex?.diff,
      score: sc, grade: analysis?.grade, consistency: analysis?.stats?.consistency,
      peakAccuracy: analysis?.stats?.peakAccuracy, peakTimingDelta: analysis?.stats?.peakTimingDelta,
      segments: analysis?.segments, timestamp: Date.now(),
      carProfileId: carProfile?.id || 'default',
    };
    setSessionLog(prev => [...prev, logEntry]);

    // Save to cloud if logged in
    if (user?.id) {
      saveSessionResult(user.id, logEntry).catch(() => {});
      // Submit to leaderboard
      submitToLeaderboard(user.id, exId, sc, carProfile?.id || 'default', profile?.display_name, profile?.avatar_url).catch(() => {});
      // Submit to active challenges if matching
      getActiveChallenges().then(challenges => {
        for (const ch of challenges) {
          if (ch.exercise_id === exId) {
            submitChallengeEntry(ch.id, user.id, sc, carProfile?.id || 'default', profile?.display_name, profile?.avatar_url).catch(() => {});
          }
        }
      }).catch(() => {});
    }
  }, [exercises, carProfile, user?.id, profile]);

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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', position: 'relative', zIndex: 900 }}>
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
        <StatusBadge connected={gpConnected} wheelName={wheelProfile?.model?.split(' / ')[0] || (gpConnected ? 'CONECTADO' : '')} />
        <button onClick={() => setScreen('diagnostics')} title="Diagnóstico de Gamepad" style={{ ...btn, padding: '7px 10px', fontSize: 14, lineHeight: 1, borderRadius: '50%', width: 36, height: 36 }}>🔧</button>
        <button onClick={() => setScreen('config')} style={{ ...btn, padding: '7px 10px', fontSize: 16, lineHeight: 1, borderRadius: '50%', width: 36, height: 36 }}>⚙</button>
        <UserMenu onLogin={() => setScreen('login')} onLogout={onGoToLanding} />
      </div>
    </div>
  );

  // ── Wizard (no header) ──
  if (screen === 'wizard') return <SetupWizard onComplete={() => setScreen('menu')} gpConnected={gpConnected} gpName={gpName} pedalConfigs={pedalConfigs} setPedalConfigs={setPedalConfigs} />;

  // ── All other screens with global header ──
  const renderScreen = () => {
    if (screen === 'config') return <ConfigScreen onBack={() => setScreen('menu')} gpConnected={gpConnected} gpName={gpName} pedalConfigs={pedalConfigs} setPedalConfigs={setPedalConfigs} />;
    if (screen === 'diagnostics') return <GamepadDiagnostics onBack={() => setScreen('menu')} pedalConfigs={pedalConfigs} />;
    if (screen === 'exercise') return <ExerciseScreen exercise={selectedEx} onBack={() => setScreen('menu')} inputMode={inputMode} pedalConfigs={pedalConfigs} onResult={handleResult} carProfile={carProfile} sessionLog={sessionLog} shifterConfig={shifterConfig} />;
    if (screen === 'progress') return <ProgressScreen sessionHistory={sessionLog} onBack={() => setScreen('menu')} carProfile={carProfile} setCarProfile={setCarProfile} />;
    if (screen === 'programs') return (
      <PremiumGate feature="Programas de Treino" onLogin={() => setScreen('login')}>
        <ProgramsScreen onBack={() => setScreen('menu')} onStartSession={startProgramSession} sessionLog={sessionLog} initialProgram={initialProgramForScreen} carProfile={carProfile} setCarProfile={setCarProfile} onLogin={() => setScreen('login')} />
      </PremiumGate>
    );
    if (screen === 'program_session' && activeProgram) return (
      <PremiumGate feature={activeProgram.name} onLogin={() => setScreen('login')}>
        <ProgramSessionScreen
          program={activeProgram} weekIdx={activeWeekIdx} sessionIdx={activeSessionIdx}
          onBack={() => { setInitialProgramForScreen(activeProgram); setScreen('programs'); }} onResult={handleResult}
          inputMode={inputMode} pedalConfigs={pedalConfigs} carProfile={carProfile} sessionLog={sessionLog} shifterConfig={shifterConfig}
        />
      </PremiumGate>
    );
    if (screen === 'community') return <CommunityScreen onBack={() => setScreen('menu')} onStartExercise={(ex) => { setSelectedEx(ex); setScreen('exercise'); }} onLogin={onGoToLanding} />;
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

  const getProgramProgress = (prog) => {
    let total = 0, done = 0;
    for (const w of prog.weeks) for (const s of w.sessions) {
      total++;
      if (s.exercises.every(exId => sessionLog.filter(e => e.exId === exId).reduce((mx, e) => Math.max(mx, e.score), 0) >= s.minScore)) done++;
    }
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  };

  const getNextSession = (prog) => {
    for (const w of prog.weeks) for (const s of w.sessions) {
      if (!s.exercises.every(exId => sessionLog.filter(e => e.exId === exId).reduce((mx, e) => Math.max(mx, e.score), 0) >= s.minScore)) return s;
    }
    return null;
  };

  // Ranking sidebar helpers
  const sidebarExInfo = ALL_EXERCISES.find(e => e.id === sidebarExId);
  const SIDEBAR_EXERCISES = ['b_trail', 'x_heel_toe', 'b_threshold', 'x_full_corner', 'ilg_t12_juncao'];

  const TRACK_META = {
    prog_interlagos: { flag: '🇧🇷', highlights: 'Senna S, Junção...' },
    prog_spa: { flag: '🇧🇪', highlights: 'Eau Rouge, Bus Stop...' },
    prog_monza: { flag: '🇮🇹', highlights: 'Parabolica, Lesmos...' },
    prog_silverstone: { flag: '🇬🇧', highlights: 'Maggotts, Copse...' },
  };

  return (
    <div style={{ maxWidth: 900, width: '100%' }}>
      <div style={{ position: 'relative', zIndex: 900 }}>
        <GlobalHeader />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 0 }}>
        {/* ═══ LEFT: Main content ═══ */}
        <div style={{ paddingRight: 16 }}>

          {totalAttempts > 0 && (
            <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: 12, boxShadow: 'var(--shadow-card)' }}>
              <span style={{ fontSize: 10, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px' }}>SESSÃO:</span>
              <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', color: sessionAvg >= 70 ? 'var(--accent-throttle)' : 'var(--accent-clutch)' }}>{sessionAvg}%</span>
              <div style={{ flex: 1, maxWidth: 140, height: 4, background: 'var(--bg-inset)', borderRadius: 2, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ width: `${sessionAvg}%`, height: '100%', background: sessionAvg >= 70 ? '#27ae60' : '#f39c12', borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{totalAttempts}x</span>
              <button onClick={() => setScreen('progress')} style={{ ...btn, borderColor: '#8e44ad30', color: '#8e44ad', fontWeight: 600, fontSize: 10, padding: '4px 10px', marginLeft: 'auto' }}>EVOLUÇÃO</button>
            </div>
          )}

          {/* Treino livre grid */}
          <div className="animate-in animate-in-delay-1">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 13 }}>🏎️</span>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', letterSpacing: '.3px' }}>TREINO LIVRE</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
              {EXERCISE_CATEGORIES.map(cat => {
                const count = exercises.filter(ex => !ex.track && (ex.pedal || 'brake') === cat.key).length;
                if (count === 0) return null;
                return (
                  <div key={cat.key} style={{ padding: '10px 12px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', borderTop: `2.5px solid ${cat.color}`, cursor: 'pointer', boxShadow: 'var(--shadow-card)' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{cat.label}</span>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{count} exercícios</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Programas de treino */}
          <div className="animate-in animate-in-delay-2">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13 }}>🎯</span>
                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', letterSpacing: '.3px' }}>PROGRAMAS DE TREINO</span>
              </div>
              <button onClick={() => openPrograms()} style={{ ...btn, fontSize: 9, padding: '4px 10px', color: '#2980b9', borderColor: '#2980b930' }}>VER TODOS →</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {PROGRAMS.filter(p => p.level !== 'Pista Real').slice(0, 4).map(prog => {
                const pr = getProgramProgress(prog);
                const next = getNextSession(prog);
                return (
                  <div key={prog.id} onClick={() => openPrograms(prog)} style={{ padding: '12px 14px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', boxShadow: 'var(--shadow-card)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: prog.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', color: prog.color }}>{prog.name}</span>
                    </div>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3, marginBottom: 6, minHeight: 26 }}>{prog.desc.substring(0, 55)}...</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{pr.done}/{pr.total} sessões</span>
                      <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: 6, background: prog.color + '12', color: prog.color, fontWeight: 600 }}>{prog.level.toUpperCase()}</span>
                    </div>
                    {next && (
                      <div style={{ padding: '4px 8px', background: prog.color + '08', borderRadius: 6, border: `1px solid ${prog.color}12`, fontSize: 10, color: prog.color }}>Próximo: {next.title}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cenários Reais */}
          <div className="animate-in animate-in-delay-3">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13 }}>🏁</span>
                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', letterSpacing: '.3px' }}>CENÁRIOS REAIS</span>
              </div>
              <button onClick={() => openPrograms()} style={{ ...btn, fontSize: 9, padding: '4px 10px', color: '#2980b9', borderColor: '#2980b930' }}>VER TODOS →</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {PROGRAMS.filter(p => p.level === 'Pista Real').map(prog => {
                const meta = TRACK_META[prog.id] || {};
                const corners = prog.weeks.reduce((s, w) => s + w.sessions.length, 0);
                return (
                  <div key={prog.id} onClick={() => openPrograms(prog)} style={{ padding: '12px 14px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', boxShadow: 'var(--shadow-card)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 18 }}>{meta.flag || prog.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: prog.color }}>{prog.name}</span>
                    </div>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{corners} cenários · {meta.highlights || prog.desc.substring(0, 30)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Input filter + car profile + exercise cards */}
          <div className="animate-in animate-in-delay-4" style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'TODOS', icon: '🎮' },
              { key: 'pedals', label: 'FREIO+ACEL', icon: '🦶' },
              { key: 'pedals_steering', label: '+VOLANTE', icon: '🎡' },
              { key: 'pedals_steering_gear', label: '+CÂMBIO', icon: '⚙️' },
            ].map(f => (
              <button key={f.key} onClick={() => setInputFilter(f.key)} style={{
                padding: '4px 10px', fontSize: 10, borderRadius: 14, fontWeight: 600, fontFamily: 'var(--font-condensed)', cursor: 'pointer',
                border: `1.5px solid ${inputFilter === f.key ? 'var(--accent-steering)' : 'var(--border)'}`,
                background: inputFilter === f.key ? 'var(--accent-steering-light)' : 'var(--bg-card)',
                color: inputFilter === f.key ? 'var(--accent-steering)' : 'var(--text-muted)',
              }}>{f.icon} {f.label}</button>
            ))}
          </div>
          <div className="animate-in animate-in-delay-4" style={{ display: 'flex', gap: 5, marginBottom: '1rem', flexWrap: 'wrap' }}>
            {CAR_PROFILES.map(p => {
              const active = carProfile.id === p.id;
              return (
                <button key={p.id} onClick={() => setCarProfile(p)} style={{
                  padding: '5px 12px', fontSize: 10, borderRadius: 12, fontWeight: active ? 700 : 500, fontFamily: 'var(--font-condensed)', cursor: 'pointer',
                  border: `1.5px solid ${active ? p.color : 'var(--border)'}`, background: active ? p.color + '15' : 'var(--bg-card)', color: active ? p.color : 'var(--text-muted)',
                }}>{p.icon} {p.name}</button>
              );
            })}
          </div>

          {EXERCISE_CATEGORIES.map(cat => {
            const filterAllowed = { all: true, pedals: ['brake','throttle','combined'].includes(cat.key), pedals_steering: ['brake','throttle','clutch','steering','combined'].includes(cat.key), pedals_steering_gear: true };
            if (!filterAllowed[inputFilter]) return null;
            const catExercises = exercises.filter(ex => {
              if (ex.track) return false;
              const p = ex.pedal || 'brake';
              if (p !== cat.key) return false;
              if (p === 'combined' && ex.curves && inputFilter !== 'all') {
                const keys = Object.keys(ex.curves);
                if (inputFilter === 'pedals' && (keys.includes('steering') || keys.includes('gear'))) return false;
                if (inputFilter === 'pedals_steering' && keys.includes('gear')) return false;
              }
              return true;
            });
            if (catExercises.length === 0) return null;
            return (
              <div key={cat.key} className="animate-in">
                <SectionHeader category={cat} exerciseCount={catExercises.length} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
                  {catExercises.map(ex => (
                    <ExerciseCard key={ex.id} ex={ex} best={bests[ex.id]} attempts={sessionLog.filter(s => s.exId === ex.id).length} onOpen={() => openExercise(ex)} />
                  ))}
                </div>
              </div>
            );
          })}

          {history.length > 0 && (
            <div className="animate-in" style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: 10, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: 6 }}>HISTÓRICO RECENTE</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {history.slice(0, 10).map((h, i) => (
                  <span key={i} style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '3px 8px', borderRadius: 8, background: h.score >= 80 ? '#e6f5ec' : h.score >= 50 ? '#fef5e1' : '#fde8e6', color: h.score >= 80 ? '#1e7a47' : h.score >= 50 ? '#b7791f' : '#c0392b', border: `1px solid ${h.score >= 80 ? '#27ae6020' : h.score >= 50 ? '#f39c1220' : '#e74c3c20'}` }}>
                    {h.name.split(' ')[0]} {h.score}%
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══ RIGHT: Ranking sidebar ═══ */}
        <div style={{ borderLeft: '1.5px solid var(--border)', background: 'var(--bg-inset)', borderRadius: '0 var(--radius-lg) var(--radius-lg) 0', padding: '12px 14px' }}>
          <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 14 }}>🏆</span>
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#b7950b', letterSpacing: '.3px' }}>RANKING</span>
          </div>

          {sidebarRank && (
            <div className="animate-in" style={{ padding: '10px', background: 'var(--bg-card)', border: '1.5px solid #f1c40f25', borderRadius: 10, marginBottom: 10 }}>
              <p style={{ fontSize: 9, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.3px', marginBottom: 6 }}>SUA POSIÇÃO</p>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#b7950b' }}>
                  {sidebarRank.rank <= 3 ? ['🥇','🥈','🥉'][sidebarRank.rank-1] : `${sidebarRank.rank}º`}
                </span>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{sidebarExInfo?.name || ''}</p>
                <p style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#27ae60', marginTop: 2 }}>{sidebarRank.score}%</p>
              </div>
            </div>
          )}

          <div className="animate-in animate-in-delay-1" style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 8 }}>
            {SIDEBAR_EXERCISES.map(id => {
              const ex = ALL_EXERCISES.find(e => e.id === id);
              if (!ex) return null;
              return (
                <button key={id} onClick={() => setSidebarExId(id)} style={{
                  padding: '3px 7px', fontSize: 8, borderRadius: 6, fontFamily: 'var(--font-condensed)', cursor: 'pointer',
                  border: `1px solid ${sidebarExId === id ? '#2980b9' : 'var(--border)'}`,
                  background: sidebarExId === id ? '#2980b910' : 'transparent',
                  color: sidebarExId === id ? '#2980b9' : 'var(--text-muted)',
                  fontWeight: sidebarExId === id ? 700 : 400,
                }}>{ex.name.length > 12 ? ex.name.substring(0, 12) + '…' : ex.name}</button>
              );
            })}
          </div>

          <div className="animate-in animate-in-delay-1" style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 9, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', marginBottom: 4 }}>TOP 5 — {(sidebarExInfo?.name || '').toUpperCase()}</p>
            {sidebarBoard.length === 0 ? (
              <p style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>Nenhum score ainda</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sidebarBoard.map((entry, i) => {
                  const isMe = entry.user_id === user?.id;
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

          {sidebarChallenge && (
            <div className="animate-in animate-in-delay-2" style={{ padding: '10px', background: '#e74c3c05', border: '1.5px solid #e74c3c18', borderRadius: 10, marginBottom: 10 }}>
              <p style={{ fontSize: 9, fontFamily: 'var(--font-condensed)', color: '#e74c3c', fontWeight: 600 }}>⚡ DESAFIO DA SEMANA</p>
              <p style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: 4 }}>{sidebarChallenge.exercise_name}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{(sidebarChallenge.description || '').substring(0, 50)}...</p>
              <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
                <span style={{ fontSize: 8, padding: '2px 5px', borderRadius: 4, background: '#27ae6010', color: '#27ae60' }}>🟢</span>
                <span style={{ fontSize: 8, padding: '2px 5px', borderRadius: 4, background: '#f39c1210', color: '#f39c12' }}>🟡</span>
                <span style={{ fontSize: 8, padding: '2px 5px', borderRadius: 4, background: '#e74c3c10', color: '#e74c3c' }}>🔴</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{Math.max(0, Math.floor((new Date(sidebarChallenge.ends_at) - new Date()) / 864e5))}d restantes</span>
                <button onClick={() => setScreen('community')} style={{ fontSize: 9, padding: '4px 10px', borderRadius: 6, background: '#e74c3c', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-display)' }}>PARTICIPAR</button>
              </div>
            </div>
          )}

          <button onClick={() => setScreen('community')} style={{ width: '100%', fontSize: 10, padding: '8px', borderRadius: 8, border: '1.5px solid #f1c40f30', background: '#f1c40f08', color: '#b7950b', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-display)', textAlign: 'center' }}>VER RANKING COMPLETO →</button>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', padding: '12px 0', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="20" height="20" viewBox="0 0 56 56"><path d="M8 44 Q10 20, 18 14 Q24 10, 30 22 Q34 30, 38 28 Q42 26, 44 14" fill="none" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round"/><circle cx="8" cy="44" r="3" fill="#e74c3c"/><circle cx="30" cy="22" r="2.5" fill="#27ae60"/><circle cx="44" cy="14" r="2" fill="#f39c12"/></svg>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-display)', color: 'var(--text-muted)', fontWeight: 500 }}>DRIVER TRAINER</span>
        </div>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>v2.0 · Do pedal ao pódio</span>
      </div>
    </div>
  );
}
