-- Migration: Add serum ingredients tables
-- Purpose: Store personalized serum ingredient catalog with country availability

-- ============================================================================
-- Table: serum_ingredients (Master Catalog)
-- ============================================================================

CREATE TABLE IF NOT EXISTS serum_ingredients (
  id TEXT PRIMARY KEY,                    -- kebab-case: 'niacinamide', 'vitamin-c'
  name TEXT NOT NULL,                     -- Display name: 'Niacinamide', 'Vitamin C'
  base_concentration DECIMAL(5,2) NOT NULL, -- Base % with 1 capsule: 4.00, 7.00
  color TEXT NOT NULL,                    -- Hex color: '#C13050'
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_serum_ingredients_active ON serum_ingredients(is_active);
CREATE INDEX idx_serum_ingredients_order ON serum_ingredients(display_order);

-- Enable RLS
ALTER TABLE serum_ingredients ENABLE ROW LEVEL SECURITY;

-- Anyone can read active ingredients (public catalog)
CREATE POLICY "Anyone can view active serum ingredients"
  ON serum_ingredients
  FOR SELECT
  USING (is_active = true);


-- ============================================================================
-- Table: country_serum_ingredients (Country Availability)
-- ============================================================================

CREATE TABLE IF NOT EXISTS country_serum_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,             -- e.g., 'US', 'FR', 'GB'
  ingredient_id TEXT NOT NULL REFERENCES serum_ingredients(id) ON DELETE CASCADE,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(country_code, ingredient_id)
);

-- Indexes
CREATE INDEX idx_country_serum_ingredients_country ON country_serum_ingredients(country_code);
CREATE INDEX idx_country_serum_ingredients_ingredient ON country_serum_ingredients(ingredient_id);

-- Enable RLS
ALTER TABLE country_serum_ingredients ENABLE ROW LEVEL SECURITY;

-- Anyone can view country availability (public catalog data)
CREATE POLICY "Anyone can view country serum ingredient availability"
  ON country_serum_ingredients
  FOR SELECT
  USING (true);


-- ============================================================================
-- Table: doctor_serum_configurations (Future: Doctor's saved serum configs)
-- ============================================================================

-- Note: This table is for future use when we want to save doctor's serum preferences
-- For now, serum configurations are generated per session and not persisted
