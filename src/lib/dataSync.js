import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Data sync between localStorage and Supabase.
 * When user logs in, uploads local data to cloud.
 * When user has cloud data, downloads it.
 * Merges intelligently — keeps the best of both.
 */

// ── Session Logs ──

export async function syncSessionLogs(userId, localLogs) {
  if (!isSupabaseConfigured() || !userId) return localLogs;

  // Fetch cloud logs
  const { data: cloudLogs } = await supabase
    .from('session_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1000);

  const cloud = cloudLogs || [];

  // Find local logs not in cloud (by timestamp match)
  const cloudTimestamps = new Set(cloud.map(l => new Date(l.created_at).getTime()));
  const newLocal = (localLogs || []).filter(l => !cloudTimestamps.has(l.timestamp));

  // Upload new local logs to cloud
  if (newLocal.length > 0) {
    const rows = newLocal.map(l => ({
      user_id: userId,
      exercise_id: l.exId,
      exercise_name: l.exName,
      pedal_type: l.pedal,
      difficulty: l.diff,
      score: l.score,
      grade: l.grade,
      consistency: l.consistency,
      peak_accuracy: l.peakAccuracy,
      peak_timing_delta: l.peakTimingDelta,
      segments: l.segments,
      car_profile_id: l.carProfileId || 'default',
      wheel_id: l.wheelId,
      created_at: new Date(l.timestamp).toISOString(),
    }));

    await supabase.from('session_logs').insert(rows);
  }

  // Convert cloud logs to local format and merge
  const allLogs = [
    ...cloud.map(l => ({
      exId: l.exercise_id,
      exName: l.exercise_name,
      pedal: l.pedal_type,
      diff: l.difficulty,
      score: l.score,
      grade: l.grade,
      consistency: l.consistency,
      peakAccuracy: l.peak_accuracy,
      peakTimingDelta: l.peak_timing_delta,
      segments: l.segments,
      carProfileId: l.car_profile_id,
      wheelId: l.wheel_id,
      timestamp: new Date(l.created_at).getTime(),
    })),
    ...newLocal,
  ];

  // Sort by timestamp desc and deduplicate
  allLogs.sort((a, b) => b.timestamp - a.timestamp);
  return allLogs;
}

// ── Save single session result ──

export async function saveSessionResult(userId, result) {
  if (!isSupabaseConfigured() || !userId) return;

  await supabase.from('session_logs').insert({
    user_id: userId,
    exercise_id: result.exId,
    exercise_name: result.exName,
    pedal_type: result.pedal,
    difficulty: result.diff,
    score: result.score,
    grade: result.grade,
    consistency: result.consistency,
    peak_accuracy: result.peakAccuracy,
    peak_timing_delta: result.peakTimingDelta,
    segments: result.segments,
    car_profile_id: result.carProfileId || 'default',
    wheel_id: result.wheelId,
  });

  // Update best score
  const { data: existing } = await supabase
    .from('best_scores')
    .select('best_score, attempts')
    .eq('user_id', userId)
    .eq('exercise_id', result.exId)
    .eq('car_profile_id', result.carProfileId || 'default')
    .single();

  if (existing) {
    await supabase.from('best_scores').update({
      best_score: Math.max(existing.best_score, result.score),
      attempts: existing.attempts + 1,
      updated_at: new Date().toISOString(),
    }).eq('user_id', userId).eq('exercise_id', result.exId).eq('car_profile_id', result.carProfileId || 'default');
  } else {
    await supabase.from('best_scores').insert({
      user_id: userId,
      exercise_id: result.exId,
      best_score: result.score,
      attempts: 1,
      car_profile_id: result.carProfileId || 'default',
    });
  }
}

// ── Preferences ──

export async function syncPreferences(userId, localPrefs) {
  if (!isSupabaseConfigured() || !userId) return localPrefs;

  const { data: cloudPrefs } = await supabase
    .from('preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (cloudPrefs) {
    return {
      inputMode: cloudPrefs.input_mode || localPrefs.inputMode,
      inputFilter: cloudPrefs.input_filter || localPrefs.inputFilter,
      carProfileId: cloudPrefs.car_profile_id || localPrefs.carProfileId,
      ...cloudPrefs.data,
    };
  }

  // Upload local prefs
  await supabase.from('preferences').upsert({
    user_id: userId,
    input_mode: localPrefs.inputMode,
    input_filter: localPrefs.inputFilter,
    car_profile_id: localPrefs.carProfileId,
    updated_at: new Date().toISOString(),
  });

  return localPrefs;
}

export async function savePreferences(userId, prefs) {
  if (!isSupabaseConfigured() || !userId) return;
  await supabase.from('preferences').upsert({
    user_id: userId,
    input_mode: prefs.inputMode,
    input_filter: prefs.inputFilter,
    car_profile_id: prefs.carProfileId,
    updated_at: new Date().toISOString(),
  });
}

// ── Wheel Calibrations ──

export async function syncWheelCalibrations(userId) {
  if (!isSupabaseConfigured() || !userId) return null;
  const { data } = await supabase
    .from('wheel_calibrations')
    .select('*')
    .eq('user_id', userId);
  return data;
}

export async function saveWheelCalibrationCloud(userId, wheelId, wheelName, pedalConfigs, shifterConfig) {
  if (!isSupabaseConfigured() || !userId) return;
  await supabase.from('wheel_calibrations').upsert({
    user_id: userId,
    wheel_id: wheelId,
    wheel_name: wheelName,
    pedal_configs: pedalConfigs,
    shifter_config: shifterConfig,
    updated_at: new Date().toISOString(),
  });
}
