import React, { useState, useRef, useCallback } from 'react';
import { parseCSV, splitByLap, getLapSummary, detectBrakeZones, detectThrottleZones, detectCombinedZones, zoneToExercise, throttleZoneToExercise, combinedZoneToExercise } from '../utils/telemetry';

const btn = { padding: '6px 14px', fontSize: 11, borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-condensed)', fontWeight: 600 };

const SIM_GUIDES = {
  'iRacing': 'Exporte telemetria via Mu (ibt → CSV) ou Garage61. Colunas: Brake, Throttle, Speed, LapDistPct.',
  'ACC': 'Use MoTeC i2 para exportar CSV com a workspace base_ACC. Canais: Brake, Throttle, Speed, Gear.',
  'Assetto Corsa': 'Use Telemetrick (app Lua) para exportar CSV. Colunas: Brake, Throttle, Steering, NormalizedTrackPos.',
  'rFactor2 / LMU / AMS2': 'Use MoTeC i2 com o plugin rF2 ou exporte via Second Monitor. Colunas: Brake, Throttle, vCar.',
  'Desconhecido': 'CSV genérico aceito. Precisa de pelo menos uma coluna "Brake" ou "Brake%".',
};

const SUPPORTED_SIMS = [
  { name: 'iRacing', icon: '🏁', color: '#2980b9' },
  { name: 'ACC', icon: '🏎️', color: '#e74c3c' },
  { name: 'Assetto Corsa', icon: '🔧', color: '#27ae60' },
  { name: 'Automobilista 2', icon: '🇧🇷', color: '#f39c12' },
  { name: 'rFactor 2', icon: '🔬', color: '#8e44ad' },
  { name: 'Le Mans Ultimate', icon: '🏆', color: '#e67e22' },
];

export default function TelemetryImportScreen({ onBack, onExercisesCreated }) {
  const [step, setStep] = useState('upload'); // upload | preview | zones | done
  const [parsed, setParsed] = useState(null);
  const [fileName, setFileName] = useState('');
  const [laps, setLaps] = useState({});
  const [lapSummary, setLapSummary] = useState([]);
  const [selectedLap, setSelectedLap] = useState(null);
  const [zones, setZones] = useState({ brake: [], throttle: [], combined: [] });
  const [selectedZones, setSelectedZones] = useState(new Set());
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const handleFile = useCallback((file) => {
    setError(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = parseCSV(e.target.result);
      if (!result) {
        setError('Arquivo não reconhecido. Precisa de pelo menos uma coluna "Brake" ou "Brake%".');
        return;
      }
      setParsed(result);
      const lapData = splitByLap(result.data);
      setLaps(lapData);
      setLapSummary(getLapSummary(lapData));
      setStep('preview');
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const selectLap = (lapNum) => {
    setSelectedLap(lapNum);
    const data = laps[lapNum] || parsed.data;
    const brakeZones = detectBrakeZones(data);
    const throttleZones = detectThrottleZones(data);
    const combinedZones = detectCombinedZones(data);
    setZones({ brake: brakeZones, throttle: throttleZones, combined: combinedZones });
    setSelectedZones(new Set(brakeZones.map((_, i) => `brake_${i}`)));
    setStep('zones');
  };

  const toggleZone = (key) => {
    setSelectedZones(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const createExercises = () => {
    const exercises = [];
    zones.brake.forEach((z, i) => { if (selectedZones.has(`brake_${i}`)) exercises.push(zoneToExercise(z, i)); });
    zones.throttle.forEach((z, i) => { if (selectedZones.has(`throttle_${i}`)) exercises.push(throttleZoneToExercise(z, i)); });
    zones.combined.forEach((z, i) => { if (selectedZones.has(`combined_${i}`)) exercises.push(combinedZoneToExercise(z, i)); });
    onExercisesCreated(exercises, fileName);
    setStep('done');
  };

  // Mini sparkline for a data array
  const MiniChart = ({ data, field, color, width = 160, height = 40 }) => {
    if (!data || data.length < 2) return null;
    const vals = data.map(d => d[field] || 0);
    const max = Math.max(...vals, 0.01);
    const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * width},${height - (v / max) * height}`).join(' ');
    return (
      <svg width={width} height={height} style={{ display: 'block' }}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
      </svg>
    );
  };

  return (
    <div style={{ maxWidth: 1100, width: '100%' }}>
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
        <button onClick={onBack} style={btn}>← VOLTAR</button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)' }}>Importar Telemetria</h2>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Upload de CSV de simuladores reais para criar exercícios baseados na sua pilotagem</p>
        </div>
      </div>

      {/* ── Step 1: Upload ── */}
      {step === 'upload' && (
        <div className="animate-in">
          {/* Supported sims */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {SUPPORTED_SIMS.map(s => (
              <div key={s.name} style={{ padding: '8px 14px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, borderLeft: `3px solid ${s.color}` }}>
                <span style={{ fontSize: 16 }}>{s.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{s.name}</span>
              </div>
            ))}
          </div>

          {/* Drop zone */}
          <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            style={{ padding: '48px 24px', background: 'var(--bg-card)', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', textAlign: 'center', cursor: 'pointer', transition: 'border-color .2s' }}>
            <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <span style={{ fontSize: 36 }}>📂</span>
            <p style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-display)', marginTop: 12 }}>Arraste o arquivo CSV aqui</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>ou clique para selecionar · Aceita .csv, .tsv, .txt</p>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', marginTop: 12, background: '#fde8e6', border: '1px solid #e74c3c20', borderRadius: 10 }}>
              <p style={{ fontSize: 12, color: '#e74c3c' }}>❌ {error}</p>
            </div>
          )}

          <div style={{ marginTop: 16, padding: '14px', background: 'var(--bg-inset)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', marginBottom: 6 }}>COMO EXPORTAR</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Cada simulador exporta telemetria de forma diferente. O mais comum é usar o <strong>MoTeC i2</strong> (gratuito) para abrir os dados e exportar como CSV.
              Para iRacing, use o <strong>Mu</strong> para converter .ibt em CSV. Para ACC/AC, o MoTeC com a workspace dedicada.
              O app aceita qualquer CSV com pelo menos uma coluna de freio (Brake, Brake%, etc).
            </p>
          </div>
        </div>
      )}

      {/* ── Step 2: Preview ── */}
      {step === 'preview' && parsed && (
        <div className="animate-in">
          {/* File info card */}
          <div style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)' }}>📄 {fileName}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {parsed.rowCount.toLocaleString()} amostras · {parsed.columns.length} canais detectados
                </p>
              </div>
              <div style={{ padding: '4px 12px', borderRadius: 8, background: '#2980b910', border: '1px solid #2980b920' }}>
                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#2980b9' }}>{parsed.sim}</span>
              </div>
            </div>

            {/* Detected columns */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {parsed.columns.map(col => (
                <span key={col} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 6, background: col === 'brake' ? '#e74c3c10' : col === 'throttle' ? '#27ae6010' : 'var(--bg-inset)', color: col === 'brake' ? '#e74c3c' : col === 'throttle' ? '#27ae60' : 'var(--text-muted)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {col.toUpperCase()}
                </span>
              ))}
            </div>

            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.4 }}>{SIM_GUIDES[parsed.sim] || SIM_GUIDES['Desconhecido']}</p>
          </div>

          {/* Lap selector */}
          {lapSummary.length > 1 ? (
            <div>
              <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>SELECIONE A VOLTA PARA ANÁLISE</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                {lapSummary.map(lap => (
                  <div key={lap.lap} onClick={() => selectLap(lap.lap)}
                    style={{ padding: '12px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', boxShadow: 'var(--shadow-card)', transition: 'border-color .15s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)' }}>Volta {lap.lap}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{lap.samples} pts</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'var(--text-muted)' }}>
                      <span>🔴 {lap.avgBrake}%</span>
                      <span>🟢 {lap.avgThrottle}%</span>
                      {lap.maxSpeed > 0 && <span>🏎️ {lap.maxSpeed} km/h</span>}
                      <span>📍 {lap.brakeZones} zonas</span>
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <MiniChart data={laps[lap.lap]} field="brake" color="#e74c3c" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Dados sem separação por volta — analisando toda a sessão.</p>
              <button onClick={() => selectLap(Object.keys(laps)[0])} style={{ ...btn, background: 'var(--accent-brake)', color: '#fff', border: '1.5px solid var(--accent-brake)', padding: '10px 24px', fontSize: 13 }}>ANALISAR TELEMETRIA →</button>
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Zone selection ── */}
      {step === 'zones' && (
        <div className="animate-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                {selectedLap !== null ? `Volta ${selectedLap}` : 'Sessão completa'} — Zonas detectadas
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {zones.brake.length} frenagem · {zones.throttle.length} aceleração · {zones.combined.length} combinadas
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setStep('preview')} style={btn}>← Voltar</button>
              <button onClick={createExercises} disabled={selectedZones.size === 0}
                style={{ ...btn, background: selectedZones.size > 0 ? '#27ae60' : 'var(--bg-inset)', color: selectedZones.size > 0 ? '#fff' : 'var(--text-muted)', border: `1.5px solid ${selectedZones.size > 0 ? '#27ae60' : 'var(--border)'}` }}>
                CRIAR {selectedZones.size} EXERCÍCIO{selectedZones.size !== 1 ? 'S' : ''} →
              </button>
            </div>
          </div>

          {/* Zone cards by type */}
          {[
            { key: 'brake', label: 'FRENAGEM', icon: '🔴', color: '#e74c3c', zones: zones.brake },
            { key: 'throttle', label: 'ACELERAÇÃO', icon: '🟢', color: '#27ae60', zones: zones.throttle },
            { key: 'combined', label: 'COMBINADAS (Freio+Acel)', icon: '🟣', color: '#8e44ad', zones: zones.combined },
          ].map(group => group.zones.length > 0 && (
            <div key={group.key} style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: group.color, fontWeight: 600, marginBottom: 6 }}>{group.icon} {group.label}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                {group.zones.map((zone, i) => {
                  const zKey = `${group.key}_${i}`;
                  const selected = selectedZones.has(zKey);
                  return (
                    <div key={zKey} onClick={() => toggleZone(zKey)}
                      style={{ padding: '10px 12px', background: selected ? group.color + '08' : 'var(--bg-card)', border: `1.5px solid ${selected ? group.color + '40' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer', transition: 'all .15s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-display)' }}>Zona {i + 1}</span>
                        <span style={{ fontSize: 14 }}>{selected ? '☑' : '☐'}</span>
                      </div>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {zone.label} · Pico {Math.round((zone.peak || zone.brakePeak || 0) * 100)}%
                      </p>
                      <div style={{ marginTop: 4 }}>
                        <MiniChart data={zone.points} field={group.key === 'throttle' ? 'throttle' : 'brake'} color={group.color} height={30} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {zones.brake.length === 0 && zones.throttle.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 28, marginBottom: 8 }}>🤷</p>
              <p>Nenhuma zona detectada nesta volta. Tente selecionar outra volta com mais atividade.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Step 4: Done ── */}
      {step === 'done' && (
        <div className="animate-in" style={{ textAlign: 'center', padding: '2rem' }}>
          <span style={{ fontSize: 48 }}>✅</span>
          <p style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: 12 }}>Exercícios criados!</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{selectedZones.size} exercício{selectedZones.size !== 1 ? 's' : ''} baseado{selectedZones.size !== 1 ? 's' : ''} na sua telemetria real.</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
            <button onClick={onBack} style={{ ...btn, background: '#27ae60', color: '#fff', border: '1.5px solid #27ae60', padding: '10px 24px', fontSize: 13 }}>IR PARA TREINO →</button>
            <button onClick={() => { setStep('upload'); setParsed(null); }} style={btn}>IMPORTAR OUTRO</button>
          </div>
        </div>
      )}
    </div>
  );
}
