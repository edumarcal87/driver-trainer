import React, { useState, useEffect, useRef } from 'react';
import { readAllAxes, readAllButtons, readPedal, readSteering, readShifterButtons, readHShifterGear } from '../utils/gamepad';
import { WHEEL_PROFILES, detectWheelProfile, getWheelShifterConfig } from '../utils/wheelProfiles';

const btn = { padding: '6px 14px', fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)' };
const card = { padding: '16px 18px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: 12 };

/**
 * Virtual Gamepad — injects a fake gamepad into the browser's Gamepad API.
 * This allows testing wheel profiles without physical hardware.
 */
class VirtualGamepad {
  constructor(profileId) {
    this.profile = WHEEL_PROFILES.find(p => p.id === profileId) || WHEEL_PROFILES[0];
    this.axes = new Array(8).fill(0);
    this.buttons = new Array(20).fill(null).map(() => ({ pressed: false, value: 0 }));
    this.id = `Virtual ${this.profile.brand} ${this.profile.model} (Simulated)`;
    this.connected = true;
    this.timestamp = Date.now();
    this.index = 0;
    this.mapping = '';

    // Set pedal axes to "released" positions based on profile defaults
    const cfg = this.profile.defaultConfig;
    if (cfg.brake.calibMin === 1) this.axes[cfg.brake.axisIndex] = 1;
    if (cfg.throttle.calibMin === 1) this.axes[cfg.throttle.axisIndex] = 1;
    if (cfg.clutch.axisIndex >= 0 && cfg.clutch.calibMin === 1) this.axes[cfg.clutch.axisIndex] = 1;
    // Steering at center
    this.axes[cfg.steering.axisIndex] = 0;
  }

  setAxis(index, value) {
    if (index >= 0 && index < this.axes.length) {
      this.axes[index] = value;
      this.timestamp = Date.now();
    }
  }

  pressButton(index) {
    if (index >= 0 && index < this.buttons.length) {
      this.buttons[index] = { pressed: true, value: 1 };
      this.timestamp = Date.now();
    }
  }

  releaseButton(index) {
    if (index >= 0 && index < this.buttons.length) {
      this.buttons[index] = { pressed: false, value: 0 };
      this.timestamp = Date.now();
    }
  }
}

let virtualGP = null;
const originalGetGamepads = navigator.getGamepads.bind(navigator);

function enableVirtualGamepad(profileId) {
  virtualGP = new VirtualGamepad(profileId);
  navigator.getGamepads = () => {
    const real = originalGetGamepads();
    const result = [...real];
    // Put virtual at index 0 if no real gamepad
    const emptySlot = result.findIndex(g => !g);
    if (emptySlot >= 0) {
      result[emptySlot] = virtualGP;
    } else {
      result.push(virtualGP);
    }
    return result;
  };
  // Fire gamepadconnected event
  window.dispatchEvent(new CustomEvent('gamepadconnected', { detail: { gamepad: virtualGP } }));
  return virtualGP;
}

function disableVirtualGamepad() {
  if (virtualGP) {
    window.dispatchEvent(new CustomEvent('gamepaddisconnected', { detail: { gamepad: virtualGP } }));
    virtualGP = null;
    navigator.getGamepads = originalGetGamepads;
  }
}

export default function GamepadDiagnostics({ onBack, pedalConfigs }) {
  const [mode, setMode] = useState('live'); // live | virtual
  const [axes, setAxes] = useState([]);
  const [buttons, setButtons] = useState([]);
  const [gpId, setGpId] = useState('');
  const [detectedProfile, setDetectedProfile] = useState(null);
  const [virtualProfileId, setVirtualProfileId] = useState('logitech_g29');
  const [virtualActive, setVirtualActive] = useState(false);
  const [parsedInputs, setParsedInputs] = useState({ brake: 0, throttle: 0, clutch: 0, steering: 0.5 });
  const [shifterState, setShifterState] = useState({ upshift: false, downshift: false, gear: 0 });
  const afRef = useRef(null);

  // Poll loop
  useEffect(() => {
    const poll = () => {
      const gamepads = navigator.getGamepads();
      for (const gp of gamepads) {
        if (!gp) continue;
        setAxes([...gp.axes]);
        setButtons(gp.buttons.map((b, i) => ({ index: i, pressed: b.pressed, value: b.value.toFixed(2) })));
        setGpId(gp.id);
        setDetectedProfile(detectWheelProfile(gp.id));

        // Parse with current config
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
      afRef.current = requestAnimationFrame(poll);
    };
    afRef.current = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(afRef.current);
  }, [pedalConfigs]);

  const activateVirtual = () => {
    const gp = enableVirtualGamepad(virtualProfileId);
    setVirtualActive(true);
    setGpId(gp.id);
    setDetectedProfile(detectWheelProfile(gp.id));
  };

  const deactivateVirtual = () => {
    disableVirtualGamepad();
    setVirtualActive(false);
    setGpId('');
    setDetectedProfile(null);
  };

  // Virtual control helpers
  const setVirtualAxis = (idx, val) => {
    if (virtualGP) virtualGP.setAxis(idx, parseFloat(val));
  };

  const tapVirtualButton = (idx) => {
    if (!virtualGP) return;
    virtualGP.pressButton(idx);
    setTimeout(() => virtualGP.releaseButton(idx), 150);
  };

  const profile = WHEEL_PROFILES.find(p => p.id === virtualProfileId);

  return (
    <div style={{ maxWidth: 720, width: '100%' }}>
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
        <button onClick={onBack} style={btn}>← VOLTAR</button>
        <h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)', flex: 1 }}>Diagnóstico de Gamepad</h2>
      </div>

      {/* Mode tabs */}
      <div className="animate-in" style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
        {[
          { key: 'live', label: '📡 Dispositivo Real', desc: 'Leitura ao vivo do hardware conectado' },
          { key: 'virtual', label: '🎮 Simulador Virtual', desc: 'Emula qualquer volante sem hardware' },
        ].map(m => (
          <button key={m.key} onClick={() => setMode(m.key)} style={{
            ...btn, flex: 1, textAlign: 'center', padding: '12px',
            borderColor: mode === m.key ? '#2980b9' : 'var(--border)',
            background: mode === m.key ? '#2980b912' : 'transparent',
            color: mode === m.key ? '#2980b9' : 'var(--text-muted)',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</div>
            <div style={{ fontSize: 10, marginTop: 2, opacity: 0.7 }}>{m.desc}</div>
          </button>
        ))}
      </div>

      {/* ── Virtual mode ── */}
      {mode === 'virtual' && (
        <div className="animate-in">
          <div style={card}>
            <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px', marginBottom: 10 }}>SELECIONAR VOLANTE VIRTUAL</p>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
              {WHEEL_PROFILES.map(p => (
                <button key={p.id} onClick={() => { if (virtualActive) deactivateVirtual(); setVirtualProfileId(p.id); }}
                  style={{
                    ...btn, fontSize: 10, padding: '6px 10px',
                    borderColor: virtualProfileId === p.id ? '#2980b9' : 'var(--border)',
                    background: virtualProfileId === p.id ? '#2980b912' : 'transparent',
                    color: virtualProfileId === p.id ? '#2980b9' : 'var(--text-muted)',
                  }}>
                  {p.icon} {p.brand} {p.model.split(' / ')[0]}
                </button>
              ))}
            </div>

            {profile && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, padding: '8px 12px', background: 'var(--bg-inset)', borderRadius: 8 }}>
                <strong>{profile.brand} {profile.model}</strong><br />
                {profile.notes}
              </div>
            )}

            <button onClick={virtualActive ? deactivateVirtual : activateVirtual} style={{
              ...btn, width: '100%', textAlign: 'center', padding: '10px',
              borderColor: virtualActive ? '#e74c3c' : '#27ae60',
              background: virtualActive ? '#e74c3c12' : '#27ae6012',
              color: virtualActive ? '#e74c3c' : '#27ae60',
              fontWeight: 700,
            }}>
              {virtualActive ? '⏹ DESATIVAR VIRTUAL' : '▶ ATIVAR GAMEPAD VIRTUAL'}
            </button>
          </div>

          {/* Virtual controls */}
          {virtualActive && profile && (
            <div style={card}>
              <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px', marginBottom: 12 }}>CONTROLES VIRTUAIS</p>

              {/* Pedal sliders */}
              {['brake', 'throttle', 'clutch', 'steering'].map(pedal => {
                const cfg = profile.defaultConfig[pedal];
                if (cfg.axisIndex < 0) return null;
                const label = { brake: 'Freio', throttle: 'Acelerador', clutch: 'Embreagem', steering: 'Volante' }[pedal];
                const color = { brake: '#e74c3c', throttle: '#27ae60', clutch: '#f39c12', steering: '#2980b9' }[pedal];
                const isSteering = pedal === 'steering';
                return (
                  <div key={pedal} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color }}>{label}</span>
                      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        Eixo {cfg.axisIndex}: {axes[cfg.axisIndex]?.toFixed(3) || '0.000'}
                      </span>
                    </div>
                    <input type="range"
                      min={isSteering ? -1 : cfg.calibMin === 1 ? -1 : 0}
                      max={isSteering ? 1 : cfg.calibMin === 1 ? 1 : 1}
                      step="0.01"
                      defaultValue={isSteering ? 0 : (cfg.calibMin === 1 ? 1 : 0)}
                      onChange={e => setVirtualAxis(cfg.axisIndex, e.target.value)}
                      style={{ width: '100%', accentColor: color }}
                    />
                  </div>
                );
              })}

              {/* Shifter buttons */}
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px', width: '100%' }}>BOTÕES DO CÂMBIO</p>
                {profile.shifter.upshift >= 0 && (
                  <button onMouseDown={() => virtualGP?.pressButton(profile.shifter.upshift)}
                    onMouseUp={() => virtualGP?.releaseButton(profile.shifter.upshift)}
                    onMouseLeave={() => virtualGP?.releaseButton(profile.shifter.upshift)}
                    style={{ ...btn, padding: '8px 16px', fontSize: 11, fontWeight: 600, color: '#00bcd4', borderColor: '#00bcd440' }}>
                    ⬆ Upshift (btn {profile.shifter.upshift})
                  </button>
                )}
                {profile.shifter.downshift >= 0 && (
                  <button onMouseDown={() => virtualGP?.pressButton(profile.shifter.downshift)}
                    onMouseUp={() => virtualGP?.releaseButton(profile.shifter.downshift)}
                    onMouseLeave={() => virtualGP?.releaseButton(profile.shifter.downshift)}
                    style={{ ...btn, padding: '8px 16px', fontSize: 11, fontWeight: 600, color: '#00bcd4', borderColor: '#00bcd440' }}>
                    ⬇ Downshift (btn {profile.shifter.downshift})
                  </button>
                )}
                {profile.shifter.hShifterBase >= 0 && [1, 2, 3, 4, 5, 6].map(g => (
                  <button key={g} onClick={() => tapVirtualButton(profile.shifter.hShifterBase + g - 1)}
                    style={{ ...btn, padding: '6px 12px', fontSize: 11, fontWeight: 600, minWidth: 40 }}>
                    {g}ª
                  </button>
                ))}
              </div>

              {/* Other buttons */}
              <div style={{ display: 'flex', gap: 4, marginTop: 12, flexWrap: 'wrap' }}>
                <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px', width: '100%' }}>OUTROS BOTÕES</p>
                {Array.from({ length: 12 }, (_, i) => (
                  <button key={i} onClick={() => tapVirtualButton(i)}
                    style={{ ...btn, padding: '4px 8px', fontSize: 9, minWidth: 32, color: buttons[i]?.pressed ? '#27ae60' : 'var(--text-muted)' }}>
                    {i}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Connection info ── */}
      <div className="animate-in" style={card}>
        <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px', marginBottom: 8 }}>DISPOSITIVO</p>
        {gpId ? (
          <>
            <p style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 4 }}>
              {detectedProfile ? `${detectedProfile.icon} ${detectedProfile.brand} ${detectedProfile.model}` : '❓ Volante desconhecido'}
            </p>
            <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{gpId}</p>
            {detectedProfile?.notes && (
              <p style={{ fontSize: 10, color: '#2980b9', marginTop: 6 }}>ℹ️ {detectedProfile.notes}</p>
            )}
          </>
        ) : (
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nenhum gamepad conectado. {mode === 'virtual' ? 'Ative o simulador acima.' : 'Conecte um volante.'}</p>
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
          <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px', marginBottom: 10 }}>INPUTS PROCESSADOS (com calibração)</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { label: 'Freio', value: parsedInputs.brake, color: '#e74c3c' },
              { label: 'Acelerador', value: parsedInputs.throttle, color: '#27ae60' },
              { label: 'Embreagem', value: parsedInputs.clutch, color: '#f39c12' },
              { label: 'Volante', value: parsedInputs.steering, color: '#2980b9', center: true },
            ].map(inp => (
              <div key={inp.label} style={{ textAlign: 'center' }}>
                <div style={{
                  height: 60, width: '100%', background: 'var(--bg-inset)', borderRadius: 8, border: '1px solid var(--border)',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: `${(inp.center ? Math.abs(inp.value - 0.5) * 2 : inp.value) * 100}%`,
                    background: inp.color + '30', borderTop: `2px solid ${inp.color}`,
                    transition: 'height 0.05s',
                  }} />
                  <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', color: inp.color }}>
                    {Math.round(inp.value * 100)}%
                  </span>
                </div>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>{inp.label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'center' }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: shifterState.upshift ? '#27ae60' : 'var(--text-muted)' }}>
              ⬆ UP {shifterState.upshift ? '●' : '○'}
            </span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: shifterState.downshift ? '#27ae60' : 'var(--text-muted)' }}>
              ⬇ DOWN {shifterState.downshift ? '●' : '○'}
            </span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: shifterState.gear > 0 ? '#00bcd4' : 'var(--text-muted)' }}>
              H-Gear: {shifterState.gear > 0 ? `${shifterState.gear}ª` : shifterState.gear < 0 ? 'R' : 'N'}
            </span>
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
                width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', fontSize: 10, fontFamily: 'var(--font-mono)',
                background: b.pressed ? '#27ae6020' : 'var(--bg-inset)',
                border: `1.5px solid ${b.pressed ? '#27ae60' : 'var(--border)'}`,
                color: b.pressed ? '#27ae60' : 'var(--text-muted)',
                fontWeight: b.pressed ? 700 : 400,
                transition: 'all 0.1s',
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
