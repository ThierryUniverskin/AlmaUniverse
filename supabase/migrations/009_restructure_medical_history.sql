-- Migration: Restructure patient_medical_history for Health Background page
-- This migration separates clinical medical history from cosmetic safety profile data
--
-- Key principle: "Clinical Medical History is never used by AI;
-- Cosmetic Safety Profile is used only to exclude cosmetic ingredients."
--
-- Changes:
-- 1. Drop unused columns (hormonal contraception, HRT, inflammatory skin, cold sores, recovery time)
-- 2. Rename columns (known_allergies → cosmetic_sensitivities, other_allergies → other_sensitivities)
-- 3. Add new column (has_exfoliant_sensitivity)

-- ============================================
-- STEP 1: Drop unused columns
-- ============================================

-- These fields are being removed as they are not needed for either clinical
-- documentation or cosmetic safety profiling:

ALTER TABLE public.patient_medical_history
  DROP COLUMN IF EXISTS uses_hormonal_contraception;

ALTER TABLE public.patient_medical_history
  DROP COLUMN IF EXISTS receives_hrt;

ALTER TABLE public.patient_medical_history
  DROP COLUMN IF EXISTS has_inflammatory_skin_condition;

ALTER TABLE public.patient_medical_history
  DROP COLUMN IF EXISTS has_active_cold_sores;

ALTER TABLE public.patient_medical_history
  DROP COLUMN IF EXISTS recovery_time_preference;

-- ============================================
-- STEP 2: Rename columns for clarity
-- ============================================

-- Rename known_allergies to cosmetic_sensitivities
-- This better reflects the purpose: excluding cosmetic ingredients (not medications)
ALTER TABLE public.patient_medical_history
  RENAME COLUMN known_allergies TO cosmetic_sensitivities;

-- Rename other_allergies to other_sensitivities
ALTER TABLE public.patient_medical_history
  RENAME COLUMN other_allergies TO other_sensitivities;

-- ============================================
-- STEP 3: Add new column
-- ============================================

-- Add exfoliant sensitivity field (replaces photosensitivity concept)
-- This is a yes/no toggle for general sensitivity to exfoliating ingredients
ALTER TABLE public.patient_medical_history
  ADD COLUMN IF NOT EXISTS has_exfoliant_sensitivity BOOLEAN DEFAULT false;

-- ============================================
-- STEP 4: Add comment for documentation
-- ============================================

COMMENT ON TABLE public.patient_medical_history IS
'Patient health background data split into two conceptual sections:
1. CLINICAL MEDICAL HISTORY (has_cancer_history, cancer_types, cancer_details, current_medications, relevant_medical_conditions) - Never used by AI
2. COSMETIC SAFETY PROFILE (is_pregnant_or_breastfeeding, menopausal_status, has_exfoliant_sensitivity, cosmetic_sensitivities, other_sensitivities) - Used only for ingredient exclusion in Skin Wellness Mode';

-- Add comments to individual columns for clarity
COMMENT ON COLUMN public.patient_medical_history.has_cancer_history IS 'CLINICAL: Cancer history for physician documentation only';
COMMENT ON COLUMN public.patient_medical_history.cancer_types IS 'CLINICAL: Types of cancer (breast, skin, gynecological, prostate, gi, hematologic, other)';
COMMENT ON COLUMN public.patient_medical_history.cancer_details IS 'CLINICAL: Additional cancer details text';
COMMENT ON COLUMN public.patient_medical_history.current_medications IS 'CLINICAL: Current medications for physician documentation';
COMMENT ON COLUMN public.patient_medical_history.relevant_medical_conditions IS 'CLINICAL: Other relevant medical conditions';

COMMENT ON COLUMN public.patient_medical_history.is_pregnant_or_breastfeeding IS 'COSMETIC SAFETY: Excludes retinoids and certain ingredients';
COMMENT ON COLUMN public.patient_medical_history.menopausal_status IS 'COSMETIC SAFETY: May affect ingredient recommendations';
COMMENT ON COLUMN public.patient_medical_history.has_exfoliant_sensitivity IS 'COSMETIC SAFETY: Sensitivity to exfoliating ingredients (AHAs, BHAs, retinoids)';
COMMENT ON COLUMN public.patient_medical_history.cosmetic_sensitivities IS 'COSMETIC SAFETY: Known sensitivities to cosmetic ingredients (retinoids, ahas, salicylic-acid, fragrances, parabens, soy, latex)';
COMMENT ON COLUMN public.patient_medical_history.other_sensitivities IS 'COSMETIC SAFETY: Free text for other cosmetic sensitivities';
