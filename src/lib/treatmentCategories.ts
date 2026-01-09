// Treatment Categories Constants and Helpers
// Used for the multi-category treatment selection in clinical documentation

import { TreatmentCategory, OtherProcedureSubcategory, OtherSubcategoryMeta } from '@/types';

// Category metadata for UI display
export interface TreatmentCategoryMeta {
  id: TreatmentCategory;
  label: string;
  singularLabel: string;
  description: string;
}

export const TREATMENT_CATEGORIES: TreatmentCategoryMeta[] = [
  {
    id: 'ebd',
    label: 'EBD Devices',
    singularLabel: 'EBD Device',
    description: 'Energy-Based Device procedures from your clinic',
  },
  {
    id: 'toxin',
    label: 'Toxins',
    singularLabel: 'Toxin',
    description: 'Botulinum toxin treatments',
  },
  {
    id: 'injectable',
    label: 'Injectables',
    singularLabel: 'Injectable',
    description: 'Dermal fillers and injectables',
  },
  {
    id: 'other',
    label: 'Other Aesthetic Procedures',
    singularLabel: 'Procedure',
    description: 'Additional aesthetic treatments',
  },
];

// Subcategories for "Other Aesthetic Procedures"
export const OTHER_SUBCATEGORIES: OtherSubcategoryMeta[] = [
  { id: 'biostimulators', label: 'Biostimulators' },
  { id: 'skin_boosters', label: 'Skin Boosters' },
  { id: 'prp', label: 'PRP' },
  { id: 'mesotherapy', label: 'Mesotherapy' },
  { id: 'rf_microneedling', label: 'RF Microneedling' },
  { id: 'ultrasound_tightening', label: 'Ultrasound-Based Tightening' },
  { id: 'microneedling', label: 'Microneedling' },
  { id: 'chemical_peels', label: 'Chemical Peels' },
  { id: 'dermabrasion', label: 'Dermabrasion' },
  { id: 'microdermabrasion', label: 'Microdermabrasion' },
  { id: 'prp_hair', label: 'PRP for Hair' },
  { id: 'hair_mesotherapy', label: 'Hair Mesotherapy' },
  { id: 'other', label: 'Other' },
];

// Helper to get category metadata by ID
export function getCategoryMeta(id: TreatmentCategory): TreatmentCategoryMeta | undefined {
  return TREATMENT_CATEGORIES.find(cat => cat.id === id);
}

// Helper to get category label
export function getCategoryLabel(id: TreatmentCategory): string {
  const meta = getCategoryMeta(id);
  return meta?.label ?? id;
}

// Helper to get category singular label
export function getCategorySingularLabel(id: TreatmentCategory): string {
  const meta = getCategoryMeta(id);
  return meta?.singularLabel ?? id;
}

// Helper to get subcategory metadata by ID
export function getSubcategoryMeta(id: OtherProcedureSubcategory): OtherSubcategoryMeta | undefined {
  return OTHER_SUBCATEGORIES.find(sub => sub.id === id);
}

// Helper to get subcategory label
export function getSubcategoryLabel(id: OtherProcedureSubcategory): string {
  const meta = getSubcategoryMeta(id);
  return meta?.label ?? id;
}

// Check if a category supports custom procedures (not EBD)
export function isCustomProcedureCategory(category: TreatmentCategory): category is Exclude<TreatmentCategory, 'ebd'> {
  return category !== 'ebd';
}
