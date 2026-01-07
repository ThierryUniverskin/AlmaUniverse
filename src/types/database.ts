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
    };
  };
}

// Helper type for converting database row to app types
export type DbDoctor = Database['public']['Tables']['doctors']['Row'];
export type DbPatient = Database['public']['Tables']['patients']['Row'];
