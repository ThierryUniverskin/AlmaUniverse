-- Migration: Add Universkin products tables
-- Purpose: Store skincare product catalog with country availability and doctor pricing

-- ============================================================================
-- Table: universkin_products (Master Catalog)
-- ============================================================================

CREATE TABLE IF NOT EXISTS universkin_products (
  id TEXT PRIMARY KEY,  -- kebab-case: 'hydrating-oil-cleanser'
  name TEXT NOT NULL,
  category TEXT NOT NULL,  -- 'cleanse', 'prep', 'strengthen', 'kit', 'sunscreen', 'treat'
  description TEXT,
  default_size TEXT,  -- '100ml', '30 units', '4 products'
  available_sizes TEXT[] DEFAULT '{}',  -- For products with multiple size options
  default_price_cents INTEGER,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_universkin_products_category ON universkin_products(category);
CREATE INDEX idx_universkin_products_active ON universkin_products(is_active);
CREATE INDEX idx_universkin_products_order ON universkin_products(display_order);

-- Enable RLS
ALTER TABLE universkin_products ENABLE ROW LEVEL SECURITY;

-- Anyone can read active products (public catalog)
CREATE POLICY "Anyone can view active products"
  ON universkin_products
  FOR SELECT
  USING (is_active = true);

-- ============================================================================
-- Table: country_universkin_products (Country Availability)
-- ============================================================================

CREATE TABLE IF NOT EXISTS country_universkin_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  product_id TEXT NOT NULL REFERENCES universkin_products(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(country_code, product_id)
);

-- Indexes
CREATE INDEX idx_country_universkin_products_country ON country_universkin_products(country_code);
CREATE INDEX idx_country_universkin_products_product ON country_universkin_products(product_id);

-- Enable RLS
ALTER TABLE country_universkin_products ENABLE ROW LEVEL SECURITY;

-- Anyone can view active country availability
CREATE POLICY "Anyone can view country product availability"
  ON country_universkin_products
  FOR SELECT
  USING (is_active = true);

-- ============================================================================
-- Table: doctor_universkin_products (Doctor Configuration)
-- ============================================================================

CREATE TABLE IF NOT EXISTS doctor_universkin_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES universkin_products(id) ON DELETE CASCADE,
  price_cents INTEGER,  -- NULL = use default price
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, product_id)
);

-- Indexes
CREATE INDEX idx_doctor_universkin_products_doctor ON doctor_universkin_products(doctor_id);
CREATE INDEX idx_doctor_universkin_products_product ON doctor_universkin_products(product_id);

-- Enable RLS
ALTER TABLE doctor_universkin_products ENABLE ROW LEVEL SECURITY;

-- Doctors can only access their own product configurations
CREATE POLICY "Doctors can view own product configs"
  ON doctor_universkin_products
  FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert own product configs"
  ON doctor_universkin_products
  FOR INSERT
  TO authenticated
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own product configs"
  ON doctor_universkin_products
  FOR UPDATE
  TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete own product configs"
  ON doctor_universkin_products
  FOR DELETE
  TO authenticated
  USING (doctor_id = auth.uid());

-- ============================================================================
-- Table: universkin_product_country_prices (Country-Specific Pricing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS universkin_product_country_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES universkin_products(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL,
  default_price_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, country_code)
);

-- Indexes
CREATE INDEX idx_universkin_country_prices_product ON universkin_product_country_prices(product_id);
CREATE INDEX idx_universkin_country_prices_country ON universkin_product_country_prices(country_code);

-- Enable RLS
ALTER TABLE universkin_product_country_prices ENABLE ROW LEVEL SECURITY;

-- Anyone can view country pricing
CREATE POLICY "Anyone can view country pricing"
  ON universkin_product_country_prices
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- Trigger: Auto-update updated_at for doctor_universkin_products
-- ============================================================================

CREATE OR REPLACE FUNCTION update_doctor_universkin_products_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_doctor_universkin_products_timestamp
  BEFORE UPDATE ON doctor_universkin_products
  FOR EACH ROW
  EXECUTE FUNCTION update_doctor_universkin_products_timestamp();
