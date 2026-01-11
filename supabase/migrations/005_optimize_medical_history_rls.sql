-- Optimize patient_medical_history RLS policies
-- Fix auth.uid() re-evaluation per row

-- Drop existing policies
DROP POLICY IF EXISTS "Doctors can view own patients medical history" ON patient_medical_history;
DROP POLICY IF EXISTS "Doctors can insert own patients medical history" ON patient_medical_history;
DROP POLICY IF EXISTS "Doctors can update own patients medical history" ON patient_medical_history;
DROP POLICY IF EXISTS "Doctors can delete own patients medical history" ON patient_medical_history;

-- Recreate with optimized (SELECT auth.uid()) pattern
CREATE POLICY "Doctors can view own patients medical history"
  ON patient_medical_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = patient_medical_history.patient_id
        AND patients.doctor_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Doctors can insert own patients medical history"
  ON patient_medical_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = patient_medical_history.patient_id
        AND patients.doctor_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Doctors can update own patients medical history"
  ON patient_medical_history FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = patient_medical_history.patient_id
        AND patients.doctor_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Doctors can delete own patients medical history"
  ON patient_medical_history FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = patient_medical_history.patient_id
        AND patients.doctor_id = (SELECT auth.uid())
    )
  );
