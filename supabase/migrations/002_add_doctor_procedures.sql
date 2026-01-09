-- ===========================================
-- Migration: Add Doctor Procedures Table
-- Purpose: Support custom Toxins, Injectables, and Other Aesthetic Procedures
-- ===========================================

-- Create doctor_procedures table
CREATE TABLE IF NOT EXISTS doctor_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,

  -- Category: 'toxin', 'injectable', 'other'
  category TEXT NOT NULL CHECK (category IN ('toxin', 'injectable', 'other')),

  -- Subcategory (only for 'other' category)
  -- Options: biostimulators, skin_boosters, prp, mesotherapy, rf_microneedling,
  --          ultrasound_tightening, microneedling, chemical_peels,
  --          dermabrasion, microdermabrasion, prp_hair, hair_mesotherapy
  subcategory TEXT,

  -- Procedure details
  name TEXT NOT NULL,
  brand TEXT,
  description TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure subcategory is valid when category is 'other'
  CONSTRAINT valid_subcategory CHECK (
    (category != 'other') OR
    (subcategory IN (
      'biostimulators', 'skin_boosters', 'prp', 'mesotherapy',
      'rf_microneedling', 'ultrasound_tightening', 'microneedling',
      'chemical_peels', 'dermabrasion', 'microdermabrasion',
      'prp_hair', 'hair_mesotherapy'
    ))
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_doctor_procedures_doctor_id ON doctor_procedures(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_procedures_category ON doctor_procedures(category);
CREATE INDEX IF NOT EXISTS idx_doctor_procedures_is_active ON doctor_procedures(is_active);

-- Enable RLS
ALTER TABLE doctor_procedures ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Doctors can view own procedures"
  ON doctor_procedures FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can insert own procedures"
  ON doctor_procedures FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update own procedures"
  ON doctor_procedures FOR UPDATE
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can delete own procedures"
  ON doctor_procedures FOR DELETE
  USING (auth.uid() = doctor_id);

-- Updated_at trigger (reuse existing function if available)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'doctor_procedures_updated_at') THEN
    CREATE TRIGGER doctor_procedures_updated_at
      BEFORE UPDATE ON doctor_procedures
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END
$$;

-- ===========================================
-- Add selected_treatments column to clinical_evaluation_sessions
-- ===========================================

ALTER TABLE clinical_evaluation_sessions
ADD COLUMN IF NOT EXISTS selected_treatments JSONB DEFAULT '[]';

-- Comment for documentation
COMMENT ON COLUMN clinical_evaluation_sessions.selected_treatments IS
'Array of selected treatments across all categories. Structure: [{ type: "ebd"|"toxin"|"injectable"|"other", deviceId?: string, procedureId?: string, sessionCount: number|null, notes: string }]';
