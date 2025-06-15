
-- 1. (Re)create the trigger function to move completed service records to history
CREATE OR REPLACE FUNCTION public.move_completed_service_to_history()
RETURNS trigger
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
    -- Prevent the original update from sticking
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- 2. (Re)create the trigger on service_records (after update of status)
DROP TRIGGER IF EXISTS trg_move_completed_to_history ON public.service_records;

CREATE TRIGGER trg_move_completed_to_history
AFTER UPDATE ON public.service_records
FOR EACH ROW
EXECUTE FUNCTION public.move_completed_service_to_history();

-- (Optional for review) Confirm the trigger now exists:
-- SELECT tgname, tgrelid::regclass FROM pg_trigger WHERE tgname = 'trg_move_completed_to_history';

