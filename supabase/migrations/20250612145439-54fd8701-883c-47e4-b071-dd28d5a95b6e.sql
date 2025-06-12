
-- Add missing columns to tenants table
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS trial_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES public.profiles(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_trial_until ON public.tenants(trial_until);

-- Create admin_actions table
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  action_type TEXT NOT NULL,
  target_tenant_id UUID REFERENCES public.tenants(id),
  target_user_id UUID REFERENCES public.profiles(id),
  old_values JSONB,
  new_values JSONB,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for admin actions
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_tenant_id ON public.admin_actions(target_tenant_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON public.admin_actions(created_at);

-- Enable RLS
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Superadmins can access all admin actions" 
ON public.admin_actions 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'superadmin'
  )
);

-- Function to get workshop statistics
CREATE OR REPLACE FUNCTION public.get_workshop_stats(workshop_tenant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  user_count INTEGER;
  appointment_count INTEGER;
  vehicle_count INTEGER;
  monthly_usage RECORD;
BEGIN
  -- Count users in this tenant
  SELECT COUNT(*) INTO user_count
  FROM public.profiles
  WHERE tenant_id = workshop_tenant_id;
  
  -- Count appointments
  SELECT COUNT(*) INTO appointment_count
  FROM public.appointments
  WHERE tenant_id = workshop_tenant_id;
  
  -- Count vehicles
  SELECT COUNT(*) INTO vehicle_count
  FROM public.vehicles
  WHERE tenant_id = workshop_tenant_id;
  
  -- Get monthly usage
  SELECT * INTO monthly_usage
  FROM public.get_monthly_usage(workshop_tenant_id);
  
  RETURN jsonb_build_object(
    'user_count', user_count,
    'appointment_count', appointment_count,
    'vehicle_count', vehicle_count,
    'monthly_appointments', COALESCE(monthly_usage.appointments_used, 0),
    'monthly_storage', COALESCE(monthly_usage.storage_used, 0)
  );
END;
$$;

-- Function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'superadmin'
  );
$$;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action_type TEXT,
  p_target_tenant_id UUID DEFAULT NULL,
  p_target_user_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  action_id UUID;
BEGIN
  -- Only allow superadmins to log actions
  IF NOT public.is_superadmin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Superadmin role required';
  END IF;
  
  INSERT INTO public.admin_actions (
    admin_id,
    action_type,
    target_tenant_id,
    target_user_id,
    old_values,
    new_values,
    details
  ) VALUES (
    auth.uid(),
    p_action_type,
    p_target_tenant_id,
    p_target_user_id,
    p_old_values,
    p_new_values,
    p_details
  ) RETURNING id INTO action_id;
  
  RETURN action_id;
END;
$$;

-- Function to manage workshop status
CREATE OR REPLACE FUNCTION public.manage_workshop_status(
  p_tenant_id UUID,
  p_new_status TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_status TEXT;
BEGIN
  -- Check if user is superadmin
  IF NOT public.is_superadmin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Superadmin role required';
  END IF;
  
  -- Validate status
  IF p_new_status NOT IN ('active', 'suspended') THEN
    RAISE EXCEPTION 'Invalid status. Must be active or suspended';
  END IF;
  
  -- Get current status
  SELECT status INTO old_status FROM public.tenants WHERE id = p_tenant_id;
  
  -- Update tenant status
  UPDATE public.tenants
  SET 
    status = p_new_status,
    suspended_at = CASE WHEN p_new_status = 'suspended' THEN now() ELSE NULL END,
    suspended_by = CASE WHEN p_new_status = 'suspended' THEN auth.uid() ELSE NULL END,
    updated_at = now()
  WHERE id = p_tenant_id;
  
  -- Log the action
  PERFORM public.log_admin_action(
    'status_change',
    p_tenant_id,
    NULL,
    jsonb_build_object('status', old_status),
    jsonb_build_object('status', p_new_status),
    jsonb_build_object('reason', p_reason)
  );
END;
$$;

-- Function to update workshop plan
CREATE OR REPLACE FUNCTION public.update_workshop_plan(
  p_tenant_id UUID,
  p_new_plan TEXT,
  p_trial_until TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_plan TEXT;
  old_trial TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if user is superadmin
  IF NOT public.is_superadmin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Superadmin role required';
  END IF;
  
  -- Validate plan
  IF p_new_plan NOT IN ('free', 'starter', 'pro', 'enterprise') THEN
    RAISE EXCEPTION 'Invalid plan. Must be free, starter, pro, or enterprise';
  END IF;
  
  -- Get current values
  SELECT subscription_plan, trial_until INTO old_plan, old_trial 
  FROM public.tenants WHERE id = p_tenant_id;
  
  -- Update tenant plan
  UPDATE public.tenants
  SET 
    subscription_plan = p_new_plan::subscription_plan,
    trial_until = p_trial_until,
    updated_at = now()
  WHERE id = p_tenant_id;
  
  -- Log the action
  PERFORM public.log_admin_action(
    'plan_change',
    p_tenant_id,
    NULL,
    jsonb_build_object('plan', old_plan, 'trial_until', old_trial),
    jsonb_build_object('plan', p_new_plan, 'trial_until', p_trial_until),
    NULL
  );
  
  -- Also log in plan_changes table for compatibility if it exists
  INSERT INTO public.plan_changes (tenant_id, old_plan, new_plan, changed_by, reason)
  SELECT p_tenant_id, old_plan, p_new_plan, auth.uid(), 'Admin update'
  WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plan_changes');
END;
$$;
