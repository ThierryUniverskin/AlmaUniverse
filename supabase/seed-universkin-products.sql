-- Seed data for Universkin products
-- Run after 015_add_universkin_products.sql and 016_add_universkin_duration_and_apply_time.sql migrations

-- ============================================================================
-- Insert Products
-- ============================================================================

INSERT INTO universkin_products (id, name, category, description, default_size, available_sizes, default_price_cents, display_order, duration_days, when_to_apply)
VALUES
  -- Cleanse (category order: 1)
  (
    'hydrating-oil-cleanser',
    'Hydrating Oil Cleanser',
    'cleanse',
    'A multi-purpose cleansing and soothing oil, a patented combination of olive oil, CO2 plant extracts and Omega-3 that helps to cleanse and repair the skin. Can also be used on the eye contour, hair and scalp. Suitable for all skin types.',
    '100ml',
    ARRAY['100ml'],
    4100,
    10,
    60,
    'AM&PM'
  ),
  (
    'clarifying-gel-cleanser',
    'Clarifying Gel Cleanser',
    'cleanse',
    'A high-performance foaming gel cleanser with 10% AHA, 2% BHA, 2% PHA, and 2% Succinic Acid for daily exfoliation and clarity. Gently lifts impurities, refines pores, and supports skin renewal without irritation. Leaves the skin fresh, balanced, and ready for your skincare routine.',
    '100ml',
    ARRAY['100ml'],
    5200,
    11,
    60,
    'AM&PM'
  ),

  -- Prep (category order: 2)
  (
    'daily-radiance-pads',
    'Daily Radiance Pads',
    'prep',
    'A brightening dual-phase treatment system combining a concentrated solution with 30 pre-soaked pads. Designed to refine skin tone, smooth texture, and support radiance with twice-daily use. A gentle exfoliating blend helps reveal a clearer, more even complexion while preparing the skin for subsequent treatments.',
    '30 units',
    ARRAY['30 units'],
    8500,
    20,
    30,
    'AM&PM'
  ),
  (
    'barrier-renewal-pads',
    'Barrier Renewal Pads',
    'prep',
    'An advanced resurfacing pad system powered by exfoliating acids to smooth texture, reduce dullness, and support nightly skin renewal. Designed for evening use to refine pores, brighten the complexion, and enhance absorption of follow-up treatments while respecting the skin barrier.',
    '30 units',
    ARRAY['30 units'],
    8500,
    21,
    60,
    'PM'
  ),

  -- Strengthen (category order: 4)
  (
    'barrier-nourishing-creme-light',
    'Barrier Nourishing Crème - Light',
    'strengthen',
    'Multifunctional rich and creamy emulsion based on biomimetic peptides and omega-3 from Camelina oil that helps protect, strengthen and improve skin texture.',
    '50ml',
    ARRAY['50ml'],
    6800,
    40,
    30,
    'AM&PM'
  ),
  (
    'barrier-nourishing-creme-rich',
    'Barrier Nourishing Crème - Rich',
    'strengthen',
    'Multifunctional rich and creamy emulsion based on biomimetic peptides and omega-3 from Camelina oil that helps protect, strengthen and improve skin texture.',
    '50ml',
    ARRAY['50ml'],
    6800,
    41,
    30,
    'AM&PM'
  ),
  (
    'barrier-restoring-balm',
    'Barrier Restoring Balm',
    'strengthen',
    'An advanced skin rebalancing anhydrous balm, helps regenerate and repair the superficial layers of the epidermis by alleviating inflammation. The texture is very rich.',
    '30ml',
    ARRAY['30ml'],
    8300,
    42,
    60,
    'AM&PM'
  ),
  (
    'ha-boosting-serum',
    'HA Boosting Serum',
    'strengthen',
    'A universal active with pure hyaluronic acid of different molecular weight in a super bottle. It has one of the highest dosages of HA on the market and provides the ultimate hydration and enhancement to your skin. It can be used alone or mixed with universkin serum P.',
    '30ml',
    ARRAY['30ml'],
    8000,
    43,
    60,
    'AM&PM'
  ),

  -- Sunscreen (category order: 5)
  (
    'daily-mineral-serum-spf50',
    'Daily Mineral Serum SPF50',
    'sunscreen',
    'A zinc oxide-only mineral sunscreen designed to deliver broad-spectrum SPF 50 protection in a lightweight serum, this formula offers a natural, glowing finish without a white cast. Fragrance-free, vegan, and water-resistant for up to 80 minutes, it is suitable for all skin tones, including sensitive skin.',
    '50ml',
    ARRAY['50ml'],
    7500,
    50,
    90,
    'AM'
  ),

  -- Kits (category order: 6)
  (
    'recovery-kit',
    'Recovery Kit',
    'kit',
    'A complete recovery-focused regimen designed to cleanse gently, restore the skin barrier, and support daily protection. This kit combines nourishing and soothing formulas to help improve comfort, hydration, and barrier function in sensitized or compromised skin.',
    '4 products',
    ARRAY['4 products'],
    7800,
    60,
    30,
    'AM&PM'
  ),
  (
    'aging-skin-kit',
    'Aging Skin Kit',
    'kit',
    'A targeted anti-aging regimen designed to improve skin texture, hydration, and visible signs of aging. This kit combines gentle cleansing, advanced hydration, and skin-activating actives to support firmness, radiance, and daily photoprotection.',
    '4 products',
    ARRAY['4 products'],
    10300,
    61,
    30,
    'AM&PM'
  ),
  (
    'pigment-control-kit',
    'Pigment Control Kit',
    'kit',
    'A corrective regimen designed to help reduce the appearance of hyperpigmentation and promote a more even skin tone. This kit combines clarifying cleansing, targeted pigment-control actives, and daily photoprotection to support long-term tone uniformity.',
    '3 products',
    ARRAY['3 products'],
    7600,
    62,
    30,
    'AM&PM'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  default_size = EXCLUDED.default_size,
  available_sizes = EXCLUDED.available_sizes,
  default_price_cents = EXCLUDED.default_price_cents,
  display_order = EXCLUDED.display_order,
  duration_days = EXCLUDED.duration_days,
  when_to_apply = EXCLUDED.when_to_apply;

-- ============================================================================
-- Insert US Availability
-- ============================================================================

INSERT INTO country_universkin_products (country_code, product_id, is_active)
VALUES
  ('US', 'hydrating-oil-cleanser', true),
  ('US', 'clarifying-gel-cleanser', true),
  ('US', 'daily-radiance-pads', true),
  ('US', 'barrier-renewal-pads', true),
  ('US', 'barrier-nourishing-creme-light', true),
  ('US', 'barrier-nourishing-creme-rich', true),
  ('US', 'barrier-restoring-balm', true),
  ('US', 'ha-boosting-serum', true),
  ('US', 'daily-mineral-serum-spf50', true),
  ('US', 'recovery-kit', true),
  ('US', 'aging-skin-kit', true),
  ('US', 'pigment-control-kit', true)
ON CONFLICT (country_code, product_id) DO UPDATE SET
  is_active = EXCLUDED.is_active;
