import { supabase, isSupabaseConfigured } from './supabase';

// ════════════════════════════════════
// LEADERBOARDS (all users can view + submit)
// ════════════════════════════════════

export async function submitToLeaderboard(userId, exerciseId, score, carProfileId, displayName, avatarUrl) {
  if (!isSupabaseConfigured() || !userId) return;
  const cpId = carProfileId || 'default';
  const { data: existing } = await supabase.from('leaderboard').select('score')
    .eq('user_id', userId).eq('exercise_id', exerciseId).eq('car_profile_id', cpId).single();
  if (existing && existing.score >= score) return;
  await supabase.from('leaderboard').upsert({
    user_id: userId, exercise_id: exerciseId, score, car_profile_id: cpId,
    display_name: displayName, avatar_url: avatarUrl, updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,exercise_id,car_profile_id' });
}

export async function getLeaderboard(exerciseId, carProfileId, limit = 20) {
  if (!isSupabaseConfigured()) return [];
  let q = supabase.from('leaderboard').select('user_id, score, display_name, avatar_url, car_profile_id, updated_at')
    .eq('exercise_id', exerciseId).order('score', { ascending: false }).limit(limit);
  if (carProfileId && carProfileId !== 'all') q = q.eq('car_profile_id', carProfileId);
  const { data } = await q;
  return (data || []).map((e, i) => ({ ...e, rank: i + 1 }));
}

export async function getUserRank(userId, exerciseId, carProfileId) {
  if (!isSupabaseConfigured() || !userId) return null;
  const cpId = carProfileId || 'default';
  const { data } = await supabase.from('leaderboard').select('score')
    .eq('user_id', userId).eq('exercise_id', exerciseId).eq('car_profile_id', cpId).single();
  if (!data) return null;
  const { count } = await supabase.from('leaderboard').select('*', { count: 'exact', head: true })
    .eq('exercise_id', exerciseId).eq('car_profile_id', cpId).gt('score', data.score);
  return { rank: (count || 0) + 1, score: data.score };
}

// ════════════════════════════════════
// WEEKLY CHALLENGES (premium only can participate)
// ════════════════════════════════════

export async function getActiveChallenges() {
  if (!isSupabaseConfigured()) return [];
  const now = new Date().toISOString();
  const { data } = await supabase.from('weekly_challenges').select('*')
    .lte('starts_at', now).gte('ends_at', now).order('difficulty');
  return data || [];
}

export async function getChallengeLeaderboard(challengeId, carProfileId, limit = 50) {
  if (!isSupabaseConfigured()) return [];
  let q = supabase.from('challenge_entries').select('user_id, score, display_name, avatar_url, attempts, car_profile_id, updated_at')
    .eq('challenge_id', challengeId).order('score', { ascending: false }).limit(limit);
  if (carProfileId && carProfileId !== 'all') q = q.eq('car_profile_id', carProfileId);
  const { data } = await q;
  return (data || []).map((e, i) => ({ ...e, rank: i + 1 }));
}

export async function submitChallengeEntry(challengeId, userId, score, carProfileId, displayName, avatarUrl) {
  if (!isSupabaseConfigured() || !userId) return { error: 'Not configured' };
  const cpId = carProfileId || 'default';
  const { data: existing } = await supabase.from('challenge_entries').select('score, attempts')
    .eq('challenge_id', challengeId).eq('user_id', userId).eq('car_profile_id', cpId).single();
  if (existing) {
    const { error } = await supabase.from('challenge_entries').update({
      score: Math.max(existing.score, score), attempts: existing.attempts + 1,
      display_name: displayName, avatar_url: avatarUrl, updated_at: new Date().toISOString(),
    }).eq('challenge_id', challengeId).eq('user_id', userId).eq('car_profile_id', cpId);
    return { error };
  } else {
    const { error } = await supabase.from('challenge_entries').insert({
      challenge_id: challengeId, user_id: userId, score, car_profile_id: cpId,
      display_name: displayName, avatar_url: avatarUrl,
    });
    return { error };
  }
}

// ════════════════════════════════════
// PUBLIC PROFILE
// ════════════════════════════════════

export async function getPublicProfile(userId) {
  if (!isSupabaseConfigured()) return null;
  const { data: profile } = await supabase.from('profiles')
    .select('id, display_name, avatar_url, plan, created_at').eq('id', userId).single();
  if (!profile) return null;
  const { data: topScores } = await supabase.from('leaderboard').select('exercise_id, score, car_profile_id')
    .eq('user_id', userId).order('score', { ascending: false }).limit(10);
  const { count } = await supabase.from('session_logs').select('*', { count: 'exact', head: true }).eq('user_id', userId);
  return { ...profile, topScores: topScores || [], totalSessions: count || 0 };
}

// ════════════════════════════════════
// ACTIVITY FEED (realtime social feed)
// ════════════════════════════════════

/**
 * Publishes an activity event to the feed.
 * Types: exercise_complete, new_record, badge_unlock, milestone, program_complete
 */
export async function publishActivity(userId, displayName, avatarUrl, type, data = {}) {
  if (!isSupabaseConfigured() || !userId) return;
  await supabase.from('activity_feed').insert({
    user_id: userId,
    display_name: displayName || 'Piloto',
    avatar_url: avatarUrl || null,
    type,
    data,
    created_at: new Date().toISOString(),
  });
}

/**
 * Fetches the latest feed entries.
 */
export async function getActivityFeed(limit = 30) {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase.from('activity_feed')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

/**
 * Subscribes to realtime feed updates.
 * Returns an unsubscribe function.
 */
export function subscribeToFeed(onNewActivity) {
  if (!isSupabaseConfigured()) return () => {};
  const channel = supabase
    .channel('activity_feed_realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_feed' }, (payload) => {
      onNewActivity(payload.new);
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
