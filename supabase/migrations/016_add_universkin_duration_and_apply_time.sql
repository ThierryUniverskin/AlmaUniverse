-- Migration: Add duration and application time to Universkin products
-- Purpose: Track how long products last and when they should be applied (AM/PM/AM&PM)

-- ============================================================================
-- Add columns to universkin_products
-- ============================================================================

ALTER TABLE universkin_products
  ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS when_to_apply TEXT DEFAULT 'AM&PM';

-- Add comment for documentation
COMMENT ON COLUMN universkin_products.duration_days IS 'How long the product lasts in days (e.g., 30, 60, 90)';
COMMENT ON COLUMN universkin_products.when_to_apply IS 'When to apply: AM, PM, or AM&PM';

-- ============================================================================
-- Update existing products with duration and apply time data
-- ============================================================================

UPDATE universkin_products SET duration_days = 60, when_to_apply = 'AM&PM' WHERE id = 'hydrating-oil-cleanser';
UPDATE universkin_products SET duration_days = 60, when_to_apply = 'AM&PM' WHERE id = 'clarifying-gel-cleanser';
UPDATE universkin_products SET duration_days = 30, when_to_apply = 'AM&PM' WHERE id = 'daily-radiance-pads';
UPDATE universkin_products SET duration_days = 60, when_to_apply = 'PM' WHERE id = 'barrier-renewal-pads';
UPDATE universkin_products SET duration_days = 30, when_to_apply = 'AM&PM' WHERE id = 'barrier-nourishing-creme-light';
UPDATE universkin_products SET duration_days = 30, when_to_apply = 'AM&PM' WHERE id = 'barrier-nourishing-creme-rich';
UPDATE universkin_products SET duration_days = 60, when_to_apply = 'AM&PM' WHERE id = 'barrier-restoring-balm';
UPDATE universkin_products SET duration_days = 60, when_to_apply = 'AM&PM' WHERE id = 'ha-boosting-serum';
UPDATE universkin_products SET duration_days = 90, when_to_apply = 'AM' WHERE id = 'daily-mineral-serum-spf50';
UPDATE universkin_products SET duration_days = 30, when_to_apply = 'AM&PM' WHERE id = 'recovery-kit';
UPDATE universkin_products SET duration_days = 30, when_to_apply = 'AM&PM' WHERE id = 'aging-skin-kit';
UPDATE universkin_products SET duration_days = 30, when_to_apply = 'AM&PM' WHERE id = 'pigment-control-kit';
