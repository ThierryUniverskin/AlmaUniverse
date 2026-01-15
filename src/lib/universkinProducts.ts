/**
 * Universkin Products Module
 *
 * Handles fetching and managing Universkin skincare products.
 * Follows the same pattern as EBD devices with:
 * - Static fallback array for offline support
 * - Database fetching with fallback
 * - Country-specific availability
 * - Doctor price override (future)
 */

import { UniverskinProduct, UniverskinCategory, SelectedUniverskinProduct, WhenToApply } from '@/types';
import { DbUniverskinProduct } from '@/types/database';
import { logger } from './logger';

// ============================================================================
// Static Fallback Data (for offline support)
// ============================================================================

export const UNIVERSKIN_PRODUCTS: UniverskinProduct[] = [
  // Cleanse
  {
    id: 'hydrating-oil-cleanser',
    name: 'Hydrating Oil Cleanser',
    category: 'cleanse',
    description: 'A multi-purpose cleansing and soothing oil, a patented combination of olive oil, CO2 plant extracts and Omega-3 that helps to cleanse and repair the skin. Can also be used on the eye contour, hair and scalp. Suitable for all skin types.',
    defaultSize: '100ml',
    availableSizes: ['100ml'],
    defaultPriceCents: 4100,
    imageUrl: '/images/products/hydrating-oil-cleanser.jpg',
    displayOrder: 10,
    durationDays: 60,
    whenToApply: 'AM&PM',
  },
  {
    id: 'clarifying-gel-cleanser',
    name: 'Clarifying Gel Cleanser',
    category: 'cleanse',
    description: 'A high-performance foaming gel cleanser with 10% AHA, 2% BHA, 2% PHA, and 2% Succinic Acid for daily exfoliation and clarity. Gently lifts impurities, refines pores, and supports skin renewal without irritation.',
    defaultSize: '100ml',
    availableSizes: ['100ml'],
    defaultPriceCents: 5200,
    imageUrl: '/images/products/clarifying-gel-cleanser.jpg',
    displayOrder: 11,
    durationDays: 60,
    whenToApply: 'AM&PM',
  },
  // Prep
  {
    id: 'daily-radiance-pads',
    name: 'Daily Radiance Pads',
    category: 'prep',
    description: 'A brightening dual-phase treatment system combining a concentrated solution with 30 pre-soaked pads. Designed to refine skin tone, smooth texture, and support radiance with twice-daily use.',
    defaultSize: '30 units',
    availableSizes: ['30 units'],
    defaultPriceCents: 8500,
    imageUrl: '/images/products/daily-radiance-pads.jpg',
    displayOrder: 20,
    durationDays: 30,
    whenToApply: 'AM&PM',
  },
  {
    id: 'barrier-renewal-pads',
    name: 'Barrier Renewal Pads',
    category: 'prep',
    description: 'An advanced resurfacing pad system powered by exfoliating acids to smooth texture, reduce dullness, and support nightly skin renewal.',
    defaultSize: '30 units',
    availableSizes: ['30 units'],
    defaultPriceCents: 8500,
    imageUrl: '/images/products/barrier-renewal-pads.jpg',
    displayOrder: 21,
    durationDays: 60,
    whenToApply: 'PM',
  },
  // Strengthen
  {
    id: 'barrier-nourishing-creme-light',
    name: 'Barrier Nourishing Crème - Light',
    category: 'strengthen',
    description: 'Multifunctional rich and creamy emulsion based on biomimetic peptides and omega-3 from Camelina oil that helps protect, strengthen and improve skin texture.',
    defaultSize: '50ml',
    availableSizes: ['50ml'],
    defaultPriceCents: 6800,
    imageUrl: '/images/products/barrier-nourishing-creme-light.jpg',
    displayOrder: 40,
    durationDays: 30,
    whenToApply: 'AM&PM',
  },
  {
    id: 'barrier-nourishing-creme-rich',
    name: 'Barrier Nourishing Crème - Rich',
    category: 'strengthen',
    description: 'Multifunctional rich and creamy emulsion based on biomimetic peptides and omega-3 from Camelina oil that helps protect, strengthen and improve skin texture.',
    defaultSize: '50ml',
    availableSizes: ['50ml'],
    imageUrl: '/images/products/barrier-nourishing-creme-rich.jpg',
    defaultPriceCents: 6800,
    displayOrder: 41,
    durationDays: 30,
    whenToApply: 'AM&PM',
  },
  {
    id: 'barrier-restoring-balm',
    name: 'Barrier Restoring Balm',
    category: 'strengthen',
    description: 'An advanced skin rebalancing anhydrous balm, helps regenerate and repair the superficial layers of the epidermis by alleviating inflammation. The texture is very rich.',
    defaultSize: '30ml',
    availableSizes: ['30ml'],
    defaultPriceCents: 8300,
    imageUrl: '/images/products/barrier-restoring-balm.jpg',
    displayOrder: 42,
    durationDays: 60,
    whenToApply: 'AM&PM',
  },
  {
    id: 'ha-boosting-serum',
    name: 'HA Boosting Serum',
    category: 'strengthen',
    description: 'A universal active with pure hyaluronic acid of different molecular weight. It has one of the highest dosages of HA on the market and provides the ultimate hydration.',
    defaultSize: '30ml',
    availableSizes: ['30ml'],
    defaultPriceCents: 8000,
    imageUrl: '/images/products/ha-boosting-serum.jpg',
    displayOrder: 43,
    durationDays: 60,
    whenToApply: 'AM&PM',
  },
  // Sunscreen
  {
    id: 'daily-mineral-serum-spf50',
    name: 'Daily Mineral Serum SPF50',
    category: 'sunscreen',
    description: 'A zinc oxide-only mineral sunscreen designed to deliver broad-spectrum SPF 50 protection in a lightweight serum. Fragrance-free, vegan, and water-resistant for up to 80 minutes.',
    defaultSize: '50ml',
    availableSizes: ['50ml'],
    defaultPriceCents: 7500,
    imageUrl: '/images/products/daily-mineral-serum-spf50.jpg',
    displayOrder: 50,
    durationDays: 90,
    whenToApply: 'AM',
  },
  // Kits
  {
    id: 'recovery-kit',
    name: 'Recovery Kit',
    category: 'kit',
    description: 'A complete recovery-focused regimen designed to cleanse gently, restore the skin barrier, and support daily protection.',
    defaultSize: '4 products',
    availableSizes: ['4 products'],
    defaultPriceCents: 7800,
    imageUrl: '/images/products/recovery-kit.jpg',
    displayOrder: 60,
    durationDays: 30,
    whenToApply: 'AM&PM',
  },
  {
    id: 'aging-skin-kit',
    name: 'Aging Skin Kit',
    category: 'kit',
    description: 'A targeted anti-aging regimen designed to improve skin texture, hydration, and visible signs of aging.',
    defaultSize: '4 products',
    availableSizes: ['4 products'],
    defaultPriceCents: 10300,
    imageUrl: '/images/products/aging-skin-kit.jpg',
    displayOrder: 61,
    durationDays: 30,
    whenToApply: 'AM&PM',
  },
  {
    id: 'pigment-control-kit',
    name: 'Pigment Control Kit',
    category: 'kit',
    description: 'A corrective regimen designed to help reduce the appearance of hyperpigmentation and promote a more even skin tone.',
    defaultSize: '3 products',
    availableSizes: ['3 products'],
    defaultPriceCents: 7600,
    imageUrl: '/images/products/pigment-control-kit.jpg',
    displayOrder: 62,
    durationDays: 30,
    whenToApply: 'AM&PM',
  },
];

// Category display configuration
export const UNIVERSKIN_CATEGORIES: { id: UniverskinCategory; label: string; order: number }[] = [
  { id: 'cleanse', label: 'Cleanse', order: 1 },
  { id: 'prep', label: 'Prep', order: 2 },
  { id: 'treat', label: 'Treat', order: 3 }, // Future: personalized serums
  { id: 'strengthen', label: 'Strengthen', order: 4 },
  { id: 'sunscreen', label: 'Sunscreen', order: 5 },
  { id: 'kit', label: 'Kits', order: 6 },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get access token from localStorage
 */
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
  const storedSession = localStorage.getItem(storageKey);
  const sessionData = storedSession ? JSON.parse(storedSession) : null;
  return sessionData?.access_token || null;
}

/**
 * Convert database row to UniverskinProduct
 */
function dbToProduct(db: DbUniverskinProduct): UniverskinProduct {
  return {
    id: db.id,
    name: db.name,
    category: db.category as UniverskinCategory,
    description: db.description || '',
    defaultSize: db.default_size || '',
    availableSizes: db.available_sizes || [],
    defaultPriceCents: db.default_price_cents || 0,
    imageUrl: db.image_url || undefined,
    displayOrder: db.display_order,
    durationDays: db.duration_days || 30,
    whenToApply: (db.when_to_apply as WhenToApply) || 'AM&PM',
  };
}

// ============================================================================
// Sync Lookup Functions (Static Data)
// ============================================================================

/**
 * Get product by ID from static data (sync)
 */
export function getUniverskinProductById(id: string): UniverskinProduct | undefined {
  return UNIVERSKIN_PRODUCTS.find((p) => p.id === id);
}

/**
 * Get products by category from static data (sync)
 */
export function getUniverskinProductsByCategory(category: UniverskinCategory): UniverskinProduct[] {
  return UNIVERSKIN_PRODUCTS.filter((p) => p.category === category).sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
}

// ============================================================================
// Async Fetch Functions (Database with Fallback)
// ============================================================================

/**
 * Fetch all active products from database
 */
export async function fetchUniverskinProducts(): Promise<UniverskinProduct[]> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.warn('[UniverskinProducts] No access token, using static data');
    return UNIVERSKIN_PRODUCTS;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(
      `${supabaseUrl}/rest/v1/universkin_products?is_active=eq.true&order=display_order`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      logger.warn('[UniverskinProducts] Database fetch failed, using static data');
      return UNIVERSKIN_PRODUCTS;
    }

    const data: DbUniverskinProduct[] = await response.json();
    return data.map(dbToProduct);
  } catch (error) {
    logger.error('[UniverskinProducts] Error fetching products:', error);
    return UNIVERSKIN_PRODUCTS;
  }
}

/**
 * Fetch products available in a specific country
 */
export async function fetchProductsByCountry(countryCode: string): Promise<UniverskinProduct[]> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.warn('[UniverskinProducts] No access token, using static data');
    return UNIVERSKIN_PRODUCTS; // Default to all products if no auth
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

    // First get product IDs available in the country
    const countryResponse = await fetch(
      `${supabaseUrl}/rest/v1/country_universkin_products?country_code=eq.${countryCode}&is_active=eq.true&select=product_id`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!countryResponse.ok) {
      logger.warn('[UniverskinProducts] Country fetch failed, using static data');
      return UNIVERSKIN_PRODUCTS;
    }

    const countryData = await countryResponse.json();
    const productIds = countryData.map((row: { product_id: string }) => row.product_id);

    if (productIds.length === 0) {
      logger.warn(`[UniverskinProducts] No products available in ${countryCode}`);
      return [];
    }

    // Fetch the actual products
    const productIdsParam = productIds.map((id: string) => `"${id}"`).join(',');
    const productsResponse = await fetch(
      `${supabaseUrl}/rest/v1/universkin_products?id=in.(${productIdsParam})&is_active=eq.true&order=display_order`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!productsResponse.ok) {
      logger.warn('[UniverskinProducts] Products fetch failed, using static data');
      return UNIVERSKIN_PRODUCTS;
    }

    const products: DbUniverskinProduct[] = await productsResponse.json();
    return products.map(dbToProduct);
  } catch (error) {
    logger.error('[UniverskinProducts] Error fetching country products:', error);
    return UNIVERSKIN_PRODUCTS;
  }
}

/**
 * Fetch product by ID from database
 */
export async function fetchUniverskinProductById(id: string): Promise<UniverskinProduct | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.warn('[UniverskinProducts] No access token, using static data');
    return getUniverskinProductById(id) || null;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(
      `${supabaseUrl}/rest/v1/universkin_products?id=eq.${id}&is_active=eq.true`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return getUniverskinProductById(id) || null;
    }

    const data: DbUniverskinProduct[] = await response.json();
    return data[0] ? dbToProduct(data[0]) : null;
  } catch (error) {
    logger.error('[UniverskinProducts] Error fetching product by ID:', error);
    return getUniverskinProductById(id) || null;
  }
}

/**
 * Group products by category
 */
export function groupProductsByCategory(
  products: UniverskinProduct[]
): Record<UniverskinCategory, UniverskinProduct[]> {
  const grouped: Record<UniverskinCategory, UniverskinProduct[]> = {
    cleanse: [],
    prep: [],
    treat: [],
    strengthen: [],
    sunscreen: [],
    kit: [],
  };

  for (const product of products) {
    if (grouped[product.category]) {
      grouped[product.category].push(product);
    }
  }

  // Sort each category by display order
  for (const category of Object.keys(grouped) as UniverskinCategory[]) {
    grouped[category].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  return grouped;
}

/**
 * Format price in dollars
 */
export function formatProductPrice(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(0)}`;
}

/**
 * Calculate total price for selected products
 */
export function calculateTotalPrice(
  selections: { productId: string; quantity: number; priceCents: number }[]
): number {
  return selections.reduce((total, item) => total + item.priceCents * item.quantity, 0);
}

/**
 * Calculate minimum duration from selected products
 */
export function calculateMinDuration(
  selections: SelectedUniverskinProduct[],
  products: UniverskinProduct[]
): number {
  if (selections.length === 0) return 0;

  const durations = selections.map((sel) => {
    const product = products.find((p) => p.id === sel.productId);
    return product?.durationDays || 30;
  });

  return Math.min(...durations);
}

// ============================================================================
// AI Recommendation Functions
// ============================================================================

/**
 * Get AI-recommended products based on skin analysis.
 * For testing: returns one product per category.
 * In production: will use skin analysis scores to recommend appropriate products.
 */
export function getRecommendedProducts(
  products: UniverskinProduct[]
): UniverskinProduct[] {
  // Group by category
  const grouped = groupProductsByCategory(products);

  // For testing: pick first product from each category (except treat)
  const recommendations: UniverskinProduct[] = [];

  // Cleanse - recommend hydrating oil cleanser (gentler)
  if (grouped.cleanse.length > 0) {
    recommendations.push(grouped.cleanse[0]);
  }

  // Prep - recommend daily radiance pads
  if (grouped.prep.length > 0) {
    recommendations.push(grouped.prep[0]);
  }

  // Strengthen - recommend HA boosting serum (universal)
  const haSerum = grouped.strengthen.find((p) => p.id === 'ha-boosting-serum');
  if (haSerum) {
    recommendations.push(haSerum);
  } else if (grouped.strengthen.length > 0) {
    recommendations.push(grouped.strengthen[0]);
  }

  // Sunscreen - always recommend SPF
  if (grouped.sunscreen.length > 0) {
    recommendations.push(grouped.sunscreen[0]);
  }

  return recommendations;
}

/**
 * Convert product to selection format
 */
export function productToSelection(product: UniverskinProduct): SelectedUniverskinProduct {
  return {
    productId: product.id,
    size: product.defaultSize,
    quantity: 1,
    priceCents: product.defaultPriceCents,
    whenToApply: product.whenToApply,
  };
}
