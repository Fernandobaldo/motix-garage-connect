
-- 1. Fix specific orphaned service record where workshop_id is actually the owner's id,
--    setting workshop_id to the correct workshop's id instead.
UPDATE public.service_records sr
SET workshop_id = w.id
FROM public.workshops w
WHERE sr.id = 'ab74c787-e1cc-4fe8-88b5-e4a77940b96e'
  AND w.tenant_id = sr.tenant_id
  AND w.owner_id = sr.workshop_id;

-- 2. (Optional) Patch any other service_records in this tenant where service_records.workshop_id matches a workshops.owner_id (but not a real workshops.id)
--    This ensures no more orphan records are left in this tenant.
UPDATE public.service_records sr
SET workshop_id = w.id
FROM public.workshops w
WHERE sr.workshop_id = w.owner_id
  AND w.tenant_id = sr.tenant_id
  AND NOT EXISTS (
    SELECT 1 FROM public.workshops wx WHERE wx.id = sr.workshop_id
  );

-- 3. (Optional) List all service_records still referencing non-existent workshops for a sanity check
-- SELECT sr.id, sr.workshop_id FROM public.service_records sr
-- LEFT JOIN public.workshops w ON sr.workshop_id = w.id
-- WHERE w.id IS NULL;

