// Supabase Database Types
// These types match the schema in supabase/schema.sql

export interface Database {
  public: {
    Tables: {
      doctors: {
        Row: {
          id: string;
          email: string;
          title: string | null;
          first_name: string;
          last_name: string;
          clinic_name: string | null;
          display_preference: 'professional' | 'clinic' | 'both' | null;
          country: string | null;
          language: string | null;
          personal_mobile: { countryCode: string; number: string } | null;
          office_phone: { countryCode: string; number: string } | null;
          personal_website: string | null;
          questionnaire_url: string | null;
          medical_license_number: string | null;
          specialization: string | null;
          bio: string | null;
          education: string | null;
          office_address: {
            street?: string;
            city?: string;
            state?: string;
            postalCode?: string;
            country?: string;
          } | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          title?: string | null;
          first_name: string;
          last_name: string;
          clinic_name?: string | null;
          display_preference?: 'professional' | 'clinic' | 'both' | null;
          country?: string | null;
          language?: string | null;
          personal_mobile?: { countryCode: string; number: string } | null;
          office_phone?: { countryCode: string; number: string } | null;
          personal_website?: string | null;
          questionnaire_url?: string | null;
          medical_license_number?: string | null;
          specialization?: string | null;
          bio?: string | null;
          education?: string | null;
          office_address?: {
            street?: string;
            city?: string;
            state?: string;
            postalCode?: string;
            country?: string;
          } | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          title?: string | null;
          first_name?: string;
          last_name?: string;
          clinic_name?: string | null;
          display_preference?: 'professional' | 'clinic' | 'both' | null;
          country?: string | null;
          language?: string | null;
          personal_mobile?: { countryCode: string; number: string } | null;
          office_phone?: { countryCode: string; number: string } | null;
          personal_website?: string | null;
          questionnaire_url?: string | null;
          medical_license_number?: string | null;
          specialization?: string | null;
          bio?: string | null;
          education?: string | null;
          office_address?: {
            street?: string;
            city?: string;
            state?: string;
            postalCode?: string;
            country?: string;
          } | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          doctor_id: string;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          sex: 'female' | 'male' | 'other' | 'prefer-not-to-say' | null;
          phone: string | null;
          email: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          sex?: 'female' | 'male' | 'other' | 'prefer-not-to-say' | null;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          doctor_id?: string;
          first_name?: string;
          last_name?: string;
          date_of_birth?: string;
          sex?: 'female' | 'male' | 'other' | 'prefer-not-to-say' | null;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      patient_medical_history: {
        Row: {
          id: string;
          patient_id: string;
          // CLINICAL MEDICAL HISTORY (never used by AI)
          fitzpatrick_skin_type: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | null;
          recovery_time_preferences: string[];
          has_cancer_history: boolean;
          cancer_types: string[];
          cancer_details: string | null;
          current_medications: string | null;
          relevant_medical_conditions: string | null;
          // COSMETIC SAFETY PROFILE (for ingredient exclusion)
          is_pregnant_or_breastfeeding: boolean;
          menopausal_status: 'pre-menopausal' | 'peri-menopausal' | 'post-menopausal' | 'n/a' | null;
          has_exfoliant_sensitivity: boolean;
          cosmetic_sensitivities: string[];
          other_sensitivities: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          // CLINICAL MEDICAL HISTORY
          fitzpatrick_skin_type?: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | null;
          recovery_time_preferences?: string[];
          has_cancer_history?: boolean;
          cancer_types?: string[];
          cancer_details?: string | null;
          current_medications?: string | null;
          relevant_medical_conditions?: string | null;
          // COSMETIC SAFETY PROFILE
          is_pregnant_or_breastfeeding?: boolean;
          menopausal_status?: 'pre-menopausal' | 'peri-menopausal' | 'post-menopausal' | 'n/a' | null;
          has_exfoliant_sensitivity?: boolean;
          cosmetic_sensitivities?: string[];
          other_sensitivities?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          // CLINICAL MEDICAL HISTORY
          fitzpatrick_skin_type?: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | null;
          recovery_time_preferences?: string[];
          has_cancer_history?: boolean;
          cancer_types?: string[];
          cancer_details?: string | null;
          current_medications?: string | null;
          relevant_medical_conditions?: string | null;
          // COSMETIC SAFETY PROFILE
          is_pregnant_or_breastfeeding?: boolean;
          menopausal_status?: 'pre-menopausal' | 'peri-menopausal' | 'post-menopausal' | 'n/a' | null;
          has_exfoliant_sensitivity?: boolean;
          cosmetic_sensitivities?: string[];
          other_sensitivities?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      photo_sessions: {
        Row: {
          id: string;
          patient_id: string;
          source: 'app' | 'almaiq';
          frontal_photo_url: string | null;
          left_profile_photo_url: string | null;
          right_profile_photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          source: 'app' | 'almaiq';
          frontal_photo_url?: string | null;
          left_profile_photo_url?: string | null;
          right_profile_photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          source?: 'app' | 'almaiq';
          frontal_photo_url?: string | null;
          left_profile_photo_url?: string | null;
          right_profile_photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      clinical_evaluation_sessions: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          photo_session_id: string | null;
          selected_skin_concerns: string[];
          selected_treatments: { type: string; deviceId?: string; procedureId?: string; sessionCount: number | null; notes: string; pricePerSessionCents?: number }[];
          notes: string | null;
          status: 'in_progress' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id: string;
          photo_session_id?: string | null;
          selected_skin_concerns?: string[];
          selected_treatments?: { type: string; deviceId?: string; procedureId?: string; sessionCount: number | null; notes: string; pricePerSessionCents?: number }[];
          notes?: string | null;
          status?: 'in_progress' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string;
          photo_session_id?: string | null;
          selected_skin_concerns?: string[];
          selected_treatments?: { type: string; deviceId?: string; procedureId?: string; sessionCount: number | null; notes: string; pricePerSessionCents?: number }[];
          notes?: string | null;
          status?: 'in_progress' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
      };
      ebd_devices: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          treats: string[];
          fitzpatrick: string | null;
          downtime: 'None' | 'Minimal' | 'Some' | null;
          tags: string[];
          product_family: string | null;
          is_active: boolean;
          default_price_cents: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          treats?: string[];
          fitzpatrick?: string | null;
          downtime?: 'None' | 'Minimal' | 'Some' | null;
          tags?: string[];
          product_family?: string | null;
          is_active?: boolean;
          default_price_cents?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          treats?: string[];
          fitzpatrick?: string | null;
          downtime?: 'None' | 'Minimal' | 'Some' | null;
          tags?: string[];
          product_family?: string | null;
          is_active?: boolean;
          default_price_cents?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      doctor_devices: {
        Row: {
          id: string;
          doctor_id: string;
          device_id: string;
          is_active: boolean;
          price_cents: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          device_id: string;
          is_active?: boolean;
          price_cents?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          doctor_id?: string;
          device_id?: string;
          is_active?: boolean;
          price_cents?: number | null;
          created_at?: string;
        };
      };
      country_devices: {
        Row: {
          id: string;
          country_code: string;
          device_id: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          country_code: string;
          device_id: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          country_code?: string;
          device_id?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      doctor_procedures: {
        Row: {
          id: string;
          doctor_id: string;
          category: 'toxin' | 'injectable' | 'other';
          subcategory: string | null;
          name: string;
          brand: string | null;
          description: string | null;
          price_cents: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          category: 'toxin' | 'injectable' | 'other';
          subcategory?: string | null;
          name: string;
          brand?: string | null;
          description?: string | null;
          price_cents: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          doctor_id?: string;
          category?: 'toxin' | 'injectable' | 'other';
          subcategory?: string | null;
          name?: string;
          brand?: string | null;
          description?: string | null;
          price_cents?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      ebd_device_country_prices: {
        Row: {
          id: string;
          device_id: string; // TEXT foreign key to ebd_devices.id
          country_code: string;
          default_price_cents: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          device_id: string; // TEXT foreign key to ebd_devices.id
          country_code: string;
          default_price_cents: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          device_id?: string; // TEXT foreign key to ebd_devices.id
          country_code?: string;
          default_price_cents?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Helper type for converting database row to app types
export type DbDoctor = Database['public']['Tables']['doctors']['Row'];
export type DbPatient = Database['public']['Tables']['patients']['Row'];
export type DbPatientMedicalHistory = Database['public']['Tables']['patient_medical_history']['Row'];
export type DbPhotoSession = Database['public']['Tables']['photo_sessions']['Row'];
export type DbClinicalEvaluationSession = Database['public']['Tables']['clinical_evaluation_sessions']['Row'];
export type DbEBDDevice = Database['public']['Tables']['ebd_devices']['Row'];
export type DbDoctorDevice = Database['public']['Tables']['doctor_devices']['Row'];
export type DbCountryDevice = Database['public']['Tables']['country_devices']['Row'];
export type DbDoctorProcedure = Database['public']['Tables']['doctor_procedures']['Row'];
export type DbEBDDeviceCountryPrice = Database['public']['Tables']['ebd_device_country_prices']['Row'];

// Universkin Products types (manual until schema regenerated)
export interface DbUniverskinProduct {
  id: string;
  name: string;
  category: string;
  description: string | null;
  default_size: string | null;
  available_sizes: string[] | null;
  default_price_cents: number | null;
  image_url: string | null;
  display_order: number;
  duration_days: number | null;
  when_to_apply: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DbCountryUniverskinProduct {
  id: string;
  country_code: string;
  product_id: string;
  is_active: boolean;
  created_at: string;
}

export interface DbDoctorUniverskinProduct {
  id: string;
  doctor_id: string;
  product_id: string;
  price_cents: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Serum Ingredients types
export interface DbSerumIngredient {
  id: string;
  name: string;
  base_concentration: number;  // DECIMAL in DB
  color: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface DbCountrySerumIngredient {
  id: string;
  country_code: string;
  ingredient_id: string;
  is_available: boolean;
  created_at: string;
}
