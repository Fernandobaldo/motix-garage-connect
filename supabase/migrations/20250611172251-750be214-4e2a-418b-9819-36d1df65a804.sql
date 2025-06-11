
-- Drop existing policies if they exist and recreate them to ensure consistency
DROP POLICY IF EXISTS "Users can view their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can create their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can update their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can delete their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Workshop owners can view tenant vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Workshop owners can create guest vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Workshop owners can update tenant vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Workshop owners can delete tenant vehicles" ON public.vehicles;

-- Enable RLS on vehicles table if not already enabled
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own vehicles
CREATE POLICY "Users can view their own vehicles" ON public.vehicles
FOR SELECT USING (auth.uid() = owner_id);

-- Allow users to create their own vehicles
CREATE POLICY "Users can create their own vehicles" ON public.vehicles
FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Allow users to update their own vehicles
CREATE POLICY "Users can update their own vehicles" ON public.vehicles
FOR UPDATE USING (auth.uid() = owner_id);

-- Allow users to delete their own vehicles
CREATE POLICY "Users can delete their own vehicles" ON public.vehicles
FOR DELETE USING (auth.uid() = owner_id);

-- Allow workshop owners to view vehicles within their tenant
CREATE POLICY "Workshop owners can view tenant vehicles" ON public.vehicles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'workshop' 
    AND tenant_id = vehicles.tenant_id
  )
);

-- Allow workshop owners to create guest vehicles for their tenant
CREATE POLICY "Workshop owners can create guest vehicles" ON public.vehicles
FOR INSERT WITH CHECK (
  owner_id IS NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'workshop' 
    AND tenant_id = vehicles.tenant_id
  )
);

-- Allow workshop owners to update vehicles within their tenant
CREATE POLICY "Workshop owners can update tenant vehicles" ON public.vehicles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'workshop' 
    AND tenant_id = vehicles.tenant_id
  )
);

-- Allow workshop owners to delete vehicles within their tenant
CREATE POLICY "Workshop owners can delete tenant vehicles" ON public.vehicles
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'workshop' 
    AND tenant_id = vehicles.tenant_id
  )
);
