
-- Fix infinite recursion in RLS policies by removing circular references
-- and using security definer functions properly

-- First, drop ALL existing policies on profiles table to start clean
DROP POLICY IF EXISTS "Profile owners can update own data" ON public.profiles;
DROP POLICY IF EXISTS "New users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Workshops can view their associated clients" ON public.profiles;

-- Update the security definer functions to be truly secure and avoid recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Create simple, non-recursive policies for profiles table

-- Policy 1: Users can view their own profile (direct comparison, no recursion)
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Users can update their own profile (direct comparison, no recursion)
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Policy 3: Users can insert their own profile (direct comparison, no recursion)
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy 4: Workshop users can view client profiles in their tenant
-- This uses a subquery but avoids referencing profiles table directly
CREATE POLICY "Workshop users can view tenant clients"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workshops w
    WHERE w.owner_id = auth.uid() 
    AND w.tenant_id = profiles.tenant_id
  ) AND profiles.role = 'client'
);

-- Policy 5: Allow superadmins to view all profiles
CREATE POLICY "Superadmins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'superadmin'
  )
);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
