// Tipos para el sistema de médicos

export interface MedicalSpecialty {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  modules_config: ModulesConfig;
  custom_fields: CustomField[];
  created_at: string;
  updated_at: string;
}

export interface ModulesConfig {
  citas: boolean;
  historial: boolean;
  recetas: boolean;
  telemedicina: boolean;
  mensajeria: boolean;
  laboratorio: boolean;
  metricas: boolean;
  documentos: boolean;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  label: string;
  required: boolean;
  options?: string[]; // Para type='select'
}

export interface Education {
  institution: string;
  degree: string;
  year: number;
}

export interface Certification {
  name: string;
  issuer: string;
  year: number;
  expires?: number;
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string;
}

export interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

export interface WeekSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DoctorProfile {
  id: string;
  specialty_id: string | null;
  license_number: string;
  license_country: string;
  
  // Información profesional
  years_experience: number;
  education: Education[];
  certifications: Certification[];
  languages: string[];
  
  // Contacto profesional
  professional_phone: string | null;
  professional_email: string | null;
  clinic_address: string | null;
  
  // Configuración de consultas
  consultation_duration: number;
  consultation_price: number | null;
  accepts_insurance: boolean;
  insurance_providers: string[];
  
  // Horarios
  schedule: WeekSchedule;
  
  // Dashboard personalizado
  dashboard_config: Record<string, any>;
  
  // Verificación
  is_verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
  
  // Estadísticas
  total_consultations: number;
  average_rating: number;
  total_reviews: number;
  
  // Bio
  bio: string | null;
  specialization_areas: string[] | null;
  
  // Estado
  is_active: boolean;
  accepts_new_patients: boolean;
  
  created_at: string;
  updated_at: string;
  
  // Relaciones
  specialty?: MedicalSpecialty;
}

export interface DoctorReview {
  id: string;
  doctor_id: string;
  patient_id: string;
  appointment_id: string | null;
  
  rating: number;
  comment: string | null;
  
  punctuality_rating: number | null;
  communication_rating: number | null;
  professionalism_rating: number | null;
  
  is_anonymous: boolean;
  is_verified: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface DoctorAvailabilityException {
  id: string;
  doctor_id: string;
  date: string;
  is_available: boolean;
  reason: string | null;
  custom_slots: TimeSlot[];
  created_at: string;
}

// Tipos para formularios
export interface DoctorProfileFormData {
  specialty_id: string;
  license_number: string;
  license_country: string;
  years_experience: number;
  professional_phone?: string;
  professional_email?: string;
  clinic_address?: string;
  consultation_duration: number;
  consultation_price?: number;
  accepts_insurance: boolean;
  bio?: string;
  languages: string[];
}

export interface DoctorReviewFormData {
  rating: number;
  comment?: string;
  punctuality_rating?: number;
  communication_rating?: number;
  professionalism_rating?: number;
  is_anonymous: boolean;
}

// Tipos para búsqueda y filtros
export interface DoctorSearchFilters {
  specialty_id?: string;
  accepts_insurance?: boolean;
  min_rating?: number;
  accepts_new_patients?: boolean;
  languages?: string[];
  max_price?: number;
}

export interface DoctorSearchResult extends DoctorProfile {
  distance?: number; // Si se implementa búsqueda por ubicación
  next_available_slot?: string;
}
