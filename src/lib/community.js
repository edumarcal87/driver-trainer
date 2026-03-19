import { supabase, isSupabaseConfigured } from './supabase';

// ════════════════════════════════════
// LEADERBOARDS
// ════════════════════════════════════

export async function submitToLeaderboard(userId, exerciseId, score, carProfileId, displayName, avatarUrl) {
  if (!isSupabaseConfigured() || !userId) return;

  const { data: existing } = await supabase
    .from('leaderboard')
    .select('score')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .eq('car_profile_id', carProfileId || 'default')
    .single();

  if (existing && existing.score >= score) return; // Only update if new score is higher

  await supabase.from('leaderboard').upsert({
    user_id: userId,
    exercise_id: exerciseId,
    score,
    car_profile_id: carProfileId || 'default',
    display_name: displayName,
    avatar_url: avatarUrl,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,exercise_id,car_profile_id' });
}

export async function getLeaderboard(exerciseId, carProfileId, limit = 20) {
  if (!isSupabaseConfigured()) return [];

  let query = supabase
    .from('leaderboard')
    .select('user_id, score, display_name, avatar_url, car_profile_id, updated_at')
    .eq('exercise_id', exerciseId)
    .order('score', { ascending: false })
    .limit(limit);

  if (carProfileId && carProfileId !== 'all') {
    query = query.eq('car_profile_id', carProfileId);
  }

  const { data } = await query;
  return (data || []).map((entry, i) => ({ ...entry, rank: i + 1 }));
}

export async function getUserRank(userId, exerciseId, carProfileId) {
  if (!isSupabaseConfigured() || !userId) return null;

  const { data: userEntry } = await supabase
    .from('leaderboard')
    .select('score')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .eq('car_profile_id', carProfileId || 'default')
    .single();

  if (!userEntry) return null;

  const { count } = await supabase
    .from('leaderboard')
    .select('*', { count: 'exact', head: true })
    .eq('exercise_id', exerciseId)
    .eq('car_profile_id', carProfileId || 'default')
    .gt('score', userEntry.score);

  return { rank: (count || 0) + 1, score: userEntry.score };
}

// ════════════════════════════════════
// WEEKLY CHALLENGES
// ════════════════════════════════════

export async function getActiveChallenge() {
  if (!isSupabaseConfigured()) return null;

  const now = new Date().toISOString();
  const { data } = await supabase
    .from('weekly_challenges')
    .select('*')
    .lte('starts_at', now)
    .gte('ends_at', now)
    .order('starts_at', { ascending: false })
    .limit(1)
    .single();

  return data;
}

export async function getChallengeLeaderboard(challengeId, limit = 50) {
  if (!isSupabaseConfigured()) return [];

  const { data } = await supabase
    .from('challenge_entries')
    .select('user_id, score, display_name, avatar_url, attempts, updated_at')
    .eq('challenge_id', challengeId)
    .order('score', { ascending: false })
    .limit(limit);

  return (data || []).map((entry, i) => ({ ...entry, rank: i + 1 }));
}

export async function submitChallengeEntry(challengeId, userId, score, displayName, avatarUrl) {
  if (!isSupabaseConfigured() || !userId) return;

  const { data: existing } = await supabase
    .from('challenge_entries')
    .select('score, attempts')
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    await supabase.from('challenge_entries').update({
      score: Math.max(existing.score, score),
      attempts: existing.attempts + 1,
      display_name: displayName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    }).eq('challenge_id', challengeId).eq('user_id', userId);
  } else {
    await supabase.from('challenge_entries').insert({
      challenge_id: challengeId,
      user_id: userId,
      score,
      display_name: displayName,
      avatar_url: avatarUrl,
    });
  }
}

// ════════════════════════════════════
// PUBLIC PROFILE STATS
// ════════════════════════════════════

export async function getPublicProfile(userId) {
  if (!isSupabaseConfigured()) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, plan, created_at')
    .eq('id', userId)
    .single();

  if (!profile) return null;

  // Get top scores
  const { data: topScores } = await supabase
    .from('leaderboard')
    .select('exercise_id, score, car_profile_id')
    .eq('user_id', userId)
    .order('score', { ascending: false })
    .limit(10);

  // Get total stats from session_logs
  const { count: totalSessions } = await supabase
    .from('session_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const { data: avgData } = await supabase
    .from('session_logs')
    .select('score')
    .eq('user_id', userId);

  const avgScore = avgData && avgData.length > 0
    ? Math.round(avgData.reduce((s, r) => s + r.score, 0) / avgData.length)
    : 0;

  return {
    ...profile,
    topScores: topScores || [],
    totalSessions: totalSessions || 0,
    avgScore,
  };
}
