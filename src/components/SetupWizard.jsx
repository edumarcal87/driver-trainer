import React, { useEffect, useState, useRef, useCallback } from 'react';
import { readAllAxes, readPedal, readSteering, detectMovedAxis } from '../utils/gamepad';
import { PedalBar } from './UI';

const card = { background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '20px 24px', marginBottom: 14 };

const STEPS = [
  { key: 'brake', label: 'Freio', color: '#e74c3c', instruction: 'Pise no pedal de FREIO até o fundo e solte', icon: props => <BrakeIcon {...props} /> },
  { key: 'throttle', label: 'Acelerador', color: '#27ae60', instruction: 'Pise no pedal de ACELERADOR até o fundo e solte', icon: props => <ThrottleIcon {...props} /> },
  { key: 'clutch', label: 'Embreagem', color: '#f39c12', instruction: 'Pise no pedal de EMBREAGEM até o fundo e solte', icon: props => <ClutchIcon {...props} /> },
  { key: 'steering', label: 'Volante', color: '#2980b9', instruction: 'Gire o VOLANTE todo para a DIREITA, depois todo para a ESQUERDA, e volte ao centro', icon: props => <SteeringIcon {...props} /> },
];

function BrakeIcon({ size = 28, color = '#e74c3c' }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none"><rect x="6" y="2" width="20" height="28" rx="4" stroke={color} strokeWidth="2"/><rect x="10" y="8" width="12" height="4" rx="1" fill={color} opacity=".3"/><rect x="10" y="14" width="12" height="4" rx="1" fill={color} opacity=".5"/><rect x="10" y="20" width="12" height="4" rx="1" fill={color} opacity=".8"/></svg>;
}
function ThrottleIcon({ size = 28, color = '#27ae60' }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none"><rect x="6" y="2" width="20" height="28" rx="4" stroke={color} strokeWidth="2"/><path d="M10 26 L16 8 L22 26" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function ClutchIcon({ size = 28, color = '#f39c12' }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none"><rect x="6" y="2" width="20" height="28" rx="4" stroke={color} strokeWidth="2"/><circle cx="16" cy="16" r="6" stroke={color} strokeWidth="2"/><circle cx="16" cy="16" r="2" fill={color}/></svg>;
}
function SteeringIcon({ size = 28, color = '#2980b9' }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke={color} strokeWidth="2"/><circle cx="16" cy="16" r="4" stroke={color} strokeWidth="2"/><line x1="3" y1="16" x2="12" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="20" y1="16" x2="29" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="16" y1="20" x2="16" y2="29" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>;
}

export { BrakeIcon, ThrottleIcon, ClutchIcon, SteeringIcon };

export default function SetupWizard({ onComplete, gpConnected, gpName, pedalConfigs, setPedalConfigs, userName }) {
  const [step, setStep] = useState(-1); // -1 = welcome, 0-3 = detecting, 4 = verify
  const [phase, setPhase] = useState('idle'); // idle | waiting | done
  const [axes, setAxes] = useState([]);
  const [liveValues, setLiveValues] = useState({ brake: 0, throttle: 0, clutch: 0, steering: 0.5 });
  const [configuredKeys, setConfiguredKeys] = useState([]);

  const phaseRef = useRef('idle');
  const baselineRef = useRef([]);

  // Live polling
  useEffect(() => {
    const iv = setInterval(() => {
      const a = readAllAxes();
      setAxes(a);
      setLiveValues({
        brake: readPedal(pedalConfigs.brake),
        throttle: readPedal(pedalConfigs.throttle),
        clutch: readPedal(pedalConfigs.clutch),
        steering: readSteering(pedalConfigs.steering),
      });
    }, 30);
    return () => clearInterval(iv);
  }, [pedalConfigs]);

  // Check if already configured
  const isAlreadyConfigured = useCallback(() => {
    const stored = localStorage.getItem('bt_wizardDone');
    if (!stored) return false;
    // Check if configs look valid (not all defaults)
    const c = pedalConfigs;
    const hasCustomBrake = c.brake.calibMin !== 1 || c.brake.calibMax !== -1;
    const hasCustomThrottle = c.throttle.calibMin !== 1 || c.throttle.calibMax !== -1;
    return hasCustomBrake && hasCustomThrottle;
  }, [pedalConfigs]);

  // Auto-skip if already configured
  useEffect(() => {
    if (isAlreadyConfigured()) {
      setStep(4); // Go straight to verify
    }
  }, []);

  // Continuous axis monitoring (runs during detection steps)
  const [detectedInfo, setDetectedInfo] = useState(null); // { axis, min, max, pedalKey }
  const monitorRef = useRef(null);
  const detectedRef = useRef(null);

  const startMonitoring = useCallback((stepIdx) => {
    setPhase('waiting');
    phaseRef.current = 'waiting';
    setDetectedInfo(null);
    detectedRef.current = null;

    // Collect axes already assigned in previous steps
    const usedAxes = new Set();
    for (let i = 0; i < stepIdx; i++) {
      const prevKey = STEPS[i].key;
      const prevConfig = pedalConfigs[prevKey];
      if (prevConfig && prevConfig.axisIndex >= 0) {
        usedAxes.add(prevConfig.axisIndex);
      }
    }
    // Also check configuredKeys
    for (const key of configuredKeys) {
      const cfg = pedalConfigs[key];
      if (cfg && cfg.axisIndex >= 0) usedAxes.add(cfg.axisIndex);
    }

    // Capture baseline after brief settle
    setTimeout(() => {
      const baseline = readAllAxes();
      baselineRef.current = baseline;

      const pedalKey = STEPS[stepIdx].key;
      const isSteering = pedalKey === 'steering';
      let lockedAxis = -1;
      let trackMin = Infinity, trackMax = -Infinity;

      monitorRef.current = setInterval(() => {
        const current = readAllAxes();
        if (!baselineRef.current.length) return;

        // Find which axis moved the most, EXCLUDING already-used axes
        let bestAxis = -1, bestDelta = 0;
        for (let i = 0; i < current.length; i++) {
          if (usedAxes.has(i)) continue; // Skip axes from previous steps
          const d = Math.abs(current[i] - baselineRef.current[i]);
          if (d > bestDelta) { bestDelta = d; bestAxis = i; }
        }

        // Lock onto axis once we see significant movement (higher threshold)
        if (bestDelta > 0.5 && lockedAxis === -1) {
          lockedAxis = bestAxis;
        }

        if (lockedAxis >= 0) {
          const v = current[lockedAxis];
          trackMin = Math.min(trackMin, v);
          trackMax = Math.max(trackMax, v);

          const info = {
            axis: lockedAxis,
            current: v,
            baseline: baselineRef.current[lockedAxis],
            min: trackMin,
            max: trackMax,
            range: trackMax - trackMin,
            pedalKey,
          };
          detectedRef.current = info;
          setDetectedInfo({ ...info });
        }
      }, 30);
    }, 300);
  }, [pedalConfigs, configuredKeys]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (monitorRef.current) { clearInterval(monitorRef.current); monitorRef.current = null; }
  }, []);

  // Confirm current detection and advance
  const confirmDetection = useCallback(() => {
    const info = detectedRef.current;
    if (!info) return;
    stopMonitoring();

    const { axis, baseline, min, max, pedalKey } = info;
    const isSteering = pedalKey === 'steering';

    if (isSteering) {
      setPedalConfigs(prev => ({
        ...prev,
        steering: { axisIndex: axis, calibMin: min, calibMax: max, invert: false }
      }));
    } else {
      // For pedals: baseline = released value, extreme = pressed value
      // The readPedal formula (raw - calibMin) / (calibMax - calibMin) handles direction automatically
      // No invert needed — calibMin=released, calibMax=pressed
      const pressedVal = Math.abs(max - baseline) > Math.abs(min - baseline) ? max : min;
      setPedalConfigs(prev => ({
        ...prev,
        [pedalKey]: { axisIndex: axis, calibMin: baseline, calibMax: pressedVal, invert: false }
      }));
    }

    setConfiguredKeys(prev => [...prev, pedalKey]);
    setPhase('done');

    const stepIdx = STEPS.findIndex(s => s.key === pedalKey);
    setTimeout(() => {
      if (stepIdx < STEPS.length - 1) {
        setStep(stepIdx + 1);
        setPhase('idle');
      } else {
        setStep(4);
        localStorage.setItem('bt_wizardDone', 'true');
      }
    }, 400);
  }, [stopMonitoring, setPedalConfigs]);

  // Skip current pedal
  const skipDetection = useCallback(() => {
    stopMonitoring();
    const stepIdx = step;
    if (stepIdx < STEPS.length - 1) {
      setStep(stepIdx + 1);
      setPhase('idle');
    } else {
      setStep(4);
      localStorage.setItem('bt_wizardDone', 'true');
    }
  }, [step, stopMonitoring]);

  // Start monitoring when step changes
  useEffect(() => {
    if (step >= 0 && step < STEPS.length && phase === 'idle') {
      startMonitoring(step);
    }
    return () => stopMonitoring();
  }, [step, phase, startMonitoring, stopMonitoring]);

  // ── Welcome screen ──
  if (step === -1) {
    return (
      <div style={{ maxWidth: 520, width: '100%', margin: '0 auto' }}>
        <div className="animate-in" style={{ textAlign: 'center', marginBottom: 32, marginTop: 40 }}>
          {/* Logo */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, border: '2px solid var(--accent-brake)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="34" height="34" viewBox="0 0 56 56"><path d="M8 44 Q10 20, 18 14 Q24 10, 30 22 Q34 30, 38 28 Q42 26, 44 14" fill="none" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round"/><circle cx="8" cy="44" r="3.5" fill="#e74c3c"/><circle cx="30" cy="22" r="3" fill="#27ae60"/><circle cx="44" cy="14" r="2.5" fill="#f39c12"/></svg>
            </div>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
                DRIVER <span style={{ color: 'var(--accent-brake)', fontWeight: 300 }}>TRAINER</span>
              </h1>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '2px', marginTop: 2 }}>DO PEDAL AO PÓDIO</p>
            </div>
          </div>
        </div>

        <div className="animate-in animate-in-delay-1" style={{ ...card, textAlign: 'center', padding: '32px 28px' }}>
          <p style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: 8 }}>Bem-vindo{userName ? `, ${userName.split(' ')[0]}` : ''}!</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
            Vamos configurar seus controles antes de começar.
            {gpConnected
              ? <><br/><span style={{ color: 'var(--accent-throttle)', fontWeight: 500 }}>✓ {gpName.substring(0, 40)} detectado</span></>
              : <><br/><span style={{ color: 'var(--accent-brake)' }}>Conecte seu volante/pedais via USB e pressione um botão.</span></>
            }
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 24 }}>
            {STEPS.map(s => (
              <div key={s.key} style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: s.color + '10', border: `1.5px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                  {s.icon({ size: 24, color: s.color })}
                </div>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: s.color, letterSpacing: '.5px' }}>{s.label.toUpperCase()}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {gpConnected && (
              <button onClick={() => setStep(0)} style={{
                padding: '10px 32px', fontSize: 14, borderRadius: 12, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '.5px',
                border: '1.5px solid var(--accent-throttle)', background: 'var(--accent-throttle-light)', color: 'var(--accent-throttle)', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(39,174,96,0.15)',
              }}>
                CONFIGURAR PEDAIS
              </button>
            )}
            <button onClick={onComplete} style={{
              padding: '10px 24px', fontSize: 13, borderRadius: 12, fontWeight: 500,
              border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer',
            }}>
              {gpConnected ? 'PULAR' : 'USAR TECLADO'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Detection steps ──
  if (step >= 0 && step < STEPS.length) {
    const current = STEPS[step];
    const hasDetection = detectedInfo && detectedInfo.range > 0.3;
    return (
      <div style={{ maxWidth: 520, width: '100%', margin: '0 auto' }}>
        <div className="animate-in" style={{ textAlign: 'center', marginTop: 40, marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: 4 }}>CONFIGURAÇÃO</p>
          <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)' }}>Passo {step + 1} de {STEPS.length}</h2>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {STEPS.map((s, i) => (
            <div key={s.key} style={{
              width: 36, height: 4, borderRadius: 2,
              background: i < step ? s.color : i === step ? s.color + '60' : 'var(--border)',
              transition: 'background .3s',
            }} />
          ))}
        </div>

        <div className="animate-in" style={{ ...card, textAlign: 'center', padding: '32px 28px' }}>
          {/* Icon */}
          <div style={{
            width: 80, height: 80, borderRadius: 20, background: current.color + '10',
            border: `2px solid ${current.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            {current.icon({ size: 40, color: current.color })}
          </div>

          <p style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-display)', color: current.color, marginBottom: 8 }}>
            {current.label}
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
            {current.instruction}
          </p>

          {/* Live detection feedback */}
          {hasDetection ? (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 20,
                background: 'var(--accent-throttle-light)', border: '1.5px solid #27ae6030',
              }}>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-throttle)' }}>
                  ✓ EIXO {detectedInfo.axis} DETECTADO
                </span>
              </div>
              {/* Live bar */}
              <div style={{ maxWidth: 280, margin: '12px auto 0' }}>
                <div style={{ height: 8, background: 'var(--bg-inset)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <div style={{
                    width: `${Math.round(detectedInfo.range / 2 * 100)}%`, height: '100%',
                    background: current.color, borderRadius: 4, transition: 'width .05s',
                  }} />
                </div>
                <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: 4 }}>
                  range: {detectedInfo.range.toFixed(2)} | val: {detectedInfo.current.toFixed(2)}
                </p>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 20,
              background: 'var(--bg-inset)', border: '1.5px solid var(--border)', marginBottom: 16,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: current.color, animation: 'pulse-dot 1s infinite' }} />
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-muted)' }}>
                AGUARDANDO...
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {hasDetection && (
              <button onClick={confirmDetection} style={{
                padding: '10px 28px', fontSize: 13, borderRadius: 12, fontWeight: 700, fontFamily: 'var(--font-display)',
                border: `1.5px solid ${current.color}`, background: current.color + '15', color: current.color, cursor: 'pointer',
                boxShadow: `0 2px 8px ${current.color}20`,
              }}>
                CONFIRMAR
              </button>
            )}
            <button onClick={skipDetection} style={{
              padding: '10px 20px', fontSize: 12, borderRadius: 12, fontWeight: 500,
              border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)', cursor: 'pointer',
            }}>
              PULAR
            </button>
          </div>

          {/* Axes debug */}
          {axes.length > 0 && (
            <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--bg-inset)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '.5px', marginBottom: 4 }}>EIXOS RAW</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                {axes.map((v, i) => {
                  const delta = baselineRef.current[i] !== undefined ? Math.abs(v - baselineRef.current[i]) : 0;
                  const isActive = delta > 0.2;
                  return (
                    <span key={i} style={{
                      fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 6,
                      background: isActive ? current.color + '15' : 'var(--bg-card)',
                      color: isActive ? current.color : 'var(--text-muted)',
                      border: `1px solid ${isActive ? current.color + '40' : 'var(--border)'}`,
                      fontWeight: isActive ? 600 : 400,
                    }}>
                      {i}: {v.toFixed(2)}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <style>{`@keyframes pulse-dot { 0%,100% { opacity:.4; } 50% { opacity:1; } }`}</style>
      </div>
    );
  }

  // ── Verification screen ──
  return (
    <div style={{ maxWidth: 520, width: '100%', margin: '0 auto' }}>
      <div className="animate-in" style={{ textAlign: 'center', marginTop: 40, marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: 4 }}>CONFIGURAÇÃO</p>
        <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)' }}>Verificar controles</h2>
      </div>

      <div className="animate-in animate-in-delay-1" style={{ ...card, padding: '24px' }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Teste cada controle abaixo. Cada barra deve responder apenas ao pedal/volante correto.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PedalBar value={liveValues.brake} label="FREIO" type="brake" showGlow />
          <PedalBar value={liveValues.throttle} label="ACEL" type="throttle" showGlow />
          <PedalBar value={liveValues.clutch} label="EMBR" type="clutch" showGlow />
          <PedalBar value={liveValues.steering} label="VOLANTE" type="steering" showGlow />
        </div>

        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 14, textAlign: 'center' }}>
          Volante deve ficar ~50% no centro. Se algo estiver errado, reconfigure.
        </p>
      </div>

      <div className="animate-in animate-in-delay-2" style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 8 }}>
        <button onClick={() => {
          localStorage.setItem('bt_wizardDone', 'true');
          onComplete();
        }} style={{
          padding: '10px 32px', fontSize: 14, borderRadius: 12, fontWeight: 700, fontFamily: 'var(--font-display)',
          border: '1.5px solid var(--accent-throttle)', background: 'var(--accent-throttle-light)', color: 'var(--accent-throttle)', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(39,174,96,0.15)',
        }}>
          TUDO CERTO — COMEÇAR
        </button>
        <button onClick={() => { setStep(0); setPhase('idle'); phaseRef.current = 'idle'; setConfiguredKeys([]); }} style={{
          padding: '10px 20px', fontSize: 13, borderRadius: 12, fontWeight: 500,
          border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer',
        }}>
          RECONFIGURAR
        </button>
      </div>
    </div>
  );
}
