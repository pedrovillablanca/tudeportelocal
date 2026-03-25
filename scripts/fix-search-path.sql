-- Fix: Set secure search_path for search_clubs function
-- This prevents attackers from manipulating the search path

CREATE OR REPLACE FUNCTION search_clubs(query_text TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  region_id INTEGER,
  commune_id INTEGER,
  address TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT,
  is_featured BOOLEAN,
  is_deleted BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
SET search_path = '' AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.description,
    c.region_id,
    c.commune_id,
    c.address,
    c.instagram_url,
    c.facebook_url,
    c.contact_email,
    c.contact_phone,
    c.status,
    c.is_featured,
    c.is_deleted,
    c.created_at,
    c.updated_at
  FROM clubs c
  WHERE c.status = 'active'
    AND c.is_deleted = false
    AND unaccent(LOWER(c.name)) LIKE '%' || unaccent(LOWER(query_text)) || '%'
  ORDER BY c.is_featured DESC, c.name ASC;
END;
$$ LANGUAGE plpgsql;
