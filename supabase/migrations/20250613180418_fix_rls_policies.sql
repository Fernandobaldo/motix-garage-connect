
-- Fix remaining RLS policy conflicts and ensure proper association functionality

-- Drop any duplicate policies that might cause conflicts
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Recreate the policies with unique names
CREATE POLICY "Profile owners can update own data"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "New users can create own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Ensure vehicles table has proper policies for associations
CREATE POLICY "Workshop users can create vehicles"
ON public.vehicles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles user_profile
    WHERE user_profile.id = auth.uid()
    AND user_profile.tenant_id = vehicles.tenant_id
    AND user_profile.role = 'workshop'
  )
);

CREATE POLICY "Workshop users can update vehicles in tenant"
ON public.vehicles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles user_profile
    WHERE user_profile.id = auth.uid()
    AND user_profile.tenant_id = vehicles.tenant_id
    AND user_profile.role = 'workshop'
  )
);

-- Ensure clients table has proper policies
CREATE POLICY "Workshop users can create guest clients"
ON public.clients
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles user_profile
    WHERE user_profile.id = auth.uid()
    AND user_profile.tenant_id = clients.tenant_id
    AND user_profile.role = 'workshop'
  )
);

CREATE POLICY "Workshop users can update guest clients"
ON public.clients
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles user_profile
    WHERE user_profile.id = auth.uid()
    AND user_profile.tenant_id = clients.tenant_id
    AND user_profile.role = 'workshop'
  )
);
