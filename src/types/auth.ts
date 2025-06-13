
import { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: 'client' | 'workshop' | 'admin' | 'superadmin';
  tenant_id: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  profileError: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: { full_name: string; phone: string; role: 'client' | 'workshop' }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

export interface SignUpData {
  full_name: string;
  phone: string;
  role: 'client' | 'workshop';
}
