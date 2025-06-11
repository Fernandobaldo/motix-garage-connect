
-- Add RLS policy to allow workshop owners to create client profiles in their tenant
CREATE POLICY "Workshop owners can create client profiles" ON public.profiles
FOR INSERT WITH CHECK (
  role = 'client' AND
  EXISTS (
    SELECT 1 FROM public.profiles workshop_profile
    WHERE workshop_profile.id = auth.uid() 
    AND workshop_profile.role = 'workshop' 
    AND workshop_profile.tenant_id = profiles.tenant_id
  )
);
