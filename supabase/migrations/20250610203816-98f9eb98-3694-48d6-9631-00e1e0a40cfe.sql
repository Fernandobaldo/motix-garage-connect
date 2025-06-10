
-- Add RLS policies for appointment editing and deletion
CREATE POLICY "Users can update their own appointments or workshop can update all in tenant" 
ON public.appointments 
FOR UPDATE 
USING (
  auth.uid() = client_id OR 
  (auth.uid() IN (SELECT owner_id FROM public.workshops WHERE tenant_id = appointments.tenant_id))
);

CREATE POLICY "Users can delete their own appointments or workshop can delete all in tenant" 
ON public.appointments 
FOR DELETE 
USING (
  auth.uid() = client_id OR 
  (auth.uid() IN (SELECT owner_id FROM public.workshops WHERE tenant_id = appointments.tenant_id))
);

-- Update notification triggers to handle appointment edits and deletes
CREATE OR REPLACE FUNCTION public.notify_appointment_changes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Handle UPDATE operations
  IF TG_OP = 'UPDATE' THEN
    -- Notify about general appointment update (not status changes, those are handled separately)
    IF OLD.scheduled_at IS DISTINCT FROM NEW.scheduled_at OR 
       OLD.service_type IS DISTINCT FROM NEW.service_type OR 
       OLD.description IS DISTINCT FROM NEW.description THEN
      
      -- Notify client if they exist
      IF NEW.client_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, tenant_id, title, message, type, related_id, related_type)
        VALUES (
          NEW.client_id,
          NEW.tenant_id,
          'Appointment Updated',
          'Your ' || NEW.service_type || ' appointment has been updated.',
          'info',
          NEW.id,
          'appointment'
        );
      END IF;
      
      -- Notify workshop owner
      INSERT INTO public.notifications (user_id, tenant_id, title, message, type, related_id, related_type)
      SELECT 
        w.owner_id,
        NEW.tenant_id,
        'Appointment Updated',
        'An appointment for ' || NEW.service_type || ' has been updated.',
        'info',
        NEW.id,
        'appointment'
      FROM public.workshops w
      WHERE w.tenant_id = NEW.tenant_id;
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- Handle DELETE operations
  IF TG_OP = 'DELETE' THEN
    -- Notify client if they exist
    IF OLD.client_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, tenant_id, title, message, type, related_id, related_type)
      VALUES (
        OLD.client_id,
        OLD.tenant_id,
        'Appointment Cancelled',
        'Your ' || OLD.service_type || ' appointment has been cancelled.',
        'warning',
        OLD.id,
        'appointment'
      );
    END IF;
    
    -- Notify workshop owner
    INSERT INTO public.notifications (user_id, tenant_id, title, message, type, related_id, related_type)
    SELECT 
      w.owner_id,
      OLD.tenant_id,
      'Appointment Cancelled',
      'An appointment for ' || OLD.service_type || ' has been cancelled.',
      'warning',
      OLD.id,
      'appointment'
    FROM public.workshops w
    WHERE w.tenant_id = OLD.tenant_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create triggers for appointment changes
DROP TRIGGER IF EXISTS on_appointment_changes ON public.appointments;
CREATE TRIGGER on_appointment_changes
  AFTER UPDATE OR DELETE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.notify_appointment_changes();

-- Update the service history trigger to also update appointment status
CREATE OR REPLACE FUNCTION public.update_appointment_after_service()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update appointment status to completed when service history is added
  IF NEW.appointment_id IS NOT NULL THEN
    UPDATE public.appointments
    SET status = 'completed'
    WHERE id = NEW.appointment_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for service completion
DROP TRIGGER IF EXISTS on_service_completion ON public.service_history;
CREATE TRIGGER on_service_completion
  AFTER INSERT ON public.service_history
  FOR EACH ROW EXECUTE FUNCTION public.update_appointment_after_service();
