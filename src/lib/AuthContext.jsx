import React, { createContext, useContext, useState, useEffect } from 'react';
import { isSupabaseConfigured } from './supabase';
import { getCurrentUser, getSession, getProfile, onAuthStateChange, isPremium } from './auth';

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  isLoggedIn: false,
  isPremiumUser: false,
  refresh: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (authUser) => {
    if (authUser) {
      const p = await getProfile(authUser.id);
      setProfile(p);
    } else {
      setProfile(null);
    }
  };

  const refresh = async () => {
    const u = await getCurrentUser();
    setUser(u);
    await loadProfile(u);
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Load initial session
    getSession().then(async (session) => {
      const u = session?.user || null;
      setUser(u);
      await loadProfile(u);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      const u = session?.user || null;
      setUser(u);
      await loadProfile(u);

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    loading,
    isLoggedIn: !!user,
    isPremiumUser: isPremium(profile),
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
