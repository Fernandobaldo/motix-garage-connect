
-- 1. List the 5 most recently *deleted* records from service_records (that you completed, so they should exist in service_history)
SELECT
  sr.id, sr.vehicle_id, sr.workshop_id, sr.tenant_id, sr.service_type, sr.client_id,
  sr.created_at, sr.updated_at
FROM public.service_records sr
WHERE NOT EXISTS (
  SELECT 1 FROM public.service_records s2 WHERE s2.id = sr.id
)
ORDER BY sr.updated_at DESC
LIMIT 5;

-- 2. Find incomplete fields in service_records
SELECT
  id,
  (vehicle_id IS NULL)::int AS missing_vehicle_id,
  (workshop_id IS NULL)::int AS missing_workshop_id,
  (tenant_id IS NULL)::int AS missing_tenant_id,
  (service_type IS NULL)::int AS missing_service_type
FROM public.service_records
WHERE status = 'completed';

-- 3. List the 5 most recently inserted rows in service_history
SELECT
  id, vehicle_id, workshop_id, tenant_id, service_type, completed_at, created_at, client_id
FROM public.service_history
ORDER BY completed_at DESC
LIMIT 5;
