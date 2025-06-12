
-- Add monthly usage tracking table for appointments
CREATE TABLE public.monthly_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  appointments_count INTEGER NOT NULL DEFAULT 0,
  storage_used BIGINT NOT NULL DEFAULT 0, -- in bytes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id, month, year)
);

-- Enable RLS on monthly_usage
ALTER TABLE public.monthly_usage ENABLE ROW LEVEL SECURITY;

-- Create policy for monthly_usage
CREATE POLICY "Users can view their own monthly usage"
  ON public.monthly_usage
  FOR ALL
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND tenant_id = monthly_usage.tenant_id AND role = 'workshop'
  ));

-- Add plan_changes audit table
CREATE TABLE public.plan_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  old_plan TEXT,
  new_plan TEXT NOT NULL,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT
);

-- Enable RLS on plan_changes
ALTER TABLE public.plan_changes ENABLE ROW LEVEL SECURITY;

-- Create policy for plan_changes
CREATE POLICY "Tenant members can view plan changes"
  ON public.plan_changes
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND tenant_id = plan_changes.tenant_id
  ));

-- Function to update monthly usage
CREATE OR REPLACE FUNCTION public.increment_monthly_usage(
  p_tenant_id UUID,
  p_user_id UUID,
  p_type TEXT DEFAULT 'appointment'
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  current_month INTEGER := EXTRACT(MONTH FROM now());
  current_year INTEGER := EXTRACT(YEAR FROM now());
BEGIN
  IF p_type = 'appointment' THEN
    INSERT INTO public.monthly_usage (tenant_id, user_id, month, year, appointments_count)
    VALUES (p_tenant_id, p_user_id, current_month, current_year, 1)
    ON CONFLICT (tenant_id, user_id, month, year)
    DO UPDATE SET 
      appointments_count = monthly_usage.appointments_count + 1,
      updated_at = now();
  END IF;
END;
$$;

-- Function to get current monthly usage
CREATE OR REPLACE FUNCTION public.get_monthly_usage(
  p_tenant_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
  appointments_used INTEGER,
  storage_used BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  current_month INTEGER := EXTRACT(MONTH FROM now());
  current_year INTEGER := EXTRACT(YEAR FROM now());
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(mu.appointments_count), 0)::INTEGER as appointments_used,
    COALESCE(SUM(mu.storage_used), 0)::BIGINT as storage_used
  FROM public.monthly_usage mu
  WHERE mu.tenant_id = p_tenant_id
    AND mu.month = current_month
    AND mu.year = current_year
    AND (p_user_id IS NULL OR mu.user_id = p_user_id);
END;
$$;

-- Function to check if user can create appointment based on plan limits
CREATE OR REPLACE FUNCTION public.can_create_appointment(
  p_tenant_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  tenant_plan TEXT;
  appointments_used INTEGER;
  appointment_limit INTEGER;
BEGIN
  -- Get tenant plan
  SELECT subscription_plan INTO tenant_plan
  FROM public.tenants
  WHERE id = p_tenant_id;

  -- Get current usage
  SELECT appointments_used INTO appointments_used
  FROM public.get_monthly_usage(p_tenant_id);

  -- Determine limit based on plan
  appointment_limit := CASE tenant_plan
    WHEN 'free' THEN 20
    WHEN 'starter' THEN 50
    WHEN 'pro' THEN 200
    WHEN 'enterprise' THEN -1 -- unlimited
    ELSE 20 -- default to free
  END;

  -- Check if within limits
  IF appointment_limit = -1 THEN
    RETURN TRUE; -- unlimited
  ELSE
    RETURN appointments_used < appointment_limit;
  END IF;
END;
$$;

-- Trigger to increment appointment usage when appointment is created
CREATE OR REPLACE FUNCTION public.track_appointment_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only track confirmed appointments
  IF NEW.status = 'confirmed' THEN
    PERFORM public.increment_monthly_usage(NEW.tenant_id, COALESCE(NEW.client_id, NEW.workshop_id), 'appointment');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for appointment usage tracking
DROP TRIGGER IF EXISTS track_appointment_usage_trigger ON public.appointments;
CREATE TRIGGER track_appointment_usage_trigger
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.track_appointment_usage();

-- Set existing users to free plan (migration)
UPDATE public.tenants 
SET subscription_plan = 'free' 
WHERE subscription_plan IS NULL;
