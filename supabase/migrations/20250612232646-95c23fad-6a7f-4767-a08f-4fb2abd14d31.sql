
-- Step 1: Create security definer functions to safely get user data without triggering RLS
CREATE OR REPLACE FUNCTION public.get_current_user_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- Step 2: Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.profiles;
DROP POLICY IF EXISTS "Workshop owners can create client profiles" ON public.profiles;

-- Step 3: Create new policies using the security definer functions
CREATE POLICY "Users can view profiles in their tenant" 
ON public.profiles 
FOR SELECT 
USING (
  tenant_id = public.get_current_user_tenant_id() OR
  auth.uid() = id
);

CREATE POLICY "Workshop owners can create client profiles" 
ON public.profiles
FOR INSERT 
WITH CHECK (
  role = 'client' AND
  public.get_current_user_role() = 'workshop' AND
  tenant_id = public.get_current_user_tenant_id()
);

-- Step 4: Only create update policy if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile"
        ON public.profiles
        FOR UPDATE
        USING (auth.uid() = id);
    END IF;
END
$$;

-- Step 5: Only create insert policy if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile"
        ON public.profiles
        FOR INSERT
        WITH CHECK (auth.uid() = id);
    END IF;
END
$$;
