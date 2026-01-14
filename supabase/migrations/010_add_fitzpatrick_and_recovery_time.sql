-- Migration: Add Fitzpatrick skin type and recovery time preferences
-- These fields are part of Clinical Medical History (Section 1)

-- Add fitzpatrick_skin_type column (single-select: I, II, III, IV, V, VI)
ALTER TABLE public.patient_medical_history
ADD COLUMN IF NOT EXISTS fitzpatrick_skin_type TEXT;

-- Add recovery_time_preferences column (multi-select array)
ALTER TABLE public.patient_medical_history
ADD COLUMN IF NOT EXISTS recovery_time_preferences TEXT[] DEFAULT '{}';

-- Add check constraint for valid Fitzpatrick values
ALTER TABLE public.patient_medical_history
ADD CONSTRAINT valid_fitzpatrick_type
CHECK (fitzpatrick_skin_type IS NULL OR fitzpatrick_skin_type IN ('I', 'II', 'III', 'IV', 'V', 'VI'));

-- Comment on columns for documentation
COMMENT ON COLUMN public.patient_medical_history.fitzpatrick_skin_type IS 'Fitzpatrick Skin Phototype (I-VI) - Clinical Medical History';
COMMENT ON COLUMN public.patient_medical_history.recovery_time_preferences IS 'Acceptable recovery time preferences (multi-select) - Clinical Medical History';
