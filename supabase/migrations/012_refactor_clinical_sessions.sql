-- Migration: Refactor clinical_evaluation_sessions for better status tracking
-- Purpose: Create session at start, track progress through phases, link skin analysis
-- Note: This is a breaking change - drops existing data (dev only)

-- ============================================================================
-- Drop existing tables (dev only - no production data)
-- ============================================================================

DROP TABLE IF EXISTS clinical_evaluation_sessions CASCADE;

-- ============================================================================
-- Table: clinical_evaluation_sessions (NEW SCHEMA)
-- Created at the start of clinical documentation flow
-- ============================================================================

CREATE TABLE clinical_evaluation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core relationships
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  photo_session_id UUID REFERENCES photo_sessions(id) ON DELETE SET NULL,

  -- Progress tracking
  current_step INTEGER DEFAULT 1 CHECK (current_step BETWEEN 1 AND 6),

  -- Overall status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'abandoned')),

  -- Phase statuses
  medical_status VARCHAR(20) DEFAULT 'pending' CHECK (medical_status IN ('pending', 'in_progress', 'completed')),
  analysis_status VARCHAR(20) DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'in_progress', 'completed', 'skipped')),
  skincare_status VARCHAR(20) DEFAULT 'pending' CHECK (skincare_status IN ('pending', 'in_progress', 'completed')),

  -- Flags for what was included
  has_photos BOOLEAN DEFAULT FALSE,
  has_concerns BOOLEAN DEFAULT FALSE,

  -- Clinical data
  selected_skin_concerns TEXT[] DEFAULT '{}',
  selected_treatments JSONB DEFAULT '[]',
  notes TEXT,

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  medical_completed_at TIMESTAMPTZ,
  analysis_completed_at TIMESTAMPTZ,
  skincare_completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_clinical_sessions_patient ON clinical_evaluation_sessions(patient_id);
CREATE INDEX idx_clinical_sessions_doctor ON clinical_evaluation_sessions(doctor_id);
CREATE INDEX idx_clinical_sessions_photo ON clinical_evaluation_sessions(photo_session_id);
CREATE INDEX idx_clinical_sessions_status ON clinical_evaluation_sessions(status);
CREATE INDEX idx_clinical_sessions_last_activity ON clinical_evaluation_sessions(last_activity_at);

-- Enable RLS
ALTER TABLE clinical_evaluation_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Doctors can view own clinical sessions"
  ON clinical_evaluation_sessions
  FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert own clinical sessions"
  ON clinical_evaluation_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own clinical sessions"
  ON clinical_evaluation_sessions
  FOR UPDATE
  TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete own clinical sessions"
  ON clinical_evaluation_sessions
  FOR DELETE
  TO authenticated
  USING (doctor_id = auth.uid());

-- Service role full access (for server-side operations)
CREATE POLICY "Service role full access to clinical sessions"
  ON clinical_evaluation_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ============================================================================
-- Update skin_analysis_results: Add clinical_session_id
-- ============================================================================

ALTER TABLE skin_analysis_results
ADD COLUMN IF NOT EXISTS clinical_session_id UUID REFERENCES clinical_evaluation_sessions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_skin_analysis_clinical_session ON skin_analysis_results(clinical_session_id);


-- ============================================================================
-- Function: Update last_activity_at automatically
-- ============================================================================

CREATE OR REPLACE FUNCTION update_clinical_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = NOW();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_clinical_session_activity
  BEFORE UPDATE ON clinical_evaluation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_clinical_session_activity();


-- ============================================================================
-- Function: Mark abandoned sessions (can be called by cron or manually)
-- Sessions with no activity for 7+ days and not completed
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_abandoned_sessions(days_threshold INTEGER DEFAULT 7)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  UPDATE clinical_evaluation_sessions
  SET status = 'abandoned'
  WHERE status IN ('draft', 'in_progress')
    AND last_activity_at < NOW() - (days_threshold || ' days')::INTERVAL;

  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$;
