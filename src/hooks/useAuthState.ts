
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

  const fetchUserProfile = async (userId: string, retryCount = 0) => {
    if (!userId) {
      console.error('Cannot fetch profile: no user ID provided');
      setLoading(false);
      return;
    }

    // Validate UUID before making any database queries
    if (!isValidUUID(userId)) {
      await handleInvalidUser(userId, 'fetchUserProfile');
      return;
    }

    console.log('Fetching profile for user:', userId, 'retry:', retryCount);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // Check if it's a UUID error specifically
        if (isUUIDError(error)) {
          await handleInvalidUser(userId, 'fetchUserProfile - UUID error');
          return;
        }
        
        setProfileError(error.message);
        setLoading(false);
        
        // Schedule retry for network/temporary errors only
        if (retryCount < 2 && (error.code === 'PGRST000' || !error.code)) {
          console.log('Scheduling profile fetch retry in 1 second...');
          setTimeout(() => {
            setLoading(true);
            fetchUserProfile(userId, retryCount + 1);
          }, 1000);
        }
        return;
      }

      console.log('Profile fetched successfully:', data);
      setProfile(data as Profile);
      setProfileError(null);
      setLoading(false);
    } catch (error: any) {
      console.error('Unexpected error fetching profile:', error);
      
      // Check if it's a UUID error
      if (isUUIDError(error)) {
        await handleInvalidUser(userId, 'fetchUserProfile - catch block');
        return;
      }
      
      setProfileError('Failed to load profile');
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
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id || 'no user');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Validate user ID immediately on auth state change
          if (!isValidUUID(session.user.id)) {
            await handleInvalidUser(session.user.id, 'onAuthStateChange');
            return;
          }
          
          console.log('User authenticated, fetching profile for:', session.user.id);
          await fetchUserProfile(session.user.id);
          
          // Update last login timestamp only for sign in events
          if (event === 'SIGNED_IN') {
            await updateLastLogin(session.user.id);
          }
        } else {
          console.log('No user session, clearing profile and stopping loading');
          setProfile(null);
          setProfileError(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id || 'no session');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Validate user ID immediately on initial session check
        if (!isValidUUID(session.user.id)) {
          handleInvalidUser(session.user.id, 'getSession');
          return;
        }
        
        console.log('Found existing session, fetching profile');
        fetchUserProfile(session.user.id);
      } else {
        console.log('No existing session, stopping loading');
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
