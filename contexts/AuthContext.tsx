import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@lib/supabase';
import type { AuthProfileInput, Profile } from '@types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  upsertProfile: (input: AuthProfileInput) => Promise<Profile>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to fetch profile', error);
      return null;
    }

    if (!data) {
      setProfile(null);
      return null;
    }

    const location = data.location
      ? typeof data.location === 'string'
        ? null
        : {
            lat: data.location.coordinates?.[1],
            lng: data.location.coordinates?.[0],
          }
      : null;

    const normalized: Profile = {
      id: data.id,
      name: data.name,
      age: data.age,
      bio: data.bio,
      photo_url: data.photo_url,
      interests: data.interests || [],
      gender: data.gender,
      looking_for: data.looking_for,
      location,
      is_online: data.is_online,
      last_seen: data.last_seen,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    setProfile(normalized);
    return normalized;
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      if (data.session?.user) {
        fetchProfile(data.session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.user) {
        fetchProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  }, []);

  const upsertProfile = useCallback(
    async (input: AuthProfileInput) => {
      if (!user) {
        throw new Error('No authenticated user');
      }

      const payload = {
        id: user.id,
        name: input.name,
        age: input.age,
        bio: input.bio ?? null,
        photo_url: input.photo_url ?? null,
        interests: input.interests,
        gender: input.gender ?? null,
        looking_for: input.looking_for ?? null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload)
        .select('*')
        .single();

      if (error) {
        console.error('Upsert profile failed', error);
        throw error;
      }

      await fetchProfile(user.id);
      return data as Profile;
    },
    [fetchProfile, user]
  );

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [fetchProfile, user]);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      refreshProfile,
      upsertProfile,
    }),
    [
      session,
      user,
      profile,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      refreshProfile,
      upsertProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
