import React, { useState, useEffect, useRef, useCallback } from 'react';
import Chart from './Chart';
import CombinedChart from './CombinedChart';
import { PedalBar, DifficultyDots, Legend, GradeDisplay, StatCard, SegmentBar, TipCard } from './UI';
import { makeCurvePoints, calcScore, analyzePerformance } from '../utils/scoring';
import { readPedal, readSteering } from '../utils/gamepad';

const btnS = { padding: '5px 14px', fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)' };

function readInput(key, pedalConfigs) {
  if (key === 'steering') return readSteering(pedalConfigs.steering);
  return readPedal(pedalConfigs[key]);
}

export default function ExerciseScreen({ exercise, onBack, inputMode, pedalConfigs, onResult }) {
  const isCombined = exercise.pedal === 'combined';
  const isSteering = exercise.pedal === 'steering';
  const pedalType = exercise.pedal || 'brake';

  // For combined: keys of inputs involved
  const combinedKeys = isCombined ? Object.keys(exercise.curves) : [];

  // Single-input init
  const initVal = isSteering ? 0.5 : 0;
  const pedalLabel = { brake: 'FREIO', throttle: 'ACEL', clutch: 'EMBR', steering: 'VOLANTE', combined: 'COMBINADO' }[pedalType];

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

  const runRef = useRef(false), startRef = useRef(0), afRef = useRef(null);
  // Single refs
  const userRef = useRef([]), inputRef = useRef(initVal);
  // Combined refs
  const userMapRef = useRef({}), inputsRef = useRef({});
  const keysRef = useRef({ up: false, down: false, left: false, right: false });

  const LEAD_IN_MS = 1500;
  const totalDuration = exercise.duration + LEAD_IN_MS;
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
      // Read all involved inputs
      const newInputs = {};
      for (const key of combinedKeys) {
        if (inputMode === 'gamepad') {
          newInputs[key] = readInput(key, pedalConfigs);
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
  const INPUT_LABELS = { brake: 'FREIO', throttle: 'ACEL', clutch: 'EMBR', steering: 'VOLANTE' };

  return (
    <div style={{ maxWidth: 720, width: '100%' }}>
      {/* Header */}
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
        <button onClick={() => { runRef.current = false; setRunning(false); onBack(); }} style={btnS}>← VOLTAR</button>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{exercise.name}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{exercise.desc}</p>
        </div>
        {exercise.diff && <DifficultyDots level={exercise.diff} />}
      </div>

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
          <button onClick={startRun} style={{
            padding: '8px 24px', fontSize: 13, borderRadius: 10, fontWeight: 600, fontFamily: 'var(--font-display)', letterSpacing: '.5px',
            border: '1px solid var(--accent-throttle)', background: 'var(--accent-throttle-glow)', color: 'var(--accent-throttle)', cursor: 'pointer',
          }}>
            {score !== null ? 'TENTAR DE NOVO' : 'INICIAR'}
          </button>
        )}
        {running && (
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '.5px' }}>
            {inputMode === 'keyboard'
              ? (isCombined ? '↑↓ PEDAIS · ←→ VOLANTE' : isSteering ? '← ESQUERDA · → DIREITA' : '↑ PRESSIONA · ↓ SOLTA')
              : (isCombined ? 'USE TODOS OS PEDAIS' : isSteering ? 'GIRE O VOLANTE' : `PISE NO ${pedalLabel}`)}
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
