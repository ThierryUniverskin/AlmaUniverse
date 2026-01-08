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
          is_pregnant_or_breastfeeding: boolean;
          uses_hormonal_contraception: boolean;
          receives_hrt: boolean;
          menopausal_status: 'pre-menopausal' | 'peri-menopausal' | 'post-menopausal' | 'n/a' | null;
          has_cancer_history: boolean;
          cancer_types: string[];
          cancer_details: string | null;
          has_inflammatory_skin_condition: boolean;
          has_active_cold_sores: boolean;
          known_allergies: string[];
          other_allergies: string | null;
          current_medications: string | null;
          relevant_medical_conditions: string | null;
          recovery_time_preference: 'same-day' | '1-2-days' | '3-5-days' | 'more-than-5-days' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          is_pregnant_or_breastfeeding?: boolean;
          uses_hormonal_contraception?: boolean;
          receives_hrt?: boolean;
          menopausal_status?: 'pre-menopausal' | 'peri-menopausal' | 'post-menopausal' | 'n/a' | null;
          has_cancer_history?: boolean;
          cancer_types?: string[];
          cancer_details?: string | null;
          has_inflammatory_skin_condition?: boolean;
          has_active_cold_sores?: boolean;
          known_allergies?: string[];
          other_allergies?: string | null;
          current_medications?: string | null;
          relevant_medical_conditions?: string | null;
          recovery_time_preference?: 'same-day' | '1-2-days' | '3-5-days' | 'more-than-5-days' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          is_pregnant_or_breastfeeding?: boolean;
          uses_hormonal_contraception?: boolean;
          receives_hrt?: boolean;
          menopausal_status?: 'pre-menopausal' | 'peri-menopausal' | 'post-menopausal' | 'n/a' | null;
          has_cancer_history?: boolean;
          cancer_types?: string[];
          cancer_details?: string | null;
          has_inflammatory_skin_condition?: boolean;
          has_active_cold_sores?: boolean;
          known_allergies?: string[];
          other_allergies?: string | null;
          current_medications?: string | null;
          relevant_medical_conditions?: string | null;
          recovery_time_preference?: 'same-day' | '1-2-days' | '3-5-days' | 'more-than-5-days' | null;
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
