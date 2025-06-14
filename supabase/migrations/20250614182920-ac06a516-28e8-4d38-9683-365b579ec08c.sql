
-- First, let's create the missing get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- Now let's enable RLS and create the policies properly
ALTER TABLE public.service_records ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT: Users can view service records in their tenant
CREATE POLICY "Users can view service records in their tenant"
ON public.service_records
FOR SELECT
USING (tenant_id = public.get_user_tenant_id());

-- Policy for INSERT: Users can create service records for their tenant
CREATE POLICY "Users can create service records for their tenant"
ON public.service_records
FOR INSERT
WITH CHECK (tenant_id = public.get_user_tenant_id());

-- Policy for UPDATE: Users can update service records in their tenant
CREATE POLICY "Users can update service records in their tenant"
ON public.service_records
FOR UPDATE
USING (tenant_id = public.get_user_tenant_id());

-- Policy for DELETE: Workshop owners can delete service records in their tenant
CREATE POLICY "Workshop owners can delete service records"
ON public.service_records
FOR DELETE
USING (tenant_id = public.get_user_tenant_id() AND public.get_user_role() = 'workshop');

-- Additional policy for clients to view their own service records
CREATE POLICY "Clients can view their service records"
ON public.service_records
FOR SELECT
USING (client_id = auth.uid() OR tenant_id = public.get_user_tenant_id());
