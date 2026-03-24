import React, { useState, useMemo } from 'react';
import { BADGES, BADGE_CATEGORIES, RARITY, evaluateBadges } from '../data/badges';
import { EXERCISE_CATEGORIES } from '../data/exercises';

const btn = { padding: '6px 14px', fontSize: 11, borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-condensed)', fontWeight: 600 };

export default function PublicProfileScreen({ onBack, profile, sessionLog, onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview');

  const { unlocked } = useMemo(() => evaluateBadges(sessionLog || []), [sessionLog]);
  const unlockedIds = new Set(unlocked.map(b => b.id));

  // Stats computation
  const stats = useMemo(() => {
    const log = sessionLog || [];
    if (log.length === 0) return null;

    const totalSessions = log.length;
    const avgScore = Math.round(log.reduce((s, e) => s + e.score, 0) / log.length);
    const bestScore = Math.max(...log.map(e => e.score));
    const uniqueExercises = new Set(log.map(e => e.exId)).size;

    // Category breakdown
    const catStats = {};
    for (const e of log) {
      const cat = e.pedal || 'brake';
      if (!catStats[cat]) catStats[cat] = { scores: [], best: 0, count: 0 };
      catStats[cat].scores.push(e.score);
      catStats[cat].best = Math.max(catStats[cat].best, e.score);
      catStats[cat].count++;
    }
    for (const cat of Object.values(catStats)) {
      cat.avg = Math.round(cat.scores.reduce((s, v) => s + v, 0) / cat.scores.length);
    }

    // Track completion
    const tracks = {};
    for (const e of log) {
      if (e.exId?.startsWith('ilg_')) tracks['Interlagos'] = (tracks['Interlagos'] || 0) + 1;
      if (e.exId?.startsWith('spa_')) tracks['Spa'] = (tracks['Spa'] || 0) + 1;
      if (e.exId?.startsWith('mza_')) tracks['Monza'] = (tracks['Monza'] || 0) + 1;
      if (e.exId?.startsWith('slv_')) tracks['Silverstone'] = (tracks['Silverstone'] || 0) + 1;
    }

    // Days active
    const days = new Set(log.map(e => new Date(e.timestamp).toDateString()));

    // Evolution (last 10 vs first 10)
    const sorted = [...log].sort((a, b) => a.timestamp - b.timestamp);
    const first10 = sorted.slice(0, Math.min(10, sorted.length));
    const last10 = sorted.slice(-Math.min(10, sorted.length));
    const firstAvg = Math.round(first10.reduce((s, e) => s + e.score, 0) / first10.length);
    const lastAvg = Math.round(last10.reduce((s, e) => s + e.score, 0) / last10.length);
    const evolution = lastAvg - firstAvg;

    return { totalSessions, avgScore, bestScore, uniqueExercises, catStats, tracks, daysActive: days.size, evolution };
  }, [sessionLog]);

  const displayName = profile?.display_name || 'Piloto';
  const avatarUrl = profile?.avatar_url;
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : '';
  const isPremium = profile?.plan === 'premium';

  const CAT_COLORS = { brake: '#e74c3c', throttle: '#27ae60', clutch: '#f39c12', steering: '#2980b9', combined: '#8e44ad', sequential: '#00bcd4', hpattern: '#5c6bc0' };
  const CAT_LABELS = { brake: 'Freio', throttle: 'Acelerador', clutch: 'Embreagem', steering: 'Volante', combined: 'Combinado', sequential: 'Sequencial', hpattern: 'H-Pattern' };
  const TRACK_FLAGS = { Interlagos: '🇧🇷', Spa: '🇧🇪', Monza: '🇮🇹', Silverstone: '🇬🇧' };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `${displayName} no Driver Trainer — ${stats?.avgScore || 0}% média, ${unlocked.length} conquistas, ${stats?.totalSessions || 0} treinos`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Driver Trainer — Perfil', text, url }); } catch {}
    } else {
      navigator.clipboard?.writeText(`${text}\n${url}`);
    }
  };

  const tabStyle = (key) => ({
    padding: '6px 14px', fontSize: 11, borderRadius: 8, fontWeight: activeTab === key ? 700 : 500,
    fontFamily: 'var(--font-condensed)', cursor: 'pointer', letterSpacing: '.3px',
    border: `1.5px solid ${activeTab === key ? 'var(--accent-brake)' : 'var(--border)'}`,
    background: activeTab === key ? 'var(--accent-brake-light)' : 'var(--bg-card)',
    color: activeTab === key ? 'var(--accent-brake)' : 'var(--text-muted)',
  });

  return (
    <div style={{ maxWidth: 1100, width: '100%' }}>
      {/* Header */}
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
        <button onClick={onBack} style={btn}>← VOLTAR</button>
        <div style={{ flex: 1 }} />
        <button onClick={handleShare} style={{ ...btn, color: '#8e44ad', borderColor: '#8e44ad30', background: 'var(--accent-combined-light)' }}>📤 Compartilhar</button>
      </div>

      {/* Profile card */}
      <div className="animate-in" style={{ padding: '24px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        {/* Avatar */}
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent-brake-light)', border: '3px solid var(--accent-brake)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--accent-brake)' }}>{displayName[0]?.toUpperCase()}</span>
          )}
        </div>

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{displayName}</h2>
            {isPremium && <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 6, background: '#f1c40f18', color: '#b7950b', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>PREMIUM</span>}
          </div>
          {memberSince && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Membro desde {memberSince}</p>}
          {!isPremium && (
            <button style={{ marginTop: 8, padding: '6px 16px', fontSize: 11, borderRadius: 8, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '.3px', border: '1.5px solid #f1c40f', background: '#f1c40f', color: '#1a1a1a', cursor: 'pointer', boxShadow: '0 2px 8px rgba(241,196,15,0.25)' }}>
              ⭐ UPGRADE PARA PREMIUM
            </button>
          )}
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {unlocked.filter(b => b.rarity === 'legendary' || b.rarity === 'epic').slice(0, 5).map(b => (
              <span key={b.id} title={b.name} style={{ fontSize: 20, cursor: 'default' }}>{b.icon}</span>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        {stats && (
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: 'TREINOS', value: stats.totalSessions, color: 'var(--text-primary)' },
              { label: 'MÉDIA', value: `${stats.avgScore}%`, color: stats.avgScore >= 70 ? '#27ae60' : '#f39c12' },
              { label: 'MELHOR', value: `${stats.bestScore}%`, color: '#f1c40f' },
              { label: 'CONQUISTAS', value: unlocked.length, color: '#8e44ad' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '8px 12px', background: 'var(--bg-inset)', borderRadius: 10, minWidth: 60 }}>
                <p style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</p>
                <p style={{ fontSize: 8, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.3px' }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="animate-in animate-in-delay-1" style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        <button onClick={() => setActiveTab('overview')} style={tabStyle('overview')}>Visão Geral</button>
        <button onClick={() => setActiveTab('badges')} style={tabStyle('badges')}>Conquistas ({unlocked.length})</button>
        <button onClick={() => setActiveTab('tracks')} style={tabStyle('tracks')}>Circuitos</button>
      </div>

      {/* ── Overview tab ── */}
      {activeTab === 'overview' && stats && (
        <div className="animate-in animate-in-delay-2 grid-2col" style={{ gap: 12 }}>
          {/* Category breakdown */}
          <div style={{ padding: '14px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
            <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>DESEMPENHO POR CATEGORIA</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(stats.catStats).sort((a, b) => b[1].count - a[1].count).map(([cat, data]) => (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: CAT_COLORS[cat] || 'var(--text-primary)' }}>{CAT_LABELS[cat] || cat}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', color: data.avg >= 70 ? '#27ae60' : '#f39c12' }}>{data.avg}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-inset)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${data.avg}%`, height: '100%', background: CAT_COLORS[cat] || '#888', borderRadius: 3 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{data.count} treinos</span>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Melhor: {data.best}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats + evolution */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: '14px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
              <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>ESTATÍSTICAS</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Exercícios únicos', value: stats.uniqueExercises },
                  { label: 'Dias ativos', value: stats.daysActive },
                  { label: 'Evolução', value: `${stats.evolution > 0 ? '+' : ''}${stats.evolution}%`, color: stats.evolution > 0 ? '#27ae60' : stats.evolution < 0 ? '#e74c3c' : 'var(--text-muted)' },
                  { label: 'Circuitos', value: Object.keys(stats.tracks).length },
                ].map(s => (
                  <div key={s.label} style={{ padding: '10px', background: 'var(--bg-inset)', borderRadius: 8, textAlign: 'center' }}>
                    <p style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', color: s.color || 'var(--text-primary)' }}>{s.value}</p>
                    <p style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-condensed)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top badges showcase */}
            <div style={{ padding: '14px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <p style={{ fontSize: 11, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', fontWeight: 600 }}>CONQUISTAS RECENTES</p>
                <button onClick={() => setActiveTab('badges')} style={{ fontSize: 9, color: '#2980b9', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-condensed)' }}>VER TODAS →</button>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {unlocked.slice(0, 8).map(b => {
                  const r = RARITY[b.rarity];
                  return (
                    <div key={b.id} title={`${b.name} — ${b.desc}`} style={{ padding: '6px 10px', background: r.bg, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${r.color}20` }}>
                      <span style={{ fontSize: 16 }}>{b.icon}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: r.color }}>{b.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Badges tab ── */}
      {activeTab === 'badges' && (
        <div className="animate-in animate-in-delay-2">
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {Object.entries(RARITY).map(([key, r]) => {
              const count = unlocked.filter(b => b.rarity === key).length;
              return (
                <span key={key} style={{ fontSize: 10, padding: '3px 10px', borderRadius: 8, background: count > 0 ? r.bg : 'var(--bg-inset)', color: count > 0 ? r.color : 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {count} {r.label}
                </span>
              );
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
            {BADGES.map(b => {
              const is = unlockedIds.has(b.id);
              const r = RARITY[b.rarity];
              return (
                <div key={b.id} style={{ padding: '10px 12px', background: is ? 'var(--bg-card)' : 'var(--bg-inset)', border: `1.5px solid ${is ? r.color + '30' : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', filter: is ? 'none' : 'grayscale(1)', opacity: is ? 1 : 0.4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 22 }}>{b.icon}</span>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{b.name}</p>
                      <p style={{ fontSize: 9, color: 'var(--text-muted)' }}>{b.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tracks tab ── */}
      {activeTab === 'tracks' && stats && (
        <div className="animate-in animate-in-delay-2 grid-2col" style={{ gap: 10 }}>
          {[
            { name: 'Interlagos', flag: '🇧🇷', prefix: 'ilg_', total: 14, color: '#009739' },
            { name: 'Spa-Francorchamps', flag: '🇧🇪', prefix: 'spa_', total: 7, color: '#e74c3c' },
            { name: 'Monza', flag: '🇮🇹', prefix: 'mza_', total: 7, color: '#27ae60' },
            { name: 'Silverstone', flag: '🇬🇧', prefix: 'slv_', total: 6, color: '#2980b9' },
          ].map(track => {
            const completed = new Set((sessionLog || []).filter(e => e.exId?.startsWith(track.prefix)).map(e => e.exId)).size;
            const pct = Math.round((completed / track.total) * 100);
            const bestScores = (sessionLog || []).filter(e => e.exId?.startsWith(track.prefix));
            const avgScore = bestScores.length > 0 ? Math.round(bestScores.reduce((s, e) => s + e.score, 0) / bestScores.length) : 0;
            return (
              <div key={track.name} style={{ padding: '16px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 28 }}>{track.flag}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', color: track.color }}>{track.name}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{completed}/{track.total} cenários completados</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: pct === 100 ? '#27ae60' : 'var(--text-primary)' }}>{pct}%</p>
                  </div>
                </div>
                <div style={{ height: 6, background: 'var(--bg-inset)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: track.color, borderRadius: 3, transition: 'width .4s' }} />
                </div>
                {avgScore > 0 && <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>Média: {avgScore}% · {bestScores.length} tentativas</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!stats && (
        <div className="animate-in" style={{ textAlign: 'center', padding: '3rem' }}>
          <span style={{ fontSize: 48 }}>🏎️</span>
          <p style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-display)', marginTop: 12 }}>Nenhum treino registrado ainda</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Complete exercícios para construir seu perfil público!</p>
        </div>
      )}
    </div>
  );
}
