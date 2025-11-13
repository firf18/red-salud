// Tipos compartidos para la aplicación móvil

export interface Profile {
  id: string;
  nombre: string;
  nombre_completo?: string;
  avatar_url?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Appointment {
  id: string;
  tipo: string;
  fecha_hora: string;
  motivo: string | null;
  status: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  medico_id: string;
  paciente_id: string;
  ubicacion?: string;
  notas?: string;
  created_at: string;
  updated_at?: string;
  doctor?: Profile;
}

export interface Medication {
  id: string;
  nombre_medicamento: string;
  dosis: string;
  frecuencia: string;
  horarios: string[];
  duracion_dias?: number;
  activo: boolean;
  paciente_id: string;
  receta_id?: string;
  notas?: string;
  created_at: string;
  updated_at?: string;
}

export interface LabOrder {
  id: string;
  tipo: string;
  status: 'pendiente' | 'en_proceso' | 'muestra_tomada' | 'completada' | 'cancelada';
  fecha_orden: string;
  fecha_resultado?: string;
  paciente_id: string;
  medico_id: string;
  resultados_url?: string;
  notas?: string;
  created_at: string;
  doctor?: Profile;
}

export interface HealthMetric {
  id: string;
  tipo_metrica: string;
  valor: number;
  valor_secundario?: number;
  unidad_medida: string;
  fecha_medicion: string;
  paciente_id: string;
  notas?: string;
  created_at: string;
  metric_type?: {
    nombre: string;
    unidad_medida: string;
    icono?: string;
  };
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface AppointmentStats {
  upcoming: number;
  total: number;
  completed: number;
}

export interface MedicationStats {
  active: number;
  total: number;
}

export interface DashboardStats {
  upcomingAppointments: number;
  totalConsultations: number;
  activeMedications: number;
  pendingLabResults: number;
  unreadMessages: number;
  activeTelemed: number;
}
