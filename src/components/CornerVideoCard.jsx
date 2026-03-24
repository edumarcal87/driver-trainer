import React, { useState } from 'react';
import { getVideoForExercise } from '../data/cornerVideos';

/**
 * CornerVideoCard — shows an embedded onboard video tutorial for a track exercise.
 * Only renders for track exercises with video data. Premium-only content.
 */
export default function CornerVideoCard({ exerciseId, isPremium }) {
  const video = getVideoForExercise(exerciseId);
  const [showVideo, setShowVideo] = useState(false);
  const [activePoint, setActivePoint] = useState(null);

  if (!video) return null;

  // Premium gate
  if (!isPremium) {
    return (
      <div style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 16 }}>🎬</span>
          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)' }}>Vídeo Tutorial — {video.corner}</span>
          <span style={{ fontSize: 8, padding: '2px 8px', borderRadius: 6, background: '#f1c40f12', color: '#b7950b', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>PREMIUM</span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
          Assista o onboard de referência com pontos de frenagem, trail braking e saída anotados. Disponível para assinantes Premium.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>🎬</span>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)' }}>Vídeo Tutorial — {video.corner}</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{video.speed}</span>
              <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{video.gear}</span>
            </div>
          </div>
        </div>
        <button onClick={() => setShowVideo(!showVideo)} style={{
          padding: '5px 12px', fontSize: 10, borderRadius: 8, fontWeight: 600,
          fontFamily: 'var(--font-condensed)', cursor: 'pointer',
          border: `1.5px solid ${showVideo ? 'var(--border)' : '#e74c3c'}`,
          background: showVideo ? 'var(--bg-inset)' : '#e74c3c',
          color: showVideo ? 'var(--text-muted)' : '#fff',
        }}>
          {showVideo ? 'FECHAR' : '▶ ASSISTIR'}
        </button>
      </div>

      {/* Video embed */}
      {showVideo && (
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.videoId}?start=${video.start}&end=${video.end}&rel=0&modestbranding=1`}
            title={`Tutorial — ${video.corner}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      )}

      {/* Braking reference */}
      <div style={{ padding: '10px 16px', background: 'var(--accent-brake-light)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12 }}>🎯</span>
          <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-condensed)', color: 'var(--accent-brake)' }}>REFERÊNCIA DE FRENAGEM</span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{video.brakingRef}</p>
      </div>

      {/* Key points timeline */}
      <div style={{ padding: '12px 16px' }}>
        <p style={{ fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '.3px' }}>PONTOS-CHAVE</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {video.keyPoints.map((kp, i) => {
            const isActive = activePoint === i;
            const dotColors = ['#e74c3c', '#f39c12', '#27ae60', '#2980b9'];
            const dotColor = dotColors[i % dotColors.length];
            return (
              <div key={i} onClick={() => setActivePoint(isActive ? null : i)}
                style={{ display: 'flex', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', background: isActive ? dotColor + '08' : 'transparent', border: `1px solid ${isActive ? dotColor + '20' : 'transparent'}`, transition: 'all .15s' }}>
                {/* Timeline dot */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor, border: `2px solid ${dotColor}` }} />
                  {i < video.keyPoints.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', marginTop: 2 }} />}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: dotColor, fontWeight: 600 }}>{kp.time}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{kp.label}</span>
                  </div>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>{kp.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
