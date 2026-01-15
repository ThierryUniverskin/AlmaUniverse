-- Migration: Add photo_consent_logs table for compliance tracking
-- Purpose: Log photo consent for audit trail and compliance

CREATE TABLE IF NOT EXISTS photo_consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  consent_given BOOLEAN NOT NULL,
  consent_text_version VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_photo_consent_patient ON photo_consent_logs(patient_id);
CREATE INDEX idx_photo_consent_doctor ON photo_consent_logs(doctor_id);
CREATE INDEX idx_photo_consent_created ON photo_consent_logs(created_at);

-- Enable RLS
ALTER TABLE photo_consent_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Doctors can view own consent logs"
  ON photo_consent_logs
  FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert consent logs"
  ON photo_consent_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (doctor_id = auth.uid());

-- Service role full access
CREATE POLICY "Service role full access to consent logs"
  ON photo_consent_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
