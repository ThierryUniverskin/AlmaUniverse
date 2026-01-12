-- Migration: Remove selected_ebd_devices column (legacy, replaced by selected_treatments)
--
-- The selected_ebd_devices column was originally used to store EBD device selections.
-- This has been replaced by the more flexible selected_treatments column which supports
-- multiple treatment categories (EBD, Toxin, Injectable, Other).

-- Drop the legacy column
ALTER TABLE clinical_evaluation_sessions
DROP COLUMN IF EXISTS selected_ebd_devices;

-- Add comment to document the change
COMMENT ON TABLE clinical_evaluation_sessions IS
  'Clinical evaluation sessions now use selected_treatments for all treatment categories (EBD, Toxin, Injectable, Other). The legacy selected_ebd_devices column has been removed.';
