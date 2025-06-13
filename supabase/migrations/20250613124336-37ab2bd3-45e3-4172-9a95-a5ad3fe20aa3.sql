
-- Update the get_client_limit function to return proper client limits
CREATE OR REPLACE FUNCTION public.get_client_limit(p_tenant_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
  tenant_plan TEXT;
  client_limit INTEGER;
BEGIN
  -- Get tenant plan
  SELECT subscription_plan INTO tenant_plan
  FROM public.tenants
  WHERE id = p_tenant_id;

  -- Determine limit based on plan - proper client limits
  client_limit := CASE tenant_plan
    WHEN 'free' THEN 10
    WHEN 'starter' THEN 50
    WHEN 'pro' THEN 200
    WHEN 'enterprise' THEN -1 -- unlimited
    ELSE 10 -- default to free
  END;

  RETURN client_limit;
END;
$function$
