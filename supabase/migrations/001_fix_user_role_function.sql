
-- Drop and recreate the handle_new_user function with proper enum handling
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

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
    -- For clients, tenant_id will be set later when they book with a workshop
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

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
