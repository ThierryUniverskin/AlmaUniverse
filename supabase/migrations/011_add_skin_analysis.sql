-- Migration: Add skin analysis results and API usage tracking tables
-- Purpose: Store SkinXS diagnostic API results and track rate limiting

-- ============================================================================
-- Table: skin_analysis_results
-- Stores AI skin analysis results linked to photo sessions
-- ============================================================================

CREATE TABLE IF NOT EXISTS skin_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_session_id UUID NOT NULL REFERENCES photo_sessions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,

  -- API metadata
  diagnostic_id VARCHAR(20),
  api_language VARCHAR(5) DEFAULT 'en',

  -- Raw responses (for future statistics)
  raw_response JSONB NOT NULL,              -- Full diagnostic object (English)
  raw_response_translated JSONB,            -- characteristics_translated section

  -- Parsed: Patient attributes
  gender VARCHAR(20),
  age_group VARCHAR(30),
  estimated_age INTEGER,
  ethnicity VARCHAR(50),
  eye_color VARCHAR(20),
  hair_color VARCHAR(30),
  phototype INTEGER,
  skin_thickness VARCHAR(20),
  skin_type VARCHAR(30),
  skin_age VARCHAR(20),

  -- Parsed: Summary
  skin_health_overview TEXT,
  priority_concerns TEXT[],                 -- e.g., ['yellow', 'red', 'neck']

  -- Parsed: Category scores (0-10 dysfunction scores)
  score_radiance INTEGER,
  score_smoothness INTEGER,
  score_redness INTEGER,
  score_hydration INTEGER,
  score_shine INTEGER,
  score_texture INTEGER,
  score_blemishes INTEGER,
  score_tone INTEGER,
  score_eye_contour INTEGER,
  score_neck_decollete INTEGER,

  -- Parsed: Parameter-level multichoice scores (for statistics)
  -- Structure: { "complexion": 2, "tiredness": 1, "sun_damage": 2, ... }
  parameter_scores JSONB,

  -- Image quality
  image_quality_score INTEGER,
  image_quality_summary TEXT,

  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one analysis per photo session
  CONSTRAINT unique_photo_session UNIQUE (photo_session_id)
);

-- Indexes for common queries
CREATE INDEX idx_skin_analysis_photo_session ON skin_analysis_results(photo_session_id);
CREATE INDEX idx_skin_analysis_patient ON skin_analysis_results(patient_id);
CREATE INDEX idx_skin_analysis_doctor ON skin_analysis_results(doctor_id);
CREATE INDEX idx_skin_analysis_status ON skin_analysis_results(status);
CREATE INDEX idx_skin_analysis_created ON skin_analysis_results(created_at DESC);

-- Enable RLS
ALTER TABLE skin_analysis_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Doctors can only access their own analysis results
CREATE POLICY "Doctors can view own analysis results"
  ON skin_analysis_results
  FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert own analysis results"
  ON skin_analysis_results
  FOR INSERT
  TO authenticated
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own analysis results"
  ON skin_analysis_results
  FOR UPDATE
  TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete own analysis results"
  ON skin_analysis_results
  FOR DELETE
  TO authenticated
  USING (doctor_id = auth.uid());


-- ============================================================================
-- Table: api_usage_logs
-- Tracks API usage per doctor for rate limiting (1000 requests/month)
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  api_name VARCHAR(50) NOT NULL,            -- 'skinxs_analysis'
  month_year VARCHAR(7) NOT NULL,           -- '2024-01' format
  request_count INTEGER DEFAULT 0,
  last_request_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one record per doctor/api/month
  CONSTRAINT unique_doctor_api_month UNIQUE (doctor_id, api_name, month_year)
);

-- Indexes
CREATE INDEX idx_api_usage_doctor ON api_usage_logs(doctor_id);
CREATE INDEX idx_api_usage_month ON api_usage_logs(month_year);
CREATE INDEX idx_api_usage_lookup ON api_usage_logs(doctor_id, api_name, month_year);

-- Enable RLS
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Doctors can only view their own usage
CREATE POLICY "Doctors can view own API usage"
  ON api_usage_logs
  FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid());

-- Service role can insert/update (for server-side API routes)
CREATE POLICY "Service can manage API usage"
  ON api_usage_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to insert/update their own records
CREATE POLICY "Doctors can insert own API usage"
  ON api_usage_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own API usage"
  ON api_usage_logs
  FOR UPDATE
  TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());


-- ============================================================================
-- Function: Increment API usage counter (atomic operation)
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_api_usage(
  p_doctor_id UUID,
  p_api_name VARCHAR(50),
  p_month_year VARCHAR(7)
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Upsert: insert if not exists, increment if exists
  INSERT INTO api_usage_logs (doctor_id, api_name, month_year, request_count, last_request_at)
  VALUES (p_doctor_id, p_api_name, p_month_year, 1, NOW())
  ON CONFLICT (doctor_id, api_name, month_year)
  DO UPDATE SET
    request_count = api_usage_logs.request_count + 1,
    last_request_at = NOW()
  RETURNING request_count INTO v_count;

  RETURN v_count;
END;
$$;


-- ============================================================================
-- Function: Check if doctor is within rate limit
-- ============================================================================

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_doctor_id UUID,
  p_api_name VARCHAR(50),
  p_limit INTEGER DEFAULT 1000
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
  v_month_year VARCHAR(7);
BEGIN
  -- Get current month in YYYY-MM format
  v_month_year := TO_CHAR(NOW(), 'YYYY-MM');

  -- Get current usage count
  SELECT COALESCE(request_count, 0) INTO v_count
  FROM api_usage_logs
  WHERE doctor_id = p_doctor_id
    AND api_name = p_api_name
    AND month_year = v_month_year;

  -- Return true if within limit
  RETURN COALESCE(v_count, 0) < p_limit;
END;
$$;
