
-- Fix RLS policies for better data access and add missing indexes for performance

-- First, let's add an index for license plate searching (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate_lower 
ON public.vehicles (LOWER(license_plate));

-- Add index for appointment filtering by vehicle
CREATE INDEX IF NOT EXISTS idx_appointments_vehicle_id 
ON public.appointments (vehicle_id);

-- Add index for service history filtering
CREATE INDEX IF NOT EXISTS idx_service_history_vehicle_tenant 
ON public.service_history (vehicle_id, tenant_id);

-- Enable RLS on profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for profiles - allow users to see profiles in their tenant
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.profiles;
CREATE POLICY "Users can view profiles in their tenant" 
ON public.profiles FOR SELECT 
USING (
  tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  OR auth.uid() IN (
    SELECT owner_id FROM public.workshops WHERE tenant_id = profiles.tenant_id
  )
);

-- Enable RLS on vehicles table
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for vehicles - allow access within tenant
DROP POLICY IF EXISTS "Users can view vehicles in their tenant" ON public.vehicles;
CREATE POLICY "Users can view vehicles in their tenant" 
ON public.vehicles FOR SELECT 
USING (
  tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  OR owner_id = auth.uid()
);

-- Allow workshop owners to insert vehicles for their clients
DROP POLICY IF EXISTS "Workshop owners can create vehicles for clients" ON public.vehicles;
CREATE POLICY "Workshop owners can create vehicles for clients" 
ON public.vehicles FOR INSERT 
WITH CHECK (
  tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  OR owner_id = auth.uid()
);

-- Enable RLS on appointments table
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for appointments - allow access within tenant
DROP POLICY IF EXISTS "Users can view appointments in their tenant" ON public.appointments;
CREATE POLICY "Users can view appointments in their tenant" 
ON public.appointments FOR SELECT 
USING (
  tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);

-- Allow creating appointments within tenant
DROP POLICY IF EXISTS "Users can create appointments in their tenant" ON public.appointments;
CREATE POLICY "Users can create appointments in their tenant" 
ON public.appointments FOR INSERT 
WITH CHECK (
  tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);

-- Enable RLS on service_history table
ALTER TABLE public.service_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for service history - allow access within tenant
DROP POLICY IF EXISTS "Users can view service history in their tenant" ON public.service_history;
CREATE POLICY "Users can view service history in their tenant" 
ON public.service_history FOR SELECT 
USING (
  tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);

-- Allow workshop owners to create service history
DROP POLICY IF EXISTS "Workshop owners can create service history" ON public.service_history;  
CREATE POLICY "Workshop owners can create service history" 
ON public.service_history FOR INSERT 
WITH CHECK (
  tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);

-- Allow workshop owners to update service history
DROP POLICY IF EXISTS "Workshop owners can update service history" ON public.service_history;
CREATE POLICY "Workshop owners can update service history" 
ON public.service_history FOR UPDATE 
USING (
  tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);
