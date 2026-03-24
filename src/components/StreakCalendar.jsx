import React from 'react';

const LEVEL_COLORS_LIGHT = ['#eae9e3', '#c6e48b', '#7bc96f', '#239a3b'];
const LEVEL_COLORS_DARK = ['#2a2a2e', '#0e4429', '#006d32', '#26a641'];
const DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function StreakCalendar({ goals, isDark }) {
  if (!goals) return null;

  const colors = isDark ? LEVEL_COLORS_DARK : LEVEL_COLORS_LIGHT;
  const { calendar, todayCount, todayCompleted, todayRemaining, dailyGoal, streak, bestStreak, weeks, totalDaysActive, totalDaysGoalMet } = goals;

  // Build weeks grid from calendar (180 days = ~26 weeks)
  const weeksGrid = [];
  let currentWeek = [];
  // Pad first week with empty cells
  if (calendar.length > 0) {
    for (let i = 0; i < calendar[0].day; i++) currentWeek.push(null);
  }
  for (const day of calendar) {
    currentWeek.push(day);
    if (currentWeek.length === 7) { weeksGrid.push(currentWeek); currentWeek = []; }
  }
  if (currentWeek.length > 0) weeksGrid.push(currentWeek);

  // Month labels from calendar
  const monthLabels = [];
  let lastMonth = -1;
  for (let w = 0; w < weeksGrid.length; w++) {
    const firstDay = weeksGrid[w].find(d => d);
    if (firstDay) {
      const m = new Date(firstDay.date).getMonth();
      if (m !== lastMonth) { monthLabels.push({ week: w, label: MONTH_LABELS[m] }); lastMonth = m; }
    }
  }

  const cellSize = 12, gap = 2, headerH = 16;

  return (
    <div>
      {/* Today's progress + streak */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        {/* Today card */}
        <div style={{ flex: '1 1 200px', padding: '12px 14px', background: 'var(--bg-card)', border: `1.5px solid ${todayCompleted ? '#27ae6030' : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '.3px' }}>META DE HOJE</span>
            {todayCompleted && <span style={{ fontSize: 10, color: '#27ae60', fontWeight: 700, fontFamily: 'var(--font-display)' }}>✓ COMPLETA</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-display)', color: todayCompleted ? '#27ae60' : 'var(--text-primary)' }}>{todayCount}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ {dailyGoal} exercícios</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg-inset)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, (todayCount / dailyGoal) * 100)}%`, height: '100%', background: todayCompleted ? '#27ae60' : '#f39c12', borderRadius: 3, transition: 'width .4s' }} />
          </div>
          {!todayCompleted && todayRemaining > 0 && (
            <p style={{ fontSize: 10, color: '#f39c12', marginTop: 4, fontFamily: 'var(--font-condensed)' }}>Faltam {todayRemaining} exercício{todayRemaining > 1 ? 's' : ''}</p>
          )}
        </div>

        {/* Streak card */}
        <div style={{ flex: '0 0 auto', padding: '12px 14px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', textAlign: 'center', minWidth: 100 }}>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '.3px' }}>STREAK</span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginTop: 4 }}>
            <span style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: streak > 0 ? '#e74c3c' : 'var(--text-muted)' }}>{streak}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>dias</span>
          </div>
          {streak > 0 && <span style={{ fontSize: 14 }}>🔥</span>}
        </div>

        {/* Best streak */}
        <div style={{ flex: '0 0 auto', padding: '12px 14px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', textAlign: 'center', minWidth: 100 }}>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '.3px' }}>RECORDE</span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginTop: 4 }}>
            <span style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#f1c40f' }}>{bestStreak}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>dias</span>
          </div>
          {bestStreak > 0 && <span style={{ fontSize: 14 }}>🏆</span>}
        </div>

        {/* Quick stats */}
        <div style={{ flex: '0 0 auto', padding: '12px 14px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', textAlign: 'center', minWidth: 100 }}>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '.3px' }}>DIAS ATIVOS</span>
          <p style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#2980b9', marginTop: 4 }}>{totalDaysActive}</p>
          <p style={{ fontSize: 9, color: 'var(--text-muted)' }}>{totalDaysGoalMet} com meta</p>
        </div>
      </div>

      {/* Heatmap calendar */}
      <div style={{ padding: '14px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '.3px' }}>ÚLTIMOS 6 MESES</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Menos</span>
            {colors.map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
            ))}
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Mais</span>
          </div>
        </div>

        <svg width={weeksGrid.length * (cellSize + gap) + 20} height={7 * (cellSize + gap) + headerH + 4} style={{ display: 'block' }}>
          {/* Month labels */}
          {monthLabels.map(m => (
            <text key={m.week} x={20 + m.week * (cellSize + gap)} y={10} style={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'var(--font-condensed)' }}>{m.label}</text>
          ))}
          {/* Day labels */}
          {[1, 3, 5].map(d => (
            <text key={d} x={0} y={headerH + d * (cellSize + gap) + cellSize / 2 + 3} style={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'var(--font-condensed)', textAnchor: 'start' }}>{DAY_LABELS[d]}</text>
          ))}
          {/* Cells */}
          {weeksGrid.map((week, wi) =>
            week.map((day, di) => {
              if (!day) return null;
              const x = 20 + wi * (cellSize + gap);
              const y = headerH + di * (cellSize + gap);
              return (
                <rect key={day.date} x={x} y={y} width={cellSize} height={cellSize} rx={2}
                  fill={colors[day.level]}
                  style={{ transition: 'fill .2s' }}>
                  <title>{day.date}: {day.count} exercício{day.count !== 1 ? 's' : ''}</title>
                </rect>
              );
            })
          )}
        </svg>
      </div>

      {/* Weekly summary */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {weeks.map((w, i) => (
          <div key={i} style={{ flex: 1, padding: '8px 10px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 10, textAlign: 'center' }}>
            <p style={{ fontSize: 8, fontFamily: 'var(--font-condensed)', color: 'var(--text-muted)' }}>
              {i === 3 ? 'ESTA SEMANA' : i === 2 ? 'SEMANA PASSADA' : `${3 - i} SEM. ATRÁS`}
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', color: w.exercises > 0 ? '#27ae60' : 'var(--text-muted)', marginTop: 2 }}>{w.exercises}</p>
            <p style={{ fontSize: 8, color: 'var(--text-muted)' }}>{w.activeDays} dias</p>
          </div>
        ))}
      </div>
    </div>
  );
}
