-- Fix: Move unaccent extension to extensions schema
-- Create extensions schema if not exists
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move unaccent extension to extensions schema
DROP EXTENSION IF EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA extensions;

-- Verify the function uses the secure search_path (already set in previous fix)
-- Re-apply search_clubs with explicit schema references if needed
