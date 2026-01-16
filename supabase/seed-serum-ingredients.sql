-- Seed data for serum ingredients
-- Run after 017_add_serum_ingredients.sql migration

-- ============================================================================
-- Serum Ingredients (21 total)
-- ============================================================================
-- Colors are organized by skin wellness category associations:
-- Yellow (#D4A84B) - Radiance
-- Pink (#D668B0) - Smoothness/Anti-aging
-- Red (#C13050) - Redness/Vascular
-- Blue (#4A9BE8) - Hydration
-- Orange (#E07030) - Oil control/Shine
-- Grey (#A89880) - Texture/Exfoliation
-- Green (#2DA850) - Blemishes
-- Brown (#8B5A2B) - Pigmentation/Tone

INSERT INTO serum_ingredients (id, name, base_concentration, color, display_order, is_active)
VALUES
  -- Yellow (Radiance)
  ('sod', 'SOD', 2.00, '#D4A84B', 1, true),
  ('ferulic-acid', 'Ferulic Acid', 1.00, '#D4A84B', 2, true),

  -- Pink (Smoothness/Anti-aging)
  ('vitamin-c', 'Vitamin C', 7.00, '#D668B0', 3, true),
  ('isoflavones', 'Isoflavones', 2.00, '#D668B0', 4, true),
  ('dmae', 'DMAE', 2.50, '#D668B0', 5, true),
  ('madecassoside', 'Madecassoside', 1.00, '#D668B0', 6, true),
  ('retinal', 'Retinal', 0.20, '#D668B0', 7, true),
  ('retinol', 'Retinol', 0.20, '#D668B0', 8, true),

  -- Red (Redness/Vascular)
  ('niacinamide', 'Niacinamide', 4.00, '#C13050', 9, true),
  ('rutin-tx', 'Rutin-TX', 3.00, '#C13050', 10, true),
  ('azelaic-acid', 'Azelaic Acid', 5.40, '#C13050', 11, true),

  -- Blue (Hydration)
  ('aloe-vera', 'Aloe Vera', 5.40, '#4A9BE8', 12, true),
  ('d-panthenol', 'D-Panthenol', 5.00, '#4A9BE8', 13, true),

  -- Orange (Oil control)
  ('zinc', 'Zinc', 2.50, '#E07030', 14, true),

  -- Grey (Texture/Exfoliation)
  ('glycolic-acid', 'Glycolic Acid', 7.00, '#A89880', 15, true),
  ('salicylic-acid', 'Salicylic Acid', 2.00, '#A89880', 16, true),
  ('phytic-acid', 'Phytic Acid', 2.00, '#A89880', 17, true),

  -- Green (Blemishes)
  ('lactopeptide', 'Lactopeptide', 3.50, '#2DA850', 18, true),

  -- Brown (Pigmentation/Tone)
  ('arbutin', 'Arbutin', 3.00, '#8B5A2B', 19, true),
  ('kojic-acid', 'Kojic Acid', 2.00, '#8B5A2B', 20, true),
  ('tranexamic-acid', 'Tranexamic Acid', 4.00, '#8B5A2B', 21, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  base_concentration = EXCLUDED.base_concentration,
  color = EXCLUDED.color,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;


-- ============================================================================
-- Country Availability: US (18 of 21 available)
-- Not available in US: Phytic Acid, Retinol, Aloe Vera
-- ============================================================================

-- Insert all as available first
INSERT INTO country_serum_ingredients (country_code, ingredient_id, is_available)
SELECT 'US', id, true
FROM serum_ingredients
WHERE id NOT IN ('phytic-acid', 'retinol', 'aloe-vera')
ON CONFLICT (country_code, ingredient_id) DO UPDATE SET
  is_available = EXCLUDED.is_available;

-- Mark unavailable ones
INSERT INTO country_serum_ingredients (country_code, ingredient_id, is_available)
VALUES
  ('US', 'phytic-acid', false),
  ('US', 'retinol', false),
  ('US', 'aloe-vera', false)
ON CONFLICT (country_code, ingredient_id) DO UPDATE SET
  is_available = EXCLUDED.is_available;
