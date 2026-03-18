import React, { useMemo, useState } from 'react';
import { analyzeSession } from '../utils/scoring';
import { exportSessionPDF } from '../utils/pdfExport';
import { GradeDisplay, StatCard, TipCard, SegmentBar } from './UI';

const btn = { padding: '6px 14px', fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)' };
const card = { padding: '16px 18px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: 12 };

const PEDAL_LABELS = { brake: 'Freio', throttle: 'Acelerador', clutch: 'Embreagem', steering: 'Volante' };
const PEDAL_HEX = { brake: '#e74c3c', throttle: '#27ae60', clutch: '#f39c12', steering: '#2980b9' };

const INPUT_TYPES = [
  { key: 'all', label: 'GERAL' },
  { key: 'brake', label: 'FREIO' },
  { key: 'throttle', label: 'ACELERADOR' },
  { key: 'clutch', label: 'EMBREAGEM' },
  { key: 'steering', label: 'VOLANTE' },
];

function MiniSparkline({ scores, color, width = 120, height = 32 }) {
  if (scores.length < 2) return null;
  const pts = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * width;
    const y = height - (s / 100) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const areaPath = `M0,${height} L${pts.join(' L')} L${width},${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".2" />
          <stop offset="100%" stopColor={color} stopOpacity=".02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-${color.replace('#', '')})`} />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {scores.length > 0 && (() => {
        const lastY = height - (scores[scores.length - 1] / 100) * height;
        return <circle cx={width} cy={lastY} r="2.5" fill={color} />;
      })()}
    </svg>
  );
}

function SessionScoreChart({ allScores, colorOverride }) {
  if (allScores.length < 2) return null;
  const W = 680, H = 140, P = { t: 10, r: 10, b: 24, l: 36 };
  const cw = W - P.l - P.r, ch = H - P.t - P.b;
  const scores = [...allScores].reverse();
  const tx = i => P.l + (i / (scores.length - 1)) * cw;
  const ty = v => P.t + (1 - v / 100) * ch;
  const pts = scores.map((s, i) => `${tx(i).toFixed(1)},${ty(s).toFixed(1)}`);
  const areaPath = `M${P.l},${H - P.b} L${pts.join(' L')} L${tx(scores.length - 1).toFixed(1)},${H - P.b} Z`;
  const lineColor = colorOverride || '#2980b9';
  const ma = scores.map((_, i) => {
    const slice = scores.slice(Math.max(0, i - 1), Math.min(scores.length, i + 2));
    return Math.round(slice.reduce((s, v) => s + v, 0) / slice.length);
  });
  const maPts = ma.map((s, i) => `${tx(i).toFixed(1)},${ty(s).toFixed(1)}`);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
      <defs><linearGradient id="scoreGradP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={lineColor} stopOpacity=".15" /><stop offset="100%" stopColor={lineColor} stopOpacity=".02" /></linearGradient></defs>
      {[0, 25, 50, 75, 100].map(v => (<g key={v}><line x1={P.l} y1={ty(v)} x2={W - P.r} y2={ty(v)} stroke="#e0dfd8" strokeWidth=".5" /><text x={P.l - 6} y={ty(v) + 3.5} textAnchor="end" fill="#9a9a90" fontSize="9" fontFamily="Oxanium, monospace">{v}</text></g>))}
      <path d={areaPath} fill="url(#scoreGradP)" />
      <polyline points={pts.join(' ')} fill="none" stroke={lineColor + '80'} strokeWidth="1" strokeLinecap="round" />
      <polyline points={maPts.join(' ')} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" />
      {scores.map((s, i) => (<circle key={i} cx={tx(i)} cy={ty(s)} r="3" fill={s >= 80 ? '#27ae60' : s >= 50 ? '#f39c12' : '#e74c3c'} stroke="#ffffff" strokeWidth="1.5" />))}
      <text x={W / 2} y={H - 3} textAnchor="middle" fill="#9a9a90" fontSize="9" fontFamily="Oxanium, monospace">TENTATIVAS →</text>
    </svg>
  );
}

function generateTypeTips(entries, typeKey) {
  if (entries.length === 0) return [];
  const tips = [];
  const scores = entries.map(e => e.score);
  const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  const recent = scores.slice(0, Math.min(5, scores.length));
  const early = scores.slice(-Math.min(5, scores.length));
  const recentAvg = Math.round(recent.reduce((s, v) => s + v, 0) / recent.length);
  const earlyAvg = Math.round(early.reduce((s, v) => s + v, 0) / early.length);
  const trend = recentAvg - earlyAvg;
  const label = PEDAL_LABELS[typeKey] || typeKey;

  if (entries.length >= 3 && trend > 5) tips.push({ type: 'success', text: `${label}: evolução de +${trend} pontos. Continue!` });
  else if (entries.length >= 3 && trend < -5) tips.push({ type: 'warning', text: `${label}: queda de ${Math.abs(trend)} pontos. Pode ser cansaço — faça uma pausa.` });

  const segScores = { attack: [], peak: [], modulation: [], release: [] };
  for (const e of entries) { for (const s of (e.segments || [])) { if (segScores[s.key]) segScores[s.key].push(s.score); } }
  const weakSegs = Object.entries(segScores).map(([k, arr]) => arr.length === 0 ? null : { key: k, avg: Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) }).filter(Boolean).sort((a, b) => a.avg - b.avg);

  if (weakSegs.length > 0 && weakSegs[0].avg < 65) {
    const ws = weakSegs[0];
    const coaching = {
      brake: { attack: 'Pise no freio com mais decisão no início.', peak: 'Mantenha a pressão estável no pico.', modulation: 'Pratique o trail braking — libere gradualmente.', release: 'Solte o freio suavemente na entrada da curva.' },
      throttle: { attack: 'Comece a acelerar mais progressivamente.', peak: 'Evite pisar fundo cedo demais.', modulation: 'Trabalhe a modulação fina do acelerador.', release: 'Tire o pé de forma suave.' },
      clutch: { attack: 'Pise na embreagem com mais rapidez.', peak: 'Mantenha a embreagem fundo sem oscilar.', modulation: 'Ponto de acoplamento mais suave.', release: 'Solte a embreagem progressivamente.' },
      steering: { attack: 'Inicie a rotação com mais suavidade.', peak: 'Mantenha o ângulo com firmeza no ápice.', modulation: 'Transição entre direções mais fluida.', release: 'Retorne ao centro gradualmente.' },
    };
    const segLabels = { attack: 'Ataque', peak: 'Pico', modulation: 'Modulação', release: 'Liberação' };
    tips.push({ type: 'info', text: `${label} — ponto fraco: ${segLabels[ws.key]} (${ws.avg}%). ${coaching[typeKey]?.[ws.key] || 'Precisa de mais prática.'}` });
  }

  const byEx = {}; for (const e of entries) { if (!byEx[e.exId]) byEx[e.exId] = []; byEx[e.exId].push(e); }
  const exTrends = Object.entries(byEx).map(([, arr]) => { const sc = arr.map(a => a.score); return { name: arr[0].exName, avg: Math.round(sc.reduce((s, v) => s + v, 0) / sc.length), best: Math.max(...sc), attempts: sc.length }; });
  const struggling = exTrends.filter(e => e.avg < 50 && e.attempts >= 2);
  const mastered = exTrends.filter(e => e.best >= 90);
  if (struggling.length > 0) tips.push({ type: 'warning', text: `${label}: "${struggling[0].name}" precisa de atenção (média ${struggling[0].avg}%).` });
  if (mastered.length > 0 && mastered.length < exTrends.length) { const next = exTrends.filter(e => e.best < 90).sort((a, b) => b.avg - a.avg)[0]; if (next) tips.push({ type: 'info', text: `${label}: ${mastered.length} dominado(s). Próximo: "${next.name}" (melhor ${next.best}%).` }); }
  if (avg >= 80 && entries.length >= 5) tips.push({ type: 'success', text: `${label}: excelente desempenho (${avg}% média)!` });
  if (tips.length === 0 && entries.length >= 2) tips.push({ type: 'info', text: `${label}: continue praticando para análises mais detalhadas.` });
  return tips;
}

export default function ProgressScreen({ onBack, sessionHistory }) {
  const [activeTab, setActiveTab] = useState('all');
  const insights = useMemo(() => analyzeSession(sessionHistory), [sessionHistory]);
  const filteredHistory = useMemo(() => activeTab === 'all' ? sessionHistory : sessionHistory.filter(e => (e.pedal || 'brake') === activeTab), [sessionHistory, activeTab]);
  const typeTips = useMemo(() => activeTab === 'all' ? (insights?.tips || []) : generateTypeTips(filteredHistory, activeTab), [filteredHistory, activeTab, insights]);
  const typeScores = useMemo(() => filteredHistory.map(e => e.score), [filteredHistory]);
  const typeAvg = typeScores.length > 0 ? Math.round(typeScores.reduce((s, v) => s + v, 0) / typeScores.length) : 0;
  const typeBest = typeScores.length > 0 ? Math.max(...typeScores) : 0;
  const typeExTrends = useMemo(() => {
    const byEx = {}; for (const e of filteredHistory) { if (!byEx[e.exId]) byEx[e.exId] = []; byEx[e.exId].push(e); }
    return Object.entries(byEx).map(([id, arr]) => { const sc = arr.map(a => a.score); return { exId: id, name: arr[0].exName, pedal: arr[0].pedal || 'brake', attempts: sc.length, avg: Math.round(sc.reduce((s, v) => s + v, 0) / sc.length), best: Math.max(...sc), trend: sc.length >= 2 ? sc[0] - sc[sc.length - 1] : 0, scores: sc }; });
  }, [filteredHistory]);
  const availableTypes = useMemo(() => { const ts = new Set(sessionHistory.map(e => e.pedal || 'brake')); return INPUT_TYPES.filter(t => t.key === 'all' || ts.has(t.key)); }, [sessionHistory]);

  if (!insights || sessionHistory.length === 0) {
    return (<div style={{ maxWidth: 720, width: '100%' }}>
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button onClick={onBack} style={btn}>← VOLTAR</button><h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)' }}>Evolução da sessão</h2></div>
      <div style={{ ...card, textAlign: 'center', padding: '3rem' }}><p style={{ fontSize: 40, marginBottom: 12 }}>📊</p><p style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>Nenhum exercício realizado ainda</p></div></div>);
  }

  const grade = typeAvg >= 90 ? 'S' : typeAvg >= 75 ? 'A' : typeAvg >= 60 ? 'B' : typeAvg >= 40 ? 'C' : 'D';
  const tabColor = PEDAL_HEX[activeTab] || '#2980b9';

  return (
    <div style={{ maxWidth: 720, width: '100%' }}>
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
        <button onClick={onBack} style={btn}>← VOLTAR</button>
        <h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)', flex: 1 }}>Evolução da sessão</h2>
        <button onClick={() => exportSessionPDF(sessionHistory, insights)} style={{
          ...btn, borderColor: '#8e44ad40', color: '#8e44ad', fontWeight: 600,
        }}>
          📄 Exportar PDF
        </button>
      </div>

      {/* Type tabs */}
      <div className="animate-in animate-in-delay-1" style={{ display: 'flex', gap: 4, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {availableTypes.map(t => {
          const c = PEDAL_HEX[t.key] || '#5a5a5a'; const active = activeTab === t.key;
          const count = t.key === 'all' ? sessionHistory.length : sessionHistory.filter(e => (e.pedal || 'brake') === t.key).length;
          return (<button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: '6px 14px', fontSize: 10, borderRadius: 20, fontWeight: 500, fontFamily: 'var(--font-condensed)', letterSpacing: '.8px', cursor: 'pointer', border: `1px solid ${active ? c + '60' : 'var(--border)'}`, background: active ? c + '15' : 'transparent', color: active ? c : 'var(--text-muted)', transition: 'all .15s' }}>
            {t.label} <span style={{ opacity: .6 }}>({count})</span></button>);
        })}
      </div>

      {/* Stats overview */}
      {filteredHistory.length > 0 && (
        <div className="animate-in animate-in-delay-1" style={{ ...card, display: 'flex', alignItems: 'center', gap: 20 }}>
          <GradeDisplay grade={grade} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px' }}>{activeTab === 'all' ? 'SESSÃO GERAL' : PEDAL_LABELS[activeTab]?.toUpperCase()}</p>
            <p style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: tabColor }}>{typeAvg}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>% média</span></p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ textAlign: 'center' }}><p style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--accent-throttle)' }}>{typeBest}%</p><p style={{ fontSize: 9, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)' }}>MELHOR</p></div>
            <div style={{ textAlign: 'center' }}><p style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)', color: tabColor }}>{filteredHistory.length}</p><p style={{ fontSize: 9, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)' }}>TENTATIVAS</p></div>
          </div>
        </div>
      )}

      {/* Chart */}
      {typeScores.length >= 2 && (
        <div className="animate-in animate-in-delay-2" style={card}>
          <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px', marginBottom: 10 }}>EVOLUÇÃO {activeTab !== 'all' ? `— ${PEDAL_LABELS[activeTab]?.toUpperCase()}` : ''}</p>
          <SessionScoreChart allScores={typeScores} colorOverride={activeTab !== 'all' ? tabColor : undefined} />
        </div>
      )}

      {/* Per-pedal cards (all tab only) */}
      {activeTab === 'all' && insights.pedalStats.length > 1 && (
        <div className="animate-in animate-in-delay-2" style={card}>
          <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px', marginBottom: 12 }}>DESEMPENHO POR TIPO</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {insights.pedalStats.map(ps => (
              <div key={ps.pedal} onClick={() => setActiveTab(ps.pedal)} style={{ flex: 1, minWidth: 120, padding: '12px 14px', background: 'var(--bg-inset)', borderRadius: 'var(--radius)', border: `1px solid ${PEDAL_HEX[ps.pedal] || '#555'}20`, cursor: 'pointer', transition: 'border-color .15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = (PEDAL_HEX[ps.pedal] || '#555') + '50'} onMouseLeave={e => e.currentTarget.style.borderColor = (PEDAL_HEX[ps.pedal] || '#555') + '20'}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-condensed)', color: PEDAL_HEX[ps.pedal], letterSpacing: '.5px', fontWeight: 500 }}>{PEDAL_LABELS[ps.pedal]?.toUpperCase()}</span>
                  <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{ps.attempts}x</span>
                </div>
                <p style={{ fontSize: 20, fontWeight: 600, fontFamily: 'var(--font-display)', color: PEDAL_HEX[ps.pedal] }}>{ps.avg}<span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-muted)' }}>%</span></p>
                <div style={{ height: 3, background: 'var(--bg-deep)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}><div style={{ width: `${ps.avg}%`, height: '100%', background: PEDAL_HEX[ps.pedal], borderRadius: 2 }} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exercise trends */}
      {typeExTrends.length > 0 && (
        <div className="animate-in animate-in-delay-3" style={card}>
          <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px', marginBottom: 12 }}>EXERCÍCIOS {activeTab !== 'all' ? `— ${PEDAL_LABELS[activeTab]?.toUpperCase()}` : ''}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {typeExTrends.map(et => {
              const tC = et.trend > 5 ? 'var(--accent-throttle)' : et.trend < -5 ? 'var(--accent-brake)' : 'var(--text-muted)';
              const tI = et.trend > 5 ? '↑' : et.trend < -5 ? '↓' : '→';
              const pC = PEDAL_HEX[et.pedal] || '#5a5a5a';
              return (<div key={et.exId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-inset)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{et.name}</span>
                    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', padding: '1px 6px', borderRadius: 8, background: pC + '18', color: pC }}>{et.attempts}x</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    <span>média {et.avg}%</span><span>melhor {et.best}%</span>
                    <span style={{ color: tC, fontWeight: 600 }}>{tI} {et.trend > 0 ? '+' : ''}{et.trend}pts</span>
                  </div>
                </div>
                <MiniSparkline scores={[...et.scores].reverse()} color={pC} width={80} height={28} />
              </div>);
            })}
          </div>
        </div>
      )}

      {/* Coaching tips */}
      {typeTips.length > 0 && (
        <div className="animate-in animate-in-delay-4" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.5px', marginBottom: 10 }}>COACHING {activeTab !== 'all' ? `— ${PEDAL_LABELS[activeTab]?.toUpperCase()}` : '— GERAL'}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {typeTips.map((tip, i) => <TipCard key={i} type={tip.type} text={tip.text} />)}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button onClick={onBack} style={btn}>← Voltar aos exercícios</button>
      </div>
    </div>
  );
}
