import React, { useState, useCallback } from 'react';
import { ALL_EXERCISES, BRAKE_EXERCISES } from './data/exercises';
import { CAR_PROFILES } from './data/carProfiles';
import { useAuth } from './lib/AuthContext';
import { isSupabaseConfigured } from './lib/supabase';
import { saveSessionResult, syncSessionLogs } from './lib/dataSync';
import { submitToLeaderboard, submitChallengeEntry, getActiveChallenges } from './lib/community';

import useGamepad from './hooks/useGamepad';
import usePersistedState from './hooks/usePersistedState';
import useBadges from './hooks/useBadges';
import useTheme from './hooks/useTheme';
import { getDefaultPedalConfig } from './utils/gamepad';

import GlobalHeader from './components/GlobalHeader';
import MenuScreen from './components/MenuScreen';
import TelemetryImportScreen from './components/TelemetryImportScreen';
import ExerciseScreen from './components/ExerciseScreen';
import ConfigScreen from './components/ConfigScreen';
import ProgressScreen from './components/ProgressScreen';
import ProgramsScreen from './components/ProgramsScreen';
import ProgramSessionScreen from './components/ProgramSessionScreen';
import GamepadDiagnostics from './components/GamepadDiagnostics';
import CommunityScreen from './components/CommunityScreen';
import BadgesScreen from './components/BadgesScreen';
import ProfileScreen from './components/ProfileScreen';
import BadgeToast from './components/BadgeToast';
import PublicProfileScreen from './components/PublicProfileScreen';
import OnboardingTour, { isOnboardingDone } from './components/OnboardingTour';
import PremiumGate from './components/PremiumGate';
import SetupWizard from './components/SetupWizard';

export default function App({ onGoToLanding }) {
  const { user, profile } = useAuth();

  // ── Persisted state ──
  const loadStored = (key, fallback) => {
    try { const v = localStorage.getItem(`bt_${key}`); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  };
  const storedConfigs = loadStored('pedalConfigs', null);
  const needsRecalibration = storedConfigs && storedConfigs.brake?.axisIndex === 2 && storedConfigs.throttle?.axisIndex === 1;
  const wizardDone = !needsRecalibration && (loadStored('wizardDone', false) || !!localStorage.getItem('bt_wizardDone'));
  const initialConfigs = needsRecalibration ? getDefaultPedalConfig() : (storedConfigs || getDefaultPedalConfig());

  const [screen, setScreen] = useState(wizardDone ? 'menu' : 'wizard');
  const [exercises, setExercises] = useState(ALL_EXERCISES);
  const [selectedEx, setSelectedEx] = useState(BRAKE_EXERCISES[0]);
  const [bests, setBests] = usePersistedState('bests', {});
  const [history, setHistory] = usePersistedState('history', []);
  const [sessionLog, setSessionLog] = usePersistedState('sessionLog', []);
  const [inputFilter, setInputFilter] = useState('all');
  const [carProfile, setCarProfile] = useState(CAR_PROFILES[0]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // ── Custom hooks ──
  const gamepad = useGamepad(initialConfigs);
  const { badgeToast, dismissToast, checkBadges } = useBadges(sessionLog);
  const { isDark, toggleTheme } = useTheme();

  // ── Cloud sync ──
  React.useEffect(() => {
    if (!user?.id || !isSupabaseConfigured()) return;
    syncSessionLogs(user.id, sessionLog).then(merged => {
      if (merged && merged.length !== sessionLog.length) setSessionLog(merged);
    });
  }, [user?.id]);

  // ── Onboarding ──
  React.useEffect(() => {
    if (screen === 'menu' && !isOnboardingDone() && !showOnboarding) {
      const timer = setTimeout(() => setShowOnboarding(true), 800);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // ── Program session ──
  const [activeProgram, setActiveProgram] = useState(null);
  const [activeWeekIdx, setActiveWeekIdx] = useState(0);
  const [activeSessionIdx, setActiveSessionIdx] = useState(0);
  const [initialProgramForScreen, setInitialProgramForScreen] = useState(null);

  const startProgramSession = (program, weekIdx, sessionIdx) => {
    setActiveProgram(program); setActiveWeekIdx(weekIdx); setActiveSessionIdx(sessionIdx); setScreen('program_session');
  };
  const openPrograms = (program) => { setInitialProgramForScreen(program || null); setScreen('programs'); };
  const openExercise = (ex) => { setSelectedEx(ex); setScreen('exercise'); };

  // ── Handle result ──
  const handleResult = useCallback((exId, sc, analysis) => {
    setBests(p => ({ ...p, [exId]: Math.max(p[exId] || 0, sc) }));
    const ex = exercises.find(e => e.id === exId);
    setHistory(p => [{ name: ex?.name || exId, score: sc }, ...p.slice(0, 29)]);
    const logEntry = {
      exId, exName: ex?.name || exId, pedal: ex?.pedal || 'brake', diff: ex?.diff,
      score: sc, grade: analysis?.grade, consistency: analysis?.stats?.consistency,
      peakAccuracy: analysis?.stats?.peakAccuracy, peakTimingDelta: analysis?.stats?.peakTimingDelta,
      segments: analysis?.segments, timestamp: Date.now(), carProfileId: carProfile?.id || 'default',
    };
    setSessionLog(prev => [...prev, logEntry]);

    if (user?.id) {
      saveSessionResult(user.id, logEntry).catch(() => {});
      submitToLeaderboard(user.id, exId, sc, carProfile?.id || 'default', profile?.display_name, profile?.avatar_url).catch(() => {});
      getActiveChallenges().then(chs => {
        for (const ch of chs) if (ch.exercise_id === exId) submitChallengeEntry(ch.id, user.id, sc, carProfile?.id || 'default', profile?.display_name, profile?.avatar_url).catch(() => {});
      }).catch(() => {});
    }
    checkBadges([...sessionLog, logEntry]);
  }, [exercises, carProfile, user?.id, profile, sessionLog, checkBadges]);

  // ── Wizard ──
  if (screen === 'wizard') return <SetupWizard onComplete={() => setScreen('menu')} gpConnected={gamepad.gpConnected} gpName={gamepad.gpName} pedalConfigs={gamepad.pedalConfigs} setPedalConfigs={gamepad.setPedalConfigs} />;

  // ── Screen router ──
  const renderScreen = () => {
    const nav = (s) => setScreen(s);
    const back = () => nav('menu');
    switch (screen) {
      case 'config': return <ConfigScreen onBack={back} gpConnected={gamepad.gpConnected} gpName={gamepad.gpName} pedalConfigs={gamepad.pedalConfigs} setPedalConfigs={gamepad.setPedalConfigs} />;
      case 'diagnostics': return <GamepadDiagnostics onBack={back} pedalConfigs={gamepad.pedalConfigs} />;
      case 'exercise': return <ExerciseScreen exercise={selectedEx} onBack={back} inputMode={gamepad.inputMode} pedalConfigs={gamepad.pedalConfigs} onResult={handleResult} carProfile={carProfile} sessionLog={sessionLog} shifterConfig={gamepad.shifterConfig} />;
      case 'progress': return <ProgressScreen sessionHistory={sessionLog} onBack={back} carProfile={carProfile} setCarProfile={setCarProfile} />;
      case 'programs': return <PremiumGate feature="Programas de Treino" onLogin={() => nav('login')}><ProgramsScreen onBack={back} onStartSession={startProgramSession} sessionLog={sessionLog} initialProgram={initialProgramForScreen} carProfile={carProfile} setCarProfile={setCarProfile} onLogin={() => nav('login')} /></PremiumGate>;
      case 'program_session': return activeProgram ? <PremiumGate feature={activeProgram.name} onLogin={() => nav('login')}><ProgramSessionScreen program={activeProgram} weekIdx={activeWeekIdx} sessionIdx={activeSessionIdx} onBack={() => { setInitialProgramForScreen(activeProgram); nav('programs'); }} onResult={handleResult} inputMode={gamepad.inputMode} pedalConfigs={gamepad.pedalConfigs} carProfile={carProfile} sessionLog={sessionLog} shifterConfig={gamepad.shifterConfig} /></PremiumGate> : null;
      case 'community': return <CommunityScreen onBack={back} onStartExercise={openExercise} onLogin={onGoToLanding} />;
      case 'badges': return <BadgesScreen onBack={back} sessionLog={sessionLog} />;
      case 'profile': return <PublicProfileScreen onBack={back} profile={profile} sessionLog={sessionLog} onNavigate={setScreen} />;
      case 'profile': return <ProfileScreen onBack={back} sessionLog={sessionLog} />;
      case 'telemetry': return <PremiumGate feature="Importar Telemetria" onLogin={() => nav('login')}><TelemetryImportScreen onBack={back} onExercisesCreated={(exs) => { setExercises([...ALL_EXERCISES, ...exs]); back(); }} /></PremiumGate>;
      default: return null;
    }
  };

  // ── Non-menu screens ──
  if (screen !== 'menu') {
    return (
      <div style={{ maxWidth: 1140, width: '100%' }}>
        <GlobalHeader onNavigate={setScreen} gpConnected={gamepad.gpConnected} wheelProfile={gamepad.wheelProfile} onGoToLanding={onGoToLanding} isDark={isDark} onToggleTheme={toggleTheme} />
        {renderScreen()}
      </div>
    );
  }

  // ── Menu ──
  return (
    <>
      {showOnboarding && <OnboardingTour show={showOnboarding} onComplete={() => setShowOnboarding(false)} />}
      {badgeToast && <BadgeToast badge={badgeToast} onDismiss={dismissToast} onNavigate={() => setScreen('badges')} />}
      <div style={{ maxWidth: 1140, width: '100%' }}>
        <div style={{ position: 'relative', zIndex: 900 }}>
          <GlobalHeader onNavigate={setScreen} gpConnected={gamepad.gpConnected} wheelProfile={gamepad.wheelProfile} onGoToLanding={onGoToLanding} isDark={isDark} onToggleTheme={toggleTheme} />
        </div>
        <MenuScreen
          sessionLog={sessionLog} bests={bests} history={history} exercises={exercises}
          carProfile={carProfile} setCarProfile={setCarProfile}
          inputFilter={inputFilter} setInputFilter={setInputFilter}
          userId={user?.id} onNavigate={setScreen}
          openExercise={openExercise} openPrograms={openPrograms}
        />
        <div style={{ marginTop: '1.5rem', padding: '12px 0', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 56 56"><path d="M8 44 Q10 20, 18 14 Q24 10, 30 22 Q34 30, 38 28 Q42 26, 44 14" fill="none" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round"/><circle cx="8" cy="44" r="3" fill="#e74c3c"/><circle cx="30" cy="22" r="2.5" fill="#27ae60"/><circle cx="44" cy="14" r="2" fill="#f39c12"/></svg>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-display)', color: 'var(--text-muted)', fontWeight: 500 }}>DRIVER TRAINER</span>
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>v2.0 · Do pedal ao pódio</span>
        </div>
      </div>
    </>
  );
}
