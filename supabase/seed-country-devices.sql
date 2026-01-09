-- Alma Universe - Country Devices Seed Data
-- Run this in Supabase SQL Editor after creating the country_devices table
-- This seeds device availability per country (MVP: all devices available in all countries)

-- Clear existing data
DELETE FROM country_devices;

-- Insert device availability for all supported countries
-- Countries: US, CA, GB, AU, DE, FR, ES, IT, MX, BR, IN, JP, CN

DO $$
DECLARE
  countries TEXT[] := ARRAY['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'MX', 'BR', 'IN', 'JP', 'CN'];
  country_code TEXT;
BEGIN
  FOREACH country_code IN ARRAY countries
  LOOP
    INSERT INTO country_devices (country_code, device_id, is_active)
    SELECT country_code, id, true
    FROM ebd_devices
    WHERE is_active = true;
  END LOOP;
END $$;

-- Verify insertion
SELECT
  country_code,
  COUNT(*) as device_count
FROM country_devices
WHERE is_active = true
GROUP BY country_code
ORDER BY country_code;
