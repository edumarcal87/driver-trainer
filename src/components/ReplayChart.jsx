import React, { useState, useEffect, useRef, useMemo } from 'react';

/**
 * ReplayChart — animated telemetry comparison after exercise.
 * Shows: target curve, user curve (animated), difference zones, best attempt overlay.
 *
 * Props:
 *   targetPts: [{t, v}] — target curve
 *   userPts: [{t, v}] — user's current attempt
 *   bestPts: [{t, v}] — user's best attempt (optional)
 *   segments: [{key, label, score, startT, endT}] — from analysis
 *   pedalType: 'brake' | 'throttle' | 'clutch' | 'steering' | 'combined'
 *   score: number — overall score
 */

const COLORS = {
  brake: '#e74c3c', throttle: '#27ae60', clutch: '#f39c12', steering: '#2980b9',
  combined: '#8e44ad', sequential: '#00bcd4', hpattern: '#5c6bc0',
  target: '#1a1a1a', user: '#e74c3c', best: '#2980b9',
  good: '#27ae6030', bad: '#e74c3c20', grid: '#e0dfd8',
};

export default function ReplayChart({ targetPts, userPts, bestPts, segments, pedalType, score }) {
  const canvasRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(1); // 0-1, starts at 1 (fully shown)
  const [showBest, setShowBest] = useState(false);
  const [showDiff, setShowDiff] = useState(true);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [speed, setSpeed] = useState(0.5);
  const afRef = useRef(null);
  const startRef = useRef(0);

  const accent = COLORS[pedalType] || COLORS.brake;
  const W = 640, H = 180, PAD = { top: 20, right: 12, bottom: 28, left: 36 };
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top - PAD.bottom;

  // Normalize points to canvas coords
  const toX = (t) => PAD.left + t * cw;
  const toY = (v) => PAD.top + ch - v * ch;

  // Segment boundaries in canvas coords
  const segRanges = useMemo(() => {
    if (!segments) return [];
    return segments.map(seg => ({
      ...seg,
      x1: toX(seg.range?.[0] ?? seg.startT ?? 0),
      x2: toX(seg.range?.[1] ?? seg.endT ?? 1),
    }));
  }, [segments]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !targetPts?.length) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#f5f4ef';
    ctx.fillRect(PAD.left, PAD.top, cw, ch);

    // Grid lines
    ctx.strokeStyle = COLORS.grid; ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = PAD.top + (ch / 4) * i;
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + cw, y); ctx.stroke();
    }

    // Y-axis labels
    ctx.fillStyle = '#9a9a90'; ctx.font = '10px "Barlow Condensed", sans-serif'; ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      ctx.fillText(`${(100 - i * 25)}%`, PAD.left - 6, PAD.top + (ch / 4) * i + 3);
    }
    ctx.textAlign = 'left';

    // Difference zones (where user deviates from target)
    if (showDiff && userPts?.length > 1) {
      const visibleCount = Math.floor(userPts.length * playProgress);
      for (let i = 1; i < visibleCount; i++) {
        const ut = userPts[i], ut0 = userPts[i - 1];
        // Find closest target point
        const tt = targetPts[Math.min(i, targetPts.length - 1)];
        const tt0 = targetPts[Math.min(i - 1, targetPts.length - 1)];
        const diff = Math.abs(ut.v - tt.v);
        if (diff > 0.08) {
          ctx.fillStyle = diff > 0.2 ? '#e74c3c18' : '#f39c1212';
          ctx.beginPath();
          ctx.moveTo(toX(ut0.t), toY(ut0.v));
          ctx.lineTo(toX(ut.t), toY(ut.v));
          ctx.lineTo(toX(tt.t), toY(tt.v));
          ctx.lineTo(toX(tt0.t), toY(tt0.v));
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // Segment backgrounds
    if (hoveredSegment !== null && segRanges[hoveredSegment]) {
      const sr = segRanges[hoveredSegment];
      ctx.fillStyle = sr.score >= 70 ? '#27ae6008' : '#e74c3c08';
      ctx.fillRect(sr.x1, PAD.top, sr.x2 - sr.x1, ch);
      ctx.strokeStyle = sr.score >= 70 ? '#27ae6030' : '#e74c3c30';
      ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(sr.x1, PAD.top); ctx.lineTo(sr.x1, PAD.top + ch); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sr.x2, PAD.top); ctx.lineTo(sr.x2, PAD.top + ch); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Target curve (dashed)
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
    ctx.beginPath();
    targetPts.forEach((p, i) => i === 0 ? ctx.moveTo(toX(p.t), toY(p.v)) : ctx.lineTo(toX(p.t), toY(p.v)));
    ctx.stroke();
    ctx.setLineDash([]);

    // Best attempt (thin blue, if enabled)
    if (showBest && bestPts?.length > 1) {
      ctx.strokeStyle = COLORS.best; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.5;
      ctx.beginPath();
      bestPts.forEach((p, i) => i === 0 ? ctx.moveTo(toX(p.t), toY(p.v)) : ctx.lineTo(toX(p.t), toY(p.v)));
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // User curve (animated)
    if (userPts?.length > 1) {
      const visibleCount = Math.max(2, Math.floor(userPts.length * playProgress));
      ctx.strokeStyle = accent; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i < visibleCount; i++) {
        const p = userPts[i];
        i === 0 ? ctx.moveTo(toX(p.t), toY(p.v)) : ctx.lineTo(toX(p.t), toY(p.v));
      }
      ctx.stroke();

      // Playhead dot
      if (playProgress < 1) {
        const lastPt = userPts[visibleCount - 1];
        ctx.fillStyle = accent;
        ctx.beginPath(); ctx.arc(toX(lastPt.t), toY(lastPt.v), 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(toX(lastPt.t), toY(lastPt.v), 2, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Legend
    const ly = H - 10;
    ctx.font = '10px "Barlow Condensed", sans-serif';
    // Target
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(PAD.left, ly); ctx.lineTo(PAD.left + 20, ly); ctx.stroke();
    ctx.setLineDash([]); ctx.fillStyle = '#9a9a90';
    ctx.fillText('Alvo', PAD.left + 24, ly + 3);
    // User
    const ux = PAD.left + 64;
    ctx.strokeStyle = accent; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(ux, ly); ctx.lineTo(ux + 20, ly); ctx.stroke();
    ctx.fillStyle = '#9a9a90';
    ctx.fillText('Você', ux + 24, ly + 3);
    // Best
    if (showBest && bestPts?.length) {
      const bx = ux + 64;
      ctx.strokeStyle = COLORS.best; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.moveTo(bx, ly); ctx.lineTo(bx + 20, ly); ctx.stroke();
      ctx.globalAlpha = 1; ctx.fillStyle = '#9a9a90';
      ctx.fillText('Melhor', bx + 24, ly + 3);
    }

  }, [targetPts, userPts, bestPts, playProgress, showBest, showDiff, hoveredSegment, accent]);

  // Animation loop
  useEffect(() => {
    if (!playing) return;
    startRef.current = performance.now();
    const duration = (targetPts?.length > 0 ? targetPts[targetPts.length - 1].t : 1) * 2000 / speed;
    const animate = (now) => {
      const elapsed = now - startRef.current;
      const p = Math.min(1, elapsed / duration);
      setPlayProgress(p);
      if (p < 1) afRef.current = requestAnimationFrame(animate);
      else setPlaying(false);
    };
    setPlayProgress(0);
    afRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(afRef.current);
  }, [playing, speed, targetPts]);

  const btn = { padding: '5px 12px', fontSize: 10, borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-condensed)', fontWeight: 600 };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', letterSpacing: '.3px', fontWeight: 600 }}>REPLAY DA TELEMETRIA</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => { setPlayProgress(0); setPlaying(true); }} style={{ ...btn, borderColor: playing ? accent + '40' : 'var(--border)', color: playing ? accent : 'var(--text-secondary)' }}>
            {playing ? '⏸' : '▶'} REPLAY
          </button>
          <button onClick={() => setSpeed(speed === 0.5 ? 1 : speed === 1 ? 2 : 0.5)} style={{ ...btn, minWidth: 38 }}>
            {speed === 0.5 ? '0.5x' : speed === 1 ? '1x' : '2x'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ borderRadius: 10, overflow: 'hidden', background: 'var(--bg-inset)', border: '1px solid var(--border)' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: 180, display: 'block' }} />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setShowDiff(!showDiff)} style={{ ...btn, borderColor: showDiff ? '#f39c1240' : 'var(--border)', color: showDiff ? '#b7950b' : 'var(--text-muted)', background: showDiff ? '#f39c1208' : 'var(--bg-card)' }}>
          {showDiff ? '◼' : '◻'} Diferenças
        </button>
        {bestPts?.length > 1 && (
          <button onClick={() => setShowBest(!showBest)} style={{ ...btn, borderColor: showBest ? '#2980b940' : 'var(--border)', color: showBest ? '#2980b9' : 'var(--text-muted)', background: showBest ? '#2980b908' : 'var(--bg-card)' }}>
            {showBest ? '◼' : '◻'} Melhor tentativa
          </button>
        )}
        {/* Progress scrubber */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 120 }}>
          <input type="range" min="0" max="1" step="0.005" value={playProgress}
            onChange={e => { setPlaying(false); setPlayProgress(parseFloat(e.target.value)); }}
            style={{ flex: 1, accentColor: accent, height: 4 }}
          />
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', minWidth: 32 }}>
            {Math.round(playProgress * 100)}%
          </span>
        </div>
      </div>

    </div>
  );
}
