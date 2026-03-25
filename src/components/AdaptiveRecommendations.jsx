import React, { useMemo } from 'react';
import { getAdaptiveRecommendations } from '../utils/adaptive';

const CATEGORY_STYLES = {
  weakness: { bg: '#e74c3c08', border: '#e74c3c25', accent: '#e74c3c' },
  declining: { bg: '#f39c1208', border: '#f39c1225', accent: '#f39c12' },
  explore: { bg: '#2980b908', border: '#2980b925', accent: '#2980b9' },
  improve: { bg: '#8e44ad08', border: '#8e44ad25', accent: '#8e44ad' },
  progression: { bg: '#27ae6008', border: '#27ae6025', accent: '#27ae60' },
  pedal_weakness: { bg: '#e67e2208', border: '#e67e2225', accent: '#e67e22' },
  start: { bg: '#2980b908', border: '#2980b925', accent: '#2980b9' },
};

const SEGMENT_LABELS = { attack: 'Ataque', peak: 'Pico', modulation: 'Modulação', release: 'Liberação' };

/**
 * Segment radar mini chart — 4 segments shown as horizontal bars.
 */
function SegmentRadar({ segmentProfile }) {
  if (!segmentProfile) return null;
  const segments = Object.entries(segmentProfile).filter(([, v]) => v.count > 0 && v.avg !== null);
  if (segments.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {segments.map(([key, data]) => {
        const color = data.avg >= 80 ? '#27ae60' : data.avg >= 60 ? '#f39c12' : '#e74c3c';
        const trendIcon = data.trend > 5 ? '↑' : data.trend < -5 ? '↓' : '→';
        const trendColor = data.trend > 5 ? '#27ae60' : data.trend < -5 ? '#e74c3c' : 'var(--text-muted)';
        return (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: 10, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)' }}>{SEGMENT_LABELS[key]}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-display)', color }}>{data.avg}%</span>
                <span style={{ fontSize: 9, color: trendColor }}>{trendIcon}</span>
              </div>
            </div>
            <div style={{ height: 4, background: 'var(--bg-deep)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${data.avg}%`, height: '100%', background: color, borderRadius: 2 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * AdaptiveRecommendations — shown on menu screen, suggests next exercises.
 */
export default function AdaptiveRecommendations({ sessionLog, exercises, onOpenExercise }) {
  const { recommendations, segmentProfile, progressionReady } = useMemo(
    () => getAdaptiveRecommendations(sessionLog, exercises),
    [sessionLog, exercises]
  );

  if (recommendations.length === 0) return null;

  return (
    <div className="animate-in" style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#8e44ad12', border: '1.5px solid #8e44ad20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 14 }}>🧠</span>
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#8e44ad' }}>TREINO ADAPTATIVO</span>
          <p style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>Sugestões baseadas no seu histórico</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {/* Segment profile card */}
        {segmentProfile && Object.values(segmentProfile).some(v => v.count > 0) && (
          <div style={{ flex: '1 1 200px', padding: '12px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
            <p style={{ fontSize: 10, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, letterSpacing: '.3px' }}>PERFIL DE SEGMENTOS</p>
            <SegmentRadar segmentProfile={segmentProfile} />
            {progressionReady.length > 0 && (
              <div style={{ marginTop: 8, padding: '6px 8px', background: '#27ae6008', borderRadius: 6, border: '1px solid #27ae6015' }}>
                <p style={{ fontSize: 9, color: '#27ae60', fontWeight: 600 }}>⬆️ Pronto para subir de nível!</p>
              </div>
            )}
          </div>
        )}

        {/* Recommendation cards */}
        <div style={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {recommendations.map((rec, i) => {
            const style = CATEGORY_STYLES[rec.category] || CATEGORY_STYLES.start;
            return (
              <div key={rec.exercise.id + i} onClick={() => onOpenExercise(rec.exercise)}
                style={{ display: 'flex', gap: 10, padding: '10px 12px', background: style.bg, border: `1.5px solid ${style.border}`, borderRadius: 'var(--radius-lg)', cursor: 'pointer', transition: 'all .15s' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: style.accent + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 16 }}>{rec.icon}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', color: style.accent }}>{rec.exercise.name}</span>
                    {rec.segmentScore != null && (
                      <span style={{ fontSize: 8, padding: '1px 6px', borderRadius: 4, background: style.accent + '15', color: style.accent, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{rec.segmentScore}%</span>
                    )}
                  </div>
                  <p style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.3 }}>{rec.reason}</p>
                </div>
                <span style={{ fontSize: 14, color: style.accent, alignSelf: 'center', flexShrink: 0 }}>→</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
