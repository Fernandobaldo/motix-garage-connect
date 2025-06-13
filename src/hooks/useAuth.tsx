import { ReactNode } from 'react';
import AuthContext from '@/contexts/AuthContext';
import { useAuthState } from './useAuthState';
import { useAuthActions } from './useAuthActions';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, profile, session, loading, setProfile, fetchUserProfile } = useAuthState();
  
  // Create setters for auth actions
  const setUser = (newUser: any) => {
    // The user state is managed by useAuthState through the auth listener
    // This is just a placeholder to satisfy the useAuthActions interface
  };
  
  const setSession = (newSession: any) => {
    // The session state is managed by useAuthState through the auth listener
    // This is just a placeholder to satisfy the useAuthActions interface
  };

  const { signIn, signUp, signOut, updateProfile } = useAuthActions(
    user,
    fetchUserProfile,
    setUser,
    setProfile,
    setSession
  );

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { useAuth } from '@/contexts/AuthContext';
