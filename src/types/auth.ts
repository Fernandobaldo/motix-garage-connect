
export interface Profile {
  id: string; // Changed from UUID to string
  full_name: string;
  phone: string | null;
  role: 'client' | 'workshop' | 'admin' | 'superadmin';
  tenant_id: string | null; // UUID type for tenant_id remains unchanged
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface SignUpData {
  full_name: string;
  phone?: string;
  role: 'client' | 'workshop';
}
