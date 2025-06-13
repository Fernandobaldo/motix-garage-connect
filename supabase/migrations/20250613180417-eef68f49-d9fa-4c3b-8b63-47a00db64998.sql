
-- Enhanced function to handle automatic client and vehicle association to workshop tenant
CREATE OR REPLACE FUNCTION public.auto_associate_client_and_vehicle_to_workshop()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  workshop_tenant_id uuid;
  client_record record;
  vehicle_record record;
BEGIN
  -- Get the workshop's tenant_id
  SELECT tenant_id INTO workshop_tenant_id 
  FROM public.workshops 
  WHERE id = NEW.workshop_id;
  
  IF workshop_tenant_id IS NULL THEN
    -- If no workshop found, use the appointment's tenant_id
    workshop_tenant_id := NEW.tenant_id;
  END IF;

  -- Handle authenticated client association
  IF NEW.client_id IS NOT NULL THEN
    -- Get current client data
    SELECT * INTO client_record 
    FROM public.profiles 
    WHERE id = NEW.client_id;
    
    -- Only update tenant_id if it's NULL (new client) or different (switching workshops)
    IF client_record.tenant_id IS NULL OR client_record.tenant_id != workshop_tenant_id THEN
      UPDATE public.profiles 
      SET tenant_id = workshop_tenant_id,
          updated_at = now()
      WHERE id = NEW.client_id;
      
      -- Log the association
      INSERT INTO public.notifications (user_id, tenant_id, title, message, type)
      VALUES (
        NEW.client_id,
        workshop_tenant_id,
        'Associated with Workshop',
        'You have been associated with a new workshop through your appointment.',
        'info'
      );
    END IF;
  END IF;

  -- Handle guest client association
  IF NEW.guest_client_id IS NOT NULL THEN
    -- Ensure guest client has correct tenant_id
    UPDATE public.clients 
    SET tenant_id = workshop_tenant_id,
        updated_at = now()
    WHERE id = NEW.guest_client_id 
      AND (tenant_id IS NULL OR tenant_id != workshop_tenant_id);
  END IF;

  -- Handle vehicle association
  IF NEW.vehicle_id IS NOT NULL THEN
    -- Get current vehicle data
    SELECT * INTO vehicle_record 
    FROM public.vehicles 
    WHERE id = NEW.vehicle_id;
    
    -- Update vehicle tenant_id if needed
    IF vehicle_record.tenant_id IS NULL OR vehicle_record.tenant_id != workshop_tenant_id THEN
      UPDATE public.vehicles 
      SET tenant_id = workshop_tenant_id,
          updated_at = now()
      WHERE id = NEW.vehicle_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Replace the existing trigger with the enhanced one
DROP TRIGGER IF EXISTS assign_client_tenant_trigger ON public.appointments;
CREATE TRIGGER auto_associate_client_vehicle_trigger
  BEFORE INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION auto_associate_client_and_vehicle_to_workshop();

-- Function to verify and repair associations (useful for data integrity)
CREATE OR REPLACE FUNCTION public.verify_client_workshop_associations()
RETURNS TABLE(
  appointment_id uuid,
  client_id uuid,
  guest_client_id uuid,
  vehicle_id uuid,
  workshop_tenant_id uuid,
  association_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as appointment_id,
    a.client_id,
    a.guest_client_id,
    a.vehicle_id,
    w.tenant_id as workshop_tenant_id,
    CASE 
      WHEN a.client_id IS NOT NULL AND p.tenant_id != w.tenant_id THEN 'client_mismatch'
      WHEN a.guest_client_id IS NOT NULL AND c.tenant_id != w.tenant_id THEN 'guest_client_mismatch'
      WHEN a.vehicle_id IS NOT NULL AND v.tenant_id != w.tenant_id THEN 'vehicle_mismatch'
      ELSE 'ok'
    END as association_status
  FROM public.appointments a
  JOIN public.workshops w ON a.workshop_id = w.id
  LEFT JOIN public.profiles p ON a.client_id = p.id
  LEFT JOIN public.clients c ON a.guest_client_id = c.id
  LEFT JOIN public.vehicles v ON a.vehicle_id = v.id
  WHERE (
    (a.client_id IS NOT NULL AND p.tenant_id != w.tenant_id) OR
    (a.guest_client_id IS NOT NULL AND c.tenant_id != w.tenant_id) OR
    (a.vehicle_id IS NOT NULL AND v.tenant_id != w.tenant_id)
  );
END;
$function$;

-- Enhanced RLS policies for client access by workshops
CREATE POLICY "Workshops can view their associated clients" 
  ON public.profiles 
  FOR SELECT 
  USING (
    tenant_id = public.get_current_user_tenant_id() OR
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.client_id = profiles.id 
        AND a.tenant_id = public.get_current_user_tenant_id()
    )
  );

-- Enhanced RLS policy for guest clients
CREATE POLICY "Workshops can view their guest clients" 
  ON public.clients 
  FOR SELECT 
  USING (tenant_id = public.get_current_user_tenant_id());

-- Enhanced RLS policy for vehicles associated through appointments
CREATE POLICY "Workshops can view vehicles through appointments" 
  ON public.vehicles 
  FOR SELECT 
  USING (
    tenant_id = public.get_current_user_tenant_id() OR
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.vehicle_id = vehicles.id 
        AND a.tenant_id = public.get_current_user_tenant_id()
    )
  );

-- Function to get association statistics for a workshop
CREATE OR REPLACE FUNCTION public.get_workshop_association_stats(p_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
DECLARE
  auth_clients_count integer;
  guest_clients_count integer;
  vehicles_count integer;
  appointments_count integer;
BEGIN
  -- Count authenticated clients
  SELECT COUNT(*) INTO auth_clients_count
  FROM public.profiles
  WHERE tenant_id = p_tenant_id AND role = 'client';
  
  -- Count guest clients
  SELECT COUNT(*) INTO guest_clients_count
  FROM public.clients
  WHERE tenant_id = p_tenant_id;
  
  -- Count vehicles
  SELECT COUNT(*) INTO vehicles_count
  FROM public.vehicles
  WHERE tenant_id = p_tenant_id;
  
  -- Count appointments
  SELECT COUNT(*) INTO appointments_count
  FROM public.appointments
  WHERE tenant_id = p_tenant_id;
  
  RETURN jsonb_build_object(
    'authenticated_clients', auth_clients_count,
    'guest_clients', guest_clients_count,
    'total_clients', auth_clients_count + guest_clients_count,
    'vehicles', vehicles_count,
    'appointments', appointments_count
  );
END;
$function$;
