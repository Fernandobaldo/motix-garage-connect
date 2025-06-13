
-- Phase 1: Drop all policies that depend on the recursive functions (if they exist)
DROP POLICY IF EXISTS "Workshop owners can update their tenant" ON public.tenants;
DROP POLICY IF EXISTS "Workshop users can view vehicles in their tenant" ON public.vehicles;
DROP POLICY IF EXISTS "Workshop users can view appointments in their tenant" ON public.appointments;
DROP POLICY IF EXISTS "Workshop users can update appointments in their tenant" ON public.appointments;
DROP POLICY IF EXISTS "Workshop users can manage quotations in their tenant" ON public.quotations;
DROP POLICY IF EXISTS "Workshop users can manage service history in their tenant" ON public.service_history;
DROP POLICY IF EXISTS "Workshop users can create conversations in their tenant" ON public.chat_conversations;
DROP POLICY IF EXISTS "Workshop users can add participants to conversations in their t" ON public.chat_participants;
DROP POLICY IF EXISTS "Workshop users can manage quotation items" ON public.quotation_items;
DROP POLICY IF EXISTS "Workshop users can manage templates" ON public.quote_templates;
DROP POLICY IF EXISTS "Workshop users can manage templates for their tenant" ON public.notification_templates;
DROP POLICY IF EXISTS "Workshop users can manage preferences for their tenant" ON public.notification_preferences;
DROP POLICY IF EXISTS "Workshop owners can manage service records" ON public.service_records;
DROP POLICY IF EXISTS "Workshop owners can manage preferences" ON public.workshop_preferences;

-- Phase 2: Drop any remaining old policies on profiles that might cause recursion
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.profiles;
DROP POLICY IF EXISTS "Workshop owners can create client profiles" ON public.profiles;
DROP POLICY IF EXISTS "Tenants can view their profiles" ON public.profiles;
DROP POLICY IF EXISTS "Workshop users can view tenant profiles" ON public.profiles;

-- Phase 3: Drop the recursive functions that cause infinite loops
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_tenant_id() CASCADE;

-- Phase 4: Create simple, non-recursive replacement functions (only if needed)
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role::text FROM public.profiles WHERE id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.get_user_tenant_id(user_uuid uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = user_uuid;
$$;

-- Phase 5: Recreate essential policies for other tables using direct queries
-- Tenants
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tenants' AND policyname = 'workshop_owners_update_tenant'
  ) THEN
    CREATE POLICY "workshop_owners_update_tenant" 
    ON public.tenants 
    FOR UPDATE 
    USING (
      id IN (
        SELECT w.tenant_id 
        FROM public.workshops w 
        WHERE w.owner_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Vehicles  
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vehicles' AND policyname = 'workshop_view_tenant_vehicles'
  ) THEN
    CREATE POLICY "workshop_view_tenant_vehicles" 
    ON public.vehicles 
    FOR SELECT 
    USING (
      tenant_id IN (
        SELECT w.tenant_id 
        FROM public.workshops w 
        WHERE w.owner_id = auth.uid()
      ) OR owner_id = auth.uid()
    );
  END IF;
END $$;

-- Appointments
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' AND policyname = 'workshop_view_tenant_appointments'
  ) THEN
    CREATE POLICY "workshop_view_tenant_appointments" 
    ON public.appointments 
    FOR SELECT 
    USING (
      tenant_id IN (
        SELECT w.tenant_id 
        FROM public.workshops w 
        WHERE w.owner_id = auth.uid()
      ) OR client_id = auth.uid()
    );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' AND policyname = 'workshop_update_tenant_appointments'
  ) THEN
    CREATE POLICY "workshop_update_tenant_appointments" 
    ON public.appointments 
    FOR UPDATE 
    USING (
      tenant_id IN (
        SELECT w.tenant_id 
        FROM public.workshops w 
        WHERE w.owner_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Ensure RLS is enabled on profiles (should already be enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
