
-- Phase 1: Clean slate - drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "own_profile_select" ON public.profiles;
DROP POLICY IF EXISTS "own_profile_update" ON public.profiles;
DROP POLICY IF EXISTS "own_profile_insert" ON public.profiles;
DROP POLICY IF EXISTS "workshop_view_tenant_clients" ON public.profiles;
DROP POLICY IF EXISTS "Workshop users can view tenant clients" ON public.profiles;
DROP POLICY IF EXISTS "Superadmins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "workshops_can_view_tenant_clients" ON public.profiles;
DROP POLICY IF EXISTS "superadmins_can_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "profile_owner_can_select" ON public.profiles;
DROP POLICY IF EXISTS "profile_owner_can_update" ON public.profiles;
DROP POLICY IF EXISTS "profile_owner_can_insert" ON public.profiles;
DROP POLICY IF EXISTS "workshop_can_view_clients" ON public.profiles;
DROP POLICY IF EXISTS "Workshops can view their associated clients" ON public.profiles;
DROP POLICY IF EXISTS "workshop_owners_can_view_tenant_profiles" ON public.profiles;

-- Phase 2: Create simple, non-conflicting policies
-- Policy 1: Users can view their own profile (direct comparison, no recursion)
CREATE POLICY "users_can_view_own_profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Users can update their own profile (direct comparison, no recursion)
CREATE POLICY "users_can_update_own_profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Policy 3: Users can insert their own profile (direct comparison, no recursion)
CREATE POLICY "users_can_insert_own_profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Policy 4: Workshop owners can view profiles in their tenant (simple direct query)
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
