import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Auth module for Driver Trainer.
 * Falls back gracefully when Supabase is not configured (offline mode).
 */

// ── Session / User ──

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  if (!isSupabaseConfigured()) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured()) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// ── Login methods ──

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) return { error: { message: 'Supabase não configurado' } };
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname,
    },
  });
  return { data, error };
}

export async function signInWithDiscord() {
  if (!isSupabaseConfigured()) return { error: { message: 'Supabase não configurado' } };
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: window.location.origin + window.location.pathname,
    },
  });
  return { data, error };
}

export async function signInWithEmail(email, password) {
  if (!isSupabaseConfigured()) return { error: { message: 'Supabase não configurado' } };
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signUpWithEmail(email, password, displayName) {
  if (!isSupabaseConfigured()) return { error: { message: 'Supabase não configurado' } };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: displayName },
    },
  });
  return { data, error };
}

export async function resetPassword(email) {
  if (!isSupabaseConfigured()) return { error: { message: 'Supabase não configurado' } };
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname + '?type=recovery',
  });
  return { data, error };
}

export async function signOut() {
  if (!isSupabaseConfigured()) return;
  await supabase.auth.signOut();
}

// ── Profile ──

export async function getProfile(userId) {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

export async function updateProfile(userId, updates) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
}

// ── Plan checking ──

export function isPremium(profile) {
  if (!profile) return false;
  if (profile.plan === 'admin') return true;
  if (profile.plan !== 'premium') return false;
  if (profile.plan_expires_at && new Date(profile.plan_expires_at) < new Date()) return false;
  return true;
}

export function getPlanLabel(profile) {
  if (!profile) return 'Visitante';
  if (profile.plan === 'admin') return 'Admin';
  if (isPremium(profile)) return 'Premium';
  return 'Gratuito';
}
