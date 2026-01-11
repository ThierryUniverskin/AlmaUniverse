// Doctor Procedures CRUD Operations
// Handles custom Toxins, Injectables, and Other Aesthetic Procedures

import { DoctorProcedure, DoctorProcedureFormData, TreatmentCategory, OtherProcedureSubcategory } from '@/types';
import { DbDoctorProcedure } from '@/types/database';
import { logger } from '@/lib/logger';

// Convert database row to DoctorProcedure type
function dbToProcedure(db: DbDoctorProcedure): DoctorProcedure {
  return {
    id: db.id,
    doctorId: db.doctor_id,
    category: db.category as Exclude<TreatmentCategory, 'ebd'>,
    subcategory: db.subcategory as OtherProcedureSubcategory | undefined,
    name: db.name,
    brand: db.brand ?? undefined,
    description: db.description ?? undefined,
    isActive: db.is_active,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

/**
 * Fetch all procedures for a doctor
 * @param includeInactive - If true, includes inactive procedures (for settings page)
 */
export async function fetchAllDoctorProcedures(
  doctorId: string,
  accessToken: string,
  includeInactive: boolean = false
): Promise<DoctorProcedure[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || !doctorId) {
    return [];
  }

  try {
    const activeFilter = includeInactive ? '' : '&is_active=eq.true';
    const response = await fetch(
      `${supabaseUrl}/rest/v1/doctor_procedures?doctor_id=eq.${doctorId}${activeFilter}&order=name.asc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      logger.warn('Could not fetch doctor procedures');
      return [];
    }

    const data: DbDoctorProcedure[] = await response.json();
    return data.map(dbToProcedure);
  } catch (error) {
    logger.error('Error fetching doctor procedures:', error);
    return [];
  }
}

/**
 * Fetch procedures by category for a doctor
 */
export async function fetchDoctorProceduresByCategory(
  doctorId: string,
  category: Exclude<TreatmentCategory, 'ebd'>,
  accessToken: string
): Promise<DoctorProcedure[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || !doctorId) {
    return [];
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/doctor_procedures?doctor_id=eq.${doctorId}&category=eq.${category}&is_active=eq.true&order=name.asc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      logger.warn(`Could not fetch doctor procedures for category ${category}`);
      return [];
    }

    const data: DbDoctorProcedure[] = await response.json();
    return data.map(dbToProcedure);
  } catch (error) {
    logger.error('Error fetching doctor procedures by category:', error);
    return [];
  }
}

/**
 * Get a single procedure by ID
 */
export async function getDoctorProcedureById(
  procedureId: string,
  accessToken: string
): Promise<DoctorProcedure | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || !procedureId) {
    return null;
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/doctor_procedures?id=eq.${procedureId}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data: DbDoctorProcedure[] = await response.json();
    if (data.length === 0) {
      return null;
    }

    return dbToProcedure(data[0]);
  } catch (error) {
    logger.error('Error fetching procedure by ID:', error);
    return null;
  }
}

/**
 * Create a new custom procedure
 */
export async function createDoctorProcedure(
  doctorId: string,
  data: DoctorProcedureFormData,
  accessToken: string
): Promise<DoctorProcedure | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    logger.error('Supabase not configured');
    return null;
  }

  if (!doctorId) {
    logger.error('Doctor ID required');
    return null;
  }

  if (!data.name.trim()) {
    logger.error('Procedure name required');
    return null;
  }

  try {
    const insertData = {
      doctor_id: doctorId,
      category: data.category,
      subcategory: data.subcategory || null,
      name: data.name.trim(),
      brand: data.brand?.trim() || null,
      description: data.description?.trim() || null,
      is_active: true,
    };

    const response = await fetch(
      `${supabaseUrl}/rest/v1/doctor_procedures`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(insertData),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      logger.error('Failed to create procedure:', error);
      return null;
    }

    const created: DbDoctorProcedure[] = await response.json();
    if (created.length === 0) {
      return null;
    }

    return dbToProcedure(created[0]);
  } catch (error) {
    logger.error('Error creating procedure:', error);
    return null;
  }
}

/**
 * Update an existing procedure
 */
export async function updateDoctorProcedure(
  procedureId: string,
  data: Partial<DoctorProcedureFormData>,
  accessToken: string
): Promise<DoctorProcedure | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || !procedureId) {
    return null;
  }

  try {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    if (data.brand !== undefined) {
      updateData.brand = data.brand?.trim() || null;
    }
    if (data.description !== undefined) {
      updateData.description = data.description?.trim() || null;
    }
    if (data.subcategory !== undefined) {
      updateData.subcategory = data.subcategory || null;
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/doctor_procedures?id=eq.${procedureId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      logger.error('Failed to update procedure:', error);
      return null;
    }

    const updated: DbDoctorProcedure[] = await response.json();
    if (updated.length === 0) {
      return null;
    }

    return dbToProcedure(updated[0]);
  } catch (error) {
    logger.error('Error updating procedure:', error);
    return null;
  }
}

/**
 * Delete a procedure (hard delete - removes from database)
 */
export async function deleteDoctorProcedure(
  procedureId: string,
  accessToken: string
): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || !procedureId) {
    return false;
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/doctor_procedures?id=eq.${procedureId}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.ok;
  } catch (error) {
    logger.error('Error deleting procedure:', error);
    return false;
  }
}

/**
 * Toggle a procedure's active status
 */
export async function toggleProcedureActive(
  procedureId: string,
  isActive: boolean,
  accessToken: string
): Promise<DoctorProcedure | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || !procedureId) {
    return null;
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/doctor_procedures?id=eq.${procedureId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({ is_active: isActive }),
      }
    );

    if (!response.ok) {
      logger.error('Failed to toggle procedure active status');
      return null;
    }

    const updated: DbDoctorProcedure[] = await response.json();
    if (updated.length === 0) {
      return null;
    }

    return dbToProcedure(updated[0]);
  } catch (error) {
    logger.error('Error toggling procedure active status:', error);
    return null;
  }
}

/**
 * Fetch multiple procedures by their IDs
 * Used when displaying selected treatments
 */
export async function fetchProceduresByIds(
  procedureIds: string[],
  accessToken: string
): Promise<DoctorProcedure[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || procedureIds.length === 0) {
    return [];
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/doctor_procedures?id=in.(${procedureIds.map(id => `"${id}"`).join(',')})&order=name.asc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data: DbDoctorProcedure[] = await response.json();
    return data.map(dbToProcedure);
  } catch (error) {
    logger.error('Error fetching procedures by IDs:', error);
    return [];
  }
}
