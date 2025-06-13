
-- Phase 1: Clean up all existing duplicate policies on profiles table (if any remain)
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "workshop_owners_can_view_tenant_profiles" ON public.profiles;

-- Phase 2: Create new policies with correct type casting
-- Policy 1: Users can view their own profile (TEXT to UUID casting)
CREATE POLICY "users_can_view_own_profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id::uuid);

-- Policy 2: Users can update their own profile (TEXT to UUID casting)
CREATE POLICY "users_can_update_own_profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id::uuid);

-- Policy 3: Users can insert their own profile (TEXT to UUID casting)
CREATE POLICY "users_can_insert_own_profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id::uuid);

-- Policy 4: Workshop owners can view profiles in their tenant
CREATE POLICY "workshop_owners_can_view_tenant_profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.workshops w 
    WHERE w.owner_id = auth.uid() 
    AND w.tenant_id = profiles.tenant_id
  )
);

-- Ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
