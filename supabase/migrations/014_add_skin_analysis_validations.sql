-- Migration: Add skin analysis validations table
-- Purpose: Store doctor-validated skin diagnostics with change tracking
-- This enables tracking what doctors changed vs AI analysis for ML improvement

-- ============================================================================
-- Table: skin_analysis_validations
-- Stores doctor-validated/modified skin analysis data
-- ============================================================================

CREATE TABLE IF NOT EXISTS skin_analysis_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skin_analysis_id UUID NOT NULL REFERENCES skin_analysis_results(id) ON DELETE CASCADE,
  photo_session_id UUID NOT NULL REFERENCES photo_sessions(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,

  -- Validated scores (doctor's final values)
  -- Structure: [{categoryId: string, visibilityLevel: number}]
  validated_scores JSONB NOT NULL,

  -- Validated details per category
  -- Structure: {categoryId: [{id, name, scoreValue, aiScoreValue, ...}]}
  validated_details JSONB,

  -- Validated patient attributes
  -- Structure: {gender, eyeColor, fitzpatrickType, skinThickness, skinType}
  validated_attributes JSONB,

  -- Doctor's edited overview text
  validated_overview_text TEXT,

  -- Selected priority concerns
  priority_face_concerns TEXT[] DEFAULT '{}',
  priority_additional_concerns TEXT[] DEFAULT '{}',
  concerns_manually_edited BOOLEAN DEFAULT FALSE,

  -- Track modifications (diff from AI)
  -- Structure: {scoreChanges: [], detailChanges: [], attributeChanges: [], overviewChanged: bool, concernsChanged: bool}
  modifications JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Only one validation per photo session (overwrite on re-edit)
  CONSTRAINT unique_validation_per_session UNIQUE (photo_session_id)
);

-- Indexes for common queries
CREATE INDEX idx_skin_validations_photo_session ON skin_analysis_validations(photo_session_id);
CREATE INDEX idx_skin_validations_analysis ON skin_analysis_validations(skin_analysis_id);
CREATE INDEX idx_skin_validations_doctor ON skin_analysis_validations(doctor_id);
CREATE INDEX idx_skin_validations_created ON skin_analysis_validations(created_at DESC);

-- Enable RLS
ALTER TABLE skin_analysis_validations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Doctors can only access their own validations
CREATE POLICY "Doctors can view own validations"
  ON skin_analysis_validations
  FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert own validations"
  ON skin_analysis_validations
  FOR INSERT
  TO authenticated
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own validations"
  ON skin_analysis_validations
  FOR UPDATE
  TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete own validations"
  ON skin_analysis_validations
  FOR DELETE
  TO authenticated
  USING (doctor_id = auth.uid());

-- ============================================================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_skin_validation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_skin_validation_timestamp
  BEFORE UPDATE ON skin_analysis_validations
  FOR EACH ROW
  EXECUTE FUNCTION update_skin_validation_timestamp();
