import React, { useState, useRef, useCallback } from 'react';
import { parseCSV, splitByLap, getLapSummary, detectBrakeZones, detectThrottleZones, detectCombinedZones, zoneToExercise, throttleZoneToExercise, combinedZoneToExercise } from '../utils/telemetry';

const btn = { padding: '6px 14px', fontSize: 11, borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-condensed)', fontWeight: 600 };

// ═══════════════════════════════════════
// SIM GUIDES — detailed export instructions
// ═══════════════════════════════════════
const SIM_GUIDES = [
  {
    id: 'iracing', name: 'iRacing', icon: '🏁', color: '#2980b9',
    tool: 'Mu (ibt → MoTeC → CSV)',
    toolUrl: 'https://github.com/patrickmoore/Mu/releases',
    altTool: 'Garage 61',
    altToolUrl: 'https://garage61.net/',
    steps: [
      'Dentro do iRacing, pressione ALT+L para ativar a gravação de telemetria.',
      'Os arquivos .ibt são salvos em Documentos/iRacing/Telemetry.',
      'Instale o Mu — ele converte .ibt para formato MoTeC automaticamente.',
      'Abra o MoTeC i2, carregue o arquivo e exporte como CSV (File → Export → CSV).',
      'Alternativa mais rápida: use o Garage 61 online — faça upload do .ibt e baixe o CSV direto.',
    ],
    columns: 'Brake, Throttle, Speed, Gear, LapDistPct, SessionTime',
  },
  {
    id: 'acc', name: 'Assetto Corsa Competizione', icon: '🏎️', color: '#e74c3c',
    tool: 'MoTeC i2 Pro (gratuito)',
    toolUrl: 'https://www.motec.com.au/i2/i2downloads/',
    steps: [
      'No ACC, vá em Setup do carro → Electronics → Telemetry Laps → Defina para 99.',
      'Faça voltas na pista. O ACC salva automaticamente em Documentos/Assetto Corsa Competizione/MoTeC.',
      'Instale o MoTeC i2 Pro (gratuito para ACC).',
      'Copie a pasta base_ACC de Documentos/ACC/MoTeC/Workspaces para Documentos/MoTeC/i2/Workspaces.',
      'Abra o MoTeC, carregue os dados e exporte como CSV.',
    ],
    columns: 'Brake, Throttle, Speed, Gear, RPMs, SteerAngle',
  },
  {
    id: 'ac', name: 'Assetto Corsa', icon: '🔧', color: '#27ae60',
    tool: 'Telemetrick (app Lua, gratuito)',
    toolUrl: 'https://www.overtake.gg/downloads/assetto-corsa-telemetrick.73265/',
    altTool: 'MoTeC i2 + ACTI',
    steps: [
      'Baixe e instale o Telemetrick (copie a pasta apps/ para o diretório do AC).',
      'Ative o app no jogo e marque "Log" para iniciar a gravação.',
      'O Telemetrick exporta CSV e MoTeC automaticamente ao final de cada stint.',
      'Alternativa: use o ACTI + MoTeC i2 para análise mais avançada.',
    ],
    columns: 'Brake, Throttle, Steering, Speed, Gear, NormalizedTrackPos',
  },
  {
    id: 'ams2', name: 'Automobilista 2', icon: '🇧🇷', color: '#f39c12',
    tool: 'MoTeC i2 + Second Monitor',
    toolUrl: 'https://www.motec.com.au/i2/i2downloads/',
    altTool: 'Second Monitor (gratuito)',
    altToolUrl: 'https://github.com/RiddleTime/SecondMonitor',
    steps: [
      'O AMS2 (baseado no Madness Engine) compartilha memória com apps de telemetria.',
      'Instale o Second Monitor — ele grava dados de sessão automaticamente.',
      'Exporte os dados como CSV pelo Second Monitor.',
      'Alternativa: use o plugin MoTeC para Project Cars/AMS2.',
    ],
    columns: 'Brake, Throttle, Speed, Gear, vCar, SteerWheelAngle',
  },
  {
    id: 'rf2', name: 'rFactor 2', icon: '🔬', color: '#8e44ad',
    tool: 'MoTeC i2 (integração nativa)',
    toolUrl: 'https://www.motec.com.au/i2/i2downloads/',
    steps: [
      'O rFactor 2 suporta MoTeC nativamente — os dados são salvos na pasta MoTeC do jogo.',
      'Ative a telemetria nas opções do jogo.',
      'Abra os arquivos .ld no MoTeC i2 e exporte como CSV.',
    ],
    columns: 'Brake, Throttle, Speed, Gear, vCar, SteerAngle',
  },
  {
    id: 'lmu', name: 'Le Mans Ultimate', icon: '🏆', color: '#e67e22',
    tool: 'MoTeC i2 (integração nativa)',
    toolUrl: 'https://www.motec.com.au/i2/i2downloads/',
    steps: [
      'O LMU (mesmo engine do rFactor 2) suporta MoTeC nativamente.',
      'Dados são salvos em Documentos/Le Mans Ultimate/MoTeC.',
      'Abra no MoTeC i2 e exporte como CSV.',
    ],
    columns: 'Brake, Throttle, Speed, Gear, vCar',
  },
  {
    id: 'f125', name: 'EA Sports F1 25', icon: '🏎️', color: '#e71c24',
    tool: 'Sim Racing Telemetry (SRT)',
    toolUrl: 'https://www.simracingtelemetry.com/',
    altTool: 'Telemetry Tool (gratuito)',
    altToolUrl: 'https://telemetrytool.com/',
    steps: [
      'No F1 25, vá em Configurações → Telemetria → Ative "UDP Telemetry" → On.',
      'Configure o UDP IP Address para o IP do seu PC (127.0.0.1 se for local).',
      'Mantenha a porta UDP padrão (20777) e Send Rate em 20Hz.',
      'Abra o SRT (Sim Racing Telemetry) no PC e inicie a gravação. Faça voltas completas no jogo.',
      'Após a sessão, exporte o CSV pelo SRT (Share → Export to CSV).',
      'Alternativa gratuita: use o Telemetry Tool — suporta F1 25 nativamente com export CSV.',
    ],
    note: 'O F1 25 funciona via UDP (não gera arquivo local). Precisa de um app intermediário para gravar e exportar CSV. Funciona também no PS5 e Xbox (mesma rede Wi-Fi).',
    columns: 'Brake, Throttle, Speed, Gear, RPM, LapDistance',
  },
];

const FAQ_ITEMS = [
  { q: 'O SimHub exporta telemetria em CSV?', a: 'Não. O SimHub é focado em dashboards ao vivo, bass shakers e motion rigs. Ele não exporta CSV de sessão. Para exportar dados, use o MoTeC i2 ou ferramentas específicas do simulador.' },
  { q: 'O CrewChief pode ser usado?', a: 'Não para exportação de dados. O CrewChief é um spotter/engenheiro virtual por voz. Ele não grava nem exporta telemetria em formato CSV.' },
  { q: 'Preciso do MoTeC para todos os sims?', a: 'Para ACC, rFactor 2, LMU e AMS2, o MoTeC i2 (gratuito) é a melhor opção. Para iRacing, use o Mu + MoTeC ou o Garage 61 diretamente. Para Assetto Corsa, o Telemetrick exporta CSV sem precisar do MoTeC.' },
  { q: 'Qual formato de arquivo aceita?', a: 'CSV, TSV ou TXT com delimitador por vírgula, ponto-e-vírgula ou tab. Precisa ter pelo menos uma coluna de freio (Brake, Brake%, etc).' },
];

export default function TelemetryImportScreen({ onBack, onExercisesCreated }) {
  const [step, setStep] = useState('upload');
  const [parsed, setParsed] = useState(null);
  const [fileName, setFileName] = useState('');
  const [laps, setLaps] = useState({});
  const [lapSummary, setLapSummary] = useState([]);
  const [selectedLap, setSelectedLap] = useState(null);
  const [zones, setZones] = useState({ brake: [], throttle: [], combined: [] });
  const [selectedZones, setSelectedZones] = useState(new Set());
  const [error, setError] = useState(null);
  const [expandedGuide, setExpandedGuide] = useState(null);
  const [showFaq, setShowFaq] = useState(false);
  const fileRef = useRef(null);

  const handleFile = useCallback((file) => {
    setError(null); setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = parseCSV(e.target.result);
      if (!result) { setError('Arquivo não reconhecido. Precisa de pelo menos uma coluna "Brake" ou "Brake%".'); return; }
      setParsed(result);
      const lapData = splitByLap(result.data);
      setLaps(lapData); setLapSummary(getLapSummary(lapData));
      setStep('preview');
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e) => { e.preventDefault(); const file = e.dataTransfer?.files?.[0]; if (file) handleFile(file); }, [handleFile]);

  const selectLap = (lapNum) => {
    setSelectedLap(lapNum);
    const data = laps[lapNum] || parsed.data;
    setZones({ brake: detectBrakeZones(data), throttle: detectThrottleZones(data), combined: detectCombinedZones(data) });
    setSelectedZones(new Set(detectBrakeZones(data).map((_, i) => `brake_${i}`)));
    setStep('zones');
  };

  const toggleZone = (key) => setSelectedZones(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const createExercises = () => {
    const exercises = [];
    zones.brake.forEach((z, i) => { if (selectedZones.has(`brake_${i}`)) exercises.push(zoneToExercise(z, i)); });
    zones.throttle.forEach((z, i) => { if (selectedZones.has(`throttle_${i}`)) exercises.push(throttleZoneToExercise(z, i)); });
    zones.combined.forEach((z, i) => { if (selectedZones.has(`combined_${i}`)) exercises.push(combinedZoneToExercise(z, i)); });
    onExercisesCreated(exercises, fileName);
    setStep('done');
  };

  const MiniChart = ({ data, field, color, width = 160, height = 40 }) => {
    if (!data || data.length < 2) return null;
    const vals = data.map(d => d[field] || 0); const max = Math.max(...vals, 0.01);
    const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * width},${height - (v / max) * height}`).join(' ');
    return <svg width={width} height={height} style={{ display: 'block' }}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" /></svg>;
  };

  return (
    <div style={{ maxWidth: 1100, width: '100%' }}>
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
        <button onClick={onBack} style={btn}>← VOLTAR</button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)' }}>Importar Telemetria Real</h2>
            <span style={{ fontSize: 8, padding: '2px 8px', borderRadius: 6, background: '#f1c40f12', color: '#b7950b', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>PREMIUM</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Crie exercícios baseados na sua pilotagem real no simulador</p>
        </div>
      </div>

      {/* ── STEP 1: Upload + Guides ── */}
      {step === 'upload' && (
        <div className="animate-in">

          {/* Drop zone */}
          <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => fileRef.current?.click()}
            style={{ padding: '40px 24px', background: 'var(--bg-card)', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', textAlign: 'center', cursor: 'pointer', marginBottom: 16 }}>
            <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <span style={{ fontSize: 36 }}>📂</span>
            <p style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-display)', marginTop: 10 }}>Arraste o arquivo CSV aqui</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>ou clique para selecionar · Aceita .csv, .tsv, .txt</p>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', marginBottom: 12, background: '#fde8e6', border: '1px solid #e74c3c20', borderRadius: 10 }}>
              <p style={{ fontSize: 12, color: '#e74c3c' }}>❌ {error}</p>
            </div>
          )}

          {/* Sim guides */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 10, color: 'var(--text-secondary)' }}>📖 COMO EXPORTAR POR SIMULADOR</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SIM_GUIDES.map(sim => {
                const expanded = expandedGuide === sim.id;
                return (
                  <div key={sim.id} style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', borderLeft: `4px solid ${sim.color}`, overflow: 'hidden' }}>
                    <div onClick={() => setExpandedGuide(expanded ? null : sim.id)}
                      style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{sim.icon}</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: sim.color }}>{sim.name}</span>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>Ferramenta: {sim.tool}</p>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', transition: 'transform .2s', transform: expanded ? 'rotate(90deg)' : 'none' }}>▶</span>
                    </div>

                    {expanded && (
                      <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--border)' }}>
                        {/* Steps */}
                        <div style={{ marginTop: 10 }}>
                          {sim.steps.map((s, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                              <span style={{ width: 20, height: 20, borderRadius: '50%', background: sim.color + '15', color: sim.color, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-display)' }}>{i + 1}</span>
                              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{s}</p>
                            </div>
                          ))}
                        </div>

                        {/* Downloads */}
                        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                          <a href={sim.toolUrl} target="_blank" rel="noopener noreferrer"
                            style={{ ...btn, background: sim.color, color: '#fff', border: `1.5px solid ${sim.color}`, textDecoration: 'none', fontSize: 10, padding: '6px 12px' }}>
                            ⬇ Baixar {sim.tool.split('(')[0].trim()}
                          </a>
                          {sim.altTool && sim.altToolUrl && (
                            <a href={sim.altToolUrl} target="_blank" rel="noopener noreferrer"
                              style={{ ...btn, textDecoration: 'none', fontSize: 10, padding: '6px 12px' }}>
                              ⬇ {sim.altTool}
                            </a>
                          )}
                        </div>

                        {/* Expected columns */}
                        <p style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>Colunas esperadas: {sim.columns}</p>

                        {/* Special note */}
                        {sim.note && (
                          <div style={{ marginTop: 8, padding: '8px 10px', background: '#f39c1208', border: '1px solid #f39c1220', borderRadius: 8 }}>
                            <p style={{ fontSize: 10, color: '#b7950b', lineHeight: 1.4 }}>💡 {sim.note}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAQ */}
          <div style={{ background: 'var(--bg-inset)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '14px 16px' }}>
            <div onClick={() => setShowFaq(!showFaq)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>❓ PERGUNTAS FREQUENTES</p>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', transform: showFaq ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}>▶</span>
            </div>
            {showFaq && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FAQ_ITEMS.map((item, i) => (
                  <div key={i}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{item.q}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 2: Preview ── */}
      {step === 'preview' && parsed && (
        <div className="animate-in">
          <div style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)' }}>📄 {fileName}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{parsed.rowCount.toLocaleString()} amostras · {parsed.columns.length} canais</p>
              </div>
              <span style={{ padding: '4px 12px', borderRadius: 8, background: '#2980b910', border: '1px solid #2980b920', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#2980b9' }}>{parsed.sim}</span>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {parsed.columns.map(col => (
                <span key={col} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 6, background: col === 'brake' ? '#e74c3c10' : col === 'throttle' ? '#27ae6010' : 'var(--bg-inset)', color: col === 'brake' ? '#e74c3c' : col === 'throttle' ? '#27ae60' : 'var(--text-muted)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{col.toUpperCase()}</span>
              ))}
            </div>
          </div>

          {lapSummary.length > 1 ? (
            <div>
              <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>SELECIONE A VOLTA PARA ANÁLISE</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                {lapSummary.map(lap => (
                  <div key={lap.lap} onClick={() => selectLap(lap.lap)} style={{ padding: '12px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', boxShadow: 'var(--shadow-card)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)' }}>Volta {lap.lap}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{lap.samples} pts</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'var(--text-muted)' }}>
                      <span>🔴 {lap.avgBrake}%</span><span>🟢 {lap.avgThrottle}%</span>
                      {lap.maxSpeed > 0 && <span>🏎️ {lap.maxSpeed}</span>}
                      <span>📍 {lap.brakeZones}z</span>
                    </div>
                    <div style={{ marginTop: 6 }}><MiniChart data={laps[lap.lap]} field="brake" color="#e74c3c" /></div>
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

      {/* ── STEP 3: Zones ── */}
      {step === 'zones' && (
        <div className="animate-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{selectedLap !== null ? `Volta ${selectedLap}` : 'Sessão'} — Zonas detectadas</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{zones.brake.length} frenagem · {zones.throttle.length} aceleração · {zones.combined.length} combinadas</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setStep('preview')} style={btn}>← Voltar</button>
              <button onClick={createExercises} disabled={selectedZones.size === 0}
                style={{ ...btn, background: selectedZones.size > 0 ? '#27ae60' : 'var(--bg-inset)', color: selectedZones.size > 0 ? '#fff' : 'var(--text-muted)', border: `1.5px solid ${selectedZones.size > 0 ? '#27ae60' : 'var(--border)'}` }}>
                CRIAR {selectedZones.size} EXERCÍCIO{selectedZones.size !== 1 ? 'S' : ''} →
              </button>
            </div>
          </div>

          {[
            { key: 'brake', label: 'FRENAGEM', icon: '🔴', color: '#e74c3c', zones: zones.brake },
            { key: 'throttle', label: 'ACELERAÇÃO', icon: '🟢', color: '#27ae60', zones: zones.throttle },
            { key: 'combined', label: 'COMBINADAS', icon: '🟣', color: '#8e44ad', zones: zones.combined },
          ].map(g => g.zones.length > 0 && (
            <div key={g.key} style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: g.color, fontWeight: 600, marginBottom: 6 }}>{g.icon} {g.label}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                {g.zones.map((zone, i) => {
                  const zk = `${g.key}_${i}`; const sel = selectedZones.has(zk);
                  return (
                    <div key={zk} onClick={() => toggleZone(zk)} style={{ padding: '10px 12px', background: sel ? g.color + '08' : 'var(--bg-card)', border: `1.5px solid ${sel ? g.color + '40' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-display)' }}>Zona {i + 1}</span>
                        <span style={{ fontSize: 14 }}>{sel ? '☑' : '☐'}</span>
                      </div>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{zone.label} · Pico {Math.round((zone.peak || zone.brakePeak || 0) * 100)}%</p>
                      <div style={{ marginTop: 4 }}><MiniChart data={zone.points} field={g.key === 'throttle' ? 'throttle' : 'brake'} color={g.color} height={30} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── STEP 4: Done ── */}
      {step === 'done' && (
        <div className="animate-in" style={{ textAlign: 'center', padding: '2rem' }}>
          <span style={{ fontSize: 48 }}>✅</span>
          <p style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: 12 }}>Exercícios criados!</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{selectedZones.size} exercício{selectedZones.size !== 1 ? 's' : ''} da sua telemetria real.</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
            <button onClick={onBack} style={{ ...btn, background: '#27ae60', color: '#fff', border: '1.5px solid #27ae60', padding: '10px 24px', fontSize: 13 }}>IR PARA TREINO →</button>
            <button onClick={() => { setStep('upload'); setParsed(null); }} style={btn}>IMPORTAR OUTRO</button>
          </div>
        </div>
      )}
    </div>
  );
}
