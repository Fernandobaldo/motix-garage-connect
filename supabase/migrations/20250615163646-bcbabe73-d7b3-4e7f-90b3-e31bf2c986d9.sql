
-- Set the correct workshop_id for service record that references the owner_id instead of id
UPDATE public.service_records sr
SET workshop_id = w.id
FROM public.workshops w
WHERE sr.id = 'ab74c777-c366-49b2-bec7-90730d4e3b39'
  AND w.tenant_id = sr.tenant_id
  AND w.owner_id = sr.workshop_id;

-- (Optional) Check there are no more service_records pointing to non-existent workshops:
-- SELECT sr.id, sr.workshop_id FROM public.service_records sr
-- LEFT JOIN public.workshops w ON sr.workshop_id = w.id
-- WHERE w.id IS NULL;
