
-- Add the missing client_id column to service_history table, matching its use in service_records
ALTER TABLE public.service_history
  ADD COLUMN IF NOT EXISTS client_id UUID;

-- No need to update the trigger function, but if needed for completeness, here is a COMMENT:
-- The move_completed_service_to_history() function already references client_id, so with this migration, the insert will work correctly.
