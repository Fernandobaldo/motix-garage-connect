
-- Fix the ambiguous column reference error in generate_workshop_public_link function
CREATE OR REPLACE FUNCTION public.generate_workshop_public_link(
  p_workshop_id uuid,
  p_custom_slug text DEFAULT NULL
)
RETURNS TABLE(
  link_id uuid,
  slug text,
  public_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  workshop_data record;
  generated_slug text;
  existing_link_id uuid;
  existing_link_slug text;
  new_link_id uuid;
  new_link_slug text;
BEGIN
  -- Check if user owns the workshop
  SELECT * INTO workshop_data
  FROM public.workshops w
  WHERE w.id = p_workshop_id
    AND w.owner_id = auth.uid();
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workshop not found or access denied';
  END IF;
  
  -- Check if link already exists
  SELECT wpl.id, wpl.slug INTO existing_link_id, existing_link_slug
  FROM public.workshop_public_links wpl
  WHERE wpl.workshop_id = p_workshop_id;
  
  IF FOUND THEN
    -- Return existing link (removed ambiguous aliases)
    RETURN QUERY SELECT 
      existing_link_id,
      existing_link_slug,
      ('/book/' || existing_link_slug);
    RETURN;
  END IF;
  
  -- Generate slug
  IF p_custom_slug IS NOT NULL THEN
    generated_slug := lower(regexp_replace(p_custom_slug, '[^a-zA-Z0-9-]', '-', 'g'));
  ELSE
    generated_slug := lower(regexp_replace(workshop_data.name, '[^a-zA-Z0-9-]', '-', 'g')) || '-' || substr(workshop_data.id::text, 1, 8);
  END IF;
  
  -- Ensure slug is unique
  WHILE EXISTS (SELECT 1 FROM public.workshop_public_links wpl WHERE wpl.slug = generated_slug) LOOP
    generated_slug := generated_slug || '-' || floor(random() * 1000)::text;
  END LOOP;
  
  -- Create public link
  INSERT INTO public.workshop_public_links (
    workshop_id,
    tenant_id,
    slug,
    is_active
  ) VALUES (
    p_workshop_id,
    workshop_data.tenant_id,
    generated_slug,
    true
  )
  RETURNING workshop_public_links.id, workshop_public_links.slug INTO new_link_id, new_link_slug;
  
  -- Return new link (removed ambiguous aliases)
  RETURN QUERY SELECT 
    new_link_id,
    new_link_slug,
    ('/book/' || new_link_slug);
END;
$$;
