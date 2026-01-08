-- Alma Universe Database Schema
-- Run this in Supabase SQL Editor to set up your database

-- ===========================================
-- DOCTORS TABLE
-- ===========================================
-- Note: id is linked to auth.users.id (same UUID after signup)

CREATE TABLE doctors (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  title TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  clinic_name TEXT,
  display_preference TEXT DEFAULT 'professional' CHECK (display_preference IN ('professional', 'clinic', 'both')),

  -- Personal Information
  country TEXT,
  language TEXT,

  -- Contact (stored as JSONB)
  personal_mobile JSONB,  -- { countryCode: "+1", number: "5551234567" }
  office_phone JSONB,      -- { countryCode: "+1", number: "5551234567" }
  personal_website TEXT,

  -- Professional
  questionnaire_url TEXT,
  medical_license_number TEXT,
  specialization TEXT,

  -- Extended
  bio TEXT,
  education TEXT,
  office_address JSONB,  -- { street, city, state, postalCode, country }

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- PATIENTS TABLE
-- ===========================================

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,

  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  sex TEXT CHECK (sex IN ('female', 'male', 'other', 'prefer-not-to-say')),
  phone TEXT,
  email TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- PHOTO SESSIONS TABLE
-- ===========================================

CREATE TABLE photo_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- Source
  source TEXT NOT NULL CHECK (source IN ('app', 'almaiq')),

  -- Photos (stored as storage paths)
  frontal_photo_url TEXT,
  left_profile_photo_url TEXT,
  right_profile_photo_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================
-- This ensures doctors can only access their own data

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_sessions ENABLE ROW LEVEL SECURITY;

-- Doctors can only view/update their own profile
CREATE POLICY "Doctors can view own profile"
  ON doctors FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Doctors can insert own profile"
  ON doctors FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Doctors can update own profile"
  ON doctors FOR UPDATE
  USING (auth.uid() = id);

-- Doctors can only access their own patients
CREATE POLICY "Doctors can view own patients"
  ON patients FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can insert own patients"
  ON patients FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update own patients"
  ON patients FOR UPDATE
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can delete own patients"
  ON patients FOR DELETE
  USING (auth.uid() = doctor_id);

-- Photo sessions - doctors can only access their own patients' photos
CREATE POLICY "Doctors can view own patients photo sessions"
  ON photo_sessions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = photo_sessions.patient_id
    AND patients.doctor_id = auth.uid()
  ));

CREATE POLICY "Doctors can insert own patients photo sessions"
  ON photo_sessions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = photo_sessions.patient_id
    AND patients.doctor_id = auth.uid()
  ));

CREATE POLICY "Doctors can update own patients photo sessions"
  ON photo_sessions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = photo_sessions.patient_id
    AND patients.doctor_id = auth.uid()
  ));

CREATE POLICY "Doctors can delete own patients photo sessions"
  ON photo_sessions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = photo_sessions.patient_id
    AND patients.doctor_id = auth.uid()
  ));

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_patients_doctor_id ON patients(doctor_id);
CREATE INDEX idx_patients_last_name ON patients(last_name);
CREATE INDEX idx_patients_created_at ON patients(created_at);
CREATE INDEX idx_photo_sessions_patient_id ON photo_sessions(patient_id);
CREATE INDEX idx_photo_sessions_created_at ON photo_sessions(created_at);

-- ===========================================
-- UPDATED_AT TRIGGER
-- ===========================================
-- Automatically update updated_at timestamp on row changes

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER photo_sessions_updated_at
  BEFORE UPDATE ON photo_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===========================================
-- HELPER FUNCTION: Create doctor profile after signup
-- ===========================================
-- This automatically creates a doctor record when a user signs up

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.doctors (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'firstName', 'New'),
    COALESCE(NEW.raw_user_meta_data->>'lastName', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions for the trigger to work
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.doctors TO supabase_auth_admin;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
