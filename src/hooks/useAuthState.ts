import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';
import { isValidUUID, logInvalidUUID, isUUIDError } from '@/utils/uuid';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileFetchCount, setProfileFetchCount] = useState(0); // For deduplication/debug

  const handleInvalidUser = async (userId: string, context: string) => {
    logInvalidUUID(context, userId);
    setProfileError('Invalid user session detected. Please sign in again.');
    setLoading(false);
    
    try {
      await supabase.auth.signOut();
      // Force redirect to auth page
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1000);
    } catch (error) {
      console.error('Error during forced logout:', error);
      window.location.href = '/auth';
    }
  };

  // --- HARD FAILSAFE: maximum loading time ---
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (loading) {
      timeout = setTimeout(() => {
        console.error("[AuthState] Profile loading timeout reached! Setting loading=false to avoid indefinite spinner.");
        setLoading(false);
        setProfileError((prev) => prev || 'We were unable to load your profile. Please retry or contact support.');
      }, 10000); // 10 seconds
    }
    return () => { if (timeout) clearTimeout(timeout); };
  }, [loading]);

  // --- Robust Profile Fetch with Deduplication and Failsafes ---
  const fetchUserProfile = async (userId: string, retryCount = 0) => {
    setProfileFetchCount((c) => c + 1);
    if (!userId) {
      console.error('[AuthState] fetchUserProfile: no userId');
      setLoading(false);
      return;
    }
    if (!isValidUUID(userId)) {
      await handleInvalidUser(userId, 'fetchUserProfile');
      return;
    }
    console.log('[AuthState] Fetching profile for user:', userId, 'retry:', retryCount);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[AuthState] Profile fetch error:', error);
        if (isUUIDError(error)) {
          await handleInvalidUser(userId, 'fetchUserProfile - UUID error');
          return;
        }
        setProfile(null);
        setProfileError(error.message);
        setLoading(false);
        // Retry on network/temporary errors only (code 'PGRST000' or no code)
        if (retryCount < 2 && (error.code === 'PGRST000' || !error.code)) {
          console.log('[AuthState] Scheduling retry in 1s...');
          setTimeout(() => {
            setLoading(true);
            fetchUserProfile(userId, retryCount + 1);
          }, 1000);
        }
        return;
      }
      if (!data) {
        console.warn('[AuthState] Profile fetch: No profile found for user:', userId);
        setProfile(null);
        setProfileError(null);
        setLoading(false);
        return;
      }
      // Success
      console.log('[AuthState] Profile fetched successfully:', data);
      setProfile(data as Profile);
      setProfileError(null);
      setLoading(false);
    } catch (error: any) {
      console.error('[AuthState] Unexpected fetch error:', error);
      if (isUUIDError(error)) {
        await handleInvalidUser(userId, 'fetchUserProfile - catch block');
        return;
      }
      setProfileError('[Unexpected error]: Failed to load profile');
      setLoading(false);
    }
  };

  const updateLastLogin = async (userId: string) => {
    if (!userId) {
      console.error('Cannot update last login: no user ID provided');
      return;
    }

    // Validate UUID before making database query
    if (!isValidUUID(userId)) {
      logInvalidUUID('updateLastLogin', userId);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating last login:', error);
        
        // Check if it's a UUID error
        if (isUUIDError(error)) {
          await handleInvalidUser(userId, 'updateLastLogin');
          return;
        }
      } else {
        console.log('Last login updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating last login:', error);
      
      // Check if it's a UUID error
      if (isUUIDError(error)) {
        await handleInvalidUser(userId, 'updateLastLogin - catch block');
        return;
      }
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AuthState] Auth event:', event, session?.user?.id || 'no user');
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          if (!isValidUUID(session.user.id)) {
            handleInvalidUser(session.user.id, 'onAuthStateChange');
            return;
          }
          // Profile fetch is deferred, so multiple auth events during page load are collapsed
          fetchUserProfile(session.user.id);
          if (event === 'SIGNED_IN') {
            updateLastLogin(session.user.id);
          }
        } else {
          setProfile(null);
          setProfileError(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthState] Initial session check:', session?.user?.id || 'no session');
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        if (!isValidUUID(session.user.id)) {
          handleInvalidUser(session.user.id, 'getSession');
          return;
        }
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    profile,
    session,
    loading,
    profileError,
    setProfile,
    fetchUserProfile: (userId: string) => fetchUserProfile(userId, 0)
  };
};
