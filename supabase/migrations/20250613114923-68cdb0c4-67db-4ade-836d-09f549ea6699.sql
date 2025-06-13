
-- Add indexes for efficient client-workshop queries
CREATE INDEX IF NOT EXISTS idx_clients_tenant_id ON public.clients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON public.vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_tenant_id ON public.vehicles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_guest_client_id ON public.appointments(guest_client_id);
CREATE INDEX IF NOT EXISTS idx_service_records_client_id ON public.service_records(client_id);
CREATE INDEX IF NOT EXISTS idx_quotations_client_id ON public.quotations(client_id);

-- Function to get client limits based on subscription plan
CREATE OR REPLACE FUNCTION public.get_client_limit(p_tenant_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  tenant_plan TEXT;
  client_limit INTEGER;
BEGIN
  -- Get tenant plan
  SELECT subscription_plan INTO tenant_plan
  FROM public.tenants
  WHERE id = p_tenant_id;

  -- Determine limit based on plan
  client_limit := CASE tenant_plan
    WHEN 'free' THEN 10
    WHEN 'starter' THEN 50
    WHEN 'pro' THEN 200
    WHEN 'enterprise' THEN -1 -- unlimited
    ELSE 10 -- default to free
  END;

  RETURN client_limit;
END;
$$;

-- Function to check if workshop can add more clients
CREATE OR REPLACE FUNCTION public.can_add_client(p_tenant_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  current_count INTEGER;
  client_limit INTEGER;
BEGIN
  -- Get current client count (both authenticated and guest clients)
  SELECT COUNT(*) INTO current_count
  FROM (
    SELECT id FROM public.profiles WHERE tenant_id = p_tenant_id AND role = 'client'
    UNION
    SELECT id FROM public.clients WHERE tenant_id = p_tenant_id
  ) AS all_clients;

  -- Get client limit
  client_limit := public.get_client_limit(p_tenant_id);

  -- Check if within limits
  IF client_limit = -1 THEN
    RETURN TRUE; -- unlimited
  ELSE
    RETURN current_count < client_limit;
  END IF;
END;
$$;

-- Function to search vehicles by license plate within a tenant
CREATE OR REPLACE FUNCTION public.search_vehicles_by_plate(
  p_tenant_id uuid,
  p_search_term text
)
RETURNS TABLE(
  vehicle_id uuid,
  license_plate text,
  make text,
  model text,
  year integer,
  client_id uuid,
  client_name text,
  client_type text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id as vehicle_id,
    v.license_plate,
    v.make,
    v.model,
    v.year,
    COALESCE(v.client_id, v.owner_id) as client_id,
    COALESCE(c.full_name, p.full_name) as client_name,
    CASE 
      WHEN v.client_id IS NOT NULL THEN 'guest'
      ELSE 'auth'
    END as client_type
  FROM public.vehicles v
  LEFT JOIN public.clients c ON v.client_id = c.id
  LEFT JOIN public.profiles p ON v.owner_id = p.id
  WHERE v.tenant_id = p_tenant_id
    AND v.license_plate ILIKE '%' || p_search_term || '%'
  ORDER BY v.license_plate;
END;
$$;

-- Trigger function to auto-associate clients when appointments are created
CREATE OR REPLACE FUNCTION public.auto_associate_client_to_workshop()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- This function ensures clients are properly associated with the workshop's tenant
  -- The association happens automatically through the tenant_id matching
  -- No additional action needed as the client is already created with the correct tenant_id
  RETURN NEW;
END;
$$;

-- Create trigger for appointment client association
DROP TRIGGER IF EXISTS trigger_auto_associate_client ON public.appointments;
CREATE TRIGGER trigger_auto_associate_client
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_associate_client_to_workshop();
