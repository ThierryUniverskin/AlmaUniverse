import { EBDDevice } from '@/types';
import { DbEBDDevice, DbDoctorDevice } from '@/types/database';
import { EBD_DEVICES } from './ebdDevices';
import { logger } from '@/lib/logger';

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
    defaultPriceCents: db.default_price_cents ?? undefined,
  };
}

// Type for doctor device with price information
export interface DoctorDeviceWithPrice {
  deviceId: string;
  priceCents: number | null; // null means use default
  isActive: boolean;
}

/**
 * Fetch EBD devices available in a specific country
 * Joins ebd_devices with country_devices table
 */
export async function fetchDevicesByCountry(
  countryCode: string,
  accessToken: string
): Promise<EBDDevice[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    logger.warn('Supabase not configured, returning all devices');
    return EBD_DEVICES;
  }

  if (!countryCode) {
    logger.warn('No country code provided, returning all devices');
    return EBD_DEVICES;
  }

  try {
    // First get device IDs available in the country
    const countryResponse = await fetch(
      `${supabaseUrl}/rest/v1/country_devices?country_code=eq.${countryCode}&is_active=eq.true&select=device_id`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!countryResponse.ok) {
      logger.warn('Could not fetch country devices, returning all devices');
      return EBD_DEVICES;
    }

    const countryDevices: { device_id: string }[] = await countryResponse.json();

    if (countryDevices.length === 0) {
      // No devices configured for country - return all devices as fallback
      logger.warn(`No devices configured for country ${countryCode}, returning all devices`);
      return EBD_DEVICES;
    }

    const deviceIds = countryDevices.map(d => d.device_id);

    // Fetch full device details for these IDs
    const devicesResponse = await fetch(
      `${supabaseUrl}/rest/v1/ebd_devices?id=in.(${deviceIds.map(id => `"${id}"`).join(',')})&is_active=eq.true&order=name.asc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!devicesResponse.ok) {
      logger.warn('Could not fetch device details, returning all devices');
      return EBD_DEVICES;
    }

    const devices: DbEBDDevice[] = await devicesResponse.json();
    return devices.map(dbDeviceToEBDDevice);
  } catch (error) {
    logger.error('Error fetching devices by country:', error);
    return EBD_DEVICES;
  }
}

/**
 * Fetch device IDs that a doctor has selected (active in their clinic)
 */
export async function fetchDoctorDeviceIds(
  doctorId: string,
  accessToken: string
): Promise<string[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || !doctorId) {
    return [];
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/doctor_devices?doctor_id=eq.${doctorId}&is_active=eq.true&select=device_id`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      logger.warn('Could not fetch doctor devices');
      return [];
    }

    const data: { device_id: string }[] = await response.json();
    return data.map(d => d.device_id);
  } catch (error) {
    logger.error('Error fetching doctor device IDs:', error);
    return [];
  }
}

/**
 * Save doctor's device selections
 * Uses upsert pattern - inserts new, updates existing, deactivates removed
 */
export async function saveDoctorDevices(
  doctorId: string,
  selectedDeviceIds: string[],
  accessToken: string
): Promise<{ success: boolean; error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { success: false, error: 'Supabase not configured' };
  }

  if (!doctorId) {
    return { success: false, error: 'Doctor ID required' };
  }

  try {
    // First, get current doctor devices
    const currentResponse = await fetch(
      `${supabaseUrl}/rest/v1/doctor_devices?doctor_id=eq.${doctorId}&select=id,device_id,is_active`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!currentResponse.ok) {
      throw new Error('Failed to fetch current devices');
    }

    const currentDevices: DbDoctorDevice[] = await currentResponse.json();
    const currentDeviceMap = new Map(currentDevices.map(d => [d.device_id, d]));

    // Prepare batch operations
    const toInsert: { doctor_id: string; device_id: string; is_active: boolean }[] = [];
    const toActivate: string[] = []; // IDs of doctor_devices rows to set is_active = true
    const toDeactivate: string[] = []; // IDs of doctor_devices rows to set is_active = false

    // Process selected devices
    for (const deviceId of selectedDeviceIds) {
      const existing = currentDeviceMap.get(deviceId);
      if (existing) {
        // Device exists - ensure it's active
        if (!existing.is_active) {
          toActivate.push(existing.id);
        }
      } else {
        // New device - insert
        toInsert.push({
          doctor_id: doctorId,
          device_id: deviceId,
          is_active: true,
        });
      }
    }

    // Find devices to deactivate (in current but not in selected)
    currentDeviceMap.forEach((record, deviceId) => {
      if (!selectedDeviceIds.includes(deviceId) && record.is_active) {
        toDeactivate.push(record.id);
      }
    });

    // Execute inserts
    if (toInsert.length > 0) {
      const insertResponse = await fetch(
        `${supabaseUrl}/rest/v1/doctor_devices`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify(toInsert),
        }
      );

      if (!insertResponse.ok) {
        const error = await insertResponse.text();
        throw new Error(`Failed to insert devices: ${error}`);
      }
    }

    // Execute activations
    if (toActivate.length > 0) {
      const activateResponse = await fetch(
        `${supabaseUrl}/rest/v1/doctor_devices?id=in.(${toActivate.map(id => `"${id}"`).join(',')})`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ is_active: true }),
        }
      );

      if (!activateResponse.ok) {
        throw new Error('Failed to activate devices');
      }
    }

    // Execute deactivations
    if (toDeactivate.length > 0) {
      const deactivateResponse = await fetch(
        `${supabaseUrl}/rest/v1/doctor_devices?id=in.(${toDeactivate.map(id => `"${id}"`).join(',')})`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ is_active: false }),
        }
      );

      if (!deactivateResponse.ok) {
        throw new Error('Failed to deactivate devices');
      }
    }

    return { success: true };
  } catch (error) {
    logger.error('Error saving doctor devices:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch doctor's selected devices with full device details
 * Used in clinical evaluation flow to show only doctor's devices
 */
export async function fetchDoctorActiveDevices(
  doctorId: string,
  accessToken: string
): Promise<EBDDevice[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || !doctorId) {
    return [];
  }

  try {
    // Get doctor's active device IDs
    const deviceIds = await fetchDoctorDeviceIds(doctorId, accessToken);

    if (deviceIds.length === 0) {
      return [];
    }

    // Fetch full device details
    const response = await fetch(
      `${supabaseUrl}/rest/v1/ebd_devices?id=in.(${deviceIds.map(id => `"${id}"`).join(',')})&is_active=eq.true&order=name.asc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      logger.warn('Could not fetch device details');
      return [];
    }

    const devices: DbEBDDevice[] = await response.json();
    return devices.map(dbDeviceToEBDDevice);
  } catch (error) {
    logger.error('Error fetching doctor active devices:', error);
    return [];
  }
}

/**
 * Fetch doctor's devices with their price information
 * Returns device_id, price_cents, and is_active for each device
 */
export async function fetchDoctorDevicesWithPrices(
  doctorId: string,
  accessToken: string
): Promise<DoctorDeviceWithPrice[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || !doctorId) {
    return [];
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/doctor_devices?doctor_id=eq.${doctorId}&select=device_id,price_cents,is_active`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      logger.warn('Could not fetch doctor devices with prices');
      return [];
    }

    const data: { device_id: string; price_cents: number | null; is_active: boolean }[] = await response.json();
    return data.map(d => ({
      deviceId: d.device_id,
      priceCents: d.price_cents,
      isActive: d.is_active,
    }));
  } catch (error) {
    logger.error('Error fetching doctor devices with prices:', error);
    return [];
  }
}

/**
 * Update the price for a specific doctor device
 */
export async function updateDoctorDevicePrice(
  doctorId: string,
  deviceId: string,
  priceCents: number | null,
  accessToken: string
): Promise<{ success: boolean; error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { success: false, error: 'Supabase not configured' };
  }

  if (!doctorId || !deviceId) {
    return { success: false, error: 'Doctor ID and Device ID required' };
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/doctor_devices?doctor_id=eq.${doctorId}&device_id=eq.${deviceId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ price_cents: priceCents }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update device price: ${error}`);
    }

    return { success: true };
  } catch (error) {
    logger.error('Error updating doctor device price:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get the effective price for a device (doctor's price or default)
 */
export async function getDevicePrice(
  doctorId: string,
  deviceId: string,
  accessToken: string
): Promise<number | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || !doctorId || !deviceId) {
    return null;
  }

  try {
    // First try to get doctor's custom price
    const doctorDeviceResponse = await fetch(
      `${supabaseUrl}/rest/v1/doctor_devices?doctor_id=eq.${doctorId}&device_id=eq.${deviceId}&select=price_cents`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (doctorDeviceResponse.ok) {
      const data: { price_cents: number | null }[] = await doctorDeviceResponse.json();
      if (data.length > 0 && data[0].price_cents !== null) {
        return data[0].price_cents;
      }
    }

    // Fall back to default price from ebd_devices
    const deviceResponse = await fetch(
      `${supabaseUrl}/rest/v1/ebd_devices?id=eq.${deviceId}&select=default_price_cents`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (deviceResponse.ok) {
      const data: { default_price_cents: number | null }[] = await deviceResponse.json();
      if (data.length > 0) {
        return data[0].default_price_cents;
      }
    }

    return null;
  } catch (error) {
    logger.error('Error getting device price:', error);
    return null;
  }
}
