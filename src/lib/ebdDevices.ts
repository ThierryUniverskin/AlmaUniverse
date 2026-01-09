import { EBDDevice } from '@/types';
import { DbEBDDevice } from '@/types/database';

// Static list of 19 EBD (Energy-Based Device) procedures
// Sorted alphabetically by name
// This data is for documentation purposes only - NOT clinical decision support
// NOTE: This is fallback data - the app now fetches from database when available
export const EBD_DEVICES: EBDDevice[] = [
  {
    id: 'alma-harmony-clearlift-pro-1064',
    name: 'Alma Harmony - ClearLift Pro 1064',
    description: 'ClearLift Pro 1064 utilizes non-thermal laser energy to target and break down pigmentation, while progressively enhancing skin quality through a series of treatments.',
    treats: ['Melasma', 'Texture (pores, scars)', 'Dark spots', 'Pigmentation', 'Wrinkles', 'Skin quality (laxity)'],
    fitzpatrick: 'I-VI',
    downtime: 'None',
    tags: ['Alma Harmony', '1064', 'ClearLift', 'ClearLift Pro', 'Harmony', 'Laser treatment', 'Skin remodeling'],
  },
  {
    id: 'alma-harmony-clearlift-pro-532',
    name: 'Alma Harmony - ClearLift Pro 532',
    description: 'ClearLift Pro 532 employs non-thermal laser energy to effectively break down pigmentation over a series of treatments.',
    treats: ['Dark spots (cafe-au-lait, lentigo)'],
    fitzpatrick: 'I-III',
    downtime: 'Minimal',
    tags: ['Alma Harmony', 'ClearLift', '532', 'Harmony', 'Laser treatment', 'Skin remodeling'],
  },
  {
    id: 'alma-harmony-clearskin-pro',
    name: 'Alma Harmony - ClearSkin Pro',
    description: 'ClearSkin Pro utilizes laser energy to deliver controlled thermal injury to targeted areas of the skin, stimulating improvements in skin quality and texture.',
    treats: ['Texture (pores, scars)', 'Wrinkles', 'Skin quality (laxity)'],
    fitzpatrick: 'I-V',
    downtime: 'Minimal',
    tags: ['Alma Harmony', 'Harmony', 'ClearSkin', '1540', 'Laser treatment', 'Skin remodeling'],
  },
  {
    id: 'alma-harmony-iris-dye-vl',
    name: 'Alma Harmony - Iris Dye-VL',
    description: 'Iris Dye-VL uses intense pulsed light (IPL) technology to effectively treat redness and visible veins.',
    treats: ['Redness (rosacea, acne scars)', 'Vascularity', 'Pigmentation'],
    fitzpatrick: 'I-IV',
    downtime: 'Minimal',
    tags: ['Alma Harmony', 'Dye-VL', 'Harmony', 'IPL treatment'],
  },
  {
    id: 'alma-harmony-superb',
    name: 'Alma Harmony - SupErb',
    description: 'SupErb uses laser energy to precisely ablate a fraction of the skin\'s surface, targeting fine lines and wrinkles. The laser removes damaged outer layers while stimulating and toning the deeper layers, resulting in smoother, firmer skin.',
    treats: ['Texture (pores, scars)', 'Wrinkles', 'Dark spots'],
    fitzpatrick: 'I-IV',
    downtime: 'Some',
    tags: ['Alma Harmony', 'SupErb', 'Harmony', '2940', 'Laser treatment', 'Skin resurfacing'],
  },
  {
    id: 'alma-harmony-vascupen',
    name: 'Alma Harmony - VascuPen',
    description: 'VascuPen uses precise energy to treat and eliminate visible veins on the face.',
    treats: ['Vascularity'],
    fitzpatrick: 'I-IV',
    downtime: 'Minimal',
    tags: ['Vascupen', 'Alma Harmony', 'Harmony', 'Laser treatment'],
  },
  {
    id: 'alma-hybrid-hyper-co2-1570',
    name: 'Alma Hybrid - HyPer (CO2:1570)',
    description: 'HyPer (CO2:1570) combines laser energies to smooth fine lines and wrinkles. The CO2 laser ablates damaged outer skin layers, while the 1570 nm wavelength tones the deeper layers, resulting in smoother, firmer skin.',
    treats: ['Texture (pores, scars)', 'Wrinkles', 'Pigmentation'],
    fitzpatrick: 'I-V',
    downtime: 'Minimal',
    tags: ['CO2', 'HyPer', 'Alma Hybrid', '1570', 'Hybrid', 'Laser treatment', 'Skin remodeling', 'Skin resurfacing'],
  },
  {
    id: 'alma-hybrid-pixelpeel',
    name: 'Alma Hybrid - PixelPeel',
    description: 'PixelPeel is a gentle, pixelated laser peel that exfoliates the skin\'s surface, revealing a smoother, more polished finish.',
    treats: ['Pigmentation', 'Redness (rosacea, acne scars)', 'Texture (pores, scars)', 'Fine lines', 'Skin quality (laxity)'],
    fitzpatrick: 'I-VI',
    downtime: 'Minimal',
    tags: ['Proscan CO2', 'CO2', 'Alma Hybrid', 'Hybrid', 'Laser treatment', 'Skin resurfacing'],
  },
  {
    id: 'alma-hybrid-proscan-1570',
    name: 'Alma Hybrid - Proscan 1570',
    description: 'Proscan 1570 uses laser energy to deliver controlled thermal injury to targeted fractions of the skin, promoting improved skin quality and texture.',
    treats: ['Texture (pores, scars)', 'Wrinkles', 'Skin quality (laxity)'],
    fitzpatrick: 'I-V',
    downtime: 'Minimal',
    tags: ['ProScan 1570', 'Alma Hybrid', '1570', 'Hybrid', 'Laser treatment', 'Skin remodeling'],
  },
  {
    id: 'alma-hybrid-proscan-co2',
    name: 'Alma Hybrid - Proscan CO2',
    description: 'Proscan CO2 uses laser energy to precisely ablate a fraction of the skin, effectively smoothing fine lines and wrinkles.',
    treats: ['Pigmentation', 'Dark spots', 'Texture (pores, scars)', 'Wrinkles'],
    fitzpatrick: 'I-IV',
    downtime: 'Some',
    tags: ['CO2', 'ProScan CO2', 'Alma Hybrid', 'Hybrid', 'Laser treatment', 'Skin resurfacing'],
  },
  {
    id: 'alma-pixel-pixelpeel',
    name: 'Alma Pixel - PixelPeel',
    description: 'PixelPeel is a gentle, pixelated laser peel that exfoliates the skin\'s surface, revealing a smoother, more polished finish.',
    treats: ['Pigmentation', 'Redness (rosacea, acne scars)', 'Texture (pores, scars)', 'Fine lines', 'Skin quality (laxity)'],
    fitzpatrick: 'I-VI',
    downtime: 'Minimal',
    tags: ['LightScan', 'CO2', 'Alma Pixel', 'Laser treatment', 'Skin resurfacing'],
  },
  {
    id: 'alma-veil-1064',
    name: 'Alma Veil - 1064 (blue/purple vascular)',
    description: 'Alma Veil 1064 uses laser energy to deliver controlled thermal injury, effectively treating unwanted vascularity on the face and body.',
    treats: ['Vascularity (periorbital veins, leg veins)'],
    fitzpatrick: 'I-VI',
    downtime: 'Minimal',
    tags: ['1064', 'Veil', 'Alma Veil', 'Laser treatment'],
  },
  {
    id: 'alma-veil-532',
    name: 'Alma Veil - 532',
    description: 'Alma Veil 532 uses laser energy to deliver controlled thermal injury, effectively treating unwanted vascularity and pigmentation.',
    treats: ['Redness (rosacea, acne scars)', 'Vascularity (telangiectasias, angiomas)', 'Dark spots'],
    fitzpatrick: 'I-IV',
    downtime: 'Minimal',
    tags: ['Veil', 'Alma Veil', '532', 'Laser treatment'],
  },
  {
    id: 'alma-veil-micropulse',
    name: 'Alma Veil - MicroPulse',
    description: 'MicroPulse uses laser energy to deliver a controlled thermal effect that stimulates dermal remodeling.',
    treats: ['Melasma', 'Redness (rosacea, acne scars)', 'Texture (pores, scars)', 'Wrinkles', 'Skin quality (laxity)', 'Pigmentation'],
    fitzpatrick: 'I-VI',
    downtime: 'None',
    tags: ['1064', 'Veil', 'Alma Veil', 'MicroPulse', 'Laser treatment', 'Skin remodeling'],
  },
  {
    id: 'harmony-xl-pro-clearlift-1064',
    name: 'Harmony XL Pro - ClearLift 1064',
    description: 'ClearLift 1064 utilizes non-thermal laser energy to gradually break down pigmentation and improve skin quality over a series of treatments.',
    treats: ['Melasma', 'Texture (pores, scars)', 'Dark spots', 'Pigmentation', 'Wrinkles', 'Skin quality (laxity)'],
    fitzpatrick: 'I-VI',
    downtime: 'None',
    tags: ['1064', 'ClearLift', 'Harmony XL Pro', 'Harmony', 'Laser treatment', 'Skin remodeling'],
  },
  {
    id: 'harmony-xl-pro-dye-vl',
    name: 'Harmony XL Pro - Dye VL',
    description: 'Dye VL uses intense pulsed light (IPL) to effectively treat redness and pigmentary concerns in UV-exposed areas of the face and body.',
    treats: ['Redness (rosacea, acne scars)', 'Sun damage'],
    fitzpatrick: 'I-IV',
    downtime: 'Minimal',
    tags: ['Dye VL', 'Harmony XL Pro', 'Harmony', 'IPL treatment'],
  },
  {
    id: 'harmony-xl-pro-ipixeler',
    name: 'Harmony XL Pro - iPixelER',
    description: 'iPixelER uses laser energy to precisely ablate a fraction of the skin\'s surface, targeting fine lines and wrinkles. The damaged outer layers are removed, while deeper layers are stimulated and toned for a smoother, firmer appearance.',
    treats: ['Texture (pores, scars)', 'Wrinkles', 'Dark spots'],
    fitzpatrick: 'I-IV',
    downtime: 'Some',
    tags: ['Erbium', 'iPixel', 'Harmony XL Pro', 'Harmony', 'Laser treatment', 'Skin resurfacing'],
  },
  {
    id: 'opus-colibri',
    name: 'Opus - Colibri (periorbital)',
    description: 'Opus Colibri utilizes micro-plasma energy to deliver controlled ablation and thermal coagulation, thereby enhancing skin quality in the sensitive eye area.',
    treats: ['Wrinkles', 'Skin quality (laxity) around eyes'],
    fitzpatrick: 'I-III',
    downtime: 'Some',
    tags: ['Colibri', 'Opus', 'RF treatment', 'Skin resurfacing', 'Skin remodeling'],
  },
  {
    id: 'opus-plasma',
    name: 'Opus - Plasma',
    description: 'Opus Plasma uses fractional plasma energy to ablate damaged outer skin layers while simultaneously heating deeper tissues, promoting a smoother, firmer appearance.',
    treats: ['Pigmentation', 'Melasma', 'Redness (rosacea, acne scars)', 'Texture (pores, scars)', 'Wrinkles', 'Skin quality (laxity)'],
    fitzpatrick: 'I-VI',
    downtime: 'Minimal',
    tags: ['Opus', 'Plasma', 'Fractional Plasma', 'RF treatment', 'Skin resurfacing', 'Skin remodeling'],
  },
];

// Helper function to get device by ID (sync - from static array, no image)
export function getEBDDeviceById(id: string): EBDDevice | undefined {
  return EBD_DEVICES.find(device => device.id === id);
}

// Fetch a single device by ID from database (async - includes image)
export async function fetchEBDDeviceById(id: string, accessToken?: string): Promise<EBDDevice | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || !id) {
    // Fall back to static data
    return getEBDDeviceById(id) || null;
  }

  try {
    const headers: Record<string, string> = {
      'apikey': supabaseKey,
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/ebd_devices?id=eq.${id}&select=*`,
      { headers }
    );

    if (!response.ok) {
      // Fall back to static data
      return getEBDDeviceById(id) || null;
    }

    const data: DbEBDDevice[] = await response.json();
    if (data.length === 0) {
      // Fall back to static data
      return getEBDDeviceById(id) || null;
    }

    const db = data[0];
    return {
      id: db.id,
      name: db.name,
      description: db.description ?? '',
      treats: db.treats ?? [],
      fitzpatrick: db.fitzpatrick ?? '',
      downtime: (db.downtime as 'None' | 'Minimal' | 'Some') ?? 'None',
      tags: db.tags ?? [],
      imageUrl: db.image_url ?? undefined,
    };
  } catch (error) {
    console.error('Error fetching device by ID:', error);
    return getEBDDeviceById(id) || null;
  }
}

// Helper function to get device name by ID
export function getEBDDeviceNameById(id: string): string {
  const device = getEBDDeviceById(id);
  return device?.name ?? id;
}

// Color helpers for fitzpatrick skin types
export function getFitzpatrickColor(fitzpatrick: string): { bg: string; text: string } {
  // Based on the range, assign colors
  if (fitzpatrick === 'I-VI') return { bg: 'bg-emerald-50', text: 'text-emerald-700' };
  if (fitzpatrick === 'I-V') return { bg: 'bg-teal-50', text: 'text-teal-700' };
  if (fitzpatrick === 'I-IV') return { bg: 'bg-sky-50', text: 'text-sky-700' };
  if (fitzpatrick === 'I-III') return { bg: 'bg-violet-50', text: 'text-violet-700' };
  return { bg: 'bg-stone-50', text: 'text-stone-700' };
}

// Color helpers for downtime
export function getDowntimeColor(downtime: 'None' | 'Minimal' | 'Some'): { bg: string; text: string } {
  switch (downtime) {
    case 'None':
      return { bg: 'bg-green-50', text: 'text-green-700' };
    case 'Minimal':
      return { bg: 'bg-amber-50', text: 'text-amber-700' };
    case 'Some':
      return { bg: 'bg-red-50', text: 'text-red-700' };
    default:
      return { bg: 'bg-stone-50', text: 'text-stone-700' };
  }
}

// Convert database row to EBDDevice type
function dbDeviceToEBDDevice(db: DbEBDDevice): EBDDevice {
  return {
    id: db.id,
    name: db.name,
    description: db.description ?? '',
    treats: db.treats ?? [],
    fitzpatrick: db.fitzpatrick ?? 'I-VI',
    downtime: db.downtime ?? 'None',
    tags: db.tags ?? [],
    imageUrl: db.image_url ?? undefined,
  };
}

// Fetch EBD devices from database with fallback to static data
export async function fetchEBDDevices(accessToken?: string): Promise<EBDDevice[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured, using static device data');
    return EBD_DEVICES;
  }

  try {
    const headers: Record<string, string> = {
      'apikey': supabaseKey,
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/ebd_devices?is_active=eq.true&order=name.asc`,
      { headers }
    );

    if (!response.ok) {
      // Table might not exist yet - fall back to static data
      console.warn('Could not fetch EBD devices from database, using static data');
      return EBD_DEVICES;
    }

    const data: DbEBDDevice[] = await response.json();

    if (data.length === 0) {
      // No devices in database - fall back to static data
      console.warn('No devices found in database, using static data');
      return EBD_DEVICES;
    }

    return data.map(dbDeviceToEBDDevice);
  } catch (error) {
    console.error('Error fetching EBD devices:', error);
    return EBD_DEVICES;
  }
}
