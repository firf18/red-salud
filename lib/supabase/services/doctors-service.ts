// Servicio para gestión de médicos
import { supabase } from '../client';
import type {
  DoctorProfile,
  DoctorProfileFormData,
  MedicalSpecialty,
  DoctorReview,
  DoctorReviewFormData,
  DoctorAvailabilityException,
  DoctorSearchFilters,
  DoctorSearchResult,
} from '../types/doctors';

// ============================================
// ESPECIALIDADES
// ============================================

export async function getSpecialties() {
  try {
    const { data, error } = await supabase
      .from('specialties')
      .select('*')
      .eq('active', true)
      .order('name');

    if (error) {
      console.error('Error fetching specialties:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as MedicalSpecialty[] };
  } catch (err: any) {
    console.error('Exception fetching specialties:', err);
    return { success: false, error: err.message || 'Error desconocido' };
  }
}

export async function getSpecialtyById(id: string) {
  const { data, error } = await supabase
    .from('medical_specialties')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching specialty:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as MedicalSpecialty };
}

// ============================================
// PERFIL DE MÉDICO
// ============================================

export async function getDoctorProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('doctor_details')
      .select(`
        *,
        specialty:specialties(*)
      `)
      .eq('profile_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching doctor profile:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Profile not found' };
    }

    return { success: true, data: data as any };
  } catch (err: any) {
    console.error('Exception fetching doctor profile:', err);
    return { success: false, error: err.message || 'Error desconocido' };
  }
}

export async function createDoctorProfile(
  userId: string,
  profileData: DoctorProfileFormData
) {
  const { data, error } = await supabase
    .from('doctor_profiles')
    .insert({
      id: userId,
      ...profileData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating doctor profile:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as DoctorProfile };
}

export async function updateDoctorProfile(
  userId: string,
  updates: Partial<DoctorProfileFormData>
) {
  const { data, error } = await supabase
    .from('doctor_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating doctor profile:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as DoctorProfile };
}

// ============================================
// BÚSQUEDA DE MÉDICOS
// ============================================

export async function searchDoctors(filters: DoctorSearchFilters = {}) {
  let query = supabase
    .from('doctor_profiles')
    .select(`
      *,
      specialty:medical_specialties(*)
    `)
    .eq('is_active', true);

  if (filters.specialty_id) {
    query = query.eq('specialty_id', filters.specialty_id);
  }

  if (filters.accepts_insurance !== undefined) {
    query = query.eq('accepts_insurance', filters.accepts_insurance);
  }

  if (filters.min_rating) {
    query = query.gte('average_rating', filters.min_rating);
  }

  if (filters.accepts_new_patients !== undefined) {
    query = query.eq('accepts_new_patients', filters.accepts_new_patients);
  }

  if (filters.max_price) {
    query = query.lte('consultation_price', filters.max_price);
  }

  if (filters.languages && filters.languages.length > 0) {
    query = query.contains('languages', filters.languages);
  }

  const { data, error } = await query.order('average_rating', { ascending: false });

  if (error) {
    console.error('Error searching doctors:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as DoctorSearchResult[] };
}

export async function getFeaturedDoctors(limit: number = 10) {
  const { data, error } = await supabase
    .from('doctor_profiles')
    .select(`
      *,
      specialty:medical_specialties(*)
    `)
    .eq('is_active', true)
    .eq('is_verified', true)
    .gte('average_rating', 4.0)
    .order('average_rating', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured doctors:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as DoctorProfile[] };
}

// ============================================
// RESEÑAS
// ============================================

export async function getDoctorReviews(doctorId: string) {
  const { data, error } = await supabase
    .from('doctor_reviews')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as DoctorReview[] };
}

export async function createReview(
  doctorId: string,
  patientId: string,
  reviewData: DoctorReviewFormData,
  appointmentId?: string
) {
  const { data, error } = await supabase
    .from('doctor_reviews')
    .insert({
      doctor_id: doctorId,
      patient_id: patientId,
      appointment_id: appointmentId,
      ...reviewData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as DoctorReview };
}

export async function updateReview(
  reviewId: string,
  updates: Partial<DoctorReviewFormData>
) {
  const { data, error } = await supabase
    .from('doctor_reviews')
    .update(updates)
    .eq('id', reviewId)
    .select()
    .single();

  if (error) {
    console.error('Error updating review:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as DoctorReview };
}

// ============================================
// DISPONIBILIDAD
// ============================================

export async function getAvailabilityExceptions(
  doctorId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from('doctor_availability_exceptions')
    .select('*')
    .eq('doctor_id', doctorId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date');

  if (error) {
    console.error('Error fetching availability exceptions:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as DoctorAvailabilityException[] };
}

export async function createAvailabilityException(
  doctorId: string,
  date: string,
  isAvailable: boolean,
  reason?: string,
  customSlots?: { start: string; end: string }[]
) {
  const { data, error } = await supabase
    .from('doctor_availability_exceptions')
    .insert({
      doctor_id: doctorId,
      date,
      is_available: isAvailable,
      reason,
      custom_slots: customSlots || [],
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating availability exception:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as DoctorAvailabilityException };
}

export async function deleteAvailabilityException(exceptionId: string) {
  const { error } = await supabase
    .from('doctor_availability_exceptions')
    .delete()
    .eq('id', exceptionId);

  if (error) {
    console.error('Error deleting availability exception:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================
// ESTADÍSTICAS DEL MÉDICO
// ============================================

export async function getDoctorStats(doctorId: string) {
  try {
    // Inicializar con valores por defecto
    let totalAppointments = 0;
    let completedAppointments = 0;
    let cancelledAppointments = 0;
    let todayAppointments = 0;
    let uniquePatients = 0;

    // Intentar obtener estadísticas de citas (puede fallar si la tabla no existe)
    try {
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('status, appointment_date, patient_id')
        .eq('doctor_id', doctorId);

      if (!appointmentsError && appointmentsData) {
        totalAppointments = appointmentsData.length;
        completedAppointments = appointmentsData.filter((a) => a.status === 'completed').length;
        cancelledAppointments = appointmentsData.filter((a) => a.status === 'cancelled').length;
        
        // Citas de hoy
        const today = new Date().toISOString().split('T')[0];
        todayAppointments = appointmentsData.filter(
          (a) => a.appointment_date === today && a.status === 'scheduled'
        ).length;

        // Contar pacientes únicos
        uniquePatients = new Set(appointmentsData.map(p => p.patient_id)).size;
      }
    } catch (err) {
      console.log('Appointments table not available yet');
    }

    // Obtener perfil con ratings
    const profileResult = await getDoctorProfile(doctorId);
    const profileData = profileResult.success ? profileResult.data : null;

    return {
      success: true,
      data: {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        todayAppointments,
        totalPatients: uniquePatients,
        averageRating: profileData?.average_rating || 0,
        totalReviews: profileData?.total_reviews || 0,
      },
    };
  } catch (error: any) {
    console.error('Error in getDoctorStats:', error);
    // Retornar datos por defecto en lugar de error
    return {
      success: true,
      data: {
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        todayAppointments: 0,
        totalPatients: 0,
        averageRating: 0,
        totalReviews: 0,
      },
    };
  }
}

// ============================================
// HORARIOS Y SLOTS DISPONIBLES
// ============================================

export async function getAvailableSlots(
  doctorId: string,
  date: string
) {
  // Obtener perfil del médico con su horario
  const { data: profile, error: profileError } = await getDoctorProfile(doctorId);
  
  if (profileError || !profile) {
    return { success: false, error: 'Doctor not found' };
  }

  // Obtener excepciones para esa fecha
  const { data: exceptions } = await supabase
    .from('doctor_availability_exceptions')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('date', date)
    .single();

  // Si hay excepción y no está disponible
  if (exceptions && !exceptions.is_available) {
    return { success: true, data: [] };
  }

  // Obtener citas ya agendadas para ese día
  const { data: appointments } = await supabase
    .from('appointments')
    .select('appointment_date, appointment_time')
    .eq('doctor_id', doctorId)
    .eq('appointment_date', date)
    .in('status', ['scheduled', 'confirmed']);

  const bookedSlots = appointments?.map((a) => a.appointment_time) || [];

  // Generar slots disponibles basados en el horario
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayOfWeek = dayNames[new Date(date).getDay()];
  const daySchedule = profile.schedule[dayOfWeek as keyof typeof profile.schedule];

  if (!daySchedule?.enabled) {
    return { success: true, data: [] };
  }

  const availableSlots: string[] = [];
  const duration = profile.consultation_duration;

  // Usar custom_slots si hay excepción con disponibilidad especial
  const slotsToUse = exceptions?.custom_slots || daySchedule.slots;

  slotsToUse.forEach((slot: { start: string; end: string }) => {
    const [startHour, startMinute] = slot.start.split(':').map(Number);
    const [endHour, endMinute] = slot.end.split(':').map(Number);

    let currentTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    while (currentTime + duration <= endTime) {
      const hours = Math.floor(currentTime / 60);
      const minutes = currentTime % 60;
      const timeSlot = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      if (!bookedSlots.includes(timeSlot)) {
        availableSlots.push(timeSlot);
      }

      currentTime += duration;
    }
  });

  return { success: true, data: availableSlots };
}
