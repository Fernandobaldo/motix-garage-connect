
-- 1. Allow users to SELECT their own workshop preferences by tenant
CREATE POLICY "Users can view their own workshop preferences"
  ON public.workshop_preferences
  FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

-- 2. Allow users to INSERT preferences for their own tenant (only if they own that tenant)
CREATE POLICY "Users can create workshop preferences for their own tenant"
  ON public.workshop_preferences
  FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id());

-- 3. Allow users to UPDATE preferences for their own tenant
CREATE POLICY "Users can update their workshop preferences"
  ON public.workshop_preferences
  FOR UPDATE
  USING (tenant_id = public.get_user_tenant_id());
