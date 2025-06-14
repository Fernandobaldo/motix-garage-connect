
-- Find service_records with workshop_id not present in workshops for tenant 916ef3f3-2ce1-479f-ab25-59e46124e0ce:
-- SELECT id, workshop_id FROM public.service_records WHERE tenant_id = '916ef3f3-2ce1-479f-ab25-59e46124e0ce' AND workshop_id NOT IN (SELECT id FROM public.workshops);

-- Forcing all such service_records to use Baldo Garage workshop ID
UPDATE public.service_records
SET workshop_id = '6de80ab2-8ca8-462b-9c6f-edee71df685c'
WHERE tenant_id = '916ef3f3-2ce1-479f-ab25-59e46124e0ce'
  AND workshop_id NOT IN (
    SELECT id FROM public.workshops
    WHERE tenant_id = '916ef3f3-2ce1-479f-ab25-59e46124e0ce'
  );

-- Optionally, you can verify after:
-- SELECT id, workshop_id FROM public.service_records WHERE tenant_id = '916ef3f3-2ce1-479f-ab25-59e46124e0ce' AND workshop_id NOT IN (SELECT id FROM public.workshops);

