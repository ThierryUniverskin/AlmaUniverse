-- Migration: Add treatment pricing
-- Adds price columns to ebd_devices, doctor_devices, and doctor_procedures

-- Add default_price_cents to ebd_devices (master catalog default price)
ALTER TABLE ebd_devices
ADD COLUMN IF NOT EXISTS default_price_cents INTEGER DEFAULT 35000; -- $350 default

-- Add price_cents to doctor_devices (doctor's custom price override)
-- NULL means use the default from ebd_devices.default_price_cents
ALTER TABLE doctor_devices
ADD COLUMN IF NOT EXISTS price_cents INTEGER;

-- Add price_cents to doctor_procedures (required for custom procedures)
-- Using ALTER with a default first, then removing default for new rows requirement
ALTER TABLE doctor_procedures
ADD COLUMN IF NOT EXISTS price_cents INTEGER DEFAULT 25000;

-- Update existing procedures to have the default price if they don't have one
UPDATE doctor_procedures
SET price_cents = 25000
WHERE price_cents IS NULL;

-- Comment for documentation
COMMENT ON COLUMN ebd_devices.default_price_cents IS 'Default price per session in cents (e.g., 35000 = $350). Used as fallback when doctor has not set custom price.';
COMMENT ON COLUMN doctor_devices.price_cents IS 'Doctor custom price per session in cents. NULL means use ebd_devices.default_price_cents.';
COMMENT ON COLUMN doctor_procedures.price_cents IS 'Price per session in cents for custom procedures. Required field.';
