
-- Add missing columns to tenants table for blocking functionality
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT false;

-- Add last login tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_is_blocked ON public.tenants(is_blocked);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON public.profiles(last_login_at);

-- Enhanced function to get workshop data for superadmin
CREATE OR REPLACE FUNCTION public.get_all_workshops_for_superadmin()
RETURNS TABLE(
  tenant_id uuid,
  tenant_name text,
  tenant_status text,
  tenant_plan text,
  tenant_created_at timestamp with time zone,
  tenant_is_blocked boolean,
  workshop_id uuid,
  workshop_name text,
  workshop_email text,
  workshop_phone text,
  workshop_owner_id uuid,
  owner_last_login_at timestamp with time zone,
  user_count integer,
  appointment_count integer,
  vehicle_count integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is superadmin
  IF NOT public.is_superadmin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Superadmin role required';
  END IF;

  RETURN QUERY
  SELECT 
    t.id as tenant_id,
    t.name as tenant_name,
    t.status as tenant_status,
    t.subscription_plan::text as tenant_plan,
    t.created_at as tenant_created_at,
    t.is_blocked as tenant_is_blocked,
    w.id as workshop_id,
    w.name as workshop_name,
    w.email as workshop_email,
    w.phone as workshop_phone,
    w.owner_id as workshop_owner_id,
    p.last_login_at as owner_last_login_at,
    COALESCE(stats.user_count, 0)::integer as user_count,
    COALESCE(stats.appointment_count, 0)::integer as appointment_count,
    COALESCE(stats.vehicle_count, 0)::integer as vehicle_count
  FROM public.tenants t
  LEFT JOIN public.workshops w ON w.tenant_id = t.id
  LEFT JOIN public.profiles p ON p.id = w.owner_id
  LEFT JOIN LATERAL (
    SELECT 
      (SELECT COUNT(*) FROM public.profiles WHERE tenant_id = t.id) as user_count,
      (SELECT COUNT(*) FROM public.appointments WHERE tenant_id = t.id) as appointment_count,
      (SELECT COUNT(*) FROM public.vehicles WHERE tenant_id = t.id) as vehicle_count
  ) stats ON true
  ORDER BY t.created_at DESC;
END;
$$;

-- Function to block/unblock workshop
CREATE OR REPLACE FUNCTION public.toggle_workshop_block(
  p_tenant_id UUID,
  p_is_blocked BOOLEAN,
  p_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is superadmin
  IF NOT public.is_superadmin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Superadmin role required';
  END IF;
  
  -- Update tenant block status
  UPDATE public.tenants
  SET 
    is_blocked = p_is_blocked,
    updated_at = now()
  WHERE id = p_tenant_id;
  
  -- Log the action
  PERFORM public.log_admin_action(
    CASE WHEN p_is_blocked THEN 'workshop_blocked' ELSE 'workshop_unblocked' END,
    p_tenant_id,
    NULL,
    jsonb_build_object('is_blocked', NOT p_is_blocked),
    jsonb_build_object('is_blocked', p_is_blocked),
    jsonb_build_object('reason', p_reason)
  );
END;
$$;

-- Function to track last login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update last login timestamp when user signs in
  UPDATE public.profiles
  SET last_login_at = now()
  WHERE id = auth.uid();
  
  RETURN NULL;
END;
$$;

-- Create trigger to track logins (this will be called from the auth state change)
-- Note: We'll handle this in the frontend auth context since we can't directly trigger on auth.users
