import { useMemo } from 'react';

const DAILY_GOAL = 3;

/**
 * Computes daily goals, streak, and calendar heatmap data from session log.
 */
export default function useDailyGoals(sessionLog) {
  return useMemo(() => {
    const log = sessionLog || [];

    // Group by date string
    const byDay = {};
    for (const e of log) {
      const d = new Date(e.timestamp).toLocaleDateString('en-CA'); // YYYY-MM-DD
      if (!byDay[d]) byDay[d] = [];
      byDay[d].push(e);
    }

    // Today
    const todayKey = new Date().toLocaleDateString('en-CA');
    const todayCount = (byDay[todayKey] || []).length;
    const todayCompleted = todayCount >= DAILY_GOAL;

    // Current streak (consecutive days with >= DAILY_GOAL exercises)
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-CA');
      const count = (byDay[key] || []).length;
      // Skip today if not yet completed (don't break streak)
      if (i === 0 && count < DAILY_GOAL) continue;
      if (count >= DAILY_GOAL) streak++;
      else break;
    }

    // Best streak ever
    let bestStreak = 0, tempStreak = 0;
    const sortedDays = Object.keys(byDay).sort();
    for (let i = 0; i < sortedDays.length; i++) {
      if ((byDay[sortedDays[i]] || []).length >= DAILY_GOAL) {
        tempStreak++;
        // Check if consecutive
        if (i > 0) {
          const prev = new Date(sortedDays[i - 1]);
          const curr = new Date(sortedDays[i]);
          const diff = (curr - prev) / 86400000;
          if (diff > 1) tempStreak = 1;
        }
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Calendar data (last 180 days)
    const calendar = [];
    for (let i = 179; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-CA');
      const count = (byDay[key] || []).length;
      calendar.push({
        date: key,
        day: d.getDay(),
        count,
        level: count === 0 ? 0 : count >= DAILY_GOAL ? 3 : count >= 2 ? 2 : 1,
      });
    }

    // Weekly summary (last 4 weeks)
    const weeks = [];
    for (let w = 0; w < 4; w++) {
      let weekCount = 0, weekDays = 0;
      for (let d = 0; d < 7; d++) {
        const idx = calendar.length - 1 - w * 7 - d;
        if (idx >= 0 && calendar[idx].count > 0) { weekCount += calendar[idx].count; weekDays++; }
      }
      weeks.unshift({ exercises: weekCount, activeDays: weekDays });
    }

    return {
      dailyGoal: DAILY_GOAL,
      todayCount,
      todayCompleted,
      todayRemaining: Math.max(0, DAILY_GOAL - todayCount),
      streak,
      bestStreak,
      calendar,
      weeks,
      totalDaysActive: Object.values(byDay).filter(v => v.length > 0).length,
      totalDaysGoalMet: Object.values(byDay).filter(v => v.length >= DAILY_GOAL).length,
    };
  }, [sessionLog]);
}
