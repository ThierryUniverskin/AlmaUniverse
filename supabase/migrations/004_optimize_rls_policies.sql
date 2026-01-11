-- Optimize RLS policies to evaluate auth.uid() once per query instead of per-row
-- This improves query performance at scale

-- Drop and recreate doctors policies
DROP POLICY IF EXISTS "Doctors can view own profile" ON doctors;
DROP POLICY IF EXISTS "Doctors can insert own profile" ON doctors;
DROP POLICY IF EXISTS "Doctors can update own profile" ON doctors;

CREATE POLICY "Doctors can view own profile"
  ON doctors FOR SELECT
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Doctors can insert own profile"
  ON doctors FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Doctors can update own profile"
  ON doctors FOR UPDATE
  USING ((SELECT auth.uid()) = id);

-- Drop and recreate patients policies
DROP POLICY IF EXISTS "Doctors can view own patients" ON patients;
DROP POLICY IF EXISTS "Doctors can insert own patients" ON patients;
DROP POLICY IF EXISTS "Doctors can update own patients" ON patients;
DROP POLICY IF EXISTS "Doctors can delete own patients" ON patients;

CREATE POLICY "Doctors can view own patients"
  ON patients FOR SELECT
  USING ((SELECT auth.uid()) = doctor_id);

CREATE POLICY "Doctors can insert own patients"
  ON patients FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = doctor_id);

CREATE POLICY "Doctors can update own patients"
  ON patients FOR UPDATE
  USING ((SELECT auth.uid()) = doctor_id);

CREATE POLICY "Doctors can delete own patients"
  ON patients FOR DELETE
  USING ((SELECT auth.uid()) = doctor_id);

-- Drop and recreate photo_sessions policies
DROP POLICY IF EXISTS "Doctors can view own patients photo sessions" ON photo_sessions;
DROP POLICY IF EXISTS "Doctors can insert own patients photo sessions" ON photo_sessions;
DROP POLICY IF EXISTS "Doctors can update own patients photo sessions" ON photo_sessions;
DROP POLICY IF EXISTS "Doctors can delete own patients photo sessions" ON photo_sessions;

CREATE POLICY "Doctors can view own patients photo sessions"
  ON photo_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = photo_sessions.patient_id
        AND patients.doctor_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Doctors can insert own patients photo sessions"
  ON photo_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = photo_sessions.patient_id
        AND patients.doctor_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Doctors can update own patients photo sessions"
  ON photo_sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = photo_sessions.patient_id
        AND patients.doctor_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Doctors can delete own patients photo sessions"
  ON photo_sessions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = photo_sessions.patient_id
        AND patients.doctor_id = (SELECT auth.uid())
    )
  );

-- Drop and recreate clinical_evaluation_sessions policies
DROP POLICY IF EXISTS "Doctors can view own clinical evaluation sessions" ON clinical_evaluation_sessions;
DROP POLICY IF EXISTS "Doctors can insert own clinical evaluation sessions" ON clinical_evaluation_sessions;
DROP POLICY IF EXISTS "Doctors can update own clinical evaluation sessions" ON clinical_evaluation_sessions;
DROP POLICY IF EXISTS "Doctors can delete own clinical evaluation sessions" ON clinical_evaluation_sessions;

CREATE POLICY "Doctors can view own clinical evaluation sessions"
  ON clinical_evaluation_sessions FOR SELECT
  USING ((SELECT auth.uid()) = doctor_id);

CREATE POLICY "Doctors can insert own clinical evaluation sessions"
  ON clinical_evaluation_sessions FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = doctor_id);

CREATE POLICY "Doctors can update own clinical evaluation sessions"
  ON clinical_evaluation_sessions FOR UPDATE
  USING ((SELECT auth.uid()) = doctor_id);

CREATE POLICY "Doctors can delete own clinical evaluation sessions"
  ON clinical_evaluation_sessions FOR DELETE
  USING ((SELECT auth.uid()) = doctor_id);

-- Drop and recreate doctor_devices policies
DROP POLICY IF EXISTS "Doctors can view own device assignments" ON doctor_devices;
DROP POLICY IF EXISTS "Doctors can insert own device assignments" ON doctor_devices;
DROP POLICY IF EXISTS "Doctors can update own device assignments" ON doctor_devices;
DROP POLICY IF EXISTS "Doctors can delete own device assignments" ON doctor_devices;

CREATE POLICY "Doctors can view own device assignments"
  ON doctor_devices FOR SELECT
  USING ((SELECT auth.uid()) = doctor_id);

CREATE POLICY "Doctors can insert own device assignments"
  ON doctor_devices FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = doctor_id);

CREATE POLICY "Doctors can update own device assignments"
  ON doctor_devices FOR UPDATE
  USING ((SELECT auth.uid()) = doctor_id);

CREATE POLICY "Doctors can delete own device assignments"
  ON doctor_devices FOR DELETE
  USING ((SELECT auth.uid()) = doctor_id);

-- Drop and recreate doctor_procedures policies
DROP POLICY IF EXISTS "Doctors can view own procedures" ON doctor_procedures;
DROP POLICY IF EXISTS "Doctors can insert own procedures" ON doctor_procedures;
DROP POLICY IF EXISTS "Doctors can update own procedures" ON doctor_procedures;
DROP POLICY IF EXISTS "Doctors can delete own procedures" ON doctor_procedures;

CREATE POLICY "Doctors can view own procedures"
  ON doctor_procedures FOR SELECT
  USING ((SELECT auth.uid()) = doctor_id);

CREATE POLICY "Doctors can insert own procedures"
  ON doctor_procedures FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = doctor_id);

CREATE POLICY "Doctors can update own procedures"
  ON doctor_procedures FOR UPDATE
  USING ((SELECT auth.uid()) = doctor_id);

CREATE POLICY "Doctors can delete own procedures"
  ON doctor_procedures FOR DELETE
  USING ((SELECT auth.uid()) = doctor_id);
