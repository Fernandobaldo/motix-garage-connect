
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Profile, SignUpData } from '@/types/auth';
import { isValidUUID, logInvalidUUID, isUUIDError } from '@/utils/uuid';

export const useAuthActions = (
  user: any,
  fetchUserProfile: (userId: string) => Promise<void>,
  setUser: (user: any) => void,
  setProfile: (profile: Profile | null) => void,
  setSession: (session: any) => void
) => {
  const { toast } = useToast();

  const handleAuthError = (error: any, context: string) => {
    console.error(`Auth error in ${context}:`, error);
    
    if (isUUIDError(error)) {
      toast({
        title: "Session Error",
        description: "Your session is corrupted. Please sign in again.",
        variant: "destructive",
      });
      
      // Force logout and redirect
      supabase.auth.signOut().then(() => {
        window.location.href = '/auth';
      });
      return;
    }
    
    toast({
      title: `${context} Failed`,
      description: error.message || "An unexpected error occurred",
      variant: "destructive",
    });
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        handleAuthError(error, "Sign In");
      }

      return { error };
    } catch (error: any) {
      handleAuthError(error, "Sign In");
      return { error };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: SignUpData
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
        handleAuthError(error, "Sign Up");
      } else {
        toast({
          title: "Registration Successful!",
          description: "Please check your email to verify your account.",
        });
      }

      return { error };
    } catch (error: any) {
      handleAuthError(error, "Sign Up");
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
    } catch (error: any) {
      console.error('Error signing out:', error);
      // Force clear state even if signOut fails
      setUser(null);
      setProfile(null);
      setSession(null);
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

    // Validate user ID before database operation
    if (!isValidUUID(user.id)) {
      logInvalidUUID('updateProfile', user.id);
      toast({
        title: "Session Error",
        description: "Your session is corrupted. Please sign in again.",
        variant: "destructive",
      });
      
      await signOut();
      window.location.href = '/auth';
      return { error: 'Invalid user session' };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        if (isUUIDError(error)) {
          logInvalidUUID('updateProfile - database error', user.id);
          toast({
            title: "Session Error",
            description: "Your session is corrupted. Please sign in again.",
            variant: "destructive",
          });
          
          await signOut();
          window.location.href = '/auth';
          return { error: 'Invalid user session' };
        }
        
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
    } catch (error: any) {
      if (isUUIDError(error)) {
        logInvalidUUID('updateProfile - catch block', user.id);
        toast({
          title: "Session Error",
          description: "Your session is corrupted. Please sign in again.",
          variant: "destructive",
        });
        
        await signOut();
        window.location.href = '/auth';
        return { error: 'Invalid user session' };
      }
      
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    updateProfile
  };
};
