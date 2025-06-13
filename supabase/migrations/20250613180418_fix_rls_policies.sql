
-- Fix infinite recursion in RLS policies by removing circular references
-- and using security definer functions

-- First, drop ALL existing policies on profiles table to start clean
DROP POLICY IF EXISTS "Profile owners can update own data" ON public.profiles;
DROP POLICY IF EXISTS "New users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Workshops can view their associated clients" ON public.profiles;

-- Drop ALL existing policies on vehicles table to start clean
DROP POLICY IF EXISTS "Workshop users can create vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Workshop users can update vehicles in tenant" ON public.vehicles;
DROP POLICY IF EXISTS "Workshop users can manage vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can view vehicles in their tenant" ON public.vehicles;
DROP POLICY IF EXISTS "Workshops can view vehicles through appointments" ON public.vehicles;

-- Drop ALL existing policies on clients table to start clean
DROP POLICY IF EXISTS "Workshop users can create guest clients" ON public.clients;
DROP POLICY IF EXISTS "Workshop users can update guest clients" ON public.clients;
DROP POLICY IF EXISTS "Workshop users can manage guest clients" ON public.clients;
DROP POLICY IF EXISTS "Users can view clients in their tenant" ON public.clients;
DROP POLICY IF EXISTS "Workshops can view their guest clients" ON public.clients;

-- Create security definer functions to avoid recursion
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

-- Recreate profiles policies without recursion
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Safe policies for vehicles using security definer functions
CREATE POLICY "Users can view vehicles in their tenant"
ON public.vehicles
FOR SELECT
USING (tenant_id = public.get_current_user_tenant_id());

CREATE POLICY "Workshop users can manage vehicles"
ON public.vehicles
FOR ALL
USING (
  public.get_current_user_role() = 'workshop' AND
  tenant_id = public.get_current_user_tenant_id()
)
WITH CHECK (
  public.get_current_user_role() = 'workshop' AND
  tenant_id = public.get_current_user_tenant_id()
);

-- Safe policies for clients using security definer functions
CREATE POLICY "Users can view clients in their tenant"
ON public.clients
FOR SELECT
USING (tenant_id = public.get_current_user_tenant_id());

CREATE POLICY "Workshop users can manage guest clients"
ON public.clients
FOR ALL
USING (
  public.get_current_user_role() = 'workshop' AND
  tenant_id = public.get_current_user_tenant_id()
)
WITH CHECK (
  public.get_current_user_role() = 'workshop' AND
  tenant_id = public.get_current_user_tenant_id()
);
