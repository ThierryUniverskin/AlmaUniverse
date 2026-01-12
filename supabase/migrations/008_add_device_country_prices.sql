-- Migration: Add per-country default prices for EBD devices
-- This allows different default prices per device per country

-- Create the junction table for device-country pricing
CREATE TABLE IF NOT EXISTS ebd_device_country_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL REFERENCES ebd_devices(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL,
  default_price_cents INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(device_id, country_code)
);

-- Create index for faster lookups by country
CREATE INDEX IF NOT EXISTS idx_ebd_device_country_prices_country
ON ebd_device_country_prices(country_code);

-- Create index for faster lookups by device
CREATE INDEX IF NOT EXISTS idx_ebd_device_country_prices_device
ON ebd_device_country_prices(device_id);

-- Enable RLS (public read for catalog data, admin write in future)
ALTER TABLE ebd_device_country_prices ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read (catalog data)
CREATE POLICY "Anyone can read device country prices"
ON ebd_device_country_prices FOR SELECT
TO authenticated
USING (true);

-- Seed initial country prices for all devices
-- US: $350 (35000 cents) - baseline
-- EU countries (DE, FR, ES, IT, NL, BE, AT): €300 (30000 cents)
-- UK: £280 (28000 cents)
-- Canada: $380 CAD (38000 cents)
-- Australia: $420 AUD (42000 cents)
-- Israel: ₪1200 (120000 cents)

INSERT INTO ebd_device_country_prices (device_id, country_code, default_price_cents)
SELECT
  d.id,
  c.country_code,
  c.price_cents
FROM ebd_devices d
CROSS JOIN (
  VALUES
    ('US', 35000),
    ('CA', 38000),
    ('GB', 28000),
    ('DE', 30000),
    ('FR', 30000),
    ('ES', 30000),
    ('IT', 30000),
    ('NL', 30000),
    ('BE', 30000),
    ('AT', 30000),
    ('AU', 42000),
    ('IL', 120000)
) AS c(country_code, price_cents)
ON CONFLICT (device_id, country_code) DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE ebd_device_country_prices IS 'Per-country default prices for EBD devices. Falls back to ebd_devices.default_price_cents if no country-specific price exists.';
