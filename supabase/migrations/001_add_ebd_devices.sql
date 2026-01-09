-- Migration: Add EBD Devices Tables
-- Run this in Supabase SQL Editor to add device management tables

-- ===========================================
-- EBD DEVICES TABLE (Master product catalog)
-- ===========================================
CREATE TABLE IF NOT EXISTS ebd_devices (
  id TEXT PRIMARY KEY,

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,

  -- Treatment attributes
  treats TEXT[] DEFAULT '{}',
  fitzpatrick TEXT,
  downtime TEXT CHECK (downtime IN ('None', 'Minimal', 'Some')),

  -- Categorization
  tags TEXT[] DEFAULT '{}',
  product_family TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- DOCTOR DEVICES (Which devices each doctor has access to)
-- ===========================================
CREATE TABLE IF NOT EXISTS doctor_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL REFERENCES ebd_devices(id) ON DELETE CASCADE,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(doctor_id, device_id)
);

-- ===========================================
-- COUNTRY DEVICES (Which devices available per country)
-- ===========================================
CREATE TABLE IF NOT EXISTS country_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  device_id TEXT NOT NULL REFERENCES ebd_devices(id) ON DELETE CASCADE,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(country_code, device_id)
);

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- EBD Devices - Public read access (catalog data)
ALTER TABLE ebd_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active EBD devices"
  ON ebd_devices FOR SELECT
  USING (is_active = true);

-- Doctor Devices - Doctors can only see their own device assignments
ALTER TABLE doctor_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view own device assignments"
  ON doctor_devices FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can insert own device assignments"
  ON doctor_devices FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update own device assignments"
  ON doctor_devices FOR UPDATE
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can delete own device assignments"
  ON doctor_devices FOR DELETE
  USING (auth.uid() = doctor_id);

-- Country Devices - Public read access (availability data)
ALTER TABLE country_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view country device availability"
  ON country_devices FOR SELECT
  USING (is_active = true);

-- ===========================================
-- INDEXES
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_ebd_devices_name ON ebd_devices(name);
CREATE INDEX IF NOT EXISTS idx_ebd_devices_product_family ON ebd_devices(product_family);
CREATE INDEX IF NOT EXISTS idx_ebd_devices_is_active ON ebd_devices(is_active);
CREATE INDEX IF NOT EXISTS idx_doctor_devices_doctor_id ON doctor_devices(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_devices_device_id ON doctor_devices(device_id);
CREATE INDEX IF NOT EXISTS idx_country_devices_country_code ON country_devices(country_code);
CREATE INDEX IF NOT EXISTS idx_country_devices_device_id ON country_devices(device_id);

-- ===========================================
-- TRIGGER FOR updated_at
-- ===========================================
CREATE TRIGGER ebd_devices_updated_at
  BEFORE UPDATE ON ebd_devices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
