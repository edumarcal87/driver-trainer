import React, { useState, useEffect, useRef } from 'react';
import { getActivityFeed, subscribeToFeed } from '../lib/community';
import { isSupabaseConfigured } from '../lib/supabase';

// ═══════════════════════════════════
// Activity type config
// ═══════════════════════════════════
const ACTIVITY_CONFIG = {
  exercise_complete: {
    icon: '🎯',
    color: '#2980b9',
    format: (d) => `completou ${d.exercise_name || 'um exercício'} com ${d.score || 0}%`,
  },
  new_record: {
    icon: '🏆',
    color: '#f1c40f',
    format: (d) => `bateu o recorde em ${d.exercise_name || 'exercício'} — ${d.score || 0}%`,
  },
  badge_unlock: {
    icon: '🏅',
    color: '#8e44ad',
    format: (d) => `desbloqueou ${d.badge_icon || ''} ${d.badge_name || 'uma conquista'}`,
  },
  milestone: {
    icon: '⭐',
    color: '#e67e22',
    format: (d) => d.message || `alcançou um marco!`,
  },
  program_complete: {
    icon: '📋',
    color: '#27ae60',
    format: (d) => `completou a sessão "${d.session_name || 'treino'}" do programa ${d.program_name || ''}`,
  },
  streak: {
    icon: '🔥',
    color: '#e74c3c',
    format: (d) => `está com ${d.days || 0} dias de streak!`,
  },
};

function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

// ═══════════════════════════════════
// ActivityCard
// ═══════════════════════════════════
function ActivityCard({ activity, isNew }) {
  const config = ACTIVITY_CONFIG[activity.type] || ACTIVITY_CONFIG.exercise_complete;
  const data = activity.data || {};
  const name = activity.display_name || 'Piloto';

  return (
    <div style={{
      display: 'flex', gap: 10, padding: '10px 12px',
      background: isNew ? config.color + '06' : 'transparent',
      borderRadius: 10,
      borderLeft: isNew ? `3px solid ${config.color}` : '3px solid transparent',
      transition: 'all .3s',
    }}>
      {/* Avatar */}
      {activity.avatar_url ? (
        <img src={activity.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: config.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 14 }}>{config.icon}</span>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11, lineHeight: 1.4 }}>
          <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{name}</span>
          {' '}
          <span style={{ color: 'var(--text-secondary)' }}>{config.format(data)}</span>
        </p>

        {/* Score badge inline */}
        {data.score && data.score >= 90 && (
          <span style={{ display: 'inline-block', marginTop: 3, fontSize: 9, padding: '1px 8px', borderRadius: 6, background: data.score >= 95 ? '#f1c40f18' : '#27ae6012', color: data.score >= 95 ? '#b7950b' : '#27ae60', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {data.grade || 'S'} — {data.score}%
          </span>
        )}
      </div>

      {/* Time */}
      <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0, paddingTop: 2 }}>
        {timeAgo(activity.created_at)}
      </span>
    </div>
  );
}

// ═══════════════════════════════════
// Main Feed Component
// ═══════════════════════════════════
export default function ActivityFeed({ compact = false, limit = 20 }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newIds, setNewIds] = useState(new Set());
  const newTimerRef = useRef(null);

  // Fetch initial feed
  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return; }
    getActivityFeed(limit).then(data => {
      setActivities(data);
      setLoading(false);
    });
  }, [limit]);

  // Subscribe to realtime
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const unsub = subscribeToFeed((newActivity) => {
      setActivities(prev => [newActivity, ...prev].slice(0, limit));
      setNewIds(prev => new Set(prev).add(newActivity.id));
      // Clear "new" highlight after 5s
      if (newTimerRef.current) clearTimeout(newTimerRef.current);
      newTimerRef.current = setTimeout(() => setNewIds(new Set()), 5000);
    });
    return unsub;
  }, [limit]);

  if (!isSupabaseConfigured()) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Feed de atividade indisponível no modo offline.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-condensed)' }}>Carregando feed...</p>
      </div>
    );
  }

  const displayed = compact ? activities.slice(0, 5) : activities;

  if (displayed.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <span style={{ fontSize: 28 }}>📡</span>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Nenhuma atividade ainda. Complete exercícios para aparecer no feed!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, padding: '0 4px' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#27ae60', animation: 'pulse 2s infinite' }} />
        <span style={{ fontSize: 9, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.3px', fontWeight: 600 }}>FEED AO VIVO</span>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
      </div>

      {/* Feed list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {displayed.map(a => (
          <ActivityCard key={a.id || a.created_at} activity={a} isNew={newIds.has(a.id)} />
        ))}
      </div>

      {/* Show more */}
      {compact && activities.length > 5 && (
        <p style={{ fontSize: 10, color: '#2980b9', textAlign: 'center', marginTop: 8, cursor: 'pointer', fontFamily: 'var(--font-condensed)' }}>
          Ver mais atividades →
        </p>
      )}
    </div>
  );
}
