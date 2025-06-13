
-- Phase 1: Fix RLS policies to eliminate infinite recursion

-- Step 1: Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
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

-- Step 2: Create simple, non-recursive policies
-- Policy 1: Users can view their own profile (direct comparison, no recursion)
CREATE POLICY "own_profile_select" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "own_profile_update" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Policy 3: Users can insert their own profile during registration
CREATE POLICY "own_profile_insert" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Policy 4: Workshop owners can view clients in their tenant
-- Uses direct workshop table lookup without self-referencing profiles
CREATE POLICY "workshop_view_tenant_clients" 
ON public.profiles 
FOR SELECT 
USING (
  role = 'client' AND 
  tenant_id IN (
    SELECT w.tenant_id 
    FROM public.workshops w 
    WHERE w.owner_id = auth.uid()
  )
);

-- Step 3: Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
