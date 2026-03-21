import React from 'react';
import { ALL_EXERCISES, EXERCISE_CATEGORIES } from '../data/exercises';
import { PROGRAMS } from '../data/programs';
import { CAR_PROFILES } from '../data/carProfiles';
import { BrakeIcon, ThrottleIcon, ClutchIcon, SteeringIcon } from './SetupWizard';
import { DifficultyDots, LevelBadge, ScoreRing } from './UI';
import RankingSidebar from './RankingSidebar';

const btn = { padding: '7px 16px', fontSize: 12, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' };
const CAT_HEX = { brake: '#e74c3c', throttle: '#27ae60', clutch: '#f39c12', steering: '#2980b9', combined: '#8e44ad', sequential: '#00bcd4', hpattern: '#5c6bc0' };

// ── Icon components ──
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

const SECTION_ICONS = { ...PEDAL_ICONS };

const TRACK_META = {
  prog_interlagos: { flag: '🇧🇷', highlights: 'Senna S, Junção...' },
  prog_spa: { flag: '🇧🇪', highlights: 'Eau Rouge, Bus Stop...' },
  prog_monza: { flag: '🇮🇹', highlights: 'Parabolica, Lesmos...' },
  prog_silverstone: { flag: '🇬🇧', highlights: 'Maggotts, Copse...' },
};

// ── Sub-components ──
function ExerciseCard({ ex, best, attempts, onOpen }) {
  const pedal = ex.pedal || 'brake';
  const catHex = CAT_HEX[pedal] || '#8e44ad';
  return (
    <div className="card card-interactive" onClick={onOpen} style={{ position: 'relative', overflow: 'hidden', borderLeft: `3px solid ${catHex}30` }}>
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

// ── Helpers ──
function getProgramProgress(prog, sessionLog) {
  let total = 0, done = 0;
  for (const w of prog.weeks) for (const s of w.sessions) {
    total++;
    if (s.exercises.every(exId => sessionLog.filter(e => e.exId === exId).reduce((mx, e) => Math.max(mx, e.score), 0) >= s.minScore)) done++;
  }
  return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}

function getNextSession(prog, sessionLog) {
  for (const w of prog.weeks) for (const s of w.sessions) {
    if (!s.exercises.every(exId => sessionLog.filter(e => e.exId === exId).reduce((mx, e) => Math.max(mx, e.score), 0) >= s.minScore)) return s;
  }
  return null;
}

// ═══════════════════════════════════════
// MAIN MENU SCREEN
// ═══════════════════════════════════════
export default function MenuScreen({ sessionLog, bests, history, exercises, carProfile, setCarProfile, inputFilter, setInputFilter, userId, onNavigate, openExercise, openPrograms }) {
  const totalAttempts = sessionLog.length;
  const sessionAvg = totalAttempts > 0 ? Math.round(sessionLog.reduce((s, e) => s + e.score, 0) / totalAttempts) : 0;

  return (
    <div className="layout-main">
      {/* ═══ LEFT: Main content ═══ */}
      <div className="layout-left">

        {totalAttempts > 0 && (
          <div className="animate-in session-bar" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: 12, boxShadow: 'var(--shadow-card)' }}>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px' }}>SESSÃO:</span>
            <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', color: sessionAvg >= 70 ? 'var(--accent-throttle)' : 'var(--accent-clutch)' }}>{sessionAvg}%</span>
            <div style={{ flex: 1, maxWidth: 140, height: 4, background: 'var(--bg-inset)', borderRadius: 2, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div style={{ width: `${sessionAvg}%`, height: '100%', background: sessionAvg >= 70 ? '#27ae60' : '#f39c12', borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{totalAttempts}x</span>
            <button onClick={() => onNavigate('progress')} style={{ ...btn, borderColor: '#8e44ad30', color: '#8e44ad', fontWeight: 600, fontSize: 10, padding: '4px 10px', marginLeft: 'auto' }}>EVOLUÇÃO</button>
            <button onClick={() => onNavigate('badges')} style={{ ...btn, borderColor: '#f1c40f40', color: '#b7950b', fontWeight: 600, fontSize: 10, padding: '4px 10px' }}>🏅 CONQUISTAS</button>
          </div>
        )}

        {/* Treino livre chips */}
        <div className="animate-in animate-in-delay-1" data-tour="treino-livre">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 13 }}>🏎️</span>
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', letterSpacing: '.3px' }}>TREINO LIVRE</span>
            <span style={{ fontSize: 8, padding: '2px 8px', borderRadius: 6, background: '#27ae6012', color: '#27ae60', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '.3px' }}>GRATUITO</span>
          </div>
          <div className="grid-3col" style={{ gap: 5, marginBottom: 14 }}>
            {EXERCISE_CATEGORIES.map(cat => {
              const count = exercises.filter(ex => !ex.track && (ex.pedal || 'brake') === cat.key).length;
              if (count === 0) return null;
              return (
                <div key={cat.key} onClick={() => { const el = document.getElementById(`cat-${cat.key}`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                  style={{ padding: '6px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, borderLeft: `3px solid ${cat.color}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color .15s' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{cat.label}</span>
                  <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Programas de treino */}
        <div className="animate-in animate-in-delay-2" data-tour="programas">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13 }}>🎯</span>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', letterSpacing: '.3px' }}>PROGRAMAS DE TREINO</span>
              <span style={{ fontSize: 8, padding: '2px 8px', borderRadius: 6, background: '#f1c40f12', color: '#b7950b', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '.3px' }}>PREMIUM</span>
            </div>
            <button onClick={() => openPrograms()} style={{ ...btn, fontSize: 9, padding: '4px 10px', color: '#2980b9', borderColor: '#2980b930' }}>VER TODOS →</button>
          </div>
          <div className="grid-2col" style={{ gap: 8, marginBottom: 14 }}>
            {PROGRAMS.filter(p => p.level !== 'Pista Real').slice(0, 4).map(prog => {
              const pr = getProgramProgress(prog, sessionLog);
              const next = getNextSession(prog, sessionLog);
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
                  {next && <div style={{ padding: '4px 8px', background: prog.color + '08', borderRadius: 6, border: `1px solid ${prog.color}12`, fontSize: 10, color: prog.color }}>Próximo: {next.title}</div>}
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
              <span style={{ fontSize: 8, padding: '2px 8px', borderRadius: 6, background: '#f1c40f12', color: '#b7950b', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '.3px' }}>PREMIUM</span>
            </div>
            <button onClick={() => openPrograms()} style={{ ...btn, fontSize: 9, padding: '4px 10px', color: '#2980b9', borderColor: '#2980b930' }}>VER TODOS →</button>
          </div>
          <div className="grid-2col" style={{ gap: 8, marginBottom: 14 }}>
            {PROGRAMS.filter(p => p.level === 'Pista Real').map(prog => {
              const meta = TRACK_META[prog.id] || {};
              const corners = prog.weeks.reduce((s, w) => s + w.sessions.length, 0);
              const shortName = prog.name.split('—')[0].split('—')[0].trim();
              return (
                <div key={prog.id} onClick={() => openPrograms(prog)} style={{ padding: '12px 14px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', boxShadow: 'var(--shadow-card)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 20, lineHeight: 1 }}>{meta.flag || prog.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: prog.color }}>{shortName}</span>
                  </div>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{corners} cenários · {meta.highlights || prog.desc.substring(0, 30)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Telemetry import */}
        <div className="animate-in animate-in-delay-3" style={{ marginBottom: 14 }}>
          <div onClick={() => onNavigate('telemetry')} style={{ padding: '12px 16px', background: 'var(--bg-card)', border: '1.5px dashed var(--border)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color .15s' }}>
            <span style={{ fontSize: 20 }}>📊</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)' }}>IMPORTAR TELEMETRIA REAL</span>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>iRacing · ACC · Assetto Corsa · AMS2 · rFactor2 · Le Mans Ultimate</p>
            </div>
            <span style={{ fontSize: 11, color: '#2980b9', fontWeight: 600, fontFamily: 'var(--font-condensed)' }}>IMPORTAR →</span>
          </div>
        </div>

        {/* Input filter + car profile */}
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

        {/* Exercise sections */}
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
            <div key={cat.key} id={`cat-${cat.key}`} className="animate-in" style={{ scrollMarginTop: 20 }}>
              <SectionHeader category={cat} exerciseCount={catExercises.length} />
              <div className="grid-exercises">
                {catExercises.map(ex => (
                  <ExerciseCard key={ex.id} ex={ex} best={bests[ex.id]} attempts={sessionLog.filter(s => s.exId === ex.id).length} onOpen={() => openExercise(ex)} />
                ))}
              </div>
            </div>
          );
        })}

        {/* History */}
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
      <RankingSidebar userId={userId} sessionLogLength={sessionLog.length} onNavigate={onNavigate} />
    </div>
  );
}
