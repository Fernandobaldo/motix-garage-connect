
-- Create enum for service status
CREATE TYPE service_status AS ENUM ('pending', 'in_progress', 'awaiting_approval', 'completed', 'cancelled');

-- Create service_records table for ongoing services
CREATE TABLE public.service_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  vehicle_id UUID NOT NULL,
  workshop_id UUID NOT NULL,
  client_id UUID,
  appointment_id UUID,
  quotation_id UUID,
  service_type TEXT NOT NULL,
  description TEXT,
  status service_status NOT NULL DEFAULT 'pending',
  mileage INTEGER,
  labor_hours NUMERIC(5,2),
  parts_used JSONB DEFAULT '[]'::jsonb,
  technician_notes TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  cost NUMERIC(10,2),
  estimated_completion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add status column to existing service_history table
ALTER TABLE public.service_history 
ADD COLUMN IF NOT EXISTS status service_status DEFAULT 'completed';

-- Create workshop_preferences table
CREATE TABLE public.workshop_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  distance_unit TEXT NOT NULL DEFAULT 'km',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for service_records
ALTER TABLE public.service_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view service records in their tenant"
ON public.service_records
FOR SELECT
USING (tenant_id = public.get_current_user_tenant_id());

CREATE POLICY "Workshop owners can manage service records"
ON public.service_records
FOR ALL
USING (tenant_id = public.get_current_user_tenant_id() AND public.get_current_user_role() = 'workshop');

CREATE POLICY "Clients can view their service records"
ON public.service_records
FOR SELECT
USING (client_id = auth.uid() OR tenant_id = public.get_current_user_tenant_id());

-- Add RLS policies for workshop_preferences
ALTER TABLE public.workshop_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view preferences in their tenant"
ON public.workshop_preferences
FOR SELECT
USING (tenant_id = public.get_current_user_tenant_id());

CREATE POLICY "Workshop owners can manage preferences"
ON public.workshop_preferences
FOR ALL
USING (tenant_id = public.get_current_user_tenant_id() AND public.get_current_user_role() = 'workshop');

-- Function to move completed service records to history
CREATE OR REPLACE FUNCTION public.move_completed_service_to_history()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only trigger when status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Insert into service_history
    INSERT INTO public.service_history (
      tenant_id, vehicle_id, workshop_id, client_id, appointment_id, quotation_id,
      service_type, description, cost, labor_hours, mileage, parts_used,
      technician_notes, images, completed_at, status
    ) VALUES (
      NEW.tenant_id, NEW.vehicle_id, NEW.workshop_id, NEW.client_id, NEW.appointment_id, NEW.quotation_id,
      NEW.service_type, NEW.description, NEW.cost, NEW.labor_hours, NEW.mileage, NEW.parts_used,
      NEW.technician_notes, NEW.images, now(), NEW.status
    );
    
    -- Delete from service_records
    DELETE FROM public.service_records WHERE id = NEW.id;
    
    -- Return NULL to prevent the original update
    RETURN NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for moving completed services
CREATE TRIGGER move_completed_service_trigger
  BEFORE UPDATE ON public.service_records
  FOR EACH ROW
  EXECUTE FUNCTION public.move_completed_service_to_history();

-- Create indexes for better performance
CREATE INDEX idx_service_records_tenant_id ON public.service_records(tenant_id);
CREATE INDEX idx_service_records_status ON public.service_records(status);
CREATE INDEX idx_service_records_vehicle_id ON public.service_records(vehicle_id);
CREATE INDEX idx_service_records_client_id ON public.service_records(client_id);

-- Insert default preferences for existing tenants
INSERT INTO public.workshop_preferences (tenant_id, currency_code, distance_unit)
SELECT DISTINCT t.id, 'USD', 'km'
FROM public.tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM public.workshop_preferences wp WHERE wp.tenant_id = t.id
);
