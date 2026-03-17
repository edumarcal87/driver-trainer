import React, { useState, useEffect, useCallback } from 'react';
import { ALL_EXERCISES, EXERCISE_CATEGORIES, BRAKE_EXERCISES } from './data/exercises';
import { parseCSV, detectBrakeZones, zoneToExercise } from './utils/telemetry';
import { isG29, getDefaultPedalConfig } from './utils/gamepad';
import ExerciseScreen from './components/ExerciseScreen';
import ConfigScreen from './components/ConfigScreen';
import ProgressScreen from './components/ProgressScreen';
import { DifficultyDots, StatusBadge, CategoryBadge } from './components/UI';

const btn = { padding: '6px 14px', fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)' };
const CAT_COLORS = { brake: 'var(--accent-brake)', throttle: 'var(--accent-throttle)', clutch: 'var(--accent-clutch)' };
const CAT_HEX = { brake: '#ff4757', throttle: '#2ed573', clutch: '#ffa502', steering: '#3b82f6', combined: '#a855f7' };

export default function App() {
  // ── Persisted state (localStorage) ──
  const loadStored = (key, fallback) => {
    try { const v = localStorage.getItem(`bt_${key}`); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  };
  const [screen, setScreen] = useState('menu');
  const [exercises, setExercises] = useState(ALL_EXERCISES);
  const [selectedEx, setSelectedEx] = useState(BRAKE_EXERCISES[0]);
  const [bests, setBests] = useState(() => loadStored('bests', {}));
  const [history, setHistory] = useState(() => loadStored('history', []));
  const [activeCategory, setActiveCategory] = useState('all');
  const [gpConnected, setGpConnected] = useState(false);
  const [gpName, setGpName] = useState('');
  const [inputMode, setInputMode] = useState(() => loadStored('inputMode', 'keyboard'));
  const [pedalConfigs, setPedalConfigs] = useState(() => loadStored('pedalConfigs', getDefaultPedalConfig()));
  const [telemZones, setTelemZones] = useState([]);
  const [telemFile, setTelemFile] = useState('');
  const [sessionLog, setSessionLog] = useState(() => loadStored('sessionLog', []));

  // Persist to localStorage on change
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
    // Rich session log entry for progress tracking
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

  const filteredExercises = activeCategory === 'all' ? exercises
    : activeCategory === 'telemetry' ? telemZones
    : exercises.filter(ex => { if (activeCategory === 'brake') return !ex.pedal || ex.pedal === 'brake'; return ex.pedal === activeCategory; });

  if (screen === 'config') return <ConfigScreen onBack={() => setScreen('menu')} gpConnected={gpConnected} gpName={gpName} pedalConfigs={pedalConfigs} setPedalConfigs={setPedalConfigs} />;
  if (screen === 'exercise') return <ExerciseScreen exercise={selectedEx} onBack={() => setScreen('menu')} inputMode={inputMode} pedalConfigs={pedalConfigs} onResult={handleResult} />;
  if (screen === 'progress') return <ProgressScreen sessionHistory={sessionLog} onBack={() => setScreen('menu')} />;

  if (screen === 'telemetry') return (
    <div style={{ maxWidth: 720, width: '100%' }}>
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
        <button onClick={() => setScreen('menu')} style={btn}>← VOLTAR</button>
        <div><h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)' }}>Telemetria importada</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{telemFile} — {telemZones.length} zona(s)</p></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
        {telemZones.map((ex, i) => (
          <button key={ex.id} className={`animate-in animate-in-delay-${Math.min(i, 4)}`} onClick={() => openExercise(ex)}
            style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all .2s', color: 'var(--text-primary)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-purple)'; e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}>
            <p style={{ fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-display)', marginBottom: 3 }}>{ex.name}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ex.desc}</p>
            {bests[ex.id] !== undefined && <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', marginTop: 6, color: bests[ex.id] >= 80 ? 'var(--accent-throttle)' : 'var(--accent-clutch)' }}>melhor: {bests[ex.id]}%</p>}
          </button>
        ))}
      </div>
      <button onClick={() => setScreen('menu')} style={{ ...btn, marginTop: 16 }}>Ver todos os exercícios</button>
    </div>
  );

  // ── Menu ──
  return (
    <div style={{ maxWidth: 720, width: '100%' }}>
      {/* Header */}
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>
            DRIVER <span style={{ color: 'var(--accent-brake)', fontWeight: 300 }}>TRAINER</span>
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-condensed)', letterSpacing: '.5px', marginTop: 2 }}>
            FREIO · ACELERADOR · EMBREAGEM · VOLANTE · COMBINADO
          </p>
        </div>
        <StatusBadge connected={gpConnected} />
      </div>

      {/* Controls */}
      <div className="animate-in animate-in-delay-1" style={{ display: 'flex', gap: 6, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['keyboard', 'gamepad'].map(m => (
          <button key={m} onClick={() => { if (m === 'gamepad' && !gpConnected) return; setInputMode(m); }}
            disabled={m === 'gamepad' && !gpConnected}
            style={{
              padding: '6px 16px', fontSize: 11, borderRadius: 20, fontWeight: 500, fontFamily: 'var(--font-condensed)', letterSpacing: '.5px',
              border: `1px solid ${inputMode === m ? 'var(--accent-blue)' : 'var(--border)'}`,
              background: inputMode === m ? 'var(--accent-blue)18' : 'transparent',
              color: inputMode === m ? 'var(--accent-blue)' : 'var(--text-muted)',
              opacity: m === 'gamepad' && !gpConnected ? .4 : 1,
              cursor: m === 'gamepad' && !gpConnected ? 'not-allowed' : 'pointer',
            }}>
            {m === 'keyboard' ? 'TECLADO ↑↓' : 'PEDAL / G29'}
          </button>
        ))}
        <button onClick={() => setScreen('config')} style={btn}>CONFIGURAR PEDAIS</button>
        <button onClick={() => setScreen('progress')} style={{ ...btn, borderColor: sessionLog.length > 0 ? '#a855f740' : undefined, color: sessionLog.length > 0 ? '#a855f7' : undefined, position: 'relative' }}>
          EVOLUÇÃO
          {sessionLog.length > 0 && <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#a855f7', color: '#fff', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{sessionLog.length}</span>}
        </button>
        <label style={{ ...btn, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          IMPORTAR CSV
          <input type="file" accept=".csv,.txt" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
        </label>
      </div>

      {/* Telemetry banner */}
      {telemZones.length > 0 && (
        <div className="animate-in animate-in-delay-2" style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
          background: 'var(--accent-purple)10', border: '1px solid var(--accent-purple)25',
          borderRadius: 'var(--radius)', marginBottom: '1.25rem',
        }}>
          <span style={{ fontSize: 18 }}>📊</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent-purple)' }}>{telemFile}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{telemZones.length} zonas de frenagem detectadas</p>
          </div>
          <button onClick={() => setScreen('telemetry')} style={{ ...btn, borderColor: 'var(--accent-purple)40', color: 'var(--accent-purple)' }}>VER ZONAS</button>
        </div>
      )}

      {/* Category filter */}
      <div className="animate-in animate-in-delay-2" style={{ display: 'flex', gap: 6, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[{ key: 'all', label: 'TODOS', color: '#7a8194' }, ...EXERCISE_CATEGORIES.map(c => ({ key: c.key, label: c.label.toUpperCase(), color: c.color })),
          ...(telemZones.length > 0 ? [{ key: 'telemetry', label: 'TELEMETRIA', color: '#a855f7' }] : [])
        ].map(cat => (
          <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
            style={{
              padding: '5px 14px', fontSize: 10, borderRadius: 20, fontWeight: 500,
              fontFamily: 'var(--font-condensed)', letterSpacing: '.8px', cursor: 'pointer',
              border: `1px solid ${activeCategory === cat.key ? cat.color + '60' : 'var(--border)'}`,
              background: activeCategory === cat.key ? cat.color + '15' : 'transparent',
              color: activeCategory === cat.key ? cat.color : 'var(--text-muted)',
              transition: 'all .15s',
            }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Exercise grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
        {filteredExercises.map((ex, i) => {
          const pedal = ex.pedal || (ex.fromTelemetry ? 'telemetry' : 'brake');
          const catHex = CAT_HEX[pedal] || '#a855f7';
          const catLabel = { brake: 'FREIO', throttle: 'ACEL', clutch: 'EMBR', steering: 'VOLANTE', combined: 'COMBO', telemetry: 'TELEM' }[pedal] || '';
          const best = bests[ex.id];
          return (
            <button key={ex.id}
              className={`animate-in animate-in-delay-${Math.min(i % 5, 4)}`}
              onClick={() => openExercise(ex)}
              style={{
                padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'left', width: '100%',
                transition: 'all .2s', color: 'var(--text-primary)', position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = catHex + '50'; e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}>
              {/* Top accent line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${catHex}60, transparent)` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 6 }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>{ex.icon}</span>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {!ex.fromTelemetry && ex.diff && <DifficultyDots level={ex.diff} />}
                  <CategoryBadge label={catLabel} color={catHex} />
                </div>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: 3, letterSpacing: '-.2px' }}>{ex.name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{ex.desc}</p>
              {best !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <div style={{ flex: 1, height: 3, background: 'var(--bg-inset)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${best}%`, height: '100%', background: best >= 80 ? 'var(--accent-throttle)' : best >= 50 ? 'var(--accent-clutch)' : 'var(--accent-brake)', borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: best >= 80 ? 'var(--accent-throttle)' : best >= 50 ? 'var(--accent-clutch)' : 'var(--accent-brake)' }}>{best}%</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="animate-in" style={{ marginTop: '1.5rem' }}>
          <p style={{ fontSize: 10, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.8px', marginBottom: 8 }}>HISTÓRICO RECENTE</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {history.slice(0, 12).map((h, i) => (
              <span key={i} style={{
                fontSize: 10, fontFamily: 'var(--font-mono)', padding: '3px 10px', borderRadius: 10,
                background: h.score >= 80 ? '#2ed57315' : h.score >= 50 ? '#ffa50215' : '#ff475715',
                color: h.score >= 80 ? 'var(--accent-throttle)' : h.score >= 50 ? 'var(--accent-clutch)' : 'var(--accent-brake)',
                border: `1px solid ${h.score >= 80 ? '#2ed57325' : h.score >= 50 ? '#ffa50225' : '#ff475725'}`,
              }}>
                {h.name.split(' ')[0]} {h.score}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent-throttle)'; }}
        onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border)'; if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        style={{
          marginTop: '1.5rem', padding: '2rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)',
          textAlign: 'center', transition: 'border-color .2s', background: 'var(--bg-panel)',
        }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-condensed)', letterSpacing: '.3px' }}>ARRASTE UM CSV DE TELEMETRIA AQUI</p>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, opacity: .6 }}>Garage61 · MoTeC · SRT · qualquer CSV com coluna Brake</p>
      </div>
    </div>
  );
}
