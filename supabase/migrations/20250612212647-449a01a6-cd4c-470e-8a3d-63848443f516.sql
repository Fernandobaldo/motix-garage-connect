
-- Drop the existing constraint first
ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Update any existing status values that don't match our expected values
UPDATE public.appointments 
SET status = 'pending' 
WHERE status NOT IN ('pending', 'confirmed', 'completed', 'cancelled');

-- Add the reservation columns
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS reservation_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reservation_token TEXT;

-- Add the updated constraint with pending_confirmation included
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'pending_confirmation'));

-- Create workshop_public_links table
CREATE TABLE IF NOT EXISTS public.workshop_public_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workshop_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints (with IF NOT EXISTS check via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'workshop_public_links_workshop_id_fkey'
  ) THEN
    ALTER TABLE public.workshop_public_links
    ADD CONSTRAINT workshop_public_links_workshop_id_fkey
    FOREIGN KEY (workshop_id) REFERENCES public.workshops(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'workshop_public_links_tenant_id_fkey'
  ) THEN
    ALTER TABLE public.workshop_public_links
    ADD CONSTRAINT workshop_public_links_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS for workshop_public_links
ALTER TABLE public.workshop_public_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Workshop owners can manage their public links" ON public.workshop_public_links;
DROP POLICY IF EXISTS "Public can read active workshop links" ON public.workshop_public_links;

-- Create RLS policies for workshop_public_links
CREATE POLICY "Workshop owners can manage their public links"
ON public.workshop_public_links
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.workshops w
    WHERE w.id = workshop_public_links.workshop_id
    AND w.owner_id = auth.uid()
  )
);

-- Public read access for active links (needed for public booking page)
CREATE POLICY "Public can read active workshop links"
ON public.workshop_public_links
FOR SELECT
USING (is_active = true);

-- Function to get workshop public data (for public booking page)
CREATE OR REPLACE FUNCTION public.get_workshop_public_data(workshop_slug text)
RETURNS TABLE(
  workshop_id uuid,
  workshop_name text,
  workshop_email text,
  workshop_phone text,
  workshop_address text,
  working_hours jsonb,
  logo_url text,
  primary_color text,
  secondary_color text,
  accent_color text,
  services_offered text[],
  tenant_id uuid
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id as workshop_id,
    w.name as workshop_name,
    w.email as workshop_email,
    w.phone as workshop_phone,
    w.address as workshop_address,
    w.working_hours,
    w.logo_url,
    w.primary_color,
    w.secondary_color,
    w.accent_color,
    w.services_offered,
    w.tenant_id
  FROM public.workshops w
  JOIN public.workshop_public_links wpl ON w.id = wpl.workshop_id
  WHERE wpl.slug = workshop_slug 
    AND wpl.is_active = true;
END;
$$;

-- Function to create temporary reservation
CREATE OR REPLACE FUNCTION public.create_temporary_reservation(
  p_workshop_id uuid,
  p_tenant_id uuid,
  p_scheduled_at timestamp with time zone,
  p_service_type text,
  p_client_email text,
  p_client_name text,
  p_client_phone text DEFAULT NULL,
  p_vehicle_info text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS TABLE(
  appointment_id uuid,
  reservation_token text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token text;
  apt_id uuid;
  expires_at timestamp with time zone;
BEGIN
  -- Generate secure token
  token := encode(gen_random_bytes(32), 'hex');
  
  -- Set expiration to 30 minutes from now
  expires_at := now() + interval '30 minutes';
  
  -- Check if slot is available (not already booked or reserved)
  IF EXISTS (
    SELECT 1 FROM public.appointments 
    WHERE workshop_id = p_workshop_id
      AND scheduled_at = p_scheduled_at
      AND status IN ('confirmed', 'pending_confirmation')
      AND (reservation_expires_at IS NULL OR reservation_expires_at > now())
  ) THEN
    RAISE EXCEPTION 'Time slot is not available';
  END IF;
  
  -- Create temporary reservation
  INSERT INTO public.appointments (
    tenant_id,
    workshop_id,
    service_type,
    scheduled_at,
    status,
    reservation_expires_at,
    reservation_token,
    description
  ) VALUES (
    p_tenant_id,
    p_workshop_id,
    p_service_type,
    p_scheduled_at,
    'pending_confirmation',
    expires_at,
    token,
    jsonb_build_object(
      'client_email', p_client_email,
      'client_name', p_client_name,
      'client_phone', p_client_phone,
      'vehicle_info', p_vehicle_info,
      'notes', p_notes
    )::text
  )
  RETURNING id INTO apt_id;
  
  RETURN QUERY SELECT apt_id, token;
END;
$$;

-- Function to confirm reservation and create account
CREATE OR REPLACE FUNCTION public.confirm_reservation(
  p_reservation_token text,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  appointment_data record;
  client_data jsonb;
BEGIN
  -- Get appointment with reservation token
  SELECT * INTO appointment_data
  FROM public.appointments
  WHERE reservation_token = p_reservation_token
    AND status = 'pending_confirmation'
    AND reservation_expires_at > now();
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired reservation token';
  END IF;
  
  -- Parse client data from description
  client_data := appointment_data.description::jsonb;
  
  -- Update appointment with client_id and confirm status
  UPDATE public.appointments
  SET 
    client_id = p_user_id,
    status = 'confirmed',
    reservation_expires_at = NULL,
    reservation_token = NULL,
    updated_at = now()
  WHERE id = appointment_data.id;
  
  -- Update client's tenant_id to match workshop
  UPDATE public.profiles
  SET tenant_id = appointment_data.tenant_id
  WHERE id = p_user_id AND tenant_id IS NULL;
  
  RETURN true;
END;
$$;

-- Function to cleanup expired reservations
CREATE OR REPLACE FUNCTION public.cleanup_expired_reservations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cleanup_count integer;
BEGIN
  DELETE FROM public.appointments
  WHERE status = 'pending_confirmation'
    AND reservation_expires_at IS NOT NULL
    AND reservation_expires_at < now();
    
  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  RETURN cleanup_count;
END;
$$;

-- Function to generate or get workshop public link
CREATE OR REPLACE FUNCTION public.generate_workshop_public_link(
  p_workshop_id uuid,
  p_custom_slug text DEFAULT NULL
)
RETURNS TABLE(
  link_id uuid,
  slug text,
  public_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  workshop_data record;
  generated_slug text;
  link_record record;
BEGIN
  -- Check if user owns the workshop
  SELECT * INTO workshop_data
  FROM public.workshops w
  WHERE w.id = p_workshop_id
    AND w.owner_id = auth.uid();
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workshop not found or access denied';
  END IF;
  
  -- Check if link already exists
  SELECT * INTO link_record
  FROM public.workshop_public_links
  WHERE workshop_id = p_workshop_id;
  
  IF FOUND THEN
    -- Return existing link
    RETURN QUERY SELECT 
      link_record.id,
      link_record.slug,
      '/book/' || link_record.slug as public_url;
    RETURN;
  END IF;
  
  -- Generate slug
  IF p_custom_slug IS NOT NULL THEN
    generated_slug := lower(regexp_replace(p_custom_slug, '[^a-zA-Z0-9-]', '-', 'g'));
  ELSE
    generated_slug := lower(regexp_replace(workshop_data.name, '[^a-zA-Z0-9-]', '-', 'g')) || '-' || substr(workshop_data.id::text, 1, 8);
  END IF;
  
  -- Ensure slug is unique
  WHILE EXISTS (SELECT 1 FROM public.workshop_public_links WHERE slug = generated_slug) LOOP
    generated_slug := generated_slug || '-' || floor(random() * 1000)::text;
  END LOOP;
  
  -- Create public link
  INSERT INTO public.workshop_public_links (
    workshop_id,
    tenant_id,
    slug,
    is_active
  ) VALUES (
    p_workshop_id,
    workshop_data.tenant_id,
    generated_slug,
    true
  )
  RETURNING id, slug INTO link_record.id, link_record.slug;
  
  RETURN QUERY SELECT 
    link_record.id,
    link_record.slug,
    '/book/' || link_record.slug as public_url;
END;
$$;
