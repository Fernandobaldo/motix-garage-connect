
-- Step 1: Fix notification trigger to prevent workshop from notifying itself
CREATE OR REPLACE FUNCTION public.notify_appointment_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only create notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Only notify client about status change (don't notify workshop about their own changes)
    IF NEW.client_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, tenant_id, title, message, type, related_id, related_type)
      VALUES (
        NEW.client_id,
        NEW.tenant_id,
        'Appointment Status Updated',
        'Your ' || NEW.service_type || ' appointment status changed to: ' || NEW.status,
        CASE 
          WHEN NEW.status = 'completed' THEN 'success'
          WHEN NEW.status = 'cancelled' THEN 'warning'
          WHEN NEW.status = 'confirmed' THEN 'info'
          ELSE 'info'
        END,
        NEW.id,
        'appointment'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Step 2: Update handle_new_user function to properly assign tenant_id for clients
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_tenant_id UUID;
  user_role_value public.user_role;
BEGIN
  -- Safely extract and cast the role from metadata
  user_role_value := COALESCE(
    (NEW.raw_user_meta_data ->> 'role')::public.user_role, 
    'client'::public.user_role
  );

  -- If user is signing up as workshop, create a new tenant
  IF user_role_value = 'workshop' THEN
    INSERT INTO public.tenants (name) 
    VALUES (COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New Workshop'))
    RETURNING id INTO user_tenant_id;
  ELSE
    -- For clients, they get assigned a tenant when they book with a workshop
    -- For now, set to null but this will be updated when they create appointments
    user_tenant_id := NULL;
  END IF;

  -- Create the profile
  INSERT INTO public.profiles (id, full_name, phone, role, tenant_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    user_role_value,
    user_tenant_id
  );

  -- If workshop user, also create workshop record
  IF user_tenant_id IS NOT NULL THEN
    INSERT INTO public.workshops (owner_id, tenant_id, name, email, phone)
    VALUES (
      NEW.id,
      user_tenant_id,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New Workshop'),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data ->> 'phone', '')
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Step 3: Create a function to assign clients to workshop tenant when they book
CREATE OR REPLACE FUNCTION public.assign_client_to_workshop_tenant()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update client's tenant_id to match the workshop they're booking with
  IF NEW.client_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET tenant_id = NEW.tenant_id 
    WHERE id = NEW.client_id AND tenant_id IS NULL;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to assign client to workshop tenant on appointment creation
DROP TRIGGER IF EXISTS assign_client_tenant_trigger ON public.appointments;
CREATE TRIGGER assign_client_tenant_trigger
  BEFORE INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION assign_client_to_workshop_tenant();
