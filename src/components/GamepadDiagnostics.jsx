import React, { useState, useEffect, useRef } from 'react';
import { readAllAxes, readAllButtons, readPedal, readSteering, readShifterButtons, readHShifterGear } from '../utils/gamepad';
import { WHEEL_PROFILES, detectWheelProfile, getWheelShifterConfig } from '../utils/wheelProfiles';
import {
  activateVirtualGamepad, deactivateVirtualGamepad, isVirtualActive, getVirtualProfileId,
  setVirtualAxis, setVirtualPedal, pressVirtualButton, releaseVirtualButton, tapVirtualButton,
  getVirtualState,
} from '../utils/virtualGamepad';

const btn = { padding: '6px 14px', fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)' };
const card = { padding: '16px 18px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: 12 };

export default function GamepadDiagnostics({ onBack, pedalConfigs }) {
  const [mode, setMode] = useState(isVirtualActive() ? 'virtual' : 'live');
  const [axes, setAxes] = useState([]);
  const [buttons, setButtons] = useState([]);
  const [gpId, setGpId] = useState('');
  const [detectedProfile, setDetectedProfile] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(getVirtualProfileId() || 'logitech_g29');
  const [virtualActive, setVirtualActive] = useState(isVirtualActive());
  const [parsedInputs, setParsedInputs] = useState({ brake: 0, throttle: 0, clutch: 0, steering: 0.5 });
  const [shifterState, setShifterState] = useState({ upshift: false, downshift: false, gear: 0 });
  const afRef = useRef(null);

  // Poll loop — reads from navigator.getGamepads() which is patched when virtual is active
  useEffect(() => {
    const poll = () => {
      const gamepads = navigator.getGamepads();
      let found = false;
      for (const gp of gamepads) {
        if (!gp) continue;
        found = true;
        setAxes([...gp.axes]);
        setButtons(gp.buttons.map((b, i) => ({ index: i, pressed: b.pressed, value: b.value })));
        setGpId(gp.id);
        setDetectedProfile(detectWheelProfile(gp.id));

        if (pedalConfigs) {
          setParsedInputs({
            brake: readPedal(pedalConfigs.brake),
            throttle: readPedal(pedalConfigs.throttle),
            clutch: readPedal(pedalConfigs.clutch),
            steering: readSteering(pedalConfigs.steering),
          });
          const sc = getWheelShifterConfig(gp.id);
          setShifterState({
            upshift: readShifterButtons(sc).upshift,
            downshift: readShifterButtons(sc).downshift,
            gear: readHShifterGear(sc),
          });
        }
        break;
      }
      if (!found) {
        setAxes([]);
        setButtons([]);
        setGpId('');
        setDetectedProfile(null);
      }
      afRef.current = requestAnimationFrame(poll);
    };
    afRef.current = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(afRef.current);
  }, [pedalConfigs]);

  const handleActivate = () => {
    activateVirtualGamepad(selectedProfile);
    setVirtualActive(true);
  };

  const handleDeactivate = () => {
    deactivateVirtualGamepad();
    setVirtualActive(false);
    setGpId('');
  };

  const profile = WHEEL_PROFILES.find(p => p.id === selectedProfile);

  return (
    <div style={{ maxWidth: 1100, width: '100%' }}>
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
        <button onClick={() => { onBack(); }} style={btn}>← VOLTAR</button>
        <h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)', flex: 1 }}>Diagnóstico de Gamepad</h2>
        {virtualActive && (
          <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 12, background: '#f39c1215', border: '1px solid #f39c1230', color: '#f39c12', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            🎮 VIRTUAL ATIVO
          </span>
        )}
      </div>

      {/* Mode tabs */}
      <div className="animate-in" style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
        {[
          { key: 'live', label: '📡 Dispositivo Real' },
          { key: 'virtual', label: '🎮 Simulador Virtual' },
        ].map(m => (
          <button key={m.key} onClick={() => setMode(m.key)} style={{
            ...btn, flex: 1, textAlign: 'center', padding: '10px',
            borderColor: mode === m.key ? '#2980b9' : 'var(--border)',
            background: mode === m.key ? '#2980b912' : 'transparent',
            color: mode === m.key ? '#2980b9' : 'var(--text-muted)',
            fontWeight: mode === m.key ? 700 : 500,
          }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Virtual mode ── */}
      {mode === 'virtual' && (
        <div className="animate-in">
          {/* Profile selector */}
          <div style={card}>
            <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px', marginBottom: 10 }}>SELECIONAR VOLANTE</p>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
              {WHEEL_PROFILES.map(p => (
                <button key={p.id} onClick={() => { if (virtualActive) handleDeactivate(); setSelectedProfile(p.id); }}
                  style={{
                    ...btn, fontSize: 10, padding: '5px 10px',
                    borderColor: selectedProfile === p.id ? '#2980b9' : 'var(--border)',
                    background: selectedProfile === p.id ? '#2980b912' : 'transparent',
                    color: selectedProfile === p.id ? '#2980b9' : 'var(--text-muted)',
                    fontWeight: selectedProfile === p.id ? 700 : 400,
                  }}>
                  {p.icon} {p.model.split(' / ')[0]}
                </button>
              ))}
            </div>

            {profile && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, padding: '8px 12px', background: 'var(--bg-inset)', borderRadius: 8 }}>
                <strong style={{ color: 'var(--text-primary)' }}>{profile.brand} {profile.model}</strong>
                <p style={{ marginTop: 4, fontSize: 10 }}>{profile.notes}</p>
                <p style={{ marginTop: 4, fontSize: 10, color: '#2980b9' }}>
                  Freio: eixo {profile.defaultConfig.brake.axisIndex} · Acel: eixo {profile.defaultConfig.throttle.axisIndex}
                  {profile.defaultConfig.clutch.axisIndex >= 0 ? ` · Embr: eixo ${profile.defaultConfig.clutch.axisIndex}` : ' · Sem embreagem'}
                  · Volante: eixo {profile.defaultConfig.steering.axisIndex}
                  · Paddles: {profile.shifter.upshift}/{profile.shifter.downshift}
                </p>
              </div>
            )}

            <button onClick={virtualActive ? handleDeactivate : handleActivate} style={{
              ...btn, width: '100%', textAlign: 'center', padding: '10px',
              borderColor: virtualActive ? '#e74c3c' : '#27ae60',
              background: virtualActive ? '#e74c3c12' : '#27ae6012',
              color: virtualActive ? '#e74c3c' : '#27ae60',
              fontWeight: 700, fontSize: 13,
            }}>
              {virtualActive ? '⏹ DESATIVAR SIMULADOR' : '▶ ATIVAR SIMULADOR VIRTUAL'}
            </button>
          </div>

          {/* Virtual controls */}
          {virtualActive && profile && (
            <div style={card}>
              <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px', marginBottom: 6 }}>CONTROLES VIRTUAIS</p>
              <p style={{ fontSize: 10, color: '#2980b9', marginBottom: 12 }}>
                Use os controles abaixo, depois volte à tela inicial para treinar. O simulador permanece ativo.
              </p>

              {/* Pedal sliders */}
              {[
                { key: 'brake', label: 'FREIO', color: '#e74c3c' },
                { key: 'throttle', label: 'ACELERADOR', color: '#27ae60' },
                { key: 'clutch', label: 'EMBREAGEM', color: '#f39c12' },
                { key: 'steering', label: 'VOLANTE', color: '#2980b9' },
              ].map(pedal => {
                const cfg = profile.defaultConfig[pedal.key];
                if (cfg.axisIndex < 0) return null;
                const isSteering = pedal.key === 'steering';
                return (
                  <div key={pedal.key} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: pedal.color, fontFamily: 'var(--font-condensed)', letterSpacing: '.3px' }}>{pedal.label}</span>
                      <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: pedal.color }}>
                        {Math.round(parsedInputs[pedal.key] * 100)}%
                      </span>
                    </div>
                    <input type="range"
                      min="0" max="1" step="0.01"
                      value={isSteering ? parsedInputs.steering : parsedInputs[pedal.key]}
                      onChange={e => setVirtualPedal(pedal.key, parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: pedal.color, height: 24, cursor: 'pointer' }}
                    />
                    {isSteering && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                        <span>← ESQUERDA</span><span>CENTRO</span><span>DIREITA →</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Shifter buttons */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px', marginBottom: 8 }}>CÂMBIO</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {profile.shifter.upshift >= 0 && (
                    <button
                      onMouseDown={() => pressVirtualButton(profile.shifter.upshift)}
                      onMouseUp={() => releaseVirtualButton(profile.shifter.upshift)}
                      onMouseLeave={() => releaseVirtualButton(profile.shifter.upshift)}
                      onTouchStart={() => pressVirtualButton(profile.shifter.upshift)}
                      onTouchEnd={() => releaseVirtualButton(profile.shifter.upshift)}
                      style={{
                        ...btn, padding: '10px 20px', fontSize: 12, fontWeight: 700,
                        color: shifterState.upshift ? '#fff' : '#00bcd4',
                        background: shifterState.upshift ? '#00bcd4' : 'transparent',
                        borderColor: '#00bcd4',
                        transition: 'all 0.1s',
                      }}>
                      ⬆ SUBIR MARCHA
                    </button>
                  )}
                  {profile.shifter.downshift >= 0 && (
                    <button
                      onMouseDown={() => pressVirtualButton(profile.shifter.downshift)}
                      onMouseUp={() => releaseVirtualButton(profile.shifter.downshift)}
                      onMouseLeave={() => releaseVirtualButton(profile.shifter.downshift)}
                      onTouchStart={() => pressVirtualButton(profile.shifter.downshift)}
                      onTouchEnd={() => releaseVirtualButton(profile.shifter.downshift)}
                      style={{
                        ...btn, padding: '10px 20px', fontSize: 12, fontWeight: 700,
                        color: shifterState.downshift ? '#fff' : '#5c6bc0',
                        background: shifterState.downshift ? '#5c6bc0' : 'transparent',
                        borderColor: '#5c6bc0',
                        transition: 'all 0.1s',
                      }}>
                      ⬇ DESCER MARCHA
                    </button>
                  )}
                </div>

                {profile.shifter.hShifterBase >= 0 && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-condensed)', alignSelf: 'center', marginRight: 4 }}>H-PATTERN:</span>
                    {[1, 2, 3, 4, 5, 6].map(g => {
                      const bIdx = profile.shifter.hShifterBase + g - 1;
                      const active = shifterState.gear === g;
                      return (
                        <button key={g}
                          onMouseDown={() => pressVirtualButton(bIdx)}
                          onMouseUp={() => releaseVirtualButton(bIdx)}
                          onMouseLeave={() => releaseVirtualButton(bIdx)}
                          style={{
                            ...btn, padding: '8px 14px', fontSize: 13, fontWeight: 700, minWidth: 40, textAlign: 'center',
                            color: active ? '#fff' : 'var(--text-secondary)',
                            background: active ? '#5c6bc0' : 'transparent',
                            borderColor: active ? '#5c6bc0' : 'var(--border)',
                          }}>
                          {g}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: shifterState.gear > 0 ? '#5c6bc0' : 'var(--text-muted)', fontWeight: 700 }}>
                    Marcha: {shifterState.gear > 0 ? `${shifterState.gear}ª` : shifterState.gear < 0 ? 'R' : 'N'}
                  </span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: shifterState.upshift ? '#27ae60' : 'var(--text-muted)' }}>
                    UP {shifterState.upshift ? '●' : '○'}
                  </span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: shifterState.downshift ? '#27ae60' : 'var(--text-muted)' }}>
                    DOWN {shifterState.downshift ? '●' : '○'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Device info ── */}
      <div className="animate-in" style={card}>
        <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px', marginBottom: 8 }}>DISPOSITIVO DETECTADO</p>
        {gpId ? (
          <>
            <p style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 4 }}>
              {detectedProfile ? `${detectedProfile.icon} ${detectedProfile.brand} ${detectedProfile.model}` : '❓ Volante desconhecido'}
            </p>
            <p style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{gpId}</p>
          </>
        ) : (
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Nenhum gamepad detectado. {mode === 'virtual' ? 'Ative o simulador acima.' : 'Conecte um volante USB.'}
          </p>
        )}
      </div>

      {/* ── Raw axes ── */}
      {axes.length > 0 && (
        <div className="animate-in" style={card}>
          <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px', marginBottom: 10 }}>EIXOS RAW ({axes.length})</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {axes.map((val, i) => (
              <div key={i} style={{ padding: '8px 10px', background: 'var(--bg-inset)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-condensed)' }}>Eixo {i}</span>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: Math.abs(val) > 0.05 ? '#e74c3c' : 'var(--text-muted)' }}>{val.toFixed(4)}</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-deep)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '50%', top: 0, width: 1, height: '100%', background: 'var(--border)' }} />
                  <div style={{
                    position: 'absolute', top: 0, height: '100%', borderRadius: 3,
                    background: '#2980b9',
                    left: val >= 0 ? '50%' : `${50 + val * 50}%`,
                    width: `${Math.abs(val) * 50}%`,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Parsed inputs ── */}
      {gpId && (
        <div className="animate-in" style={card}>
          <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px', marginBottom: 10 }}>INPUTS PROCESSADOS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { label: 'Freio', value: parsedInputs.brake, color: '#e74c3c' },
              { label: 'Acel', value: parsedInputs.throttle, color: '#27ae60' },
              { label: 'Embr', value: parsedInputs.clutch, color: '#f39c12' },
              { label: 'Volante', value: parsedInputs.steering, color: '#2980b9' },
            ].map(inp => (
              <div key={inp.label} style={{ textAlign: 'center' }}>
                <div style={{
                  height: 56, background: 'var(--bg-inset)', borderRadius: 8, border: '1px solid var(--border)',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: `${inp.value * 100}%`,
                    background: inp.color + '25', borderTop: `2px solid ${inp.color}`,
                  }} />
                  <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', color: inp.color }}>
                    {Math.round(inp.value * 100)}
                  </span>
                </div>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>{inp.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Raw buttons ── */}
      {buttons.length > 0 && (
        <div className="animate-in" style={card}>
          <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px', marginBottom: 10 }}>BOTÕES ({buttons.length})</p>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {buttons.map(b => (
              <div key={b.index} style={{
                width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontFamily: 'var(--font-mono)',
                background: b.pressed ? '#27ae6020' : 'var(--bg-inset)',
                border: `1.5px solid ${b.pressed ? '#27ae60' : 'var(--border)'}`,
                color: b.pressed ? '#27ae60' : 'var(--text-muted)',
                fontWeight: b.pressed ? 700 : 400,
              }}>
                {b.index}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
