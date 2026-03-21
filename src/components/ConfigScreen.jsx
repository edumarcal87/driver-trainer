import React, { useEffect, useState, useRef, useCallback } from 'react';
import { readAllAxes, readPedal, readSteering, detectMovedAxis } from '../utils/gamepad';
import { PedalBar } from './UI';

const btn = { padding: '6px 14px', fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)' };
const card = { padding: '16px 18px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: 12 };
const LABELS = { brake: 'Freio', throttle: 'Acelerador', clutch: 'Embreagem', steering: 'Volante' };
const COLORS = { brake: 'var(--accent-brake)', throttle: 'var(--accent-throttle)', clutch: 'var(--accent-clutch)', steering: 'var(--accent-blue)' };

const WIZARD_STEPS = [
  { pedal: 'brake', instruction: 'Pise no pedal de FREIO até o fundo e solte' },
  { pedal: 'throttle', instruction: 'Pise no pedal de ACELERADOR até o fundo e solte' },
  { pedal: 'clutch', instruction: 'Pise no pedal de EMBREAGEM até o fundo e solte' },
  { pedal: 'steering', instruction: 'Gire o VOLANTE totalmente para a DIREITA e volte ao centro' },
];

export default function ConfigScreen({ onBack, gpConnected, gpName, pedalConfigs, setPedalConfigs }) {
  const [axes, setAxes] = useState([]);
  const [liveValues, setLiveValues] = useState({ brake: 0, throttle: 0, clutch: 0, steering: 0.5 });
  const [wizardStep, setWizardStep] = useState(-1);
  const [wizardPhase, setWizardPhase] = useState('idle');
  const [manualMode, setManualMode] = useState(false);
  const phaseRef = useRef('idle'); const baselineRef = useRef([]);

  useEffect(() => {
    const iv = setInterval(() => {
      const a = readAllAxes(); setAxes(a);
      setLiveValues({ brake: readPedal(pedalConfigs.brake), throttle: readPedal(pedalConfigs.throttle), clutch: readPedal(pedalConfigs.clutch), steering: readSteering(pedalConfigs.steering) });
    }, 30);
    return () => clearInterval(iv);
  }, [pedalConfigs]);

  const runWizardStep = useCallback((stepIdx) => {
    const baseline = readAllAxes(); baselineRef.current = baseline;
    setWizardPhase('waiting_press'); phaseRef.current = 'waiting_press';
    const pedalKey = WIZARD_STEPS[stepIdx].pedal;
    let maxDelta = 0, detectedAxis = -1, pressedMin = Infinity, pressedMax = -Infinity;
    const pollIv = setInterval(() => {
      const current = readAllAxes();
      const det = detectMovedAxis(baselineRef.current, current);
      if (phaseRef.current === 'waiting_press' && det.delta > 0.3) {
        if (det.delta > maxDelta) { maxDelta = det.delta; detectedAxis = det.index; }
        if (detectedAxis >= 0) { const v = current[detectedAxis]; pressedMin = Math.min(pressedMin, v); pressedMax = Math.max(pressedMax, v); }
      }
      if (phaseRef.current === 'waiting_press' && maxDelta > 0.3) {
        const cd = detectedAxis >= 0 ? Math.abs(current[detectedAxis] - baselineRef.current[detectedAxis]) : 0;
        if (cd < 0.15) {
          clearInterval(pollIv); phaseRef.current = 'done'; setWizardPhase('done');
          const releasedVal = baselineRef.current[detectedAxis];
          const pressedVal = Math.abs(pressedMax - releasedVal) > Math.abs(pressedMin - releasedVal) ? pressedMax : pressedMin;
          setPedalConfigs(prev => ({ ...prev, [pedalKey]: { axisIndex: detectedAxis, calibMin: releasedVal, calibMax: pressedVal, invert: pressedVal < releasedVal } }));
          setTimeout(() => {
            if (stepIdx < WIZARD_STEPS.length - 1) { setWizardStep(stepIdx + 1); }
            else { setWizardStep(-1); setWizardPhase('idle'); }
          }, 600);
        }
      }
    }, 30);
    setTimeout(() => clearInterval(pollIv), 15000);
  }, [setPedalConfigs]);

  useEffect(() => { if (wizardStep >= 0 && wizardPhase === 'idle') runWizardStep(wizardStep); }, [wizardStep]);

  const startWizard = () => { setWizardStep(0); setWizardPhase('idle'); phaseRef.current = 'idle'; setManualMode(false); };
  const updateManual = (pedal, field, value) => setPedalConfigs(prev => ({ ...prev, [pedal]: { ...prev[pedal], [field]: value } }));

  return (
    <div style={{ maxWidth: 1100, width: '100%' }}>
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button onClick={onBack} style={btn}>← VOLTAR</button>
        <h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)' }}>Configuração dos pedais</h2>
      </div>

      <div className="animate-in animate-in-delay-1" style={card}>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Status: {gpConnected
            ? <span style={{ color: 'var(--accent-throttle)', fontWeight: 500 }}>{gpName.substring(0, 55)}</span>
            : <span style={{ color: 'var(--accent-brake)' }}>Nenhum dispositivo — conecte via USB e pressione um botão</span>}
        </p>
        {gpConnected && axes.length > 0 && (
          <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: 4 }}>
            {axes.length} eixos · [{axes.map(a => a.toFixed(2)).join(', ')}]
          </p>
        )}
      </div>

      {gpConnected && <>
        {wizardStep === -1 ? (
          <div className="animate-in animate-in-delay-2" style={card}>
            <p style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: 6 }}>Assistente de detecção</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              Pise em cada pedal individualmente para mapear os eixos automaticamente.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={startWizard} style={{
                padding: '8px 20px', fontSize: 13, borderRadius: 10, fontWeight: 600, fontFamily: 'var(--font-display)',
                border: '1px solid var(--accent-throttle)', background: 'var(--accent-throttle-glow)', color: 'var(--accent-throttle)', cursor: 'pointer',
              }}>INICIAR DETECÇÃO</button>
              <button onClick={() => setManualMode(!manualMode)} style={btn}>{manualMode ? 'Ocultar manual' : 'Manual'}</button>
            </div>
          </div>
        ) : (
          <div style={{ ...card, border: `1px solid ${COLORS[WIZARD_STEPS[wizardStep]?.pedal]}40` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>PASSO {wizardStep + 1}/{WIZARD_STEPS.length}</span>
              <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', color: COLORS[WIZARD_STEPS[wizardStep].pedal] }}>
                {LABELS[WIZARD_STEPS[wizardStep].pedal]}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>{WIZARD_STEPS[wizardStep].instruction}</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '3px 10px', borderRadius: 6,
                background: wizardPhase === 'done' ? 'var(--accent-throttle-glow)' : 'var(--accent-clutch-glow)',
                color: wizardPhase === 'done' ? 'var(--accent-throttle)' : 'var(--accent-clutch)' }}>
                {wizardPhase === 'waiting_press' ? 'AGUARDANDO...' : wizardPhase === 'done' ? 'DETECTADO' : '...'}
              </span>
              <button onClick={() => { setWizardStep(-1); setWizardPhase('idle'); }} style={{ ...btn, fontSize: 11 }}>Cancelar</button>
            </div>
          </div>
        )}

        {manualMode && wizardStep === -1 && ['brake', 'throttle', 'clutch', 'steering'].map(pedal => (
          <div key={pedal} style={card}>
            <p style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: 8, color: COLORS[pedal] }}>{LABELS[pedal]}</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
              <select value={pedalConfigs[pedal].axisIndex} onChange={e => updateManual(pedal, 'axisIndex', Number(e.target.value))}>
                {Array.from({ length: Math.max(6, axes.length) }, (_, i) => (
                  <option key={i} value={i}>Eixo {i} {axes[i] !== undefined ? `(${axes[i].toFixed(3)})` : ''}</option>
                ))}
              </select>
              <label style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={pedalConfigs[pedal].invert} onChange={e => updateManual(pedal, 'invert', e.target.checked)} /> Inverter
              </label>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => { if (axes[pedalConfigs[pedal].axisIndex] !== undefined) updateManual(pedal, 'calibMin', axes[pedalConfigs[pedal].axisIndex]); }} style={{ ...btn, fontSize: 11, padding: '4px 10px' }}>Solto ({pedalConfigs[pedal].calibMin.toFixed(2)})</button>
              <button onClick={() => { if (axes[pedalConfigs[pedal].axisIndex] !== undefined) updateManual(pedal, 'calibMax', axes[pedalConfigs[pedal].axisIndex]); }} style={{ ...btn, fontSize: 11, padding: '4px 10px' }}>Fundo ({pedalConfigs[pedal].calibMax.toFixed(2)})</button>
            </div>
          </div>
        ))}

        {/* Live validation */}
        <div className="animate-in animate-in-delay-3" style={{ ...card, marginTop: 4 }}>
          <p style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: 12 }}>Validação ao vivo</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <PedalBar value={liveValues.brake} label="FREIO" type="brake" showGlow />
            <PedalBar value={liveValues.throttle} label="ACEL" type="throttle" showGlow />
            <PedalBar value={liveValues.clutch} label="EMBR" type="clutch" showGlow />
            <PedalBar value={liveValues.steering} label="VOLANTE" type="steering" showGlow />
          </div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 10 }}>
            Cada barra deve responder APENAS ao controle correto. O volante deve ficar em ~50% no centro.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            {['brake', 'throttle', 'clutch', 'steering'].map(p => (
              <span key={p}>{LABELS[p]}: eixo {pedalConfigs[p].axisIndex}{pedalConfigs[p].invert ? ' (inv)' : ''}</span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--accent-throttle)', display: 'flex', alignItems: 'center', gap: 4 }}>
              ● Configuração salva automaticamente
            </span>
          </div>
        </div>
      </>}
    </div>
  );
}
