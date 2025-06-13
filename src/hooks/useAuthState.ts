
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchUserProfile = async (userId: string, retryCount = 0) => {
    if (!userId) {
      console.error('Cannot fetch profile: no user ID provided');
      setLoading(false);
      return;
    }

    console.log('Fetching profile for user:', userId, 'retry:', retryCount);
    
    try {
      // Use the userId directly since profiles.id is now TEXT
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId) // Direct comparison, no casting needed
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
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
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      setProfileError('Failed to load profile');
      setLoading(false);
    }
  };

  const updateLastLogin = async (userId: string) => {
    if (!userId) {
      console.error('Cannot update last login: no user ID provided');
      return;
    }

    try {
      // Use the userId directly since profiles.id is now TEXT
      const { error } = await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId); // Direct comparison, no casting needed
      
      if (error) {
        console.error('Error updating last login:', error);
      } else {
        console.log('Last login updated successfully');
      }
    } catch (error) {
      console.error('Error updating last login:', error);
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
          console.log('User authenticated, fetching profile for:', session.user.id);
          // Fetch user profile when authenticated - user.id is already TEXT from Supabase
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
