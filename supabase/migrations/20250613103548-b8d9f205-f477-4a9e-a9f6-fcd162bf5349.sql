
-- Create a new clients table for non-authenticated clients
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant isolation
CREATE POLICY "Users can view clients in their tenant" 
  ON public.clients 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.tenant_id = clients.tenant_id
    )
  );

CREATE POLICY "Users can create clients in their tenant" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.tenant_id = clients.tenant_id
    )
  );

CREATE POLICY "Users can update clients in their tenant" 
  ON public.clients 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.tenant_id = clients.tenant_id
    )
  );

CREATE POLICY "Users can delete clients in their tenant" 
  ON public.clients 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.tenant_id = clients.tenant_id
    )
  );

-- Update vehicles table to allow owner_id to be nullable for guest clients
ALTER TABLE public.vehicles ALTER COLUMN owner_id DROP NOT NULL;

-- Add a client_id column to vehicles table to reference non-auth clients
ALTER TABLE public.vehicles ADD COLUMN client_id UUID REFERENCES public.clients(id);

-- Update appointments table to allow client_id to be nullable for guest appointments
ALTER TABLE public.appointments ALTER COLUMN client_id DROP NOT NULL;

-- Add a guest_client_id column to appointments table
ALTER TABLE public.appointments ADD COLUMN guest_client_id UUID REFERENCES public.clients(id);
