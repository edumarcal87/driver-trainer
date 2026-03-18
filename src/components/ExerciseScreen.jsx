import React, { useState, useEffect, useRef, useCallback } from 'react';
import Chart from './Chart';
import CombinedChart from './CombinedChart';
import TutorialOverlay from './TutorialOverlay';
import { PedalBar, DifficultyDots, Legend, GradeDisplay, StatCard, SegmentBar, TipCard } from './UI';
import { makeCurvePoints, calcScore, analyzePerformance } from '../utils/scoring';
import { readPedal, readSteering, readShifterButtons, readHShifterGear } from '../utils/gamepad';
import { TUTORIALS, LIVE_TIPS, getLiveTip } from '../data/tutorials';
import { gearToValue } from '../data/gears';

const btnS = { padding: '5px 14px', fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)' };

function readInput(key, pedalConfigs, gearState) {
  if (key === 'steering') return readSteering(pedalConfigs.steering);
  if (key === 'gear') return gearState.current;
  return readPedal(pedalConfigs[key]);
}

export default function ExerciseScreen({ exercise, onBack, inputMode, pedalConfigs, onResult }) {
  const isGearExercise = exercise.pedal === 'sequential' || exercise.pedal === 'hpattern';
  const isCombined = exercise.pedal === 'combined' || isGearExercise;
  const isSteering = exercise.pedal === 'steering';
  const pedalType = exercise.pedal || 'brake';

  // For combined (including gear): keys of inputs involved
  const combinedKeys = isCombined ? Object.keys(exercise.curves) : [];

  // Single-input init
  const initVal = isSteering ? 0.5 : 0;
  const pedalLabel = { brake: 'FREIO', throttle: 'ACEL', clutch: 'EMBR', steering: 'VOLANTE', combined: 'COMBINADO', sequential: 'SEQUENCIAL', hpattern: 'H-PATTERN' }[pedalType];

  // Gear state for gear exercises
  const gearRef = useRef({ current: gearToValue(1), gearNum: 1 });
  const prevShiftRef = useRef({ up: false, down: false });

  const [running, setRunning] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [progress, setProgress] = useState(0);
  // Single mode
  const [currentInput, setCurrentInput] = useState(initVal);
  const [userPts, setUserPts] = useState([]);
  // Combined mode
  const [currentInputs, setCurrentInputs] = useState({});
  const [userDataMap, setUserDataMap] = useState({});

  const [score, setScore] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [combinedScores, setCombinedScores] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);

  // Tutorial: show on first encounter
  const tutorialKey = `bt_tutorial_${exercise.id}`;
  const [showTutorial, setShowTutorial] = useState(() => {
    if (!TUTORIALS[exercise.id]) return false;
    return !localStorage.getItem(tutorialKey);
  });

  // Speed control: 1 = normal, 2 = slow motion
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  // Live coaching tip
  const [liveTip, setLiveTip] = useState(null);
  const liveTipTimerRef = useRef(0);
  const recentDiffsRef = useRef([]);
  const lastTipRef = useRef(null);
  const lastTipTimeRef = useRef(0);

  const runRef = useRef(false), startRef = useRef(0), afRef = useRef(null);
  // Single refs
  const userRef = useRef([]), inputRef = useRef(initVal);
  // Combined refs
  const userMapRef = useRef({}), inputsRef = useRef({});
  const keysRef = useRef({ up: false, down: false, left: false, right: false, shiftUp: false, shiftDown: false });

  const LEAD_IN_MS = 1500;
  const totalDuration = (exercise.duration + LEAD_IN_MS) * speedMultiplier;
  const leadInRatio = LEAD_IN_MS / totalDuration;

  // Generate target points with lead-in flat zone at the start
  const targetPts = !isCombined ? (() => {
    const pts = [];
    const n = 200;
    const restVal = isSteering ? 0.5 : 0;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      if (t < leadInRatio) {
        pts.push({ t, v: restVal });
      } else {
        const curveT = (t - leadInRatio) / (1 - leadInRatio);
        pts.push({ t, v: exercise.curve(curveT) });
      }
    }
    return pts;
  })() : null;

  // For combined: generate curves with lead-in
  const combinedTargetPtsMap = isCombined ? (() => {
    const map = {};
    for (const key of combinedKeys) {
      const pts = [];
      const n = 200;
      const restVal = key === 'steering' ? 0.5 : 0;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        if (t < leadInRatio) {
          pts.push({ t, v: restVal });
        } else {
          const curveT = (t - leadInRatio) / (1 - leadInRatio);
          pts.push({ t, v: exercise.curves[key](curveT) });
        }
      }
      map[key] = pts;
    }
    return map;
  })() : null;

  useEffect(() => {
    const kd = e => {
      if (e.key === 'ArrowUp' || e.key === 'w') keysRef.current.up = true;
      if (e.key === 'ArrowDown' || e.key === 's') keysRef.current.down = true;
      if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = true;
      if (e.key === 'q' || e.key === 'Q' || e.key === 'PageUp') keysRef.current.shiftUp = true;
      if (e.key === 'e' || e.key === 'E' || e.key === 'PageDown') keysRef.current.shiftDown = true;
    };
    const ku = e => {
      if (e.key === 'ArrowUp' || e.key === 'w') keysRef.current.up = false;
      if (e.key === 'ArrowDown' || e.key === 's') keysRef.current.down = false;
      if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = false;
    };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, []);

  const gameLoop = useCallback(() => {
    if (!runRef.current) return;
    const elapsed = Date.now() - startRef.current;
    const t = Math.min(1, elapsed / totalDuration);

    if (isCombined) {
      // Update gear state for gear exercises
      if (isGearExercise && inputMode === 'gamepad') {
        if (exercise.pedal === 'sequential') {
          const btns = readShifterButtons();
          // Edge detection — only shift on press, not hold
          if (btns.upshift && !prevShiftRef.current.up) {
            gearRef.current.gearNum = Math.min(6, gearRef.current.gearNum + 1);
            gearRef.current.current = gearToValue(gearRef.current.gearNum);
          }
          if (btns.downshift && !prevShiftRef.current.down) {
            gearRef.current.gearNum = Math.max(1, gearRef.current.gearNum - 1);
            gearRef.current.current = gearToValue(gearRef.current.gearNum);
          }
          prevShiftRef.current = { up: btns.upshift, down: btns.downshift };
        } else if (exercise.pedal === 'hpattern') {
          const hGear = readHShifterGear();
          if (hGear > 0) {
            gearRef.current.gearNum = hGear;
            gearRef.current.current = gearToValue(hGear);
          }
        }
      } else if (isGearExercise && inputMode === 'keyboard') {
        // Keyboard: Q = upshift, E = downshift (or PageUp/PageDown)
        if (keysRef.current.shiftUp) {
          gearRef.current.gearNum = Math.min(6, gearRef.current.gearNum + 1);
          gearRef.current.current = gearToValue(gearRef.current.gearNum);
          keysRef.current.shiftUp = false;
        }
        if (keysRef.current.shiftDown) {
          gearRef.current.gearNum = Math.max(1, gearRef.current.gearNum - 1);
          gearRef.current.current = gearToValue(gearRef.current.gearNum);
          keysRef.current.shiftDown = false;
        }
      }

      // Read all involved inputs
      const newInputs = {};
      for (const key of combinedKeys) {
        if (inputMode === 'gamepad') {
          newInputs[key] = readInput(key, pedalConfigs, gearRef.current);
        } else {
          // Keyboard: primary input via ↑↓, steering via ←→ — limited for testing
          const prev = inputsRef.current[key] || (key === 'steering' ? 0.5 : 0);
          if (key === 'steering') {
            if (keysRef.current.right) newInputs[key] = Math.min(1, prev + .04);
            else if (keysRef.current.left) newInputs[key] = Math.max(0, prev - .04);
            else newInputs[key] = prev + (.5 - prev) * .08;
          } else {
            if (keysRef.current.up) newInputs[key] = Math.min(1, prev + .06);
            else if (keysRef.current.down) newInputs[key] = Math.max(0, prev - .06);
            else newInputs[key] = Math.max(0, prev - .03);
          }
        }
      }
      inputsRef.current = newInputs;
      for (const key of combinedKeys) {
        if (!userMapRef.current[key]) userMapRef.current[key] = [];
        userMapRef.current[key].push({ t, v: newInputs[key] });
      }
      setCurrentInputs({ ...newInputs });
      setUserDataMap(() => {
        const copy = {};
        for (const key of combinedKeys) copy[key] = [...(userMapRef.current[key] || [])];
        return copy;
      });
    } else {
      // Single input
      let inp = inputRef.current;
      if (inputMode === 'gamepad') {
        inp = isSteering ? readSteering(pedalConfigs.steering) : readPedal(pedalConfigs[pedalType]);
      } else if (isSteering) {
        if (keysRef.current.right) inp = Math.min(1, inp + .04);
        else if (keysRef.current.left) inp = Math.max(0, inp - .04);
        else inp += (.5 - inp) * .08;
      } else {
        if (keysRef.current.up) inp = Math.min(1, inp + .06);
        else if (keysRef.current.down) inp = Math.max(0, inp - .06);
        else inp = Math.max(0, inp - .03);
      }
      inputRef.current = inp;
      userRef.current.push({ t, v: inp });
      setCurrentInput(inp);
      setUserPts([...userRef.current]);
    }

    setProgress(t);

    // Live coaching tip — sliding window with hysteresis
    if (!isCombined && t > 0.05) {
      const now = Date.now();
      // Collect diff samples continuously
      const tIdx = Math.min(Math.floor(t * 200), 199);
      const targetVal = targetPts?.[tIdx]?.v ?? 0;
      const userVal = inputRef.current;
      const diff = userVal - targetVal;
      recentDiffsRef.current.push(diff);
      if (recentDiffsRef.current.length > 8) recentDiffsRef.current.shift(); // keep last ~8 samples (~250ms)

      // Update tip every 500ms (less flickering)
      if (now - liveTipTimerRef.current > 500) {
        liveTipTimerRef.current = now;
        const tipKey = getLiveTip(targetVal, userVal, t, leadInRatio, recentDiffsRef.current);

        // Hysteresis: keep same tip for at least 800ms before changing
        if (tipKey !== lastTipRef.current) {
          if (now - lastTipTimeRef.current > 800 || !lastTipRef.current) {
            lastTipRef.current = tipKey;
            lastTipTimeRef.current = now;
            setLiveTip(tipKey ? LIVE_TIPS[tipKey] : null);
          }
        }
      }
    }

    if (t >= 1) {
      runRef.current = false; setRunning(false);

      if (isCombined) {
        // Score each input separately, average for overall
        const scores = {};
        let totalScore = 0;
        for (const key of combinedKeys) {
          const tgtPts = combinedTargetPtsMap[key];
          const uPts = userMapRef.current[key] || [];
          scores[key] = calcScore(tgtPts, uPts);
          totalScore += scores[key];
        }
        const overall = Math.round(totalScore / combinedKeys.length);
        setCombinedScores(scores);
        setScore(overall);
        // Generate analysis from primary (first) input
        const primaryKey = combinedKeys[0];
        const primaryTarget = combinedTargetPtsMap[primaryKey];
        const a = analyzePerformance(primaryTarget, userMapRef.current[primaryKey] || [], exercise.name);
        if (a) a.overall = overall;
        setAnalysis(a);
        setShowFeedback(true);
        onResult(exercise.id, overall, a);
      } else {
        const s = calcScore(targetPts, userRef.current);
        const a = analyzePerformance(targetPts, userRef.current, exercise.name);
        setScore(s); setAnalysis(a); setShowFeedback(true);
        onResult(exercise.id, s, a);
      }
      return;
    }
    afRef.current = requestAnimationFrame(gameLoop);
  }, [exercise, inputMode, pedalConfigs, pedalType, isCombined, isSteering, combinedKeys, targetPts, combinedTargetPtsMap, totalDuration, onResult]);

  const startRun = useCallback(() => {
    setScore(null); setAnalysis(null); setShowFeedback(false); setCombinedScores({});
    setUserPts([]); userRef.current = []; inputRef.current = isSteering ? 0.5 : 0;
    setCurrentInput(isSteering ? 0.5 : 0); setProgress(0);
    setLiveTip(null); liveTipTimerRef.current = 0; recentDiffsRef.current = []; lastTipRef.current = null; lastTipTimeRef.current = 0;
    // Combined reset
    userMapRef.current = {}; inputsRef.current = {};
    const initInputs = {};
    for (const key of combinedKeys) { initInputs[key] = key === 'steering' ? 0.5 : 0; userMapRef.current[key] = []; }
    setCurrentInputs(initInputs); setUserDataMap({});

    setCountdown(3);
    let c = 3;
    const iv = setInterval(() => {
      c--;
      if (c > 0) { setCountdown(c); }
      else {
        clearInterval(iv);
        setCountdown('GO');
        // 1.5s preparation delay after countdown
        setTimeout(() => {
          setCountdown(null);
          runRef.current = true;
          startRef.current = Date.now();
          setRunning(true);
          afRef.current = requestAnimationFrame(gameLoop);
        }, 1500);
      }
    }, 600);
  }, [gameLoop, isSteering, combinedKeys]);

  useEffect(() => () => { if (afRef.current) cancelAnimationFrame(afRef.current); }, []);

  // Input labels for combined
  const INPUT_LABELS = { brake: 'FREIO', throttle: 'ACEL', clutch: 'EMBR', steering: 'VOLANTE', gear: 'MARCHA' };

  return (
    <div style={{ maxWidth: 720, width: '100%' }}>
      {/* Tutorial overlay */}
      {showTutorial && (
        <TutorialOverlay
          exerciseId={exercise.id}
          onClose={() => { setShowTutorial(false); localStorage.setItem(tutorialKey, '1'); }}
          onSlowMode={() => { setShowTutorial(false); localStorage.setItem(tutorialKey, '1'); setSpeedMultiplier(2); }}
        />
      )}

      {/* Header */}
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
        <button onClick={() => { runRef.current = false; setRunning(false); onBack(); }} style={btnS}>← VOLTAR</button>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{exercise.name}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{exercise.desc}</p>
        </div>
        {exercise.diff && <DifficultyDots level={exercise.diff} />}
        {TUTORIALS[exercise.id] && (
          <button onClick={() => setShowTutorial(true)} style={{ ...btnS, fontSize: 10, padding: '4px 10px', color: '#2980b9', borderColor: '#2980b930' }} title="Ver tutorial">?</button>
        )}
      </div>

      {/* Speed indicator */}
      {speedMultiplier > 1 && (
        <div className="animate-in" style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', marginBottom: 10,
          background: '#e4f0f9', borderRadius: 10, border: '1px solid #2980b920',
        }}>
          <span style={{ fontSize: 14 }}>🐢</span>
          <span style={{ fontSize: 11, color: '#2980b9', fontWeight: 600, fontFamily: 'var(--font-condensed)', letterSpacing: '.3px', flex: 1 }}>
            CÂMERA LENTA — velocidade {Math.round(100 / speedMultiplier)}%
          </span>
          <button onClick={() => setSpeedMultiplier(1)} style={{ ...btnS, fontSize: 10, padding: '3px 10px', color: '#2980b9', borderColor: '#2980b930' }}>
            VELOCIDADE NORMAL
          </button>
        </div>
      )}

      {/* Chart */}
      <div className="animate-in animate-in-delay-1" style={{ position: 'relative', background: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '12px 8px 8px', marginBottom: 12 }}>
        {countdown !== null && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,12,16,.7)', borderRadius: 'var(--radius-lg)', zIndex: 10, backdropFilter: 'blur(4px)' }}>
            <span style={{ fontSize: 72, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', animation: 'count-pop .4s cubic-bezier(.4,0,.2,1) both' }}>{countdown}</span>
          </div>
        )}
        {isCombined ? (
          <CombinedChart curves={exercise.curves} targetPtsMap={combinedTargetPtsMap} userDataMap={userDataMap} currentInputs={currentInputs} progress={progress} running={running} scores={combinedScores} />
        ) : (
          <Chart targetPts={targetPts} userPts={userPts} currentInput={currentInput} progress={progress} running={running} score={score} pedalType={pedalType} />
        )}
      </div>

      {/* Live coaching tip */}
      {running && liveTip && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', marginBottom: 8,
          background: liveTip.color + '10', borderRadius: 10, border: `1px solid ${liveTip.color}20`,
          transition: 'all .15s',
        }}>
          <span style={{ fontSize: 14 }}>{liveTip.icon}</span>
          <span style={{ fontSize: 12, color: liveTip.color, fontWeight: 600, fontFamily: 'var(--font-condensed)', letterSpacing: '.3px' }}>{liveTip.text}</span>
        </div>
      )}

      {/* Input bars */}
      <div className="animate-in animate-in-delay-2" style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {isCombined ? combinedKeys.map(key => (
          <PedalBar key={key} value={currentInputs[key] ?? 0} label={INPUT_LABELS[key] || key} type={key} showGlow={running} />
        )) : (
          <PedalBar value={currentInput} label={pedalLabel} type={pedalType} showGlow={running} />
        )}
      </div>

      {/* Controls */}
      <div className="animate-in animate-in-delay-3" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        {!running && !showFeedback && (
          <>
            <button onClick={startRun} style={{
              padding: '8px 24px', fontSize: 13, borderRadius: 10, fontWeight: 600, fontFamily: 'var(--font-display)', letterSpacing: '.5px',
              border: '1px solid var(--accent-throttle)', background: 'var(--accent-throttle-glow)', color: 'var(--accent-throttle)', cursor: 'pointer',
            }}>
              {score !== null ? 'TENTAR DE NOVO' : 'INICIAR'}
            </button>
            {!running && score === null && (
              <button onClick={() => setSpeedMultiplier(speedMultiplier === 1 ? 2 : 1)} style={{
                ...btnS, fontSize: 10, padding: '6px 12px',
                color: speedMultiplier > 1 ? '#2980b9' : 'var(--text-muted)',
                borderColor: speedMultiplier > 1 ? '#2980b940' : 'var(--border)',
                background: speedMultiplier > 1 ? '#e4f0f9' : 'transparent',
              }}>
                🐢 {speedMultiplier > 1 ? 'LENTO' : 'CÂMERA LENTA'}
              </button>
            )}
          </>
        )}
        {running && (
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '.5px' }}>
            {inputMode === 'keyboard'
              ? (isGearExercise ? 'Q SOBE · E DESCE · ↑↓ PEDAIS' : isCombined ? '↑↓ PEDAIS · ←→ VOLANTE' : isSteering ? '← ESQUERDA · → DIREITA' : '↑ PRESSIONA · ↓ SOLTA')
              : (isGearExercise ? (exercise.pedal === 'sequential' ? 'BORBOLETAS + PEDAIS' : 'H-SHIFTER + EMBREAGEM + PEDAIS') : isCombined ? 'USE TODOS OS PEDAIS' : isSteering ? 'GIRE O VOLANTE' : `PISE NO ${pedalLabel}`)}
          </span>
        )}
      </div>

      {!isCombined && <Legend pedalType={pedalType} />}

      {/* ── Feedback Panel ── */}
      {showFeedback && analysis && (
        <div style={{ marginTop: 20, animation: 'fadeInUp .5s cubic-bezier(.4,0,.2,1) both' }}>
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--border), transparent)', margin: '8px 0 20px' }} />

          {/* Grade + overall */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
            <GradeDisplay grade={analysis.grade} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: analysis.overall >= 80 ? 'var(--accent-throttle)' : analysis.overall >= 50 ? 'var(--accent-clutch)' : 'var(--accent-brake)' }}>
                {analysis.overall}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>%</span>
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-condensed)', letterSpacing: '.3px' }}>PONTUAÇÃO GERAL</p>
            </div>
            <button onClick={startRun} style={{
              padding: '10px 28px', fontSize: 13, borderRadius: 10, fontWeight: 600, fontFamily: 'var(--font-display)', letterSpacing: '.5px',
              border: '1px solid var(--accent-throttle)', background: 'var(--accent-throttle-glow)', color: 'var(--accent-throttle)', cursor: 'pointer',
            }}>REPETIR</button>
          </div>

          {/* Per-input scores (combined only) */}
          {isCombined && Object.keys(combinedScores).length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {Object.entries(combinedScores).map(([key, sc]) => (
                <StatCard key={key} label={INPUT_LABELS[key] || key} value={sc} unit="%" color={sc >= 80 ? 'var(--accent-throttle)' : sc >= 50 ? 'var(--accent-clutch)' : 'var(--accent-brake)'} />
              ))}
            </div>
          )}

          {/* Stats cards */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <StatCard label="CONSISTÊNCIA" value={analysis.stats.consistency} unit="%" color={analysis.stats.consistency >= 70 ? 'var(--accent-throttle)' : 'var(--accent-clutch)'} />
            <StatCard label="PICO" value={Math.round(analysis.stats.userPeak * 100)} unit={`% / ${Math.round(analysis.stats.targetPeak * 100)}%`} color={analysis.stats.peakAccuracy >= 80 ? 'var(--accent-throttle)' : 'var(--accent-clutch)'} />
            <StatCard label="TIMING" value={`${analysis.stats.peakTimingDelta > 0 ? '+' : ''}${Math.round(analysis.stats.peakTimingDelta * 100)}`} unit="%" color={Math.abs(analysis.stats.peakTimingDelta) < 0.05 ? 'var(--accent-throttle)' : 'var(--accent-clutch)'} />
          </div>

          {/* Segments */}
          <div style={{ background: 'var(--bg-panel)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '14px 16px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px', marginBottom: 10 }}>ANÁLISE POR SEGMENTO</p>
            {analysis.segments.map(seg => <SegmentBar key={seg.key} label={`${seg.label} — ${seg.desc}`} score={seg.score} bias={seg.bias} />)}
          </div>

          {/* Tips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px', marginBottom: 2 }}>DICAS DE MELHORIA</p>
            {analysis.tips.map((tip, i) => <TipCard key={i} type={tip.type} text={tip.text} />)}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={startRun} style={{ padding: '8px 20px', fontSize: 12, borderRadius: 8, fontWeight: 500, border: '1px solid var(--accent-throttle)', background: 'var(--accent-throttle-glow)', color: 'var(--accent-throttle)', cursor: 'pointer' }}>Tentar de novo</button>
            <button onClick={() => { setShowFeedback(false); onBack(); }} style={btnS}>Outro exercício</button>
          </div>
        </div>
      )}
    </div>
  );
}
