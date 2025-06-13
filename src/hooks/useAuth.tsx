
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: 'client' | 'workshop' | 'admin' | 'superadmin';
  tenant_id: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: { full_name: string; phone: string; role: 'client' | 'workshop' }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User authenticated, fetching profile for:', session.user.id);
          // Fetch user profile when authenticated
          await fetchUserProfile(session.user.id);
          
          // Update last login timestamp only after profile is loaded and for sign in events
          if (event === 'SIGNED_IN') {
            await updateLastLogin(session.user.id);
          }
        } else {
          console.log('No user session, clearing profile');
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('Found existing session, fetching profile');
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateLastLogin = async (userId: string) => {
    if (!userId) {
      console.error('Cannot update last login: no user ID provided');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating last login:', error);
      } else {
        console.log('Last login updated successfully');
      }
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    if (!userId) {
      console.error('Cannot fetch profile: no user ID provided');
      return;
    }

    console.log('Fetching profile for user:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        console.error('Error details:', error.message, error.code, error.details);
        return;
      }

      console.log('Profile fetched successfully:', data);
      setProfile(data as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      }

      return { error };
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: { full_name: string; phone: string; role: 'client' | 'workshop' }
  ) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Successful!",
          description: "Please check your email to verify your account.",
        });
      }

      return { error };
    } catch (error) {
      toast({
        title: "Sign Up Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) {
      const error = 'No user logged in';
      toast({
        title: "Update Failed",
        description: error,
        variant: "destructive",
      });
      return { error };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Refresh profile data
      await fetchUserProfile(user.id);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      return { error: null };
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn: async (email: string, password: string) => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({
            title: "Sign In Failed",
            description: error.message,
            variant: "destructive",
          });
        }

        return { error };
      } catch (error) {
        toast({
          title: "Sign In Failed",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        return { error };
      }
    },
    signUp: async (
      email: string, 
      password: string, 
      userData: { full_name: string; phone: string; role: 'client' | 'workshop' }
    ) => {
      try {
        const redirectUrl = `${window.location.origin}/`;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: userData
          }
        });

        if (error) {
          toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration Successful!",
            description: "Please check your email to verify your account.",
          });
        }

        return { error };
      } catch (error) {
        toast({
          title: "Sign Up Failed",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        return { error };
      }
    },
    signOut: async () => {
      try {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
        });
      } catch (error) {
        console.error('Error signing out:', error);
      }
    },
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
